import { PaymentSecurity, PaymentSecurityLogger } from './security';

/**
 * PayPal支付集成模块
 * 支持订阅和一次性支付，确保金额防篡改
 */
export class PayPalPaymentService {
  private clientId: string;
  private clientSecret: string;
  private environment: 'sandbox' | 'live';
  private baseUrl: string;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment;
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  /**
   * 获取PayPal访问令牌
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * 创建PayPal产品（用于订阅）
   */
  private async createProduct(planData: {
    name: string;
    description: string;
    planId: string;
  }): Promise<string> {
    const accessToken = await this.getAccessToken();

    const productPayload = {
      name: planData.name,
      description: planData.description || 'AI Image Generation Service',
      type: 'SERVICE',
      category: 'SOFTWARE',
      image_url: `${process.env.NEXTAUTH_URL}/logo.png`,
      home_url: process.env.NEXTAUTH_URL
    };

    const response = await fetch(`${this.baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `product_${planData.planId}_${Date.now()}`
      },
      body: JSON.stringify(productPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal product creation failed:', error);
      throw new Error('Failed to create PayPal product');
    }

    const product = await response.json();
    return product.id;
  }

  /**
   * 创建PayPal订阅计划
   */
  private async createSubscriptionPlan(
    productId: string,
    planData: {
      planId: string;
      name: string;
      amount: number;
      currency: string;
      interval: 'month' | 'year';
    }
  ): Promise<string> {
    const accessToken = await this.getAccessToken();

    const planPayload = {
      product_id: productId,
      name: planData.name,
      description: `${planData.name} subscription plan`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: planData.interval === 'year' ? 'YEAR' : 'MONTH',
            interval_count: 1
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 无限期订阅
          pricing_scheme: {
            fixed_price: {
              value: planData.amount.toFixed(2),
              currency_code: planData.currency
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: planData.currency
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: '0',
        inclusive: false
      }
    };

    const response = await fetch(`${this.baseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `plan_${planData.planId}_${Date.now()}`
      },
      body: JSON.stringify(planPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal plan creation failed:', error);
      throw new Error('Failed to create PayPal subscription plan');
    }

    const plan = await response.json();
    return plan.id;
  }

  /**
   * 创建PayPal订阅
   */
  async createSubscription(
    paymentData: {
      userId: string;
      planId: string;
      amount: number;
      currency: string;
      interval: 'month' | 'year' | 'lifetime';
    },
    planDetails: {
      name: string;
      description: string;
    },
    paymentSession: any
  ): Promise<{ approvalUrl: string; subscriptionId: string }> {
    try {
      // 🔒 验证金额防篡改
      const isValidAmount = await PaymentSecurity.validatePaymentAmount(
        paymentData.planId,
        paymentData.amount,
        paymentData.currency
      );

      if (!isValidAmount) {
        PaymentSecurityLogger.logSecurityEvent(
          'amount_mismatch',
          { 
            planId: paymentData.planId, 
            amount: paymentData.amount,
            provider: 'paypal'
          },
          paymentData.userId
        );
        throw new Error('Amount validation failed');
      }

      // 如果是终身订阅，使用一次性支付
      if (paymentData.interval === 'lifetime') {
        return await this.createOneTimePayment(paymentData, planDetails, paymentSession);
      }

      // 创建或获取产品ID
      const productId = await this.createProduct({
        name: planDetails.name,
        description: planDetails.description,
        planId: paymentData.planId
      });

      // 创建订阅计划
      const paypalPlanId = await this.createSubscriptionPlan(productId, {
        planId: paymentData.planId,
        name: planDetails.name,
        amount: paymentData.amount,
        currency: paymentData.currency,
        interval: paymentData.interval as 'month' | 'year'
      });

      const accessToken = await this.getAccessToken();

      // 创建订阅
      const subscriptionPayload = {
        plan_id: paypalPlanId,
        start_time: new Date(Date.now() + 60000).toISOString(), // 1分钟后开始
        quantity: '1',
        shipping_amount: {
          currency_code: paymentData.currency,
          value: '0.00'
        },
        subscriber: {
          name: {
            given_name: 'User',
            surname: 'Account'
          }
        },
        application_context: {
          brand_name: 'AIMAGICA',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${process.env.NEXTAUTH_URL}/payment/paypal/success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`
        },
        // 🔒 安全元数据
        custom_id: JSON.stringify({
          userId: paymentData.userId,
          planId: paymentData.planId,
          paymentToken: paymentSession.token,
          secureAmount: paymentData.amount.toString(),
          secureCurrency: paymentData.currency,
          secureSignature: paymentSession.signature,
          timestamp: paymentSession.timestamp
        })
      };

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `sub_${paymentData.planId}_${Date.now()}`
        },
        body: JSON.stringify(subscriptionPayload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('PayPal subscription creation failed:', error);
        throw new Error('Failed to create PayPal subscription');
      }

      const subscription = await response.json();
      
      // 获取批准链接
      const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');
      
      if (!approvalLink) {
        throw new Error('No approval link found in PayPal response');
      }

      return {
        approvalUrl: approvalLink.href,
        subscriptionId: subscription.id
      };

    } catch (error) {
      console.error('PayPal subscription creation error:', error);
      throw error;
    }
  }

  /**
   * 创建PayPal一次性支付（用于终身订阅）
   */
  private async createOneTimePayment(
    paymentData: {
      userId: string;
      planId: string;
      amount: number;
      currency: string;
    },
    planDetails: {
      name: string;
      description: string;
    },
    paymentSession: any
  ): Promise<{ approvalUrl: string; subscriptionId: string }> {
    const accessToken = await this.getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `order_${paymentData.planId}_${Date.now()}`,
          description: `${planDetails.name} - Lifetime Access`,
          // 🔒 使用验证过的金额
          amount: {
            currency_code: paymentData.currency,
            value: paymentData.amount.toFixed(2)
          },
          // 🔒 安全元数据
          custom_id: JSON.stringify({
            userId: paymentData.userId,
            planId: paymentData.planId,
            paymentToken: paymentSession.token,
            secureAmount: paymentData.amount.toString(),
            secureCurrency: paymentData.currency,
            secureSignature: paymentSession.signature,
            timestamp: paymentSession.timestamp,
            type: 'lifetime'
          })
        }
      ],
      application_context: {
        brand_name: 'AIMAGICA',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXTAUTH_URL}/payment/paypal/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`
      }
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order_${paymentData.planId}_${Date.now()}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal order creation failed:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await response.json();
    
    // 获取批准链接
    const approvalLink = order.links.find((link: any) => link.rel === 'approve');
    
    if (!approvalLink) {
      throw new Error('No approval link found in PayPal response');
    }

    return {
      approvalUrl: approvalLink.href,
      subscriptionId: order.id // 对于一次性支付，使用订单ID
    };
  }

  /**
   * 验证PayPal Webhook签名
   */
  async verifyWebhookSignature(
    webhookId: string,
    headers: { [key: string]: string },
    body: string
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const verifyPayload = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body)
      };

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(verifyPayload)
      });

      if (!response.ok) {
        return false;
      }

      const verification = await response.json();
      return verification.verification_status === 'SUCCESS';

    } catch (error) {
      console.error('PayPal webhook verification error:', error);
      return false;
    }
  }

  /**
   * 处理PayPal Webhook事件
   */
  async handleWebhookEvent(eventData: any): Promise<{
    success: boolean;
    userId?: string;
    planId?: string;
    type?: string;
  }> {
    try {
      const eventType = eventData.event_type;
      
      let customData: any;
      let userId: string;
      let planId: string;

      // 根据事件类型解析自定义数据
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          customData = JSON.parse(eventData.resource.custom_id || '{}');
          break;
          
        case 'CHECKOUT.ORDER.APPROVED':
        case 'PAYMENT.CAPTURE.COMPLETED':
          customData = JSON.parse(eventData.resource.purchase_units?.[0]?.custom_id || '{}');
          break;
          
        default:
          console.log('未处理的PayPal事件类型:', eventType);
          return { success: false };
      }

      userId = customData.userId;
      planId = customData.planId;

      if (!userId || !planId) {
        console.error('缺少必要的用户或计划信息');
        return { success: false };
      }

      // 🔒 验证支付会话安全性
      const sessionValidation = PaymentSecurity.validatePaymentSession({
        token: customData.paymentToken,
        timestamp: parseInt(customData.timestamp),
        signature: customData.secureSignature,
        expiresAt: parseInt(customData.timestamp) + (30 * 60 * 1000),
        data: PaymentSecurity.encryptPaymentData({
          userId,
          planId,
          amount: parseFloat(customData.secureAmount),
          currency: customData.secureCurrency
        })
      });

      if (!sessionValidation.valid) {
        PaymentSecurityLogger.logSecurityEvent(
          'signature_invalid',
          { eventType, userId, planId },
          userId
        );
        return { success: false };
      }

      // 🔒 验证金额
      const isAmountValid = await PaymentSecurity.validatePaymentAmount(
        planId,
        parseFloat(customData.secureAmount),
        customData.secureCurrency
      );

      if (!isAmountValid) {
        PaymentSecurityLogger.logSecurityEvent(
          'amount_mismatch',
          { 
            eventType, 
            planId, 
            amount: customData.secureAmount,
            currency: customData.secureCurrency
          },
          userId
        );
        return { success: false };
      }

      return {
        success: true,
        userId,
        planId,
        type: eventType
      };

    } catch (error) {
      console.error('PayPal webhook处理错误:', error);
      return { success: false };
    }
  }

  /**
   * 取消PayPal订阅
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason: reason || 'User requested cancellation'
        })
      });

      return response.ok;

    } catch (error) {
      console.error('PayPal subscription cancellation error:', error);
      return false;
    }
  }

  /**
   * 获取订阅详情
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription details');
      }

      return await response.json();

    } catch (error) {
      console.error('PayPal subscription details error:', error);
      throw error;
    }
  }
} 
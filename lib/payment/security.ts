import crypto from 'crypto';

/**
 * 支付安全工具类
 * 主要用于防止金额篡改和签名验证
 */
export class PaymentSecurity {
  private static readonly SECRET_KEY = process.env.PAYMENT_SECURITY_SECRET!;
  
  /**
   * 生成支付签名，防止金额篡改
   */
  static generatePaymentSignature(data: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    timestamp: number;
  }): string {
    if (!this.SECRET_KEY) {
      throw new Error('PAYMENT_SECURITY_SECRET is not configured');
    }

    // 将所有参数按固定顺序组合
    const payload = [
      data.userId,
      data.planId,
      data.amount.toFixed(2), // 确保金额格式一致
      data.currency,
      data.timestamp.toString()
    ].join('|');

    // 生成HMAC签名
    return crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(payload)
      .digest('hex');
  }

  /**
   * 验证支付签名
   */
  static verifyPaymentSignature(data: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    timestamp: number;
    signature: string;
  }): boolean {
    try {
      const expectedSignature = this.generatePaymentSignature({
        userId: data.userId,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
        timestamp: data.timestamp
      });

      // 使用timingSafeEqual防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(data.signature, 'hex')
      );
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }

  /**
   * 检查时间戳是否在有效期内（防重放攻击）
   */
  static isTimestampValid(timestamp: number, validMinutes: number = 30): boolean {
    const now = Date.now();
    const diff = now - timestamp;
    return diff >= 0 && diff <= validMinutes * 60 * 1000;
  }

  /**
   * 生成安全的支付令牌
   */
  static generatePaymentToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 加密敏感支付数据
   */
  static encryptPaymentData(data: any): string {
    // Use createCipheriv instead of deprecated createCipher
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.SECRET_KEY.substring(0, 32), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Prepend IV to encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密支付数据
   */
  static decryptPaymentData(encryptedData: string): any {
    try {
      // Extract IV and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.SECRET_KEY.substring(0, 32), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('Invalid encrypted data');
    }
  }

  /**
   * 验证支付金额是否与订阅计划匹配
   */
  static async validatePaymentAmount(
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<boolean> {
    try {
      // 从数据库获取真实的计划价格
      const { createClient } = await import('@/lib/supabase-server');
      const supabase = await createClient();

      const { data: plan, error } = await supabase
        .from('subscription_plans')
        .select('price, currency')
        .eq('id', planId)
        .eq('enabled', true)
        .single();

      if (error || !plan) {
        console.error('计划不存在或已禁用:', error);
        return false;
      }

      // 验证金额和货币是否完全匹配
      const expectedAmount = parseFloat(plan.price.toFixed(2));
      const providedAmount = parseFloat(amount.toFixed(2));

      return expectedAmount === providedAmount && plan.currency === currency;

    } catch (error) {
      console.error('验证支付金额失败:', error);
      return false;
    }
  }

  /**
   * 生成安全的支付会话
   */
  static createSecurePaymentSession(data: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
  }) {
    const timestamp = Date.now();
    const token = this.generatePaymentToken();
    
    const signature = this.generatePaymentSignature({
      ...data,
      timestamp
    });

    return {
      token,
      timestamp,
      signature,
      expiresAt: timestamp + (30 * 60 * 1000), // 30分钟过期
      data: this.encryptPaymentData(data)
    };
  }

  /**
   * 验证支付会话
   */
  static validatePaymentSession(session: {
    token: string;
    timestamp: number;
    signature: string;
    expiresAt: number;
    data: string;
  }): { valid: boolean; decryptedData?: any } {
    try {
      // 检查过期时间
      if (Date.now() > session.expiresAt) {
        return { valid: false };
      }

      // 检查时间戳
      if (!this.isTimestampValid(session.timestamp)) {
        return { valid: false };
      }

      // 解密数据
      const decryptedData = this.decryptPaymentData(session.data);

      // 验证签名
      const isValidSignature = this.verifyPaymentSignature({
        ...decryptedData,
        timestamp: session.timestamp,
        signature: session.signature
      });

      if (!isValidSignature) {
        return { valid: false };
      }

      return { valid: true, decryptedData };

    } catch (error) {
      console.error('验证支付会话失败:', error);
      return { valid: false };
    }
  }
}

/**
 * 支付参数验证中间件
 */
export function validatePaymentRequest(
  requiredFields: string[]
) {
  return (req: any, res: any, next: any) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // 验证金额格式
    if (req.body.amount !== undefined) {
      const amount = parseFloat(req.body.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: 'Invalid amount'
        });
      }
      req.body.amount = amount;
    }

    next();
  };
}

/**
 * 支付安全日志记录
 */
export class PaymentSecurityLogger {
  static logSecurityEvent(
    type: 'signature_invalid' | 'amount_mismatch' | 'timestamp_invalid' | 'session_expired',
    details: any,
    userId?: string
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      type,
      userId,
      details,
      ip: details.ip,
      userAgent: details.userAgent
    };

    console.warn('⚠️  支付安全事件:', logData);
    
    // 这里可以集成到日志系统或安全监控
    // 例如发送到 Sentry, DataDog 等
  }

  static logPaymentAttempt(
    success: boolean,
    details: {
      userId: string;
      planId: string;
      amount: number;
      provider: string;
      ip?: string;
    }
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      success,
      ...details
    };

    if (success) {
      console.log('✅ 支付成功:', logData);
    } else {
      console.error('❌ 支付失败:', logData);
    }
  }
} 
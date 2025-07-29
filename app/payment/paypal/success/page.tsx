'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, AlertCircle, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface PaymentStatus {
  status: 'processing' | 'success' | 'error';
  subscription?: {
    id: string;
    planName: string;
    status: string;
    startDate: string;
    nextBilling?: string;
  };
  error?: string;
}

function PayPalSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'processing' });
  
  // 从URL参数获取信息
  const subscriptionId = searchParams.get('subscription_id');
  const orderId = searchParams.get('order_id');
  const payerId = searchParams.get('PayerID');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // 验证PayPal支付状态
        const response = await fetch('/api/payment/paypal/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscriptionId,
            orderId,
            payerId,
            token
          })
        });

        if (response.ok) {
          const result = await response.json();
          setPaymentStatus({
            status: 'success',
            subscription: result.subscription
          });
        } else {
          const error = await response.json();
          setPaymentStatus({
            status: 'error',
            error: error.message || 'Payment verification failed'
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus({
          status: 'error',
          error: 'Network error during payment verification'
        });
      }
    };

    if (subscriptionId || orderId) {
      verifyPayment();
    } else {
      setPaymentStatus({
        status: 'error',
        error: 'Missing payment information'
      });
    }
  }, [subscriptionId, orderId, payerId, token]);

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'processing':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className={`${getStatusColor()} border-2`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {paymentStatus.status === 'processing' && 'Processing Payment...'}
              {paymentStatus.status === 'success' && 'Payment Successful! 🎉'}
              {paymentStatus.status === 'error' && 'Payment Error'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentStatus.status === 'processing' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please wait while we verify your PayPal payment...
                </p>
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            )}

            {paymentStatus.status === 'success' && paymentStatus.subscription && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    Thank you for your subscription! Your payment has been processed successfully.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold text-lg mb-3">Subscription Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{paymentStatus.subscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {paymentStatus.subscription.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(paymentStatus.subscription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    {paymentStatus.subscription.nextBilling && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Billing:</span>
                        <span className="font-medium">
                          {new Date(paymentStatus.subscription.nextBilling).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription ID:</span>
                      <span className="font-mono text-sm">
                        {paymentStatus.subscription.id.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Your subscription is now active and ready to use</li>
                    <li>• You can start generating high-quality AI images immediately</li>
                    <li>• Check your email for the payment confirmation</li>
                    <li>• Manage your subscription in your account settings</li>
                  </ul>
                </div>
              </div>
            )}

            {paymentStatus.status === 'error' && (
              <div className="text-center space-y-4">
                <p className="text-red-600 mb-4">
                  {paymentStatus.error || 'An error occurred while processing your payment.'}
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">What can you do?</h4>
                  <ul className="text-red-700 space-y-1 text-sm text-left">
                    <li>• Check your PayPal account for any payment confirmations</li>
                    <li>• Try the payment process again with a different payment method</li>
                    <li>• Contact our support team if the problem persists</li>
                    <li>• Save your receipt for future reference</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              
              {paymentStatus.status === 'success' && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/pricing" className="flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Link>
                </Button>
              )}
              
              {paymentStatus.status === 'error' && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/pricing" className="flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Try Again
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PayPalSuccessContent />
    </Suspense>
  );
} 
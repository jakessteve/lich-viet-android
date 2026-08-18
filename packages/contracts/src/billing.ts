export type SubscriptionTier = 'free' | 'curious' | 'expert';

export interface VerifyPurchaseDto {
  platform: 'apple' | 'google';
  productId: string;
  receiptData?: string | undefined;
  purchaseToken?: string | undefined;
  transactionId?: string | undefined;
}

export interface PaymentOrderDto {
  gateway: 'momo' | 'zalopay' | 'vnpay';
  amount: number;
  tier: SubscriptionTier;
  orderDescription: string;
}

export interface PaymentOrderResult {
  orderId: string;
  paymentUrl: string;
  qrCodeUrl?: string | undefined;
}

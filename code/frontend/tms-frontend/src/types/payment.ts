// Types pour les paiements

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentType = 'incoming' | 'outgoing';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'credit_card' | 'cheque' | 'other';

export interface Payment {
  id: string;
  reference: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  payment_date: string;
  status: PaymentStatus;
  partner?: {
    id: string;
    name: string;
  };
  notes?: string;
  invoice_id?: string;
}

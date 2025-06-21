// Type pour un compte bancaire (utilisé dans PaymentForm)
export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  iban?: string | null;
  swift_bic?: string | null;
  currency: string;
  account_type: 'checking' | 'savings' | 'credit' | 'business' | 'other';
  current_balance?: number;
  notes?: string | null;
}

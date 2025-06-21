// Type pour une facture (utilisé dans PaymentForm)
export interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
}

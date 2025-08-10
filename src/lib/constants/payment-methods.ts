export interface PaymentMethod {
  value: string;
  label: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { value: "all", label: "すべての決済方法を利用可能にする" },
  { value: "konbini", label: "コンビニ決済" },
  { value: "credit_card", label: "クレジットカード" },
  { value: "pay_easy", label: "Pay-easy（ペイジー）" },
  { value: "bank_transfer", label: "銀行振込" },
  { value: "paypay", label: "PayPay" },
  { value: "merpay", label: "メルペイ" },
  { value: "rakutenpay", label: "楽天ペイ" },
];

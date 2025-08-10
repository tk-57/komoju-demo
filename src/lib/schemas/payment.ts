import { z } from "zod";
import { PAYMENT_METHODS } from "../constants/payment-methods";

// フォームデータのスキーマ
export const paymentFormSchema = z.object({
  amount: z.coerce.number().int().positive("金額は正の整数である必要があります"),
  payment_type: z.string().optional(),
});

// フォームバリデーション関数
export function validatePaymentForm(formData: FormData) {
  const data = {
    amount: formData.get("amount"),
    payment_type: formData.get("payment_type"),
  };

  const result = paymentFormSchema.parse(data);

  // 決済方法の追加バリデーション
  if (result.payment_type && result.payment_type !== "all") {
    const validPaymentMethod = PAYMENT_METHODS.find(
      (method) => method.value === result.payment_type,
    );

    if (!validPaymentMethod || validPaymentMethod.value === "all") {
      throw new Error("無効な決済方法が選択されました");
    }
  }

  return {
    amount: result.amount,
    paymentType: result.payment_type === "all" ? null : result.payment_type || null,
  };
}

// KOMOJU APIレスポンスのスキーマ
export const komojuSessionSchema = z.object({
  id: z.string(),
  session_url: z.string().url(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  payment: z
    .object({
      id: z.string(),
      status: z.string(),
    })
    .nullable()
    .optional(),
});

export const komojuPaymentSchema = z.object({
  id: z.string(),
  external_order_num: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  payment_details: z.object({
    type: z.string(),
    redirect_url: z.string().nullable().optional(),
  }),
  created_at: z.string(),
});

export const komojuPaymentsResponseSchema = z.object({
  data: z.array(komojuPaymentSchema),
  has_more: z.any().transform((val) => {
    if (typeof val === "string") return val === "true";
    if (typeof val === "boolean") return val;
    return false;
  }),
  total: z.number(),
});

export const sessionRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  return_url: z.string().url(),
  external_order_num: z.string(),
  payment_types: z.array(z.string()).optional(),
});

// 型推論
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type KomojuSession = z.infer<typeof komojuSessionSchema>;
export type KomojuPayment = z.infer<typeof komojuPaymentSchema>;
export type KomojuPaymentsResponse = z.infer<typeof komojuPaymentsResponseSchema>;
export type SessionRequest = z.infer<typeof sessionRequestSchema>;

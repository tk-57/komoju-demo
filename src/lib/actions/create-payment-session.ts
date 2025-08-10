"use server";

import { redirect } from "next/navigation";
import { validatePaymentForm } from "../schemas/payment";
import { createSession } from "../services/komoju";
import { handleActionError } from "../utils/errors";
import { generateExternalOrderNumber, getBaseUrl } from "../utils/url";

export async function createPaymentSession(formData: FormData) {
  try {
    const { amount, paymentType } = validatePaymentForm(formData);

    const sessionRequest = {
      amount,
      currency: "JPY" as const,
      return_url: `${getBaseUrl()}/return`,
      external_order_num: generateExternalOrderNumber(),
      ...(paymentType && { payment_types: [paymentType] }),
    };

    const session = await createSession(sessionRequest);
    redirect(session.session_url);
  } catch (error) {
    handleActionError(error);
  }
}

import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { createPaymentSession } from "@/lib/actions/create-payment-session";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h2 data-testid="page-title" className="mb-6 text-center font-bold text-2xl">
          KOMOJU サンプル決済
        </h2>
        <form data-testid="payment-form" action={createPaymentSession} className="space-y-4">
          <div>
            <label htmlFor="amount" className="mb-2 block font-medium text-sm">
              金額 (最小通貨単位):
            </label>
            <input
              data-testid="amount-input"
              id="amount"
              name="amount"
              type="number"
              defaultValue={1000}
              required
              min="1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <fieldset>
              <legend className="mb-2 block font-medium text-sm">決済方法を選択:</legend>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method, index) => (
                  <label key={method.value} className="flex items-center">
                    <input
                      data-testid={`payment-method-${method.value}`}
                      type="radio"
                      name="payment_type"
                      value={method.value}
                      defaultChecked={index === 0}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <SubmitButton />
        </form>
        <div className="mt-6 text-center">
          <Link
            data-testid="payment-history-link"
            href="/payments"
            className="text-blue-600 underline hover:text-blue-800"
          >
            決済履歴を見る
          </Link>
        </div>
      </div>
    </main>
  );
}

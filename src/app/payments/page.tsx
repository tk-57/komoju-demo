import Link from "next/link";
import { Suspense } from "react";
import { fetchPayments } from "@/lib/actions/fetch-payments";

async function PaymentsList({ page }: { page: number }) {
  try {
    const { payments, hasMore, total } = await fetchPayments(page);

    if (payments.length === 0) {
      return (
        <p data-testid="no-payments" className="text-gray-500">
          決済履歴がありません。
        </p>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table data-testid="payments-table" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  決済ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  注文番号
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  支払方法
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  作成日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 text-sm">
                    {payment.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {payment.external_order_num || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 font-semibold text-xs leading-5 ${
                        payment.status === "captured"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {payment.payment_details.type}
                    {payment.payment_details.redirect_url && (
                      <Link
                        href={payment.payment_details.redirect_url}
                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                      >
                        支払いリンク
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {new Date(payment.created_at).toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-gray-700 text-sm">全 {total} 件</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                data-testid="prev-page-link"
                href={`/payments?page=${page - 1}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
              >
                前のページ
              </Link>
            )}
            {hasMore && (
              <Link
                data-testid="next-page-link"
                href={`/payments?page=${page + 1}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
              >
                次のページ
              </Link>
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="text-red-600">
        <p>決済履歴の取得中にエラーが発生しました。</p>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 data-testid="payments-title" className="font-bold text-3xl">
          決済履歴
        </h1>
        <Link
          data-testid="new-payment-link"
          href="/"
          className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          新規決済
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="mb-4 h-10 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
          </div>
        }
      >
        <PaymentsList page={currentPage} />
      </Suspense>
    </div>
  );
}

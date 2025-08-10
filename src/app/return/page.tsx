import { Suspense } from "react";
import { ErrorMessage } from "@/components/payment/error-message";
import { SessionStatus } from "@/components/payment/session-status";

export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="container mx-auto p-4">
      {!session_id ? (
        <ErrorMessage title="エラー" message="セッションIDが見つかりません。" />
      ) : (
        <Suspense fallback={<h2 className="mb-4 font-bold text-2xl">読み込み中...</h2>}>
          <SessionStatus sessionId={session_id} />
        </Suspense>
      )}
    </div>
  );
}

import { getSession } from "@/lib/services/komoju";

interface SessionStatusProps {
  sessionId: string;
}

async function getSessionWithDetails(sessionId: string) {
  try {
    return await getSession(sessionId);
  } catch (error) {
    console.error("Failed to fetch session:", error);
    throw new Error("セッション情報の取得に失敗しました");
  }
}

function getSessionStatusMessage(session: {
  status: string;
  amount: number;
  currency: string;
  payment?: { status: string } | null;
}) {
  if (session.status === "completed" && session.payment) {
    return {
      title: "決済完了 — ありがとうございます",
      details: [
        `金額: ${session.amount} ${session.currency}`,
        `支払いステータス: ${session.payment.status}`,
      ],
    };
  }

  if (session.status === "cancelled") {
    return {
      title: "支払いがキャンセルされました",
    };
  }

  return {
    title: `支払いはまだ完了していません（status: ${session.status}）`,
  };
}

export async function SessionStatus({ sessionId }: SessionStatusProps) {
  try {
    const session = await getSessionWithDetails(sessionId);
    const { title, details } = getSessionStatusMessage(session);

    return (
      <>
        <h2 className="mb-4 font-bold text-2xl">{title}</h2>
        {details?.map((detail, index) => (
          <p key={index}>{detail}</p>
        ))}
      </>
    );
  } catch (error) {
    console.error("Session status error:", error);
    return (
      <>
        <h2 className="mb-4 font-bold text-2xl">エラー</h2>
        <p>セッション情報の取得に失敗しました。</p>
      </>
    );
  }
}

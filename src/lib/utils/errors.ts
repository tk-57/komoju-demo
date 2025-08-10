export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export function handleActionError(error: unknown): never {
  if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
    throw error;
  }

  if (error instanceof PaymentError) {
    throw error;
  }

  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    throw new PaymentError("サーバーエラーが発生しました");
  }

  console.error("Unknown error:", error);
  throw new PaymentError("予期しないエラーが発生しました");
}

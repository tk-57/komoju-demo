export function getBaseUrl(): string {
  // Vercel環境では VERCEL_URL を使用
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // その他の本番環境では NEXTAUTH_URL を使用
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // 開発環境用のデフォルト
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production fallback
  return "http://localhost:3000";
}

export function generateExternalOrderNumber(): string {
  return `order_${Date.now()}`;
}

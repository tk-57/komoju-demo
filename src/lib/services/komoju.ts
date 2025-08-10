import {
  type KomojuPaymentsResponse,
  type KomojuSession,
  komojuPaymentsResponseSchema,
  komojuSessionSchema,
  type SessionRequest,
  sessionRequestSchema,
} from "../schemas/payment";

const KOMOJU_BASE_URL = "https://komoju.com/api/v1";

const getSecretKey = (): string => {
  const key = process.env.KOMOJU_SECRET_KEY;
  if (!key) {
    throw new Error("KOMOJU_SECRET_KEY environment variable is required");
  }
  return key;
};

const createAuthHeader = (): string => {
  const secretKey = getSecretKey();
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
};

export async function createSession(request: SessionRequest): Promise<KomojuSession> {
  // リクエストデータをバリデーション
  const validatedRequest = sessionRequestSchema.parse(request);
  const response = await fetch(`${KOMOJU_BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: createAuthHeader(),
    },
    body: JSON.stringify(validatedRequest),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Komoju create session error:", response.status, text);
    throw new Error(`Failed to create session: ${response.status}`);
  }

  const data = await response.json();
  return komojuSessionSchema.parse(data);
}

export async function getSession(sessionId: string): Promise<KomojuSession> {
  const response = await fetch(`${KOMOJU_BASE_URL}/sessions/${encodeURIComponent(sessionId)}`, {
    method: "GET",
    headers: {
      Authorization: createAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed to fetch session:", response.status, text);
    throw new Error(`Failed to fetch session: ${response.status}`);
  }

  const data = await response.json();
  return komojuSessionSchema.parse(data);
}

export async function getPayments(
  page: number = 1,
  perPage: number = 20,
): Promise<KomojuPaymentsResponse> {
  const response = await fetch(`${KOMOJU_BASE_URL}/payments?page=${page}&per_page=${perPage}`, {
    method: "GET",
    headers: {
      Authorization: createAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed to fetch payments:", response.status, text);
    throw new Error(`Failed to fetch payments: ${response.status}`);
  }

  const data = await response.json();
  return komojuPaymentsResponseSchema.parse(data);
}

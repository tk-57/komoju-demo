"use server";

import { getPayments } from "../services/komoju";

export async function fetchPayments(page: number = 1, perPage: number = 20) {
  try {
    const data = await getPayments(page, perPage);

    // Sort payments by created_at descending (newest first)
    const sortedPayments = data.data.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return {
      payments: sortedPayments,
      hasMore: data.has_more,
      total: data.total,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("決済履歴の取得中にエラーが発生しました");
  }
}

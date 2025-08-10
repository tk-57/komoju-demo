"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      data-testid="submit-button"
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? "処理中..." : "決済ページへ"}
    </button>
  );
}

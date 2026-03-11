// utils/extractError.ts
import axios from "axios";

export function extractAxiosError(error: unknown, default_message?: string): string {
  if (!axios.isAxiosError(error)) return default_message || "An unexpected error occurred.";

  const data = error.response?.data;

  // Case 1: DRF "detail" field
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  // Case 2: DRF field errors (email: ["..."], password: ["..."])
  if (typeof data === "object" && data !== null) {
    const messages: string[] = [];

    for (const [field, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    }

    if (messages.length > 0) return messages.join(" | ");
  }

  // Case 3: DRF returns a list
  if (Array.isArray(data)) {
    return data.join(" ");
  }

  // Fallback
  return error.message || default_message || "Unknown error occurred.";
}

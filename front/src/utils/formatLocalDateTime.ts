// utils/formatLocalDateTime.ts

export function formatLocalDateTime(
  utcString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = new Date(utcString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    });
  } catch {
    return utcString; // fallback if invalid date
  }
}

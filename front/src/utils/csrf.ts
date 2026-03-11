// utils/csrf.ts
export function getCSRFToken(): string | null {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const [key, value] = c.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}
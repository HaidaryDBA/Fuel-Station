const PERSIAN_DIGIT_START = '\u06F0'.charCodeAt(0);
const ARABIC_DIGIT_START = '\u0660'.charCodeAt(0);

export const toEnglishDigits = (value: string): string => {
  return value.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= PERSIAN_DIGIT_START && code <= PERSIAN_DIGIT_START + 9) {
      return String(code - PERSIAN_DIGIT_START);
    }
    if (code >= ARABIC_DIGIT_START && code <= ARABIC_DIGIT_START + 9) {
      return String(code - ARABIC_DIGIT_START);
    }
    return char;
  });
};

export const normalizeNumericInput = (value: string): string => {
  return toEnglishDigits(value)
    .replace(/[\u066C\u060C]/g, '')
    .replace(/\u066B/g, '.')
    .replace(/[\u2212\uFE63\uFF0D]/g, '-');
};

export const normalizePhoneInput = (value: string, maxLength = 10): string => {
  return toEnglishDigits(value).replace(/\D/g, '').slice(0, maxLength);
};

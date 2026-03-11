// src/i18n/direction.ts
export const directionMap = {
  en: "ltr",
  da: "rtl",
  pa: "rtl",
} as const;

export type SupportedLang = keyof typeof directionMap;

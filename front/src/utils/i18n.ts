import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Global translations
import en from "../locales/en.json";
import da from "../locales/da.json";
import pa from "../locales/pa.json";

// Merge global and MIS translations
const enTranslations = { ...en };
const daTranslations = { ...da };
const paTranslations = { ...pa };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "da", // ✅ DEFAULT LANGUAGE (FARSI / DARI)
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: enTranslations },
      da: { translation: daTranslations },
      pa: { translation: paTranslations },
    },
  });

export default i18n;

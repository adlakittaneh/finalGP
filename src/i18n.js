import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/US/translation.json";
import translationAR from "./locales/ar/translation.json";

const resources = {
  US: { translation: translationEN },
  AR: { translation: translationAR },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "AR",
    lng: localStorage.getItem("lang") || "AR",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

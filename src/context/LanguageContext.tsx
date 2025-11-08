import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import i18n from "i18next"; // 👈 ضروري

type Language = "AR" | "US";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("lang") as Language) || "AR"
  );

  useEffect(() => {
    // ✅ كل ما تتغير اللغة:
    // - يغير i18next اللغة
    // - يضبط الاتجاه
    // - يخزنها محلياً
    i18n.changeLanguage(language);
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
    localStorage.setItem("lang", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside a LanguageProvider");
  return context;
};

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "AR";

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">
          {isRTL ? "عذراً! الصفحة غير موجودة" : "Oops! Page not found"}
        </p>
        <Link to="/" className="text-blue-500 underline hover:text-blue-700">
          {isRTL ? "العودة إلى الصفحة الرئيسية" : "Return to Home"}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

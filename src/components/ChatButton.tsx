import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Link, useLocation } from "react-router-dom";

const ChatButton = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isRTL = language === "AR";

  // Hide on contact page and login page
  if (location.pathname === "/contact" || location.pathname === "/login") {
    return null;
  }

  return (
    <Link to="/contact" className="fixed bottom-4 sm:bottom-6 z-50">
      <Button
        size="lg"
        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 gradient-primary ${
          isRTL ? "right-4 sm:right-8" : "left-4 sm:left-8"
        }`}
        style={{ boxShadow: "0 8px 30px rgba(20, 71, 147, 0.3)" }}
        title="تواصل معنا"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </Link>
  );
};

export default ChatButton;


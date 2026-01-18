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
    <Link
      to="/contact"
      className={`fixed bottom-4 sm:bottom-6 z-50 ${isRTL ? "left-4 sm:left-8" : "right-4 sm:right-8"}`}
    >
      <Button
        size="lg"
        className="h-10 w-18 sm:h-20 sm:w-20 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 gradient-primary"
        style={{ boxShadow: "0 8px 30px rgba(20, 71, 147, 0.3)" }}
        title={language === "AR" ? "تواصل معنا" : "Contact Us"}
      >
        <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10" />
      </Button>
    </Link>
  );
};

export default ChatButton;

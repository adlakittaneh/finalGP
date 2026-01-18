import { Home, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const { language } = useLanguage();
  return (
    <footer className="bg-card border-t mt-12 sm:mt-16 md:mt-20">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div>
           
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("footer.about_text")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t("footer.quick_links")}</h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.home")}
              </Link>
              <Link
                to="/favorites"
                className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.favorites")}
              </Link>
              <Link
                to="/add-property"
                className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.add_property")}
              </Link>
              <Link
                to="/contact"
                className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.contact")}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

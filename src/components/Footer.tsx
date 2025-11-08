import { Home, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const { language } = useLanguage();
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
           
            <p className="text-muted-foreground leading-relaxed">
              {t("footer.about_text")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.quick_links")}</h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.home")}
              </Link>
              <Link
                to="/favorites"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.favorites")}
              </Link>
              <Link
                to="/add-property"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.add_property")}
              </Link>
              <Link
                to="/dashboard"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.dashboard")}
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.contact_us")}</h3>
          
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-smooth"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-smooth"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted hover:bg-green-500 hover:text-white flex items-center justify-center transition-smooth"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

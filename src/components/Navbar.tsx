import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleSelect = (lang: "AR" | "US") => {
    setLanguage(lang);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold"
            style={{
              background: "linear-gradient(90deg, #f9c948, #144993)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("brand_name")}
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth">
              {t("navbar.home")}
            </Link>
            <Link to="/favorites" className="text-foreground hover:text-primary transition-smooth">
              {t("navbar.favorites")}
            </Link>
            <Link to="/add-property" className="text-foreground hover:text-primary transition-smooth">
              {t("navbar.add_property")}
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
              {t("navbar.dashboard")}
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-smooth">
              {t("navbar.contact")}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("navbar.language")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSelect("AR")}>العربية</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect("US")}>English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Login Button */}
            <Link to="/login">
              <Button variant="default" size="sm" className="gap-2 gradient-primary">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("navbar.login")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

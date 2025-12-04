import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Globe, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToastContainer, toast } from "react-toastify";

const Navbar = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSelect = (lang: "AR" | "US") => {
    setLanguage(lang);
  };

  const handleLogout =async (e: React.FormEvent) => {
    try{
const response = await fetch(
      "http://easyaqar.org/api/auth/logout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
      
      
    );
    const data = await response.json();
     console.log("Response data:", data);
    if (!response.ok) {
    toast.error("فشل تسجيل الخروج .");
     return;
    }
    }catch(error){
      console.error("Logout failed:", error);
    }
    logout();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const isRTL = language === "AR";

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
  {isAuthenticated && user?.role === "ADMIN" && (
    <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
      {t("navbar.dashboard")}
    </Link>
  )}
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
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => handleSelect("AR")}>العربية</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect("US")}>English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Login Button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-primary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    <span>{t("navbar.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="gap-2 gradient-primary">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("navbar.login")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

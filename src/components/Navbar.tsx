import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Globe, User, LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { API_BASE } from "../pages/config/api";
import { apiFetch } from "../api/apiFetch";
import Chat from "../pages/ChatAdmin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (lang: "AR" | "US") => {
    setLanguage(lang);
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await apiFetch(`${API_BASE}/auth/logout`, {
        method: "POST",
      });

      console.log("Response data:", data);
      toast.success("تم تسجيل الخروج بنجاح.");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("فشل تسجيل الخروج.");
    }
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    logout();
    navigate("/login");
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
            className="text-xl sm:text-2xl font-bold"
            style={{
              background: "linear-gradient(90deg, #f9c948, #144993)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("brand_name")}
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("navbar.home")}
            </Link>
            <Link
              to="/favorites"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("navbar.favorites")}
            </Link>
            <Link
              to={
                localStorage.getItem("isAuthenticated") === "true"
                  ? "/add-property"
                  : "/login"
              }
              onClick={(e) => {
                if (localStorage.getItem("isAuthenticated") !== "true") {
                  toast.info("يجب تسجيل الدخول أولاً لإضافة عقار");
                }
              }}
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("navbar.add_property")}
            </Link>
            <Link
              to="/allPropertylisting"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("navbar.all_properties")}
            </Link>
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link
                to="/dashboard"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.dashboard")}
              </Link>
            )}

            {isAuthenticated && user?.role === "ADMIN" && (
              //chat link
              <Link
                to="/Inbox"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.Chat")}
              </Link>
            )}
            {!(isAuthenticated && user?.role === "ADMIN") && (
              <Link
                to="/contact"
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t("navbar.contact")}
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("navbar.language")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => handleSelect("AR")}>
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect("US")}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Login Button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-9 w-9 p-0"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-primary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? "start" : "end"}
                  className="w-56"
                >
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
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    <span>{t("navbar.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 gradient-primary"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("navbar.login")}</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Language Switch - Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 p-2">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => handleSelect("AR")}>
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect("US")}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-[300px] sm:w-[400px]"
              >
                <SheetHeader>
                  <SheetTitle
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(90deg, #f9c948, #144993)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {t("brand_name")}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Navigation Links */}
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                  >
                    {t("navbar.home")}
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                  >
                    {t("navbar.favorites")}
                  </Link>
                  <Link
                    to="/allPropertylisting"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                  >
                    {t("navbar.all_properties")}
                  </Link>
                  <Link
                    to={
                      localStorage.getItem("isAuthenticated") === "true"
                        ? "/add-property"
                        : "/login"
                    }
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (localStorage.getItem("isAuthenticated") !== "true") {
                        toast.info("يجب تسجيل الدخول أولاً لإضافة عقار");
                      }
                    }}
                    className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                  >
                    {t("navbar.add_property")}
                  </Link>

                  {isAuthenticated && user?.role === "ADMIN" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                    >
                      {t("navbar.dashboard")}
                    </Link>
                  )}
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-smooth py-2 border-b"
                  >
                    {t("navbar.contact")}
                  </Link>

                  {/* Mobile User Section */}
                  <div className="mt-4 pt-4 border-t">
                    {isAuthenticated && user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="gradient-primary text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            handleLogout(e);
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <LogOut
                            className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          <span>{t("navbar.logout")}</span>
                        </Button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="default"
                          className="w-full gradient-primary gap-2"
                        >
                          <User className="w-4 h-4" />
                          <span>{t("navbar.login")}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

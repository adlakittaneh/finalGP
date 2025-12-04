
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import OTPDialog from "@/components/OTPDialog";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === "AR";
  const [otpOpen, setOtpOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

 const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Login:", { loginEmail, loginPassword });

  try {
    const response = await fetch("http://easyaqar.org/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      }),
    });

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      toast.error("فشل تسجيل الدخول، تحقق من البريد وكلمة المرور.");
      return;
    }

    toast.success("تم تسجيل الدخول بنجاح!");
    const resp = await fetch("http://easyaqar.org/api/auth/me", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const userData = await resp.json();//current user data
    login(userData);
    console.log("User data:", userData);
localStorage.setItem("user", JSON.stringify(userData));
localStorage.setItem("isAuthenticated", "true");

    navigate("/");

  } catch (error) {
    console.error("Login error:", error);
    toast.error("حدث خطأ في الاتصال بالخادم");
  }
};


const parseCookiesFromHeader = (setCookieHeader: string) => {
  const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());

  cookies.forEach(cookieString => {
    const parts = cookieString.split(';').map(part => part.trim());
    const [nameValue, ...attributes] = parts;
    const [name, value] = nameValue.split('=');

    let maxAge: number | undefined;
    let expires: string | undefined;
    let path = '/';
    let domain = window.location.hostname;
    let secure = false;
    let sameSite: 'strict' | 'lax' | 'none' = 'lax';

    attributes.forEach(attr => {
      const [key, val] = attr.split('=').map(s => s.trim());

      switch(key.toLowerCase()) {
        case 'max-age':
          maxAge = parseInt(val);
          break;
        case 'expires':
          expires = val;
          break;
        case 'path':
          path = val || '/';
          break;
        case 'domain':
          // Don't use the server's domain, use current domain
          domain = window.location.hostname;
          break;
        case 'secure':
          secure = true;
          break;
        case 'samesite':
          sameSite = val.toLowerCase() as 'strict' | 'lax' | 'none';
          break;
      }
    });

    setCookie(name, value, { maxAge, expires, path, domain, secure, sameSite });
  });
};

const setCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number;
    expires?: string;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
) => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.expires) {
    cookieString += `; expires=${options.expires}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
};

const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPhoneError("");
    setConfirmPasswordError("");

    if (phoneNumber.length !== 10) {
      setPhoneError("رقم الهاتف غير صالح , اعد المحاولة");
      return;
    }
    if (signupPassword.length < 6) {
    setPasswordError("كلمة المرور يجب أن تكون على الأقل 6 خانات.");
    return;
  }
    if (signupPassword !== confirmPassword) {
      setConfirmPasswordError("كلمة المرور وتأكيدها غير متطابقين.");
      return;
    }



    try {
      const response = await fetch(
        "http://easyaqar.org/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            firstName: signupFirstName,
            lastName: signupLastName,
            phoneNumber: phoneNumber,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          throw [{ errorCode: "USER_ALREADY_EXISTS", message: "User already exists" }];
        }
      }
      setOtpOpen(true);
      toast.success("تم إنشاء الحساب بنجاح!");
    } catch (error: any) {
      if (error[0].errorCode === "USER_ALREADY_EXISTS") {
        toast.error("الإيميل هذا مستخدم بالفعل، يرجى تجربة إيميل آخر.");
      } else {
        toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold">{t("login.welcome")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full" dir={isRTL ? "rtl" : "ltr"}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t("login.tabLogin")}</TabsTrigger>
              <TabsTrigger value="signup">{t("login.tabSignup")}</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("login.email")}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("login.password")}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary" size="lg">
                  {t("login.loginButton")}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("login.firstName")}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t("login.firstNamePlaceholder")}
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("login.lastName")}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t("login.lastNamePlaceholder")}
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("login.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("login.password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}

                  />
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("login.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={confirmPasswordError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t("login.phoneNumber")}</Label>
                  <Input
                    id="phoneNumber"
                    type="number"
                    placeholder="0599999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                </div>


                <Button type="submit" className="w-full gradient-primary" size="lg">
                  {t("login.signupButton")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={isRTL}
      />
      <OTPDialog
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        email={signupEmail}
        onConfirm={async (code: string) => {
          try {
            const res = await fetch(
              "http://easyaqar.org/api/auth/verify-otp",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: signupEmail, verificationCode: code }),
              }
            );

            if (!res.ok) throw new Error("رمز التحقق غير صحيح ");
            setOtpOpen(false);
          } catch (err: any) {
            toast.error(err.message);
          }
        }}
      />

    </div>
  );
};

export default Login;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { loginEmail, loginPassword });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      alert(t("login.passwordMismatch"));
      return;
    }
    console.log("Signup:", { signupFirstName, signupLastName, signupEmail, signupPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold">{t("login.welcome")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full" dir="rtl">
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">{t("login.or")}</span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full" size="lg">
                  {t("login.loginWithGoogle")}
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  {t("login.loginWithFacebook")}
                </Button>
              </div>
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("login.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary" size="lg">
                  {t("login.signupButton")}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">{t("login.or")}</span>
                </div>
              </div>

              {/* Social signup buttons */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full" size="lg">
                  {t("login.signupWithGoogle")}
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  {t("login.signupWithFacebook")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

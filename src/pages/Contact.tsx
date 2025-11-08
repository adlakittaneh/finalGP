import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t("contact.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {t("contact.sendMessage")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.subject")}</Label>
                  <Input id="subject" placeholder={t("contact.subjectPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.message")}</Label>
                  <Textarea id="message" rows={6} placeholder={t("contact.messagePlaceholder")} />
                </div>
                <Button className="w-full gradient-primary" size="lg">
                  {t("contact.sendButton")}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{t("contact.phone")}</h3>
                        <p className="text-muted-foreground">+970 123 456 789</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{t("contact.email")}</h3>
                        <p className="text-muted-foreground">easyaqar2025@gmail.com</p>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{t("contact.businessHours")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{t("contact.saturdayFriday")}: 9:00 AM - 6:00 PM</p>
                    <p>{t("contact.friday")}: {t("contact.closed")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;



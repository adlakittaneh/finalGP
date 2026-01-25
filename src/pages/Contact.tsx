import Navbar from "@/components/Navbar";
import { useRef, useEffect } from "react";

import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { API_BASE } from "./config/api";
import { apiFetch } from "../api/apiFetch";

const Contact = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
const [loadingChat, setLoadingChat] = useState(true);
const messagesEndRef = useRef(null);

  const sendMessage = async () => {
  if (!message.trim()) return;

  try {
    setLoading(true);
    await apiFetch(`${API_BASE}/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content: message,
        subject: subject || "Support Message",
      }),
    });

    setMessage("");
    setSubject("");

    fetchConversation(); // 👈 مهم
  } catch (error) {
    console.error("Send message error", error);
  } finally {
    setLoading(false);
  }
};

  const fetchConversation = async () => {
  try {
    const res = await apiFetch(`${API_BASE}/chat/conversation`, {
      method: "GET",
      credentials: "include",
    });

    setMessages(res.messages || []);
  } catch (error) {
    console.error("Fetch conversation error", error);
  } finally {
    setLoadingChat(false);
  }
};

const markAsRead = async () => {
  try {
    await apiFetch(`${API_BASE}/chat/messages/read`, {
      method: "PUT",
      credentials: "include",
    });
  } catch (error) {
    console.error("Mark as read error", error);
  }
};
useEffect(() => {
  fetchConversation();
  markAsRead();
}, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t("contact.title")}</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Form */}
           <Card className="shadow-card">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <MessageCircle className="w-5 h-5" />
      {messages.length > 0 ? t("EasyAqar Support Chat") : t("contact.sendMessage")}
    </CardTitle>
  </CardHeader>

  <CardContent>
    {loadingChat ? (
      <p className="text-center text-muted-foreground">Loading...</p>
    ) : messages.length === 0 ? (
      /* 🟢 الفورم */
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{t("contact.subject")}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">{t("contact.message")}</Label>
          <Textarea
            id="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          onClick={sendMessage}
          disabled={loading || !message.trim()}
        >
          {loading ? "Sending..." : t("contact.sendButton")}
        </Button>
      </div>
    ) : (
      /* 🔵 الشات */
      <>
        <div className="h-80 overflow-y-auto space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isFromAdmin ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm
                  ${
                    msg.isFromAdmin
                      ? "bg-gray-200 text-gray-800"
                      : "bg-primary text-white"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("Type your message...")}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={loading}>
            {t("Send")}
          </Button>
        </div>
      </>
    )}
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

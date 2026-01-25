import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { apiFetch } from "@/api/apiFetch";

const API_BASE = "/api";

const Chat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
const [userFirstName, setUserFirstName] = useState("");
const [userLastName, setUserLastName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const { userId } = useParams();
  const [conversationId, setConversationId] = useState(null);
  console.log("Fetching conversation for userId:", userId);
  // Scroll لآخر رسالة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 const fetchConversation = async () => {
  if (!userId) return;
  try {
    const res = await apiFetch(
      `${API_BASE}/admin/chat/conversations/user/${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    setMessages(res.messages || []);
    setConversationId(res.id);
    setUserFirstName(res.userFirstName);
    setUserLastName(res.userLastName);
  console.log("userFirstName:", userFirstName);
    scrollToBottom();
  } catch (error) {
    console.error("Fetch conversation error", error);
  }
};

const sendMessage = async () => {
  if (!newMessage.trim()) return;
  if (!userId || !conversationId) return;

  try {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/admin/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
       body: JSON.stringify({
          content: newMessage,
          subject: "Chat with user",
        }),
    });
    setNewMessage("");
    fetchConversation();
  } catch (error) {
    console.error("Send message error", error);
  } finally {
    setLoading(false);
  }
};

  const home = async () => {
    navigate("/");
  }
  const markAsRead = async () => {
    try {
         const Data = await apiFetch(`${API_BASE}/chat/messages/read`, {
          method: "PUT",
           headers:  {
          "Content-Type": "application/json",
          
        },
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-100">
  <div className="flex flex-col w-3/4 bg-white rounded-2xl shadow-md overflow-hidden border" style={{ height: "75vh" }}>

    {/* Header */}
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
      <div className="flex flex-col">
        <span className="font-bold text-lg">{`${userFirstName} ${userLastName}`}</span>
        <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="رجوع"
          >
            <ArrowLeft size={22} />
          </button>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#f5f7fb]">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
        >
          <div
            className="px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm"
            style={{
              backgroundColor: msg.isFromAdmin ? "#144a95" : "#c3c3c3",
              color: msg.isFromAdmin ? "#ffffff" : "#1f2937",
            }}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div className="px-4 py-3 border-t bg-white flex flex-col sm:flex-row items-center gap-2">
  <input
    type="text"
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    placeholder={t("typeMessage")}
    className="flex-1 w-full sm:w-auto bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />
  <div className="flex w-full sm:w-auto gap-2">
    <button
      onClick={sendMessage}
      disabled={loading}
      className="flex-1 sm:flex-none px-4 py-2 rounded-full text-white text-sm transition disabled:opacity-50"
      style={{ backgroundColor: "#144a95" }}
    >
      {t("Send")}
    </button>
    <button
      onClick={home}
      className="flex-1 sm:flex-none px-4 py-2 rounded-full text-white text-sm transition disabled:opacity-50"
      style={{ backgroundColor: "#144a95" }}
    >
      {t("Home")}
    </button>
  </div>
</div>

  </div>
</div>

);

};

export default Chat;

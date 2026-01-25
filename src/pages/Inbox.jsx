import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/api/apiFetch";
import { ArrowLeft } from "lucide-react";

const Inbox = () => {
  const API_BASE = "/api";
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchConversations = async () => {
    try {
      let url =
        filter === "all"
          ? `${API_BASE}/admin/chat/conversations?page=0&size=20`
          : `${API_BASE}/admin/chat/conversations/unread`;

      const res = await apiFetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (filter === "all") {
  setConversations(res.content || []);
} else {
  setConversations(res || []);
}
    } catch (error) {
      console.error("Fetch conversations error", error);
    }
  };

  // إعادة الجلب عند تغيير الفلتر
  useEffect(() => {
    fetchConversations();
  }, [filter]);

  return (
    <div className="max-w-3xl mx-auto mt-6">
      {/* العنوان */}
     <div className="flex items-center gap-3 mb-4 px-6">
  <button
    onClick={() => navigate(-1)}
    className="p-2 rounded-full hover:bg-gray-100 transition"
    title="رجوع"
  >
    <ArrowLeft size={22} />
  </button>

  <h1 className="text-xl font-bold">Chats</h1>
</div>


      {/* أزرار الفلتر */}
      <div className="flex gap-2 px-6 mb-4">
        <button
          className={`px-4 py-2 rounded-full border transition ${
            filter === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setFilter("all")}
        >
          الكل
        </button>

        <button
          className={`px-4 py-2 rounded-full border transition ${
            filter === "unread"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setFilter("unread")}
        >
          غير مقروء
        </button>
      </div>

      {/* المحادثات */}
      <div className="flex flex-col gap-2 px-6">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="cursor-pointer p-4 rounded-lg flex justify-between items-center border"
            style={{
              borderColor: "#144a95",
              borderWidth: "1px",
              borderRadius: "0.75rem", // مناسب للماسنجر
            }}
            onClick={() => {
              console.log("userId:", conv.userId);
              navigate(`/chat/${conv.userId}`);
            }}
          >
            <div className="flex flex-col">
              <span className="font-semibold">
                {conv.userFirstName} {conv.userLastName}
              </span>
              <span className="text-gray-600 truncate max-w-[500px]">
                {conv.lastMessage.content}
              </span>
              <span className="text-sm text-gray-400">
                {new Date(conv.lastMessage.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;

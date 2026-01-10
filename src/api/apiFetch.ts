import { json } from "stream/consumers";
const API_BASE = "http://easyaqar.org/api";
export async function apiFetch(url: string, options: any = {}) {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const finalOptions = { ...defaultOptions, ...options };
  let res = await fetch(url, finalOptions);
    const text = await res.text();
  let data: any = {};
    if (text) {
    try {
      data = JSON.parse(text);
      console.log("response: ", data);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
  }
  if (res.status === 401 && data.details === "Token Expired") {
    console.warn("Access token expired → Refreshing…");
    const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      console.log("Refresh success, retrying original request…");
      // إعادة إرسال الريكوست الأصلي مرة ثانية
      res = await fetch(url, finalOptions);
      const retryText = await res.text();
      
      if (retryText) {
        try {
          data = JSON.parse(retryText);
        } catch (err) {
          console.error("Failed to parse retry response:", err);
        }
      }
      return data;
    }
    console.error("Refresh failed → redirecting to login");
    window.location.href = "/login";
    return null;
  }
  if (!res.ok) {
    console.error(`Request failed with status ${res.status}:`, data);
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
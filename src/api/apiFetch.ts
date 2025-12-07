import { json } from "stream/consumers";

// apiFetch.ts
const API_BASE = "http://easyaqar.org/api";

export async function apiFetch(url: string, options: any = {}) {
  // اعدادات افتراضية للريكوست
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // دمج الاعدادات
  const finalOptions = { ...defaultOptions, ...options };

  // 1 — أرسل الريكوست الأصلي
  let res = await fetch(url, finalOptions);
  
  // Parse response text once
  const text = await res.text();
  let data: any = {};
  
  // Try to parse JSON if there's content
  if (text) {
    try {
      data = JSON.parse(text);
      console.log("response: ", data);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
  }

  // 2 — إذا رجع 401 → حاول نعمل refresh
  if (res.status === 401 && data.details === "Token Expired") {
    console.warn("Access token expired → Refreshing…");
    
    const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    // إذا الريفريش نجح
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

    // 3 — إذا فشل الريفريش → تسجيل خروج
    console.error("Refresh failed → redirecting to login");
    window.location.href = "/login";
    return null;
  }

  // إذا كان الرد غير ناجح ولكن ليس 401
  if (!res.ok) {
    console.error(`Request failed with status ${res.status}:`, data);
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
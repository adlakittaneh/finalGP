import { json } from "stream/consumers";

// apiFetch.ts
const API_BASE = "http://easyaqar.org/api";

export async function apiFetch(url: string, options: any = {}) {
  // اعدادات افتراضية للريكوست
  const defaultOptions = {
    credentials: "include", // عشان الكوكيز تنبعت (refresh + access)
    headers: {
      "Content-Type": "application/json",
    },
  };

  // دمج الاعدادات
  const finalOptions = { ...defaultOptions, ...options };

  // 1 — أرسل الريكوست الأصلي
  let res = await fetch(url, finalOptions);
  let data = {};
  data = JSON.parse(await res.text());
  console.log("response: " + data);
  // 2 — إذا رجع 401 → حاول نعمل refresh
  if (res.status === 401
  ) {
    console.warn("Access token expired → Refreshing…");

    const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      credentials: "include", // مهم جداً لإرسال كوكيز الريفريش
    });

    // إذا الريفريش نجح
    if (refreshRes.ok) {
      console.log("Refresh success, retrying original request…");

      // إعادة إرسال الريكوست الأصلي مرة ثانية
      res = await fetch(url, finalOptions);
      return res;
    }

    // 3 — إذا فشل الريفريش → تسجيل خروج
    console.error("Refresh failed → redirecting to login");
    window.location.href = "/login";
  }

  return res;
}

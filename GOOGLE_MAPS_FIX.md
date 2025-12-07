# حل مشكلة "يتعذّر على هذه الصفحة تحميل خرائط Google بشكل صحيح"

## السبب الرئيسي:

هذه الرسالة تظهر عادة بسبب **قيود النطاق (Domain Restrictions)** في Google Cloud Console أو مشكلة في API key.

## الحلول:

### 1. إضافة النطاق في Google Cloud Console

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. اذهب إلى **APIs & Services** > **Credentials**
3. اضغط على API key الخاص بك
4. في قسم **Application restrictions**:
   - اختر **HTTP referrers (web sites)**
   - أضف النطاقات التالية:
     ```
     http://localhost:8081/*
     http://localhost:8081
     http://127.0.0.1:8081/*
     http://127.0.0.1:8081
     ```
   - إذا كنت تستخدم نطاق آخر، أضفه أيضاً (مثل: `https://yourdomain.com/*`)

### 2. التأكد من تفعيل الـ APIs

في Google Cloud Console:

- اذهب إلى **APIs & Services**> **Library**
- تأكد من تفعيل:
  - ✅ **Maps JavaScript API**
  - ✅ **Geocoding API**
  - ✅ **Places API**

### 3. التحقق من API Key

1. افتح ملف `.env` في مجلد المشروع
2. تأكد من أن السطر موجود:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. تأكد من عدم وجود مسافات إضافية قبل أو بعد المفتاح
4. بعد التعديل، **أعد تشغيل السيرفر**:
   ```bash
   npm run dev
   ```

### 4. التحقق من Billing

- تأكد من تفعيل Billing في Google Cloud (حتى لو كان هناك حد مجاني)

### 5. إذا استمرت المشكلة

1. افتح Console في المتصفح (F12)
2. ابحث عن أي أخطاء تحتوي على "Google Maps API" أو "API key"
3. انسخ رسالة الخطأ وأرسلها لمتابعة الحل

## ملاحظات مهمة:

- ⚠️ **لا تشارك API key مع أحد** - خاصة إذا كان مقيداً بنطاق معين
- ⚠️ **أعد تشغيل السيرفر** بعد أي تعديل على ملف `.env`
- ✅ النطاقات يجب أن تحتوي على `/*` في النهاية للسماح بكل الصفحات
- ✅ في بيئة التطوير، استخدم `http://localhost:8081/*`

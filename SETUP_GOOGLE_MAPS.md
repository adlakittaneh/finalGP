# دليل إضافة Google Maps API Key

## الخطوات المطلوبة:

### 1. إنشاء ملف `.env` في المجلد الرئيسي للمشروع

في المجلد `C:\Users\aayyl\Desktop\aqar\` أنشئ ملف باسم `.env` (بدون أي امتداد)

### 2. إضافة المفتاح في ملف `.env`

افتح ملف `.env` وأضف السطر التالي:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**مثال:**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. الحصول على Google Maps API Key

#### أ) افتح Google Cloud Console
- اذهب إلى: https://console.cloud.google.com/
- سجل الدخول بحساب Google الخاص بك

#### ب) أنشئ مشروع جديد (أو استخدم مشروع موجود)
1. انقر على قائمة المشاريع في أعلى الصفحة
2. اختر "إنشاء مشروع جديد" أو استخدم مشروع موجود
3. أدخل اسم المشروع (مثل: "aqar-app")
4. انقر على "إنشاء"

#### ج) فعّل الـ APIs المطلوبة
1. من القائمة الجانبية، اختر **APIs & Services** > **Library**
2. ابحث عن كل API من التالية وقم بتفعيلها:
   - **Maps JavaScript API** - اضغط "Enable"
   - **Geocoding API** - اضغط "Enable"
   - **Places API** - اضغط "Enable"

#### د) أنشئ API Key
1. اذهب إلى **APIs & Services** > **Credentials**
2. انقر على **Create Credentials** > **API Key**
3. سيتم إنشاء مفتاح تلقائياً
4. انسخ المفتاح (سيبدأ بـ `AIzaSy...`)
5. **مهم جداً**: انقر على "Restrict Key" لإضافة قيود الأمان:
   - في **API restrictions** اختر "Restrict key"
   - حدد فقط: Maps JavaScript API, Geocoding API, Places API
   - في **Application restrictions** يمكنك اختيار HTTP referrers وإضافة موقعك

### 4. إضافة المفتاح في ملف `.env`

1. افتح ملف `.env` (إذا لم يكن موجوداً، أنشئه)
2. أضف السطر التالي مع وضع مفتاحك الحقيقي:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**تحذير:** 
- لا تضع ملف `.env` في Git (يجب أن يكون في `.gitignore`)
- لا تشارك مفتاحك مع أحد

### 5. إعادة تشغيل سيرفر التطوير

بعد إضافة المفتاح:

1. أوقف السيرفر (Ctrl+C في Terminal)
2. أعد تشغيله:
   ```bash
   npm run dev
   ```

### 6. التحقق من أن كل شيء يعمل

بعد إعادة التشغيل:
- افتح صفحة "إضافة عقار"
- اضغط على زر "إضافة عقار جديد"
- يجب أن تظهر الخريطة في النافذة المنبثقة

## حل المشاكل:

### الخريطة لا تظهر؟
- تحقق من أن ملف `.env` في المجلد الرئيسي (`aqar/`)
- تأكد من أن اسم المتغير صحيح: `VITE_GOOGLE_MAPS_API_KEY`
- تأكد من إعادة تشغيل السيرفر بعد إضافة المفتاح
- تحقق من Console في المتصفح لأي أخطاء

### رسالة خطأ في Console؟
- تأكد من تفعيل الـ 3 APIs (Maps JavaScript, Geocoding, Places)
- تأكد من صحة المفتاح
- تحقق من أن المفتاح غير مقيد بشكل يمنع استخدامه

## ملاحظة مهمة:

Google Maps API له حد مجاني محدود. بعد تجاوز الحد، قد تدفع رسوم. تحقق من الفاتورة في Google Cloud Console.


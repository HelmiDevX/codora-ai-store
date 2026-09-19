# 🚀 كودورا للذكاء الاصطناعي | Codora AI Store

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State-4338ca?style=for-the-badge)

**المنصة الرقمية المتكاملة لبيع وإدارة اشتراكات وكورسات الذكاء الاصطناعي**  
(ChatGPT Plus, Claude 3.5 Sonnet, Midjourney, Canva Pro, Cursor Pro وغيرها الكثير)

---

### 👨‍💻 **تصميم وتطوير (Designed & Developed by):**
### **م/ حلمي أمين حسان (Eng. Helmi Amin Hassan)**
**GitHub:** [@HelmiDevX](https://github.com/HelmiDevX)

---

</div>

## ✨ مميزات المشروع الرئيسية (Key Features)

### 🛍️ 1. واجهة المتجر (Storefront Experience):
- **تصميم عصري مستقبلي (Dark Glassmorphic UI):** واجهة عربية متكاملة RTL باستخدام خط تجوال وألوان نيتروجينية وتأثيرات زجاجية راقية.
- **محول عملات فوري وتلقائي (Multi-Currency Engine):**
  - الدولار الأمريكي ($ USD)
  - الريال اليمني - عدن / جديد (YER Aden)
  - الريال اليمني - صنعاء / قديم (YER Sana'a)
  - الريال السعودي (SAR)
  - التحويل يتم ديناميكياً لكافة المنتجات والفواتير فور تغيير العملة.
- **فلترة وتصنيف ذكي للمنتجات:** تبويبات لتصفح اشتراكات الذكاء الاصطناعي، الكورسات التعليمية، النقاط والرصيد، والباقات المجمعة.
- **دعم كامل 100% لكافة الأجهزة والهواتف الذكية (Mobile-First Responsive Design).**

---

### 💳 2. نظام الطلب والدفع الفوري (Quick 4-Step Checkout):
- **نافذة منبثقة تفاعلية ذكية (Glassmorphic Modal):**
  - **الخطوة 1:** بيانات العميل وتطبيق كوبونات الخصم مع حساب التخفيض تلقائياً.
  - **الخطوة 2:** اختيار طريقة الدفع المحلية أو الدولية (بنك الكريمي، محفظة جيب، بنك القطيبي، Binance USDT).
  - **الخطوة 3:** إرفاق إشعار التحويل المالي (رفع مباشر إلى سحابة Supabase Storage مع معاينة محلية).
  - **الخطوة 4:** التوجيه الذكي المباشر (Deep Linking) إلى قنوات الدعم (واتساب، تليجرام، إنستغرام) مع فاتورة نصية مهيأة ومنسقة بالكامل.

---

### 📊 3. لوحة تحكم إدارية متقدمة (`/dashboard`):
- **نظام حماية بالرمز السري (Admin PIN Lock Screen).**
- **محرك تنبيهات صوتية حية (Real-Time Web Audio Synthesizer):** أصوات مخصصة لكل قناة طلب واردة (واتساب، تليجرام، إنستغرام).
- **إدارة الطلبات والمبيعات:** جدول مباشر لجميع الطلبات الواردة مع إمكانية عرض إشعار السداد في نافذة عائمة وتصدير البيانات بتنسيق CSV متوافق مع Excel.
- **إدارة أسعار الصرف الحية:** تعديل أسعار الصرف ومزامنتها فوراً مع المتجر دون الحاجة لتحديث الصفحة.
- **إدارة كتالوج المنتجات (Product CRUD):** إضافة، تعديل، حذف، وإيقاف/تفعيل المنتجات لحظياً.
- **نظام إدارة الكوبونات والمسوقين (Coupons & Affiliates):** تتبع عدد مرات استخدام كل كود وإجمالي المبيعات المحققة.
- **إعدادات المتجر وبيانات الحسابات البنكية ومحافظ العملات الرقمية.**

---

### ⚡ 4. بنية السحابة والبيانات الحية (Supabase Realtime Cloud Backend):
- ربط كامل مع قاعدة بيانات **Supabase PostgreSQL**.
- اشتراكات حية (**PostgreSQL Realtime Channels**) لتحديث الأسعار والمنتجات والإعدادات عبر جميع شاشات المستخدمين لحظياً.
- تخزين سحابي لإشعارات السداد في باقة **Supabase Storage**.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Custom Glassmorphism, CSS Animations
- **Icons:** Lucide React
- **State Management:** Zustand
- **Database & Storage:** Supabase (PostgreSQL + Storage + Realtime)
- **Audio Engine:** Web Audio API Native Synthesizer

---

## 🚀 تشغيل المشروع محلياً (Getting Started)

### 1. استنساخ المستودع (Clone Repository):
```bash
git clone https://github.com/HelmiDevX/codora-ai-store.git
cd codora-ai-store
```

### 2. تثبيت الحزم (Install Dependencies):
```bash
npm install
```

### 3. إعداد المتغيرات البيئية (Environment Variables):
قم بإنشاء ملف `.env.local` في المجلد الرئيسي:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. تشغيل خادم التطوير (Run Development Server):
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🔒 لوحة التحكم الإدارية (Admin Dashboard)

- **الرابط:** `http://localhost:3000/dashboard`
- **رمز المرور الافتراضي (Default PIN):** `2026` (يمكن تغييره من تبويب الإعدادات).

---

## 📜 الحقوق والملكية الفكرية (Copyright & License)

- **فكرة وتصميم وتطوير:** **م/ حلمي أمين حسان (Eng. Helmi Amin Hassan)**
- **حساب جيت هب:** [@HelmiDevX](https://github.com/HelmiDevX)
- جميع الحقوق محفوظة © 2026 كودورا للذكاء الاصطناعي (Codora AI Store).

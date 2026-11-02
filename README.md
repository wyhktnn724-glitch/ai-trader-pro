# AI TRADER PRO

مخزن شامل نسخه Flutter برای ساخت APK اندروید و نسخه وب مستقل (PWA) است. نسخه Flutter از آرشیو `AI_TRADER_PRO_MOBILE_V2_2_FIXED.zip` در GitHub Actions استخراج و ساخته می‌شود؛ فایل‌های آن را برای تغییر workflow اندروید به ریشه منتقل نکنید.

## ساختار مخزن

- `.github/workflows/android-apk.yml` — ساخت و انتشار APK به‌عنوان Artifact؛ فایل و رفتار فعلی حفظ شده است.
- `.github/workflows/deploy-web.yml` — انتشار GitHub Pages با محتوای پوشه `web/`.
- `web/` — برنامه PWA، آیکون‌ها، مستندات و تست smoke محلی.
- `AI_TRADER_PRO_MOBILE_V2_2_FIXED.zip` — سورس Flutter که workflow اندروید استفاده می‌کند.
- `AI_TRADER_PRO_WEB_PWA.zip` — آرشیو اصلی PWA؛ فایل‌های اجرایی آن در `web/` ادغام شده‌اند.

## تست نسخه وب

با نصب بودن Node.js در ریشه مخزن اجرا کنید:

```sh
node --check web/app.js
node web/test-core.cjs web/app.js
```

## فعال‌سازی GitHub Pages

1. در GitHub، بخش **Settings → Pages** را باز کنید و **Build and deployment → Source** را روی **GitHub Actions** بگذارید.
2. پوش‌کردن تغییرات `web/**` یا `.github/workflows/deploy-web.yml` به شاخه `main`، انتشار را اجرا می‌کند؛ workflow را می‌توان از تب **Actions** نیز دستی اجرا کرد.
3. پس از موفقیت، سایت در `https://USERNAME.github.io/REPOSITORY/` در دسترس خواهد بود.

Workflow فایل‌های داخل `web/` را به‌عنوان ریشه سایت منتشر می‌کند. مسیرهای برنامه نسبی هستند و برای URLهای GitHub Pages با نام repository پشتیبانی دارند.

## کلیدهای API و محدودیت‌ها

هیچ کلید واقعی را در سورس یا commit قرار ندهید. نسخه PWA کلید Twelve Data را در `localStorage` همان مرورگر نگه می‌دارد؛ آن را فقط روی دستگاه شخصی وارد کنید. برنامه‌ها ابزار تحلیل هستند و سفارش معامله ارسال نمی‌کنند.
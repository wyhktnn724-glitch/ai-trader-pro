# AI TRADER PRO Web / PWA

نسخه وب قابل نصب روی صفحه اصلی iPhone از طریق Safari (Add to Home Screen).

## امکانات
- تحلیل EMA20/50، RSI، MACD، ATR/DI/ADX ساده‌شده، ساختار HH/HL، Bollinger و Engulfing
- نمودار کندلی canvas
- اسکنر نمادها
- بک‌تست آموزشی با هزینه تقریبی
- تاریخچه محلی در مرورگر
- PWA و cache فایل‌های رابط کاربری

## داده
- Crypto: Binance public klines API
- Forex/metals: Twelve Data؛ کلید API را در Settings وارد کنید. کلید در localStorage مرورگر ذخیره می‌شود و امنیت Keychain اپ native را ندارد.
- نیاز به اینترنت برای دریافت قیمت جدید. کش آفلاین فقط پوسته وب را نگه می‌دارد.

## انتشار رایگان GitHub Pages
1. در مخزن GitHub خود، ZIP را استخراج کنید و پوشه `web` را در ریشه مخزن آپلود کنید؛ به شکلی که `web/index.html` و `web/app.js` وجود داشته باشد.
2. پوشه `.github/workflows` را هم در ریشه مخزن ادغام کنید تا فایل `deploy-web.yml` در مسیر `.github/workflows/deploy-web.yml` قرار گیرد.
3. در GitHub → Settings → Pages، بخش Build and deployment را روی **GitHub Actions** قرار دهید.
4. از Actions، workflow **Deploy AI Trader Web App** را اجرا کنید (یا با push به main خودکار اجرا می‌شود).
5. بعد از Success، آدرس `https://USERNAME.github.io/REPOSITORY/` را در Safari آیفون باز کنید.
6. Share → Add to Home Screen → Add.

## محدودیت‌ها
- این نسخه وب‌اپ/PWA است، نه IPA/TestFlight و نه اپ بومی iOS.
- Signal strength امتیاز توافق قواعد است، نه احتمال برد.
- بک‌تست ساده و بدون مدل‌سازی کامل spread، liquidity، gaps، funding و اجرای درون‌کندلی است.
- Twelve Data API key در localStorage نگهداری می‌شود؛ از دستگاه مشترک استفاده نکنید.
- APIهای عمومی ممکن است محدودیت نرخ/CORS/دسترسی منطقه‌ای داشته باشند.
- برنامه سفارش معاملاتی ارسال نمی‌کند و قیمت‌ها ممکن است با بروکر تفاوت داشته باشند.

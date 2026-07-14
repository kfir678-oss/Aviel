# מבעד לעדשה - אביאל מלכא | אתר צלם אירועים

אתר תדמית ולידים עבור אביאל מלכא, צלם אירועים (בריתות, עלייה לתורה, ניו בורן, חלאקה, צילומי זוגיות ו-Save the date).

## מבנה
- `index.html` - האתר כולו (HTML + CSS + JS, קובץ יחיד, עברית RTL).
- `assets/img/` - הלוגו והתמונות מתיק העבודות (מותאמות לווב).
- `serve.mjs` - שרת פיתוח מקומי (`node serve.mjs` -> http://localhost:3100).
- `screenshot.mjs` - כלי צילום מסך לבדיקה (מבוסס puppeteer-core + Chrome מקומי).

## הרצה מקומית
```bash
node serve.mjs
# פתח http://localhost:3100
```

## תכונות
- SEO מלא: meta tags, Open Graph, Twitter Card, JSON-LD (LocalBusiness + Service).
- CTA מבוססי וואטסאפ + בר פעולה דביק במובייל.
- טופס יצירת קשר שנפתח ישירות בוואטסאפ עם פרטי הפנייה (ללא צורך בשרת).
- רספונסיבי, נגיש (focus states, prefers-reduced-motion), תמיכה מלאה ב-RTL.

## לפני עלייה לאוויר - לעדכן
1. **המלצות** בסקשן ההמלצות - להחליף בביקורות אמיתיות (מסומן בהערה ב-`index.html`).
2. **דומיין** - להחליף `aviel-malka.co.il` בכתובת האמיתית ב-`canonical` וב-`og:url`.
3. קישורי רשתות חברתיות בשדה `sameAs` שב-JSON-LD.

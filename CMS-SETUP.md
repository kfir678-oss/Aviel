# הפעלת ה-CMS - מדריך טכני (חד פעמי)

מסמך זה מיועד למי שמקים את המערכת, לא ללקוח. המדריך ללקוח: [מדריך-לאביאל.md](מדריך-לאביאל.md).

הארכיטקטורה:

```
src/_data/*.json   ← התוכן (מה שהלקוח עורך)
src/index.njk      ← התבנית (HTML + CSS, לא נגעים בה מהממשק)
src/assets/img/    ← התמונות (הלקוח מעלה לכאן דרך הממשק)
        ↓  npm run build (Eleventy + eleventy-img)
_site/             ← האתר הסטטי שמתפרסם ב-Vercel
admin/             ← ממשק Sveltia CMS (כתובת /admin באתר)
api/               ← שרת ההתחברות (OAuth), רץ כפונקציות serverless ב-Vercel
```

מחזור עריכה: הלקוח שומר ב-/admin → Sveltia עושה commit ל-GitHub → Vercel מזהה, בונה ומפרסם. כדקה מקצה לקצה.

הכל רץ על Vercel בלבד - אין תלות בספק נוסף.

---

## שלב 1 - חיבור הקונפיגורציה לדומיין

ב-[admin/config.yml](admin/config.yml), להחליף את השורה:

```yaml
  base_url: https://REPLACE-WITH-SITE-URL.vercel.app
```

בכתובת האתר בפועל (בלי לוכסן בסוף). זו גם כתובת שרת ההתחברות, כי הוא יושב באותו דומיין.

## שלב 2 - GitHub OAuth App

ליצור אפליקציה ב-https://github.com/settings/applications/new:

| שדה | ערך |
|---|---|
| Application name | `Aviel CMS` |
| Homepage URL | כתובת האתר |
| Authorization callback URL | `<כתובת האתר>/callback` |

לשמור את ה-**Client ID**, ולייצר **Client Secret**.

> אם בהמשך מחליפים לדומיין קבוע (`aviel-malka.co.il`), צריך לעדכן גם את ה-callback URL כאן וגם את `base_url` בשלב 1.

## שלב 3 - משתני סביבה ב-Vercel

בפרויקט ב-Vercel → **Settings** → **Environment Variables**:

| משתנה | ערך | חובה |
|---|---|---|
| `GITHUB_CLIENT_ID` | ה-Client ID משלב 2 | כן |
| `GITHUB_CLIENT_SECRET` | ה-Client Secret משלב 2 | כן |
| `ALLOWED_DOMAINS` | הדומיינים שמורשים להתחבר, למשל `aviel-malka.co.il, *.vercel.app` | לא |

בלי `ALLOWED_DOMAINS` מותר להתחבר רק מהדומיין שעליו הפונקציה עצמה רצה - וזו ברירת מחדל בטוחה. להגדיר אותו רק אם יש כמה דומיינים.

**חשוב:** אחרי הוספת משתני סביבה צריך deploy מחדש כדי שייכנסו לתוקף.

## שלב 4 - הרשאות ללקוח

1. הלקוח פותח חשבון GitHub חינמי (רק אימייל וסיסמה).
2. ב-repo → **Settings** → **Collaborators** → **Add people** → להזמין אותו עם הרשאת **Write**.
3. הוא מאשר את ההזמנה במייל.

בלי השלב הזה הוא יוכל להתחבר לממשק אבל לא לשמור.

## שלב 5 - Vercel

[vercel.json](vercel.json) כבר מגדיר הכל (`npm run build` → `_site`, ו-rewrites מ-`/auth` ו-`/callback` לפונקציות). בפרויקט ב-Vercel רק לוודא:

- Framework Preset: `Other` (או Eleventy)
- Build Command / Output Directory: מגיעים מ-vercel.json - לא לדרוס ידנית
- Node.js Version: 20 ומעלה

לאחר ה-push הראשון, האתר יעלה אוטומטית ו-/admin יהיה זמין.

## בדיקה שהכל עובד

1. לגלוש ל-`<כתובת האתר>/admin` - אמור להופיע מסך התחברות.
2. ללחוץ **Sign in with GitHub** - נפתח פופאפ שמפנה ל-GitHub.
3. לאשר - הפופאפ נסגר וממשק העריכה נטען.

תקלות נפוצות:

| מה קורה | הסיבה |
|---|---|
| הפופאפ מציג שגיאת 404 | ה-rewrites לא נטענו - לוודא deploy אחרי הוספת `vercel.json` |
| `MISCONFIGURED_CLIENT` | משתני הסביבה לא הוגדרו או שלא היה deploy אחריהם |
| `UNSUPPORTED_DOMAIN` | `ALLOWED_DOMAINS` לא כולל את הדומיין שממנו מתחברים |
| `CSRF_DETECTED` | ה-callback URL ב-GitHub לא תואם לדומיין שממנו התחילה ההתחברות |
| מתחבר אבל שמירה נכשלת | הלקוח לא collaborator עם הרשאת Write (שלב 4) |

---

## פיתוח מקומי

```bash
npm install
npm run dev      # http://localhost:3100 - בונה מחדש בכל שינוי
npm run build    # בנייה חד פעמית לתיקיית _site
```

`/admin` לא יעבוד מקומית מול backend של GitHub בלי הגדרות נוספות - לבדוק אותו על האתר החי.

## נקודות תחזוקה

- **הוספת שדה חדש לעריכה**: מוסיפים אותו גם ל-`src/_data/<קובץ>.json`, גם ל-`admin/config.yml` וגם ל-`src/index.njk`. שלושתם חייבים להסכים.
- **אופטימיזציית תמונות** רצה אוטומטית ב-build דרך `eleventyImageTransformPlugin`: כל `<img>` ב-HTML מומר ל-WebP בארבעה רוחבים עם `srcset`. תמונה כבדה שמועלית מה-CMS מטופלת מעצמה, כך שהאתר לא נפגע.
  - הפלאגין מוסיף `width`/`height` לכל תמונה (מונע קפיצת פריסה). לכן חובה שיישאר `img{height:auto}` ב-CSS - בלעדיו התמונות נמתחות.
  - התמונות המקוריות עדיין מועתקות ל-`_site` כי `og:image`, הלוגו והפאביקון מוגשים מהן ישירות.
  - הלוגו מסומן `eleventy:ignore` - אין טעם לעבד PNG של 46 פיקסלים.
- **אין תהליך אישור** (`publish_mode: simple`) - כל שמירה עולה ישר לאוויר. אם רוצים בקרה, אפשר לעבור ל-editorial workflow.

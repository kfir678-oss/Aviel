// עזרים משותפים לשתי פונקציות ההתחברות.

/**
 * מחזיר דף HTML שמעביר את התוצאה חזרה לחלון של ה-CMS שפתח את הפופאפ.
 * מבנה ההודעה מוכתב על ידי Sveltia/Decap CMS ואסור לשנות אותו.
 */
const outputHTML = (res, { provider = 'unknown', token, error, errorCode }) => {
  const state = error ? 'error' : 'success';
  const content = error ? { provider, error, errorCode } : { provider, token };

  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  // מחיקת עוגיית ה-CSRF - סיימה את תפקידה
  res.setHeader('Set-Cookie', 'csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure');
  res.status(200).send(
    `<!doctype html><html><body><script>
      (() => {
        window.addEventListener('message', ({ data, origin }) => {
          if (data === 'authorizing:${provider}') {
            window.opener?.postMessage(
              'authorization:${provider}:${state}:${JSON.stringify(content)}',
              origin
            );
          }
        });
        window.opener?.postMessage('authorizing:${provider}', '*');
      })();
    </script></body></html>`,
  );
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * בודק שהאתר שמבקש להתחבר מורשה.
 * ברירת המחדל: רק הדומיין שעליו הפונקציה עצמה רצה.
 * אפשר להרחיב עם משתנה הסביבה ALLOWED_DOMAINS (רשימה מופרדת בפסיקים, תומך ב-*).
 */
const isAllowedDomain = (domain, req) => {
  const list = process.env.ALLOWED_DOMAINS || req.headers.host || '';

  return list
    .split(',')
    .some((entry) =>
      new RegExp(`^${escapeRegExp(entry.trim()).replace('\\*', '.+')}$`).test(domain ?? ''),
    );
};

module.exports = { outputHTML, isAllowedDomain };

// שלב 1 בהתחברות: הפניה ל-GitHub כדי שהמשתמש יאשר.
// מחליף את Cloudflare Worker - רץ כפונקציית serverless על Vercel, באותו דומיין של האתר.
// המימוש תואם לפרוטוקול של Netlify/Decap/Sveltia CMS.
const { randomUUID } = require('node:crypto');

const { outputHTML, isAllowedDomain } = require('./_lib.js');

module.exports = (req, res) => {
  const { provider = 'github', site_id: domain } = req.query || {};

  if (provider !== 'github') {
    return outputHTML(res, {
      error: 'Your Git backend is not supported by the authenticator.',
      errorCode: 'UNSUPPORTED_BACKEND',
    });
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return outputHTML(res, {
      provider,
      error: 'OAuth app client ID or secret is not configured.',
      errorCode: 'MISCONFIGURED_CLIENT',
    });
  }

  if (!isAllowedDomain(domain, req)) {
    return outputHTML(res, {
      provider,
      error: 'Your domain is not allowed to use the authenticator.',
      errorCode: 'UNSUPPORTED_DOMAIN',
    });
  }

  // מחרוזת אקראית להגנה מפני CSRF - נשמרת בעוגייה ומושווית בחזרה
  const csrfToken = randomUUID().replaceAll('-', '');

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'repo,user',
    state: csrfToken,
  });

  res.setHeader(
    'Set-Cookie',
    `csrf-token=${provider}_${csrfToken}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
  );
  res.setHeader('Location', `https://github.com/login/oauth/authorize?${params}`);
  res.status(302).end();
};

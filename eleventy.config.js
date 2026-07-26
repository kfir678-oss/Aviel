module.exports = async function (eleventyConfig) {
  const { eleventyImageTransformPlugin } = await import('@11ty/eleventy-img');

  // דחיסה אוטומטית של כל תמונה באתר.
  // הפלאגין סורק את ה-HTML הסופי, מייצר גרסאות WebP בכמה רוחבים
  // ומחליף את ה-src ב-srcset. תמונה כבדה שמועלית מה-CMS מטופלת מעצמה.
  // פורמט יחיד (webp) = תגית <img> רגילה במקום <picture>, כדי לא לשנות מבנה DOM.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['webp'],
    widths: [400, 800, 1200, 1600, 'auto'],
    urlPath: '/assets/img/optimized/',
    htmlOptions: {
      imgAttributes: { decoding: 'async' },
    },
    sharpWebpOptions: { quality: 82 },
  });

  // תמונות + ממשק הניהול מועתקים כמו שהם לתיקיית הבנייה
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy({ admin: 'admin' });

  // בנייה מחדש בזמן פיתוח כשמשנים תוכן או תמונות
  eleventyConfig.addWatchTarget('./admin/');

  return {
    dir: {
      input: 'src',
      output: '_site',
      data: '_data',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};

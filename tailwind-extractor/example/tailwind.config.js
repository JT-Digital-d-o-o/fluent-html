const fluentHtmlExtractor = require('fluent-html-tailwind-extractor');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './src/**/*.{ts,tsx,js,jsx}',
      './views/**/*.{ts,tsx,js,jsx}',
      './pages/**/*.{ts,tsx,js,jsx}',
    ],
    extract: {
      // Use the fluent-html extractor for TypeScript/JavaScript files
      ts: fluentHtmlExtractor,
      tsx: fluentHtmlExtractor,
      js: fluentHtmlExtractor,
      jsx: fluentHtmlExtractor,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

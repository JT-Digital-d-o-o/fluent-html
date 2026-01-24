const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './src/**/*.{ts,tsx,js,jsx}',
      './views/**/*.{ts,tsx,js,jsx}',
      './pages/**/*.{ts,tsx,js,jsx}',
    ],
    extract: {
      // Use the lambda.html extractor for TypeScript/JavaScript files
      ts: lambdaHtmlExtractor,
      tsx: lambdaHtmlExtractor,
      js: lambdaHtmlExtractor,
      jsx: lambdaHtmlExtractor,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

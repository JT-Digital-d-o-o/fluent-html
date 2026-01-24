// ESM example for lambda-html with Tailwind
import lambdaHtmlExtractor from 'lambda-html-tailwind-extractor';

/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./src/**/*.{ts,tsx,js,jsx}",
      "./src/views/**/*.ts",
      "./src/controllers/**/*.ts",
      "./public/**/*.html"
    ],
    extract: {
      // Add the lambda-html extractor for TypeScript files
      ts: lambdaHtmlExtractor,
      tsx: lambdaHtmlExtractor,
      js: lambdaHtmlExtractor,
      jsx: lambdaHtmlExtractor,
    },
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#82C350',
          // Add other shades if needed
        },
      },
    },
  },
  plugins: [],
};

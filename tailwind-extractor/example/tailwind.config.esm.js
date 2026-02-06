// ESM example for fluent-html with Tailwind
import fluentHtmlExtractor from 'fluent-html-tailwind-extractor';

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
      // Add the fluent-html extractor for TypeScript files
      ts: fluentHtmlExtractor,
      tsx: fluentHtmlExtractor,
      js: fluentHtmlExtractor,
      jsx: fluentHtmlExtractor,
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

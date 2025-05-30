/** @type {import('tailwindcss').Config} */
module.exports = {
  // sertakan index.html di root, dan semua file src
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
};

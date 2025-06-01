/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
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
  variants: {
    extend: {
      backgroundColor: ['dark', 'hover'],
      borderColor: ['dark', 'hover'],
    },
  },
  plugins: [],
};

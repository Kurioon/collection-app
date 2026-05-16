/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Дозволяє перемикати темну тему через клас на тегу <html>
  theme: {
    extend: {
      // Tailwind вже має вбудовану палітру emerald, ми будемо використовувати класи типу text-emerald-500
    },
  },
  plugins: [],
}
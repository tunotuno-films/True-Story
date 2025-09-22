/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xl_custom': '1000px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
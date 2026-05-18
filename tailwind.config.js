/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#1a0d09',
          900: '#23110b',
          850: '#31180f',
          800: '#472316',
          700: '#66331f',
        },
        pulse: {
          cyan: '#f97316',
          rose: '#ef4444',
          amber: '#f59e0b',
          lime: '#fb923c',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(44, 18, 8, 0.36)',
      },
    },
  },
  plugins: [],
};

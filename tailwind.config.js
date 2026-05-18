/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06070a',
          900: '#0b0d12',
          850: '#11141b',
          800: '#171b23',
          700: '#222836',
        },
        pulse: {
          cyan: '#33e0d3',
          rose: '#ff4f86',
          amber: '#ffb84d',
          lime: '#a8ff60',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(0, 0, 0, 0.28)',
      },
    },
  },
  plugins: [],
};

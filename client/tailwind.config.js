/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '375px',  // iPhone SE and up
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#6F4E37',
        secondary: '#C4A484',
        accent: '#D4A373',
        background: '#FFF8F0',
        dark: '#2D1B14',
        'primary-light': '#8B6555',
        'primary-dark': '#5A3E2B',
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      aspectRatio: {
        square: '1 / 1',
      },
    },
  },
  plugins: [],
};

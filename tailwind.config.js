/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF5F7',
          100: '#FFE4EA',
          200: '#FFC7D4',
          300: '#FFA3B8',
          400: '#FF7A9A',
          500: '#F0537D',
          600: '#E03A6B',
          700: '#B8325A',
        },
        cream: '#FFF8EE',
        milk: '#FFFDF9',
        leaf: '#9DBF9E',
        ink: '#5A2A3C',
        'ink-soft': '#8A5A6B',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        sticker: '28px',
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(240, 83, 125, 0.25)',
        'soft-lg': '0 12px 40px -10px rgba(240, 83, 125, 0.30)',
        sticker: '0 6px 20px -6px rgba(184, 50, 90, 0.22), 0 2px 8px -2px rgba(184, 50, 90, 0.15)',
      },
    },
  },
  plugins: [],
};

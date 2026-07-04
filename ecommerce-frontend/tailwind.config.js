/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files for class names so it knows which CSS to generate.
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // The Marlowe design palette. Use these as classes, e.g. `bg-accent`, `text-ink`.
      colors: {
        accent: {
          DEFAULT: '#0F6B3F', // forest green — primary buttons, links
          dark: '#0A5230', // hover state for green buttons
          tint: '#EAF3ED', // soft green background
        },
        ink: '#131614', // near-black text and dark buttons
        muted: '#5B615C', // secondary body text
        fog: '#8A8F89', // meta text, captions
        mist: '#A8ACA6', // lightest text, struck-through prices
        paper: '#E4E1D9', // warm page background
        cream: '#F7F5EF', // section / hero background
        line: '#E7E4DD', // default borders
        line2: '#EDEAE2', // lighter card borders
        line3: '#D9D5CB', // input borders
        star: '#E0A020', // rating stars (gold)
        sale: {
          DEFAULT: '#B4472B', // sale/rust accent
          bg: '#FBEDE8', // sale badge background
        },
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'], // headings
        body: ['"Hanken Grotesk"', 'sans-serif'], // body copy
      },
      boxShadow: {
        card: '0 24px 60px -30px rgba(20,22,20,.28)',
        hover: '0 18px 44px -26px rgba(20,22,20,.5)',
        float: '0 12px 30px -14px rgba(20,22,20,.4)',
      },
      keyframes: {
        shine: { to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        shine: 'shine 1.4s infinite',
      },
    },
  },
  plugins: [],
};

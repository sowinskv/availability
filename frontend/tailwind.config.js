/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom Notion-inspired palette
        notion: {
          bg: {
            light: '#ffffff',
            dark: '#191919',
          },
          sidebar: {
            light: '#f7f6f3',
            dark: '#252525',
          },
          text: {
            primary: {
              light: '#37352f',
              dark: '#e6e6e5',
            },
            secondary: {
              light: '#787774',
              dark: '#9b9a97',
            },
            tertiary: {
              light: '#9b9a97',
              dark: '#6f6e69',
            },
          },
          border: {
            light: '#e9e9e7',
            dark: '#373737',
          },
          hover: {
            light: '#f1f1ef',
            dark: '#2f2f2f',
          },
          active: {
            light: '#e9e9e7',
            dark: '#383838',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

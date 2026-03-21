/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-gray': '#8E8E93',
        'ios-bg': '#F2F2F7',
        'ios-card': 'rgba(255, 255, 255, 0.8)',
        'background-light': '#F2F2F7',
        'background-dark': '#1C1C1E',
        primary: '#007AFF',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Public Sans', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

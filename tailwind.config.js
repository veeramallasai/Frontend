/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#66BB6A',
          dark: '#1B5E20',
          50: '#F1F8F5',
          100: '#E1F0E7',
          200: '#C2E1CE',
          300: '#97CCAA',
          400: '#64B07E',
          500: '#2E7D32',
          600: '#236126',
          700: '#1B4A1D',
          800: '#143616',
          900: '#0E2410',
        },
        secondary: {
          DEFAULT: '#66BB6A',
          light: '#81C784',
          dark: '#388E3C',
        },
        accent: {
          DEFAULT: '#81C784',
          light: '#A5D6A7',
          dark: '#4CAF50',
        },
        skyBlue: {
          DEFAULT: '#4FC3F7',
          light: '#E1F5FE',
          dark: '#0288D1',
        },
        customBg: '#F8FAFC',
        customCard: '#FFFFFF',
        customText: '#1E293B',
        customMuted: '#64748B',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

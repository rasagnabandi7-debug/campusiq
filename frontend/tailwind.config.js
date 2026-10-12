/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          navy: '#0F172A',     // Slate 900
          dark: '#1E293B',     // Slate 800
          surface: '#F8FAFC',  // Slate 50
          card: '#FFFFFF',
          border: '#E2E8F0',   // Slate 200
          blue: '#2563EB',     // Royal Blue
          indigo: '#4F46E5',   // Indigo
          teal: '#0D9488',     // Teal 600 - Positive
          amber: '#D97706',    // Amber 600 - Warning
          rose: '#E11D48',     // Rose 600 - High Risk
          purple: '#7C3AED',   // Purple 600
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

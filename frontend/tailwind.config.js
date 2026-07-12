/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        environmental: {
          light: '#34d399', // emerald-400
          DEFAULT: '#10b981', // emerald-500
          dark: '#059669', // emerald-600
        },
        social: {
          light: '#818cf8', // indigo-400
          DEFAULT: '#6366f1', // indigo-500
          dark: '#4f46e5', // indigo-600
        },
        governance: {
          light: '#fbbf24', // amber-400
          DEFAULT: '#f59e0b', // amber-500
          dark: '#d97706', // amber-600
          slate: '#475569', // slate-600
        },
        gamification: {
          light: '#a78bfa', // violet-400
          DEFAULT: '#8b5cf6', // violet-500
          dark: '#7c3aed', // violet-600
          gold: '#f59e0b', // amber-500
          amber: '#fbbf24',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)' },
          '50%': { opacity: '.6', transform: 'scale(0.98)', boxShadow: '0 0 5px rgba(239, 68, 68, 0.2)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        }
      }
    },
  },
  plugins: [],
}

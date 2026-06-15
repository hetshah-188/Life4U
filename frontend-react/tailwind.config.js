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
          DEFAULT: '#FF3366',
          dark: '#E61E4D',
          light: '#FF6B8B',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          light: '#9F67FF',
        },
        accent: '#FFB347',
        dark: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF3366, #FF6B8B)',
        'gradient-1': 'linear-gradient(135deg, #FF3366, #FF6B8B, #FFB347)',
        'gradient-2': 'linear-gradient(135deg, #7C3AED, #9F67FF, #B794F4)',
        'gradient-3': 'linear-gradient(135deg, #10B981, #34D399, #6EE7B7)',
        'gradient-4': 'linear-gradient(135deg, #F59E0B, #FBBF24, #FCD34D)',
      },
      borderRadius: {
        'sm': '12px',
        'md': '20px',
        'lg': '30px',
        'xl': '40px',
        '2xl': '50px',
      },
      boxShadow: {
        'sm': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'md': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'lg': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        'xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
        'hover': '0 30px 60px -15px rgba(255,51,102,0.3)',
      },
      animation: {
        'pulse-banner': 'pulse-banner 2s infinite',
        'shake': 'shake 1s infinite',
        'drop': 'drop 3s infinite',
        'float-particle': 'float-particle 15s infinite linear',
        'fadeInLeft': 'fadeInLeft 1s ease',
        'fadeInRight': 'fadeInRight 1s ease',
        'float': 'float 4s ease-in-out infinite',
        'ticker': 'ticker 40s linear infinite',
        'pulse-live': 'pulse-live 1.5s infinite',
        'heartbeat': 'heartbeat 3s infinite',
        'pulse-step': 'pulse-step 2s infinite',
        'float-cta': 'float-cta 8s infinite',
        'pulse-emergency': 'pulse-emergency 2s infinite',
      },
      keyframes: {
        'pulse-banner': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.95 },
        },
        'shake': {
          '0%, 100%': { transform: rotate('0deg') },
          '25%': { transform: rotate('10deg') },
          '75%': { transform: rotate('-10deg') },
        },
        'drop': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'float-particle': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)' },
        },
        'fadeInLeft': {
          from: { opacity: 0, transform: 'translateX(-50px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        'fadeInRight': {
          from: { opacity: 0, transform: 'translateX(50px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-live': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.5)', opacity: 0.5 },
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1) rotate(15deg)' },
          '50%': { transform: 'scale(1.1) rotate(15deg)' },
        },
        'pulse-step': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(1.2)', opacity: 0.1 },
        },
        'float-cta': {
          '0%, 100%': { transform: 'translateY(0) rotate(15deg)' },
          '50%': { transform: 'translateY(-30px) rotate(15deg)' },
        },
        'pulse-emergency': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0e17',
          soft: '#2a2a3d',
        },
        paper: {
          DEFAULT: '#fffffe',
          warm: '#f8f4ef',
        },
        accent: {
          DEFAULT: '#ff6b35',
          soft: '#ff8c5a',
          glow: 'rgba(255,107,53,0.18)',
        },
        muted: '#a7a9be',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,53,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,107,53,0.15)' },
        },
        'typing': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'avatar-bounce': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'typing': 'typing 1.2s infinite ease-in-out',
        'slide-in-right': 'slide-in-right 0.35s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.35s ease-out forwards',
        'avatar-bounce': 'avatar-bounce 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config

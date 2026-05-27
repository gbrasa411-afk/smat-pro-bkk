import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        kemenkes: {
          DEFAULT: '#00916E',
          dark: '#007A5C',
          light: '#00B386',
          50: '#E8F5F0',
          100: '#C5EAE0',
          200: '#8ED5C1',
          300: '#57C0A2',
          400: '#20AB83',
          500: '#00916E',
          600: '#007A5C',
          700: '#006249',
          800: '#004B37',
          900: '#003325',
        },
        surface: {
          primary: '#F5F7FA',
          card: '#FFFFFF',
          elevated: '#E8ECF1',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-top': 'slideInTop 0.3s ease-out forwards',
        'slide-out-top': 'slideOutTop 0.3s ease-in forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 145, 110, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(0, 145, 110, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInTop: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideOutTop: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-100%)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 145, 110, 0.2)',
        'glow-lg': '0 0 40px rgba(0, 145, 110, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;

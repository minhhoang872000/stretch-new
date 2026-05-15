import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Config>{
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2A4A',
          soft: '#1F3F66',
          light: '#2A5080',
          50: '#EBF0F5',
          100: '#D1DEEB',
          200: '#A3BDD7',
          300: '#759CC3',
          400: '#477BAF',
          500: '#1F3F66',
          600: '#0B2A4A',
          700: '#091F38',
          800: '#061526',
          900: '#030A13',
        },
        accent: {
          DEFAULT: '#F47A1F',
          light: '#F89B52',
          dark: '#D96A15',
          50: '#FEF3EB',
          100: '#FDE7D7',
          200: '#FBCFAF',
          300: '#F9B787',
          400: '#F89B52',
          500: '#F47A1F',
          600: '#D96A15',
          700: '#A4500F',
          800: '#6F360A',
          900: '#3A1C05',
        },
        'off-white': '#F7F9FB',
        'border-default': '#E6ECF2',
        'text-primary': '#0F1720',
        'text-secondary': '#6B7C8F',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        'h1': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'h1-mobile': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'h2-mobile': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '22px', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '18px', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 30px -4px rgba(11, 42, 74, 0.12)',
        'elevated': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
        'float': '0 8px 32px rgba(11, 42, 74, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

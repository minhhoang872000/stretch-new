/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        error: '#ba1a1a',
        'on-surface': '#191c1c',
        'surface-container-highest': '#e1e3e2',
        'secondary-fixed-dim': '#b1ccc7',
        'inverse-on-surface': '#eff1f0',
        'inverse-primary': '#88d5c4',
        'tertiary-fixed': '#ffdcc1',
        'on-tertiary': '#ffffff',
        'on-primary-container': '#d5fff4',
        'primary-fixed-dim': '#88d5c4',
        'on-secondary': '#ffffff',
        outline: '#6f7976',
        'on-surface-variant': '#3f4946',
        'on-background': '#191c1c',
        secondary: '#4a635f',
        'tertiary-container': '#9e632a',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e6e9e8',
        'on-secondary-container': '#4e6763',
        'on-primary': '#ffffff',
        'surface-tint': '#126a5d',
        primary: '#036457',
        'secondary-fixed': '#cde8e3',
        'primary-fixed': '#a4f1e0',
        'surface-container': '#eceeed',
        'on-tertiary-container': '#fff4ee',
        'on-primary-fixed': '#00201b',
        'surface-variant': '#e1e3e2',
        'inverse-surface': '#2e3131',
        surface: '#f8faf9',
        'primary-container': '#2d7d6f',
        'on-primary-fixed-variant': '#005045',
        'surface-container-low': '#f2f4f3',
        'on-secondary-fixed-variant': '#334b48',
        'error-container': '#ffdad6',
        'surface-dim': '#d8dada',
        'outline-variant': '#bec9c5',
        'surface-bright': '#f8faf9',
        'on-error': '#ffffff',
        background: '#f8faf9',
        'on-error-container': '#93000a',
        tertiary: '#814b13',
        'secondary-container': '#cae5e0',
        'on-tertiary-fixed': '#2e1500',
        'on-secondary-fixed': '#061f1d'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
}

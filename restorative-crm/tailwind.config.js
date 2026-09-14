/** @type {import('tailwindcss').Config} */

/**
 * Design tokens — Stretch Admin console.
 *
 * One accent (teal), one gray family (all neutrals carry the same cool-green
 * hue so nothing reads as "borrowed from another palette"), and four semantic
 * status tones that are desaturated enough to sit next to each other in a
 * table without shouting.
 *
 * The Material-3 style names (`surface`, `on-surface`, `outline-variant`, …)
 * are kept because the older screens are written against them — they now
 * resolve to the ramp below instead of the old mixed-hue values, so restyling
 * the shell shifts every legacy screen with it.
 */

const ink = {
  DEFAULT: '#101a18', // body text — off-black, never pure #000
  2: '#46534f',       // secondary text
  3: '#7c8b86',       // meta / muted
  4: '#a3aeaa',       // disabled
}

const line = {
  DEFAULT: '#e3e8e6',
  soft: '#edf1f0',
  strong: '#cfd8d5',
}

const accent = {
  DEFAULT: '#036457',
  ink: '#024a40',   // hover / pressed
  soft: '#e6f1ee',  // tint surface
  line: '#b9d5cd',
}

const status = {
  ok: { DEFAULT: '#2e6b45', soft: '#e8f1ea', line: '#bcd8c5' },
  warn: { DEFAULT: '#8a5a11', soft: '#fbf1de', line: '#e6d3ac' },
  danger: { DEFAULT: '#a32a21', soft: '#fbe9e7', line: '#e8c1bc' },
  info: { DEFAULT: '#1f5c8b', soft: '#e6eff6', line: '#bcd2e4' },
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        // ── New semantic layer (use these in new code) ──
        canvas: '#f4f6f5',
        panel: '#ffffff',
        'panel-2': '#f8faf9',
        'panel-3': '#f1f4f3',
        ink,
        line,
        accent,
        ok: status.ok,
        warn: status.warn,
        danger: status.danger,
        info: status.info,

        // ── Legacy M3 names, remapped onto the ramp above ──
        primary: accent.DEFAULT,
        'on-primary': '#ffffff',
        'primary-container': '#2d7d6f',
        'on-primary-container': '#d5fff4',
        'primary-fixed': accent.soft,
        'primary-fixed-dim': accent.line,
        'on-primary-fixed': '#00201b',
        'on-primary-fixed-variant': accent.ink,
        'surface-tint': accent.DEFAULT,

        secondary: '#4a635f',
        'on-secondary': '#ffffff',
        'secondary-container': '#cae5e0',
        'on-secondary-container': '#334845',
        'secondary-fixed': '#dce9e6',
        'secondary-fixed-dim': '#b1ccc7',
        'on-secondary-fixed': '#061f1d',
        'on-secondary-fixed-variant': '#334b48',

        tertiary: status.warn.DEFAULT,
        'on-tertiary': '#ffffff',
        'tertiary-container': status.warn.DEFAULT,
        'on-tertiary-container': status.warn.soft,
        'tertiary-fixed': status.warn.soft,
        'on-tertiary-fixed': '#2e1500',

        error: status.danger.DEFAULT,
        'on-error': '#ffffff',
        'error-container': status.danger.soft,
        'on-error-container': '#7a1c15',

        background: '#f4f6f5',
        'on-background': ink.DEFAULT,
        surface: '#f4f6f5',
        'on-surface': ink.DEFAULT,
        'on-surface-variant': ink[2],
        'surface-variant': '#e3e8e6',
        'surface-bright': '#ffffff',
        'surface-dim': '#dde3e1',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8faf9',
        'surface-container': '#f1f4f3',
        'surface-container-high': '#e9edec',
        'surface-container-highest': '#e3e8e6',
        'inverse-surface': '#1d2624',
        'inverse-on-surface': '#eff1f0',
        'inverse-primary': '#88d5c4',
        outline: ink[3],
        'outline-variant': line.strong,
      },

      // Varied radii: tighter inside, softer on containers. No pill containers.
      borderRadius: {
        DEFAULT: '0.375rem', // 6px  — chips, badges, inputs-in-table
        md: '0.5rem',        // 8px  — buttons, inputs
        lg: '0.625rem',      // 10px — inner panels
        xl: '0.875rem',      // 14px — cards
        '2xl': '1rem',       // 16px — page-level panels
        full: '9999px',      // avatars only
      },

      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        label: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px labels
      },

      // Tinted shadows — they carry the canvas hue instead of neutral black.
      boxShadow: {
        xs: '0 1px 2px rgba(16, 42, 38, 0.05)',
        sm: '0 1px 3px rgba(16, 42, 38, 0.07)',
        card: '0 1px 2px rgba(16, 42, 38, 0.04), 0 8px 24px -18px rgba(16, 42, 38, 0.18)',
        pop: '0 12px 32px -12px rgba(16, 42, 38, 0.22), 0 2px 8px rgba(16, 42, 38, 0.06)',
        rail: '1px 0 0 rgba(16, 42, 38, 0.06)',
      },

      // Dense dashboard scale — 4px base, useful mid steps for table rows.
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
        68: '17rem',
      },

      zIndex: {
        rail: '40',
        bar: '30',
        pop: '50',
        overlay: '60',
        palette: '70',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
}

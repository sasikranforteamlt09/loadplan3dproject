/** ระบบออกแบบ: สีประจำระบบ กรมท่า #1f3c58 และส้ม #f59e0b */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f6fa', 100: '#e3ebf3', 200: '#c4d3e2', 300: '#9db4cb',
          400: '#6d8cab', 500: '#456a8d', 600: '#2f5278', 700: '#1f3c58',
          800: '#17304a', 900: '#0f2236', 950: '#0a1827',
        },
        brand: {
          50: '#fff8ed', 100: '#fef0d6', 200: '#fcdcac', 300: '#fac278',
          400: '#f8a23f', 500: '#f59e0b', 600: '#d97e06', 700: '#b45c09',
          800: '#92480e', 900: '#783c0f',
        },
        ink: '#0f172a',
        muted: '#475569',
        line: '#cbd5e1',
        'line-strong': '#94a3b8',
        surface: '#f8fafc',
        ok: '#047857',
        'ok-bg': '#ecfdf5',
        danger: '#b91c1c',
        'danger-bg': '#fef2f2',
        warn: '#b45309',
        'warn-bg': '#fef3c7',
      },
      fontFamily: {
        // ไม่ใช้เว็บฟอนต์ เพื่อให้เปิดได้เร็วบนเครือข่ายมือถือที่ช้า
        sans: ['"Noto Sans Thai"', '"Sarabun"', '"IBM Plex Sans Thai"', '"Leelawadee UI"',
               '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: { xl2: '14px', card: '16px', ctl: '12px' },
      fontSize: {
        metric: ['32px', { lineHeight: '36px', fontWeight: '700' }],
        'metric-sm': ['24px', { lineHeight: '30px', fontWeight: '700' }],
        cta: ['18px', { lineHeight: '26px', fontWeight: '700' }],
      },
      borderWidth: { 1.5: '1.5px' },
      boxShadow: {
        card: 'none',
        bar: '0 -4px 20px -2px rgba(15,23,42,.14)',
        pop: '0 6px 18px rgba(245,158,11,.28)',
      },
      spacing: { touch: '44px', cta: '52px', bar: '84px' },
    },
  },
  plugins: [],
};

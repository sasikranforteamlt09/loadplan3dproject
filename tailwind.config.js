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
        ink: '#16202b',
        muted: '#5b6d80',
        line: '#e3e8ee',
        surface: '#f6f8fb',
        ok: '#3f8a56',
        danger: '#b4553f',
      },
      fontFamily: {
        // ไม่ใช้เว็บฟอนต์ เพื่อให้เปิดได้เร็วบนเครือข่ายมือถือที่ช้า
        sans: ['"Noto Sans Thai"', '"Sarabun"', '"IBM Plex Sans Thai"', '"Leelawadee UI"',
               '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: { xl2: '14px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,32,48,.05)',
        pop: '0 10px 30px rgba(245,158,11,.30)',
      },
      spacing: { touch: '44px' },
    },
  },
  plugins: [],
};

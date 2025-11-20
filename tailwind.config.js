/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    'bg-hero-pattern',
    'bg-final-pattern'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        gradientStart: '#6366f1',
        gradientEnd: '#06b6d4',
      },
      backgroundImage: {
        // Legacy kept for compatibility
        'hero-pattern': "linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)),url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 600\"><rect fill=\"%236366f1\" width=\"1200\" height=\"600\"/><path fill=\"%234f46e5\" opacity=\"0.3\" d=\"M0 400 Q300 350 600 400 T1200 400 V600 H0 Z\"/></svg>')",
        // New light / dark variants
        'hero-pattern-light': "linear-gradient(rgba(255,255,255,.65),rgba(255,255,255,.2)),url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 600\"><rect fill=\"%23eef2ff\" width=\"1200\" height=\"600\"/><path fill=\"%236366f1\" opacity=\"0.35\" d=\"M0 420 Q300 360 600 420 T1200 420 V600 H0 Z\"/></svg>')",
        'hero-pattern-dark': "linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.45)),url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 600\"><rect fill=\"%2318273a\" width=\"1200\" height=\"600\"/><path fill=\"%234f46e5\" opacity=\"0.4\" d=\"M0 400 Q300 350 600 400 T1200 400 V600 H0 Z\"/></svg>')",
        'final-pattern': "linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1200 400\\"><rect fill=\\"%236366f1\\" width=\\"1200\\" height=\\"400\\"/><circle cx=\\"200\\" cy=\\"150\\" r=\\"80\\" fill=\\"%2306b6d4\\" opacity=\\"0.3\\"/><circle cx=\\"900\\" cy=\\"250\\" r=\\"100\\" fill=\\"%234f46e5\\" opacity=\\"0.3\\"/></svg>')",
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.15)',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

/**
 * Okoshko design tokens: light theme, soft rounded corners,
 * single warm-coral accent, Inter typography.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF4F1',
          100: '#FFE7DF',
          200: '#FECFC0',
          300: '#FDB09A',
          400: '#FB9070',
          500: '#F0705A',
          600: '#DE5440',
          700: '#BC4131',
          800: '#9B3629',
          900: '#7F2F24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(43, 26, 20, 0.08)',
        card: '0 2px 12px rgba(43, 26, 20, 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC143C',
          dark: '#A30D2A',
          light: '#FCE4E9'
        },
        success: {
          DEFAULT: '#16A34A',
          dark: '#0F7A37',
          light: '#DCFCE7',
          surface: '#DCFCE7'
        },
        warning: {
          DEFAULT: '#D97706',
          dark: '#9A5A05',
          light: '#FEF3C7'
        },
        surface: {
          DEFAULT: '#FAFAFA',
          card: '#FFFFFF',
          border: '#E5E7EB'
        },
        text: {
          DEFAULT: '#111827',
          muted: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif']
      },
      borderRadius: {
        card: '12px'
      },
      boxShadow: {
        card: '0 4px 20px -2px rgb(0 0 0 / 0.06)',
        cardHover: '0 8px 30px -4px rgb(0 0 0 / 0.12)'
      },
      keyframes: {
        modalIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        backdropIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        modalIn: 'modalIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        backdropIn: 'backdropIn 160ms ease-out'
      }
    }
  },
  plugins: []
}

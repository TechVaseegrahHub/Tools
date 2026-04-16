/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MONOCHROME INDUSTRIAL PALETTE
        black: '#000000',
        white: '#ffffff',
        accent: '#ff0000',
        
        // Map common app colors to monochrome equivalents
        blue: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          600: '#000000',
          700: '#1a1a1a',
        },
        indigo: {
          50: '#f9fafb',
          100: '#f3f4f6',
          400: '#9ca3af',
          600: '#000000',
          700: '#1a1a1a',
        },
        violet: {
          50: '#f9fafb',
          600: '#000000',
        },
        emerald: {
          50: '#f3f4f6',
          600: '#000000',
          100: '#e5e7eb',
          800: '#000000',
        },
        rose: {
          50: '#fff1f2',
          100: '#fee2e2',
          600: '#ff0000',
          700: '#cc0000',
          800: '#990000',
        },
        amber: {
          100: '#f3f4f6',
          800: '#000000',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Inter', 'sans-serif'], // Redirect display to Inter to maintain clean look
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)', // Match landing page shadow size
        'brutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'none': 'none',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
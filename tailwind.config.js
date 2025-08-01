import plugin from 'tailwindcss/plugin'

export const colors = {
  background: 'hsl(220, 50%, 5%)',
  primary: 'hsl(160.68, 51.3%, 22.55%)',
}

/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        background: colors.background,
        primary: {
          DEFAULT: colors.primary
        }

      },
    }
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        ':root': {
          '--color-background': colors.background,
          '--color-primary': colors.primary,
        },
      });
    }),
    plugin(function({ addVariant }) {
      addVariant('supports-hover', '@media (hover: hover)')
    })
  ]
}

export default config

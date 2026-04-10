import type { Config } from 'tailwindcss'
import { colors, typography, spacing } from '@olaac/ui/tokens'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        a11y: colors.a11y,
        score: colors.score,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      maxWidth: spacing.container,
    },
  },
  plugins: [],
}

export default config

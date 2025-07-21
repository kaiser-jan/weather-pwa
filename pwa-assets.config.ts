import { createAppleSplashScreens, defineConfig, minimal2023Preset, Preset } from '@vite-pwa/assets-generator/config'
import { defu } from 'defu'
import { DeepPartial } from './src/lib/utils.ts'
import { colors } from './tailwind.config.js'

const PADDING = 0.3

const presetOverrides: DeepPartial<Preset> = {
  transparent: {
    padding: PADDING,
  },
  maskable: {
    padding: PADDING,
    resizeOptions: {
      background: colors.background,
    },
  },
  apple: {
    padding: PADDING,
    resizeOptions: {
      background: colors.background,
    },
  },

  appleSplashScreens: createAppleSplashScreens({
    padding: PADDING + 0.2,
    resizeOptions: { background: colors.background, fit: 'contain' },
    darkResizeOptions: { background: colors.background, fit: 'contain' },
    png: {
      compressionLevel: 9,
      quality: 60,
    },
  }),
}

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: defu(presetOverrides, minimal2023Preset) as Preset,

  images: ['static/logo.svg'],
})

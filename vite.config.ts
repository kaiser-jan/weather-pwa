import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { colors } from './tailwind.config'

// const generateSW = true

export default defineConfig({
  define: {
    __DATE__: `'${new Date().toISOString()}'`,
  },
  server: {
    allowedHosts: ['weather-debug.kjan.dev'],
    fs: {
      allow: ['./changelog.json'],
    },
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    // https://github.com/vite-pwa/sveltekit/tree/main/examples/sveltekit-ts-assets-generator
    SvelteKitPWA({
      registerType: 'prompt',
      srcDir: './src',
      // mode: 'development',
      // you don't need to do this if you're using generateSW strategy in your app
      // strategies: generateSW ? 'generateSW' : 'injectManifest',
      // you don't need to do this if you're using generateSW strategy in your app
      // filename: generateSW ? undefined : 'prompt-sw.ts',
      scope: '/',
      base: '/',
      selfDestroying: false,
      pwaAssets: {
        config: true,
      },
      manifest: {
        short_name: 'Weather',
        name: 'Weather PWA',
        id: 'weather-pwa',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: colors.primary,
        background_color: colors.background,
      },
      injectManifest: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: false,
        type: 'module',
        navigateFallback: '/',
      },
      // if you have shared info in svelte config file put in a separate module and use it also here
      kit: {
        includeVersionFile: true,
      },
    }),
  ],
  preview: {
    allowedHosts: ['weather.kjan.dev', 'weather-beta.kjan.dev', 'weather-live.kjan.dev', 'weather-debug.kjan.dev'],
  },
  optimizeDeps: {
    exclude: ['bits-ui'],
    include: ['svelte-sonner', 'style-to-object'],
  },
  ssr: {
    noExternal: true,
  },
})

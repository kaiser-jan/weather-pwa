import 'vite-plugin-pwa/info'
import 'vite-plugin-pwa/svelte'
import 'vite-plugin-pwa/pwa-assets'
import type { TimeBucket } from '$lib/types/data'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  declare const __DATE__: string
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    interface PageState {
      showSettings: boolean
      settingsPath: string[]
      showLocationSearch: boolean
      selectedDayDatetime: string | null
    }
    // interface Platform {}
  }
}

export {}

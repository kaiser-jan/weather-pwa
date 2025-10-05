// Based on [svelte-legos](https://github.com/ankurrsinghal/svelte-legos)

import { NavigationIcon, NavigationOffIcon, type Icon as IconType } from '@lucide/svelte'
import { derived, readable } from 'svelte/store'

type GeolocationStatus = 'unstarted' | 'unsupported' | 'requesting' | 'unpermitted' | 'loading' | 'error' | 'active'

export interface GeolocationState {
  status: GeolocationStatus
  position: GeolocationPosition | null
  error: GeolocationPositionError | null
}

interface GeolocationOptions extends PositionOptions {
  watch: boolean
  startInactive: boolean
}

async function getPermission() {
  const permission = await navigator.permissions.query({ name: 'geolocation' })
  if (permission.state !== 'prompt') {
    return permission.state === 'granted'
  }
  return true
}

const initialState: GeolocationState = {
  status: 'unstarted',
  position: null,
  error: null,
}

export function createGeolocationStore(
  { watch, startInactive, ...options }: GeolocationOptions = { watch: false, startInactive: false },
) {
  const navigator = typeof window !== 'undefined' ? window.navigator : null
  let cancelled = false
  let watcher: number
  let updateGeolocation: () => void
  let started = false

  const geolocation = readable<GeolocationState>(initialState, (set, update) => {
    if (!(navigator && 'geolocation' in navigator)) {
      return update((state) => ({ ...state, status: 'unsupported' }))
    }

    const onSuccess: PositionCallback = (position) => {
      return set({ status: 'active', position, error: null })
    }
    const onError: PositionErrorCallback = (error) => {
      if (!(error instanceof GeolocationPositionError)) return

      const status = error.code === error.PERMISSION_DENIED ? 'unpermitted' : 'error'
      return set({ status, position: null, error })
    }

    updateGeolocation = async () => {
      if (cancelled) return
      started = true

      update((state) => ({ ...state, status: 'requesting' }))
      if (!getPermission()) return update((state) => ({ ...state, status: 'unpermitted' }))

      update((state) => ({ ...state, status: 'loading' }))

      if (watch) {
        watcher = navigator.geolocation.watchPosition(onSuccess, onError, options)
      } else {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
      }
    }

    if (!startInactive) updateGeolocation()

    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher)
      cancelled = true
    }
  })

  const details = derived(geolocation, getDetailsForState)

  return {
    subscribe: geolocation.subscribe,
    refresh: () => updateGeolocation(),
    start: () => {
      if (started) return
      updateGeolocation()
    },
    details,
  }
}

export const geolocationStore = createGeolocationStore({
  watch: false,
  startInactive: true,
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 0,
})

interface GeolocationStateDetails {
  icon: typeof IconType | null
  label: string | undefined
  class?: string
  stateCategory: 'inactive' | 'loading' | 'failed' | 'active'
}

const ERROR_LABELS: Record<number, string> = {
  [GeolocationPositionError.TIMEOUT]: 'Timed Out',
  [GeolocationPositionError.PERMISSION_DENIED]: 'Denied',
  [GeolocationPositionError.POSITION_UNAVAILABLE]: 'Unavailable',
} as const

function getDetailsForState(g: GeolocationState): GeolocationStateDetails {
  const error = g.error?.code as keyof typeof ERROR_LABELS | null

  switch (g.status) {
    case 'unstarted':
      return { stateCategory: 'inactive', icon: NavigationIcon, label: 'Inactive', class: 'opacity-50' }
    case 'requesting':
    case 'loading':
      return { stateCategory: 'loading', icon: null, label: 'Loading...' }
    case 'unsupported':
    case 'unpermitted':
    case 'error':
      return { stateCategory: 'failed', icon: NavigationOffIcon, label: error ? ERROR_LABELS[error] : 'Error' }
    case 'active':
      return { stateCategory: 'active', icon: NavigationIcon, label: 'Active' }
  }
}

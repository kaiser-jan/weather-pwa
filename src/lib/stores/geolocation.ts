// Based on [svelte-legos](https://github.com/ankurrsinghal/svelte-legos)

import { readable } from 'svelte/store'

type GeolocationStatus = 'unstarted' | 'unsupported' | 'requesting' | 'unpermitted' | 'loading' | 'error' | 'active'

interface GeolocationState {
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

  const store = readable<GeolocationState>(initialState, (set, update) => {
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

  return {
    store,
    refresh: () => updateGeolocation(),
    start: () => {
      if (started) return
      updateGeolocation()
    },
  }
}

import { toast } from 'svelte-sonner'
import { writable, derived, type Readable } from 'svelte/store'
import { useRegisterSW } from 'virtual:pwa-register/svelte'
import type { Icon } from '@lucide/svelte'
import {
  LucideBan,
  LucideCheckCircle,
  LucideCircleArrowDown,
  LucideCircleChevronDown,
  LucideCircleEllipsis,
  LucideCircleHelp,
  LucideCirclePlay,
} from '@lucide/svelte'

const swStateIconMap: Record<ServiceWorkerState, typeof Icon> = {
  parsed: LucideCircleEllipsis,
  installing: LucideCircleArrowDown,
  installed: LucideCircleChevronDown,
  activating: LucideCirclePlay,
  activated: LucideCheckCircle,
  redundant: LucideBan,
}

function createSWStores() {
  const state = writable<ServiceWorkerState | undefined>()
  const isChecking = writable(false)
  const needRefresh = writable(false)

  let registration: ServiceWorkerRegistration | undefined
  let swUrl: string | undefined
  let unsubscribed = false

  const icon = derived(state, ($state) => swStateIconMap[$state as ServiceWorkerState] ?? LucideCircleHelp)

  const { updateServiceWorker } = useRegisterSW({
    onRegisteredSW(url, reg) {
      swUrl = url
      registration = reg
      setupStateWatcher()
      checkForUpdate()
    },
    onNeedRefresh() {
      needRefresh.set(true)

      toast.info('Update available!', {
        action: { label: 'Update', onClick: () => updateServiceWorker() },
        cancel: { label: 'Ignore', onClick: () => {} },
        // description: 'You can update anytime in Settings > General > Version',
        // duration: Infinity,
      })
    },
    onOfflineReady() {
      toast.info('PWA is ready to work offline!')
    },
    onRegisterError(error) {
      toast.error('Failed to register Service Worker!', { description: error })
    },
  })

  function setupStateWatcher() {
    const controller = navigator.serviceWorker?.controller
    if (!controller) return
    const updateState = () => state.set(controller.state)
    controller.addEventListener('statechange', updateState)
    updateState()
  }

  async function checkForUpdate() {
    if (!registration || !swUrl || registration.installing || !navigator.onLine) return
    isChecking.set(true)
    try {
      const res = await fetch(swUrl, {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
        },
      })
      if (res.status === 200) await registration.update()
    } catch {}
    isChecking.set(false)
  }

  async function applyUpdate() {
    updateServiceWorker(true)
    needRefresh.set(false)
  }

  function destroy() {
    unsubscribed = true
    state.set(undefined)
    isChecking.set(false)
    needRefresh.set(false)
  }

  return {
    state: { subscribe: state.subscribe },
    icon,
    needRefresh: { subscribe: needRefresh.subscribe },
    isChecking: { subscribe: isChecking.subscribe },
    checkForUpdate,
    applyUpdate,
    destroy,
  }
}

export const pwa = createSWStores()

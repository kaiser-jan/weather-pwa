<script lang="ts">
  import {
    LucideBan,
    LucideCheckCircle,
    LucideCircleArrowDown,
    LucideCircleChevronDown,
    LucideCircleDashed,
    LucideCircleEllipsis,
    LucideCircleFadingArrowUp,
    LucideCircleHelp,
    LucideCirclePlay,
    LucideLockKeyhole,
    LucideRotateCw,
  } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import LoaderPulsatingRing from '$lib/components/LoaderPulsatingRing.svelte'
  import { capitalizeFirstChar } from '$lib/utils'
  import { toast } from 'svelte-sonner'

  let checkServiceWorkerUpdates: () => void
  let isCheckingUpdates = $state(false)

  async function _loadServiceWorkerUpdate(swUrl: string, registration?: ServiceWorkerRegistration) {
    if (!registration) return
    if (registration.installing || !navigator) return

    if ('connection' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await registration.update()
  }

  const { needRefresh, updateServiceWorker: applyServiceWorkerUpdate } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      checkServiceWorkerUpdates = async () => {
        isCheckingUpdates = true
        await _loadServiceWorkerUpdate(swUrl, registration)
        isCheckingUpdates = false
      }

      // NOTE: unsure whether this is required?
      updateServiceWorkerStateWatcher()
      // TODO: auto check for updates when starting
      // downside: this already loads the service worker, meaning the update is applied on restart?
      // checkServiceWorkerUpdates()
    },
    // onNeedRefresh() {
    //   toast.info('Update available!', {
    //     duration: Number.POSITIVE_INFINITY,
    //     action: {
    //       label: 'Update',
    //       onClick: () => applyServiceWorkerUpdate(true),
    //     },
    //     description: __DATE__,
    //   })
    // },
    onOfflineReady() {
      toast.info('PWA is ready to work offline!')
    },
    onRegisterError(error) {
      toast.error('Failed to register Service Worker!', { description: error })
    },
  })

  const swStateIconMap: Record<ServiceWorkerState, typeof LucideCheckCircle> = {
    parsed: LucideCircleEllipsis,
    installing: LucideCircleArrowDown,
    installed: LucideCircleChevronDown,
    activating: LucideCirclePlay,
    activated: LucideCheckCircle,
    redundant: LucideBan,
  }

  let serviceWorkerState = $state<ServiceWorkerState | undefined>(undefined)
  let SWStateIcon = $derived(swStateIconMap[serviceWorkerState as ServiceWorkerState] ?? LucideCircleHelp)

  function updateServiceWorkerStateWatcher() {
    const applySWState = () => (serviceWorkerState = navigator.serviceWorker?.controller?.state)
    navigator.serviceWorker?.controller?.removeEventListener('statechange', applySWState)
    navigator.serviceWorker?.controller?.addEventListener('statechange', applySWState)
    // apply the current state - required on startup as the event listener doesn't fire
    applySWState()
  }

  updateServiceWorkerStateWatcher()
</script>

<div class="flex flex-row gap-2">
  <Button variant="outline" size="icon" onclick={() => (window.location.href = 'https://auth.kjan.dev')}>
    <LucideLockKeyhole />
  </Button>
  <Button variant="outline" size="icon" onclick={() => window.location.reload()}>
    <LucideRotateCw />
  </Button>
  <Button
    variant={$needRefresh ? 'default' : 'outline'}
    size="icon"
    onclick={() => ($needRefresh ? applyServiceWorkerUpdate() : checkServiceWorkerUpdates())}
  >
    {#if isCheckingUpdates}
      <LoaderPulsatingRing className="size-4 text-text" />
    {:else}
      <LucideCircleFadingArrowUp />
    {/if}
  </Button>
  <div class="w-full"></div>
  <div class="inline-flex items-center gap-2">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <SWStateIcon />
    {capitalizeFirstChar(serviceWorkerState) ?? 'Unknown'}
  </div>
</div>

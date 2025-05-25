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
  } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import LoaderPulsatingRing from '$lib/components/LoaderPulsatingRing.svelte'
  import { capitalizeFirstChar } from '$lib/utils'

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

  let SWStateIcon = $derived(
    swStateIconMap[navigator.serviceWorker.controller?.state as ServiceWorkerState] ?? LucideCircleHelp,
  )
</script>

<div class="flex flex-row gap-2">
  <Button variant="outline" size="icon" on:click={() => (window.location.href = 'https://auth.kjan.dev')}>
    <LucideLockKeyhole />
  </Button>
  <Button variant="outline" size="icon" on:click={() => window.location.reload()}>
    <LucideRotateCw />
  </Button>
  <Button
    variant={$needRefresh ? 'default' : 'outline'}
    size="icon"
    on:click={() => ($needRefresh ? applyServiceWorkerUpdate() : checkServiceWorkerUpdates())}
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
    {capitalizeFirstChar(navigator.serviceWorker.controller?.state) ?? 'Unknown'}
  </div>
</div>

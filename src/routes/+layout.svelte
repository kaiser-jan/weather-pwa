<script lang="ts">
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin
  import { pwaInfo } from 'virtual:pwa-info'
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#pwa-assets
  import { pwaAssetsHead } from 'virtual:pwa-assets/head'
  import { Toaster } from '$lib/components/ui/sonner'
  import LocationSelector from '$lib/components/layout/location/LocationSelector.svelte'
  import SettingsButton from '$lib/components/layout/SettingsButton.svelte'
  import ContainerCorners from '$lib/components/ContainerCorners.svelte'
  import { Portal } from 'bits-ui'
  import ErrorBoundary from '$lib/components/layout/errors/ErrorBoundary.svelte'

  let { children } = $props()

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '')

  // HACK: disable swipe back navigation
  // https://github.com/w3c/manifest/issues/1041
  window.addEventListener(
    'touchstart',
    function (e) {
      if (e.touches.length > 1) return
      const touch = e.touches[0]
      if (touch.clientX < 20) e.preventDefault()
    },
    { passive: false },
  )
</script>

<svelte:head>
  {#if pwaAssetsHead.themeColor}
    <meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
  {/if}
  {#each pwaAssetsHead.links as link (link.href)}
    <link {...link} href={`${link.href}?v=${new Date(__DATE__).getTime()}`} />
  {/each}
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<ErrorBoundary scope="app">
  <div
    class="bg-background relative flex h-dvh w-dvw flex-col overflow-hidden pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
  >
    <!-- NOTE: this was only removed because the SectionCurrent should expand to the top -->
    <!-- <div class="h-[env(safe-area-inset-top)] shrink-0"></div> -->

    <ErrorBoundary scope="page">
      {@render children()}
    </ErrorBoundary>

    <!-- 
    HACK: allow for rounding the containers corners without having to wrap it.
    The container would need to be inside the padding, meaning it shifts the scrollbar
    Also, wrapping it causes weird behaviour.
  -->
    <ContainerCorners
      left="left-4"
      bottom="bottom-[calc(5.5rem+min(env(safe-area-inset-bottom),1rem))]"
      right="right-4"
    />
    <!-- <div -->
    <!--   class="from-background/50 pointer-events-none absolute right-0 bottom-22 left-0 flex h-8 flex-row gap-2 bg-linear-to-t to-transparent" -->
    <!-- ></div> -->

    <div class="bg-background flex h-22 shrink-0 flex-row items-center gap-2 p-4">
      <LocationSelector />
      <SettingsButton />
    </div>

    <!-- HACK: the safe area on iOS is quite large -->
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </div>

  <Portal to="html">
    <Toaster
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classes: {
          toast:
            'bg-background border-foreground border-2 flex flex-row flex-wrap gap-2 items-center rounded-lg p-3 text-sm z-1000 touch-auto',
          title: 'text-text font-semibold flex flex-row gap-2',
          description: 'text-text-muted italic',
          actionButton: 'bg-foreground rounded-md p-2 h-8 flex items-center hover:bg-primary',
          cancelButton: 'border-foreground border-2 rounded-md p-2 h-8 flex items-center',
          closeButton: 'bg-purple-500',
        },
      }}
    />
  </Portal>
</ErrorBoundary>

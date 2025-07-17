<script lang="ts">
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin
  import { pwaInfo } from 'virtual:pwa-info'
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#pwa-assets
  import { pwaAssetsHead } from 'virtual:pwa-assets/head'
  import { Toaster } from '$lib/components/ui/sonner'
  import LocationSelector from '$lib/components/LocationSelector.svelte'
  import SettingsButton from '$lib/components/SettingsButton.svelte'
  import ContainerCorners from '$lib/components/ContainerCorners.svelte'

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
  {#each pwaAssetsHead.links as link}
    <link {...link} href={`${link.href}?v=${new Date(__DATE__).getTime()}`} />
  {/each}
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<div
  class="bg-background relative flex h-dvh w-dvw flex-col overflow-hidden pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
>
  <!-- TODO: how to handle the default page requiring full height? -->
  <!-- <div class="h-[env(safe-area-inset-top)] shrink-0"></div> -->
  {@render children()}

  <!-- 
    HACK: allow for rounding the containers corners without having to wrap it.
    The container would need to be inside the padding, meaning it shifts the scrollbar
    Also, wrapping it causes weird behaviour.
  -->
  <ContainerCorners left="left-4" bottom="bottom-22" right="right-4" />
  <div
    class="from-background/50 absolute right-0 bottom-22 left-0 flex h-8 flex-row gap-2 bg-gradient-to-t to-transparent"
  ></div>

  <div class="bg-background flex h-22 shrink-0 flex-row items-center gap-2 p-4">
    <LocationSelector />
    <SettingsButton />
  </div>

  <!-- HACK: the safe area on iOS is quite large -->
  <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
</div>

<Toaster />

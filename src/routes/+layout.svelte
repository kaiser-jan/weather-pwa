<script lang="ts">
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin
  import { pwaInfo } from 'virtual:pwa-info'
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#pwa-assets
  import { pwaAssetsHead } from 'virtual:pwa-assets/head'
  import { Toaster } from '$lib/components/ui/sonner'

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

  let scrollOffset = $state(0)
  let shrinkHeader = $derived(scrollOffset > 300)
  $effect(() => {
    console.log(scrollOffset)
  })
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
  <main class="w-full grow overflow-x-hidden overflow-y-auto scroll-smooth">
    {@render children()}
  </main>
  <!-- HACK: the safe area on iOS is quite large -->
  <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
</div>

<Toaster />

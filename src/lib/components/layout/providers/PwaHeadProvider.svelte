<script lang="ts">
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin
  import { pwaInfo } from 'virtual:pwa-info'
  // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#pwa-assets
  import { pwaAssetsHead } from 'virtual:pwa-assets/head'

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '')
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

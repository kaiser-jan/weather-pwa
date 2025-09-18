<script lang="ts">
  import ErrorBoundary from '$lib/components/layout/errors/ErrorBoundary.svelte'
  import ViewTransitionProvider from '$lib/components/layout/providers/ViewTransitionProvider.svelte'
  import PwaHead from '$lib/components/layout/providers/PwaHeadProvider.svelte'
  import NotificationsProvider from '$lib/components/layout/providers/NotificationsProvider.svelte'

  let { children } = $props()
</script>

<PwaHead />

<ErrorBoundary scope="app">
  {@render children()}

  <ViewTransitionProvider />
  <NotificationsProvider />
</ErrorBoundary>

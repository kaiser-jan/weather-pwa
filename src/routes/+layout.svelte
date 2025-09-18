<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner'
  import ContainerCorners from '$lib/components/ContainerCorners.svelte'
  import { Portal } from 'bits-ui'
  import ErrorBoundary from '$lib/components/layout/errors/ErrorBoundary.svelte'
  import ViewTransitionProvider from '$lib/components/layout/ViewTransitionProvider.svelte'
  import PwaHead from '$lib/components/layout/PwaHead.svelte'
  import NavigationBar from '$lib/components/layout/NavigationBar.svelte'
  import { onMount } from 'svelte'

  let { children } = $props()
</script>

<PwaHead />

<ViewTransitionProvider />

<ErrorBoundary scope="app">
  <div
    class="bg-background relative flex h-[100dvh] w-full flex-col overflow-hidden pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
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
    <div
      class="from-background/80 pointer-events-none absolute right-0 bottom-22 left-0 flex h-16 flex-row gap-2 bg-linear-to-t to-transparent opacity-100 transition-opacity"
    ></div>

    <NavigationBar />

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

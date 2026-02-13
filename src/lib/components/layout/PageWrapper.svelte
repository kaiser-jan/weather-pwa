<script lang="ts">
  import { useSwipe, type SwipeCustomEvent } from 'svelte-gestures'
  import ContainerCorners from '$lib/components/ContainerCorners.svelte'
  import ErrorBoundary from '$lib/components/layout/errors/ErrorBoundary.svelte'
  import NavigationBar from '$lib/components/layout/NavigationBar.svelte'
  import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/utils'
  import { onMount } from 'svelte'

  type MainProps = WithElementRef<HTMLAttributes<HTMLElement>> & WithElementRef<HTMLAnchorAttributes>

  interface Props {
    element?: HTMLElement | undefined
    safeArea?: {
      top: boolean
      bottom: boolean
    }
    onswipe?: (e: SwipeCustomEvent) => void
  }

  let {
    children,
    safeArea = { top: true, bottom: true },
    element = $bindable(),
    onswipe,
    ...props
  }: MainProps & Props = $props()

  let isScrolledToBottom = $state(true)

  function handleScroll() {
    if (!element) return
    isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1
  }

  onMount(() => {
    handleScroll()
  })
</script>

<!--
NOTE: This is not part of the root layout, because both pages as well as the layout (or this component) need to access the main container for e.g. handling scroll.
-->

<div
  class="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
>
  {#if safeArea?.top !== false}
    <div class="h-[env(safe-area-inset-top)] shrink-0"></div>
  {/if}

  <ErrorBoundary scope="page">
    <main
      class={cn('flex grow flex-col overflow-x-hidden overflow-y-auto scroll-smooth', props.class)}
      bind:this={element}
      onscroll={(e) => {
        handleScroll()
        props.onscroll?.(e)
      }}
      {...useSwipe(onswipe ?? (() => {}), () => ({ touchAction: 'pan-y' }))}
    >
      {@render children!()}
    </main>
  </ErrorBoundary>

  <!-- 
    HACK: allow rounding the content corners without having to wrap it.
    The wrapping container would be inside the padding, meaning the scrollable content doesn't use the full width, which shifts the scrollbar.
    Also, wrapping it causes weird behaviour.
  -->
  <ContainerCorners
    left="left-4"
    bottom={safeArea.bottom ? 'bottom-[calc(5.5rem+min(env(safe-area-inset-bottom),1rem))]' : 'bottom-[5.5rem]'}
    right="right-4"
  />
  <div
    class="pointer-events-none absolute right-0 bottom-22 left-0 flex h-16 flex-row gap-2 bg-linear-to-t from-background/80 to-transparent transition-opacity duration-500"
    class:opacity-0={isScrolledToBottom}
  ></div>

  <NavigationBar />

  {#if safeArea.bottom}
    <!-- HACK: the safe area on iOS is quite large -->
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  {/if}
</div>

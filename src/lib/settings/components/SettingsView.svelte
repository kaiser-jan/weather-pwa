<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import type { ConfigItem } from '../types'
  import { Button } from '$lib/components/ui/button'
  import { ChevronLeftIcon } from '@lucide/svelte'

  interface Props {
    path?: string[]
    config: ConfigItem[]
  }

  let { path = $bindable([]), config }: Props = $props()

  let pages: ConfigItem[][] = $derived.by(() => {
    let _pages: ConfigItem[][] = [config]

    for (const key of path) {
      const lastPage = _pages[_pages.length - 1]
      const childPage = lastPage.find((p) => p.id === key)
      if (!childPage) {
        throw new Error(`Path ${path} could not be traversed, as ${key} does not contain items.`)
      }
      if (!('children' in childPage)) {
        throw new Error(`Path ${path} could not be traversed, as ${key} does not contain items.`)
      }
      _pages.push(childPage.children)
    }

    return _pages
  })

  function onnavigate(key: string, pageIndex: number) {
    if (pageIndex !== pages.length - 1) {
      console.warn('Tried to navigate from an old page.', path, `${pageIndex}/${pages.length}`)
      return
    }
    navigateTo(key)
  }

  function navigateTo(key: string) {
    path = [...path, key]
  }

  function goBack() {
    path = path.slice(0, path.length - 1)
  }

  let scrollContainer: HTMLDivElement
  let historyElements: HTMLDivElement[] = $state([])

  $effect(() => {
    if (historyElements.length) {
      const filteredHistoryElements = historyElements.filter((e) => e)
      const lastElement = filteredHistoryElements[filteredHistoryElements.length - 1]
      scrollContainer.scrollLeft = lastElement.offsetLeft - scrollContainer.getBoundingClientRect().left
    }
  })
</script>

<div class="relative flex h-full w-full flex-col overflow-x-hidden overflow-y-auto p-4">
  <Button variant="ghost" onclick={goBack} class="" disabled={pages.length === 1}>
    <ChevronLeftIcon />
    Back
  </Button>
  <!-- Breadcrumb placeholder -->
  <nav class="absolute top-2 left-16 z-10">
    <!-- TODO: Add breadcrumb navigation here -->
  </nav>

  <div
    class="flex w-full shrink-0 grow flex-row justify-start gap-6 overflow-x-hidden scroll-smooth"
    bind:this={scrollContainer}
  >
    {#each pages as config, i}
      <div class="flex w-full shrink-0 flex-col gap-2 overflow-hidden" bind:this={historyElements[i]}>
        <SettingsRenderer {config} path={path.slice(0, i)} onnavigate={(t) => onnavigate(t, i)} />
      </div>
      <div class="flex w-full shrink-0"></div>
    {/each}
  </div>
</div>

<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import type { ConfigItem, NestableSetting } from '../types'
  import { Button } from '$lib/components/ui/button'
  import { ChevronLeftIcon } from '@lucide/svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'

  interface Props {
    path?: string[]
    config: ConfigItem[]
  }

  let { path = $bindable([]), config }: Props = $props()

  type Page = NestableSetting & { path: string[] }

  let pages: Page[] = $derived.by(() => {
    let _pages: Page[] = [
      {
        id: '',
        type: 'page',
        label: 'Settings',
        children: config,
        path: [],
      },
    ]

    for (const [index, key] of path.entries()) {
      const lastPage = _pages[_pages.length - 1]
      const childPage = lastPage.children.find((p) => p.id === key)
      if (!childPage) {
        throw new Error(`Path ${path} could not be traversed, as ${key} does not contain items.`)
      }
      if (!('children' in childPage)) {
        throw new Error(`Path ${path} could not be traversed, as ${key} does not contain items.`)
      }
      _pages.push({ ...childPage, path: path.slice(0, index - 1) })
    }

    return _pages
  })

  function onnavigate(key: string, pageIndex: number) {
    if (pageIndex !== pages.length - 1) {
      console.warn('Tried to navigate from an old page.', path, `${pageIndex}/${pages.length}`)
      return
    }
    navigateToKey(key)
  }

  function navigateToKey(key: string) {
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

<div class="flex flex-col gap-4 overflow-x-visible min-h-0">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each pages as page, index}
        {#if index !== 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          <Breadcrumb.Link onclick={() => (path = page.path)}>{page.label}</Breadcrumb.Link>
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>

  <div
    class="flex flex-row gap-6 overflow-x-hidden min-h-0 overflow-y-auto scroll-smooth"
    bind:this={scrollContainer}
  >
    {#each pages as page, i}
      <div class="flex w-full h-fit shrink-0 flex-col gap-2 overflow-hidden" bind:this={historyElements[i]}>
        <SettingsRenderer config={page.children} path={path.slice(0, i)} onnavigate={(t) => onnavigate(t, i)} />
      </div>
      <div class="flex shrink-0"></div>
    {/each}
  </div>
</div>

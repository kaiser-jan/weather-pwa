<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import type { ConfigItem, NestableSetting } from '../types'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { settings } from '../store'
  import PageList from './pages/PageList.svelte'
  import { HelpCircleIcon, SettingsIcon } from '@lucide/svelte'

  interface Props {
    path?: string[]
    config: ConfigItem[]
  }

  let { path = $bindable([]), config }: Props = $props()

  let recentPath = $state<typeof path | null>(null)

  type Page = NestableSetting & { path: string[] }

  let pages: Page[] = $derived.by(() => {
    let _pages: Page[] = [
      {
        id: 'settings',
        type: 'page',
        label: 'Settings',
        icon: SettingsIcon,
        children: config,
        path: [],
      },
    ]

    for (const [index, key] of path.entries()) {
      const lastPage = _pages[_pages.length - 1]
      let childPage = lastPage.children.find((p) => p.id === key)

      if (lastPage.type === 'list' && !isNaN(parseInt(key))) {
        const values = settings.readSetting(path.slice(0, index)).value as any[]
        const label = values && lastPage.nameProperty ? values[parseInt(key)][lastPage.nameProperty] : key

        childPage = {
          ...lastPage,
          label,
          type: 'page',
        }
      }

      if (!childPage || !('children' in childPage)) {
        console.warn(`Path ${path} could not be traversed, as ${key} does not contain items.`)
        continue
      }

      _pages.push({ ...childPage, path: path.slice(0, index + 1) })
    }

    return _pages
  })

  function navigateToKey(key: string) {
    path = [...path, key]
    recentPath = null
  }

  let scrollContainer: HTMLDivElement
  let historyElements: HTMLDivElement[] = $state([])

  $effect(() => {
    if (historyElements.length) {
      updateScroll()
    }
  })

  function updateScroll() {
    const gap = parseInt(getComputedStyle(scrollContainer).gap, 10)

    scrollContainer.style.left =
      -1 * path.length * (scrollContainer.parentElement!.getBoundingClientRect().width + gap) + 'px'
  }

  function handleSwipe(event: SwipeCustomEvent) {
    console.info(event.detail.direction)
    switch (event.detail.direction) {
      case 'right':
        recentPath = $state.snapshot(path)
        path.pop()
        break
      case 'left':
        if (recentPath) path = recentPath
        recentPath = null
        break
    }
  }
</script>

<div class="flex min-h-0 grow flex-col gap-4 overflow-x-visible">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each pages as page, index}
        {#if index !== 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          <Breadcrumb.Link
            onclick={() => {
              recentPath = $state.snapshot(path)
              console.log(page.path)
              path = page.path
            }}>{page.label}</Breadcrumb.Link
          >
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>

  <!-- {path} -->
  <!-- <br /> -->
  <!-- {pages.map((p) => p.path).join(';')} -->

  <div class="relative grow" use:swipe={() => ({ timeframe: 300, minSwipeDistance: 30 })} onswipe={handleSwipe}>
    <div
      class="absolute flex w-full flex-row gap-6 transition-all duration-300 ease-in-out"
      bind:this={scrollContainer}
    >
      {#each pages as page, i}
        <div class="flex h-fit w-full shrink-0 flex-col gap-2 overflow-hidden" bind:this={historyElements[i]}>
          {#if page.type === 'list'}
            <PageList
              item={page}
              value={settings.readSetting(page.path).value}
              onnavigate={(t) => navigateToKey(t, i)}
              onchange={(v) => {
                settings.writeSetting(path, v)
              }}
            />
          {:else}
            <SettingsRenderer config={page.children} path={path.slice(0, i)} onnavigate={(t) => navigateToKey(t, i)} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

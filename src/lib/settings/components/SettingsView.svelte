<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import type { ConfigItem, NestableSetting, SettingPage } from '../types'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { settings } from '../store'
  import PageList from './pages/PageList.svelte'
  import { SettingsIcon } from '@lucide/svelte'
  import PageChangelog from './pages/PageChangelog.svelte'

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
      if (!('children' in lastPage)) {
        return _pages
      }

      // the childPage could also be part of a ListSetting, which has no children
      let childPage = lastPage.children.find((p) => p.id === key) as NestableSetting

      // HACK:
      //  TODO: this needs to be generalized
      if (childPage?.type === 'changelog') {
        childPage = { ...lastPage, type: 'changelog', id: 'changelog', label: 'Changelog' }
      }

      if (lastPage.type === 'list' && !isNaN(parseInt(key))) {
        const values = settings.readSetting(path.slice(0, index)).value as Record<string, unknown>[]
        const hasName = values && lastPage.nameProperty && lastPage.nameProperty in values[parseInt(key)]
        let label = hasName ? (values[parseInt(key)][lastPage.nameProperty] as string) : key

        // HACK: a list item has no setting definition so we make it a page so it displays its properties given by the parent
        childPage = {
          ...lastPage,
          id: key,
          label,
          type: 'page',
        } as SettingPage
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

<div class="flex min-h-0 grow flex-col gap-4 overflow-x-visible p-4 pb-0">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each pages as page, index (page.id)}
        {#if index !== 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          <Breadcrumb.Link
            onclick={() => {
              recentPath = $state.snapshot(path)
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
      class="absolute flex h-full w-full flex-row gap-6 transition-all duration-300 ease-in-out"
      bind:this={scrollContainer}
    >
      {#each pages as page, i (page.id)}
        <div
          class="flex h-full w-full shrink-0 flex-col gap-2 overflow-hidden overflow-y-auto"
          bind:this={historyElements[i]}
        >
          {#if page.type === 'list'}
            <PageList
              item={page}
              value={settings.readSetting(page.path).value as Record<string, unknown>[]}
              onnavigate={(t) => navigateToKey(t)}
              onchange={(v) => {
                settings.writeSetting(path, v)
              }}
            />
          {:else if page.type === 'changelog'}
            <PageChangelog />
          {:else}
            <SettingsRenderer config={page.children} path={path.slice(0, i)} onnavigate={(t) => navigateToKey(t)} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

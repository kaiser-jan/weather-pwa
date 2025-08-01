<script lang="ts">
  import type { ConfigItem, SettingsPage } from '../types'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { settings } from '../store'
  import { SettingsIcon } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import { pushState, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import { getPageComponent, isWrapper } from '../registry'

  interface Props {
    config: ConfigItem[]
  }

  let { config }: Props = $props()

  type Page = SettingsPage & { path: readonly string[] }

  const BASE_PAGE = {
    id: 'settings',
    type: 'page',
    label: 'Settings',
    icon: SettingsIcon,
    children: config,
    path: [],
  } as const

  let pages: Page[] = $derived.by(() => {
    let _pages: Page[] = [BASE_PAGE]

    if (!page.state.settingsPath) page.state.settingsPath = []

    for (const [index, key] of page.state.settingsPath.entries()) {
      const lastPage = _pages[_pages.length - 1]
      if (!('children' in lastPage)) {
        return _pages
      }

      // the childPage could also be part of a ListSetting, which has no children
      let childPage = lastPage.children.find((p) => p.id === key) as SettingsPage

      // HACK: this is a child of a nested setting (e.g. ListSetting) so we make it a page so it displays its properties given by the parent
      if (!childPage) {
        const values = settings.readSetting(page.state.settingsPath.slice(0, index)).value as Record<string, unknown>[]
        const hasName =
          values &&
          'nameProperty' in lastPage &&
          lastPage.nameProperty &&
          lastPage.nameProperty in values[parseInt(key)]
        let label = hasName ? (values[parseInt(key)][lastPage.nameProperty] as string) : key

        childPage = {
          ...lastPage,
          id: key,
          label,
          type: 'page',
        } as SettingsPage
      }

      _pages.push({ ...childPage, path: page.state.settingsPath.slice(0, index + 1) })
    }

    return _pages
  })

  function navigateToKey(key: string, replace = false) {
    const newPath = [...page.state.settingsPath, key]
    if (replace) replaceState('', { ...page.state, settingsPath: $state.snapshot(newPath) })
    else pushState('', { ...page.state, settingsPath: $state.snapshot(newPath) })
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
      -1 * page.state.settingsPath.length * (scrollContainer.parentElement!.getBoundingClientRect().width + gap) + 'px'
  }

  function handleSwipe(event: SwipeCustomEvent) {
    switch (event.detail.direction) {
      case 'right':
        history.back()
        break
      case 'left':
        history.forward()
        break
    }
  }

  onMount(() => {
    window.addEventListener('resize', updateScroll)
    return () => window.removeEventListener('resize', updateScroll)
  })
</script>

<div class="flex min-h-0 grow flex-col gap-4 overflow-x-visible p-4 pb-0">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each pages as settingsPage, index (settingsPage.id)}
        {#if index !== 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          <Breadcrumb.Link
            onclick={async () => {
              const currentLength = page.state.settingsPath.length
              const targetLength = settingsPage.path.length
              let moveBackBy = currentLength - targetLength

              // NOTE: wrappers are not added to history
              for (let i = targetLength - 1; i <= currentLength - 1; i++) {
                if (pages[i] && isWrapper(pages[i]) && i !== targetLength) moveBackBy -= 1
              }

              // avoid reloading
              if (moveBackBy === 0) return
              history.go(-moveBackBy)
            }}>{settingsPage.label}</Breadcrumb.Link
          >
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>

  <!-- {path} -->
  <!-- <br /> -->
  <!-- {pages.map((p) => p.path).join(';')} -->

  <div
    class="relative grow"
    use:swipe={() => ({ timeframe: 300, minSwipeDistance: 30, touchAction: 'pan-y' })}
    onswipe={handleSwipe}
  >
    <div
      class="absolute flex h-full w-full flex-row gap-6 transition-all duration-300 ease-in-out"
      bind:this={scrollContainer}
    >
      {#each pages as settingsPage, i (settingsPage.id)}
        {@const PageComponent = getPageComponent(settingsPage.type)}
        <div
          class="flex h-full w-full shrink-0 flex-col gap-2 overflow-hidden overflow-y-auto"
          bind:this={historyElements[i]}
        >
          <PageComponent
            item={settingsPage}
            path={page.state.settingsPath.slice(0, i)}
            value={settings.readSetting(settingsPage.path).value as Record<string, unknown>[]}
            onnavigate={navigateToKey}
            onchange={(v) => {
              settings.writeSetting(page.state.settingsPath, v)
            }}
          />
        </div>
      {/each}
    </div>
  </div>
</div>

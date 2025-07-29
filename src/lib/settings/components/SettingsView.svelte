<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import type { ConfigItem, NestableSetting, SettingPage } from '../types'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { swipe, type SwipeCustomEvent } from 'svelte-gestures'
  import { settings } from '../store'
  import PageList from './pages/PageList.svelte'
  import { SettingsIcon } from '@lucide/svelte'
  import PageChangelog from './pages/PageChangelog.svelte'
  import { onMount } from 'svelte'
  import { pushState } from '$app/navigation'
  import { page } from '$app/state'

  interface Props {
    config: ConfigItem[]
  }

  let { config }: Props = $props()

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

    if (!page.state.settingsPath) page.state.settingsPath = []

    for (const [index, key] of page.state.settingsPath.entries()) {
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
        const values = settings.readSetting(page.state.settingsPath.slice(0, index)).value as Record<string, unknown>[]
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
        console.warn(`Path ${page.state.settingsPath} could not be traversed, as ${key} does not contain items.`)
        continue
      }

      _pages.push({ ...childPage, path: page.state.settingsPath.slice(0, index + 1) })
    }

    return _pages
  })

  function navigateToKey(key: string) {
    const newPath = [...page.state.settingsPath, key]
    pushState('', { ...page.state, settingsPath: $state.snapshot(newPath) })
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
              const moveBackBy = currentLength - targetLength
              history.go(-moveBackBy)

              // or should we store only the old path in the forward history, and omit the skipped items?
              // const recentPath = $state.snapshot(page.state.settingsPath)
              // replaceState('', { ...page.state, settingsPath: settingsPage.path })
              // pushState('', { ...page.state, settingsPath: $state.snapshot(recentPath) })
              // history.back()
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
        <div
          class="flex h-full w-full shrink-0 flex-col gap-2 overflow-hidden overflow-y-auto"
          bind:this={historyElements[i]}
        >
          {#if settingsPage.type === 'list'}
            <PageList
              item={settingsPage}
              value={settings.readSetting(settingsPage.path).value as Record<string, unknown>[]}
              onnavigate={(t) => navigateToKey(t)}
              onchange={(v) => {
                settings.writeSetting(page.state.settingsPath, v)
              }}
            />
          {:else if settingsPage.type === 'changelog'}
            <PageChangelog />
          {:else}
            <SettingsRenderer
              config={settingsPage.children}
              path={page.state.settingsPath.slice(0, i)}
              onnavigate={(t) => navigateToKey(t)}
            />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { SearchIcon, XIcon } from '@lucide/svelte'
  import { page } from '$app/state'
  import LocationSearchResults from './LocationSearchResults.svelte'
  import LocationList from './LocationList.svelte'
  import LocationRecentSearchResults from './LocationRecentSearchResults.svelte'
  import { useApiSearch } from '$lib/utils/apiSearch'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { locationSearch } from '$lib/stores/ui'

  interface Props {
    active: boolean
  }

  let { active }: Props = $props()

  const { liveQuery, query, result, loading, cache, search, clear } = useApiSearch({
    key: 'location-search-v2',
    fetch: nominatimQuery,
  })

  async function nominatimQuery(query: string) {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('limit', '10')
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    // url.searchParams.append('layer', ['address', 'poi', 'manmade'].join(','))
    // url.searchParams.append('featureType', ['city', 'settlement'].join(','))
    // countrycodes https://nominatim.org/release-docs/develop/api/Search/#result-restriction
    const response = await fetch(url.toString())
    const results = await response.json()
    return results as PlaceOutput[]
  }
</script>

<Drawer.Root
  bind:open={() => page.state.showLocationSearch ?? false, (o) => (o ? locationSearch.show() : locationSearch.hide())}
>
  <!-- bind:open={isOpen} -->
  <Drawer.Trigger
    class={cn(
      buttonVariants({ variant: active ? 'default' : 'midground', size: 'icon' }),
      'size-10! grow-0 rounded-full text-xl',
    )}
  >
    <SearchIcon />
  </Drawer.Trigger>
  <Drawer.Content class="h-full">
    <div
      class="flex h-0 grow flex-col gap-4 p-4"
      style="padding-bottom: calc(1rem + min(2rem, env(safe-area-inset-top)))"
    >
      <div class="flex h-0 grow flex-col gap-4 overflow-y-auto">
        {#if $liveQuery || $result}
          <LocationSearchResults query={$query} loading={$loading} result={$result} {clear} />
        {:else}
          <LocationList />
        {/if}
      </div>

      <LocationRecentSearchResults cache={$cache} {search} />

      <div class="relative">
        <Input
          placeholder="Search any location..."
          bind:value={$liveQuery}
          onkeypress={(e) => {
            if (e.key === 'Enter') search()
          }}
          class="h-12"
        />
        <SearchIcon class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
        {#if $liveQuery}
          <Button
            size="icon"
            variant="outline"
            class="absolute top-1/2 right-2 size-8 -translate-y-1/2 text-muted-foreground"
            onclick={() => ($liveQuery = null)}
          >
            <XIcon />
          </Button>
        {/if}
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>

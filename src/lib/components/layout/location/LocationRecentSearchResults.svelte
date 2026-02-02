<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { HistoryIcon, SearchIcon } from '@lucide/svelte'

  interface Props {
    cache: LocationResults
    search: (query: string) => void
  }

  let { cache, search }: Props = $props()

  type LocationResults = { query: string; result: PlaceOutput[] }[]
</script>

<div class="mt-auto flex flex-col gap-4">
  {#if cache?.length}
    <h5 class="-mb-3 inline-flex items-center gap-2 text-sm text-text-muted">
      <HistoryIcon />
      Recent Searches
    </h5>
    <div class="flex flex-col gap-2">
      {#each cache ? cache.slice(0, 3).reverse() : [] as recentSearch}
        <Button
          variant="midground"
          class="inline-flex items-center justify-start gap-2 px-2"
          onclick={() => search(recentSearch.query)}
        >
          <SearchIcon />
          {recentSearch.query}
        </Button>
      {/each}
    </div>
  {/if}
</div>

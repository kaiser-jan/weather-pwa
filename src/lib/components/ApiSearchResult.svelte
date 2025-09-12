<script lang="ts" generics="ResultT">
  import { replaceState, pushState } from '$app/navigation'
  import { page } from '$app/state'
  import { debounce } from '$lib/utils'
  import { persist } from '$lib/utils/stores'
  import { type Snippet } from 'svelte'
  import { get } from 'svelte/store'

  interface Props {
    liveQuery: string | null
    cacheKey: string
    searchNow: () => void
    load: (query: string) => Promise<ResultT[]>
    onresults?: () => void
    children: Snippet<[{ isLoading: boolean; result: ResultT[] | null }]>
  }

  let {
    liveQuery = $bindable(),
    searchNow = $bindable(loadResultsForLiveQuery),
    cacheKey,
    load,
    onresults,
    children,
  }: Props = $props()

  let isLoading = $state(false)

  let currentQuery = $state<string | null>(null)
  let currentResults = $state<ResultT[] | null>(null)
  const cachedResults = persist<{ query: string; results: ResultT[] }[]>($state.snapshot(cacheKey), [])

  const debouncedLoadResults = debounce(loadResultsForLiveQuery, 1000)

  $effect(() => {
    if (liveQuery && liveQuery !== currentQuery) {
      debouncedLoadResults()
      tryLoadCachedResults(liveQuery)
    }
  })

  function saveToHistory() {
    currentQuery = $state.snapshot(liveQuery)
    // consider saving each search as an history entry
    if (page.state.locationQuery) {
      replaceState('', { ...page.state, locationQuery: currentQuery })
    } else {
      pushState('', { ...page.state, locationQuery: currentQuery })
    }
  }

  export async function loadResultsForLiveQuery() {
    if (!liveQuery || liveQuery === null) return

    isLoading = true
    saveToHistory()
    currentResults = await loadResults()
    isLoading = false

    onresults?.()
  }

  async function tryLoadCachedResults(newQuery: string) {
    const cached = get(cachedResults).find((c) => c.query === newQuery)
    if (!cached) return
    currentResults = cached.results
    saveToHistory()
  }

  async function loadResults() {
    const _cachedResults = get(cachedResults)

    // create a copy to keep during async calls
    const query = $state.snapshot(page.state.locationQuery)
    if (!query || query === '') return null

    const cache = _cachedResults.find((c) => c.query === query)
    if (cache) {
      return cache.results
    }

    console.info(`Searching for "${query}"...`)

    const newResults = await load(query)

    console.debug(newResults)

    if (!newResults) return null
    const MAX_ENTRIES = 10
    _cachedResults.unshift({ query: query!, results: newResults })
    if (_cachedResults.length > MAX_ENTRIES) _cachedResults.length = MAX_ENTRIES
    cachedResults.set(_cachedResults)

    return newResults
  }
</script>

{@render children({ result: currentResults, isLoading })}

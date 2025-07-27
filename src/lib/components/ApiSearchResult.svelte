<script lang="ts" generics="ResultT">
  import { replaceState, pushState } from '$app/navigation'
  import { page } from '$app/state'
  import { debounce } from '$lib/utils'
  import { persistantState } from '$lib/utils/state.svelte'
  import { onMount, type Snippet } from 'svelte'

  interface Props {
    liveQuery: string | null
    cacheKey: string
    searchNow: () => void
    load: (query: string) => Promise<ResultT[]>
    children: Snippet<[{ isLoading: boolean; result: ResultT[] | null }]>
  }

  let {
    liveQuery = $bindable(),
    searchNow = $bindable(loadResultsForLiveQuery),
    cacheKey,
    load,
    children,
  }: Props = $props()

  let isLoading = $state(false)

  let currentQuery = $state<string | null>(null)
  let currentResults = $state<ResultT[] | null>(null)
  const cachedResults = persistantState<{ query: string; results: ResultT[] }[]>($state.snapshot(cacheKey), [])

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

  async function loadResultsForLiveQuery() {
    if (!liveQuery || liveQuery === null) return

    isLoading = true
    saveToHistory()
    currentResults = await loadResults()
    isLoading = false
  }

  async function tryLoadCachedResults(newQuery: string) {
    const cached = cachedResults.value.find((c) => c.query === newQuery)
    if (!cached) return
    currentResults = cached.results
    saveToHistory()
  }

  async function loadResults() {
    // create a copy to keep during async calls
    const query = $state.snapshot(page.state.locationQuery)
    if (!query || query === '') return null

    const cache = cachedResults.value.find((c) => c.query === query)
    if (cache) {
      return cache.results
    }

    console.info(`Searching for "${query}"...`)

    const newResults = await load(query)

    console.debug(newResults)

    if (!newResults) return null
    const MAX_ENTRIES = 10
    cachedResults.value.unshift({ query: query!, results: newResults })
    if (cachedResults.value.length > MAX_ENTRIES) cachedResults.value.length = MAX_ENTRIES

    return newResults
  }
</script>

{@render children({ result: currentResults, isLoading })}

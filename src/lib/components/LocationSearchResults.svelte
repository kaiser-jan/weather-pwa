<script lang="ts">
  import { replaceState, pushState } from '$app/navigation'
  import { page } from '$app/state'
  import { selectedLocation } from '$lib/stores/location'
  import { locationSearch } from '$lib/stores/ui'
  import type { PlaceOutput } from '$lib/types/nominatim'
  import { ITEM_ID_TEMPORARY } from '$lib/types/ui'
  import { debounce } from '$lib/utils'
  import { persistantState } from '$lib/utils/state.svelte'
  import { onMount } from 'svelte'
  import LocationList from './LocationList.svelte'
  import { classIconMap, typeToString } from '$lib/data/location'

  interface Props {
    liveQuery: string | null
    searchNow: () => void
  }

  let { liveQuery = $bindable(), searchNow = $bindable(loadResultsForLiveQuery) }: Props = $props()

  let isLoading = $state(false)

  let currentQuery = $state<string | null>(null)
  let currentResults = $state<PlaceOutput[] | null>(null)
  const cachedResults = persistantState<{ query: string; results: PlaceOutput[] }[]>(
    'cache-location-search-results',
    [],
  )

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
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('limit', '10')
    url.searchParams.append('q', query!)
    url.searchParams.append('format', 'json')
    // url.searchParams.append('layer', ['address', 'poi', 'manmade'].join(','))
    // url.searchParams.append('featureType', ['city', 'settlement'].join(','))
    // countrycodes https://nominatim.org/release-docs/develop/api/Search/#result-restriction
    const response = await fetch(url.toString())
    const newResults = await response.json()
    console.debug(newResults)

    if (!newResults) return null
    const MAX_ENTRIES = 10
    cachedResults.value.unshift({ query: query!, results: newResults })
    if (cachedResults.value.length > MAX_ENTRIES) cachedResults.value.length = MAX_ENTRIES

    return newResults
  }

  onMount(() => {
    const handler = async () => {
      liveQuery = page.state.locationQuery
      currentResults = await loadResults()
    }
    window.addEventListener('popstate', handler)

    return () => window.removeEventListener('popstate', handler)
  })
</script>

<LocationList
  placeholderEmpty={`No results for "${page.state.locationQuery}".\nTry rephrasing your search!`}
  placeholderNull="Search will start when you finish typing."
  placeholderLoading={`Looking up "${page.state.locationQuery}"...`}
  loading={isLoading}
  items={currentResults?.map((r) => ({
    id: ITEM_ID_TEMPORARY,
    icon: classIconMap[r.category ?? r.class ?? ''],
    label: r.name !== '' ? r.name : typeToString(r.type),
    sublabel: r.display_name,
    coordinates: {
      latitude: parseFloat(r?.lat),
      longitude: parseFloat(r?.lon),
      altitude: null,
    },
    select: () => {
      selectedLocation.set({
        type: 'search',
        coordinates: {
          latitude: parseFloat(r?.lat),
          longitude: parseFloat(r?.lon),
          altitude: null,
        },
      })
      locationSearch.hide()
    },
  })) ?? null}
/>

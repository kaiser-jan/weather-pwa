import { debounce } from '$lib/utils/common'
import { persisted } from 'svelte-persisted-store'
import { get, readonly, writable } from 'svelte/store'

export function useApiSearch<ResultT>({
  key,
  fetch,
}: {
  key: string
  fetch: (query: string) => Promise<ResultT | null>
}) {
  let loading = writable(false)

  let latestQuery = writable<string | null>(null)
  let liveQuery = writable<string | null>(null)
  let result = writable<ResultT | null>(null)
  const cache = persisted<{ query: string; result: ResultT }[]>(key, [])

  const debouncedLoadResults = debounce(load, 1000)

  liveQuery.subscribe((q) => {
    if (q && q !== get(latestQuery)) {
      const cache = readCache(q)

      if (cache) {
        result.set(cache)
        latestQuery.set(q)
      } else {
        debouncedLoadResults()
      }
    }
  })

  async function load() {
    // create a copy to keep during async calls
    const query = get(liveQuery)

    if (!query || query === null || query === '') return

    loading.set(true)
    latestQuery.set(query)

    const cache = readCache(query)
    if (cache) {
      result.set(cache)
    } else {
      const fetchResult = await fetch(query)
      result.set(fetchResult)
      if (fetchResult) writeToCache(query, fetchResult)
    }

    loading.set(false)
  }

  function readCache(query: string): ResultT | null {
    const _cache = get(cache)
    const cachedIndex = _cache.findIndex((c) => c.query === query)
    const cached = _cache[cachedIndex]

    if (!cached) return null

    // move to front
    _cache.splice(cachedIndex, 1)
    _cache.unshift(cached)
    cache.set(_cache)

    return cached.result
  }

  function writeToCache(query: string, result: ResultT) {
    const MAX_ENTRIES = 10
    const _cache = get(cache)
    _cache.unshift({ query, result })
    if (_cache.length > MAX_ENTRIES) _cache.length = MAX_ENTRIES
    cache.set(_cache)
  }

  return {
    liveQuery,
    query: readonly(latestQuery),
    loading: readonly(loading),
    result: readonly(result),
    cache: readonly(cache),
    search: (_query?: string) => {
      if (_query) liveQuery.set(_query)
      load()
    },
    clear: () => {
      liveQuery.set(null)
      latestQuery.set(null)
      result.set(null)
    },
  }
}

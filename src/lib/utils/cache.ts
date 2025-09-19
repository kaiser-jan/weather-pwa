import { deepEqual } from '$lib/utils/common'
import { DateTime, Duration } from 'luxon'

const MAX_ENTRIES = 10
const MIN_INTERVAL = Duration.fromObject({ minutes: 5 })
const PERSISTANT_LOCAL_STORAGE_KEYS: string[] = ['settings'] as const

type CacheEntry<T, P> = {
  data: T
  params: P
  expires: string
  updatedAt: string
}

/**
 * Handles caching and refetching when necessary.
 *
 * Tries to retrieve a cached value from localStorage which matches the params.
 * If there is one, validates its expiry.
 * If no valid cache entry was found, initiates the fetch callback and adds it to the cache.
 *
 * The number of cache entries is limited per key.
 * There is a minimum interval between refetches, so servers serving outdated data don't get spammed.
 */
export async function useCache<T, P>(
  key: string,
  params: P,
  fetchFn: () => Promise<{ data: T; expiresAt: DateTime }>,
): Promise<{ data: T; expiresAt: DateTime; updatedAt: DateTime; cached: boolean }> {
  let entries: CacheEntry<T, P>[] = []

  // try to retrieve json from localStorage
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const json = JSON.parse(raw)
      entries = json
    }
  } catch {}

  if (!Array.isArray(entries)) entries = []

  for (const entry of entries) {
    // ensure the params match
    if (!deepEqual(entry.params, params)) continue

    const expired = DateTime.fromISO(entry.expires) < DateTime.now()
    const recent = DateTime.fromISO(entry.updatedAt) > DateTime.now().minus(MIN_INTERVAL)
    console.debug(`${key}: ${expired ? 'EXPIRED ' : ''}cache -> ${entry.expires}.`, JSON.stringify(entry.params))

    // return a valid cache hit
    const valid = !expired || recent
    if (valid)
      return {
        data: entry.data,
        expiresAt: DateTime.fromISO(entry.expires),
        updatedAt: DateTime.fromISO(entry.updatedAt),
        cached: true,
      }
  }

  console.debug(`Fetching new data for ${key}...`, JSON.stringify(params))
  const { data, expiresAt } = await fetchFn()
  const newEntry: CacheEntry<T, P> = {
    data,
    params,
    expires: expiresAt.toISO() ?? DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  }

  // adds to the cache and limits the cache size
  entries.unshift(newEntry)
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES
  localStorage.setItem(key, JSON.stringify(entries))

  return { data, expiresAt: expiresAt, updatedAt: DateTime.now(), cached: false }
}

/**
 * Deletes everything from localStorage which is not in PERSISTANT_LOCAL_STORAGE_KEYS
 */
export function clearCache() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)!
    if (!PERSISTANT_LOCAL_STORAGE_KEYS.includes(key)) {
      localStorage.removeItem(key)
    }
  }
}

/**
 * Deletes the whole localStorage, sessionStorage and indexedDB.
 */
export function resetApp() {
  localStorage.clear()
  sessionStorage.clear()
  indexedDB.databases?.().then((dbs) => {
    dbs?.forEach((db) => indexedDB.deleteDatabase(db.name!))
  })

  location.reload()
}

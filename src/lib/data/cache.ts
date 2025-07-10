import { deepEqual } from '$lib/utils'
import { DateTime } from 'luxon'

type CacheEntry<T, P> = {
  data: T
  params: P
  expires: string
  updatedAt: string
}

const MAX_ENTRIES = 5

function getEntries<T, P>(key: string): CacheEntry<T, P>[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const json = JSON.parse(raw)
    return json
  } catch {
    return null
  }
}

export async function useCache<T, P>(
  key: string,
  params: P,
  fetchFn: () => Promise<{ data: T; expires: DateTime }>,
): Promise<T> {
  let entries: CacheEntry<T, P>[] = getEntries(key) ?? []

  if (!Array.isArray(entries)) entries = []

  for (const entry of entries) {
    if (!deepEqual(entry.params, params)) continue
    const expired = DateTime.fromISO(entry.expires) < DateTime.now()
    const recent = DateTime.fromISO(entry.updatedAt) > DateTime.now().minus({ minutes: 5 })
    const valid = !expired || recent
    if (valid) return entry.data
  }

  const { data, expires } = await fetchFn()
  const newEntry: CacheEntry<T, P> = {
    data,
    params,
    expires: expires.toISO() ?? DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  }

  const updated = entries.filter((e) => !deepEqual(e.params, params))
  updated.unshift(newEntry)
  if (updated.length > MAX_ENTRIES) updated.length = MAX_ENTRIES
  localStorage.setItem(key, JSON.stringify(updated))

  return data
}

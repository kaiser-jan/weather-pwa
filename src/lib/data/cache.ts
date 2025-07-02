import { DateTime } from 'luxon'

type CacheEntry<T> = {
  data: T
  expires: string // ISO string
  updatedAt: string
}

function getStored<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed: CacheEntry<T> = JSON.parse(raw)

    // NOTE: sometimes the expiry is incorrect so we still cache for a short duration
    const isExpired = DateTime.fromISO(parsed.expires) < DateTime.now()
    const isVeryRecent = DateTime.fromISO(parsed.updatedAt) > DateTime.now().minus({ minutes: 2 })
    if (isExpired && !isVeryRecent) return null

    return parsed
  } catch {
    return null
  }
}

function setStored<T>(key: string, entry: CacheEntry<T>) {
  localStorage.setItem(key, JSON.stringify(entry))
}

export async function useCache<T>(key: string, fetchFn: () => Promise<{ data: T; expires: DateTime }>): Promise<T> {
  const cached = getStored<T>(key)
  if (cached) return cached.data

  const { data, expires } = await fetchFn()

  const entry = {
    data,
    expires: expires.toISO() ?? DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  }
  setStored(key, entry)
  return data
}

import type { TimeBucket } from '$lib/types/data'
import { page } from '$app/state'
import { goto, pushState, replaceState } from '$app/navigation'
import { forecastStore } from './data'
import { get, writable } from 'svelte/store'
import { popUntil } from '$lib/utils'
import type { ForecastMetric } from '$lib/config/metrics'
import { settings } from '$lib/stores/settings'
import { queryParameters, ssp } from 'sveltekit-search-params'
import { DateTime } from 'luxon'
import type { EncodeAndDecodeOptions } from 'sveltekit-search-params/sveltekit-search-params'

export const locationSearch = {
  hide: () => popUntil((s) => !s.showLocationSearch),
  show: () => pushState('', { ...page.state, showLocationSearch: true, locationQuery: null }),
}

export const dayView = {
  hide: async () => {
    history.go(-1)
  },
  open: (target: TimeBucket | undefined, metrics: ForecastMetric[] = []) => {
    if (!target) return
    if (page.url.searchParams.get('day') !== null) return

    const metricsToDisplay = metrics.length
      ? metrics
      : structuredClone(get(settings).sections.components.chart.plottedMetrics)

    const forecast = get(forecastStore)
    if (!forecast) return

    dayView.push(DateTime.fromMillis(target.timestamp), metricsToDisplay, {})
  },
  push: (datetime: DateTime, newMetrics: ForecastMetric[] | null, opts: Parameters<typeof goto>[1]) => {
    let metrics
    if (newMetrics) metrics = JSON.stringify(newMetrics)
    else metrics = page.url.searchParams.get('metrics') ?? []
    goto(`/day?day=${datetime.toISODate()}&metrics=${metrics}`, opts)
  },
  replace: (datetime: DateTime, newMetrics: ForecastMetric[] | null) => {
    dayView.push(datetime, newMetrics, { replaceState: true })
  },
  select: (target: TimeBucket) => {
    const forecast = get(forecastStore)
    if (!forecast) return
    dayView.replace(DateTime.fromMillis(target.timestamp), null)
  },
  previous: () => navigateBy(-1),
  next: () => navigateBy(1),
}

async function navigateBy(direction: 1 | -1) {
  const currentRaw = page.url.searchParams.get('day')
  if (currentRaw === null) return
  const current = DateTime.fromISO(currentRaw)
  if (!current.isValid) return
  const target = current.plus({ day: direction })
  const doesDayExist = get(forecastStore)?.daily?.find((d) => d.timestamp === target.toMillis()) !== undefined
  if (!doesDayExist) return
  dayView.replace(target, null)
}

export function openSettingsAt(path: string[]) {
  const params = queryParameters<{ 'settings-path': EncodeAndDecodeOptions<string[]> }>({
    'settings-path': ssp.array([] as string[]),
  })
  params['settings-path']! = path
}

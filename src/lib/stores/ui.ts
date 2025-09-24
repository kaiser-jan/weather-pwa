import type { TimeBucket } from '$lib/types/data'
import { page } from '$app/state'
import { goto, pushState, replaceState } from '$app/navigation'
import { forecastStore } from './data'
import { get, writable } from 'svelte/store'
import { popUntil } from '$lib/utils'
import type { ForecastMetric } from '$lib/config/metrics'
import { settings } from '$lib/stores/settings'

export const locationSearch = {
  hide: () => popUntil((s) => !s.showLocationSearch),
  show: () => pushState('', { ...page.state, showLocationSearch: true, locationQuery: null }),
}

export const dayView = {
  _initialIndex: null as number | null,

  hide: async () => {
    history.go(-1)
  },
  open: (target: TimeBucket | undefined, metrics: ForecastMetric[] = []) => {
    if (!target) return
    if (page.url.searchParams.get('dayIndex') !== null) return

    const metricsToDisplay = metrics.length
      ? metrics
      : structuredClone(get(settings).sections.components.chart.plottedMetrics)

    const forecast = get(forecastStore)
    if (!forecast) return
    const targetIndex = forecast.daily.findIndex((d) => d.timestamp === target.timestamp)

    dayView._initialIndex = targetIndex
    dayView.push(targetIndex, metricsToDisplay, {})
  },
  push: (index: number, newMetrics: ForecastMetric[] | null, opts: Parameters<typeof goto>[1]) => {
    let metrics
    if (newMetrics) metrics = JSON.stringify(newMetrics)
    else metrics = page.url.searchParams.get('metrics') ?? []
    goto(`/day?dayIndex=${index}&metrics=${metrics}`, opts)
  },
  replace: (index: number, newMetrics: ForecastMetric[] | null) => {
    dayView.push(index, newMetrics, { replaceState: true })
  },
  select: (target: TimeBucket) => {
    const forecast = get(forecastStore)
    if (!forecast) return
    const targetIndex = forecast.daily.findIndex((d) => d.timestamp === target.timestamp)
    dayView.replace(targetIndex, null)
  },
  previous: () => navigateBy(-1),
  next: () => navigateBy(1),
}

async function navigateBy(direction: 1 | -1) {
  const currentIndex = parseInt(page.url.searchParams.get('dayIndex')!)
  if (currentIndex === null) return
  const targetIndex = currentIndex + direction
  const doesDayExist = get(forecastStore)?.daily?.[targetIndex] !== undefined
  if (!doesDayExist) return
  dayView.replace(targetIndex, null)
}

export function openSettingsAt(path: string[]) {
  pushState('', {
    ...page.state,
    showLocationSearch: false,
    showSettings: true,
    settingsPath: path,
  })
}

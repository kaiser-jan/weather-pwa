import type { TimeBucket } from '$lib/types/data'
import { page } from '$app/state'
import { goto, pushState } from '$app/navigation'
import { forecastStore } from './data'
import { get, writable } from 'svelte/store'
import { popUntil } from '$lib/utils'
import type { ForecastMetric } from '$lib/config/metrics'
import { settings } from '$lib/settings/store'

export const locationSearch = {
  hide: () => popUntil((s) => !s.showLocationSearch),
  show: () => pushState('', { ...page.state, showLocationSearch: true, locationQuery: null }),
}

export const dayView = {
  _initialIndex: null as number | null,

  hide: async () => {
    // fallback
    if (dayView._initialIndex === null) {
      popUntil((s, p) => !p.dayIndex)
      return
    }

    const back = Math.abs(parseInt(page.url.searchParams.get('dayIndex')!) - dayView._initialIndex)
    history.go(-back - 1)
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
    dayView.push(targetIndex, metricsToDisplay)
  },
  push: (index: number, metrics?: ForecastMetric[]) => {
    goto(`/day?dayIndex=${index}&metrics=${JSON.stringify(metrics)}`)
  },
  select: (target: TimeBucket) => {
    const forecast = get(forecastStore)
    if (!forecast) return
    const targetIndex = forecast.daily.findIndex((d) => d.timestamp === target.timestamp)

    // go back to the initial index, then push the target index
    if (dayView._initialIndex !== null) {
      const back = Math.abs(parseInt(page.url.searchParams.get('dayIndex')!) - dayView._initialIndex)
      history.go(-back)
      if (dayView._initialIndex === targetIndex) return

      // NOTE: the complexity is necessary as history is event based async
      const handler = () => {
        window.removeEventListener('popstate', handler)
        dayView.push(targetIndex)
      }
      window.addEventListener('popstate', handler)
    } else {
      dayView.push(targetIndex)
    }
  },
  previous: () => navigateBy(-1),
  next: () => navigateBy(1),
}

async function navigateBy(direction: 1 | -1) {
  const currentIndex = parseInt(page.url.searchParams.get('dayIndex')!)
  if (currentIndex === null) return

  if (dayView._initialIndex === null) dayView._initialIndex = currentIndex
  const initialIndex = dayView._initialIndex

  const initialIndexDelta = initialIndex - currentIndex

  const targetIndex = currentIndex + direction
  if (!get(forecastStore)?.daily[targetIndex]) return

  // if we are navigating towards the initial index just pop state, otherwis push it
  if ((direction > 0 && initialIndexDelta > 0) || (direction < 0 && initialIndexDelta < 0)) {
    history.go(-Math.abs(direction))
  } else {
    dayView.push(currentIndex + direction)
  }
}

export function openSettingsAt(path: string[]) {
  pushState('', {
    ...page.state,
    showLocationSearch: false,
    showSettings: true,
    settingsPath: path,
  })
}

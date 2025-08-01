import type { TimeBucket } from '$lib/types/data'
import { page } from '$app/state'
import { pushState } from '$app/navigation'
import { forecastStore } from './data'
import { get } from 'svelte/store'
import { popUntil } from '$lib/utils'

export const locationSearch = {
  hide: () => popUntil((s) => !s.showLocationSearch),
  show: () => pushState('', { ...page.state, showLocationSearch: true, locationQuery: null }),
}

export const dayView = {
  _initialIndex: null as number | null,
  hide: async () => {
    // fallback
    if (dayView._initialIndex === null) {
      popUntil((s) => !s.selectedDayIndex)
      return
    }

    const back = Math.abs(page.state.selectedDayIndex - dayView._initialIndex)
    history.go(-back - 1)
  },
  open: (target: TimeBucket | null) => {
    if (!target) return
    if (page.state.selectedDayIndex !== undefined) return

    const forecast = get(forecastStore)
    if (!forecast) return
    const targetIndex = forecast.daily.findIndex((d) => d.timestamp === target.timestamp)

    dayView._initialIndex = targetIndex
    dayView.push(targetIndex)
  },
  push: (index: number) => {
    pushState('', { ...page.state, selectedDayIndex: index })
  },
  select: (target: TimeBucket) => {
    const forecast = get(forecastStore)
    if (!forecast) return
    const targetIndex = forecast.daily.findIndex((d) => d.timestamp === target.timestamp)

    navigateBy(targetIndex - page.state.selectedDayIndex)
  },
  previous: () => navigateBy(-1),
  next: () => navigateBy(1),
}

function navigateByFromInitial(currentIndex: number, delta: number) {
  const forecast = get(forecastStore)
  if (!forecast) return

  for (let i = 1; i <= Math.abs(delta); i++) {
    dayView.push(currentIndex + (delta > 0 ? i : -i))
  }
}

// NOTE: the complexity is necessary as history is event based async
async function navigateBy(direction: number) {
  if (direction === 0) return
  let currentIndex = page.state.selectedDayIndex
  const initialIndex = dayView._initialIndex
  if (currentIndex === null || initialIndex === null) return

  const initialIndexDelta = initialIndex - currentIndex
  if (initialIndexDelta) {
    const handler = () => {
      window.removeEventListener('popstate', handler)
      navigateByFromInitial(currentIndex + initialIndexDelta, direction - initialIndexDelta)
    }
    window.addEventListener('popstate', handler)
    history.go(-Math.abs(initialIndexDelta))
  } else {
    navigateByFromInitial(currentIndex, direction)
  }
}

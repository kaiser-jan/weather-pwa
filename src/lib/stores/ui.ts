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
  _selectedOnOpenTimestamp: null as number | null,
  hide: async () => {
    popUntil((s) => !s.selectedDayTimestamp)
  },
  // consider always setting today as root
  // selectRecursive: (target: TimeBucket | null) => {
  //   if (!target || !get(forecastStore)?.daily) return
  //   for (const day of get(forecastStore)!.daily) {
  //     dayView._select(day)
  //     if (day.datetime.toISO() === target.datetime.toISO()) return
  //   }
  // },
  open: (target: TimeBucket | null) => {
    if (!target) return
    dayView._selectedOnOpenTimestamp = target.timestamp
    dayView.select(target)
  },
  select: (target: TimeBucket) => {
    pushState('', { ...page.state, selectedDayTimestamp: target.timestamp })
  },
  previous: () => {
    if (!page.state.selectedDayTimestamp) return

    const isAfterInitial =
      !dayView._selectedOnOpenTimestamp || page.state.selectedDayTimestamp > dayView._selectedOnOpenTimestamp
    if (isAfterInitial) {
      history.back()
      return
    }

    const forecast = get(forecastStore)
    if (!forecast) return
    const currentIndex = forecast.daily.findIndex((d) => d.timestamp === page.state.selectedDayTimestamp!)
    dayView.select(forecast.daily[currentIndex - 1])
  },
  next: () => {
    if (!page.state.selectedDayTimestamp) return

    const isBeforeInitial =
      !dayView._selectedOnOpenTimestamp || page.state.selectedDayTimestamp < dayView._selectedOnOpenTimestamp
    if (isBeforeInitial) {
      history.back()
      return
    }

    const forecast = get(forecastStore)
    if (!forecast) return
    const currentIndex = forecast.daily.findIndex((d) => d.timestamp === page.state.selectedDayTimestamp!)
    dayView.select(forecast.daily[currentIndex + 1])
  },
}

import type { Coordinates, TimeBucket } from '$lib/types/data'
import { page } from '$app/state'
import { pushState } from '$app/navigation'
import { forecastStore } from './data'
import { get } from 'svelte/store'
import { DateTime } from 'luxon'
import { popUntil } from '$lib/utils'

export const locationSearch = {
  hide: () => popUntil((s) => !s.showLocationSearch),
  show: () => pushState('', { ...page.state, showLocationSearch: true, locationQuery: null }),
}

export const dayView = {
  _selectedOnOpen: null as DateTime | null,
  hide: async () => {
    popUntil((s) => !s.selectedDayDatetime)
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
    dayView._selectedOnOpen = target.datetime
    dayView.select(target)
  },
  select: (target: TimeBucket) => {
    pushState('', { ...page.state, selectedDayDatetime: target.datetime.toISO() })
  },
  previous: () => {
    if (!page.state.selectedDayDatetime) return

    const isAfterInitial =
      !dayView._selectedOnOpen || DateTime.fromISO(page.state.selectedDayDatetime) > dayView._selectedOnOpen
    if (isAfterInitial) {
      history.back()
      return
    }

    const forecast = get(forecastStore)
    if (!forecast) return
    const currentIndex = forecast.daily.findIndex((d) => d.datetime.toISO() === page.state.selectedDayDatetime!)
    dayView.select(forecast.daily[currentIndex - 1])
  },
  next: () => {
    if (!page.state.selectedDayDatetime) return

    const isBeforeInitial =
      !dayView._selectedOnOpen || DateTime.fromISO(page.state.selectedDayDatetime) < dayView._selectedOnOpen
    if (isBeforeInitial) {
      history.back()
      return
    }

    const forecast = get(forecastStore)
    if (!forecast) return
    const currentIndex = forecast.daily.findIndex((d) => d.datetime.toISO() === page.state.selectedDayDatetime!)
    dayView.select(forecast.daily[currentIndex + 1])
  },
}

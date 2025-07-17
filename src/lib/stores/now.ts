import { DateTime } from 'luxon'
import { writable } from 'svelte/store'

export const NOW = writable(DateTime.now())

// Start the first schedule
scheduleNextMinuteChange()

function onMinuteChange() {
  NOW.set(DateTime.now())
  scheduleNextMinuteChange()
}

function scheduleNextMinuteChange() {
  const millisecondsUntilNextMinute = 60 * 1000 - DateTime.now().second * 1000 - DateTime.now().millisecond
  setTimeout(onMinuteChange, millisecondsUntilNextMinute)
}

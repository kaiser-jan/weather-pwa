import { DateTime } from 'luxon'
import { writable } from 'svelte/store'

export const NOW = writable(DateTime.now(), () => {
  let minuteChangeTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  function updateNow() {
    NOW.set(DateTime.now())
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') updateNow()
  }

  function onMinuteChange() {
    NOW.set(DateTime.now())
    scheduleNextMinuteChange()
  }
  function scheduleNextMinuteChange() {
    const millisecondsUntilNextMinute = 60 * 1000 - DateTime.now().second * 1000 - DateTime.now().millisecond
    minuteChangeTimeout = setTimeout(onMinuteChange, millisecondsUntilNextMinute)
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  // Start the first schedule
  scheduleNextMinuteChange()

  return () => {
    clearTimeout(minuteChangeTimeout)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
})

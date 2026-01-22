import type { ColorStop } from '$lib/types/ui'
import { DateTime } from 'luxon'
import { colorToCss } from './color'

/**
 * Constructs a linear css gradient from the given stops in the given range.
 */
export function generateCssRangeGradient(
  rangeMin: number,
  rangeMax: number,
  stops: ColorStop[],
  direction: 'left' | 'top' | 'right' | 'bottom' = 'right',
): string {
  const includedStops = stops.filter((s) => s.threshold >= rangeMin && s.threshold <= rangeMax)

  const before = stops.findLast((s) => s.threshold < rangeMin)
  const after = stops.find((s) => s.threshold > rangeMax)

  if (before) includedStops.unshift(before)
  if (after) includedStops.push(after)

  const gradientStops = includedStops.map((s) => {
    const pos = ((s.threshold - rangeMin) / (rangeMax - rangeMin)) * 100
    return `${colorToCss(s)} ${pos}%`
  })

  return `background: linear-gradient(to ${direction}, ${gradientStops.join(', ')});`
}

export function interpolate(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

/**
 * Tries to format a datetime in the near future in a human readable way.
 * For today: HH:mm
 * For other days: short weekday with HH:mm
 */
export function formatRelativeDatetime(datetime: DateTime, options?: { omitDate?: boolean }) {
  const todayMidnight = DateTime.now().startOf('day')
  const inputDayMidnight = datetime.startOf('day')
  const isToday = inputDayMidnight.equals(todayMidnight)

  if (isToday || options?.omitDate) {
    return datetime.toFormat('HH:mm')
    // NOTE: this requires translation
    // } else if (inputDate.equals(today.plus({ days: 1 }))) {
    //   return `Tomorrow, ${datetime.toFormat('HH:mm')}`
  } else {
    return datetime.toFormat('ccc HH:mm')
  }
}

export function capitalizeFirstChar(word: string | undefined) {
  if (word === undefined || word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

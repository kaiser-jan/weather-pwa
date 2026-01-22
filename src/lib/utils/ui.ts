import type { ColorStop } from '$lib/types/ui'
import { DateTime } from 'luxon'

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
    return `${hslFromObject(s)} ${pos}%`
  })

  return `background: linear-gradient(to ${direction}, ${gradientStops.join(', ')});`
}

export function hslFromObject(color: Omit<ColorStop, 'value'>) {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`
}

export function interpolate(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

export function interpolateColor(stops: ColorStop[], value: number): string {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i],
      b = stops[i + 1]
    if (value >= a.threshold && value <= b.threshold) {
      const t = (value - a.threshold) / (b.threshold - a.threshold)
      const h = interpolate(a.h, b.h, t)
      const s = interpolate(a.s, b.s, t)
      const l = interpolate(a.l, b.l, t)
      const alpha = interpolate(a.a ?? 1, b.a ?? 1, t)
      return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
    }
  }
  const edge = value <= stops[0].threshold ? stops[0] : stops[stops.length - 1]
  return `hsl(${edge.h}, ${edge.s}%, ${edge.l}, ${edge.a ?? 1}%)`
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

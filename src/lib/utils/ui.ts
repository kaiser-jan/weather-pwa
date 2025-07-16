import type { ColorStop } from '$lib/types/ui'

export function generateCssRangeGradient(
  rangeMin: number,
  rangeMax: number,
  stops: ColorStop[],
  direction: 'left' | 'top' | 'right' | 'bottom' = 'right',
): string {
  const includedStops = stops.filter((s) => s.value >= rangeMin && s.value <= rangeMax)

  const before = [...stops].reverse().find((s) => s.value < rangeMin)
  const after = stops.find((s) => s.value > rangeMax)

  if (before) includedStops.unshift(before)
  if (after) includedStops.push(after)

  const gradientStops = includedStops.map((s) => {
    const pos = ((s.value - rangeMin) / (rangeMax - rangeMin)) * 100
    return `hsl(${s.h}, ${s.s}%, ${s.l}%) ${pos}%`
  })

  return `background: linear-gradient(to ${direction}, ${gradientStops.join(', ')});`
}

export function interpolate(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

export function interpolateColor(stops: ColorStop[], value: number): string {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i],
      b = stops[i + 1]
    if (value >= a.value && value <= b.value) {
      const t = (value - a.value) / (b.value - a.value)
      const h = interpolate(a.h, b.h, t)
      const s = interpolate(a.s, b.s, t)
      const l = interpolate(a.l, b.l, t)
      return `hsl(${h}, ${s}%, ${l}%)`
    }
  }
  const edge = value <= stops[0].value ? stops[0] : stops[stops.length - 1]
  return `hsl(${edge.h}, ${edge.s}%, ${edge.l}%)`
}

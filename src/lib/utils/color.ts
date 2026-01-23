import type { ColorOklch, WithCss, CategoryColor } from '$lib/types/ui'

export function parseOklch(str: string): WithCss<ColorOklch> {
  const match = str.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(deg)?(?:\s*\/\s*([\d.]+)%)?\s*\)/i)

  if (!match) {
    console.warn(`Invalid OKLCH string ${str}!`)
    return { l: 0, c: 0, h: 0, a: 1, css: str }
  }

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
    a: match[5] !== undefined ? parseFloat(match[5]) : 1,
    css: str,
  }
}

export function withCss(color: ColorOklch): WithCss<ColorOklch> {
  return {
    ...color,
    css: colorToCss(color),
  }
}

export function interpolateColor(stops: CategoryColor[], value: number): ColorOklch {
  if (stops.length === 0) return { l: 1, c: 1, h: 0, a: 1 }

  if (value <= stops[0].threshold) return stops[0].color
  if (value >= stops[stops.length - 1].threshold) return stops[stops.length - 1].color

  let left = stops[0]
  let right = stops[stops.length - 1]

  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i].threshold && value <= stops[i + 1].threshold) {
      left = stops[i]
      right = stops[i + 1]
      break
    }
  }

  const t = (value - left.threshold) / (right.threshold - left.threshold)

  const dh = ((right.color.h - left.color.h + 540) % 360) - 180

  return {
    l: left.color.l + (right.color.l - left.color.l) * t,
    c: left.color.c + (right.color.c - left.color.c) * t,
    h: (left.color.h + dh * t + 360) % 360,
    a: left.color.a + (right.color.a - left.color.a) * t,
  }
}

export function colorToCss(c: ColorOklch) {
  return `oklch(${c.l}% ${c.c} ${c.h} / ${c.a})`
}

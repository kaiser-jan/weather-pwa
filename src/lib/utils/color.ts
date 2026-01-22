import type { ParsedHsla } from '$lib/types/ui'

export function parseHsl(str: string): ParsedHsla {
  const match = str.match(/hsl\((\d+)[,\s]+([\d.]{1,3})%[,\s]+([\d.]{1,3})%\)/i)
  if (!match) {
    console.warn(`Invalid HSL string ${str}!`)
    return { h: 0, s: 100, l: 50, a: 1, css: str }
  }
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]), a: 1, css: str }
}

export function parseHsla(str: string): ParsedHsla {
  const match = str.match(/hsla\((\d+)[,\s]+([\d.]{1,3})%[,\s]+([\d.]{1,3})%[,\s]+([\d.]*)\)/i)
  if (!match) {
    console.warn(`Invalid HSLA string ${str}!`)
    return { h: 0, s: 100, l: 50, a: 1, css: str }
  }
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
    a: parseFloat(match[4]),
    css: str,
  }
}

export function parseHex(str: string): ParsedHsla {
  const hex = str.replace(/^#/, '')

  let r: number
  let g: number
  let b: number
  let a = 1

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16)
    g = parseInt(hex.slice(2, 4), 16)
    b = parseInt(hex.slice(4, 6), 16)
  } else if (hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16)
    g = parseInt(hex.slice(2, 4), 16)
    b = parseInt(hex.slice(4, 6), 16)
    a = parseInt(hex.slice(6, 8), 16) / 255
  } else {
    console.warn(`Invalid HEX string ${str}!`)
    return { h: 0, s: 100, l: 50, a: 1, css: str }
  }

  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  const delta = max - min
  let h = 0
  let s = 0

  if (delta !== 0) {
    s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min)
    switch (max) {
      case r / 255:
        h = ((g / 255 - b / 255) / delta) % 6
        break
      case g / 255:
        h = (b / 255 - r / 255) / delta + 2
        break
      case b / 255:
        h = (r / 255 - g / 255) / delta + 4
        break
    }
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: s * 100, l: l * 100, a, css: str }
}

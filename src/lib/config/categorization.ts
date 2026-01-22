// TODO: create a playground for adapting the colors

import type { ColorStop } from '$lib/types/ui'
import { parseOklch } from '$lib/utils/color'

type CategoryWithDescription = ColorStop & { description: string }

export const TEMPERATURE_CATEGORIES: ColorStop[] = [
  { threshold: -80, ...parseOklch('oklch(44% 0.15 26)') },
  { threshold: -20, ...parseOklch('oklch(38% 0.17 295)') },
  { threshold: -10, ...parseOklch('oklch(43% 0.16 266)') },
  { threshold: 0, ...parseOklch('oklch(100% 0.00 90)') },
  { threshold: 10, ...parseOklch('oklch(80% 0.09 187)') },
  { threshold: 15, ...parseOklch('oklch(82% 0.11 151)') },
  { threshold: 20, ...parseOklch('oklch(82% 0.19 135)') },
  { threshold: 25, ...parseOklch('oklch(86% 0.14 94)') },
  { threshold: 30, ...parseOklch('oklch(70% 0.12 55)') },
  { threshold: 40, ...parseOklch('oklch(46% 0.13 35)') },
]

// https://airindex.eea.europa.eu/AQI/index.html#
export const EAQI = {
  colors: [
    parseOklch('oklch(67% 0.13 145)'),
    parseOklch('oklch(81% 0.15 126)'),
    parseOklch('oklch(86% 0.16 99)'),
    parseOklch('oklch(83% 0.15 84)'),
    parseOklch('oklch(74% 0.15 61)'),
    parseOklch('oklch(58% 0.20 30)'),
  ],
  labels: ['Good', 'Fair', 'Medium', 'Poor', 'Very Poor', 'Extremely Poor'],

  limits: {
    pm25: [0, 6, 16, 51, 91, 141],
    pm10: [0, 16, 46, 121, 196, 271],
    o3: [0, 61, 101, 121, 161, 181],
    no2: [0, 11, 26, 61, 101, 151],
    // so2: [0, 21, 41, 126, 191, 276],
  },
}

// https://en.wikipedia.org/wiki/Precipitation_types#Intensity
export const RAIN_CATEGORIES: CategoryWithDescription[] = [
  { threshold: 0, ...parseOklch('oklch(68% 0.09 249 / 40%)'), description: 'Drizzle' },
  { threshold: 0.2, ...parseOklch('oklch(63% 0.11 257 / 70%)'), description: 'Light Rain' },
  { threshold: 2.5, ...parseOklch('oklch(53% 0.15 267 / 90%)'), description: 'Moderate Rain' },
  { threshold: 7.2, ...parseOklch('oklch(40% 0.18 278 / 100%)'), description: 'Heavy Rain' },
  { threshold: 25, ...parseOklch('oklch(39% 0.16 297 / 100%)'), description: 'Extreme Rain' },
  { threshold: 50, ...parseOklch('oklch(51% 0.23 311 / 100%)'), description: 'Violent Rain' },
] as const

// https://www.researchgate.net/figure/Dew-point-Humidity-and-corresponding-Human-Perception_tbl5_312498146
export const DEW_POINT_CATEGORIES: CategoryWithDescription[] = [
  { threshold: -20, ...parseOklch('oklch(46% 0.16 296)'), description: 'Very Dry' },
  { threshold: -10, ...parseOklch('oklch(47% 0.17 277)'), description: 'Very Dry' },
  { threshold: 0, ...parseOklch('oklch(61% 0.12 252)'), description: 'Dry' },
  { threshold: 6, ...parseOklch('oklch(75% 0.08 225)'), description: 'Dry' },
  { threshold: 10, ...parseOklch('oklch(80% 0.18 136)'), description: 'Great' },
  { threshold: 12, ...parseOklch('oklch(88% 0.16 125)'), description: 'Fair' },
  { threshold: 16, ...parseOklch('oklch(89% 0.15 104)'), description: 'Ok' },
  { threshold: 18, ...parseOklch('oklch(78% 0.13 73)'), description: 'Humid' },
  { threshold: 21, ...parseOklch('oklch(76% 0.12 47)'), description: 'Very Humid' },
  { threshold: 24, ...parseOklch('oklch(70% 0.15 33)'), description: 'Extremely Humid' },
  { threshold: 26, ...parseOklch('oklch(61% 0.20 304)'), description: 'Dangerously Humid' },
] as const

export const UVI_COLORS = [
  '#658D1B',
  '#84BD00',
  '#97D700',
  '#F7EA48',
  '#FCE300',
  '#FFCD00',
  '#ECA154',
  '#FF8200',
  '#EF3340',
  '#DA291C',
  '#BF0D3E',
  '#4B1E88',
  '#62359F',
  '#794CB6',
  '#9063CD',
  '#A77AE4',
  '#BE91FB',
  '#D5A8FF',
  '#ECBFFF',
  '#FFD6FF',
  '#FFEDFF',
  '#FFFFFF',
] as const

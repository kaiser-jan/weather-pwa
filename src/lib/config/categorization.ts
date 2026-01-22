// TODO: create a playground for adapting the colors

import type { ColorStop } from '$lib/types/ui'
import { parseHex, parseHsl, parseHsla } from '$lib/utils/color'

type CategoryWithDescription = ColorStop & { description: string }

export const TEMPERATURE_CATEGORIES: ColorStop[] = [
  { threshold: -80, ...parseHsl('hsl(360, 65%, 35%)') },
  { threshold: -20, ...parseHsl('hsl(264 65% 35%)') },
  { threshold: -10, ...parseHsl('hsl(0, 0%, 100%)') },
  { threshold: 0, ...parseHsl('hsl(225 65% 40%)') },
  { threshold: 10, ...parseHsl('hsl(174, 49%, 64%)') },
  { threshold: 15, ...parseHsl('hsl(134, 47%, 70%)') },
  { threshold: 20, ...parseHsl('hsl(96, 67%, 60%)') },
  { threshold: 25, ...parseHsl('hsl(47, 83%, 63%)') },
  { threshold: 30, ...parseHsl('hsl(25, 62%, 58%)') },
  { threshold: 40, ...parseHsl('hsl(12, 66%, 35%)') },
]

// https://airindex.eea.europa.eu/AQI/index.html#
export const EAQI = {
  colors: [
    parseHex('#5AAA5F'),
    parseHex('#A7D25C'),
    parseHex('#ECD347'),
    parseHex('#F5BE41'),
    parseHex('#F09235'),
    parseHex('#D93322'),
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
  { threshold: 0, ...parseHsla('hsla(210, 50%, 62%, 0.4)'), description: 'Drizzle' },
  { threshold: 0.2, ...parseHsla('hsla(215, 50%, 58%, 0.7)'), description: 'Light Rain' },
  { threshold: 2.5, ...parseHsla('hsla(225, 50%, 52%, 0.9)'), description: 'Moderate Rain' },
  { threshold: 7.2, ...parseHsla('hsla(245, 55%, 42%, 1)'), description: 'Heavy Rain' },
  { threshold: 25, ...parseHsla('hsla(265, 60%, 35%, 1)'), description: 'Extreme Rain' },
  { threshold: 50, ...parseHsla('hsla(280, 70%, 45%, 1)'), description: 'Violent Rain' },
] as const

// https://www.researchgate.net/figure/Dew-point-Humidity-and-corresponding-Human-Perception_tbl5_312498146
export const DEW_POINT_CATEGORIES: CategoryWithDescription[] = [
  { threshold: 0, ...parseHsl('hsl(211 54% 53%)'), description: 'Dry' },
  { threshold: 6, ...parseHsl('hsl(197 54% 64%)'), description: 'Dry' },
  { threshold: 10, ...parseHsl('hsl(100 60% 60%)'), description: 'Great' },
  { threshold: 12, ...parseHsl('hsl(80 75% 66%)'), description: 'Fair' },
  { threshold: 16, ...parseHsl('hsl(55 78% 63%)'), description: 'Ok' },
  { threshold: 18, ...parseHsl('hsl(35 79% 62%)'), description: 'Humid' },
  { threshold: 21, ...parseHsl('hsl(20 78% 68%)'), description: 'Very Humid' },
  { threshold: 24, ...parseHsl('hsl(10 80% 65%)'), description: 'Extremely Humid' },
  { threshold: 26, ...parseHsl('hsl(270 70% 62%)'), description: 'Dangerously Humid' },
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

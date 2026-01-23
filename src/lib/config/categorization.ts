// TODO: create a playground for adapting the colors

import type { ColorStop } from '$lib/types/ui'
import { parseOklch } from '$lib/utils/color'

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

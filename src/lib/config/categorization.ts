// TODO: create a playground for adapting the colors

// https://airindex.eea.europa.eu/AQI/index.html#
export const EAQI = {
  colors: [
    { h: 132, s: 35, l: 51 }, // #5AAA5F
    { h: 77, s: 57, l: 59 }, // #A7D25C
    { h: 52, s: 82, l: 60 }, // #ECD347
    { h: 41, s: 89, l: 61 }, // #F5BE41
    { h: 27, s: 85, l: 58 }, // #F09235
    { h: 6, s: 73, l: 50 }, // #D93322
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
export const RAIN_CATEGORIES: {
  threshold: number // mm
  color: string // hsla
  description: string
}[] = [
  { threshold: 0, color: 'hsla(210, 50%, 62%, 0.4)', description: 'Drizzle' },
  { threshold: 0.2, color: 'hsla(215, 50%, 58%, 0.7)', description: 'Light Rain' },
  { threshold: 2.5, color: 'hsla(225, 50%, 52%, 0.9)', description: 'Moderate Rain' },
  { threshold: 7.2, color: 'hsla(245, 55%, 42%, 1)', description: 'Heavy Rain' },
  { threshold: 25, color: 'hsla(265, 60%, 35%, 1)', description: 'Extreme Rain' },
  { threshold: 50, color: 'hsla(280, 70%, 45%, 1)', description: 'Violent Rain' },
] as const

// https://www.researchgate.net/figure/Dew-point-Humidity-and-corresponding-Human-Perception_tbl5_312498146
export const DEW_POINT_CATEGORIES: {
  threshold: number // °C
  color: string // hsla
  description: string
}[] = [
  { threshold: 0, color: 'hsl(211 54% 53%)', description: 'Dry' },
  { threshold: 6, color: 'hsl(197 54% 64%)', description: 'Dry' },
  { threshold: 10, color: 'hsl(100 60% 60%)', description: 'Great' },
  { threshold: 12, color: 'hsl(80 75% 66%)', description: 'Fair' },
  { threshold: 16, color: 'hsl(55 78% 63%)', description: 'Ok' },
  { threshold: 18, color: 'hsl(35 79% 62%)', description: 'Humid' },
  { threshold: 21, color: 'hsl(20 78% 68%)', description: 'Very Humid' },
  { threshold: 24, color: 'hsl(10 80% 65%)', description: 'Extremely Humid' },
  { threshold: 26, color: 'hsl(270 70% 62%)', description: 'Dangerously Humid' },
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

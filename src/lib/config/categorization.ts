// TODO: create a playground for adapting the colors

export const EAQI = {
  colors: [
    { h: 132, s: 35, l: 51 }, // #5AAA5F
    { h: 77, s: 57, l: 59 }, // #A7D25C
    { h: 52, s: 82, l: 60 }, // #ECD347
    { h: 41, s: 89, l: 61 }, // #F5BE41
    { h: 27, s: 85, l: 58 }, // #F09235
    { h: 6, s: 73, l: 50 }, // #D93322
  ],
  labels: ['Very good', 'Good', 'Medium', 'Poor', 'Very Poor', 'Extremely Poor'],

  limits: {
    o3: [0, 50, 100, 130, 240, 380, 800],
    no2: [0, 40, 90, 120, 230, 340, 1000],
    // so2: [0, 100, 200, 350, 500, 750, 1250],
    pm25: [0, 20, 40, 50, 100, 150, 1200],
    pm10: [0, 10, 20, 25, 50, 75, 800],
  },
}

// https://en.wikipedia.org/wiki/Precipitation_types#Intensity
export const RAIN_CATEGORIES: {
  threshold: number // mm
  color: string // hsla
  description: string
}[] = [
  { threshold: -1, color: 'hsla(0, 0%, 0%, 0)', description: 'No Rain' },
  { threshold: 0.01, color: 'hsla(210, 50%, 55%, 0.4)', description: 'Drizzle' },
  { threshold: 0.2, color: 'hsla(210, 50%, 55%, 0.7)', description: 'Light Rain' },
  { threshold: 2.5, color: 'hsla(215, 50%, 55%, 1)', description: 'Moderate Rain' },
  { threshold: 5, color: 'hsla(225, 50%, 40%, 1)', description: 'Heavy Rain' },
  { threshold: 10, color: 'hsla(230, 65%, 32%, 1)', description: 'Very Heavy Rain' },
  { threshold: 20, color: 'hsla(255, 60%, 35%, 1)', description: 'Extreme Rain' },
  { threshold: 50, color: 'hsla(270, 70%, 45%, 1)', description: 'Violent Rain' },
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

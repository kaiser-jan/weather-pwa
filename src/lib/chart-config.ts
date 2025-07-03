import { CloudyIcon, ThermometerIcon, UmbrellaIcon } from 'lucide-svelte'
import type { WeatherMetricKey } from './types/data'
import type { SeriesDetails } from './types/ui'
import { CONFIG } from './config'

export const CHART_SERIES_DETAILS: Partial<Record<WeatherMetricKey, SeriesDetails>> = {
  temperature: {
    domain: [0, 40],
    style: 'line',
    icon: ThermometerIcon,
    class: '',
    formatter: (d) => `${d}°`,
    gradientColorStops: CONFIG.appearance.colors.temperatureColorStops,
  },
  cloud_coverage: {
    domain: [0, 1],
    style: 'bars',
    icon: CloudyIcon,
    class: 'fill-blue-200 opacity-15',
    formatter: (d) => `${d * 100}%`,
    hideScale: true,
    // TODO: implement invert
    invert: true,
  },
  precipitation_amount: {
    domain: [0, 50],
    style: 'bars',
    icon: UmbrellaIcon,
    class: 'fill-blue-300 opacity-80',
    formatter: (d) => `${d}mm`,
    scaleOnRight: true,
  },
} as const

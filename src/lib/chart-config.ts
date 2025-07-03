import {
  CloudyIcon,
  DropletIcon,
  GaugeIcon,
  SoapDispenserDropletIcon,
  ThermometerIcon,
  UmbrellaIcon,
  WindIcon,
} from 'lucide-svelte'
import type { WeatherMetricKey } from './types/data'
import type { SeriesDetails } from './types/ui'
import { CONFIG } from './config'

// TODO: axis formatter vs value formatter
// consider switching to units and auto multiplying with 100 for %
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
  wind_speed: {
    domain: [0, 118 / 3.6],
    style: 'line',
    icon: WindIcon,
    class: 'stroke-blue-100 opacity-80',
    formatter: (d) => `${Math.round(d)}m/s`,
    scaleOnRight: true,
  },
  relative_humidity: {
    domain: [0, 100],
    style: 'line',
    icon: DropletIcon,
    class: 'stroke-green-300 opacity-80',
    formatter: (d) => `${Math.round(d)}%`,
    scaleOnRight: true,
    hideScale: true,
  },
  pressure: {
    domain: [970 * 100, 1050 * 100],
    style: 'line',
    icon: GaugeIcon,
    class: 'stroke-purple-300 opacity-80',
    formatter: (d) => `${Math.round(d) / 100}hPa`,
    scaleOnRight: false,
  },
  // TODO: uvi_clear_sky provides no value
  // consider calculating it ourselves and involving the cloud coverage
  //
  // uvi_clear_sky: {
  //   domain: [0, 12],
  //   style: 'line',
  //   icon: SoapDispenserDropletIcon,
  //   class: 'stroke-orange-300 opacity-80',
  //   formatter: (d) => d.toString(),
  //   scaleOnRight: false,
  // },
} as const

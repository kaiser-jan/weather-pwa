import {
  CloudOffIcon,
  CloudyIcon,
  DropletIcon,
  GaugeIcon,
  ShieldIcon,
  SoapDispenserDropletIcon,
  SunIcon,
  ThermometerIcon,
  UmbrellaIcon,
  UmbrellaOffIcon,
  WindIcon,
  ZapIcon,
} from '@lucide/svelte'
import type { WeatherMetricKey } from './types/data'
import type { SeriesDetails } from './types/ui'
import { CONFIG } from './config'

export const CHART_SERIES_DETAILS: Partial<Record<WeatherMetricKey, SeriesDetails>> = {
  temperature: {
    domain: [0, 40],
    style: 'line',
    icon: ThermometerIcon,
    class: '',
    unit: '°',
    gradientColorStops: CONFIG.appearance.colors.temperatureColorStops,
  },
  cloud_coverage: {
    domain: [0, 100],
    style: 'bars',
    icon: CloudyIcon,
    iconIfZero: CloudOffIcon,
    class: 'fill-blue-200 opacity-15',
    unit: '%',
    hideScale: true,
    // TODO: implement invert
    invert: true,
  },
  precipitation_amount: {
    domain: [0, 50],
    style: 'bars',
    icon: UmbrellaIcon,
    iconIfZero: UmbrellaOffIcon,
    class: 'fill-blue-300 opacity-80',
    unit: 'mm/h',
    scaleOnRight: true,
  },
  // TODO: combine with gust speed
  wind_speed: {
    domain: [0, 118 / 3.6],
    style: 'line',
    icon: WindIcon,
    class: 'stroke-blue-100 opacity-80',
    unit: 'm/s',
    scaleOnRight: true,
  },
  relative_humidity: {
    domain: [0, 100],
    style: 'line',
    icon: DropletIcon,
    class: 'stroke-green-300 opacity-80',
    unit: '%',
    scaleOnRight: true,
    hideScale: true,
  },
  pressure: {
    domain: [970 * 100, 1050 * 100],
    style: 'line',
    icon: GaugeIcon,
    class: 'stroke-purple-300 opacity-80',
    unit: 'hPa',
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
  cape: {
    domain: [0, 1000],
    style: 'line',
    icon: ZapIcon,
    class: 'stroke-yellow-300 opacity-80',
    unit: 'm2/s2',
    scaleOnRight: false,
  },
  cin: {
    domain: [-500, 0],
    style: 'line',
    icon: ShieldIcon,
    class: 'stroke-orange-300 opacity-80',
    unit: 'J/kg',
    scaleOnRight: false,
  },
  grad: {
    domain: [-1000, 50_000_000],
    style: 'line',
    icon: SunIcon,
    class: 'stroke-yellow-300 opacity-80',
    unit: 'Ws/m2',
    scaleOnRight: false,
  },
} as const

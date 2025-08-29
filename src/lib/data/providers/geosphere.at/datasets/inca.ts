import type { Dataset } from '$lib/types/data/providers'
import { getForecastParametersFromConfig, type TimeSeriesConfig } from '$lib/utils/forecast/transformTimeseries'
import { DateTime, Duration } from 'luxon'
import type { ForecastParameter } from '$lib/types/data'

const AVAILABLE_WEATHER_PARAMETERS = [
  'GL', // global radiation (W m-2)
  'P0', // mean sea level pressure (Pa)
  'RH2M', // relative humidity 2m above ground (percent)
  'RR', // 1-hour precipitation sum (kg m-2)
  'T2M', // air temperature 2m above ground (degree_Celsius)
  // 'TD2M', // dew point temperature 2m above ground (degree_Celsius)
  'UU', // wind speed in eastward direction (m s-1)
  'VV', // wind speed in northward direction (m s-1)
] as const satisfies string[]

export const configs: TimeSeriesConfig<(typeof AVAILABLE_WEATHER_PARAMETERS)[number], ForecastParameter>[] = [
  { outKey: 'grad', inKey: 'GL', type: 'normal' },
  { outKey: 'pressure', inKey: 'P0', type: 'normal' },
  { outKey: 'relative_humidity', inKey: 'RH2M', type: 'normal' },
  { outKey: 'temperature', inKey: 'T2M', type: 'normal' },
  { outKey: 'precipitation_amount', inKey: 'RR', type: 'normal' },
  { outKeyLength: 'wind_speed', outKeyAngle: 'wind_degrees', xKey: 'UU', yKey: 'VV', type: 'vector' },
]

export default {
  id: 'geosphere.at_inca-v1-1h-1km',
  internalId: 'inca-v1-1h-1km',
  model: 'INCA',
  name: 'Analysis',
  url: 'https://data.hub.geosphere.at/dataset/inca-v1-1h-1km',
  parameters: getForecastParametersFromConfig(configs),
  temporalResolution: Duration.fromObject({ hours: 1 }),
  // TODO: add a start param or so instead
  baseForecastAge: DateTime.fromISO('2011-03-15T00:00+00:00').diffNow().negate(),
  updateFrequency: Duration.fromObject({ hours: 0 }),
  timespan: Duration.fromObject({ hours: 0 }),
  coverageArea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [8.098133748352293, 45.77222010581118],
          [17.742270413233744, 45.77222010581118],
          [17.742270413233744, 49.478175684609575],
          [8.098133748352293, 49.478175684609575],
          [8.098133748352293, 45.77222010581118],
        ],
      ],
    },
    properties: {},
  },
  spatialResolution: 1000,
} as const satisfies Dataset

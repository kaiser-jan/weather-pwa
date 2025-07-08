import type { Coordinates } from '$lib/types/data'
import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'
import { loadTimeseriesForecast } from './timeseries-forecast'

const meta: Dataset = {
  providerId: 'geosphere.at',
  name: 'AROME NWP',
  url: 'https://data.hub.geosphere.at/dataset/nwp-v1-1h-2500m',
  parameters: [
    'temperature',
    'temperature_min',
    'temperature_max',
    'precipitation_amount',
    'relative_humidity',
    'pressure',
    'cloud_coverage',
    'wind_speed',
    'wind_speed_gust',
    'wind_degrees',
    'wind_degrees_gust',
    'snow_amount',
    'cape',
    'cin',
    'grad',
  ],
  offset: Duration.fromObject({ hours: 4 }),
  interval: Duration.fromObject({ hours: 3 }),
  timespan: Duration.fromObject({ hours: 61 }),
  boundingBox: [
    { longitude: 5.498, latitude: 42.981 },
    { longitude: 22.102, latitude: 51.819 },
  ],
  spatialResolution: 2500,
}

export default {
  meta,
  load: (c: Coordinates) => loadTimeseriesForecast(c, 0),
  MAX_OFFSET: 5,
}

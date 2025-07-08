import { Duration } from 'luxon'
import { loadTimeseriesForecast } from './timeseries-forecast'
import type { Dataset } from '$lib/types/data/providers'
import type { Coordinates } from '$lib/types/data'

const meta: Dataset = {
  providerId: 'geosphere.at',
  name: 'INCA Nowcast',
  url: 'https://data.hub.geosphere.at/dataset/nowcast-v1-15min-1km',
  parameters: [
    'temperature',
    'precipitation_amount',
    'relative_humidity',
    'wind_speed',
    'wind_degrees',
    'wind_speed_gust',
  ],
  offset: Duration.fromObject({ minutes: 30 }),
  interval: Duration.fromObject({ minutes: 15 }),
  timespan: Duration.fromObject({ minutes: 195 }),
  boundingBox: [
    { longitude: 8.098, latitude: 45.502 },
    { longitude: 17.742, latitude: 49.478 },
  ],
  spatialResolution: 1000,
}

export default {
  meta,
  load: (c: Coordinates) => loadTimeseriesForecast(c, 0),
}

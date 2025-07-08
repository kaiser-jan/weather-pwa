import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'
import { loadLocationforecast } from './locationforecast'

const meta: Dataset = {
  providerId: 'met.no',
  name: 'Location Forecast',
  url: 'https://api.met.no/weatherapi/locationforecast/2.0/documentation',
  parameters: [
    'temperature',
    'pressure',
    'relative_humidity',
    'uvi_clear_sky',
    'cloud_coverage',
    'fog',
    'wind_speed',
    'wind_speed_gust',
    'wind_degrees',
    'precipitation_amount',
    'precipitation_probability',
    'thunder_probability',
  ],
  offset: null,
  interval: null,
  timespan: Duration.fromObject({ days: 10 }),
  boundingBox: [
    { longitude: -180, latitude: -90 },
    { longitude: 180, latitude: 90 },
  ],
}

export default {
  meta,
  load: loadLocationforecast,
}

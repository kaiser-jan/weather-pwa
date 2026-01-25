import type { ForecastParameter } from '$lib/types/data'
import type { Dataset, Loader } from '$lib/types/data/providers'
import { createOpenMeteoLoader } from '../../open-meteo.com/openMeteoLoader'
import { type DatasetId } from '../datasets'
import aromeFrance from '../datasets/arome-france'
import aromeFranceHd from '../datasets/arome-france-hd'
// import aromeFranceHd15min from '../datasets/arome-france-hd-15min'
import arpegeEurope from '../datasets/arpege-europe'
import arpegeWorld from '../datasets/arpege-world'

const parameters: ForecastParameter[] = [
  'temperature',
  'relative_humidity',
  'precipitation_amount',
  'rain_amount',
  'snow_amount',
  'wind_speed',
  'wind_degrees',
  'wind_speed_gust',
  'pressure_surface',
  'pressure_sealevel',
  'cloud_coverage',
] as const

export default [
  // createLoader(aromeFranceHd15min, 'minutely15'),
  createLoader(aromeFranceHd, 'hourly'),
  createLoader(aromeFrance, 'hourly'),
  createLoader(arpegeEurope, 'hourly'),
  createLoader(arpegeWorld, 'hourly'),
] as const satisfies Loader<DatasetId>[]

function createLoader(dataset: Dataset, interval: 'hourly' | 'minutely15') {
  return {
    id: 'open-meteo',
    name: 'Open Meteo',
    url: 'https://open-meteo.com/',
    datasetIds: [dataset.id as DatasetId],
    load: createOpenMeteoLoader({ dataset: dataset, interval, parameters }),
  } as const
}

import type { Duration } from 'luxon'
import type { Coordinates, ForecastParameter, MultivariateTimeSeries } from '.'
import type { Feature, Polygon } from 'geojson'

type ProviderId = string
type LoaderId = string
type DatasetId = string

export interface Provider {
  id: ProviderId
  name: string
  url: string
  country: string | null
  loaderIds: LoaderId[]
  datasetIds: DatasetId[]
}

export interface Loader<DatasetId extends string> {
  id: LoaderId
  name: string
  label?: string
  url?: string
  datasetIds: readonly DatasetId[]
  load: (coordinates: Coordinates) => Promise<MultivariateTimeSeries>
}

export interface Dataset {
  id: DatasetId
  name: string
  label: string
  url?: string
  parameters: ForecastParameter[]
  temporalResolution: Duration
  baseForecastAge: Duration | null
  updateFrequency: Duration
  timespan: Duration
  coverageArea: Feature<Polygon>
  spatialResolution: number // meters
}

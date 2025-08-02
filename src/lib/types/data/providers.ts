import type { DateTime, Duration } from 'luxon'
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

export type LoaderResult =
  | {
      success: true
      data: MultivariateTimeSeries
      cached: boolean
      updatedAt: DateTime
      refreshAt: DateTime
    }
  | {
      success: false
      error: string
    }

export interface Loader<DatasetId extends string> {
  id: LoaderId
  name: string
  url?: string
  datasetIds: readonly DatasetId[]
  load: (coordinates: Coordinates) => Promise<LoaderResult>
}

export interface Dataset {
  id: DatasetId
  model: string
  name: string
  url?: string
  parameters: ForecastParameter[]
  temporalResolution: Duration
  baseForecastAge: Duration | null
  updateFrequency: Duration
  timespan: Duration
  coverageArea: Feature<Polygon>
  spatialResolution: number // meters
}

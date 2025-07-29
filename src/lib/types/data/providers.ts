import type { Duration } from 'luxon'
import type { Coordinates, ForecastParameter, MultivariateTimeSeries } from '.'
import type { Feature, Geometry, Polygon } from 'geojson'

interface Coordinate2D {
  longitude: number
  latitude: number
}

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
  url?: string
  datasetIds: DatasetId[]
  load: (coordinates: Coordinates) => Promise<MultivariateTimeSeries>
}

export interface Dataset {
  id: DatasetId
  name: string
  label: string
  url?: string
  parameters: ForecastParameter[]
  offset: Duration | null
  interval: Duration | null
  timespan: Duration
  coverageArea: Feature<Polygon>
  spatialResolution: number // meters
}

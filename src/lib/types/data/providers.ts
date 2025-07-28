import type { Duration } from 'luxon'
import type { ForecastParameter } from '.'
import type { ProviderId } from '$lib/data/providers'

export interface Provider {
  name: string
  url: string
  country: string | null
}

interface Coordinate2D {
  longitude: number
  latitude: number
}

export interface Dataset {
  providerId: ProviderId
  name: string
  url: string
  parameters: ForecastParameter[]
  offset: Duration | null
  interval: Duration | null
  timespan: Duration
  boundingBox: [Coordinate2D, Coordinate2D]
  spatialResolution: number // meters
}

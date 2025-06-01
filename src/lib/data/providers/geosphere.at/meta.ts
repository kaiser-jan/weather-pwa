import type { Coordinates } from '$lib/types/data'
import type { Duration } from 'luxon'

export type GeosphereModelMeta<Parameters> = {
  reftimeOffset: Duration
  interval: Duration
  availableParameters: readonly Parameters[]
  maxOffset: number
  forecast_length: number
  bounding_box: [Coordinates, Coordinates]
  spatial_resolution_m: number
  // TODO: note what values it can provide
}

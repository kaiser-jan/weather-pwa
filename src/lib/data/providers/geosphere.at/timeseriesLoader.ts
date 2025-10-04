import { DateTime, Duration } from 'luxon'
import { useCache } from '$lib/utils/cache'
import { transformTimeSeries } from '$lib/utils/forecast/transformTimeseries'
import type { Coordinates, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import type { Dataset, Loader } from '$lib/types/data/providers'

type LoaderOptions = {
  dataset: Dataset
  mode: 'forecast' | 'historical'
  parameters: string[]
  configs: Parameters<typeof transformTimeSeries>[2]
  isPressureSurfaceLevel: boolean
}

export function createTimeseriesForecastLoader({ dataset, mode, parameters, configs }: LoaderOptions) {
  async function load(coordinates: Coordinates, offset = 0): ReturnType<Loader<string>['load']> {
    const now = DateTime.now()
    const url = new URL(`https://dataset.api.hub.geosphere.at/v1/timeseries/${mode}/${dataset.internalId}`)
    url.searchParams.set('lat_lon', `${coordinates.latitude},${coordinates.longitude}`)
    parameters.forEach((p) => url.searchParams.append('parameters', p))

    if (mode === 'forecast') {
      url.searchParams.set('start', now.startOf('day').toISO())
      url.searchParams.set('forecast_offset', offset.toString())
    } else {
      url.searchParams.set('start', now.startOf('day').minus({ days: 1 }).toISO())
      url.searchParams.set('end', now.toISO())
    }

    const result = await useCache(dataset.id, { coordinates, offset }, async () => {
      const response = await fetch(url.toString())
      const json = (await response.json()) as TimeseriesForecastGeoJsonSerializer

      // 503 { "message":"failure to get a peer from the ring-balancer" }
      if (!response.ok) throw (json as any).message ?? 'Fetch failed'

      const expiresAt =
        mode === 'forecast'
          ? DateTime.fromISO(json.reference_time as string)
              .plus(dataset.baseForecastAge ?? Duration.fromObject({}))
              .plus(dataset.updateFrequency.mapUnits((x) => x * (1 + offset)))
          : now.endOf('hour').plus({ milliseconds: 1 })

      return { data: json, expiresAt }
    })

    const timestamps = result.data.timestamps.map((t) => DateTime.fromISO(t as string).toMillis())

    const transformed = transformTimeSeries(
      timestamps,
      result.data.features[0].properties.parameters,
      configs,
      dataset.temporalResolution.toMillis(),
    )

    return {
      success: true,
      data: transformed,
      updatedAt: result.updatedAt,
      cached: result.cached,
      refreshAt: result.expiresAt,
    }
  }

  return load
}

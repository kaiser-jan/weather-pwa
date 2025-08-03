// lib/loaders/createTimeseriesForecastLoader.ts
import { DateTime, Duration } from 'luxon'
import { useCache } from '$lib/data/cache'
import { transformTimeSeries } from '$lib/utils/data'
import type { Coordinates, MultivariateTimeSeries } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import type { Dataset, Loader } from '$lib/types/data/providers'

type LoaderOptions = {
  dataset: Dataset
  mode: 'forecast' | 'historical'
  model: string
  parameters: string[]
  configs: Parameters<typeof transformTimeSeries>[2]
  isPressureSurfaceLevel: boolean
}

export function createTimeseriesForecastLoader({
  dataset,
  mode,
  model,
  parameters,
  configs,
  isPressureSurfaceLevel = false,
}: LoaderOptions) {
  async function load(coordinates: Coordinates, offset = 0): ReturnType<Loader<string>['load']> {
    const now = DateTime.now()
    const url = new URL(`https://dataset.api.hub.geosphere.at/v1/timeseries/${mode}/${model}`)
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

    if (isPressureSurfaceLevel) {
      if (coordinates.altitude != null) {
        transformed.pressure?.forEach((v, i) => {
          const p = v.value
          const t = transformed.temperature?.[i]?.value
          if (p != null && t != null) {
            transformed.pressure[i].value = convertSurfacePressureToSeaLevel(p, coordinates.altitude!, t)
          }
        })
      } else {
        console.warn('No altitude available, cannot convert surface pressure to sea level pressure!')
        delete transformed.pressure
      }
    }

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

function convertSurfacePressureToSeaLevel(P: number, h: number, t: number): number {
  const g = 9.80665 // m/s²
  const M = 0.0289644 // kg/mol
  const R = 8.31432 // J/(mol·K)
  const L = 0.0065 // K/m (lapse rate)

  const T = t + 273.15

  const factor = (g * M) / (R * L)
  const base = 1 - (L * h) / T

  return P * Math.pow(base, -factor)
}

import type { Coordinates, ForecastHour } from '$lib/types/data'
import type { TimeseriesForecastGeoJsonSerializer } from '$lib/types/geosphere-at'
import { calculateVector } from '$lib/utils'
import { REQUESTED_WEATHER_PARAMETERS, type RequestedWeatherParameter } from './meta'
import { useCache } from '../../cache'
import { DateTime, Duration } from 'luxon'
import { symbolToWeatherSituationMap } from './symbols'

const MODEL_REFTIME_DELTA = Duration.fromObject({ hours: 6 })

type BBox = [number, number, number, number]

interface GridMetadata {
  crs: string
  grid_bounds: BBox
  spatial_resolution_m: number
}

const gridMeta: GridMetadata = {
  spatial_resolution_m: 2500,
  crs: 'EPSG:4326',
  grid_bounds: [5.498, 42.981, 22.102, 51.819], // bboxSwapLatAndLon([42.981, 5.498, 51.819, 22.102]),
  // grid_bounds: [5.49, 42.98, 22.1, 51.82], // bboxSwapLatAndLon([42.981, 5.498, 51.819, 22.102]),
}

function bboxSwapLatAndLon(bbox: [number, number, number, number]): [number, number, number, number] {
  const [minLat, minLon, maxLat, maxLon] = bbox
  return [minLon, minLat, maxLon, maxLat]
}

function roundToGrid(
  coordinate: { longitude: number; latitude: number },
  origin: { longitude: number; latitude: number },
  resolution: number, // unused in this implementation
): { longitude: number; latitude: number } {
  const lonStep = 0.028
  const latStep = Math.round(2000 / 111.32) / 1000
  const EPSILON = 1e-14

  const dx = Math.round((coordinate.longitude - origin.longitude) / lonStep + EPSILON)
  const dy = Math.round((coordinate.latitude - origin.latitude) / latStep + EPSILON)
  console.log((coordinate.latitude - origin.latitude) / latStep + EPSILON)

  return {
    longitude: origin.longitude + dx * lonStep,
    latitude: origin.latitude + dy * latStep,
  }
}

export async function loadGeosphereForecastHourly(coordinates: Coordinates): Promise<ForecastHour[]> {
  console.log(coordinates)
  // const result = mapToGrid({ coordinates, gridMeta })
  const test = { longitude: 22.031, latitude: 50.028 }
  const test2 = { longitude: 22.032, latitude: 50.029 }
  // const test = { longitude: 5.512, latitude: 42.99 }
  // const test2 = { longitude: 5.511, latitude: 42.989 }
  // 22.018 <- 22.031 | 22.032 -> 22.046
  // 50.019 <- 50.028 | 50.029 -> 50.037
  // const grid = { longitude: 0, latitude: 0 }
  // const grid = { longitude: 6.002, latitude: 42.999 }
  // const grid = { longitude: 13.8, latitude: 47.7 }
  const grid = { longitude: 5.498, latitude: 42.981 }
  // const grid = { longitude: gridMeta.grid_bounds[0] + 0.027, latitude: gridMeta.grid_bounds[1] + 0 }
  // const grid = { longitude: gridMeta.grid_bounds[2] + 0.026, latitude: gridMeta.grid_bounds[3] + 0 }
  // const grid = {
  //   longitude: (gridMeta.grid_bounds[2] - gridMeta.grid_bounds[0]) / 2 + gridMeta.grid_bounds[0],
  //   latitude: (gridMeta.grid_bounds[3] - gridMeta.grid_bounds[1]) / 2 + gridMeta.grid_bounds[1],
  // }
  console.log('grid', grid)

  console.log(test)
  console.log(roundToGrid(test, grid, 2500))
  console.log(test2)
  console.log(roundToGrid(test2, grid, 2500))
  // console.log(test3)
  // console.log(roundToGrid(test3, grid, 2500))

  // for (let i = 0; i < 30; i++) {
  //   console.log(i)
  //   // console.log(test)
  //   // console.log(test2)
  //   console.log(roundToGrid(test, grid, 2500))
  //   console.log(roundToGrid(test2, grid, 2500))
  //   grid.longitude += 0.001
  //   grid.latitude += 0.001
  // }

  // console.log({ longitude: 10.006, latitude: 50.001 })

  const coords = [
    // { longitude: 14.262, latitude: 48.309 },
    // { longitude: 14.262, latitude: 48.327 },
    // { longitude: 14.262, latitude: 42.999 },
    // { longitude: 14.262, latitude: 43.017 },
    // { longitude: 14.262, latitude: 50.001 },
    // { longitude: 14.262, latitude: 50.019 },
    { longitude: 6.002, latitude: 42.999 },
    { longitude: 6.03, latitude: 42.999 },
    { longitude: 6.002, latitude: 50.001 },
    { longitude: 6.03, latitude: 50.001 },
    { longitude: 21.99, latitude: 42.999 },
    { longitude: 22.018, latitude: 42.999 },
    { longitude: 21.99, latitude: 50.001 },
    { longitude: 22.018, latitude: 50.001 },

    { longitude: 6.002, latitude: 42.999 },
    { longitude: 6.002, latitude: 43.197 },
    { longitude: 6.002, latitude: 50.001 },
    { longitude: 6.002, latitude: 50.199 },
    { longitude: 21.99, latitude: 42.999 },
    { longitude: 21.99, latitude: 43.197 },
    { longitude: 21.99, latitude: 50.001 },
    { longitude: 21.99, latitude: 50.199 },
  ]

  const url = new URL('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m')
  url.searchParams.set('lat_lon', coordinates.latitude?.toString() + ',' + coordinates.longitude?.toString())
  REQUESTED_WEATHER_PARAMETERS.forEach((p) => url.searchParams.append('parameters', p))
  const urlString = url.toString()

  // TODO: this will fill up local storage with data from different locations
  const data = await useCache(urlString, async () => {
    const response = await fetch(urlString.toString())
    const data = (await response.json()) as TimeseriesForecastGeoJsonSerializer
    const referenceDatetime = DateTime.fromISO(data.reference_time as string)
    const expires = referenceDatetime.plus(MODEL_REFTIME_DELTA)
    return { data, expires }
  })

  const hourly: ForecastHour[] = []

  for (const [index, timestamp] of (data.timestamps as string[]).entries()) {
    const extractParameter = (p: RequestedWeatherParameter, indexOffset = 0) => {
      // TODO: why is features an array?
      return data.features[0].properties.parameters[p].data[index + indexOffset] ?? undefined
    }

    const { value: wind_speed, angleDeg: wind_degrees } = calculateVector(
      extractParameter('u10m'),
      extractParameter('v10m'),
    )
    const { value: wind_speed_gust, angleDeg: wind_degrees_gust } = calculateVector(
      extractParameter('ugust'),
      extractParameter('vgust'),
    )

    // NOTE: contrary to the description, _acc values seem to be accumulated over the forecast period
    hourly.push({
      datetime: new Date(timestamp),
      temperature: extractParameter('t2m'),
      precipitation_amount:
        extractParameter('rr_acc') !== undefined
          ? Math.max(extractParameter('rr_acc')! - (extractParameter('rr_acc', -1) ?? 0), 0)
          : undefined,
      relative_humidity: extractParameter('rh2m'),
      pressure: extractParameter('sp'),
      cloud_coverage: extractParameter('tcc'),
      wind_speed,
      wind_degrees,
      // TODO: different angle for gust
      wind_speed_gust,
      symbol: extractParameter('sy') ? symbolToWeatherSituationMap[extractParameter('sy')!] : undefined,
    })
  }

  return hourly
}

import type { Coordinates, MultivariateTimeSeries, WeatherInstant } from '$lib/types/data'
import type {
  ForecastTimeInstant as MetnoForecastTimeInstant,
  ForecastTimePeriod as MetnoForecastTimePeriod,
  MetjsonForecast,
} from '$lib/types/metno'
import { useCache } from '$lib/utils/cache'
import { DateTime, Duration } from 'luxon'
import { mergeMultivariateTimeSeries } from '$lib/utils/forecast/multiseries'
import type { Loader } from '$lib/types/data/providers'
import type { DatasetId } from '../datasets'

export default {
  id: 'met.no_locationforecast',
  name: 'Locationforecast',
  url: 'https://api.met.no/weatherapi/locationforecast/2.0/documentation',
  datasetIds: ['met.no_meps', 'met.no_arome-arctic', 'met.no_ecmwf'],
  load: loadLocationforecast,
} as const satisfies Loader<DatasetId>

export async function loadLocationforecast(coordinates: Coordinates): ReturnType<Loader<string>['load']> {
  if (coordinates.altitude === null) {
    console.warn(
      'Model met.no locationforecast should be provided an altitude!\n' +
        'The coarse ground model will be used, which will lead to inaccuracies!',
    )
  }

  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete.json')
  url.searchParams.set('lat', coordinates.latitude.toString())
  url.searchParams.set('lon', coordinates.longitude.toString())
  if (coordinates.altitude) url.searchParams.set('altitude', coordinates.altitude.toFixed(0))
  const urlString = url.toString()

  const result = await useCache('met.no_locationforecast' as DatasetId, { coordinates }, async () => {
    const response = await fetch(urlString.toString())
    const data = (await response.json()) as MetjsonForecast
    if (!response.ok) throw (data as any).message ?? 'Fetch failed'
    // const referenceDatetime = DateTime.fromISO(data.properties.meta.updated_at as string)
    const expiresHeader = response.headers.get('expires')
    const expiresAt = expiresHeader ? DateTime.fromHTTP(expiresHeader) : DateTime.now()
    return { data, expiresAt }
  })

  function addData(
    multiseries: MultivariateTimeSeries,
    data: Partial<WeatherInstant>,
    datetime: DateTime,
    duration: Duration,
  ) {
    for (const key of Object.keys(data)) {
      const keyTyped = key as keyof typeof multiseries

      if (data[keyTyped] === undefined) continue
      if (!multiseries[keyTyped]) multiseries[keyTyped] = []

      multiseries[keyTyped].push({
        timestamp: datetime.toMillis(),
        duration: duration.toMillis(),
        value: data[keyTyped],
      })
    }
  }

  const timeseries = result.data.properties.timeseries
  const multiseriesInstants: MultivariateTimeSeries = {}
  const multiseries1Hours: MultivariateTimeSeries = {}
  const multiseries6Hours: MultivariateTimeSeries = {}
  const multiseries12Hours: MultivariateTimeSeries = {}

  for (let timeStepIndex = 0; timeStepIndex < timeseries.length; timeStepIndex++) {
    const lastTimeStep = timeseries[timeStepIndex - 1]
    const timeStep = timeseries[timeStepIndex]
    const nextTimeStep = timeseries[timeStepIndex + 1]

    const datetime = DateTime.fromISO(timeStep.time)
    if (timeStep.data.instant.details) {
      const duration = nextTimeStep
        ? DateTime.fromISO(nextTimeStep.time).diff(datetime)
        : lastTimeStep
          ? datetime.diff(DateTime.fromISO(lastTimeStep?.time))
          : Duration.fromObject({ hour: 1 })

      addData(multiseriesInstants, transformTimeInstant(timeStep.data.instant.details), datetime, duration)
    }

    if (timeStep.data.next_1_hours?.details) {
      addData(
        multiseries1Hours,
        transformTimePeriod(timeStep.data.next_1_hours.details, Duration.fromObject({ hour: 1 })),
        datetime,
        Duration.fromObject({ hour: 1 }),
      )
    }
    if (timeStep.data.next_6_hours?.details) {
      addData(
        multiseries6Hours,
        transformTimePeriod(timeStep.data.next_6_hours.details, Duration.fromObject({ hour: 6 })),
        datetime,
        Duration.fromObject({ hour: 6 }),
      )
    }
    if (timeStep.data.next_12_hours?.details) {
      addData(
        multiseries12Hours,
        transformTimePeriod(timeStep.data.next_12_hours.details, Duration.fromObject({ hour: 12 })),
        datetime,
        Duration.fromObject({ hour: 12 }),
      )
    }
  }

  const merged = mergeMultivariateTimeSeries(
    multiseriesInstants,
    mergeMultivariateTimeSeries(multiseries1Hours, mergeMultivariateTimeSeries(multiseries6Hours, multiseries12Hours)),
  )

  return {
    success: true,
    data: merged,
    updatedAt: result.updatedAt,
    cached: result.cached,
    refreshAt: result.expiresAt,
  }
}

function transformTimeInstant(instant: MetnoForecastTimeInstant): Partial<WeatherInstant> {
  return {
    pressure_sealevel: (instant.air_pressure_at_sea_level ?? 0) * 100, // convert from hPa to Pa
    temperature: instant.air_temperature,
    // @ts-expect-error this does exist
    temperature_min: instant.air_temperature_percentile_10,
    // @ts-expect-error this does exist
    temperature_max: instant.air_temperature_percentile_90,
    cloud_coverage: instant.cloud_area_fraction,
    // cloud_coverage_low: instant.cloud_area_fraction_low,
    // cloud_coverage_medium: instant.cloud_area_fraction_medium,
    // cloud_coverage_high: instant.cloud_area_fraction_high,
    // dew_point: instant.dew_point_temperature,
    fog: instant.fog_area_fraction,
    relative_humidity: instant.relative_humidity,
    // @ts-expect-error this does exist
    uvi_clear_sky: instant.ultraviolet_index_clear_sky,
    wind_speed: instant.wind_speed,
    // wind_speed_min: instant.wind_speed_percentile_10,
    // wind_speed_max: instant.wind_speed_percentile_90,
    wind_speed_gust: instant.wind_speed_of_gust,
    wind_degrees: instant.wind_from_direction,
  }
}

function transformTimePeriod(period: MetnoForecastTimePeriod, duration: Duration): Partial<WeatherInstant> {
  const toHourFactor = (60 * 60 * 1000) / duration.toMillis()
  const toHourly = (value: number | undefined) => {
    return value !== undefined ? value * toHourFactor : undefined
  }

  return {
    precipitation_amount: toHourly(period.precipitation_amount),
    // precipitation_amount_min: toHourly(period.precipitation_amount_min),
    // precipitation_amount_max: toHourly(period.precipitation_amount_max),
    precipitation_probability: period.probability_of_precipitation,
    // thunder_probablilty: period.probability_of_thunder,
    uvi_clear_sky: period.ultraviolet_index_clear_sky_max,
    // mm | expected precipitation amount for period
  }
}

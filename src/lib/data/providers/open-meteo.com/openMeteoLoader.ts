import { fetchWeatherApi } from 'openmeteo'
import { DateTime, Duration } from 'luxon'
import { useCache } from '$lib/utils/cache'
import type { Coordinates, ForecastParameter, MultivariateTimeSeries, TimeSeries } from '$lib/types/data'
import type { Dataset, Loader } from '$lib/types/data/providers'

type LoaderOptions = {
  dataset: Dataset
  parameters: ForecastParameter[]
  interval: 'hourly' | 'minutely15'
}

export function createOpenMeteoLoader({ dataset, parameters, interval }: LoaderOptions) {
  async function load(coordinates: Coordinates, offset = 0): ReturnType<Loader<string>['load']> {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      // why, open-meteo, why?...
      [interval === 'minutely15' ? 'minutely_15' : interval]: mapParametersToOpenMeteo(parameters),
      models: dataset.internalId,
      // TODO: extract to settings or forecast loader
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      past_days: 1,
    }

    const result = await useCache(dataset.id, { coordinates, offset }, async () => {
      const url = 'https://api.open-meteo.com/v1/meteofrance'
      const responses = await fetchWeatherApi(url, params)
      const response = responses[0]

      // HACK: this variant of the api (js sdk, non-json) does not properly expose errors
      if (response.generationTimeMilliseconds() === 0) 'Fetch failed'

      // TODO: consider storing the elevation
      // const elevation = response.elevation()
      const utcOffsetSeconds = response.utcOffsetSeconds()

      function multiseriesFromResponse(
        variables: NonNullable<ReturnType<typeof response.hourly>>,
        parameters: ForecastParameter[],
        duration: Duration,
      ) {
        const timestamps = [
          ...Array((Number(variables.timeEnd()) - Number(variables.time())) / variables.interval()),
        ].map((_, i) => Number(variables.time()) + i * variables.interval() + utcOffsetSeconds)

        const output: Partial<Record<ForecastParameter, TimeSeries<number>>> = {}

        const durationMs = duration.toMillis()

        for (const [i, parameter] of parameters.entries()) {
          const data = variables.variables(i)!.valuesArray()!

          output[parameter] = []

          // fill data
          timestamps.forEach((_timestamp, i) => {
            let value = data[i]
            let timestamp = _timestamp * 1000

            // NOTE: for arome_france_hd open-meteo gives a 7 day period, where the rest is filled with null

            if (isNaN(value)) return
            // pressure: convert hPa to Pa
            if (parameter === 'pressure') value *= 1e2
            // precipitation: move to preceding hour
            timestamp -= durationMs

            output[parameter]!.push({ timestamp, duration: duration.toMillis(), value })
          })
        }

        return output
      }

      const multiseries = multiseriesFromResponse(
        response[interval]()!,
        parameters,
        Duration.fromObject({ minutes: interval === 'minutely15' ? 15 : 60 }),
      )

      // TODO: what about timezone offsets?
      const startOfDay = DateTime.now().startOf('day')

      const baseForecastAge = dataset.baseForecastAge ?? Duration.fromObject({})
      const iterations =
        (DateTime.now().toMillis() - startOfDay.toMillis() - baseForecastAge.toMillis()) /
        dataset.updateFrequency.toMillis()

      const expiresAt = startOfDay
        .plus(baseForecastAge)
        .plus(dataset.updateFrequency.mapUnits((x) => x * Math.ceil(iterations)))

      return { data: multiseries, expiresAt }
    })

    return {
      success: true,
      data: result.data,
      updatedAt: result.updatedAt,
      cached: result.cached,
      refreshAt: result.expiresAt,
    }
  }

  return load
}

function mapParametersToOpenMeteo(parameters: ForecastParameter[]) {
  return parameters
    .map((p) => parameterMapToOpenMeteo[p as keyof typeof parameterMapToOpenMeteo] ?? null)
    .filter((p) => p)
}

export const parameterMapToOpenMeteo = {
  temperature: 'temperature_2m',
  temperature_min: 'temperature_2m_min',
  temperature_max: 'temperature_2m_max',
  temperature_feel: 'apparent_temperature',
  pressure: 'surface_pressure',
  relative_humidity: 'relative_humidity_2m',
  uvi: 'uv_index',
  uvi_clear_sky: 'uv_index_clear_sky',
  cloud_coverage: 'cloudcover',
  fog: 'fog',
  visibility: 'visibility',
  wind_speed: 'windspeed_10m',
  wind_speed_gust: 'windgusts_10m',
  wind_degrees: 'winddirection_10m',
  wind_degrees_gust: 'windgust_direction_10m',
  precipitation_amount: 'precipitation',
  precipitation_probability: 'precipitation_probability',
  thunder_probability: 'thunderstorm_probability',
  snow_amount: 'snowfall',
  cape: 'cape_mean',
  cin: 'cin',
  // grad: 'grad',
  dew_point: 'dewpoint_2m',
} as const satisfies Partial<Record<ForecastParameter, string>>

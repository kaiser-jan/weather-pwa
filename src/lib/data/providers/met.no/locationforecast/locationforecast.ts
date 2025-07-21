import type { Coordinates, MultivariateTimeSeries, WeatherInstant } from '$lib/types/data'
import type {
  ForecastTimeInstant as MetnoForecastTimeInstant,
  ForecastTimePeriod as MetnoForecastTimePeriod,
  MetjsonForecast,
} from '$lib/types/metno'
import { useCache } from '$lib/data/cache'
import { DateTime, Duration } from 'luxon'
import type { DatasetId } from '$lib/data/providers'

export async function loadLocationforecast(coordinates: Coordinates) {
  if (coordinates.altitude === null) throw new Error('Locationforecast from met.no requires an altitude!')

  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete.json')
  url.searchParams.set('lat', coordinates.latitude.toString())
  url.searchParams.set('lon', coordinates.longitude.toString())
  if (coordinates.altitude) url.searchParams.set('altitude', coordinates.altitude.toFixed(0))
  const urlString = url.toString()

  const data = await useCache('met.no_locationforecast' as DatasetId, { coordinates }, async () => {
    const response = await fetch(urlString.toString())
    const data = (await response.json()) as MetjsonForecast
    // const referenceDatetime = DateTime.fromISO(data.properties.meta.updated_at as string)
    const expiresHeader = response.headers.get('expires')
    const expires = expiresHeader ? DateTime.fromHTTP(expiresHeader) : DateTime.now()
    return { data, expires }
  })

  const multiseries: MultivariateTimeSeries = {}

  function addData(data: Partial<WeatherInstant>, datetime: DateTime, duration: Duration) {
    for (const key of Object.keys(data)) {
      const keyTyped = key as keyof typeof multiseries

      if (data[keyTyped] === undefined) continue
      if (!multiseries[keyTyped]) multiseries[keyTyped] = []

      multiseries[keyTyped].push({
        datetime,
        duration,
        value: data[keyTyped],
      })
    }
  }

  const timeseries = data.properties.timeseries

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

      addData(transformTimeInstant(timeStep.data.instant.details), datetime, duration)
    }

    if (timeStep.data.next_1_hours?.details) {
      addData(transformTimePeriod(timeStep.data.next_1_hours.details), datetime, Duration.fromObject({ hour: 1 }))
    }
    if (timeStep.data.next_6_hours?.details) {
      addData(transformTimePeriod(timeStep.data.next_6_hours.details), datetime, Duration.fromObject({ hour: 6 }))
    }
    if (timeStep.data.next_12_hours?.details) {
      addData(transformTimePeriod(timeStep.data.next_12_hours.details), datetime, Duration.fromObject({ hour: 12 }))
    }
  }

  return multiseries
}

function transformTimeInstant(instant: MetnoForecastTimeInstant): Partial<WeatherInstant> {
  return {
    temperature: instant.air_temperature,
    pressure: (instant.air_pressure_at_sea_level ?? 0) * 100, // convert from hPa to Pa
    relative_humidity: instant.relative_humidity,
    uvi_clear_sky: (instant as { ultraviolet_index_clear_sky: number }).ultraviolet_index_clear_sky,
    cloud_coverage: instant.cloud_area_fraction,
    // cloud_coverage_low: instant.cloud_area_fraction_low,
    // cloud_coverage_medium: instant.cloud_area_fraction_medium,
    // cloud_coverage_high: instant.cloud_area_fraction_high,
    fog: instant.fog_area_fraction,
    wind_speed: instant.wind_speed,
    wind_speed_gust: instant.wind_speed_of_gust,
    wind_degrees: instant.wind_from_direction,
  }
}

function transformTimePeriod(period: MetnoForecastTimePeriod): Partial<WeatherInstant> {
  return {
    uvi_clear_sky: period.ultraviolet_index_clear_sky_max,
    precipitation_amount: period.precipitation_amount,
    precipitation_probability: period.probability_of_precipitation,
    thunder_probability: period.probability_of_thunder,
  }
}

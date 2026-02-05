import type {
  ForecastParameter,
  MultivariateTimeSeries,
  TimeBucket,
  TimeSeries,
  TimeSeriesNumberEntry,
} from '$lib/types/data'
import { mapKeys, type WithOptional } from '$lib/utils'

/**
 * Merges two multiseries by merging the individual timeseries.
 */
export function mergeMultivariateTimeSeries(
  multiseriesA: MultivariateTimeSeries,
  multiseriesB: MultivariateTimeSeries,
) {
  let multiseriesMerged: MultivariateTimeSeries = {}

  const keys = Array.from(new Set([...Object.keys(multiseriesA), ...Object.keys(multiseriesB)]))

  for (const parameter of keys) {
    const parameterTyped = parameter as keyof typeof multiseriesB
    const a = multiseriesA[parameterTyped]!
    const b = multiseriesB[parameterTyped]!

    if (!a) {
      multiseriesMerged[parameterTyped] = b
      continue
    }
    if (!b) {
      multiseriesMerged[parameterTyped] = a
      continue
    }

    multiseriesMerged[parameterTyped] = mergeTimeSeries(a, b)
  }

  // if there is existing snow and rain data, but only new precipitation data, scale snow and rain
  if (
    multiseriesA.rain_amount && //
    multiseriesA.snow_amount &&
    multiseriesB.precipitation_amount &&
    !multiseriesB.rain_amount &&
    !multiseriesB.snow_amount
  ) {
    // adapt the timeseries so they use the same timebuckets -> smaller wins
    // scale snow and rain so their sum equals precipitation
    multiseriesMerged = adaptMultiseries(
      multiseriesA,
      ['precipitation_amount', 'rain_amount', 'snow_amount'],
      multiseriesMerged,
      ['precipitation_amount'],
      ({ a, b }) => {
        // use rain + snow as precipitation fallback
        let precipitationA = a.precipitation_amount
        if (a.rain_amount !== undefined && a.snow_amount !== undefined) precipitationA = a.rain_amount + a.snow_amount

        const doBothHavePrecipitation =
          precipitationA !== undefined && precipitationA !== 0 && b.precipitation_amount !== undefined

        const scale = (v: number) => {
          if (!doBothHavePrecipitation || v === undefined) return v
          return (v / precipitationA!) * b.precipitation_amount!
        }

        // scale snow_amount and rain_amount to based on the new precipitation_amount
        return {
          precipitation_amount: b.precipitation_amount ?? precipitationA,
          rain_amount: scale(a.rain_amount!),
          snow_amount: scale(a.snow_amount!),
        }
      },
    )
  }
  // if there is new snow an rain data, make precipitation sum of rain and snow
  else if (
    multiseriesB.rain_amount && //
    multiseriesB.snow_amount &&
    !multiseriesB.precipitation_amount
  ) {
    multiseriesMerged = adaptMultiseries(multiseriesMerged, ['rain_amount', 'snow_amount'], {}, [], ({ a }) => {
      if (a.rain_amount === undefined || a.snow_amount === undefined) return a
      return {
        ...a,
        precipitation_amount: a.rain_amount + a.snow_amount,
      }
    })
  }

  return multiseriesMerged
}

/**
 * Merges the items of two timeseries about the same parameter.
 * Items with shorter duration take precedence, as those are usually from more accurate forecasts.
 */
export function mergeTimeSeries(timeseriesA: TimeSeries<number>, timeseriesB: TimeSeries<number>) {
  const times = collectBounds([...timeseriesA!, ...timeseriesB])

  const out: TimeSeries<number> = []
  for (let i = 0; i < times.length - 1; i++) {
    const start = times[i]
    const end = times[i + 1]
    const duration = end - start
    const a = findCover(timeseriesA, start, end)
    const b = findCover(timeseriesB, start, end)

    let src: TimeSeries<number>[number] | undefined
    if (a && b) {
      src = a.duration < b.duration ? a : b
    } else {
      src = a ?? b
    }
    if (!src) continue

    out.push({ timestamp: start, duration: duration, value: src.value })
  }

  return out
}

function collectBounds(...timeseries: TimeSeries<number>[]) {
  const bounds = new Set<number>()
  for (const { timestamp, duration } of timeseries.flat()) {
    bounds.add(timestamp)
    bounds.add(timestamp + duration)
  }

  return Array.from(bounds).sort((x, y) => x - y)
}

/** Finds all items which overlap with the given timeframe. */
function findCover(series: TimeSeries<number>, start: number, end: number) {
  return series.find((pt) => pt.timestamp <= start && pt.timestamp + pt.duration >= end && pt.value !== null)
}

type CallbackInput = Partial<Record<ForecastParameter, number | undefined>>
type CallbackOutput = Partial<Record<ForecastParameter, number>>

function adaptMultiseries(
  multiseriesA: MultivariateTimeSeries,
  parametersA: ForecastParameter[],
  multiseriesB: MultivariateTimeSeries,
  parametersB: ForecastParameter[],
  callback: ({ a, b }: { a: CallbackInput; b: CallbackInput }) => CallbackOutput,
) {
  const times = collectBounds(...parametersA.map((p) => multiseriesA[p]!), ...parametersB.map((p) => multiseriesB[p]!))

  let resultMultiseries: MultivariateTimeSeries = { ...multiseriesB }

  const allParameters = [...parametersA, ...parametersB]
  allParameters.forEach((p) => (resultMultiseries[p] = []))

  for (let i = 0; i < times.length - 1; i++) {
    const start = times[i]
    const end = times[i + 1]
    const duration = end - start

    const a = mapKeys(parametersA, (p) => findCover(multiseriesA[p]!, start, end)?.value)

    const b = mapKeys(parametersB, (p) => findCover(multiseriesB[p]!, start, end)?.value)

    const result = callback({ a, b })

    for (const [parameter, value] of Object.entries(result)) {
      if (value === undefined) continue
      resultMultiseries[parameter as ForecastParameter]!.push({ value, timestamp: start, duration })
    }
  }

  return resultMultiseries
}

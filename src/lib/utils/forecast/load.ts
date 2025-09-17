import { getMinimalLoadersForDatasets } from '$lib/data/providers'
import { loaderStates } from '$lib/stores/data'
import type { Forecast, ForecastInputs } from '$lib/types/data'
import type { LoaderState } from '$lib/types/data/providers'
import { debounce, deepEqual } from '$lib/utils'
import { combineMultiseriesToDailyForecast } from '$lib/utils/forecast/daily'
import { mergeMultivariateTimeSeries } from '$lib/utils/forecast/multiseries'
import { forecastTotalFromDailyForecast } from '$lib/utils/forecast/total'
import { getCachedForecast, setCachedForecast } from './cache'
import { addDerivedMetrics } from './deriveMetrics'

let loadTimeout: ReturnType<typeof setTimeout> | undefined = undefined

export function refreshForecast({
  current,
  update,
  inputs,
  stream,
}: {
  current: Forecast | null
  update: (data: Forecast | null) => void
  inputs: ForecastInputs
  stream: boolean
}) {
  console.info('Loading data...')

  const didParametersChange = !deepEqual(inputs, current?.inputs)

  if (!current || didParametersChange) {
    // show cached data for this location while loading
    const cachedForecast = getCachedForecast(inputs)
    if (cachedForecast) update(cachedForecast)
    else update(null)
  }

  const loaders = getMinimalLoadersForDatasets(inputs.datasetIds)
  console.debug('Using the following loaders: ', loaders)

  const states: LoaderState[] = loaders.map((loader) => ({ done: false, loader }))
  loaderStates.set(states)

  const applyUpdate = () => {
    const forecast = createForecastFromResults(states, inputs)
    if (!forecast) return
    update(forecast)
    setCachedForecast(forecast)
    console.info(forecast)
  }

  const debouncedApplyUpdate = debounce(applyUpdate, 500)

  for (const [loaderIndex, loader] of loaders.entries()) {
    loader
      .load(inputs.coordinates)
      .then((result) => {
        states[loaderIndex] = { done: true, ...result, loader }
        loaderStates.set(states)
      })
      .catch((error) => {
        states[loaderIndex] = { done: true, loader, success: false, error }
        loaderStates.set(states)
      })
      .finally(() => {
        const allLoaded = states.filter(Boolean).length === loaders.length
        const wasCached = states[loaderIndex].done && states[loaderIndex].success && states[loaderIndex].cached

        // console.debug(!wasCached, didParametersChange, !current, stream, allLoaded)

        const needsRefresh = !wasCached || didParametersChange || !current
        if (needsRefresh) {
          // no need for debounce if this is the last update
          if (allLoaded) applyUpdate()
          else if (stream) debouncedApplyUpdate()
        }

        if (allLoaded) clearTimeout(loadTimeout)
      })
  }

  // fetchOpenMeteo({
  //   coordinates: inputs.coordinates,
  //   models: ['arpege_world', 'arpege_europe', 'arome_france', 'arome_france_hd'],
  //   parameters: { hourly: ['temperature'], minutely15: ['temperature'] },
  // })

  clearTimeout(loadTimeout)
  loadTimeout = setTimeout(() => {
    console.warn('Timed out while loading complete forecast, updating anyway!')
    debouncedApplyUpdate()
  }, 15_000)
}

function createForecastFromResults(results: LoaderState[], inputs: ForecastInputs) {
  // NOTE: reverse, so the first items take priority
  const parts = results
    .filter((p) => p.done && p.success)
    .reverse()
    .map((p) => p.data)

  if (parts.length === 0) return

  let merged = parts[0]
  for (let i = 1; i < parts.length; i++) {
    merged = mergeMultivariateTimeSeries(merged, parts[i])
  }

  addDerivedMetrics(merged, inputs.coordinates)

  const daily = combineMultiseriesToDailyForecast(merged)
  const total = forecastTotalFromDailyForecast(daily)

  const forecast: Forecast = {
    current: null,
    multiseries: merged,
    daily,
    total,
    inputs,
  }

  return forecast
}

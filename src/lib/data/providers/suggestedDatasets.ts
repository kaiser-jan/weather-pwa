import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import type { Coordinates, ForecastParameter } from '$lib/types/data'
import { DATASETS, type DatasetId } from '.'
import { Duration } from 'luxon'
import type { Dataset } from '$lib/types/data/providers'

type DurationFilter = { lt?: Duration; lte?: Duration; gt?: Duration; gte?: Duration; eq?: Duration }

type Criterion = {
  interval?: DurationFilter
  offset?: DurationFilter
  timespan?: DurationFilter
  parameters?: ForecastParameter[]
}

function matchDuration(value: Duration | null, filter?: DurationFilter): boolean {
  if (!filter) return true
  if (value === null) return false
  if (filter.lt && !(value < filter.lt)) return false
  if (filter.lte && !(value <= filter.lte)) return false
  if (filter.gt && !(value > filter.gt)) return false
  if (filter.gte && !(value >= filter.gte)) return false
  if (filter.eq && !value.equals(filter.eq)) return false
  return true
}

function matchesCriterion(dataset: Dataset, criteria: Criterion): boolean {
  return (
    matchDuration(dataset.updateFrequency, criteria.interval) &&
    matchDuration(dataset.baseForecastAge, criteria.offset) &&
    matchDuration(dataset.timespan, criteria.timespan) &&
    (!criteria.parameters || criteria.parameters.every((p) => dataset.parameters.includes(p)))
  )
}

const criteria: Criterion[] = [
  { interval: { lt: Duration.fromObject({ hours: 1 }) } },
  {
    interval: { lt: Duration.fromObject({ hours: 6 }) },
    timespan: { gt: Duration.fromObject({ days: 1 }) },
  },
  { timespan: { gte: Duration.fromObject({ days: 5 }) } },
  { offset: { gte: Duration.fromObject({ hours: 6 }) } },
  { parameters: ['o3'] },
]

export function getSuggestedDatasetsForLocation(coordinates: Coordinates, datasetIdList: DatasetId[]): Dataset[] {
  const remainingCriteria = [...criteria]
  const result: Dataset[] = []

  const coordinatesPoint = point([coordinates.longitude, coordinates.latitude])

  console.debug(`Getting suggested datasets for ${coordinates}...`)

  for (const datasetId of datasetIdList) {
    const dataset = DATASETS.find((d) => d.id === datasetId)
    if (!dataset) continue

    const isInside = booleanPointInPolygon(coordinatesPoint, dataset.coverageArea)
    if (!isInside) {
      console.debug(`${datasetId} is not available at this location!`)
      continue
    }

    const matchedCriteriaIndices = remainingCriteria
      .map((criterion, i) => (matchesCriterion(dataset, criterion) ? i : -1))
      .filter((i) => i !== -1)

    console.debug(
      `Dataset ${dataset.id} matched ${matchedCriteriaIndices.length} criteria: `,
      JSON.stringify(matchedCriteriaIndices.map((i) => remainingCriteria[i])),
    )

    if (matchedCriteriaIndices.length > 0) {
      result.push(dataset)
      // remove matched criteria, from highest index to lowest to keep indices valid
      matchedCriteriaIndices.sort((a, b) => b - a).forEach((i) => remainingCriteria.splice(i, 1))
      if (remainingCriteria.length === 0) break
    }
  }

  console.debug(`Suggesting the following datasets: ${result.map((d) => d.id)}`)

  return result
}

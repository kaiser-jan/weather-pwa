import type { Duration } from 'luxon'

export type TimeSeriesConfig<InKeyT extends string, OutKeyT extends string> =
  | { type: 'normal'; inKey: InKeyT; outKey: OutKeyT; multiplier?: number }
  // accumulated value since start of the forecast until the timestamp -> the value of a TimePeriod depends on the following one
  | { type: 'accumulated-until'; inKey: InKeyT; outKey: OutKeyT; asDeltaPer?: Duration }
  | { type: 'vector'; xKey: InKeyT; yKey: InKeyT; outKeyLength: OutKeyT; outKeyAngle: OutKeyT }

interface TimeValue {
  timestamp: number
  duration: number
  value: number | null
}

export function transformTimeSeries<ConfigInKeyT extends string, ConfigOutKeyT extends string>(
  timestamps: number[],
  values: Record<string, { data: (number | null)[] }>,
  configs: TimeSeriesConfig<ConfigInKeyT, ConfigOutKeyT>[],
  duration: number,
): Record<string, TimeValue[]> {
  const output: Record<string, TimeValue[]> = {}

  // prepare output keys
  for (const cfg of configs) {
    if (cfg.type === 'vector') {
      output[cfg.outKeyLength] = []
      output[cfg.outKeyAngle] = []
    } else {
      output[cfg.outKey] = []
    }
  }

  // fill data
  timestamps.forEach((timestamp, i) => {
    for (const item of configs) {
      if (item.type === 'normal') {
        const multiplier = item.multiplier ?? 1
        const rawValue = values[item.inKey].data[i]
        const value = rawValue !== null ? rawValue * multiplier : null
        output[item.outKey].push({ timestamp, duration, value })
      }
      if (item.type === 'accumulated-until') {
        const arr = values[item.inKey].data
        let value = Math.max(0, (arr[i + 1] ?? 0) - (arr[i] ?? 0))
        // convert e.g. mm of rain in this timebucket to mm/h (with 1 hour as asDeltaPer)
        if (item.asDeltaPer) {
          const factor = item.asDeltaPer.toMillis() / duration
          value *= factor
        }
        output[item.outKey].push({ timestamp, duration, value: value })
      }
      if (item.type === 'vector') {
        const vx = values[item.xKey].data[i]
        const vy = values[item.yKey].data[i]

        const isComplete = vx !== null || vy !== null

        const length = isComplete ? Math.hypot(vx!, vy!) : null
        const angle = isComplete ? (Math.atan2(vy!, vx!) * 180) / Math.PI : null
        output[item.outKeyLength].push({ timestamp, duration, value: length })
        output[item.outKeyAngle].push({ timestamp, duration, value: angle })
      }
    }
  })

  return output
}

export function getForecastParametersFromConfig<ConfigInKeyT extends string, ConfigOutKeyT extends string>(
  configs: TimeSeriesConfig<ConfigInKeyT, ConfigOutKeyT>[],
) {
  return configs.flatMap((c) => (c.type === 'vector' ? [c.outKeyLength, c.outKeyAngle] : [c.outKey]))
}
export function getRequestedParametersFromConfig<ConfigInKeyT extends string, ConfigOutKeyT extends string>(
  configs: TimeSeriesConfig<ConfigInKeyT, ConfigOutKeyT>[],
) {
  return configs.flatMap((c) => (c.type === 'vector' ? [c.xKey, c.yKey] : [c.inKey]))
}

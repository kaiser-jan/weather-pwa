import type { ColorStop } from '$lib/types/ui'

export const CONFIG = {
  weather: {
    preferDerivedSymbols: true,
    precipitation: {
      threshold: 0.1,
    },
  },
  dashboard: {
    daily: {
      showIncompleteTimelineBar: false,
    },
  },
  appearance: {
    colors: {
      temperatureColorStops: [
        { value: -50, h: 0, s: 100, l: 50 },
        { value: 0, h: 0, s: 0, l: 100 },
        { value: 10, h: 174, s: 49, l: 64 },
        { value: 15, h: 134, s: 47, l: 70 },
        { value: 20, h: 96, s: 67, l: 60 },
        { value: 25, h: 47, s: 83, l: 63 },
        { value: 30, h: 25, s: 56, l: 48 },
        { value: 40, h: 12, s: 66, l: 35 },
      ] as ColorStop[],
    },
  },
}

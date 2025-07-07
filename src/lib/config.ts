import type { ColorStop } from '$lib/types/ui'
import { BriefcaseIcon, HomeIcon } from '@lucide/svelte'
import type { DateObjectUnits } from 'luxon'

type Location = {
  name: string
  icon: typeof HomeIcon
  longitude: number
  latitude: number
  altitude: number
}

export const CONFIG = {
  weather: {
    preferDerivedSymbols: true,
    precipitation: {
      threshold: 0.1,
    },
  },
  dashboard: {
    timelineBar: {
      marks: [{ hour: 6 }, { hour: 12 }, { hour: 18 }] as DateObjectUnits[],
    },
    daily: {
      showIncompleteTimelineBar: false,
      showIncompleteLastDay: false,
    },
  },
  appearance: {
    symbols: 'meteocons-fill-animated' as 'meteocons-fill-animated' | 'meteocons-fill-static',
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
  chart: {
    tooltip: false,
    alwaysShowValuesDisplay: true,
  },
  locations: [
    {
      name: 'Home',
      icon: HomeIcon,

      latitude: 48.208481,
      longitude: 16.373097,
      altitude: 330,
    },
    {
      name: 'Work',
      icon: BriefcaseIcon,
      latitude: 47.076157,
      longitude: 15.436853,
      altitude: 330,
    },
    // {
    //   name: 'Vienna',
    //   latitude: 48.208815,
    //   longitude: 16.372547,
    //   altitude: 330,
    // },
  ] as Location[],
}

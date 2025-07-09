import { UNIT_OPTIONS, type Unit } from '$lib/utils/units'
import { DATASET_IDS, DATASETS, PROVIDERS, type DatasetId } from '$lib/data/providers'
import type { ConfigItem, ConfigType } from './types'
import type { DateObjectUnits } from 'luxon'
import { BriefcaseIcon, HomeIcon } from '@lucide/svelte'
import type { ColorStop } from '$lib/types/ui'

type Location = {
  name: string
  icon: typeof HomeIcon
  longitude: number
  latitude: number
  altitude: number
}

export const settingsConfig = [
  {
    id: 'datasets',
    label: 'Datasets',
    type: 'multiselect',
    options: DATASET_IDS,
    labels: Object.fromEntries(
      DATASET_IDS.map((id) => {
        const dataset = DATASETS[id]
        // const provider = PROVIDERS[dataset.providerId]
        return [id, dataset.providerId + ' ' + dataset.name]
      }),
    ),
    default: [
      'met.no_locationforecast',
      'geosphere.at_nwp-v1-1h-2500m_offset',
      'geosphere.at_nwp-v1-1h-2500m',
      'geosphere.at_nowcast-v1-15min-1km',
    ],
    reorder: true,
  },
  {
    id: 'units',
    label: 'Units',
    type: 'page',
    children: [
      {
        id: 'temperature',
        type: 'select',
        options: UNIT_OPTIONS.temperature,
        label: 'Temperature',
        default: '°C' as Unit,
      },
      {
        id: 'pressure',
        type: 'select',
        options: UNIT_OPTIONS.pressure,
        label: 'Pressure',
        default: 'hPa' as Unit,
      },
      {
        id: 'length',
        type: 'select',
        options: UNIT_OPTIONS.length,
        label: 'Length',
        default: 'km' as Unit,
      },
      {
        id: 'speed',
        type: 'select',
        options: UNIT_OPTIONS.speed,
        label: 'Speed',
        default: 'km/h' as Unit,
      },
      {
        id: 'angle',
        type: 'select',
        options: UNIT_OPTIONS.angle,
        label: 'Angle',
        default: '°' as Unit,
      },
      {
        id: 'percentage',
        type: 'select',
        options: UNIT_OPTIONS.percentage,
        label: 'Percentage',
        default: '%' as Unit,
      },
      {
        id: 'index',
        type: 'select',
        options: UNIT_OPTIONS.index,
        label: 'Index',
        default: 'index' as Unit,
      },
      {
        id: 'energy',
        type: 'select',
        options: UNIT_OPTIONS.energy,
        label: 'Energy',
        default: 'J/kg' as Unit,
      },
      {
        id: 'radiation',
        type: 'select',
        options: UNIT_OPTIONS.radiation,
        label: 'Radiation',
        default: 'kWh/m2' as Unit,
      },
      {
        id: 'precipitation',
        type: 'select',
        options: UNIT_OPTIONS.precipitation,
        label: 'Precipitation',
        default: 'mm/h' as Unit,
      },
    ],
  },
  {
    id: 'weather',
    label: 'Weather',
    type: 'page',
    children: [
      {
        id: 'preferDerivedSymbols',
        label: 'Prefer Derived Symbols',
        type: 'boolean',
        default: true,
      },
      {
        id: 'precipitation',
        label: 'Precipitation',
        type: 'group',
        children: [
          {
            id: 'threshold',
            label: 'Threshold',
            type: 'number',
            default: 0.0,
            step: 0.01,
          },
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    type: 'page',
    children: [
      {
        id: 'timelineBar',
        label: 'Timeline Bar',
        type: 'group',
        children: [
          {
            id: 'marks',
            label: 'Marks',
            type: 'not-implemented',
            default: [{ hour: 6 }, { hour: 12 }, { hour: 18 }] as DateObjectUnits[],
          },
        ],
      },
      {
        id: 'daily',
        label: 'Daily',
        type: 'group',
        children: [
          {
            id: 'showIncompleteTimelineBar',
            label: 'Show Incomplete Timeline Bar',
            type: 'boolean',
            default: false,
          },
          {
            id: 'showIncompleteLastDay',
            label: 'Show Incomplete Last Day',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    type: 'page',
    children: [
      {
        id: 'symbols',
        label: 'Symbols',
        type: 'select',
        default: 'meteocons-fill-animated',
        options: ['meteocons-fill-animated', 'meteocons-fill-static'],
      },
      {
        id: 'colors',
        label: 'Colors',
        type: 'page',
        children: [
          {
            id: 'temperatureColorStops',
            label: 'Temperature Color Stops',
            type: 'not-implemented',
            default: [
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
        ],
      },
    ],
  },
  {
    id: 'chart',
    label: 'Chart',
    type: 'page',
    children: [
      {
        id: 'tooltip',
        label: 'Show Tooltip',
        type: 'boolean',
        default: false,
      },
      {
        id: 'alwaysShowValuesDisplay',
        label: 'Always Show Values Display',
        type: 'boolean',
        default: true,
      },
      {
        id: 'axisUnits',
        label: 'Axis Units',
        type: 'select',
        default: 'replace',
        options: ['inline', 'above', 'replace', 'off'],
      },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    type: 'not-implemented',
    default: [
      {
        name: 'Home',
        icon: 'home',

        latitude: 48.208481,
        longitude: 16.373097,
        altitude: 330,
      },
      {
        name: 'Work',
        icon: 'briefcase',
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
  },
] as const satisfies ConfigItem[]

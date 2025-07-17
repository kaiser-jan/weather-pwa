import { UNIT_OPTIONS, type Unit, type UnitDimension } from '$lib/utils/units'
import { DATASET_IDS, DATASETS, PROVIDERS, type DatasetId } from '$lib/data/providers'
import type { ConfigItem, ConfigType } from './types'
import type { DateObjectUnits } from 'luxon'
import {
  ArrowUpAz,
  ArrowUpDownIcon,
  BadgeInfoIcon,
  BinocularsIcon,
  BriefcaseIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartLineIcon,
  ChartNoAxesGanttIcon,
  ChevronsUpDownIcon,
  ChevronsUpIcon,
  ClockIcon,
  CloudSunIcon,
  ComponentIcon,
  DatabaseIcon,
  HashIcon,
  HighlighterIcon,
  HomeIcon,
  LanguagesIcon,
  LayoutPanelTopIcon,
  ListIcon,
  MapPinIcon,
  PaletteIcon,
  PinIcon,
  PuzzleIcon,
  RulerIcon,
  SettingsIcon,
  SparklesIcon,
  SquareSplitHorizontalIcon,
  SquareSplitVerticalIcon,
  ThermometerIcon,
  UmbrellaIcon,
} from '@lucide/svelte'
import type { ColorStop } from '$lib/types/ui'

type Location = {
  name: string
  icon: string
  longitude: number
  latitude: number
  altitude: number
}

const UNIT_DEFAULTS: Record<UnitDimension, Unit> = {
  temperature: '°C',
  pressure: 'hPa',
  length: 'km',
  speed: 'km/h',
  angle: '°',
  percentage: '%',
  energy: 'J/kg',
  radiation: 'kWh/m2',
  precipitation: 'mm/h',
} as const

export const settingsConfig = [
  {
    id: 'general',
    label: 'General',
    icon: SettingsIcon,
    type: 'page',
    children: [
      {
        id: 'language',
        label: 'Language',
        icon: LanguagesIcon,
        type: 'select',
        options: ['en'] as string[],
        default: 'en',
        disabled: true,
      },
      {
        id: 'units',
        label: 'Units',
        type: 'page',
        icon: RulerIcon,
        children: Object.entries(UNIT_OPTIONS).map(
          ([dimension, options]) =>
            ({
              id: dimension,
              type: 'select',
              options,
              label: dimension.charAt(0).toUpperCase() + dimension.slice(1),
              default: UNIT_DEFAULTS[dimension as UnitDimension],
            }) as const,
        ),
      },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    type: 'page',
    icon: DatabaseIcon,
    children: [
      {
        id: 'datasets',
        label: 'Datasets',
        type: 'multiselect',
        icon: ListIcon,
        options: DATASET_IDS,
        labels: Object.fromEntries(
          DATASET_IDS.map((id) => {
            const dataset = DATASETS[id]
            return [id, dataset.providerId + ' ' + dataset.name]
          }),
        ),
        default: [
          'met.no_locationforecast',
          'geosphere.at_nwp-v1-1h-2500m_offset',
          'geosphere.at_nwp-v1-1h-2500m',
          'geosphere.at_nowcast-v1-15min-1km',
        ] as DatasetId[],
        reorder: true,
      },
      {
        id: 'incrementalLoad',
        label: 'Incremental Load',
        type: 'boolean',
        icon: SquareSplitHorizontalIcon,
        default: true,
      },
      {
        id: 'locations',
        label: 'Locations',
        type: 'not-implemented',
        icon: MapPinIcon,
        default: [] as Location[],
      },
      {
        id: 'forecast',
        label: 'Forecast',
        type: 'page',
        icon: CloudSunIcon,
        children: [
          {
            id: 'preferDerivedSymbols',
            label: 'Prefer Derived Symbols',
            type: 'boolean',
            icon: CalculatorIcon,
            default: true,
          },
          {
            id: 'precipitation',
            label: 'Precipitation',
            type: 'group',
            icon: UmbrellaIcon,
            children: [
              {
                id: 'threshold',
                label: 'Threshold',
                icon: SquareSplitVerticalIcon,
                type: 'number',
                default: 0.0,
                step: 0.01,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    type: 'page',
    icon: SparklesIcon,
    children: [
      {
        id: 'symbols',
        label: 'Symbols',
        type: 'select',
        icon: ComponentIcon,
        options: ['meteocons-fill-animated', 'meteocons-fill-static'] as const,
        default: 'meteocons-fill-animated',
      },
      {
        id: 'colors',
        label: 'Colors',
        type: 'group',
        icon: PaletteIcon,
        children: [
          {
            id: 'temperatureColorStops',
            label: 'Temperature Colors',
            type: 'not-implemented',
            icon: ThermometerIcon,
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
    id: 'sections',
    label: 'Sections',
    type: 'page',
    icon: LayoutPanelTopIcon,
    children: [
      {
        id: 'current',
        label: 'Current',
        type: 'page',
        icon: ClockIcon,
        children: [
          {
            id: 'sticky',
            label: 'Keep Visible',
            type: 'boolean',
            icon: PinIcon,
            default: true,
          },
        ],
      },
      {
        id: 'chart',
        label: 'Chart',
        type: 'page',
        icon: ChartLineIcon,
        children: [
          {
            id: 'tooltip',
            label: 'Show Tooltip',
            type: 'boolean',
            icon: BadgeInfoIcon,
            default: false,
          },
          {
            id: 'highlightExtrema',
            label: 'Highlight Extrema',
            type: 'boolean',
            icon: ChevronsUpDownIcon,
            default: true,
          },
          {
            id: 'alwaysShowValuesDisplay',
            label: 'Pin Value Display',
            type: 'boolean',
            icon: HashIcon,
            default: true,
          },
          {
            id: 'axisUnits',
            label: 'Axis Unit Location',
            type: 'select',
            icon: ArrowUpAz,
            options: ['inline', 'above', 'replace', 'off'] as const,
            default: 'replace',
          },
        ],
      },
      {
        id: 'daily',
        label: 'Daily',
        type: 'page',
        icon: CalendarDaysIcon,
        children: [
          {
            id: 'showIncompleteLastDay',
            label: 'Show Incomplete Last Day',
            type: 'boolean',
            icon: PuzzleIcon,
            default: false,
          },
          {
            id: 'temperature',
            label: 'Temperature Display',
            type: 'select',
            icon: ThermometerIcon,
            options: ['hidden', 'dots', 'range-bar'],
            default: 'dots',
          },
        ],
      },
      {
        id: 'outlook',
        label: 'Outlook',
        type: 'page',
        icon: BinocularsIcon,
        children: [
          {
            id: 'showPrecipitation',
            label: 'Show Precipitation',
            type: 'boolean',
            icon: UmbrellaIcon,
            default: false,
          },
        ],
      },
      {
        id: 'components',
        label: 'Compenents',
        type: 'page',
        icon: ComponentIcon,
        children: [
          {
            id: 'timelineBar',
            label: 'Timeline Bar',
            type: 'group',
            icon: ChartNoAxesGanttIcon,
            children: [
              {
                id: 'marks',
                label: 'Marks',
                type: 'not-implemented',
                icon: HighlighterIcon,
                default: [{ hour: 6 }, { hour: 12 }, { hour: 18 }] as DateObjectUnits[],
              },
            ],
          },
        ],
      },
    ],
  },
] as const satisfies ConfigItem[]

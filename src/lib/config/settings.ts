import { UNIT_OPTIONS, type Unit, type UnitDimension } from '$lib/config/units'
import { DATASET_IDS, DATASETS, PROVIDERS, type DatasetId } from '$lib/data/providers'
import type { ConfigItem } from '$lib/settings/types'
import type { Location } from '$lib/types/ui'
import type { DateObjectUnits } from 'luxon'
import {
  ArrowUpAz,
  BadgeInfoIcon,
  BinocularsIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  ChartLineIcon,
  ChartNoAxesGanttIcon,
  ChevronsUpDownIcon,
  CircleArrowUpIcon,
  CircleFadingArrowUpIcon,
  CircleUserIcon,
  ClockIcon,
  CloudSunIcon,
  CodeIcon,
  ComponentIcon,
  DatabaseIcon,
  EraserIcon,
  GitCommitVerticalIcon,
  GithubIcon,
  GlobeIcon,
  HammerIcon,
  HardHatIcon,
  HashIcon,
  HeartIcon,
  HighlighterIcon,
  HistoryIcon,
  HourglassIcon,
  InfoIcon,
  LanguagesIcon,
  LayoutPanelTopIcon,
  LetterTextIcon,
  ListIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MoveVerticalIcon,
  PaletteIcon,
  PanelBottomOpenIcon,
  PencilLineIcon,
  PinIcon,
  RotateCwIcon,
  RulerIcon,
  SettingsIcon,
  SmileIcon,
  SparklesIcon,
  SquareSplitHorizontalIcon,
  SquareSplitVerticalIcon,
  SunIcon,
  TextIcon,
  ThermometerIcon,
  ToggleRightIcon,
  Trash2Icon,
  UmbrellaIcon,
} from '@lucide/svelte'
import type { ColorStop } from '$lib/types/ui'
import { type ForecastParameter } from '$lib/types/data'
import { pwa } from '$lib/stores/pwa'
import { derived } from 'svelte/store'
import type { Changelog } from '$lib/types/changelog'
import { iconMap } from '$lib/utils/icons'
import { FORECAST_METRICS } from './metrics'
import { DATASET_IDS_BY_PRIORITY } from './datasets'
import { clearCache, resetApp } from '$lib/utils/cache'

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
  density: 'ug/m3',
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
      {
        id: 'version',
        type: 'page',
        label: 'Version',
        icon: GitCommitVerticalIcon,
        children: [
          {
            id: 'version',
            type: 'value',
            label: 'App Version',
            icon: GitCommitVerticalIcon,
            value: async () => {
              const module = await import('changelog.json')
              const data = module.default as Changelog
              const latestRelease = data.releases?.[0]
              if (!latestRelease) return 'unversioned'
              return latestRelease.version
            },
          },
          {
            id: 'sw',
            type: 'value',
            label: 'Service Worker',
            icon: HardHatIcon,
            value: pwa.state,
          },
          {
            id: 'check-updates',
            type: 'action',
            label: 'Check for Updates',
            icon: CircleFadingArrowUpIcon,
            action: () => pwa.checkForUpdate(),
          },
          {
            id: 'update',
            type: 'action',
            label: 'Apply Update',
            icon: CircleArrowUpIcon,
            action: () => pwa.applyUpdate(),
            disabled: derived(pwa.needRefresh, (r) => !r),
          },
          {
            id: 'changelog',
            type: 'changelog',
            label: 'Changelog',
            icon: HistoryIcon,
          },
        ],
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
        reorder: true,
        disabled: true,
        options: DATASET_IDS_BY_PRIORITY,
        labels: Object.fromEntries(
          DATASET_IDS_BY_PRIORITY.map((id) => {
            const provider = PROVIDERS.find((p) => p.datasetIds.includes(id))!
            const dataset = DATASETS.find((d) => d.id === id)!
            return [id, provider.name + ' ' + dataset.name]
          }),
        ),
        default: DATASET_IDS_BY_PRIORITY satisfies DatasetId[],
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
        type: 'list',
        icon: MapPinIcon,
        nameProperty: 'name',
        default: [] as Location[],
        children: [
          {
            id: 'name',
            label: 'Name',
            type: 'text',
            icon: PencilLineIcon,
            default: undefined,
          },
          {
            id: 'icon',
            label: 'Icon',
            type: 'select',
            icon: SmileIcon,
            default: 'map-pin',
            options: Object.keys(iconMap),
          },
          // NOTE: changing any of these will cause cache invalidation
          {
            id: 'latitude',
            label: 'Latitude (°)',
            type: 'number',
            icon: GlobeIcon,
            min: -90,
            max: 90,
          },
          {
            id: 'longitude',
            label: 'Longitude (°)',
            type: 'number',
            icon: GlobeIcon,
            min: -180,
            max: 180,
          },
          {
            id: 'altitude',
            label: 'Altitude (m)',
            type: 'number',
            icon: MoveVerticalIcon,
            step: 1,
            min: 0,
            max: 10000,
          },
          // name: string
          // icon: string
          // longitude: number
          // latitude: number
          // altitude: number
        ],
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
                default: 0.05,
                step: 0.01,
              },
              {
                id: 'groupInterval',
                label: 'Group Interval',
                description: 'Group precipitation if the duration between is less than',
                icon: HourglassIcon,
                type: 'not-implemented',
                // type: 'duration',
                default: { hours: 2 },
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
              { value: 30, h: 25, s: 62, l: 58 },
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
          {
            id: 'metrics',
            label: 'Weather Metrics',
            type: 'multiselect',
            icon: LetterTextIcon,
            options: FORECAST_METRICS,
            default: ['dew_point', 'wind_speed', 'pressure'] as ForecastParameter[],
          },
        ],
      },
      {
        id: 'today',
        label: 'Today',
        type: 'page',
        icon: SunIcon,
        children: [
          {
            id: 'showChartParameterSelect',
            label: 'Show Chart Parameter Select',
            type: 'boolean',
            icon: ToggleRightIcon,
            default: true,
          },
        ],
      },
      {
        id: 'upcoming',
        label: 'Upcoming',
        type: 'page',
        icon: CalendarDaysIcon,
        children: [
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
            default: true,
          },
          {
            id: 'scrollToToday',
            label: 'Start at Today',
            type: 'boolean',
            icon: CalendarDaysIcon,
            default: true,
          },
        ],
      },
      {
        id: 'views',
        label: 'Views',
        type: 'group',
        icon: PanelBottomOpenIcon,
        children: [
          {
            id: 'day',
            label: 'Day View',
            type: 'page',
            icon: CalendarDaysIcon,
            children: [
              {
                id: 'metrics',
                label: 'Visible Weather Metrics',
                type: 'multiselect',
                icon: LetterTextIcon,
                options: FORECAST_METRICS,
                default: [
                  'temperature',
                  'precipitation_amount',
                  'wind_speed',
                  'cloud_coverage',
                  'dew_point',
                ] as ForecastParameter[],
              },
            ],
          },
        ],
      },
      {
        id: 'components',
        label: 'Components',
        type: 'group',
        icon: ComponentIcon,
        children: [
          {
            id: 'showSectionTitles',
            label: 'Section Titles',
            type: 'boolean',
            icon: LetterTextIcon,
            default: true,
          },
          {
            id: 'chart',
            label: 'Chart',
            type: 'page',
            icon: ChartLineIcon,
            children: [
              {
                id: 'metrics',
                label: 'Plotted Weather Metrics',
                type: 'multiselect',
                icon: LetterTextIcon,
                options: FORECAST_METRICS,
                default: ['temperature', 'precipitation_amount', 'cloud_coverage'] as ForecastParameter[],
              },
              {
                id: 'tooltip',
                label: 'Show Tooltip',
                type: 'boolean',
                icon: BadgeInfoIcon,
                default: true,
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
            id: 'timelineBar',
            label: 'Timeline Bar',
            type: 'page',
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
  {
    id: 'about',
    type: 'page',
    label: 'About',
    icon: InfoIcon,
    children: [
      {
        id: 'description',
        type: 'description',
        label: 'Description',
        icon: TextIcon,
        text: `The main focus of this project is visualizing weather data in a way that makes it easy to get a good idea at a glance, while providing all the details when needed.<br>
               It also is independent of the source of weather data.`,
      },
      {
        id: 'debug',
        type: 'page',
        label: 'Debug',
        icon: HammerIcon,
        children: [
          {
            id: 'reload',
            type: 'action',
            label: 'Reload',
            icon: RotateCwIcon,
            action: () => window.location.reload(),
          },
          {
            id: 'auth',
            type: 'action',
            label: 'Authenticate',
            icon: LockIcon,
            action: () => (window.location.href = 'https://auth.kjan.dev'),
          },
          {
            id: 'clear-cache',
            type: 'action',
            label: 'Clear Cache',
            icon: EraserIcon,
            action: () => clearCache(),
          },
          {
            id: 'reset-app',
            type: 'action',
            label: 'Reset App',
            icon: Trash2Icon,
            variant: 'destructive',
            action: () => resetApp(),
          },
        ],
      },
      {
        id: 'author',
        type: 'group',
        label: 'Author',
        icon: CircleUserIcon,
        children: [
          {
            id: 'github',
            type: 'value',
            icon: GithubIcon,
            label: 'Github',
            value: 'kaiser-jan',
            action: () => window.open('https://github.com/kaiser-jan', '_blank'),
          },
          {
            id: 'website',
            type: 'value',
            icon: GlobeIcon,
            label: 'Website',
            value: 'kaiser-jan.com',
            action: () => window.open('https://kaiser-jan.com', '_blank'),
          },

          {
            id: 'email',
            type: 'value',
            icon: MailIcon,
            label: 'E-Mail',
            value: 'mail@kaiser-jan.com',
            action: () => window.open('mailto:account@kaiser-jan.com'),
          },
          {
            id: 'support',
            type: 'not-implemented',
            icon: HeartIcon,
            label: 'Support Me',
          },
        ],
      },
      {
        id: 'source-code',
        type: 'group',
        label: 'Source Code',
        icon: CodeIcon,
        children: [
          {
            id: 'coming-soon',
            type: 'description',
            icon: GlobeIcon,
            label: '',
            text: 'It is planned to open-source this project in the near future!',
          },
        ],
      },
    ],
  },
] as const satisfies ConfigItem[]

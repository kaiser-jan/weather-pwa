import { UNIT_OPTIONS, type Unit, type UnitDimension } from '$lib/config/units'
import { DATASET_IDS, DATASETS, PROVIDERS, type DatasetId } from '$lib/data/providers'
import type { SettingsBlueprint } from 'svelte-settings'
import type { Location } from '$lib/types/ui'
import type { DateObjectUnits } from 'luxon'
import {
  ArrowUpAz,
  BadgeInfoIcon,
  BinocularsIcon,
  CalculatorIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ChartLineIcon,
  ChartNoAxesGanttIcon,
  ChartSplineIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CircleArrowUpIcon,
  CircleFadingArrowUpIcon,
  CircleUserIcon,
  ClockIcon,
  CloudSunIcon,
  CodeIcon,
  ComponentIcon,
  ContrastIcon,
  DatabaseIcon,
  EraserIcon,
  FactoryIcon,
  GitCommitVerticalIcon,
  GithubIcon,
  GlobeIcon,
  GlobeLockIcon,
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
  LifeBuoyIcon,
  ListIcon,
  ListOrderedIcon,
  LockIcon,
  MagnetIcon,
  MailIcon,
  MapPinIcon,
  MoveVerticalIcon,
  PaletteIcon,
  PencilLineIcon,
  PinIcon,
  RedoIcon,
  RotateCwIcon,
  RulerDimensionLineIcon,
  RulerIcon,
  SettingsIcon,
  SigmaIcon,
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
import { pwa } from '$lib/stores/pwa'
import { derived } from 'svelte/store'
import { iconMap } from '$lib/utils/icons'
import { FORECAST_METRICS, type ForecastMetric } from './metrics'
import { DATASET_IDS_BY_PRIORITY } from './datasets'
import { clearCache, resetApp } from '$lib/utils/cache'
import { SECTIONS, type SectionId } from '$lib/components/sections/registry'
import { performMigrations } from 'svelte-settings'
import { SETTINGS_MIGRATIONS } from './settings-migrations'

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
              const data = module.default
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
            changelog: async () => {
              const module = await import('changelog.json')
              return module.default
            },
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
        description: 'Select where to get weather data from and order by priority.',
        type: 'multiselect-reorder',
        allowsFullscreen: true,
        requiresFullscreen: true,
        icon: ListIcon,
        options: DATASET_IDS_BY_PRIORITY,
        labels: Object.fromEntries(
          DATASET_IDS_BY_PRIORITY.map((id) => {
            const provider = PROVIDERS.find((p) => p.datasetIds.includes(id))!
            const dataset = DATASETS.find((d) => d.id === id)!
            return [id, `${dataset.name} (${provider.id})`]
          }),
        ),
        default: DATASET_IDS_BY_PRIORITY satisfies DatasetId[],
      },
      {
        id: 'incrementalLoad',
        label: 'Incremental Load',
        description: 'Update the view while loading data, instead of waiting for all data.',
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
        id: 'locationSnapDistance',
        label: 'Snap to nearby Location',
        description: 'When using geolocation, switch to a saved location if there is one within this distance.',
        icon: MagnetIcon,
        type: 'number',
        unit: 'm',
        default: 100,
        min: 0,
      },
      {
        id: 'locationSuggestDistance',
        label: 'Suggest saving Location',
        description:
          'Suggest saving frequently used locations, when geolocations within this radius were used recently.',
        icon: RulerDimensionLineIcon,
        type: 'number',
        unit: 'm',
        default: 200,
        min: 0,
      },
      {
        id: 'forecast',
        label: 'Forecast',
        type: 'page',
        icon: CloudSunIcon,
        children: [
          {
            id: 'metrics',
            label: 'Visible Weather Metrics',
            description: 'Which metrics are important to you. Others will need to be expanded.',
            type: 'multiselect-reorder',
            icon: LetterTextIcon,
            options: FORECAST_METRICS,
            default: [
              'temperature',
              'precipitation_amount',
              'wind_speed',
              'cloud_coverage',
              'dew_point',
              'aqi',
              'pressure_sealevel',
            ] as ForecastMetric[],
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
                description: 'Precipitation under this threshold is ignored.',
                icon: SquareSplitVerticalIcon,
                type: 'number',
                default: 0.05,
                step: 0.01,
                unit: 'mm/h',
              },
              {
                id: 'groupInterval',
                label: 'Group Interval',
                description: 'Breaks in precipitation under this limit are ignored.',
                icon: HourglassIcon,
                type: 'not-implemented',
                // type: 'duration',
                default: { hours: 2 },
              },
            ],
          },
          {
            id: 'aqi',
            label: 'Air Quality',
            type: 'group',
            icon: FactoryIcon,
            children: [
              {
                id: 'showCategory',
                label: 'Show Category Label',
                description: 'Show the AQI label instead of the index number.',
                type: 'boolean',
                icon: ListOrderedIcon,
                default: true,
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
              { value: -80, h: 360, s: 65, l: 35 }, // hsl(360 65% 35%)
              { value: -20, h: 264, s: 60, l: 40 }, // hsl(264 60% 40%)
              { value: -10, h: 225, s: 55, l: 44 }, // hsl(225 55% 44%)
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
      {
        id: 'accessibility',
        label: 'Accessibility',
        type: 'group',
        icon: LifeBuoyIcon,
        children: [
          {
            id: 'hint',
            type: 'description',
            label: 'Hint',
            icon: TextIcon,
            text: `Sadly this app currently is not very accessible. Still, here are some options which might help!`,
          },
          {
            id: 'differentiateWithoutColor',
            label: 'Differentiate Without Color',
            type: 'boolean',
            icon: ContrastIcon,
            default: false,
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
        id: 'order',
        label: 'Section Order',
        type: 'multiselect-reorder',
        icon: ListOrderedIcon,
        options: Object.keys(SECTIONS),
        labels: Object.fromEntries(Object.entries(SECTIONS).map(([k, s]) => [k, s.name])),
        default: ['today', 'outlook', 'air_pollution', 'sources'] as SectionId[],
      },
      {
        id: 'current',
        label: 'Current',
        type: 'page',
        icon: ClockIcon,
        children: [
          {
            id: 'sticky',
            label: 'Stick to top',
            description: 'Keep current weather visible at the top instead of scrolling.',
            type: 'boolean',
            icon: PinIcon,
            default: true,
          },
          {
            id: 'metrics',
            label: 'Weather Metrics',
            description: 'What metrics to display for the current weather.',
            type: 'multiselect-reorder',
            icon: LetterTextIcon,
            options: FORECAST_METRICS,
            default: ['dew_point', 'wind_speed', 'pressure_sealevel'] as ForecastMetric[],
          },
        ],
      },
      {
        id: 'today',
        label: 'Today',
        type: 'page',
        icon: SECTIONS.today.icon,
        children: [
          {
            id: 'metrics',
            label: 'Weather Metrics',
            description: 'What metrics to display in the summary for today.',
            type: 'multiselect-reorder',
            icon: LetterTextIcon,
            options: FORECAST_METRICS,
            default: ['temperature', 'precipitation_amount'] as ForecastMetric[],
          },
          {
            id: 'showChart',
            label: 'Show Chart',
            type: 'boolean',
            icon: ChartLineIcon,
            default: true,
          },
          {
            id: 'showSummary',
            label: 'Show Summary',
            type: 'boolean',
            icon: SigmaIcon,
            default: true,
          },
          {
            id: 'fullDay',
            label: 'Show Full Day',
            description: 'Whether to start at 00:00 or at the current time.',
            type: 'select',
            icon: CalendarClockIcon,
            options: ['always', 'when-available', 'never'],
            default: 'always',
          },
        ],
      },
      {
        id: 'tomorrow',
        label: 'Tomorrow',
        type: 'page',
        icon: SECTIONS.tomorrow.icon,
        children: [
          {
            id: 'metrics',
            label: 'Weather Metrics',
            description: 'What metrics to display in the summary for tomorrow.',
            type: 'multiselect-reorder',
            icon: LetterTextIcon,
            options: FORECAST_METRICS,
            default: ['temperature', 'precipitation_amount'] as ForecastMetric[],
          },
          {
            id: 'showChart',
            label: 'Show Chart',
            type: 'boolean',
            icon: ChartLineIcon,
            default: false,
          },
          {
            id: 'showSummary',
            label: 'Show Summary',
            type: 'boolean',
            icon: SigmaIcon,
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
            description: 'How to indicate temperature by color.',
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
        icon: ChevronsRightIcon,
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
            description: 'Whether to align today at the left.',
            type: 'boolean',
            icon: CalendarDaysIcon,
            default: true,
          },
          {
            id: 'showChart',
            label: 'Show Chart',
            type: 'boolean',
            icon: ChartLineIcon,
            default: true,
          },

          {
            id: 'showSummary',
            label: 'Show Summary',
            type: 'boolean',
            icon: SigmaIcon,
            default: true,
          },
        ],
      },
      // {
      //   id: 'views',
      //   label: 'Views',
      //   type: 'group',
      //   icon: PanelBottomOpenIcon,
      //   children: [
      //     {
      //       id: 'day',
      //       label: 'Day View',
      //       type: 'page',
      //       icon: CalendarDaysIcon,
      //       children: [
      //                     ],
      //     },
      //   ],
      // },
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
                id: 'indicator',
                label: 'Indicator',
                description: 'How to display the values at the hovered timestamp.',
                type: 'select',
                icon: BadgeInfoIcon,
                options: ['tooltip', 'display', 'both'],
                default: 'tooltip',
              },
              {
                id: 'parameterSelect',
                label: 'Parameter Select',
                description: 'Where to show the parameter toggle bar.',
                type: 'select',
                icon: ToggleRightIcon,
                options: ['always', 'overview', 'except-overview', 'never'],
                default: 'never',
              },
              {
                id: 'highlightExtrema',
                label: 'Highlight Extrema',
                description: 'Add labels to the highs and lows of temperature.',
                type: 'boolean',
                icon: ChevronsUpDownIcon,
                default: true,
              },
              {
                id: 'alwaysShowValuesDisplay',
                label: 'Pin Display Indicator',
                description: 'Keep the display indicator visible even when not hovering the chart.',
                type: 'boolean',
                icon: HashIcon,
                default: true,
              },
              {
                id: 'showYAxes',
                label: 'Show Value Axes',
                type: 'select',
                icon: ArrowUpAz,
                options: ['always', 'except-overview', 'never'] as const,
                default: 'except-overview',
              },
              {
                id: 'axisUnits',
                label: 'Axis Unit Location',
                description: 'Where to position the units relative to the axes',
                type: 'select',
                icon: ArrowUpAz,
                options: ['inline', 'above', 'replace', 'off'] as const,
                default: 'replace',
              },

              {
                id: 'plottedMetrics',
                label: 'Plotted Weather Metrics',
                description: 'What metrics to chart by default.',
                type: 'multiselect-reorder',
                icon: ChartSplineIcon,
                options: FORECAST_METRICS,
                default: ['temperature', 'precipitation_amount', 'cloud_coverage'] as ForecastMetric[],
              },
              {
                id: 'pinnedMetrics',
                label: 'Pinned Weather Metrics',
                description: 'What metrics should always be visible in the parameter select.',
                type: 'multiselect-reorder',
                icon: ChartSplineIcon,
                options: FORECAST_METRICS,
                default: ['temperature', 'precipitation_amount', 'cloud_coverage', 'wind_speed'] as ForecastMetric[],
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
            id: 'migrate-settings',
            type: 'action',
            label: 'Re-Migrate Settings',
            icon: RedoIcon,
            action: () => {
              performMigrations({ migrations: SETTINGS_MIGRATIONS, remigrate: true })
              window.location.reload()
            },
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
        id: 'privacy',
        type: 'page',
        label: 'Data Privacy',
        icon: GlobeLockIcon,
        children: [
          {
            id: 'description',
            type: 'description',
            label: 'Description',
            text: `This app only transmits data necessary to provide its services. No data is stored by us.<br>
The only data leaving your phone is the location which you are requesting a forecast for. This location needs to be shared with data providers, in order to provide a forecast.<br>
You can see which providers are used in the Data Sources section.`,
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
] as const satisfies SettingsBlueprint

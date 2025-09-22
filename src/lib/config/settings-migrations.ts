import {
  asBoolean,
  copy,
  get,
  renameArrayEntry,
  write,
  writeNew,
  type SettingsMigrations,
} from '$lib/settings/utils/migration'

export const SETTINGS_MIGRATIONS: SettingsMigrations = [
  [],
  [
    {
      description: 'Rename metric `pressure` to `pressure_sealevel`',
      callback: (settings) => {
        renameArrayEntry(settings, ['data', 'forecast', 'metrics'], 'pressure', 'pressure_sealevel')
        renameArrayEntry(settings, ['sections', 'current', 'metrics'], 'pressure', 'pressure_sealevel')
        renameArrayEntry(settings, ['sections', 'today', 'metrics'], 'pressure', 'pressure_sealevel')
        renameArrayEntry(
          settings,
          ['sections', 'components', 'chart', 'plottedMetrics'],
          'pressure',
          'pressure_sealevel',
        )
        renameArrayEntry(
          settings,
          ['sections', 'components', 'chart', 'pinnedMetrics'],
          'pressure',
          'pressure_sealevel',
        )

        return settings
      },
    },
    {
      description: 'Copy sections.today.metrics to sections.tomorrow.metrics',
      callback: (settings) => copy(settings, ['sections', 'today', 'metrics'], ['sections', 'tomorrow', 'metrics']),
    },
    {
      description: 'Convert sections.today.parameterSelect boolean to sections.components.chart.parameterSelect select',
      callback: (settings) => {
        const parameterSelect = asBoolean(get(settings, ['sections', 'today', 'showChartParameterSelect']))
        if (parameterSelect === true)
          writeNew(settings, ['sections', 'components', 'chart', 'parameterSelect'], 'overview')
        return settings
      },
    },
    {
      description: 'Convert sections.components.chart.tooltip boolean to sections.components.chart.indicator select',
      callback: (settings) => {
        const tooltip = asBoolean(get(settings, ['sections', 'components', 'chart', 'tooltip']))
        if (tooltip === false) write(settings, ['sections', 'components', 'chart', 'indicator'], 'display')
        return settings
      },
    },
  ],
]

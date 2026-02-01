import type { Component } from 'svelte'
import SectionUpcoming from './SectionUpcoming.svelte'
import SectionToday from './SectionToday.svelte'
import SectionTomorrow from './SectionTomorrow.svelte'
import SectionOutlook from './SectionOutlook.svelte'
import SectionAirQuality from './SectionAirQuality.svelte'
import SectionDataSources from './SectionDataSources.svelte'
import SectionNotices from './SectionNotices.svelte'
import type { SectionId } from './registry'

// NOTE: this is separate from the registry, as combining it would cause import issues
const components: Record<SectionId, Component<{}, {}, ''>> = {
  notices: SectionNotices,
  today: SectionToday,
  tomorrow: SectionTomorrow,
  upcoming: SectionUpcoming,
  outlook: SectionOutlook,
  air_pollution: SectionAirQuality,
  sources: SectionDataSources,
}
export function getComponent(id: SectionId) {
  return components[id]
}

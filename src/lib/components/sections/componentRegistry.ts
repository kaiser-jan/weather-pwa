import type { Component } from 'svelte'
import SectionUpcoming from './SectionUpcoming.svelte'
import SectionTodayChart from './SectionTodayChart.svelte'
import SectionOutlook from './SectionOutlook.svelte'
import SectionAirPollution from './SectionAirPollution.svelte'
import SectionSources from './SectionSources.svelte'
import NoticePrecipitation from './notices/NoticePrecipitation.svelte'
import type { SectionId } from './registry'

// NOTE: this is separate from the registry, as combining it would cause import issues
const components: Record<SectionId, Component<{}, {}, ''>> = {
  notices: NoticePrecipitation,
  today: SectionTodayChart,
  upcoming: SectionUpcoming,
  outlook: SectionOutlook,
  air_pollution: SectionAirPollution,
  sources: SectionSources,
}
export function getComponent(id: SectionId) {
  return components[id]
}

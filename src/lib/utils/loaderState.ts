import { loaderStates } from '$lib/stores/data'
import type { LoaderState } from '$lib/types/data/providers'
import { derived } from 'svelte/store'

export type State = 'success' | 'loading' | 'error' | 'outdated'

export function stateFromLoaderState(loaderState: LoaderState) {
  if (!loaderState.done) return 'loading'
  if (!loaderState.success) return 'error'
  if (loaderState.refreshAt < loaderState.updatedAt) return 'outdated'
  return 'success'
}

export const loaderSummaryState = derived([loaderStates], ([loaderStates]): State => {
  const states = loaderStates.map(stateFromLoaderState)
  if (states.some((s) => s === 'loading')) return 'loading'
  if (states.some((s) => s === 'error')) return 'error'
  if (states.some((s) => s === 'outdated')) return 'outdated'
  return 'success'
})

export const loaderSummaryLabel = derived([loaderStates, loaderSummaryState], ([loaderStates, loaderSummaryState]) => {
  const states = loaderStates.map(stateFromLoaderState)

  const failedCount = states.filter((s) => s === 'error').length
  const loadedCount = states.filter((s) => s !== 'loading').length
  const outdatedCount = states.filter((s) => s === 'outdated').length

  function formatDatasetCount(count: number) {
    if (count === 1) return '1 dataset'
    return `${count} datasets`
  }

  if (loaderSummaryState === 'error') return `Failed to load ${formatDatasetCount(failedCount)}!`
  if (loaderSummaryState === 'outdated') return `${formatDatasetCount(outdatedCount)} outdated!`
  if (loaderSummaryState === 'loading') return `Loading data... (${loadedCount}/${states.length})`
  if (loaderSummaryState === 'success') return 'All datasets up to date'
  return ''
})

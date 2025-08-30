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

export const loaderSummaryLabels: Record<State, string> = {
  error: 'Failed to load all datasets!',
  outdated: 'Not everything up to date!',
  loading: 'Loading data...',
  success: 'All datasets up to date',
}

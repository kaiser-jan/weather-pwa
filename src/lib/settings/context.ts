import { getContext, setContext } from 'svelte'
import type { InitializedSettings } from '.'

const key = {}

export function setSettingsContext(settings: InitializedSettings) {
  setContext(key, settings)
}

export function getSettingsContext() {
  return getContext(key) as InitializedSettings
}

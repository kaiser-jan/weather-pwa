import { extractDefaults } from './extractDefaults'
import type { SettingsBlueprint, SettingsFromBlueprint } from './types'
import { select } from '$lib/utils/stores'
import { getDeep, mergeDeep, setDeep } from './deep'
import { writable, get } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

export type { SettingsFromBlueprint, SettingsBlueprint } from './types'

export type InitializedSettings = ReturnType<typeof useSettings>

export { default as SettingsView } from './components/SettingsView.svelte'

export * as migration from './utils/migration'

export { performMigrations } from './migrate'

/**
 * Creates an instance of svelte-settings following the given blueprint.
 * Should only be called once, as this initializes the settings and creates a store for it.
 * Having multiple instances would break reactivity.
 * You can re-export the initialized settings for use in your app.
 */
export function useSettings<T extends SettingsBlueprint>(blueprint: T) {
  type Settings = SettingsFromBlueprint<T>

  const settingsOverrides = persisted('settings', {})

  const settingsDefaults = extractDefaults(blueprint) as Settings
  const settingsStore = writable<Settings>(mergeDeep(structuredClone(settingsDefaults), get(settingsOverrides)))

  const settings = {
    subscribe: settingsStore.subscribe,
    // set: settingsWritable.set,
    // update: settingsWritable.update,
    select: <U>(selector: (s: Settings) => U, isEqual?: (a: U, b: U) => boolean) =>
      select(settingsStore, selector, isEqual),
    readSetting,
    writeSetting,
    resetSetting,
    defaults: settingsDefaults,
    blueprint,
  }

  return settings

  function writeSetting(path: readonly string[], value: unknown) {
    console.info(`Writing setting: ${path} = ${JSON.stringify(value)}`)
    settingsStore.update((s) => {
      setDeep(s, path, value)
      return s
    })

    setDeep(settingsOverrides, path, value)

    settingsOverrides.update((s) => {
      setDeep(s, path, value)
      return s
    })
  }

  function readSetting(path: readonly string[]) {
    console.debug(`Reading setting: ${path}`)
    const valueOverride = getDeep(get(settingsOverrides), path)
    if (valueOverride !== undefined) {
      console.debug(`Read changed setting: ${path} = ${JSON.stringify(valueOverride)}`)
      return { value: valueOverride, changed: true }
    }

    const value = getDeep(get(settingsStore), path)
    console.debug(`Read default setting: ${path} = ${JSON.stringify(value)}`)

    return { value: value, changed: false }
  }

  function resetSetting(path: string[]) {
    console.debug(`Resetting setting: ${path}`)

    const defaultValue = getDeep(settingsDefaults, path)

    settingsStore.update((s) => {
      setDeep(s, path, defaultValue)
      return s
    })

    settingsOverrides.update((s) => {
      // deleteDeep(s, path)
      setDeep(s, path, undefined)
      return s
    })

    console.info(`Reset setting: ${path} to ${JSON.stringify(defaultValue)}`)

    return defaultValue
  }

  // NOTE: building an object where every setting is a Writable would not help:
  // it can neither be accessed as $settings.a nor as settings.$a,
  // so creating a variable for it is necessary anyways
}

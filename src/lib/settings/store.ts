import { extractDefaults } from './extractDefaults'
import { settingsConfig } from '$lib/config/settings'
import type { ConfigType } from './types'
import { select } from '$lib/utils/stores'
import { getDeep, mergeDeep, setDeep } from './deep'
import { writable, get } from 'svelte/store'

type ConfigLiteral = typeof settingsConfig

export type SettingsSchema = ConfigType<ConfigLiteral>

const stored = JSON.parse(localStorage.getItem('settings') ?? '{}')
const settingsOverrides = writable(stored ?? {})
settingsOverrides.subscribe((value) => localStorage.setItem('settings', JSON.stringify(value)))

export const settingsDefaults = extractDefaults(settingsConfig) as SettingsSchema
const settingsBaseStore = writable<SettingsSchema>(mergeDeep(structuredClone(settingsDefaults), get(settingsOverrides)))

export const settings = {
  subscribe: settingsBaseStore.subscribe,
  // set: settingsWritable.set,
  // update: settingsWritable.update,
  select: <U>(selector: (s: SettingsSchema) => U, isEqual?: (a: U, b: U) => boolean) =>
    select(settingsBaseStore, selector, isEqual),
  readSetting,
  writeSetting,
  resetSetting,
}

function writeSetting(path: string[], value: unknown) {
  console.info(`Writing setting: ${path} = ${JSON.stringify(value)}`)
  settingsBaseStore.update((s) => {
    setDeep(s, path, value)
    return s
  })

  setDeep(settingsOverrides, path, value)

  settingsOverrides.update((s) => {
    setDeep(s, path, value)
    return s
  })
}

function readSetting(path: string[]) {
  console.debug(`Reading setting: ${path}`)
  const valueOverride = getDeep(get(settingsOverrides), path)
  if (valueOverride !== undefined) {
    console.debug(`Read changed setting: ${path} = ${JSON.stringify(valueOverride)}`)
    return { value: valueOverride, changed: true }
  }

  const value = getDeep(get(settingsBaseStore), path)
  console.debug(`Read default setting: ${path} = ${JSON.stringify(value)}`)

  return { value: value, changed: false }
}

function resetSetting(path: string[]) {
  console.debug(`Resetting setting: ${path}`)

  const defaultValue = getDeep(settingsDefaults, path)

  settingsBaseStore.update((s) => {
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

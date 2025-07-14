import { extractDefaults } from './extractDefaults'
import { settingsConfig } from './config'
import type { ConfigType } from './types'
import { select } from '$lib/utils/stores'
import { deleteDeep, getDeep, mergeDeep, setDeep } from './deep'
import { writable, get } from 'svelte/store'

type ConfigLiteral = typeof settingsConfig

type SettingsSchema = ConfigType<ConfigLiteral>

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

function writeSetting(path: string[], value: any) {
  console.log(path)
  settingsBaseStore.update((s) => {
    console.log(s)
    setDeep(s, path, value)
    return s
  })

  console.log(settingsOverrides)
  setDeep(settingsOverrides, path, value)

  settingsOverrides.update((s) => {
    console.log(s)
    setDeep(s, path, value)
    return s
  })
}

function readSetting(path: string[]) {
  const valueOverride = getDeep(get(settingsOverrides), path)
  if (valueOverride !== undefined) return { value: valueOverride, changed: true }

  const value = getDeep(get(settingsBaseStore), path)
  return { value: value, changed: false }
}

function resetSetting(path: string[]) {
  const defaultValue = getDeep(settingsDefaults, path)
  console.log('reset', path, defaultValue)

  settingsBaseStore.update((s) => {
    setDeep(s, path, defaultValue)
    return s
  })

  settingsOverrides.update((s) => {
    // deleteDeep(s, path)
    setDeep(s, path, undefined)
    console.log(s)
    return s
  })

  return defaultValue
}

// NOTE: building an object where every setting is a Writable would not help:
// it can neither be accessed as $settings.a nor as settings.$a,
// so creating a variable for it is necessary anyways

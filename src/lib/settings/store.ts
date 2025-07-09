import { derived, get, readable, readonly, writable, type Readable } from 'svelte/store'
import { extractDefaults } from './extractDefaults'
import { settingsConfig } from './config'
import type { ConfigType } from './types'
import { select } from '$lib/utils/stores'

type ConfigLiteral = typeof settingsConfig

type SettingsSchema = ConfigType<ConfigLiteral>

const defaultConfig = extractDefaults(settingsConfig) as SettingsSchema
export const settingsWritable = writable(structuredClone(defaultConfig))
export const settingsDefaults = defaultConfig

export const settings = {
  subscribe: settingsWritable.subscribe,
  set: settingsWritable.set,
  update: settingsWritable.update,
  select: <U>(selector: (s: SettingsSchema) => U, isEqual?: (a: U, b: U) => boolean) =>
    select(settingsWritable, selector, isEqual),
}

// NOTE: building an object where every setting is a Writable would not help:
// it can neither be accessed as $settings.a nor as settings.$a,
// so creating a variable for it is necessary anyways

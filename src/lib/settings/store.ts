import { writable } from 'svelte/store'
import { extractDefaults } from './extractDefaults'
import { settingsConfig } from './config'
import type { ConfigType } from './types'

type ConfigLiteral = typeof settingsConfig

type SettingsSchema = ConfigType<ConfigLiteral>

const defaultConfig = extractDefaults(settingsConfig) as SettingsSchema
export const settings = writable(structuredClone(defaultConfig))

export const settingsDefaults = defaultConfig

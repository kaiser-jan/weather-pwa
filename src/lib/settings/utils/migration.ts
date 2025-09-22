import { setDeep } from '../deep'

type Settings = Record<string, unknown>

interface SettingsMigrationStep {
  description: string
  callback: (settings: Settings) => Settings
}

export type SettingsMigrations = SettingsMigrationStep[][]

export function get(settings: Settings, path: string[]) {
  let part: unknown = settings

  for (const key of path) {
    if (typeof part !== 'object' || part === null || !(key in part)) {
      return undefined
    }

    part = part[key as keyof typeof part]
  }

  return part
}

export function write(settings: Settings, path: string[], value: unknown) {
  setDeep(settings, path, value)
  return settings
}

export function writeNew(settings: Settings, path: string[], value: unknown) {
  const currentValue = get(settings, path)
  if (currentValue !== undefined) {
    console.debug(`Path ${path} already has a defined value, skipping write!`)
    return
  }
  setDeep(settings, path, value)
  return settings
}

export function copy(settings: Settings, fromPath: string[], toPath: string[]) {
  const valueFrom = asArray(get(settings, fromPath))
  writeNew(settings, toPath, valueFrom)
  return settings
}

export function asBoolean(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v as boolean
  return undefined
}

export function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

export function asObject(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}
}

export function renameArrayEntry(settings: Settings, path: string[], oldEntry: string, newEntry: string) {
  const setting = asArray(get(settings, path))
  if (setting.includes(oldEntry)) {
    const i = setting.indexOf(oldEntry)
    setting[i] = newEntry
  }
  return settings
}

import type { buttonVariants } from '$lib/components/ui/button'
import type { Icon } from '@lucide/svelte'
import type { Readable } from 'svelte/store'

// TODO: pass the settings type as ctx
export type VisibilityCallback = (ctx: Record<string, unknown>) => boolean

type BaseConfigItem = {
  id: string
  label: string
  description?: string
  icon?: typeof Icon
  visible?: VisibilityCallback
  disabled?: boolean | Readable<boolean>
  allowsFullscreen?: boolean
  action?: () => any
}

export type TextSetting = BaseConfigItem & {
  type: 'text'
  default: string
  placeholder?: string
}

export type SelectSetting = BaseConfigItem & {
  type: 'select'
  options: readonly string[]
  default: string
}

export type MultiSelectSetting = BaseConfigItem & {
  type: 'multiselect' | 'multiselect-reorder'
  options: readonly string[]
  labels?: Record<string, string>
  default: string[]
  requiresFullscreen?: boolean
}

export type BooleanSetting = BaseConfigItem & {
  type: 'boolean'
  default: boolean
}

export type NumberSetting = BaseConfigItem & {
  type: 'number'
  default: number
  min?: number
  max?: number
  step?: number
  unit?: string
}

export type DescriptionItem = BaseConfigItem & {
  type: 'description'
  text: string
}
export type ValueDisplayItem = BaseConfigItem & {
  type: 'value'
  value: string | undefined | Readable<string | undefined> | (() => Promise<string | undefined>)
}
export type ActionItem = BaseConfigItem & {
  type: 'action'
  action: () => Promise<unknown> | unknown | void
  variant?: string
  enabled?: Readable<true>
}

export type NotImplementedSetting = BaseConfigItem & {
  type: 'not-implemented'
  default?: unknown
}

type OptionalProp<T, K extends PropertyKey> = T extends Record<K, unknown> ? Omit<T, K> & Partial<Pick<T, K>> : T
export type GroupWrapper = BaseConfigItem & {
  type: 'group'
  children: ConfigItem[]
}
export type BasePage = BaseConfigItem & {
  type: 'page'
  children: ConfigItem[]
}
export type ListSettingPage = BaseConfigItem & {
  type: 'list'
  default: Array<unknown>
  nameProperty: string
  children: OptionalProp<ConfigItem, 'default'>[]
}
export type ChangelogPage = BaseConfigItem & {
  type: 'changelog'
}

export type SettingsPage = BasePage | ListSettingPage | ChangelogPage
export type SettingsWrapper = GroupWrapper
export type SettingsItem = DescriptionItem | ValueDisplayItem | ActionItem | NotImplementedSetting
export type SettingsInput = TextSetting | SelectSetting | MultiSelectSetting | BooleanSetting | NumberSetting

export type SettingsNested = BasePage | SettingsWrapper

export type ConfigItem = SettingsPage | SettingsWrapper | SettingsItem | SettingsInput

//

export type ConfigType<T extends readonly ConfigItem[]> = {
  [K in T[number] as K['id']]: K extends { type: 'group' | 'page'; children: infer C }
    ? ConfigType<C & readonly ConfigItem[]>
    : K extends { type: 'select'; options: infer O }
      ? O extends readonly unknown[]
        ? O[number]
        : never
      : K extends { type: 'multiselect'; options: infer O }
        ? O
        : K extends { default: infer D }
          ? D
          : never
}

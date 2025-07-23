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
  type: 'multiselect'
  options: readonly string[]
  labels?: Record<string, string>
  reorder?: boolean
  default: string[]
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
}

export type StaticDescription = BaseConfigItem & {
  type: 'description'
  text: string
}

export type StaticSpacer = BaseConfigItem & {
  type: 'spacer'
}
export type StaticValue = BaseConfigItem & {
  type: 'value'
  value: string | Readable<string> | (() => Promise<string>)
}
export type StaticAction = BaseConfigItem & {
  type: 'action'
  action: () => Promise<unknown> | unknown | void
  enabled?: Readable<true>
}

export type NotImplementedSetting = BaseConfigItem & {
  type: 'not-implemented'
  default?: unknown
}

export type Setting =
  | TextSetting
  | SelectSetting
  | MultiSelectSetting
  | BooleanSetting
  | NumberSetting
  | NotImplementedSetting

type Static = StaticDescription | StaticValue | StaticAction

//

type OptionalProp<T, K extends PropertyKey> = T extends Record<K, unknown> ? Omit<T, K> & Partial<Pick<T, K>> : T
export type SettingGroup = BaseConfigItem & {
  type: 'group'
  children: ConfigItem[]
}
export type SettingPage = BaseConfigItem & {
  type: 'page'
  children: ConfigItem[]
}
export type ListSetting = BaseConfigItem & {
  type: 'list'
  default: Array<unknown>
  nameProperty: string
  children: OptionalProp<ConfigItem, 'default'>[]
}
export type PageChangelog = BaseConfigItem & {
  type: 'changelog'
}

export type NestableSetting = SettingGroup | SettingPage | ListSetting

export type ConfigItem = Setting | Static | NestableSetting | PageChangelog

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

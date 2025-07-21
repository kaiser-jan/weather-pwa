import type { Icon } from '@lucide/svelte'

// TODO: settings type
export type VisibilityCallback = (ctx: Record<string, unknown>) => boolean

type BaseConfigItem = {
  id: string
  label: string
  icon?: typeof Icon
  visible?: VisibilityCallback
  disabled?: boolean
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

export type DescriptionBlock = BaseConfigItem & {
  type: 'description'
  text: string
}

export type NotImplementedSetting = BaseConfigItem & {
  type: 'not-implemented'
  default: any
}

export type Setting =
  | TextSetting
  | SelectSetting
  | MultiSelectSetting
  | BooleanSetting
  | NumberSetting
  | NotImplementedSetting

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

export type NestableSetting = SettingGroup | SettingPage | ListSetting

export type ConfigItem = Setting | DescriptionBlock | NestableSetting

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

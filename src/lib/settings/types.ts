// TODO: settings type
export type VisibilityCallback = (ctx: Record<string, unknown>) => boolean

type BaseConfigItem = {
  id: string
  label?: string
  visible?: VisibilityCallback
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
  options: string[]
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
}

export type Setting =
  | TextSetting
  | SelectSetting
  | MultiSelectSetting
  | BooleanSetting
  | NumberSetting
  | NotImplementedSetting

//

export type SettingGroup = BaseConfigItem & {
  type: 'group'
  children: ConfigItem[]
}
export type SettingPage = BaseConfigItem & {
  type: 'page'
  children: ConfigItem[]
}

export type ConfigItem = Setting | DescriptionBlock | SettingGroup | SettingPage

//

export type ConfigType<T extends readonly ConfigItem[]> = {
  [K in T[number] as K['id']]: K extends { type: 'group' | 'page'; children: infer C }
    ? ConfigType<C & readonly ConfigItem[]>
    : K extends { default: infer D }
      ? D
      : never
}

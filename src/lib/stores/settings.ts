import { settingsConfig } from '$lib/config/settings'
import { useSettings, type SettingsFromBlueprint } from '$lib/settings'

export const settings = useSettings(settingsConfig)
export type Settings = SettingsFromBlueprint<typeof settingsConfig>

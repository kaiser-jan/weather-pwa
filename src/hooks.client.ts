import { performMigrations } from '$lib/settings/migrate'
import { SETTINGS_MIGRATIONS } from '$lib/config/settings-migrations'

performMigrations({ migrations: SETTINGS_MIGRATIONS })

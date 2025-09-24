import { performMigrations } from 'svelte-settings'
import { SETTINGS_MIGRATIONS } from '$lib/config/settings-migrations'

performMigrations({ migrations: SETTINGS_MIGRATIONS })

import { SETTINGS_MIGRATIONS } from '$lib/config/settings-migrations'

export function performMigrations() {
  console.debug('Checking for settings migrations...')

  let settings = JSON.parse(localStorage.getItem('settings') ?? '{}')
  let version = settings.configVersion
  if (typeof version !== 'number') version = 0
  const initialVersion = version

  const requiredMigrationSteps = SETTINGS_MIGRATIONS.slice(version + 1)
  if (!requiredMigrationSteps.length) {
    console.debug(`No settings migration required from version ${version}!`)
    return
  }

  console.debug(settings)

  for (const migrationStep of requiredMigrationSteps) {
    console.debug(`Performing migrations from version ${version}, ${migrationStep.length} tasks...`)
    for (const migration of migrationStep) {
      console.debug(migration.description)
      settings = migration.callback(settings)
    }

    version += 1
  }

  console.debug('Writing migrated settings to localStorage...')
  settings.configVersion = version
  localStorage.setItem('settings', JSON.stringify(settings))

  console.info(`Successfully migrated settings from ${initialVersion} to ${version}!`)
  // NOTE: reload is not required when the migration is performed in a hook
  // window.location.reload()
}

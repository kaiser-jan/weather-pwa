const registeredLocalStorageKeys = new Set<string>()
export function registerLocalStorage(key: string) {
  registeredLocalStorageKeys.add(key)
}

export function clearCache() {
  for (const key of registeredLocalStorageKeys) {
    localStorage.removeItem(key)
  }
}

export function resetApp() {
  localStorage.clear()
  sessionStorage.clear()
  indexedDB.databases?.().then((dbs) => {
    dbs?.forEach((db) => indexedDB.deleteDatabase(db.name!))
  })

  location.reload()
}

export function getDeep(obj: any, path: string[]): unknown {
  return path.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj)
}

export function setDeep(obj: any, path: string[], value: unknown): void {
  let part = obj
  // select the part containing the key
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    part = part[key] ??= {}
  }
  part[path.at(-1)!] = value
}

export function deleteDeep(obj: any, path: string[]): void {
  let part = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    part = part[key] ??= {}
  }
  delete part[path.at(-1)!]
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * https://stackoverflow.com/a/34749873
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any[]) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

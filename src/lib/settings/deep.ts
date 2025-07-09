export function getDeep(obj: any, path: string[]): unknown {
  console.log(obj)
  console.log(path)
  return path.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj)
}

export function setDeep(obj: any, path: string[], value: unknown): void {
  let o = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    o = o[key] ??= {}
  }
  o[path.at(-1)!] = value
}

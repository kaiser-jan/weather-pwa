import type { ConfigItem } from './types'

export function extractDefaults(items: ConfigItem[]): Record<string, unknown> {
  const result: any = {}

  function assign(path: string[], value: unknown) {
    let obj = result
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      obj = obj[key] ??= {}
    }
    obj[path.at(-1)!] = value
  }

  function walk(config: ConfigItem[], path: string[] = []) {
    for (const item of config) {
      if ('visible' in item && item.visible) continue
      if ('children' in item) {
        walk(item.children, [...path, item.id])
      } else if ('default' in item) {
        assign([...path, item.id], item.default)
      }
    }
  }

  walk(items)
  return result
}

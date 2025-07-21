import type { ConfigItem } from './types'

export function extractDefaults(items: ConfigItem[]): Record<string, unknown> {
  const result: Record<string, any> = {}

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
      if ('default' in item) {
        assign([...path, item.id], item.default)
      }
      if ('children' in item) {
        walk(
          // @ts-expect-error defaults not existing doesn't matter
          item.children,
          [...path, item.id],
        )
      }
    }
  }

  walk(items)
  return result
}

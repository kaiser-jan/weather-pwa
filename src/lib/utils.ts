import { page } from '$app/state'
import clsx, { type ClassValue } from 'clsx'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import { twMerge } from 'tailwind-merge'

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getComponentName(name: string): string {
  // convert kebab-case to title case
  return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }

export function calculateVector(
  u: number | undefined,
  v: number | undefined,
): { value: number | undefined; angleDeg: number | undefined } {
  if (u === undefined || v === undefined) return { value: undefined, angleDeg: undefined }
  const value = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))
  const angle = Math.atan2(v, u) * (180 / Math.PI)
  const normalizedAngle = (angle + 360) % 360
  const compassDirection = (normalizedAngle + 180) % 360

  return {
    value,
    angleDeg: compassDirection,
  }
}

type FlyAndScaleParams = {
  y?: number
  x?: number
  start?: number
  duration?: number
}

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 },
): TransitionConfig => {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB

    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB

    return valueB
  }

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + key + ':' + style[key] + ';'
    }, '')
  }

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

      return styleToString({
        transform: transform + 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')',
        opacity: t,
      })
    },
    easing: cubicOut,
  }
}

export function toggle<T extends string>(array: T[], value: T) {
  const index = array.indexOf(value)
  if (index === -1) array.push(value)
  else array.splice(index, 1)
  return array
}

export function sortByReferenceOrder<T extends string>(items: T[], reference: readonly T[]): T[] {
  return items.slice().sort((a, b) => reference.indexOf(a) - reference.indexOf(b))
}

export function debounce<F extends (...args: any[]) => void>(callback: F, wait: number, immediate = false): F {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    const shouldCallNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      if (!shouldCallNow) {
        callback(...args)
      }
    }, wait)

    if (shouldCallNow) {
      callback(...args)
    }
  }

  return debounced as F
}

export function throttle<F extends (...args: any[]) => void>(callback: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  let lastTime: number = 0

  const throttled = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    const delay = Math.max(wait - (Date.now() - lastTime), 0)
    timeout = setTimeout(() => {
      if (Date.now() - lastTime >= wait) {
        callback(...args)
        lastTime = Date.now()
      }
    }, delay)
  }

  return throttled
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function createUUID() {
  // NOTE: crypto.randomUUID is not available over http
  return crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now()
}

export function popUntil(condition: (state: App.PageState) => boolean) {
  const handler = () => {
    if (!page.state || condition(page.state)) {
      window.removeEventListener('popstate', handler)
    } else {
      history.back()
    }
  }
  window.addEventListener('popstate', handler)
  history.back()
}

// TODO: what about timezones?
const offset = new Date().getTimezoneOffset() * 60_000
const MS_PER_DAY = 86_400_000
export function getStartOfDayTimestamp(timestamp: number) {
  const start = Math.floor((timestamp - offset) / MS_PER_DAY) * MS_PER_DAY + offset
  return start
}
export function getEndOfDayTimestamp(timestamp: number) {
  const end = getStartOfDayTimestamp(timestamp - offset) + MS_PER_DAY
  return end
}

export function mapRecord<KeyT extends string, ItemT, TargetT>(
  input: Partial<Record<KeyT, ItemT[]>>,
  fn: (arr: ItemT[]) => TargetT,
): Record<KeyT, TargetT> {
  const result = {} as Record<KeyT, TargetT>
  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      result[key as KeyT] = fn(input[key]!)
    }
  }
  return result
}

export function sum(numbers: (number | undefined)[]): number {
  return numbers
    .filter((num): num is number => num !== undefined)
    .reduce((accumulator, current) => accumulator + current, 0)
}

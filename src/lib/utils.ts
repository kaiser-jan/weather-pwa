import clsx, { type ClassValue } from 'clsx'
import { DateTime } from 'luxon'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import { twMerge } from 'tailwind-merge'

export type IgnoredInput = boolean | number | null | any[] | Record<never, any> | undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDatetime(datetime: DateTime, options?: { omitDate?: boolean }) {
  const today = DateTime.now().startOf('day')
  const inputDate = datetime.startOf('day')

  if (inputDate.equals(today) || options?.omitDate) {
    return datetime.toFormat('HH:mm')
    // NOTE: this requires translation
    // } else if (inputDate.equals(today.plus({ days: 1 }))) {
    //   return `Tomorrow, ${datetime.toFormat('HH:mm')}`
  } else {
    return datetime.toFormat('ccc HH:mm')
  }
}

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

export function capitalizeFirstChar(word: string | undefined) {
  if (word === undefined || word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function toggle(array: string[], value: string): void {
  const index = array.indexOf(value)
  if (index === -1) array.push(value)
  else array.splice(index, 1)
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

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

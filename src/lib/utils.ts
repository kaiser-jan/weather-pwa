import clsx, { type ClassValue } from 'clsx'
import { DateTime } from 'luxon'
import { twMerge } from 'tailwind-merge'

export type IgnoredInput = boolean | number | null | any[] | Record<never, any> | undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDatetime(datetime: DateTime) {
  const today = DateTime.now().startOf('day')
  const inputDate = datetime.startOf('day')

  if (inputDate.equals(today)) {
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

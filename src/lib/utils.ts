import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type IgnoredInput = boolean | number | null | any[] | Record<never, any> | undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDatetime(datetimeISO: string) {
  const datetime = DateTime.fromISO(datetimeISO)

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

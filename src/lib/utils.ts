import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type IgnoredInput = boolean | number | null | any[] | Record<never, any> | undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

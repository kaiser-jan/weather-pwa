import type { TimeBucket } from '$lib/types/data'
import { writable } from 'svelte/store'

export const selectedDay = writable<TimeBucket | null>(null)

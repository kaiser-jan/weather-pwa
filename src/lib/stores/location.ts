import type { Coordinates } from '$lib/types/data'
import { writable } from 'svelte/store'

export const coordinates = writable<Coordinates>()

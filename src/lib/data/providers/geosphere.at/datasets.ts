import type { Dataset } from '$lib/types/data/providers'

import inca from './datasets/inca'
import nowcast from './datasets/nowcast'
import nwp from './datasets/nwp'
import nwpOffset from './datasets/nwp-offset'

export const datasets = [nowcast, nwp, nwpOffset, inca] as const satisfies Dataset[]

export type DatasetId = (typeof datasets)[number]['id']

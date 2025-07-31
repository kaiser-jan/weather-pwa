import type { Dataset } from '$lib/types/data/providers'
import chem9km from './datasets/chem-9km'
import chem3km from './datasets/chem-3km'
import inca from './datasets/inca'
import nowcast from './datasets/nowcast'
import nwp from './datasets/nwp'
import nwpOffset from './datasets/nwp-offset'

export const datasets = [nowcast, nwp, nwpOffset, inca, chem3km, chem9km] as const satisfies Dataset[]

export type DatasetId = (typeof datasets)[number]['id']

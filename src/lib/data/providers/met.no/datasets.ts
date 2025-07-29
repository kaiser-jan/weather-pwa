import type { Dataset } from '$lib/types/data/providers'

import aromeArctic from './datasets/arome-arctic'
import ecmwf from './datasets/ecmwf'
import meps from './datasets/meps'

export const datasets = [aromeArctic, ecmwf, meps] as const satisfies Dataset[]

export type DatasetId = (typeof datasets)[number]['id']

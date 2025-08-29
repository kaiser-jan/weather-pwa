import type { Dataset } from '$lib/types/data/providers'

// import aromeFranceHd15Min from './datasets/arome-france-hd-15min'
import aromeFranceHd from './datasets/arome-france-hd'
import aromeFrance from './datasets/arome-france'
import arpegeEurope from './datasets/arpege-europe'
import arpegeWorld from './datasets/arpege-world'

export const datasets = [
  // aromeFranceHd15Min,
  aromeFranceHd,
  aromeFrance,
  arpegeEurope,
  arpegeWorld,
] as const satisfies Dataset[]

export type DatasetId = (typeof datasets)[number]['id']

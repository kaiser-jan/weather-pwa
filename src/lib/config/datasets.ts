import type { DatasetId } from '$lib/data/providers'

function checkArrayUniqueness<const T extends readonly string[]>(
  arr: T & (T[number] extends T[number] ? unknown : never),
): T {
  const set = new Set(arr)
  if (set.size !== arr.length) throw new Error('Duplicate entries in DATASET_IDS_BY_PRIORITY!')
  return arr
}

export const DATASET_IDS_BY_PRIORITY = [
  'geosphere.at_nowcast-v1-15min-1km',
  // 'meteofrance.fr_arome-france-hd-15min',
  'geosphere.at_inca-v1-1h-1km',
  'meteofrance.fr_arome-france-hd',
  'meteofrance.fr_arome-france',
  'geosphere.at_nwp-v1-1h-2500m',
  'geosphere.at_nwp-v1-1h-2500m_offset',
  'met.no_meps',
  'met.no_arome-arctic',
  'meteofrance.fr_arpege-europe',
  'met.no_ecmwf',
  'geosphere.at_chem-v2-1h-3km',
  'geosphere.at_chem-v2-1h-9km',
  'meteofrance.fr_arpege-world',
] as const satisfies DatasetId[]

checkArrayUniqueness(DATASET_IDS_BY_PRIORITY)

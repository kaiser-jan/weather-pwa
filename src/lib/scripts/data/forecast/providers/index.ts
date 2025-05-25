import { useDataProviderGeosphereAT } from '$lib/scripts/data/forecast/providers/geosphere.at'
import { useDataProviderMetNO } from '$lib/scripts/data/forecast/providers/met.no'

export const providers = {
  'geosphere.at': useDataProviderGeosphereAT(),
  'met.no': useDataProviderMetNO(),
} as const

export type ProviderId = keyof typeof providers

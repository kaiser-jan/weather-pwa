import { useDataProviderGeosphereAT } from '$lib/data/providers/geosphere.at'
import { useDataProviderMetNO } from '$lib/data/providers/met.no'

export const providers = {
  'geosphere.at': useDataProviderGeosphereAT(),
  'met.no': useDataProviderMetNO(),
} as const

export type ProviderId = keyof typeof providers

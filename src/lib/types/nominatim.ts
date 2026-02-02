export interface Address {
  leisure?: string
  house_number?: string
  neighbourhood?: string
  road?: string
  hamlet?: string
  suburb?: string
  village?: string
  town?: string
  city?: string
  county?: string
  state_district: string
  state: string
  postcode: string
  country: string
  country_code: string
}

export interface PlaceOutput {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: [string, string, string, string]
  lat: string
  lon: string
  display_name: string
  class?: string
  category?: string
  type: string
  importance: number
  place_rank: number

  addresstype: string
  name: string
  address?: Address
}

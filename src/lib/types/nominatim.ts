interface Address {
  leisure?: string
  house_number?: string
  neighbourhood?: string
  road?: string
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
  place_id: string
  licence: string
  osm_type: string
  osm_id: string
  lat: string
  lon: string
  place_rank: string
  category: string
  type: string
  importance: string
  addresstype: string
  display_name: string
  name: string
  address: Address
  boundingbox: string[]
}

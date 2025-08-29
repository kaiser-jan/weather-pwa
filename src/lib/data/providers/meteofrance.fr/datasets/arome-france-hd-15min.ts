import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

// NOTE: according to this github issue, open-meteo uses AROME PI for 15min forecasts
// however, this model is not selectable, only via 'best_match' or 'meteofrance_seamless'
// https://github.com/open-meteo/open-meteo/issues/794
// export default {
//   id: 'meteofrance.fr_arome-france-hd-15min',
//   internalId: 'arome_france_hd',
//   model: 'AROME France HD 15min',
//   name: 'Nowcast',
//   url: '',
//   parameters: ['temperature'],
//   baseForecastAge: null,
//   temporalResolution: Duration.fromObject({ minutes: 15 }),
//   updateFrequency: Duration.fromObject({ hours: 1 }),
//   timespan: Duration.fromObject({ hours: 6 }),
//   spatialResolution: 1500,
//   coverageArea: {
//     type: 'Feature',
//     geometry: {
//       type: 'Polygon',
//       // TODO:
//       coordinates: [
//         [
//           [-5.0, 41.0],
//           [10.0, 41.0],
//           [10.0, 51.0],
//           [-5.0, 51.0],
//           [-5.0, 41.0],
//         ],
//       ],
//     },
//     properties: {},
//   },
// } as const satisfies Dataset

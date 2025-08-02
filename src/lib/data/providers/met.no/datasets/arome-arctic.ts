import type { Dataset } from '$lib/types/data/providers'
import { Duration } from 'luxon'

export default {
  id: 'met.no_arome-arctic',
  model: 'AROME-Arctic',
  name: 'Arctic region',
  url: 'https://www.met.no/en/projects/The-weather-model-AROME-Arctic',
  parameters: [],
  baseForecastAge: null,
  temporalResolution: Duration.fromObject({ hours: 1 }),
  updateFrequency: Duration.fromObject({ hours: 6 }), // TODO: check, it only mentions updating 4 times pr day
  timespan: Duration.fromObject({ days: 10 }),
  spatialResolution: 18000,
  // TODO: this is an estimation only
  // ncdump -h "https://thredds.met.no/thredds/dodsC/aromearcticlatest/latest/arome_arctic_lagged_6_h_latest_2_5km_latest.nc"
  coverageArea: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-17.956718, 69.298502],
          [-7.418747, 68.488306],
          [2.279488, 67.008703],
          [6.759963, 66.025908],
          [10.949539, 64.893138],
          [14.911506, 63.593782],
          [18.621878, 62.133696],
          [23.287908, 64.249203],
          [28.413026, 66.079518],
          [34.043607, 67.636239],
          [40.116961, 68.90392],
          [46.761388, 69.905925],
          [53.866221, 70.616271],
          [61.252736, 71.018491],
          [68.83172, 71.108465],
          [69.305761, 75.366555],
          [69.913295, 78.668229],
          [70.692191, 81.224956],
          [71.697315, 83.21323],
          [72.984659, 84.745882],
          [74.648285, 85.936428],
          [76.784019, 86.8536],
          [79.552032, 87.565231],
          [52.660084, 87.543753],
          [29.903378, 87.028238],
          [13.820345, 86.081049],
          [7.51178, 85.407396],
          [2.287735, 84.591905],
          [-1.96148, 83.638537],
          [-5.51026, 82.509361],
          [-8.551072, 81.141476],
          [-11.113008, 79.513102],
          [-13.270283, 77.581634],
          [-15.096692, 75.283253],
          [-16.641025, 72.556136],
          [-17.956718, 69.298502],
        ],
      ],
    },
  },
} as const satisfies Dataset

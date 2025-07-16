/**
 * Based on [A Practical Analytical Model for Daylight](https://tommyhinks.com/wp-content/uploads/2012/02/1999_a_practical_analytic_model_for_daylight.pdf)
 *
 * Implementation based on:
 * https://github.com/elonen/js-sky-sim
 * https://nicoschertler.wordpress.com/2013/04/03/simulating-a-days-sky/
 */

export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

function gammaCorrect(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

/*
 * http://brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 * https://github.com/PhilipsHue/PhilipsHueSDK-iOS-OSX/blob/00187a3db88dedd640f5ddfa8a474458dff4e1db/ApplicationDesignNotes/RGB%20to%20xy%20Color%20conversion.md
 */
function xyYToRGB(x: number, y: number, Y: number) {
  // convert xyY to XYZ
  const X = (Y / y) * x
  const Z = (Y / y) * (1 - x - y)

  // convert XYZ to sRGB under D65 white point
  return {
    r: gammaCorrect(3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z),
    g: gammaCorrect(-0.969266 * X + 1.8760108 * Y + 0.041556 * Z),
    b: gammaCorrect(0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z),
  }
}

type Matrix = number[][]
type BlockMatrix = Matrix[]

function multiplyBlockMatrix(blocks: BlockMatrix): Matrix {
  let result = blocks[0]
  for (let i = 1; i < blocks.length; i++) {
    result = multiplyMatrices(result, blocks[i])
  }
  return result
}

function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  const aRows = a.length
  const aCols = a[0].length
  const bCols = b[0].length
  const result: Matrix = Array.from({ length: aRows }, () => Array(bCols).fill(0))

  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }

  return result
}

// prettier-ignore
const ZENITH_X_COEFFICIENTS = [
  [+0.00166, -0.00375, +0.00209, +0      ],
  [-0.02903, +0.06377, -0.03202, +0.00394],
  [+0.11693, -0.21196, +0.06052, +0.25886],
]
// prettier-ignore
const ZENITH_Y_COEFFICIENTS = [
  [+0.00275, -0.0061 , +0.00317, +0      ],
  [-0.04214, +0.0897 , -0.04153, +0.00516],
  [+0.15346, -0.26756, +0.0667 , +0.26688],
]
// prettier-ignore
const DISTRIBUTION_COEFFICIENTS_LUMINANCE = [
   [ 0.1787, -1.4630],
   [-0.3554,  0.4275],
   [-0.0227,  5.3251],
   [ 0.1206, -2.5771],
   [-0.0670,  0.3703]
]
// prettier-ignore
const DISTRIBUTION_COEFFICIENTS_X = [
   [-0.0193, -0.2592],
   [-0.0665,  0.0008],
   [-0.0004,  0.2125],
   [-0.0641, -0.8989],
   [-0.0033,  0.0452]
]
// prettier-ignore
const DISTRIBUTION_COEFFICIENTS_Y = [
   [-0.0167, -0.2608],
   [-0.0950,  0.0092],
   [-0.0079,  0.2102],
   [-0.0441, -1.6537],
   [-0.0109,  0.0529]
]

type ZenitialValues = { Y: number; x: number; y: number }
export function calculateZenitalValues(turbidity: number, solarZenith: number): ZenitialValues {
  const chi = (4 / 9 - turbidity / 120) * (Math.PI - 2 * solarZenith)
  /* Absolute value of zenith luminance in Kcd/m² */
  const Yz = (4.0453 * turbidity - 4.971) * Math.tan(chi) - 0.2155 * turbidity + 2.4192

  const matrixTurbidity = [
    [turbidity ** 2, turbidity ** 1, turbidity ** 0], //
  ]
  const matrixZenith = [
    [solarZenith ** 3], //
    [solarZenith ** 2],
    [solarZenith ** 1],
    [solarZenith ** 0],
  ]

  const zenithX = multiplyBlockMatrix([matrixTurbidity, ZENITH_X_COEFFICIENTS, matrixZenith])
  const zenithY = multiplyBlockMatrix([matrixTurbidity, ZENITH_Y_COEFFICIENTS, matrixZenith])

  // NOTE: normalization using the value when the sun is at zenith
  // Y0=~40; overriding it lets us control the exposure
  // const Y0 = (4.0453 * turbidity - 4.971) * Math.tan((4.0 / 9 - turbidity / 120) * Math.PI) - 0.2155 * turbidity + 2.4192
  const Y0 = 40

  return {
    Y: Yz / Y0,
    x: zenithX[0][0],
    y: zenithY[0][0],
  }
}

type Coefficients = [number, number, number, number, number]

type CoefficientsList = { Y: Coefficients; x: Coefficients; y: Coefficients }

export function calculateSkylightDistributionCoefficients(turbidity: number): CoefficientsList {
  // prettier-ignore
  const matrixTurbidity = [
    [turbidity],
    [1]
  ]

  return {
    Y: multiplyMatrices(DISTRIBUTION_COEFFICIENTS_LUMINANCE, matrixTurbidity).map((r) => r[0]) as Coefficients,
    x: multiplyMatrices(DISTRIBUTION_COEFFICIENTS_X, matrixTurbidity).map((r) => r[0]) as Coefficients,
    y: multiplyMatrices(DISTRIBUTION_COEFFICIENTS_Y, matrixTurbidity).map((r) => r[0]) as Coefficients,
  }
}

/* https://www.academia.edu/8187550/All_weather_model_for_sky_luminance_distribution_preliminary_configuration_and_validation */
function perezAllWeatherSkyModel(zenith: number, gamma: number, coefficients: Coefficients) {
  const [A, B, C, D, E] = coefficients
  return (1 + A * Math.exp(B / Math.cos(zenith))) * (1 + C * Math.exp(D * gamma) + E * Math.cos(gamma) ** 2)
}

function Gamma(zenith: number, azimuth: number, solarZenith: number, solarAzimuth: number) {
  // NOTE: There is a variation of this formula which uses the elevation angle
  // as azimuth is complementary to elevation (azimuth = 90°-elevation),
  // sin(azimuth) becomes cos(azimuth) and the other way around
  // which results in the form sin*sin + cos*cos*cos
  // perez: "γ is the angle between this sky element and the position of the sun"
  return Math.acos(
    Math.sin(solarZenith) * Math.sin(zenith) * Math.cos(solarAzimuth - azimuth) +
      Math.cos(solarZenith) * Math.cos(zenith),
  )
}

export function calculateSkyColorFor(
  zenith: number,
  azimuth: number,
  solarZenith: number,
  solarAzimuth: number,
  zenitialValues: ZenitialValues,
  coefficients: CoefficientsList,
) {
  const gamma = Gamma(zenith, azimuth, solarZenith, solarAzimuth)
  zenith = Math.min(zenith, Math.PI / 2)

  function calculateValue(value: 'Y' | 'x' | 'y') {
    const atPoint = perezAllWeatherSkyModel(zenith, gamma, coefficients[value])
    const atZenith = perezAllWeatherSkyModel(0.0, solarZenith, coefficients[value])
    return (zenitialValues[value] * atPoint) / atZenith
  }

  const Y = calculateValue('Y')
  const x = calculateValue('x')
  const y = calculateValue('y')

  return xyYToRGB(x, y, Y)
}

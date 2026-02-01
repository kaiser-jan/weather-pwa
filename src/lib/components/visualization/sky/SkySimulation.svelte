<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import SunCalc from 'suncalc'
  import { DateTime } from 'luxon'
  import {
    calculateSkylightDistributionCoefficients,
    calculateSkyColorFor,
    calculateZenitalValues,
    deg2rad,
  } from '$lib/utils/sky-simulation'
  import type { Coordinates } from '$lib/types/data'
  import { debounce } from '$lib/utils/common'

  interface Props {
    class: string
    coordinates: Coordinates | null
    turbidity: number
    datetime: DateTime
  }

  let { class: className, coordinates, turbidity, datetime }: Props = $props()

  let canvas: HTMLCanvasElement

  let resolutionX = 0
  let resolutionY = 0

  // TODO: the canvas aspect ratio together with the FOV needs to keep an aspect ratio similar to the original one to avoid distortion
  const fovX = 200
  const fovXOffset = -fovX / 2
  const fovY = 80
  const fovYOffset = 90 - fovY

  // TODO: night
  function drawNight(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, opacity = 1) {
    ctx.fillStyle = `oklch(15% 0.05 263 / ${opacity})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // TODO: consider using a glsl shader (which renders only on request) for performance
  function updateCanvas() {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    resolutionX = Math.ceil(canvas.clientWidth / 4)
    resolutionY = Math.ceil(canvas.clientHeight / 4)

    console.debug(`Rerendering sky simulation with ${resolutionX}x${resolutionY}`)

    const sun = SunCalc.getPosition(datetime.toJSDate(), coordinates?.latitude ?? 0, coordinates?.longitude ?? 0)
    const solarZenith = Math.PI / 2 - sun.altitude
    const solarAzimuth = sun.azimuth

    const AZIMUTH_NIGHT_START = 1.35
    const AZIMUTH_NIGHT_END = 1.65

    if (Math.abs(sun.azimuth) > AZIMUTH_NIGHT_END) {
      drawNight(ctx, canvas)
      return
    }

    const zenitialValues = calculateZenitalValues(turbidity, solarZenith)
    const coefficients = calculateSkylightDistributionCoefficients(turbidity)

    const width = canvas.width
    const height = canvas.height

    // oversize the tiles to avoid gaps
    const tileW = Math.ceil(width / resolutionX + 1)
    const tileH = Math.ceil(height / resolutionY + 1)

    for (let row = 0; row < 1; row += 1 / resolutionY) {
      for (let col = 0; col < 1; col += 1 / resolutionX) {
        const azimuth = deg2rad(col * fovX + fovXOffset)
        const zenith = deg2rad(row * fovY + fovYOffset)

        const rgb = calculateSkyColorFor(zenith, azimuth, solarZenith, solarAzimuth, zenitialValues, coefficients)
        ctx.fillStyle = `rgb(${Math.floor(rgb.r * 255)},${Math.floor(rgb.g * 255)},${Math.floor(rgb.b * 255)})`

        const x = col * width
        const y = row * height
        ctx.fillRect(x, y, tileW, tileH)
      }
    }

    if (Math.abs(sun.azimuth) > AZIMUTH_NIGHT_START) {
      drawNight(ctx, canvas, (Math.abs(sun.azimuth) - AZIMUTH_NIGHT_START) / (AZIMUTH_NIGHT_END - AZIMUTH_NIGHT_START))
    }
  }

  const debouncedResize = debounce(updateCanvas, 50)

  onMount(async () => {
    await tick()
    window.addEventListener('resize', debouncedResize)
  })

  onDestroy(() => {
    window.removeEventListener('resize', debouncedResize)
  })

  $effect(() => {
    if (datetime && coordinates) updateCanvas()
  })
</script>

<div class={className}>
  <div class="relative h-full w-full">
    <canvas bind:this={canvas} class="absolute -inset-1 h-[105%] w-[105%] blur-[2px]"></canvas>
  </div>
</div>

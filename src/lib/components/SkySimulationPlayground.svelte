<script lang="ts">
  import { DateTime } from 'luxon'
  import { onMount, onDestroy } from 'svelte'
  import SkySimulation from './SkySimulation.svelte'
  import type { Coordinates } from '$lib/types/data'

  interface Props {
    class?: string
  }

  let { class: className }: Props = $props()

  const coordinates: Coordinates = {
    latitude: 60.192059,
    longitude: 24.945831,
  }
  const turbidity = 4

  let interval: ReturnType<typeof setInterval>
  let datetime = $state(DateTime.now())

  onMount(() => {
    interval = setInterval(() => {
      datetime = datetime.plus({ minutes: 30 })
    }, 500)
  })

  onDestroy(() => {
    clearInterval(interval)
  })
</script>

<SkySimulation {coordinates} {turbidity} {datetime} class={className ?? ''} />

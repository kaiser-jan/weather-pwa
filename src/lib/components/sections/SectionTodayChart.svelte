<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { NOW } from '$lib/stores/now'
  import type { DateTime } from 'luxon'
  import WeatherChartWithTools from '../weather/WeatherChartWithTools.svelte'
  import type { TimeBucket } from '$lib/types/data'
  import { selectedDay } from '$lib/stores/selectedDay'

  interface Props {}

  let {}: Props = $props()

  const today = $derived($forecastStore?.daily.find((d) => d.datetime.equals($NOW.startOf('day'))))
</script>

<button
  class="bg-midground flex w-full flex-col flex-wrap justify-between gap-2 gap-x-4 gap-y-2 rounded-lg p-2"
  onclick={() => selectedDay.set(today)}
>
  <WeatherChartWithTools day={today} isToday />
</button>

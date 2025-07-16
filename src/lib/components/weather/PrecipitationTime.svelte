<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { settings } from '$lib/settings/store'
  import { formatRelativeDatetime } from '$lib/utils'
  import { ArrowRightIcon, UmbrellaIcon } from '@lucide/svelte'
  import { DateTime } from 'luxon'

  interface Props {
    datetime: DateTime
  }

  let { datetime: NOW }: Props = $props()

  const precipitationStartDatetime = $derived.by(() => {
    const precipitation_amount = $forecastStore?.multiseries?.precipitation_amount
    if (!precipitation_amount) return undefined

    // the first time period with precipitation from now on
    const timePeriodWithPrecipitation = precipitation_amount.find((tp, index) => {
      if (tp.value === undefined) return false
      // also allow the current timebucket -> it is already raining
      const isCurrentTimeBucket = precipitation_amount[index + 1].datetime > NOW
      if (tp.datetime < NOW && !isCurrentTimeBucket) return false
      return tp.value > $settings.data.forecast.precipitation.threshold
    })

    return timePeriodWithPrecipitation?.datetime
  })

  const precipitationEndDatetime = $derived.by(() => {
    if (!$forecastStore?.multiseries?.precipitation_amount || !precipitationStartDatetime) return undefined

    // the first time period without precipitation after the precipitationStartDatetime
    const timePeriodWithoutPrecipitation = $forecastStore.multiseries.precipitation_amount.find((tp) => {
      if (tp.value === undefined || tp.datetime < precipitationStartDatetime) return false
      return tp.value <= $settings.data.forecast.precipitation.threshold
    })

    return timePeriodWithoutPrecipitation?.datetime
  })
</script>

{#if precipitationStartDatetime}
  <span class="inline-flex items-center gap-2">
    <UmbrellaIcon />
    {#if precipitationStartDatetime > NOW}
      {formatRelativeDatetime(precipitationStartDatetime)}
    {:else if precipitationEndDatetime}
      <span class="inline-flex flex-row items-center">
        <ArrowRightIcon class="text-text-muted" />
        {formatRelativeDatetime(precipitationEndDatetime)}
      </span>
    {/if}
  </span>
{/if}

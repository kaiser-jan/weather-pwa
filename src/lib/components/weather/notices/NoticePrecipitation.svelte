<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { settings } from '$lib/settings/store'
  import { formatRelativeDatetime } from '$lib/utils'
  import { ArrowRightIcon, UmbrellaIcon } from '@lucide/svelte'
  import { DateTime } from 'luxon'
  import { NOW } from '$lib/stores/now'

  interface Props {}

  let {}: Props = $props()

  const precipitationGroups = $derived.by(() => {
    const precipitation_amount = $forecastStore?.multiseries?.precipitation_amount
    if (!precipitation_amount) return []

    const groups: { start: DateTime; end: DateTime; amount: number }[] = []
    let isInGroup = false
    const relevantEndDatetime = $NOW.hour <= 12 ? $NOW.endOf('day') : $NOW.endOf('day').plus({ hours: 6 })

    for (const timeBucket of precipitation_amount) {
      if (timeBucket.datetime > relevantEndDatetime && !isInGroup) break

      if (timeBucket.value < $settings.data.forecast.precipitation.threshold || timeBucket.value === 0) {
        if (!isInGroup) continue
        groups[groups.length - 1].end = timeBucket.datetime
        isInGroup = false
        continue
      }

      if (!isInGroup) {
        groups.push({ start: timeBucket.datetime, amount: 0 } as any)
        isInGroup = true
      }

      groups[groups.length - 1].amount += timeBucket.value
    }

    return groups.filter((g) => g.end > $NOW)
  })
</script>

{#if precipitationGroups.length > 0}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaIcon />
    <div class="flex grow flex-col gap-1">
      {#each precipitationGroups as precipitationGroup}
        <div class="flex flex-row items-center gap-2">
          {formatRelativeDatetime(precipitationGroup.start, { omitDate: true })}
          <ArrowRightIcon class="text-text-muted" />
          {formatRelativeDatetime(precipitationGroup.end, { omitDate: true })}
          <!-- TODO: color based on intensity -->
          <span class="ml-auto text-blue-200">{precipitationGroup.amount.toFixed(1)}mm</span>
          <!-- TODO: consider mini chart -->
        </div>
      {/each}
    </div>
  </div>
{/if}

<script lang="ts">
  import { forecastStore } from '$lib/stores/data'
  import { settings } from '$lib/settings/store'
  import { formatRelativeDatetime } from '$lib/utils'
  import { ArrowRightIcon, UmbrellaIcon } from '@lucide/svelte'
  import { DateTime, Duration } from 'luxon'
  import { NOW } from '$lib/stores/now'

  interface Props {}

  let {}: Props = $props()

  const precipitationGroups = $derived.by(() => {
    const precipitation_amount = $forecastStore?.multiseries?.precipitation_amount
    if (!precipitation_amount) return []

    const groups: { start: DateTime; end: DateTime; amount: number; sporadic?: boolean }[] = []
    let isInGroup = false
    const relevantEndDatetime = $NOW.hour <= 12 ? $NOW.endOf('day') : $NOW.endOf('day').plus({ hours: 6 })

    for (const timeBucket of precipitation_amount) {
      if (timeBucket.datetime > relevantEndDatetime && !isInGroup) break

      const previousGroup = groups[groups.length - 1]

      if (timeBucket.value < $settings.data.forecast.precipitation.threshold || timeBucket.value === 0) {
        if (!isInGroup) continue
        previousGroup.end = timeBucket.datetime
        isInGroup = false
        continue
      }

      if (!isInGroup) {
        isInGroup = true
        const threshold = Duration.fromDurationLike($settings.data.forecast.precipitation.groupInterval)
        const isSporadic = previousGroup && timeBucket.datetime.diff(previousGroup.end) < threshold

        if (isSporadic) {
          // continue this group
          previousGroup.sporadic = true
        } else {
          // start a new group
          groups.push({ start: timeBucket.datetime, amount: 0 } as any)
        }
      }

      // ensure precipitation from the past is omitted
      const currentGroup = groups[groups.length - 1]
      if (timeBucket.datetime < NOW) {
        currentGroup.amount = timeBucket.value
      } else {
        currentGroup.amount += timeBucket.value
      }
    }

    return groups.filter((g) => g.end > $NOW)
  })
</script>

{#if precipitationGroups.length > 0}
  <div class="bg-midground inline-flex items-center gap-4 rounded-md border-l-6 border-blue-300 px-4 py-3">
    <UmbrellaIcon />
    <div class="flex grow flex-col gap-1">
      {#each precipitationGroups as precipitationGroup}
        <div class="flex flex-row items-center justify-between gap-2">
          <span class="inline-flex items-center gap-1">
            {#if precipitationGroup.start > $NOW}
              {formatRelativeDatetime(precipitationGroup.start, { omitDate: true })}
            {/if}
            <ArrowRightIcon class="text-text-muted" />
            {formatRelativeDatetime(precipitationGroup.end, { omitDate: true })}
          </span>
          {#if precipitationGroup.sporadic}
            <span class="text-text-muted text-sm italic">sporadic</span>
          {/if}
          <!-- TODO: color based on intensity -->
          <span class="text-blue-200">{precipitationGroup.amount.toFixed(1)}mm</span>
          <!-- TODO: consider mini chart -->
        </div>
      {/each}
    </div>
  </div>
{/if}

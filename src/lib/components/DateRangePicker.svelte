<script lang="ts">
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import { fromAbsolute } from '@internationalized/date'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Popover from '$lib/components/ui/popover'
  import { DateTime, Settings } from 'luxon'
  import type { ComponentProps } from 'svelte'
  import { RangeCalendar } from '$lib/components/ui/range-calendar'

  interface Props {
    start?: number
    end?: number
    class?: string
    change?: (value: DateTime | undefined) => void
    calendarProps?: Partial<ComponentProps<typeof RangeCalendar>>
  }

  let { start = $bindable(), end = $bindable(), class: className, change, calendarProps }: Props = $props()

  let open = $state(false)
</script>

{#snippet datePlaceholder(timestamp: number | undefined, placeholder: string)}
  {#if timestamp !== undefined}
    {DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATE_SHORT)}
  {:else}
    <div class="text-text-muted">
      {placeholder}
    </div>
  {/if}
{/snippet}

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" class={['justify-between gap-1 pl-3 text-left font-normal', className]}>
        <span class="flex items-center gap-2">
          <CalendarIcon class="mr-2 mb-0.5 h-4 w-4 text-text-muted" />
          {@render datePlaceholder(start, 'start')}
        </span>
        <span class="px-1 text-text-muted"> - </span>
        {@render datePlaceholder(end, 'end')}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0">
    <!-- TODO: close on select -->
    <!-- NOTE: this is currently glitching, as the onValueChange fires when opening the calendar -->
    <RangeCalendar
      {...calendarProps}
      onValueChange={(v) => {
        if (v.end) open = false
      }}
      bind:value={
        () => ({
          start: start ? fromAbsolute(start, Settings.defaultZone.name ?? 'UTC') : undefined,
          end: end ? fromAbsolute(end, Settings.defaultZone.name ?? 'UTC') : undefined,
        }),
        (v) => {
          start = v.start ? v.start.toDate().getTime() : undefined
          end = v.end ? v.end.toDate().getTime() : undefined
        }
      }
    />
  </Popover.Content>
</Popover.Root>

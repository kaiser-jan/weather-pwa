<script lang="ts">
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import { fromAbsolute } from '@internationalized/date'
  import { cn } from '$lib/utils.js'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Calendar } from '$lib/components/ui/calendar'
  import { Popover, PopoverTrigger, PopoverContent } from '$lib/components/ui/popover'
  import { DateTime } from 'luxon'
  import type { ComponentProps } from 'svelte'

  interface Props {
    value?: DateTime
    required?: boolean
    class?: string
    disabled?: boolean
    change?: (value: DateTime | undefined) => void
    calendarProps?: ComponentProps<typeof Calendar>
  }

  let { value = $bindable(), required = false, class: className, disabled, change, calendarProps }: Props = $props()

  let open = $state(false)
</script>

<Popover {open}>
  <PopoverTrigger
    class={buttonVariants({
      variant: 'outline',
      class: ['justify-start gap-1 pl-3 text-left font-normal', !value && 'text-text-muted', className],
    })}
    {disabled}
  >
    <CalendarIcon class="mr-2 mb-0.5 h-4 w-4" />
    {value ? value.toLocaleString(DateTime.DATE_FULL) : 'Select a date'}
  </PopoverTrigger>
  <PopoverContent class="w-auto p-0">
    <!-- TODO: close on select -->
    <!-- NOTE: this is currently glitching, as the onValueChange fires when opening the calendar -->
    <!-- onValueChange={() => open = false} -->
    <Calendar
      {...calendarProps}
      type="single"
      bind:value={
        () => (value ? fromAbsolute(value.toMillis(), value.zoneName ?? 'UTC') : undefined),
        (v) => {
          value = v ? DateTime.fromISO(v.toString()) : undefined
        }
      }
      initialFocus
      preventDeselect={required}
      onValueChange={(v) => change?.(v ? DateTime.fromISO(v.toString()) : undefined)}
    />
  </PopoverContent>
</Popover>

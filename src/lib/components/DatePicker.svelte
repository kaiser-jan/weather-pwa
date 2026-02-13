<script lang="ts">
  import * as Popover from '$lib/components/ui/popover'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import { fromAbsolute } from '@internationalized/date'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Calendar } from '$lib/components/ui/calendar'
  import { DateTime } from 'luxon'
  import type { ComponentProps } from 'svelte'

  interface Props {
    value?: DateTime
    required?: boolean
    class?: string
    disabled?: boolean
    change?: (value: DateTime | undefined) => void
    calendarProps?: Partial<ComponentProps<typeof Calendar>>
    format?: (datetime: DateTime) => string
  }

  let {
    value = $bindable(),
    required = false,
    class: className,
    disabled,
    change,
    calendarProps,
    format = (d) => d.toLocaleString(DateTime.DATE_FULL),
  }: Props = $props()

  let open = $state(false)
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" class={['justify-start gap-1 pl-3 text-left font-normal', className]}>
        <CalendarIcon class="mr-2 mb-0.5 h-4 w-4" />
        <span class="overflow-hidden text-ellipsis">
          {value ? format(value) : 'Select a date'}
        </span>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0">
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
      onValueChange={(v) => {
        open = false
        change?.(v ? DateTime.fromISO(v.toString()) : undefined)
      }}
    />
  </Popover.Content>
</Popover.Root>

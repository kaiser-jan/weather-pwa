<script lang="ts">
  import type { SelectSetting } from '../types'
  import * as Select from '$lib/components/ui/select'

  interface Props {
    item: SelectSetting
    value: string
    onchange: (v: string) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<label class="flex grow flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
  <span>{item.label}</span>

  <Select.Root
    type="single"
    {value}
    onValueChange={(v) => {
      value = v
      onchange(v)
    }}
    disabled={item.disabled}
  >
    <Select.Trigger>
      {value}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each item.options as option}
          <Select.Item value={option} label={option}>{option}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</label>

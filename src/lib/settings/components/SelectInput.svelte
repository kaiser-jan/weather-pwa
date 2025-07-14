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

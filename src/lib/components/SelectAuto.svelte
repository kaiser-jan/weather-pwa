<script lang="ts" generics="T">
  import * as Select from '$lib/components/ui/select/index.js'
  import type { Selected } from 'bits-ui'

  interface Props {
    items: Selected<T>[]
    selected: Selected<T>
    onselect: (selected: Selected<T> | undefined) => void
  }

  let { items, selected = $bindable(), onselect }: Props = $props()
</script>

<Select.Root portal={null} bind:selected onSelectedChange={onselect}>
  <Select.Trigger>
    <Select.Value placeholder="Select provider" />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      {#each items as item}
        <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>

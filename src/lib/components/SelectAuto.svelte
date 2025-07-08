<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js'

  interface Props {
    items: string[]
    selected: string
    onselect: (value: string | undefined) => void
    placeholder: string
  }

  let { items, selected = $bindable(), onselect, placeholder }: Props = $props()
</script>

<Select.Root
  type="single"
  onValueChange={(v) => {
    selected = v
    onselect(v)
  }}
>
  <Select.Trigger>
    {selected ?? placeholder}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      {#each items as item}
        <Select.Item value={item} label={item}>{item}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>

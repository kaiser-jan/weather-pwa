<script lang="ts">
  import SelectAuto from './SelectAuto.svelte'

  interface Props {
    items: string[]
    selected: string
    onselect: (selected: string | undefined) => void
  }

  let { items, selected = $bindable(), onselect }: Props = $props()
</script>

<SelectAuto
  items={items.map((i) => {
    return { label: i, value: i }
  })}
  onselect={(s) => onselect(s?.value)}
  bind:selected={
    () => {
      return { label: selected, value: selected }
    },
    (v) => (selected = v.value)
  }
/>

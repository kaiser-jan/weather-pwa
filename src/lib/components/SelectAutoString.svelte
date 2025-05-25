<script lang="ts">
  import SelectAuto from './SelectAuto.svelte'

  interface Props {
    items: string[]
    selected: string
  }

  let { items, selected = $bindable() }: Props = $props()
</script>

<SelectAuto
  items={items.map((i) => {
    return { label: i, value: i }
  })}
  bind:selected={
    () => {
      return { label: selected, value: selected }
    },
    (v) => (selected = v.value)
  }
/>

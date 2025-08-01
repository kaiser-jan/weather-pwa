<script lang="ts">
  import type { BooleanSetting } from '../../types'
  import Switch from '$lib/components/ui/switch/switch.svelte'

  interface Props {
    item: BooleanSetting
    value: boolean
    onchange: (v: boolean) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<Switch
  bind:checked={
    () => value,
    (v) => {
      value = v
      onchange(v)
    }
  }
/>

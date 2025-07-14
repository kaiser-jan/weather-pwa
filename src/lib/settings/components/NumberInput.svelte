<script lang="ts">
  import type { NumberSetting } from '../types'

  interface Props {
    item: NumberSetting
    value: number
    onchange: (v: number) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<input type="number" bind:value oninput={(e) => onchange((e.target as HTMLInputElement).value)} />

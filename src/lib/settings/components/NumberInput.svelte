<script lang="ts">
  import type { NumberSetting } from '../types'

  interface Props {
    item: NumberSetting
    value: number
    onchange: (v: number) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<label class="flex grow flex-row items-center justify-between gap-2">
  <span>{item.label}</span>
  <input type="number" bind:value oninput={(e) => onchange((e.target as HTMLInputElement).value)} />
</label>

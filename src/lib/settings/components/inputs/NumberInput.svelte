<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import type { NumberSetting } from '../../types'

  interface Props {
    item: NumberSetting
    value: number
    onchange: (v: number) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<div class="inline-flex flex-row items-baseline gap-1">
  <Input type="number" bind:value onblur={() => onchange(value)} min={item.min} max={item.max} step={item.step} />
  <span>{item.unit}</span>
</div>

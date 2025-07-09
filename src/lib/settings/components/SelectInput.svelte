<script lang="ts">
  import type { SelectSetting } from '../types'
  import SelectAuto from '$lib/components/SelectAuto.svelte'

  interface Props {
    item: SelectSetting
    value: boolean
    onchange: (v: boolean) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<label class="flex flex-col gap-1">
  <span>{item.label}</span>
  <SelectAuto
    placeholder={'Click to select'}
    items={item.options}
    selected={value}
    onselect={(v) => {
      value = v
      onchange(v)
    }}
  />
</label>

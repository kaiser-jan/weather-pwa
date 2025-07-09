<script lang="ts">
  import type { SelectSetting } from '../types'
  import SelectAuto from '$lib/components/SelectAuto.svelte'

  interface Props {
    item: SelectSetting
    value: string
    onchange: (v: string) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<label class="flex grow flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
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

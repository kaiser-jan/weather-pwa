<script lang="ts">
  import type { MultiSelectSetting } from '../../types'
  import { toReadable } from '$lib/utils/stores'
  import ReorderableList from '../ui/ReorderableList.svelte'

  interface Props {
    item: MultiSelectSetting
    value: string[]
    onchange: (v: string[]) => void
  }

  let { item, value, onchange }: Props = $props()

  let disabled = toReadable(item.disabled)
</script>

<ReorderableList allOptions={item.options} selectedOptions={value} {onchange} {disabled} labels={item.labels} />

<script lang="ts">
  import { toReadable } from '$lib/utils/stores'
  import type { ValueDisplayItem } from '../../types'

  interface Props {
    item: ValueDisplayItem
  }

  let { item }: Props = $props()

  let value = $derived(toReadable(item.value))
</script>

<!-- TODO: unite styles between items -->
<button
  class="bg-midground relative flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 overflow-hidden rounded-md px-4 py-2"
>
  <span class="flex flex-row items-center gap-3">
    <item.icon />
    {item.label}
  </span>

  {$value}
</button>

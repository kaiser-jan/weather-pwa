<script lang="ts">
  import { toReadable } from '$lib/utils/stores'
  import type { ValueDisplayItem } from '../../types'

  interface Props {
    item: ValueDisplayItem
  }

  let { item }: Props = $props()

  let value = $derived(toReadable(item.value))
</script>

<span>{$value}</span>

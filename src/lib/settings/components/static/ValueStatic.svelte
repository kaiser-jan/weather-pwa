<script lang="ts">
  import { toReadable } from '$lib/utils/stores'
  import type { StaticValue } from '../../types'

  interface Props {
    item: StaticValue
  }

  let { item }: Props = $props()

  let value = $derived(toReadable(item.value))
</script>

<span>{$value}</span>

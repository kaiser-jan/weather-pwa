<script lang="ts">
  import type { DescriptionItem } from '$lib/settings/types'

  interface Props {
    item: DescriptionItem
  }

  let { item }: Props = $props()
</script>

<p class="bg-midground text-text-muted rounded-md px-3 py-2">{@html item.text}</p>

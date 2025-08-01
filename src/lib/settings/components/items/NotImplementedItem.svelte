<script lang="ts">
  import type { DescriptionItem } from '$lib/settings/types'
  import { LockIcon } from '@lucide/svelte'

  interface Props {
    item: DescriptionItem
  }

  let { item }: Props = $props()
</script>

<div class="bg-disabled text-disabled-foreground flex min-h-12 items-center justify-between gap-2 rounded-md px-4">
  <span class="flex flex-row items-center gap-3">
    <item.icon />
    {item.label}
  </span>
  <LockIcon />
</div>

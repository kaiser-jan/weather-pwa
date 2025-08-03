<script lang="ts">
  import type { GroupWrapper } from '$lib/settings/types'
  import BasicPageRenderer from '../pages/BasicPageRenderer.svelte'

  interface Props {
    path: string[]
    item: GroupWrapper
    onnavigate: (target: string[]) => void
  }

  let { path, item, onnavigate }: Props = $props()
</script>

<section class="flex flex-col gap-2">
  <h2 class="text-text-muted -mb-1 flex flex-row items-center gap-2">
    <item.icon />
    {item.label}
  </h2>
  <BasicPageRenderer
    {item}
    {path}
    onnavigate={(target) => {
      onnavigate([item.id, ...target])
    }}
  />
</section>

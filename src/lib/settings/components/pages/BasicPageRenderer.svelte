<script lang="ts">
  import { settings } from '../../store'
  import type { SettingsNested } from '../../types'
  import { getItemComponent } from '$lib/settings/registry'

  interface Props {
    path: string[]
    item: SettingsNested
    onnavigate: (target: string[], replace?: boolean) => void
  }

  let { path: parentPath, item, onnavigate }: Props = $props()
</script>

{#each item.children as child (child.id)}
  {@const ItemComponent = getItemComponent(child)}
  {#if !child.visible || child.visible($settings)}
    <ItemComponent path={[...parentPath, child.id]} item={child} {onnavigate} />
  {/if}
{/each}

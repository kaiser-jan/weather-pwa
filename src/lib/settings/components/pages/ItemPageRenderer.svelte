<script lang="ts">
  import type { SettingsNested } from '../../types'
  import { getItemComponent } from '$lib/settings/registry'

  interface Props {
    path: string[]
    item: SettingsNested
    onnavigate: (target: string[], replace?: boolean) => void
  }

  let { path, item, onnavigate }: Props = $props()

  const ItemComponent = getItemComponent(item)
</script>

<ItemComponent {path} {item} {onnavigate} fullscreen={true} />

<script lang="ts">
  import type { MultiSelectSetting } from '../../types'
  import { toReadable } from '$lib/utils/stores'
  import ReorderableList from '../ui/ReorderableList.svelte'
  import { Label } from '$lib/components/ui/label'
  import { ChevronRightIcon } from '@lucide/svelte'

  interface Props {
    item: MultiSelectSetting
    value: string[]
    fullscreen?: boolean
    onchange: (v: string[]) => void
  }

  let { item, value, fullscreen, onchange }: Props = $props()

  let disabled = toReadable(item.disabled)
</script>

{#if item.requiresFullscreen && !fullscreen}
  <span class="text-text-muted ml-auto">{value.length} / {item.options.length}</span>
  <ChevronRightIcon />
{:else}
  <ReorderableList allOptions={item.options} selectedOptions={value} {onchange} {disabled} labels={item.labels} />
{/if}

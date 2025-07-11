<script lang="ts">
  import { getComponent } from '../registry'
  import { settings } from '../store'
  import type { ConfigItem } from '../types'
  import Button from '$lib/components/ui/button/button.svelte'
  import { ChevronRightIcon, LockIcon, RotateCcwIcon } from '@lucide/svelte'
  import { tick } from 'svelte'

  interface Props {
    path: string[]
    item: ConfigItem
  }

  let { path, item }: Props = $props()

  const Component = getComponent(item.type)

  const initialSetting = settings.readSetting(path)
  let value = $state(initialSetting.value)
  let hasChanged = $state(initialSetting.changed ?? false)
</script>

<div class="bg-midground flex min-h-12 items-center justify-between gap-2 rounded-md px-4">
  {#if Component}
    <Component
      {item}
      {value}
      onchange={(v: any) => {
        settings.writeSetting(path, v)
        hasChanged = true
        value = v
      }}
    />
  {:else}
    {item.type}
    {item.id}
  {/if}
  <!-- HACK: wrapping this in a #if hasChanged causes the whole settings to reload -->
  <!-- svelte seems to dislike changing the #if condition from within it -->
  <Button
    variant="outline"
    size="icon"
    class={['size-8', hasChanged ? '' : 'hidden']}
    onclick={() => {
      value = settings.resetSetting(path)
      hasChanged = false
    }}
  >
    <RotateCcwIcon />
  </Button>
</div>

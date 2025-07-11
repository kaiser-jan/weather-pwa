<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import { getComponent } from '../registry'
  import { settings } from '../store'
  import type { ConfigItem } from '../types'
  import Button from '$lib/components/ui/button/button.svelte'
  import { ChevronRightIcon, LockIcon, RotateCcwIcon } from '@lucide/svelte'
  import SettingsItemRenderer from './SettingsItemRenderer.svelte'

  interface Props {
    path: string[]
    config: ConfigItem[]
    onnavigate: (target: string) => void
  }

  let { path: parentPath, config, onnavigate }: Props = $props()
</script>

{#each config as item}
  {@const path = [...parentPath, item.id]}
  {#if !item.visible || item.visible($settings)}
    {#if item.type === 'page'}
      <Button variant="midground" onclick={() => onnavigate(item.id)} class="min-h-12 justify-between text-base!">
        {item.label}
        <ChevronRightIcon />
      </Button>
    {:else if item.type === 'group'}
      <section class="flex flex-col gap-2">
        {#if item.label}
          <h2 class="text-text-muted -mb-1">{item.label}</h2>
        {/if}
        <SettingsRenderer
          config={item.children}
          path={[...path, item.id]}
          onnavigate={() => {
            throw new Error('onnavigate not implemented on group')
          }}
        />
      </section>
    {:else if item.type === 'description'}
      <p>{item.text}</p>
    {:else if item.type === 'not-implemented'}
      <div
        class="bg-disabled text-disabled-foreground flex min-h-12 items-center justify-between gap-2 rounded-md px-4"
      >
        {item.label}
        <LockIcon />
      </div>
    {:else}
      <SettingsItemRenderer path={[...parentPath, item.id]} {item} />
    {/if}
  {/if}
{/each}

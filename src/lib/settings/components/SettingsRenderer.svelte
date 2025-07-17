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
      <Button variant="midground" onclick={() => onnavigate(item.id)} class="min-h-12 justify-between gap-3 text-base!">
        <item.icon />
        {item.label}
        <ChevronRightIcon class="ml-auto" />
      </Button>
    {:else if item.type === 'group'}
      <section class="flex flex-col gap-2">
        <h2 class="text-text-muted -mb-1 flex flex-row items-center gap-2">
          <item.icon />
          {item.label}
        </h2>
        <SettingsRenderer
          config={item.children}
          {path}
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
        <span class="flex flex-row items-center gap-3">
          <item.icon />
          {item.label}
        </span>
        <LockIcon />
      </div>
    {:else}
      <SettingsItemRenderer path={[...parentPath, item.id]} {item} />
    {/if}
  {/if}
{/each}

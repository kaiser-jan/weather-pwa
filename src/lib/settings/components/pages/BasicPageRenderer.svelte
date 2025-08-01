<script lang="ts">
  import { settings } from '../../store'
  import type { ConfigItem } from '../../types'
  import Button from '$lib/components/ui/button/button.svelte'
  import { ChevronRightIcon, LockIcon } from '@lucide/svelte'
  import BasicPageRenderer from './BasicPageRenderer.svelte'
  import ActionItem from '../items/ActionItem.svelte'
  import BasicItemRenderer from '../items/BasicItemRenderer.svelte'

  interface Props {
    path: string[]
    config: ConfigItem[]
    onnavigate: (target: string, replace?: boolean) => void
  }

  let { path: parentPath, config, onnavigate }: Props = $props()
</script>

{#each config as item (item.id)}
  {@const path = [...parentPath, item.id]}
  {#if !item.visible || item.visible($settings)}
    {#if item.type === 'page' || item.type === 'list' || item.type === 'changelog'}
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
        <BasicPageRenderer
          config={item.children}
          {path}
          onnavigate={(target) => {
            onnavigate(item.id)
            onnavigate(target, true)
          }}
        />
      </section>
    {:else if item.type === 'description'}
      <p class="bg-midground text-text-muted rounded-md px-3 py-2">{@html item.text}</p>
    {:else if item.type === 'action'}
      <ActionItem {item} />
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
      <BasicItemRenderer path={[...parentPath, item.id]} {item} {onnavigate} />
    {/if}
  {/if}
{/each}

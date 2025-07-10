<script lang="ts">
  import SettingsRenderer from './SettingsRenderer.svelte'
  import { getDeep, setDeep } from '../deep'
  import { getComponent } from '../registry'
  import { settingsWritable, settingsDefaults } from '../store'
  import type { ConfigItem } from '../types'
  import Button from '$lib/components/ui/button/button.svelte'
  import { ChevronRightIcon, LockIcon, RotateCcwIcon } from '@lucide/svelte'

  interface Props {
    path: string[]
    config: ConfigItem[]
    onnavigate: (target: string) => void
  }

  let { path, config, onnavigate }: Props = $props()

  function getValue(id: string) {
    const v = getDeep($settingsWritable, [...path, id])
    console.log(v)
    return v
  }

  function setValue(id: string, value: unknown) {
    settingsWritable.update((s) => {
      setDeep(s, [...path, id], value)
      return s
    })
  }

  function resetValue(id: string) {
    const def = getDeep(settingsDefaults, [...path, id])
    setValue(id, def)
  }
</script>

{#each config as item}
  {#if !item.visible || item.visible($settingsWritable)}
    {#if item.type === 'page'}
      <Button variant="midground" onclick={() => onnavigate(item.id)} class="justify-between text-base! min-h-12">
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
        class="bg-disabled text-disabled-foreground flex min-h-10 items-center justify-between gap-2 rounded-md px-4 min-h-12"
      >
        {item.label}
        <LockIcon />
      </div>
    {:else}
      {@const Component = getComponent(item.type)}
      <div class="bg-midground flex min-h-12 items-center justify-between gap-2 rounded-md px-4">
        {#if Component}
          <Component {item} value={getValue(item.id)} onchange={(v: any) => setValue(item.id, v)} />
        {:else}
          {item.type}
          {item.id}
        {/if}
        <Button variant="outline" size="icon" class="size-8" onclick={() => resetValue(item.id)}>
          <RotateCcwIcon />
        </Button>
      </div>
    {/if}
  {/if}
{/each}

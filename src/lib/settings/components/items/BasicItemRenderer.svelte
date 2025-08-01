<script lang="ts">
  import { getInputComponent } from '../../registry'
  import { settings } from '../../store'
  import type { SettingsInput } from '../../types'

  interface Props {
    path: string[]
    item: SettingsInput
    onnavigate: (target: string) => void
  }

  let { path, item, onnavigate }: Props = $props()

  const Component = getInputComponent(item.type)

  const initialSetting = settings.readSetting(path)
  let value = $state(initialSetting.value)
  let hasChanged = $state(initialSetting.changed ?? false)
</script>

<button
  class="bg-midground relative flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 overflow-hidden rounded-md px-4 py-2"
  onclick={() => item.action?.()}
  ondblclick={() => {
    value = settings.resetSetting(path)
    hasChanged = false
  }}
>
  <span class="flex flex-row items-center gap-3">
    <item.icon class={hasChanged ? 'text-text' : 'text-text-muted'} />
    {item.label}
  </span>

  {#if Component}
    <Component
      {path}
      {item}
      {value}
      {onnavigate}
      onchange={(v: unknown) => {
        settings.writeSetting(path, v)
        hasChanged = true
        value = v
      }}
    />
  {:else}
    {item.type}
    {item.id}
    {value}
  {/if}

  {#if hasChanged}
    <span class="bg-primary absolute top-0 bottom-0 left-0 h-full w-0.5"></span>
  {/if}
</button>

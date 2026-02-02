<script lang="ts">
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import { cn } from '$lib/utils'
  import { LucideSettings } from '@lucide/svelte'
  import { settings } from '$lib/stores/settings'
  import { SettingsView } from 'svelte-settings'
  import { queryParam, ssp } from 'sveltekit-search-params'

  const settingsPath = queryParam<string[]>('settings-path', ssp.array())

  function openSettings() {
    settingsPath.set([])
  }

  function close() {
    settingsPath.set(null)
  }
</script>

<Drawer.Root
  bind:open={
    () => $settingsPath !== null,
    (o) => {
      if (o) openSettings()
      else close()
    }
  }
>
  <Drawer.Trigger
    class={cn(buttonVariants({ variant: 'midground', size: 'icon' }), 'size-14! grow-0 rounded-full text-lg!')}
  >
    <LucideSettings />
  </Drawer.Trigger>
  <Drawer.Content class="h-full">
    <div class="flex grow flex-col gap-4 overflow-hidden">
      <div class="flex h-dvh min-h-0 grow flex-col gap-4 overflow-x-visible p-4 pb-0">
        <SettingsView {settings} />
      </div>
      <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
    </div>
  </Drawer.Content>
</Drawer.Root>

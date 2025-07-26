<script lang="ts">
  import { settingsConfig } from '$lib/settings/config'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import SettingsView from '$lib/settings/components/SettingsView.svelte'
  import { cn } from '$lib/utils'
  import { LucideSettings } from '@lucide/svelte'
  import { page } from '$app/state'
  import { pushState, replaceState } from '$app/navigation'

  function openSettings() {
    console.log('open')
    pushState('', { showSettings: true })
  }

  function close() {
    console.log('close')
    page.state.showSettings = undefined
    page.state.settingsPath = undefined
    replaceState('', page.state)
  }
</script>

<Drawer.Root
  bind:open={
    () => page.state.showSettings ?? false,
    (o) => {
      o ? openSettings() : close()
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
      <SettingsView config={settingsConfig} />
      <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
    </div>
  </Drawer.Content>
</Drawer.Root>

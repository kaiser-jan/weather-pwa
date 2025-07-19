<script lang="ts">
  import { settingsConfig } from '$lib/settings/config'
  import PwaSettings from '$lib/components/pwa/PWASettings.svelte'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import SettingsView from '$lib/settings/components/SettingsView.svelte'
  import { cn } from '$lib/utils'
  import { LucideSettings } from '@lucide/svelte'
</script>

<Drawer.Root>
  <Drawer.Trigger
    class={cn(buttonVariants({ variant: 'midground', size: 'icon' }), 'size-14! grow-0 rounded-full text-lg!')}
  >
    <LucideSettings />
  </Drawer.Trigger>
  <Drawer.Content class="h-full">
    <div class="flex grow flex-col gap-4 overflow-hidden p-4">
      <SettingsView config={settingsConfig} path={[]} />
      <h2 class="text-xl font-bold">PWA Options</h2>
      <PwaSettings />
      <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
    </div>
  </Drawer.Content>
</Drawer.Root>

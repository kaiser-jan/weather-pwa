<script lang="ts">
  import LocationSelector from '$lib/components/layout/location/LocationSelector.svelte'
  import SettingsButton from '$lib/components/layout/SettingsButton.svelte'
  import { Button } from '$lib/components/ui/button'
  import { ChevronLeftIcon } from '@lucide/svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  const isSubView = $derived(page.route.id !== '/' && !page.route.id?.startsWith('/setup'))
</script>

<div class="flex h-22 shrink-0 flex-row items-center gap-2 bg-background p-4">
  {#if isSubView}
    <Button class="size-14! grow-0 rounded-full text-lg!" variant="midground" size="icon" onclick={() => goto('/')}>
      <ChevronLeftIcon />
    </Button>
  {/if}
  <LocationSelector />
  <SettingsButton />
</div>

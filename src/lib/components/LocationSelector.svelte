<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { geolocationStore } from '$lib/stores/geolocation'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import LocationSearch from './LocationSearch.svelte'
  import { iconMap } from '$lib/utils/icons'
  import { SearchIcon } from '@lucide/svelte'
  import { locationSearch } from '$lib/stores/ui'
  import { selectedLocation } from '$lib/stores/location'

  const geolocationDetails = geolocationStore.details

  const settingLocations = settings.select((s) => s.data.locations)
</script>

<div class="flex shrink grow flex-row items-center gap-1">
  <div class="bg-midground flex flex-row gap-2 rounded-l-full p-2">
    <button
      class={[
        'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
        $selectedLocation?.type === 'geolocation' ? 'bg-primary' : 'bg-foreground text-text-d',
      ]}
      onclick={() => {
        if ($selectedLocation?.type === 'geolocation') geolocationStore.refresh()
        else selectedLocation?.set({ type: 'geolocation' })
        geolocationStore.start()
      }}
    >
      {#if $geolocationDetails.icon}
        {@const Icon = $geolocationDetails.icon}
        <Icon class={['-mb-0.5 -ml-0.5', $geolocationDetails.class]} />
      {:else}
        <LoaderPulsatingRing className="size-4" />
      {/if}
    </button>
  </div>
  <div class="bg-midground relative w-0 grow">
    {#if $settingLocations.length}
      <div class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-2">
        {#each $settingLocations as location (location.id)}
          <button
            class={[
              'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
              $selectedLocation?.type === 'saved' && $selectedLocation.location.id === location.id
                ? 'bg-primary'
                : 'bg-foreground text-text-muted',
            ]}
            onclick={() => selectedLocation.set({ type: 'saved', location })}
          >
            {#if location.icon}
              <svelte:component this={iconMap[location.icon]} />
            {:else}
              {location.name}
            {/if}
          </button>
        {/each}
      </div>
    {:else}
      <button
        class="text-text-muted line-clamp-2 flex h-14 w-fit grow flex-row items-center gap-2 p-2 px-3 text-sm"
        onclick={locationSearch.show}
      >
        Pin a location from <SearchIcon class="inline" /> search!
      </button>
    {/if}
    <div class="to-midground absolute top-0 right-0 h-full w-6 bg-linear-to-r from-transparent"></div>
  </div>
  <div class="bg-midground flex flex-row gap-2 rounded-r-full p-2">
    <LocationSearch active={$selectedLocation?.type === 'search'} />
  </div>
</div>

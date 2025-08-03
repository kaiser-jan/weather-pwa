<script lang="ts">
  import { settings } from '$lib/settings/store'
  import { geolocationStore } from '$lib/stores/geolocation'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import LocationSearch from './LocationSearch.svelte'
  import { iconMap } from '$lib/utils/icons'
  import { SearchIcon } from '@lucide/svelte'
  import { locationSearch } from '$lib/stores/ui'
  import { selectedLocation } from '$lib/stores/location'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'

  const geolocationDetails = geolocationStore.details

  const settingLocations = settings.select((s) => s.data.locations)
</script>

<FailSafeContainer name="Location Selector" class="bg-midground flex shrink grow flex-row items-center rounded-full">
  <div class="flex flex-row gap-2 p-2">
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
  <div class="border-background relative w-0 grow border-x-4">
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
        class="text-text-muted inline-flex h-14 w-fit items-center p-2 px-3 text-sm"
        onclick={locationSearch.show}
      >
        <span class="line-clamp-2">
          Pin a location from <SearchIcon class="inline align-text-top" /> search!
        </span>
      </button>
    {/if}
    <div class="to-midground absolute top-0 right-0 h-full w-6 bg-linear-to-r from-transparent"></div>
  </div>
  <div class="flex flex-row gap-2 p-2">
    <LocationSearch active={$selectedLocation?.type === 'search'} />
  </div>
</FailSafeContainer>

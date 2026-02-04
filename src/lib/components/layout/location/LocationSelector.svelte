<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import { geolocationStore } from '$lib/stores/geolocation'
  import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
  import LocationMenu from './LocationMenu.svelte'
  import { iconMap } from '$lib/utils/icons'
  import { CircleHelpIcon, CircleQuestionMarkIcon, MapPinIcon, SearchIcon } from '@lucide/svelte'
  import { locationSearch, openSettingsAt } from '$lib/stores/ui'
  import { selectedLocation, selectGeolocation, selectSavedLocation } from '$lib/stores/location'
  import FailSafeContainer from '$lib/components/layout/errors/FailSafeContainer.svelte'

  import { usePress } from 'svelte-gestures'

  const geolocationDetails = geolocationStore.details

  const settingLocations = settings.select((s) => s.data.locations)
</script>

<FailSafeContainer name="Location Selector" class="flex shrink grow flex-row items-center rounded-full bg-midground">
  <div class="flex flex-row gap-2 p-2">
    <button
      class={[
        'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
        $selectedLocation?.type === 'geolocation' ? 'bg-primary' : 'text-text-d bg-foreground',
      ]}
      onclick={() => {
        geolocationStore.start()
        if ($selectedLocation?.type === 'geolocation') geolocationStore.refresh()
        else selectGeolocation()
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
  <div class="relative w-0 grow border-x-4 border-background">
    {#if $settingLocations.length}
      <div class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-2">
        {#each $settingLocations as location, locationIndex (location.id)}
          <button
            class={[
              'flex size-10 min-w-fit items-center justify-center rounded-full px-3',
              $selectedLocation?.type === 'saved' && $selectedLocation.id === location.id
                ? 'bg-primary'
                : 'bg-foreground text-text-muted',
            ]}
            onclick={() => selectSavedLocation(location.id)}
            {...usePress(
              () => openSettingsAt(['data', 'locations', locationIndex.toString()]),
              () => ({ timeframe: 500, triggerBeforeFinished: true }),
            )}
          >
            {#if location.icon}
              {@const Icon = iconMap[location.icon] ?? MapPinIcon}
              <Icon />
            {:else}
              {location.name}
            {/if}
          </button>
        {/each}
      </div>
    {:else}
      <button
        class="inline-flex h-14 w-fit items-center p-2 px-3 text-sm text-text-muted"
        onclick={locationSearch.show}
      >
        <span class="line-clamp-2">
          Pin a location from <SearchIcon class="inline align-text-top" /> search!
        </span>
      </button>
    {/if}
    <div class="absolute top-0 right-0 h-full w-6 bg-linear-to-r from-transparent to-midground"></div>
  </div>
  <FailSafeContainer name="Location Menu" class="flex flex-row gap-2 p-2">
    <LocationMenu active={$selectedLocation?.type === 'search'} />
  </FailSafeContainer>
</FailSafeContainer>

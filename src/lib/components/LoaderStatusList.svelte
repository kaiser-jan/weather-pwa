<script>
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import { loaderStates } from '$lib/stores/data'
  import { CircleCheckBigIcon, CircleCheckIcon, CircleXIcon, DatabaseIcon, ExternalLinkIcon } from '@lucide/svelte'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import { PROVIDERS } from '$lib/data/providers'
</script>

<Accordion.Root type="single" class="-my-4 min-h-10 w-full">
  <Accordion.Item>
    <Accordion.Trigger class="text-text-muted inline-flex justify-start">
      <DatabaseIcon />
      <span class="mr-auto">Data Sources</span>
    </Accordion.Trigger>
    <Accordion.Content class="bg-midground flex flex-col gap-2 rounded-md px-2.5 py-0">
      <div class="flex flex-col gap-1">
        {#each $loaderStates as state (state.loader.id)}
          {@const provider = PROVIDERS.find((p) => p.loaderIds.includes(state.loader.id))}
          <div class="flex flex-row items-center gap-2 py-1 first:pt-2 last:pb-2">
            {#if !state.done}
              <LoaderPulsatingRing className="size-4 shrink-0" />
            {:else if state.success}
              <CircleCheckBigIcon class="shrink-0 text-green-500" />
            {:else}
              <CircleXIcon class="shrink-0 text-red-500" />
            {/if}
            <a class="mr-auto inline-flex grow flex-nowrap items-center gap-1" href={state.loader.url} target="_blank">
              {[state.loader.name, state.loader.label].filter(Boolean).join(' ')}
              <ExternalLinkIcon class="text-text-muted size-3 shrink-0" />
            </a>
            <a class="text-text-muted text-right" href={provider?.url} target="_blank">{provider?.name}</a>
          </div>
        {/each}
      </div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>

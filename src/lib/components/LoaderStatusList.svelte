<script>
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { loaderStates } from '$lib/stores/data'
  import { CircleCheckBigIcon, CircleCheckIcon, CircleXIcon, DatabaseIcon, ExternalLinkIcon } from '@lucide/svelte'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import { DATASETS, PROVIDERS } from '$lib/data/providers'
  import { DateTime } from 'luxon'
  import { formatRelativeDatetime } from '$lib/utils'
</script>

<Accordion.Root type="single" class="-my-4 min-h-10 w-full">
  <Accordion.Item>
    <Accordion.Trigger class="text-text-muted inline-flex justify-start">
      <DatabaseIcon />
      <span class="mr-auto">Data Sources</span>
    </Accordion.Trigger>
    <Accordion.Content class="bg-midground rounded-md py-0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-4" />
            <Table.Head class="bg-midground sticky left-0 z-10">Loader</Table.Head>
            <Table.Head>Updated At</Table.Head>
            <Table.Head>Refresh At</Table.Head>
            <Table.Head>Datasets</Table.Head>
            <Table.Head>Provider</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each $loaderStates as state (state.loader.id)}
            {@const provider = PROVIDERS.find((p) => p.loaderIds.includes(state.loader.id))}
            <Table.Row class="group gap-2 px-2 opacity-100">
              <Table.Cell class="w-4">
                {#if !state?.done}
                  <LoaderPulsatingRing className="size-4 shrink-0" />
                {:else if state.success}
                  <CircleCheckBigIcon class="shrink-0 text-green-500" />
                {:else}
                  <CircleXIcon class="shrink-0 text-red-500" />
                {/if}
              </Table.Cell>
              <Table.Cell class="sticky left-0 z-50 max-w-48 p-0">
                <a
                  class="bg-midground group-hover:bg-muted/50 flex h-full max-w-36 flex-nowrap items-center gap-1 px-2"
                  href={state.loader.url}
                  target="_blank"
                >
                  <span class="overflow-hidden text-ellipsis underline">{state.loader.name}</span>
                </a>
              </Table.Cell>
              <Table.Cell>
                {state.done && state.success ? formatRelativeDatetime(state.updatedAt) : '-'}
              </Table.Cell>
              <Table.Cell>
                {state.done && state.success ? formatRelativeDatetime(state.refreshAt) : '-'}
              </Table.Cell>
              <Table.Cell>
                {state.loader.datasetIds
                  .map((datasetId) => {
                    const dataset = DATASETS.find((d) => d.id === datasetId)
                    return dataset?.model
                  })
                  .join(', ')}
              </Table.Cell>
              <Table.Cell>
                <a class="text-text-muted underline" href={provider?.url} target="_blank">{provider?.name}</a>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>

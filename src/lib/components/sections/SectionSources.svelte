<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { loaderStates } from '$lib/stores/data'
  import { DatabaseIcon } from '@lucide/svelte'
  import { DATASETS, PROVIDERS } from '$lib/data/providers'
  import { formatRelativeDatetime } from '$lib/utils/ui'
  import SectionTitle from '$lib/components/layout/SectionTitle.svelte'
  import LoaderState from '../snippets/LoaderState.svelte'
  import { loaderSummaryLabel, loaderSummaryState, stateFromLoaderState } from '$lib/utils/loaderState'
</script>

<SectionTitle title="Data Sources" icon={DatabaseIcon} />
<Accordion.Root type="single" class="">
  <Accordion.Item class="container-unpadded">
    <Accordion.Trigger class="-my-4 inline-flex justify-start px-2 py-4 text-text-muted">
      <LoaderState state={$loaderSummaryState} />
      {$loaderSummaryLabel}
    </Accordion.Trigger>
    <Accordion.Content class="container-unpadded py-0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-4" />
            <Table.Head class="container-unpadded sticky left-0 z-10 bg-background">Loader</Table.Head>
            <Table.Head>Updated At</Table.Head>
            <Table.Head>Refresh At</Table.Head>
            <Table.Head>Datasets</Table.Head>
            <Table.Head>Provider</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each $loaderStates as state (state.loader.datasetIds.join(','))}
            {@const provider = PROVIDERS.find((p) => p.loaderIds.includes(state.loader.id))}
            <Table.Row class="group gap-2 opacity-100">
              <Table.Cell class="w-4">
                <LoaderState colored state={stateFromLoaderState(state)} />
              </Table.Cell>
              <Table.Cell class="sticky left-0 z-20 max-w-48 p-0">
                <a
                  class="container-unpadded flex h-full max-w-36 flex-nowrap items-center gap-1 bg-background px-2 group-hover:bg-muted/50"
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

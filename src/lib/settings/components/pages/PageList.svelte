<script lang="ts">
  import { ChevronRightIcon, PencilIcon } from '@lucide/svelte'

  interface Props {
    item: ListSetting
    value: Record<string, unknown>[]
    onchange: (v: unknown[]) => void
    onnavigate: (target: string) => void
  }

  let { item, value, onchange, onnavigate }: Props = $props()
</script>

<div class="flex w-full flex-col gap-0 py-1">
  {#each value as listItem, listIndex}
    <button
      class="bg-midground flex w-full flex-row items-center gap-2 px-3 py-2 not-last:border-b-2 first:rounded-t-md last:rounded-b-md"
      onclick={() => {
        onnavigate(listIndex.toString())
      }}
    >
      {#if item.nameProperty && item.nameProperty in listItem}
        {listItem[item.nameProperty]}
      {/if}
      <ChevronRightIcon class="ml-auto" />
    </button>
  {/each}
</div>

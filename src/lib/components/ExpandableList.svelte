<script lang="ts" generics="T extends string">
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import type { Snippet } from 'svelte'

  interface Props {
    items: T[]
    visibleItems: T[]
    markedItems: T[]
    itemSnippet: Snippet<[T]>
    children: Snippet<[T[]]>
  }

  let { items, visibleItems, markedItems, itemSnippet, children }: Props = $props()

  const hiddenItems = $derived(items.filter((p) => !visibleItems.includes(p)))
  const markedHiddenItems = $derived(markedItems.filter((p) => hiddenItems.includes(p)))
</script>

<div class="min-h-0 grow overflow-y-auto">
  {@render children(visibleItems)}

  {#if hiddenItems.length}
    <Accordion.Root type="single" class="min-h-10 w-full">
      <Accordion.Item>
        <Accordion.Trigger class="p-auto">
          {hiddenItems.length} Hidden Metrics
          {#if markedHiddenItems.length}
            <span class="text-text-muted mr-auto inline-flex items-center space-x-1">
              (
              {#each markedHiddenItems as item, i (item)}
                {#if i !== 0}
                  ,
                {/if}
                {@render itemSnippet(item)}
              {/each}
              <span>selected)</span>
            </span>
          {/if}
        </Accordion.Trigger>
        <Accordion.Content class="flex flex-col gap-2">
          {@render children(hiddenItems)}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/if}
</div>

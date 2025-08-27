<script lang="ts" generics="T extends string">
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    items: T[]
    visibleItems: T[]
    markedItems: T[]
    itemSnippet: Snippet<[T]>
    children: Snippet<[T[]]>
    triggerClass?: string
    contentClass?: string
  }

  let { items, visibleItems, markedItems, itemSnippet, children, contentClass, triggerClass }: Props = $props()

  const hiddenItems = $derived(items.filter((p) => !visibleItems.includes(p)))
  const markedHiddenItems = $derived(markedItems.filter((p) => hiddenItems.includes(p)))
</script>

<div class="min-h-0 grow overflow-y-auto">
  <div class={cn('flex flex-col', contentClass)}>
    {@render children(visibleItems)}
  </div>

  {#if hiddenItems.length}
    <Accordion.Root type="single" class="w-full">
      <Accordion.Item>
        <Accordion.Trigger class={cn('p-auto flex flex-row flex-wrap', triggerClass)}>
          <span>{hiddenItems.length} Hidden Metrics</span>
          {#if markedHiddenItems.length}
            <span class="text-text-muted mr-auto inline-flex items-baseline space-x-1">
              (
              {#each markedHiddenItems as item, i (item)}
                {#if i !== 0}
                  ,&nbsp;
                {/if}
                {@render itemSnippet(item)}
              {/each}
              <span>&nbsp;selected)</span>
            </span>
          {/if}
        </Accordion.Trigger>
        <Accordion.Content class={cn('flex flex-col', contentClass)}>
          {@render children(hiddenItems)}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/if}
</div>

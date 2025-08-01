<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { CircleCheckIcon, CircleXIcon } from '@lucide/svelte'
  import type { ActionItem } from '../../types'
  import LoaderPulsatingRing from '$lib/components/LoaderPulsatingRing.svelte'
  import { toReadable } from '$lib/utils/stores'

  interface Props {
    item: ActionItem
  }

  let { item }: Props = $props()

  let disabled = $derived(toReadable(item.disabled))

  let promise = $state<Promise<unknown>>()
  let loading = $state(false)

  const STATE_RESET_TIMEOUT = 3000
  let promiseResetTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  $effect(() => {
    if (promise) loading = true

    promise?.then((_) => {
      clearTimeout(promiseResetTimeout)
      loading = false

      setTimeout(() => {
        promise = undefined
      }, STATE_RESET_TIMEOUT)
    })
  })
</script>

<Button
  variant="secondary"
  class="relative flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 overflow-hidden rounded-md px-4 py-2 text-base"
  disabled={loading || $disabled}
  onclick={() => {
    promise = Promise.resolve(item.action()) as Promise<unknown>
  }}
>
  <span class="flex flex-row items-center gap-3">
    {#if promise}
      {#await promise}
        <LoaderPulsatingRing className="size-4" />
      {:then _}
        <CircleCheckIcon />
      {:catch _}
        <CircleXIcon />
      {/await}
    {:else}
      <item.icon />
    {/if}

    {item.label}
  </span>
</Button>

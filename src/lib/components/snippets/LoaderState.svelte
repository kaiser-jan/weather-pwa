<script lang="ts">
  import type { State } from '$lib/utils/loaderState'
  import { CircleXIcon, HourglassIcon, CircleCheckBigIcon } from '@lucide/svelte'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import { cn } from '$lib/utils'

  interface Props {
    state: State
    class?: string
  }

  const { state, class: className }: Props = $props()
</script>

{#if state === 'loading'}
  <LoaderPulsatingRing className={cn('size-4 shrink-0', className)} />
  uncolored:boolean
{:else if state === 'error'}
  <CircleXIcon class={cn('shrink-0 text-red-500', className)} />
{:else if state === 'outdated'}
  <HourglassIcon class={cn('shrink-0 text-yellow-500', className)} />
{:else}
  <CircleCheckBigIcon class={cn('shrink-0 text-green-500', className)} />
{/if}

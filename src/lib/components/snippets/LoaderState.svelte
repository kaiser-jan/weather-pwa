<script lang="ts">
  import type { State } from '$lib/utils/loaderState'
  import { CircleXIcon, HourglassIcon, CircleCheckBigIcon } from '@lucide/svelte'
  import LoaderPulsatingRing from './LoaderPulsatingRing.svelte'
  import { cn } from '$lib/utils'

  interface Props {
    state: State
    colored?: boolean
    class?: string
  }

  const { state, colored, class: className }: Props = $props()
</script>

{#if state === 'loading'}
  <div class="flex size-3 items-center justify-center">
    <LoaderPulsatingRing className={cn('size-4 shrink-0', className)} />
  </div>
{:else if state === 'error'}
  <CircleXIcon class={cn('shrink-0', colored && 'text-red-500', className)} />
{:else if state === 'outdated'}
  <HourglassIcon class={cn('shrink-0', colored && 'text-yellow-500', className)} />
{:else}
  <CircleCheckBigIcon class={cn('shrink-0', colored && 'text-green-500', className)} />
{/if}

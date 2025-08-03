<script lang="ts">
  import * as Drawer from '$lib/components/ui/drawer/index.js'
  import { cn } from '$lib/utils'
  import {
    AlertTriangle,
    AlertTriangleIcon,
    EraserIcon,
    InfoIcon,
    LucideAlertTriangle,
    RefreshCcwIcon,
  } from '@lucide/svelte'
  import { onMount, type Snippet, type SvelteComponent } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { Button, buttonVariants } from './ui/button'
  import ErrorExpandable from './ErrorExpandable.svelte'
  import { clearCache } from '$lib/utils/cache'

  interface Props {
    children: Snippet
    name: string
  }

  let { children, name, ...props }: HTMLAttributes<HTMLDivElement> & Props = $props()

  let open = $state(false)

  function close() {}

  onMount(() => {
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  })
</script>

<svelte:boundary>
  <div {...props}>
    {@render children()}
  </div>

  {#snippet failed(error, reset)}
    <button
      {...props as unknown as HTMLAttributes<HTMLButtonElement>}
      class={cn(props.class, buttonVariants({ variant: 'midground' }))}
    >
      <Drawer.Root bind:open>
        <Drawer.Trigger>
          <div class="flex h-full w-full flex-row items-center justify-center gap-2 text-wrap text-yellow-200">
            <AlertTriangleIcon class="shrink-0" />
            {name ?? 'Component'} failed to render!
          </div>
        </Drawer.Trigger>
        <Drawer.Content>
          <div class="flex grow flex-col gap-2 overflow-hidden p-4">
            <h1 class="text-semibold text-xl">{name ?? 'Component'} Error Details</h1>
            <p class="text-text-muted">Please report this error so we can fix it as soon as possible!</p>
            <ErrorExpandable {error} />
            <p>The following actions might help resolve it for now:</p>

            <ul class="flex flex-col gap-2">
              <li class="space-y-1">
                <Button variant="secondary" onclick={() => window.location.reload()}>
                  <RefreshCcwIcon /> Reload App
                </Button>
                <p class="text-text-muted text-sm">This is similar to closing and opening the app.</p>
              </li>

              <li class="space-y-1">
                <Button
                  variant="secondary"
                  onclick={() => {
                    clearCache()
                    window.location.reload()
                  }}
                >
                  <EraserIcon /> Clear Cache
                </Button>
                <p class="text-text-muted text-sm">This will clean semi-permanent data. You won't lose anything.</p>
              </li>
            </ul>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </button>
  {/snippet}
</svelte:boundary>

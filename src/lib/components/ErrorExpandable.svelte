<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import { InfoIcon, ClipboardCheckIcon, ClipboardCopyIcon } from '@lucide/svelte'
  import { Button } from './ui/button'

  interface Props {
    error: unknown
  }

  const { error }: Props = $props()

  let copied = $state(false)
  async function copy(err: Error) {
    await navigator.clipboard.writeText(`${err.name}: ${err.message}\n\n${err.stack}`)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  function formatError(e: unknown): string {
    if (e instanceof Error) return `${e.name}:\n${e.message}`.trim()
    return String(e)
  }
</script>

<Accordion.Root type="single">
  <Accordion.Item class="text-red-300">
    <Accordion.Trigger class="p-0">
      <InfoIcon />
      <span class="mr-auto">Error Details</span>
      <Button variant="outline" size="icon" onclick={(e) => (copy(error), e.stopPropagation())}>
        {#if copied}
          <ClipboardCheckIcon class="text-green-200" />
        {:else}
          <ClipboardCopyIcon />
        {/if}
      </Button>
    </Accordion.Trigger>
    <Accordion.Content>
      {#if typeof error === 'object' && error !== null && 'name' in error}
        <!-- prettier-ignore -->
        <pre class="text-sm font-medium text-wrap">
{formatError(error)}
</pre>
      {:else}
        {error}
      {/if}
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>

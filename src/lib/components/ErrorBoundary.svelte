<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import { Button } from '$lib/components/ui/button'
  import { pwa } from '$lib/stores/pwa'
  import { clearCache, resetApp } from '$lib/utils/cache'
  import {
    CircleArrowUpIcon,
    CircleFadingArrowUpIcon,
    ClipboardCheckIcon,
    ClipboardCopyIcon,
    EraserIcon,
    InfoIcon,
    PowerIcon,
    RefreshCcwIcon,
  } from '@lucide/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    scope: 'page' | 'app'
    children: Snippet
  }

  let { scope, children }: Props = $props()

  let copied = $state(false)
  async function copy(err: Error) {
    await navigator.clipboard.writeText(`${err.name}: ${err.message}\n\n${err.stack}`)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  const needRefresh = pwa.needRefresh
</script>

<svelte:boundary>
  {@render children()}

  {#snippet failed(error)}
    <main class="flex h-dvh max-h-full w-dvw shrink-0 grow flex-col gap-4 overflow-y-auto p-4">
      <h1 class="inline-flex items-center justify-between gap-2 text-xl font-bold text-red-300">
        <span>The {scope} crashed!</span>
        <span>:(</span>
      </h1>
      <p class="text-text-muted">This should not have happened.<br />Here is what you can do:</p>

      <ol class="list-decimal space-y-4 pl-8">
        <li class="space-y-2">
          <h3>Report the issue</h3>
          <p class="text-text-muted text-sm">
            We can only fix issues like this one if you notify us! You can do so either by
            <a
              class="text-text-disabled line-through"
              href="https://github.com/kaiser-jan/weather-pwa/issues/new"
              target="_blank"
            >
              creating an issue on GitHub
            </a>
            (available soon) or by contacting me directly.<br />
            Please include the error message at the bottom.
          </p>
        </li>

        <li class="space-y-2">
          <Button variant="secondary" onclick={() => window.location.reload()}>
            <RefreshCcwIcon /> Reload App
          </Button>
          <p class="text-text-muted text-sm">This is similar to closing and opening the app.</p>
        </li>

        <li class="space-y-2">
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

        <li class="space-y-2">
          <Button variant="secondary" onclick={() => pwa.checkForUpdate()}>
            <CircleFadingArrowUpIcon /> Check for Updates
          </Button>
          <Button variant="secondary" onclick={() => pwa.applyUpdate()} disabled={!$needRefresh}>
            <CircleArrowUpIcon /> Update
          </Button>
          <p class="text-text-muted text-sm">
            After reporting the issue, wait for an update which fixes it. <br />
            Only continue if told so or you don't care about your locally stored data.
          </p>
        </li>

        <li class="space-y-2">
          <!-- TODO: double click confirm -->
          <Button variant="destructive" onclick={() => resetApp()}>
            <PowerIcon /> Reset App
          </Button>
          <p class="text-text-muted text-sm">
            DANGER! This will completely reset the state, deleting all data. It comes close to deleting and
            reinstalling.
          </p>
        </li>

        <li class="space-y-2">
          <h3>Reinstall the App</h3>
          <p class="text-text-muted text-sm">
            DANGER! The last resort is reinstalling, which will wipe any data. Delete the app from your homescreen, go
            to
            <a class="underline" href="https://weather.kjan.dev" target="_blank">weather.kjan.dev</a> and add the app again.
          </p>
        </li>
      </ol>

      <Accordion.Root type="single">
        <Accordion.Item>
          <Accordion.Trigger>
            <InfoIcon />
            <span class="mr-auto">Error message</span>
            <Button variant="outline" size="icon" onclick={() => copy(error)}>
              {#if copied}
                <ClipboardCheckIcon class="text-green-200" />
              {:else}
                <ClipboardCopyIcon />
              {/if}
            </Button>
          </Accordion.Trigger>
          <Accordion.Content>
            {#if typeof error === 'object' && error !== null && 'name' in error}
              <pre class="text-sm font-medium text-wrap text-red-300">{error.name}: 
                {#if 'message' in error}
                  {error.message}
                {/if}
              </pre>
            {:else}
              {error}
            {/if}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </main>
  {/snippet}
</svelte:boundary>

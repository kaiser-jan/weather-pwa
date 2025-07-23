<script lang="ts">
  import type { Changelog } from '$lib/types/changelog'
  import { DateTime } from 'luxon'
  import * as Accordion from '$lib/components/ui/accordion/index.js'
  import changelog from 'changelog.json'
</script>

<Accordion.Root type="single">
  {#each changelog.releases as release, index (index)}
    <Accordion.Item value={release.version} class="">
      <Accordion.Trigger>
        <h1 class="inline-flex grow items-center text-2xl font-bold">
          {release.version}
          <span class="text-text-muted ml-auto text-sm italic">
            {DateTime.fromISO(release.date).toLocaleString()}
          </span>
        </h1>
      </Accordion.Trigger>
      <Accordion.Content>
        {#each release.commitGroups as commitGroup, j (j)}
          <div class="flex flex-col gap-2">
            <h2 class="text-lg font-bold">
              {commitGroup.title}
              <!-- {commitGroup.type} -->
            </h2>
            <div class="text-text-muted flex flex-col gap-1">
              {#each commitGroup.commits as commit, k (k)}
                {#if commit.scope !== commitGroup.commits[k - 1]?.scope}
                  <b class="text-text mt-1">{commit.scope}</b>
                {/if}
                <a href={commit.commitUrl} target="_blank" class="flex text-sm">
                  {commit.subject}
                  <!-- {commit.hash} -->
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </Accordion.Content>
    </Accordion.Item>
  {/each}
</Accordion.Root>

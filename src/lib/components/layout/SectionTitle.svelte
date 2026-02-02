<script lang="ts">
  import { settings } from '$lib/stores/settings'
  import type { Icon } from '@lucide/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    icon: typeof Icon
    onclick?: () => void
    children?: Snippet
  }

  let { title, icon: SectionIcon, children, onclick }: Props = $props()
</script>

{#if $settings.sections.components.showSectionTitles}
  <button class="-mb-3 flex items-center gap-2 text-base font-semibold text-text-muted" {onclick}>
    <SectionIcon class="stroke-[2.5]" />
    {title}
    {#if children}
      {@render children()}
    {/if}
  </button>
  <div class="h-0.5 w-full bg-foreground"></div>
{/if}

<script lang="ts">
  import { settings } from '$lib/settings/store'
  import type { Icon } from '@lucide/svelte'

  interface Props {
    title: string
    icon: typeof Icon
    actionIcon?: typeof Icon
    onclick?: () => void
  }

  let { title, icon: SectionIcon, actionIcon: ActionIcon, onclick }: Props = $props()
</script>

{#if $settings.sections.components.showSectionTitles}
  <button class="text-text-muted -mb-3 flex items-center gap-2 text-base font-semibold" {onclick}>
    <SectionIcon class="stroke-[2.5]" />
    {title}
    <ActionIcon class="ml-auto" />
  </button>
{/if}

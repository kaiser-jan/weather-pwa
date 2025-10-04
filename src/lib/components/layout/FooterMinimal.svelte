<script lang="ts">
  import { cn } from '$lib/utils'
  import { ScaleIcon, InfoIcon } from '@lucide/svelte'

  interface Props {
    class?: string
  }

  const { class: className }: Props = $props()
</script>

{#snippet tinyLink({ label, href, icon: Icon }: { label: string; href: string; icon: typeof ScaleIcon })}
  <a {href} class="inline-flex items-center justify-center gap-2 text-sm text-text-muted">
    <Icon />
    {label}
  </a>
{/snippet}

<div class={cn('flex w-full flex-row justify-center gap-4', className)}>
  {@render tinyLink({ label: 'About', href: '?settings-path=["about"]', icon: InfoIcon })}
  {@render tinyLink({ label: 'Privacy Policy', href: '?settings-path=["about","privacy"]', icon: ScaleIcon })}
</div>

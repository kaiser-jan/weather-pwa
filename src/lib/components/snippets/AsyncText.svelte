<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton'

  interface Props {
    text?: string
    placeholder: string
    class: string
    loaded?: boolean
  }

  let { text, placeholder, loaded, class: className }: Props = $props()
</script>

<span class={[className, 'relative']}>
  {#if !text || loaded === false}
    {placeholder}
    <Skeleton class="absolute inset-0 bg-midground" />
  {:else}
    {text}
  {/if}
</span>

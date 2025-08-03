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
    <Skeleton class="bg-midground absolute inset-0" />
  {:else}
    {text}
  {/if}
</span>

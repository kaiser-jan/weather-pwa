<script lang="ts">
  import { cn } from '$lib/utils'

  let { className }: { className: string } = $props()
</script>

<span class={cn('loader shrink-0', className)}></span>

<style scoped>
  .loader {
    display: inline-block;
    position: relative;
  }
  .loader::after,
  .loader::before {
    content: '';
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid currentColor;
    position: absolute;
    left: 0;
    top: 0;
    animation: loader 1600ms ease-out infinite;
  }
  .loader::after {
    animation-delay: 800ms;
    /* NOTE: required with animation-delay as it stays in the original style for this duration */
    opacity: 0;
  }

  @keyframes loader {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>

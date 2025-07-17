<script lang="ts">
  interface Props {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }

  let { top, right, bottom, left }: Props = $props()
</script>

<div class={['corner bottom left', bottom, left]}></div>
<div class={['corner bottom right', bottom, right]}></div>

<style>
  .corner {
    --corner-size: 1rem;
    --corner-color: var(--color-background);
    position: absolute;
    min-height: var(--corner-size);
    min-width: var(--corner-size);
  }

  .bottom.left {
    background: radial-gradient(
        circle var(--corner-size) at var(--corner-size) 0%,
        transparent 100%,
        var(--corner-color) 100%
      )
      bottom left;
  }
  .bottom.right {
    background: radial-gradient(
        circle var(--corner-size) at calc(100% - var(--corner-size)) 0%,
        transparent 98%,
        var(--corner-color) 100%
      )
      bottom right;
  }
</style>

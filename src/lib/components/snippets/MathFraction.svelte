<script lang="ts">
  interface Props {
    numerator: string
    denominator: string
  }

  const { numerator, denominator }: Props = $props()
</script>

<div class="mb-0.5 flex flex-col items-center text-[0.6em] text-text-muted">
  <span class="leading-none">{numerator}</span>
  <span class="h-[0.1em] w-full bg-current"></span>
  <span class="leading-none">{denominator}</span>
</div>

<script lang="ts">
  interface Props {
    numerator: string
    denominator: string
  }

  const { numerator, denominator }: Props = $props()
</script>

<div class="text-text-muted flex flex-col items-center text-[0.6em]">
  <span class="leading-none">{numerator}</span>
  <span class="h-[0.1em] w-full bg-current"></span>
  <span class="leading-none">{denominator}</span>
</div>

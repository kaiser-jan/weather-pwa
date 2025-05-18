<script lang="ts">
  import type { StatisticalNumberSummary } from '$lib/types/data'

  interface Props {
    total: StatisticalNumberSummary
    instance: StatisticalNumberSummary
    color: 'clouds' | 'temperature'
  }

  const { total, instance, color }: Props = $props()

  const left = $derived((instance.min - total.min) / (total.max - total.min))
  const right = $derived((total.max - instance.max) / (total.max - total.min))

  const backgroundColor = $derived.by(() => {
    switch (color) {
      case 'temperature':
        return 'bg-amber-100'
      case 'clouds':
        return 'bg-gray-400'
      default:
        return 'bg-red'
    }
  })
</script>

<div class="bg-foreground relative h-full w-full rounded-full">
  <span
    class={['absolute inset-0 h-full min-w-1 rounded-full', `left-[${left}%] right-[${right}%]`, backgroundColor]}
    style={`left: ${left * 100}%; right: ${right * 100}%`}
  ></span>
</div>

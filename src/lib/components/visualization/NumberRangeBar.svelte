<script lang="ts">
  import { generateCssRangeGradient } from '$lib/utils/ui'
  import type { NumberSummary } from '$lib/types/data'
  import { settings } from '$lib/stores/settings'
  import { cn } from '$lib/utils'
  import type { ColorDefinition, ColorStop } from '$lib/types/ui'

  interface Props {
    total: Pick<NumberSummary, 'min' | 'max'> | undefined
    instance: NumberSummary
    color: ColorDefinition
    className: string
    vertical?: boolean
  }

  const { total = { min: 0, max: 1 }, instance, color, className, vertical }: Props = $props()

  const start = $derived(scale(instance.min))
  const end = $derived(100 - scale(instance.max))
  const startAverage = $derived(scale(instance.avg))

  const colorCss = $derived.by(() => {
    if ('css' in color) return `background-color: ${color.css}`

    const categoriesColorStops =
      color && 'categories' in color
        ? color.categories
        : (settings.readSetting(color.categoriesSetting).value as ColorStop[])

    return generateCssRangeGradient(instance.min, instance.max, categoriesColorStops, vertical ? 'top' : 'right')
  })

  function scale(temperature: number) {
    return ((temperature - total.min) / (total.max - total.min)) * 100
  }

  const insetStyle = $derived(vertical ? `top: ${end}%; bottom: ${start}%;` : `left: ${start}%; right: ${end}%;`)
</script>

<div class={cn('bg-foreground relative h-full w-full overflow-hidden rounded-full', className)}>
  <span class="absolute inset-0 rounded-full" style={[insetStyle, colorCss].join('')}></span>
  <span
    class={[
      'bg-background absolute h-1 w-1 rounded-full opacity-50',
      vertical ? `left-1/2 -translate-1/2` : 'top-1/2 -translate-1/2',
    ]}
    style={vertical ? `bottom: ${startAverage}%;` : `left: ${startAverage}%;`}
  ></span>
</div>

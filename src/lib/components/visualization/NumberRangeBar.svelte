<script lang="ts">
  import * as d3 from 'd3'
  import type { NumberSummary } from '$lib/types/data'
  import { createGradientDefinition } from '$lib/utils/d3/gradient'
  import { onMount } from 'svelte'
  import { cn } from '$lib/utils'
  import { METRIC_DETAILS, type ForecastMetric } from '$lib/config/metrics'

  interface Props {
    metric: ForecastMetric
    domain?: { min: number; max: number }
    total?: NumberSummary
    instance: NumberSummary
    class?: string | string[]
    vertical?: boolean
    current?: number
  }

  const { metric, domain: _domain, total, instance, class: className, vertical, current }: Props = $props()

  const details = $derived(METRIC_DETAILS[metric])

  const domain = $derived(
    _domain ?? {
      min: total?.min ?? instance.min,
      max: total?.max ?? instance.max,
    },
  )

  function renderBar(el: SVGSVGElement) {
    const width = el.getBoundingClientRect().width
    const height = el.getBoundingClientRect().height
    const svg = d3.select(el).attr('preserveAspectRatio', 'xMinYMin meet').attr('viewBox', `0 0 ${width} ${height}`)

    svg.selectAll('*').remove()

    const scale = d3.scaleLinear([domain.min, domain.max], vertical ? [height, 0] : [0, width])

    let color = 'css' in details.color ? details.color.css : 'red'

    if (details.categories) {
      const gradientId = createGradientDefinition({
        svg,
        scale,
        direction: vertical ? 'y' : 'x',
        stops: details.categories,
        name: metric,
        abrupt: 'type' in details.color && details.color.type === 'segments',
      })

      color = `url(#${gradientId})`
    }

    function drawRange({ min, max }: { min: number; max: number }, opacity = 1) {
      const start = scale(min)
      const end = scale(max)

      svg
        .append('rect')
        .attr('rx', Math.min(width, height) / 2)
        .attr('ry', Math.min(width, height) / 2)
        .attr('x', vertical ? 0 : start)
        .attr('y', vertical ? end : 0)
        .attr('width', vertical ? width : end - start)
        .attr('height', vertical ? start - end : height)
        .attr('fill', color)
        .attr('opacity', opacity)
    }

    drawRange(domain, 0.1)

    if (total) drawRange(total, 0.3)

    drawRange(instance, 1)

    const markerPos = scale(current ?? instance.avg)

    svg
      .append('circle')
      .attr('r', vertical ? width / 4 : height / 4)
      .attr('cx', vertical ? width / 2 : markerPos)
      .attr('cy', vertical ? markerPos : height / 2)
      .attr('fill', 'background')
      .attr('opacity', current !== undefined ? 0.8 : 0.5)
  }

  let svg: SVGSVGElement

  $effect(() => {
    if (domain || total || instance) renderBar(svg)

    svg.onresize = () => {
      const width = svg.getBoundingClientRect().width
      const height = svg.getBoundingClientRect().height
      d3.select(svg).attr('viewBox', `0 0 ${width} ${height}`)
    }
  })

  onMount(() => {
    renderBar(svg)
  })
</script>

<div class={cn('relative h-full w-full overflow-hidden rounded-full bg-foreground', className)}>
  <svg bind:this={svg} class="h-full w-full grow" />
</div>

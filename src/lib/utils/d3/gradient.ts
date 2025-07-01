import type { ColorStop } from '$lib/types/ui'
import { interpolateColor } from '../ui'
import type { Dimensions } from './types'

export function createGradientDefinition(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  scaleY: d3.ScaleLinear<number, number, never>
  stops: ColorStop[]
  id: string
}) {
  const { svg, scaleY, stops, id } = options

  const min = -50
  const max = 50
  const steps = 10
  const gradientStops = Array.from({ length: steps + 1 }, (_, i) => {
    // the gradient is inverted, causing the 1 - Ans
    const v = min + (1 - i / steps) * (max - min)
    return {
      offset: `${(i / steps) * 100}%`,
      color: interpolateColor(stops, v),
    }
  })

  const defs = svg.append('defs')

  const gradient = defs
    .append('linearGradient')
    .attr('id', id)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', scaleY(max))
    .attr('x2', 0)
    .attr('y2', scaleY(min))

  gradient
    .selectAll('stop')
    .data(gradientStops)
    .enter()
    .append('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color)
}

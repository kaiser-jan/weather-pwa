import type { ColorStop } from '$lib/types/ui'
import { createUUID } from '$lib/utils'
import { interpolateColor } from '$lib/utils/ui'

export function createGradientDefinition(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  scaleY: d3.ScaleLinear<number, number, never>
  stops: ColorStop[]
  name: string
}) {
  const { svg, scaleY, stops, name } = options

  const uuid = createUUID()

  const id = `gradient-${name}-${uuid}`

  const min = stops[0].value
  const max = stops[stops.length - 1].value

  const gradientStops = stops.map((s) => ({
    offset: `${((s.value - min) / (max - min)) * 100}%`,
    color: `hsla(${s.h}, ${s.s}%, ${s.l}%, ${s.a ?? 1})`,
  }))

  const defs = svg.append('defs')

  const gradient = defs
    .append('linearGradient')
    .attr('id', id)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', scaleY(min))
    .attr('x2', 0)
    .attr('y2', scaleY(max))

  gradient
    .selectAll('stop')
    .data(gradientStops)
    .enter()
    .append('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color)

  return id
}

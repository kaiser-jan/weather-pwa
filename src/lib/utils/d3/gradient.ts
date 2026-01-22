import type { ColorStop } from '$lib/types/ui'
import { createUUID } from '$lib/utils/common'
import { interpolateColor } from '$lib/utils/ui'

export function createGradientDefinition(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  scaleY: d3.ScaleLinear<number, number, never>
  stops: ColorStop[]
  name: string
  abrupt?: boolean
}) {
  const { svg, scaleY, stops, name, abrupt } = options

  const uuid = createUUID()

  const id = `gradient-${name}-${uuid}`

  const min = stops[0].threshold
  const max = stops[stops.length - 1].threshold

  let gradientStops = stops.map((s) => ({
    offset: `${((s.threshold - min) / (max - min)) * 100}%`,
    color: `hsla(${s.h}, ${s.s}%, ${s.l}%, ${s.a ?? 1})`,
  }))

  if (abrupt) {
    const duplicated: typeof gradientStops = []
    for (let i = 0; i < gradientStops.length; i++) {
      duplicated.push(gradientStops[i])
      if (i < gradientStops.length - 1) {
        duplicated.push({
          offset: gradientStops[i + 1].offset,
          color: gradientStops[i].color,
        })
      }
    }
    gradientStops = duplicated
  }

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

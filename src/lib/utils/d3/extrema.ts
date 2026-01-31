import * as d3 from 'd3'
import type { TimeSeriesNumberEntry } from '$lib/types/data'
import type { Dimensions } from './types'

export function createExtremaMarkers(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  dimensions: Dimensions
  scaleX: d3.ScaleTime<number, number, never>
  scaleY: d3.ScaleLinear<number, number, never>
  data: TimeSeriesNumberEntry[]
  format: (d: number) => string
}) {
  const { svg, dimensions, scaleX, scaleY, data, format } = options

  console.log(scaleX.domain())

  const startIndex = data.findIndex((b) => b.timestamp > scaleX.domain()[0].getTime())
  const endIndex = data.findLastIndex((b) => b.timestamp < scaleX.domain()[1].getTime())
  const relevantData = data.slice(startIndex, endIndex)

  const maxIndex = d3.maxIndex(relevantData, (d) => d.value)

  const morningMin = d3.least(relevantData.slice(0, maxIndex + 1), (d) => d.value)
  const eveningMin = d3.least(relevantData.slice(maxIndex), (d) => d.value)

  const max = relevantData[maxIndex]

  svg
    .selectAll('.highlight')
    .data([morningMin, max, eveningMin].filter((e) => e !== undefined))
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${scaleX(d.timestamp)}, ${scaleY(d.value)})`)
    .each(function (d) {
      const x = scaleX(d.timestamp)
      let dx = 0
      const offset = 10
      if (x <= offset + dimensions.margin.left) {
        dx = dimensions.margin.left + offset - x
      } else if (x >= dimensions.width + dimensions.margin.left - offset) {
        dx = dimensions.width + dimensions.margin.left - offset - x
      }

      d3.select(this) //
        .append('circle')
        .attr('r', 3)
        .classed('fill-text-muted stroke-background stroke-2', true)

      d3.select(this)
        .append('text')
        .text(format(d.value))
        .attr('dx', dx)
        .attr('dy', -10)
        .attr('text-anchor', 'middle')
        .classed('anchor-middle text-xs fill-text-muted stroke-midground stroke-2', true)
        .attr('paint-order', 'stroke')
    })
}

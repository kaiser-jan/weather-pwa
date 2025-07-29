export function handleInteraction(options: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  onLongPress?: (event: PointerEvent) => void
  onScrollX?: (event: PointerEvent) => void
  onScrollY?: (event: PointerEvent) => void
  onSwipeX?: (event: PointerEvent) => void
  onRelease?: (event: PointerEvent) => void
  longPressTimeout?: number
}) {
  const { svg } = options

  let pointerMode: 'x' | 'y' | 'swipe-x' | null = null
  let startX: number | null = null
  let startY: number | null = null
  let pointerDownTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  svg.on('pointerdown', (event: PointerEvent) => {
    pointerMode = null
    startX = event.clientX
    startY = event.clientY

    pointerDownTimeout = setTimeout(() => {
      if (!startX) return
      pointerMode = 'x'

      options.onLongPress?.(event)
    }, 200)
  })

  svg.on('touchmove', (event) => {
    if (pointerMode === 'x') event.preventDefault()
  })

  svg.on('pointermove', (event: PointerEvent) => {
    clearTimeout(pointerDownTimeout)

    // HACK: allow hover interaction, no pointerdown has occurred
    if (startX === null || startY === null) {
      pointerMode = 'x'
    } else if (!pointerMode) {
      const dx = Math.abs(event.clientX - startX)
      const dy = Math.abs(event.clientY - startY)
      if (dx + dy > 20) pointerMode = dx > dy ? 'x' : 'y'

      // TODO: reimplement swiping: use distance and time requirement
      // if () {
      //   pointerMode = 'swipe-x'
      //   options.onSwipeX?.(event)
      // }
    }

    if (pointerMode === 'x') {
      event.preventDefault()
      options.onScrollX?.(event)
    }
  })

  svg.on('pointerleave', (event: PointerEvent) => {
    setTimeout(() => {
      pointerMode = null
    }, 10)

    startX = null
    startY = null
    clearTimeout(pointerDownTimeout)
    options.onRelease?.(event)
  })

  svg.on('click', (event: PointerEvent) => {
    if (pointerMode !== null) {
      event.stopPropagation()
    }
  })
}

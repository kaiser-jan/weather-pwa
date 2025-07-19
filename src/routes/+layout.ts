import '../app.css'

export const prerender = true
export const ssr = false

function debugHandler(e: Event) {
  console.log(e.type, 'target:', e.target, 'currentTarget:', e.currentTarget, 'phase:', e.eventPhase)
}

;['click', 'pointerdown', 'pointerup'].forEach(
  (type) => window.addEventListener(type, debugHandler, true), // useCapture = true for capture phase
)

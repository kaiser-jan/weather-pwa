<script lang="ts">
  import { onNavigate } from '$app/navigation'

  // https://svelte.dev/blog/view-transitions
  onNavigate((navigation) => {
    if (!document.startViewTransition) return

    // HACK: disable view transitions for some navigations
    if (onlyQueryChanged(navigation.from?.url, navigation.to?.url)) return

    // HACK: invert the sliding direction so new pages slide in from the right and old ones from the left
    const inverted = navigation.delta ? navigation.delta < 0 : navigation.to?.route.id === '/'

    if (inverted) document.documentElement.classList.add('transition-inverted')
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
        // HACK: wait for the transition to complete, plus some extra time
        setTimeout(() => document.documentElement.classList.remove('transition-inverted'), 400)
      })
    })
  })

  function onlyQueryChanged(from: URL | undefined, to: URL | undefined): boolean {
    if (!from || !to) return false
    return from.origin === to.origin && from.pathname === to.pathname && from.hash === to.hash
  }
</script>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(60px);
    }
  }
  @keyframes slide-from-left {
    from {
      transform: translateX(-60px);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-60px);
    }
  }
  @keyframes slide-to-right {
    to {
      transform: translateX(60px);
    }
  }

  :root:not(.transition-inverted)::view-transition-old(root) {
    animation:
      120ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root:not(.transition-inverted)::view-transition-new(root) {
    animation:
      180ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }

  :root.transition-inverted::view-transition-old(root) {
    animation:
      120ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-right;
  }

  :root.transition-inverted::view-transition-new(root) {
    animation:
      180ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-left;
  }
</style>

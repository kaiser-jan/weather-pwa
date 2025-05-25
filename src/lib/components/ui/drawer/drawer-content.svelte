<script lang="ts">
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'
  import DrawerOverlay from './drawer-overlay.svelte'
  import { cn } from '$lib/utils.js'

  type $$Props = DrawerPrimitive.ContentProps

  let className: $$Props['class'] = undefined
  export { className as class }
</script>

<DrawerPrimitive.Portal>
  <DrawerOverlay />
  <DrawerPrimitive.Content
    class={cn(
      'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border',
      className,
    )}
    {...$$restProps}
  >
    <div class="bg-muted mx-auto mt-4 h-1.5 w-32 rounded-full"></div>
    <slot />
    <div class="h-[env(safe-area-inset-bottom)] max-h-4 shrink-0"></div>
  </DrawerPrimitive.Content>
</DrawerPrimitive.Portal>

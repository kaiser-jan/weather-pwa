<script>
  import { Toaster } from '$lib/components/ui/sonner'
  import { Portal } from 'bits-ui'
</script>

<Portal to="html">
  <Toaster
    position="bottom-center"
    toastOptions={{
      unstyled: true,
      classes: {
        toast:
          'bg-background border-foreground border-2 flex flex-row flex-wrap gap-2 items-center rounded-lg p-3 text-sm z-1000 touch-auto',
        title: 'text-text font-semibold flex flex-row gap-2',
        description: 'text-text-muted italic',
        actionButton: 'bg-foreground rounded-md p-2 h-8 flex items-center hover:bg-primary',
        cancelButton: 'border-foreground border-2 rounded-md p-2 h-8 flex items-center',
        closeButton: 'bg-purple-500',
      },
    }}
  />
</Portal>

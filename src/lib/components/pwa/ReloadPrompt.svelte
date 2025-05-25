<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'

  // replaced dynamically
  const buildDate = __DATE__

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      toast.info('Update available!', {
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: 'Update',
          onClick: () => updateServiceWorker(true),
        },
        description: buildDate,
      })
    },
    onOfflineReady() {
      toast.info('PWA is ready to work offline!')
    },
    // TODO: consider checking for updates again -> but do not auto-update
    // onRegisteredSW(swUrl, registration) { },
    onRegisterError(error) {
      toast.error('Failed to register Service Worker!', { description: error })
    },
  })
</script>

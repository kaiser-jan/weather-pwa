<script lang="ts">
  import type { TextSetting } from '../../types'
  import Input from '$lib/components/ui/input/input.svelte'

  interface Props {
    item: TextSetting
    value: string
    onchange: (v: string) => void
  }

  let { item, value, onchange }: Props = $props()
</script>

<Input bind:value placeholder={item.placeholder} onblur={(e) => onchange((e.target as HTMLInputElement).value)} />

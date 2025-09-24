import { settingsConfig } from '$lib/config/settings'
import { useSettings, type SettingsFromBlueprint } from 'svelte-settings'

import { Button, buttonVariants } from '$lib/components/ui/button'
import Label from '$lib/components/ui/label/label.svelte'
import Input from '$lib/components/ui/input/input.svelte'
import Switch from '$lib/components/ui/switch/switch.svelte'
import LoaderPulsatingRing from '$lib/components/snippets/LoaderPulsatingRing.svelte'
import { Checkbox } from '$lib/components/ui/checkbox'
import * as Popover from '$lib/components/ui/popover'
import * as Accordion from '$lib/components/ui/accordion/index.js'
import * as Select from '$lib/components/ui/select'
import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
import { get } from 'svelte/store'

const components = {
  Accordion,
  Breadcrumb,
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  Select,
  Switch,
  LoaderPulsatingRing,
}

export const settings = useSettings(settingsConfig, {
  // HACK: disable type checking here for performance
  components: components as any,
  style: {
    button: { action: 'secondary', category: 'midground' },
    category: { classes: buttonVariants({ variant: 'midground', class: 'text-base whitespace-wrap' }) },
  },
})

export type Settings = SettingsFromBlueprint<typeof settingsConfig>

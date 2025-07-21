import type { Component } from 'svelte'
import BooleanInput from './components/BooleanInput.svelte'
import SelectInput from './components/SelectInput.svelte'
import NumberInput from './components/NumberInput.svelte'
import MultiSelectInput from './components/MultiSelectInput.svelte'
import ListInput from './components/ListInput.svelte'
import TextInput from './components/TextInput.svelte'

// TODO: refine this type; derive from the settings types
type SettingComponent = Component<
  {
    item: any
    value: any
    onchange: (v: any) => void
    onnavigate: (key: string) => void
  },
  {},
  ''
>

const registry: Record<string, SettingComponent> = {
  select: SelectInput,
  multiselect: MultiSelectInput,
  boolean: BooleanInput,
  number: NumberInput,
  list: ListInput,
  text: TextInput,
  // description: DescriptionBlock,
}

export function getComponent(type: string): SettingComponent {
  return registry[type]
}

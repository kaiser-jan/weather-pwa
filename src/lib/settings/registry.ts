import type { Component } from 'svelte'
import BooleanInput from './components/inputs/BooleanInput.svelte'
import SelectInput from './components/inputs/SelectInput.svelte'
import NumberInput from './components/inputs/NumberInput.svelte'
import MultiSelectInput from './components/inputs/MultiSelectInput.svelte'
import ListInput from './components/inputs/ListInput.svelte'
import TextInput from './components/inputs/TextInput.svelte'

import ValueStatic from './components/inputs/ValueDisplayItem.svelte'

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
  value: ValueStatic,
}

export function getComponent(type: string): SettingComponent {
  return registry[type]
}

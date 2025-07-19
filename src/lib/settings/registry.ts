import type { Component } from 'svelte'
import BooleanInput from './components/BooleanInput.svelte'
import SelectInput from './components/SelectInput.svelte'
import NumberInput from './components/NumberInput.svelte'
import MultiSelectInput from './components/MultiSelectInput.svelte'
import ListInput from './components/ListInput.svelte'
import TextInput from './components/TextInput.svelte'

const registry: Record<string, Component> = {
  select: SelectInput,
  multiselect: MultiSelectInput,
  boolean: BooleanInput,
  number: NumberInput,
  list: ListInput,
  text: TextInput,
  // description: DescriptionBlock,
}

export function getComponent(type: string): Component {
  return registry[type]
}

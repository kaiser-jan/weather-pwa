import type { Component } from 'svelte'
import BooleanInput from './components/BooleanInput.svelte'
import SelectInput from './components/SelectInput.svelte'
import NumberInput from './components/NumberInput.svelte'
import MultiSelectInput from './components/MultiSelectInput.svelte'

const registry: Record<string, Component> = {
  select: SelectInput,
  multiselect: MultiSelectInput,
  boolean: BooleanInput,
  number: NumberInput,
  // description: DescriptionBlock,
}

export function getComponent(type: string): Component {
  return registry[type]
}

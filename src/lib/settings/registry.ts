import type { Component } from 'svelte'

import type { ConfigItem, SettingsInput, SettingsItem, SettingsPage, SettingsWrapper } from './types'

import BasicPageRenderer from './components/pages/BasicPageRenderer.svelte'
import ChangelogPage from './components/pages/ChangelogPage.svelte'
import ListSettingPage from './components/pages/ListSettingPage.svelte'

import BasicItemRenderer from './components/items/BasicItemRenderer.svelte'
import ActionItem from './components/items/ActionItem.svelte'
import DescriptionItem from './components/items/DescriptionItem.svelte'
import PageItem from './components/items/PageItem.svelte'
import NotImplementedItem from './components/items/NotImplementedItem.svelte'
import ValueDisplayItem from './components/items/ValueDisplayItem.svelte'

import GroupWrapper from './components/wrappers/GroupWrapper.svelte'

import BooleanInput from './components/inputs/BooleanInput.svelte'
import SelectInput from './components/inputs/SelectInput.svelte'
import NumberInput from './components/inputs/NumberInput.svelte'
import MultiSelectInput from './components/inputs/MultiSelectInput.svelte'
import MultiSelectReorderInput from './components/inputs/MultiSelectReorderInput.svelte'
import TextInput from './components/inputs/TextInput.svelte'

// TODO: refine this type; derive from the settings types
type SettingComponent = Component<
  {
    item: any
    onnavigate: (path: string[]) => void
    path: string[]
  },
  {},
  ''
>
type SettingComponentInput = Component<
  {
    item: any
    value: any
    onchange: (v: any) => void
    onnavigate: (path: string[]) => void
    path: string[]
  },
  {},
  ''
>

// TODO: consider making this a real one-source-of-truth registry, where each component is registered, e.g.
// { key: 'changelog', type: 'page', component: ChangelogPage }

const inputs: Record<SettingsInput['type'], SettingComponent> = {
  select: SelectInput,
  multiselect: MultiSelectInput,
  'multiselect-reorder': MultiSelectReorderInput,
  boolean: BooleanInput,
  number: NumberInput,
  text: TextInput,
}
export function getInputComponent(type: SettingsInput['type']): SettingComponentInput {
  return inputs[type]
}
export function isInput(item: ConfigItem): item is SettingsInput {
  return item.type in inputs
}

const pages: Record<SettingsPage['type'], SettingComponent> = {
  changelog: ChangelogPage,
  list: ListSettingPage,
  page: BasicPageRenderer,
}
export function getPageComponent(type: SettingsPage['type']): SettingComponentInput {
  return pages[type]
}
export function isPage(item: ConfigItem): item is SettingsPage {
  return item.type in pages
}

const items: Record<SettingsItem['type'], SettingComponent> = {
  action: ActionItem,
  description: DescriptionItem,
  value: ValueDisplayItem,
  'not-implemented': NotImplementedItem,
}
export function getItemComponent(item: ConfigItem): SettingComponent {
  if (isPage(item)) return PageItem
  if (isInput(item)) return BasicItemRenderer
  if (isItem(item)) return items[item.type]
  if (isWrapper(item)) return wrappers[item.type]

  console.error('Settings item with unknown type: ', item)
  return NotImplementedItem
}
export function isItem(item: ConfigItem): item is SettingsItem {
  return item.type in items
}

const wrappers: Record<SettingsWrapper['type'], SettingComponent> = {
  group: GroupWrapper,
}
export function isWrapper(item: ConfigItem): item is SettingsWrapper {
  return item.type in wrappers
}

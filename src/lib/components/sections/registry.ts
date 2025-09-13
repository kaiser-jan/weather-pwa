import { CalendarDaysIcon, ChevronsRightIcon, ClockIcon, DatabaseIcon, InfoIcon, type SunIcon } from '@lucide/svelte'

type Section = {
  name: string
  icon: typeof SunIcon
  description: string
}

export const SECTIONS = {
  notices: {
    name: 'Notices',
    icon: InfoIcon,
    description: '',
  },
  today: {
    name: 'Today',
    icon: ClockIcon,
    description: '',
  },
  upcoming: {
    name: 'Upcoming',
    icon: CalendarDaysIcon,
    description: '',
  },
  outlook: {
    name: 'Outlook',
    icon: ChevronsRightIcon,
    description: '',
  },
  air_pollution: {
    name: 'Air Pollution',
    icon: CalendarDaysIcon,
    description: '',
  },
  sources: {
    name: 'Data Sources',
    icon: DatabaseIcon,
    description: '',
  },
} as const satisfies Record<string, Section>

export type SectionId = keyof typeof SECTIONS

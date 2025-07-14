import { type Icon as IconType, BriefcaseIcon, HomeIcon, MapPinIcon } from '@lucide/svelte'

// TODO:
export const iconMap: Record<string, typeof IconType> = {
  home: HomeIcon,
  briefcase: BriefcaseIcon,
  'map-pin': MapPinIcon,
}

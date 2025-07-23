import {
  type Icon as IconType,
  BriefcaseIcon,
  BuildingIcon,
  CarIcon,
  HeartIcon,
  HomeIcon,
  MapPinIcon,
  PlaneIcon,
  SchoolIcon,
  TreePalmIcon,
  TreesIcon,
} from '@lucide/svelte'

// TODO:
export const iconMap: Record<string, typeof IconType> = {
  home: HomeIcon,
  briefcase: BriefcaseIcon,
  'map-pin': MapPinIcon,
  building: BuildingIcon,
  school: SchoolIcon,
  trees: TreesIcon,
  heart: HeartIcon,
  'tree-palm': TreePalmIcon,
  plane: PlaneIcon,
  car: CarIcon,
}

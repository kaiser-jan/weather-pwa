import inca from './loaders/inca'
import nowcast from './loaders/nowcast'
import nwp from './loaders/nwp'
import nwpOffset from './loaders/nwp-offset'

export const loaders = [nowcast, nwp, nwpOffset, inca] as const

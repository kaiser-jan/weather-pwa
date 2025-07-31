import chem9km from './loaders/chem-9km'
import chem3km from './loaders/chem-3km'
import inca from './loaders/inca'
import nowcast from './loaders/nowcast'
import nwp from './loaders/nwp'
import nwpOffset from './loaders/nwp-offset'

export const loaders = [nowcast, nwp, nwpOffset, inca, chem3km, chem9km] as const

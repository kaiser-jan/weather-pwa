import type { WeatherSituation } from '../symbols.ts'

// prettier-ignore
export const symbolToWeatherSituationMap: Record<number, WeatherSituation> = {
  1:  { cloudiness: 'clear', timeOfDay: 'day' },                        // Wolkenlos                        // –
  2:  { cloudiness: 'partly', timeOfDay: 'day' },                      // Heiter                           // –
  3:  { cloudiness: 'cloudy' },                                        // Wolkig                           // –
  4:  { cloudiness: 'overcast' },                                      // Stark bewölkt                    // –
  5:  { cloudiness: 'overcast' },                                      // Bedeckt                          // bedeckt === stark bewölkt?
  6:  { mist: true },                                                  // Bodennebel                       // unsure
  7:  { fog: true },                                                   // Hochnebel                        // unsure
  8:  { precipitation: 'drizzle', intensity: 'light' },                // Leichter Regen                   // –
  9:  { precipitation: 'rain', intensity: 'moderate' },                // Mäßiger Regen                    // –
 10:  { precipitation: 'rain', intensity: 'heavy' },                   // Starker Regen                    // no strong rain icon
 11:  { precipitation: 'sleet' },                                      // Schneeregen                      // –
 12:  { precipitation: 'sleet' },                                      // Schneeregen                      // –
 13:  { precipitation: 'sleet' },                                      // Schneeregen                      // –
 14:  { precipitation: 'snow', intensity: 'light' },                   // Leichter Schneefall              // -
 15:  { precipitation: 'snow', intensity: 'moderate' },                // Mäßiger Schneefall               // –
 16:  { precipitation: 'snow', intensity: 'heavy' },                   // Starker Schneefall               // no strong snow icon
 17:  { precipitation: 'rain' },                                       // Regenschauer                     // "schauer" aspect lost
 18:  { precipitation: 'rain' },                                       // Regenschauer                     // "schauer" aspect lost
 19:  { precipitation: 'rain', intensity: 'heavy' },                   // Starker Regenschauer             // "schauer" aspect lost
 20:  { precipitation: 'sleet' },                                      // Schneeregenschauer               // "schauer" aspect lost
 21:  { precipitation: 'sleet' },                                      // Schneeregenschauer               // "schauer" aspect lost
 22:  { precipitation: 'sleet' },                                      // Schneeregenschauer               // "schauer" aspect lost
 23:  { precipitation: 'snow' },                                       // Schneeschauer                    // "schauer" aspect lost
 24:  { precipitation: 'snow' },                                       // Schneeschauer                    // "schauer" aspect lost
 25:  { precipitation: 'snow', intensity: 'heavy' },                   // Starker Schneeschauer            // "schauer" aspect lost
 26:  { thunder: true },                                               // Gewitter                         // –
 27:  { thunder: true },                                               // Gewitter                         // –
 28:  { thunder: true },                                               // Starkes Gewitter                 // no strong variant
 29:  { thunder: true, precipitation: 'sleet' },                       // Gewitter mit Schneeregen         // sleet aspect lost
 30:  { thunder: true, precipitation: 'sleet' },                       // Starkes Gewitter mit Schneeregen // sleet aspect lost
 31:  { thunder: true, precipitation: 'snow' },                        // Gewitter mit Schneefall          // –
 32:  { thunder: true, precipitation: 'snow' }                         // Starkes Gewitter mit Schneefall  // no strong variant
};

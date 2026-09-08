// Shared place-value naming, matching the Hungarian textbook convention:
// classes grouped in threes (egyesek/ezresek/milliók/...), lowercase
// abbreviations within the ones class, uppercase from thousands up.
const CLASS_NAMES = ['Egyesek', 'Ezresek', 'Milliók', 'Milliárdok']
const LOWER_ABBR = ['e', 't', 'sz']
const UPPER_ABBR = ['E', 'T', 'Sz']

// Full denomination name at a given place (1 = egyes, 2 = tízes, ...).
const DENOMINATION_NAMES = [
  'egyes', 'tízes', 'százas', 'ezres', 'tízezres', 'százezres', 'milliós', 'tízmilliós', 'százmilliós',
]

// The vowel-harmony-correct suffixed form of the denomination one place
// higher, as used when saying "exchanged into an X" (e.g. "9 százasra",
// "2 ezresre", "4 tízezresre").
const EXCHANGE_TARGET_SUFFIXED = [
  'tízesre', 'százasra', 'ezresre', 'tízezresre', 'százezresre', 'milliósra', 'tízmilliósra', 'százmilliósra',
]

// Plural form used for "the X drawer" (e.g. "az egyesek fiókjában",
// "a tízesek fiókjában") — hardcoded rather than derived, since Hungarian
// plural vowel harmony isn't a simple suffix rule for this word set.
const PLURAL_NAMES = [
  'egyesek', 'tízesek', 'százasok', 'ezresek', 'tízezresek', 'százezresek', 'milliósok', 'tízmilliósok', 'százmilliósok',
]

/**
 * Which class (egyesek/ezresek/milliók) and abbreviation a given place
 * (1 = egyes, 2 = tízes, 3 = százas, 4 = ezres, ...) belongs to.
 */
export function describePlace(place) {
  const classIndex = Math.floor((place - 1) / 3)
  const subIndex = (place - 1) % 3
  return {
    place,
    classIndex,
    className: CLASS_NAMES[classIndex],
    abbr: (classIndex === 0 ? LOWER_ABBR : UPPER_ABBR)[subIndex],
  }
}

export function denominationName(place) {
  return DENOMINATION_NAMES[place - 1]
}

export function exchangeTargetSuffixed(place) {
  return EXCHANGE_TARGET_SUFFIXED[place - 1]
}

export function drawerPluralName(place) {
  return PLURAL_NAMES[place - 1]
}

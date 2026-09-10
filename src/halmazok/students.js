// A single fixed class roster and "adatlap" (data sheet), shared by
// every Halmazok exercise — deliberately static, not regenerated per
// session. A student's real attributes have to stay the same for the
// reference sheet to mean anything across rounds, and for a set of
// invented names to read as one consistent (fictional) class rather
// than a fresh cast each time. Also a fresh, invented roster — no
// overlap with any specific textbook's named characters.
export const STUDENTS = [
  { id: 'Anna', label: 'Anna', gender: 'F' },
  { id: 'Márk', label: 'Márk', gender: 'M' },
  { id: 'Luca', label: 'Luca', gender: 'F' },
  { id: 'Bálint', label: 'Bálint', gender: 'M' },
  { id: 'Nóra', label: 'Nóra', gender: 'F' },
  { id: 'Ábel', label: 'Ábel', gender: 'M' },
  { id: 'Flóra', label: 'Flóra', gender: 'F' },
  { id: 'Kristóf', label: 'Kristóf', gender: 'M' },
]

// Short text badges rather than emoji: flag/pictogram emoji render
// inconsistently across platforms (Windows shows country flags as
// literal letter codes, and some glyphs get font-substituted into an
// unrelated symbol), so plain text is the only look guaranteed to be
// the same everywhere.
export const PROPERTIES = [
  { key: 'bike', label: 'kerékpárral jár iskolába', icon: 'KP' },
  { key: 'english', label: 'angolul tanul', icon: 'ANG' },
  { key: 'swim', label: 'úszásra jár', icon: 'ÚSZ' },
  { key: 'football', label: 'focizik', icon: 'FOCI' },
]

// Hand-picked (not random) so every property, and every pair of
// properties' four regions (A-only/B-only/both/neither), has at least
// one student — no degenerate all-or-nothing case to stumble into.
export const STUDENT_DATA = {
  Anna: { bike: true, english: true, swim: false, football: false },
  Márk: { bike: false, english: true, swim: true, football: true },
  Luca: { bike: true, english: false, swim: true, football: false },
  Bálint: { bike: false, english: false, swim: false, football: true },
  Nóra: { bike: true, english: true, swim: true, football: false },
  Ábel: { bike: false, english: true, swim: false, football: true },
  Flóra: { bike: true, english: false, swim: true, football: true },
  Kristóf: { bike: false, english: false, swim: false, football: false },
}

/** `{ [studentId]: boolean }` for one property, from the fixed data sheet. */
export function valuesFor(propertyKey) {
  return Object.fromEntries(STUDENTS.map((s) => [s.id, STUDENT_DATA[s.id][propertyKey]]))
}

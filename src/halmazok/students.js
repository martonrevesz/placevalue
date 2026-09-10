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

// Each attribute is really a choice between named alternatives, not a
// yes/no flag — a student who "doesn't learn English" learns German,
// they're never just absent from a trait. Every student picks exactly
// one option per category.
export const CATEGORIES = [
  {
    key: 'transport',
    options: [
      { key: 'bike', label: 'kerékpárral jár iskolába' },
      { key: 'walk', label: 'gyalog jár iskolába' },
    ],
  },
  {
    key: 'language',
    options: [
      { key: 'english', label: 'angolul tanul' },
      { key: 'german', label: 'németül tanul' },
    ],
  },
  {
    key: 'sport',
    options: [
      { key: 'swim', label: 'úszásra jár' },
      { key: 'football', label: 'focizik' },
    ],
  },
]

// The flat list of everything a task can test set-membership of — one
// option from one category (e.g. "learns English"). A OnePropertyTask
// round tests one of these; a TwoPropertiesTask round tests a pair.
export const PROPERTIES = CATEGORIES.flatMap((category) =>
  category.options.map((option) => ({
    key: option.key,
    label: option.label,
    categoryKey: category.key,
  })),
)

// Hand-picked (not random): every one of the 8 combinations of the 3
// categories appears exactly once, so any property (or any pair drawn
// from two different categories) splits the class exactly in half —
// no degenerate all-or-nothing case to stumble into.
export const STUDENT_DATA = {
  Anna: { transport: 'bike', language: 'english', sport: 'swim' },
  Márk: { transport: 'bike', language: 'english', sport: 'football' },
  Luca: { transport: 'bike', language: 'german', sport: 'swim' },
  Bálint: { transport: 'bike', language: 'german', sport: 'football' },
  Nóra: { transport: 'walk', language: 'english', sport: 'swim' },
  Ábel: { transport: 'walk', language: 'english', sport: 'football' },
  Flóra: { transport: 'walk', language: 'german', sport: 'swim' },
  Kristóf: { transport: 'walk', language: 'german', sport: 'football' },
}

/** `{ [studentId]: boolean }` for one property (an option key), from the fixed data sheet. */
export function valuesFor(propertyKey) {
  const property = PROPERTIES.find((p) => p.key === propertyKey)
  return Object.fromEntries(
    STUDENTS.map((s) => [s.id, STUDENT_DATA[s.id][property.categoryKey] === propertyKey]),
  )
}

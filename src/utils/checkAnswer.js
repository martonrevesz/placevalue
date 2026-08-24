// Hungarian written-number normalization/checking (e.g. "száz" vs
// "egyszáz") lives in ./hungarianNumberWords.js — a separate utility,
// since it compares normalized strings rather than numbers.

/**
 * Normalizes a numeric-ish value into a canonical number for
 * comparison. Accepts a plain number, a numeric string, or an array of
 * per-digit values (e.g. the `values` state of an interactive
 * PlaceValueTable). Returns null if the value can't be turned into a
 * complete number — including an array with empty/unfilled cells.
 */
export function toComparableNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (Array.isArray(value)) {
    if (value.some((d) => d === null || d === undefined || d === '')) {
      return null
    }
    return toComparableNumber(value.join(''))
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '' || !/^\d+$/.test(trimmed)) return null
    return Number(trimmed)
  }

  return null
}

/**
 * Generic correct/incorrect check for numeric and structured (digit
 * array) answers. An incomplete structured answer (still has empty
 * cells) is simply incorrect, not an error.
 */
export function checkAnswer(actual, expected) {
  const a = toComparableNumber(actual)
  const b = toComparableNumber(expected)
  if (a === null || b === null) return false
  return a === b
}

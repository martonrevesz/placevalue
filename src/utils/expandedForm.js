/**
 * Place-value terms of a natural number, most significant first, with
 * zero digits omitted entirely (a zero digit contributes nothing to the
 * expanded form, e.g. 4067 -> [4000, 60, 7], never a spurious "+0").
 */
export function expandedTerms(number) {
  const digits = String(number).split('')
  return digits
    .map((d, i) => Number(d) * 10 ** (digits.length - 1 - i))
    .filter((term) => term !== 0)
}

/**
 * Canonical expanded-form string for display, e.g. 4067 -> "4000 + 60 + 7".
 */
export function numberToExpandedForm(number) {
  return expandedTerms(number).join(' + ')
}

/**
 * Whether a student's typed expanded-form text is a correct decomposition
 * of `targetNumber` — same set of place-value terms as
 * `expandedTerms(targetNumber)`, term order doesn't matter, but every
 * term must be present exactly once (so e.g. "4000+567" for 4567 is
 * rejected: correct sum, but not fully expanded).
 */
export function checkExpandedForm(studentText, targetNumber) {
  const studentTerms = String(studentText)
    .split('+')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map(Number)

  if (studentTerms.some((t) => !Number.isFinite(t))) return false

  const target = [...expandedTerms(targetNumber)].sort((a, b) => b - a)
  const student = [...studentTerms].sort((a, b) => b - a)

  if (student.length !== target.length) return false
  return student.every((t, i) => t === target[i])
}

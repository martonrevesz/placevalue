const UNITS = ['', 'egy', 'kettő', 'három', 'négy', 'öt', 'hat', 'hét', 'nyolc', 'kilenc']
const TEENS = [
  'tíz', 'tizenegy', 'tizenkettő', 'tizenhárom', 'tizennégy',
  'tizenöt', 'tizenhat', 'tizenhét', 'tizennyolc', 'tizenkilenc',
]
const TENS = ['', '', 'húsz', 'harminc', 'negyven', 'ötven', 'hatvan', 'hetven', 'nyolcvan', 'kilencven']

function wordsUnder100(n) {
  if (n === 0) return ''
  if (n < 10) return UNITS[n]
  if (n < 20) return TEENS[n - 10]
  const tensDigit = Math.floor(n / 10)
  const unit = n % 10
  if (unit === 0) return TENS[tensDigit]
  if (tensDigit === 2) return `huszon${UNITS[unit]}`
  return TENS[tensDigit] + UNITS[unit]
}

function wordsUnder1000(n) {
  if (n === 0) return ''
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  let result = ''
  if (hundreds === 1) result = 'száz'
  else if (hundreds === 2) result = 'kétszáz'
  else if (hundreds > 0) result = UNITS[hundreds] + 'száz'
  return result + wordsUnder100(rest)
}

// A magnitude group (0-999) attached to 'ezer' or 'millió'. Hungarian
// drops "egy" entirely when the group is exactly 1 (ezer -> "ezer",
// not "egyezer") — except before "millió", which keeps it
// ("egymillió"). "kettő" always shortens to "két" right before a
// magnitude word, whatever the rest of the group is (tizenkettő ->
// tizenkétezer), so that's handled as a plain suffix swap.
function groupWithMagnitude(group, magnitudeWord, dropsEgy) {
  if (group === 0) return ''
  if (group === 1) return dropsEgy ? magnitudeWord : `egy${magnitudeWord}`
  let word = wordsUnder1000(group)
  if (word.endsWith('kettő')) word = `${word.slice(0, -'kettő'.length)}két`
  return word + magnitudeWord
}

/**
 * Canonical Hungarian spelled-out form of a natural number, following
 * standard orthography: a hyphen precedes a segment that trails a
 * magnitude word (e.g. "hatszázharmincezer-tíz", "hárommillió-kettőezer"),
 * but a magnitude word with nothing after it stays plain ("kétezer", not
 * "kétezer-"). The hyphen is graded, not decorative — see
 * normalizeWrittenNumber. Handles numbers up to 999,999,999.
 */
export function numberToHungarianWords(n) {
  if (n === 0) return 'nulla'

  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const remainder = n % 1000

  const parts = [
    groupWithMagnitude(millions, 'millió', false),
    groupWithMagnitude(thousands, 'ezer', true),
    wordsUnder1000(remainder),
  ].filter(Boolean)

  return parts.join('-')
}

/**
 * Normalizes student-typed written-number text for comparison:
 * lowercase, strip whitespace, and accept known equivalent forms a
 * student might reasonably write instead of the canonical one:
 *   - "kettő" -> "két" right before száz/ezer/millió (e.g. "kettőezer"
 *     for "kétezer") — always a safe rewrite, "kettő" is never
 *     actually correct in that position.
 *   - "egyszáz" -> "száz" anywhere — the hundreds digit is always a
 *     single digit directly before "száz", so this is unambiguous.
 *   - "egyezer" -> "ezer", but only at the very start of the text or
 *     right after "millió" (optionally with the mandated hyphen in
 *     between, e.g. "millió-egyezer") — i.e. only when "egy" is the
 *     *whole* thousands group, not the trailing digit of a larger one
 *     (like "hetvenegyezer" for 71 000, which must NOT be touched).
 *
 * Hyphens are deliberately NOT stripped: standard orthography requires
 * one before a segment that trails a magnitude word (see
 * numberToHungarianWords), so "háromszázharminckilencezerötvenhárom"
 * (missing the hyphen before "ötvenhárom") is wrong, not just
 * differently styled — only "...ezer-ötvenhárom" is accepted.
 */
export function normalizeWrittenNumber(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/kettő(száz|ezer|millió)/g, 'két$1')
    .replace(/egyszáz/g, 'száz')
    .replace(/(^|millió-?)egyezer/g, '$1ezer')
}

/**
 * Whether a student's written-number answer matches the target
 * number, tolerant of the equivalent forms normalizeWrittenNumber
 * handles.
 */
export function checkWrittenNumber(studentText, targetNumber) {
  const canonical = normalizeWrittenNumber(numberToHungarianWords(targetNumber))
  return normalizeWrittenNumber(studentText) === canonical
}

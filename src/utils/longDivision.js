// Pure logic for written division in the Hungarian subtraction form
// (the products are written out and subtracted, not "pótlás fejben").
// No React here — WrittenDivision.jsx renders the layout built below,
// WrittenDivisionTask.jsx drives a round.
//
// Columns are dividend-digit indices: column i is the i-th digit of the
// dividend, left to right. Every step's partial dividend ends at
// `endCol` (the digit that carries the tick), and its product and
// remainder are right-aligned to that same column.

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function computeLongDivision(dividend, divisor) {
  const digits = String(dividend).split('').map(Number)
  let endCol = 0
  let partial = digits[0]
  while (partial < divisor && endCol < digits.length - 1) {
    endCol += 1
    partial = partial * 10 + digits[endCol]
  }

  const steps = []
  for (;;) {
    const digit = Math.floor(partial / divisor)
    const product = digit * divisor
    const remainder = partial - product
    const width = String(partial).length
    steps.push({ partial, digit, product, remainder, startCol: endCol - width + 1, endCol })
    if (endCol === digits.length - 1) break
    endCol += 1
    partial = remainder * 10 + digits[endCol]
  }

  return { quotient: Math.floor(dividend / divisor), remainder: dividend % divisor, steps }
}

/**
 * A random dividend/divisor pair with the given digit counts. Quotients
 * containing a 0 digit are skipped for now — they need a step with no
 * subtraction row, a different shape than every other step. About half
 * the problems divide exactly; the rest leave a remainder.
 */
export function generateDivisionProblem(dividendDigits, divisorDigits) {
  const divisorMin = divisorDigits === 1 ? 2 : 10 ** (divisorDigits - 1) + 1
  const divisorMax = 10 ** divisorDigits - 1
  const dividendMin = 10 ** (dividendDigits - 1)
  const dividendMax = 10 ** dividendDigits - 1

  let problem = null
  for (let attempt = 0; attempt < 1000; attempt++) {
    const divisor = randomInt(divisorMin, divisorMax)
    let dividend
    if (Math.random() < 0.5) {
      const quotientMin = Math.ceil(dividendMin / divisor)
      const quotientMax = Math.floor(dividendMax / divisor)
      if (quotientMin > quotientMax) continue
      dividend = divisor * randomInt(quotientMin, quotientMax)
    } else {
      dividend = randomInt(dividendMin, dividendMax)
    }
    problem = { dividend, divisor, ...computeLongDivision(dividend, divisor) }
    if (problem.steps.every((step) => step.digit > 0)) return problem
  }
  return problem
}

// --- Becslés (estimation by rounding, as in the textbooks) -------------
// The divisor is rounded to the nearest ten (a one-digit divisor stays as
// it is); the dividend to any "round" number that's easy to divide in
// your head — so compatible numbers like 7500 : 30 count too, not only
// strict nearest-hundred rounding.

export function roundDivisorForEstimate(divisor) {
  return divisor < 10 ? divisor : Math.round(divisor / 10) * 10
}

// Wide enough for compatible numbers a textbook would use (2502 : 68 ≈
// 2800 : 70 = 40 is 12% off on the dividend, but a perfectly good estimate).
const ROUNDED_DIVIDEND_TOLERANCE = 0.2

/** At most two non-zero leading digits, and within 20% of the dividend. */
export function isReasonableRoundedDividend(value, dividend) {
  if (!Number.isInteger(value) || value <= 0) return false
  const leadingDigits = String(value).replace(/0+$/, '')
  return leadingDigits.length <= 2 && Math.abs(value - dividend) <= dividend * ROUNDED_DIVIDEND_TOLERANCE
}

/** The quotient of the student's own rounded numbers — whole, or rounded to a whole number. */
export function isAcceptedEstimateQuotient(value, roundedDividend, roundedDivisor) {
  if (!roundedDivisor) return false
  const exact = roundedDividend / roundedDivisor
  return value === exact || value === Math.floor(exact) || value === Math.round(exact)
}

/**
 * A model estimate to show after a wrong one: the round number closest
 * to the dividend that divides evenly by the rounded divisor, or simply
 * the closest round number if none does.
 */
export function suggestEstimate(dividend, divisor) {
  const roundedDivisor = roundDivisorForEstimate(divisor)
  const unit = 10 ** Math.max(String(dividend).length - 2, 0)
  const candidates = []
  for (let value = unit; value <= dividend * (1 + ROUNDED_DIVIDEND_TOLERANCE); value += unit) {
    if (isReasonableRoundedDividend(value, dividend)) candidates.push(value)
  }
  const byDistance = (a, b) => Math.abs(a - dividend) - Math.abs(b - dividend)
  const divisible = candidates.filter((value) => value % roundedDivisor === 0).sort(byDistance)
  const roundedDividend = divisible[0] ?? candidates.sort(byDistance)[0] ?? dividend
  return {
    roundedDividend,
    roundedDivisor,
    quotient: Math.round(roundedDividend / roundedDivisor),
    exact: roundedDividend % roundedDivisor === 0,
  }
}

/**
 * Where everything sits on the squared-paper grid. Grid column 0 is
 * reserved for the minus sign of the first subtraction, so dividend
 * digit i is grid column i + 1. Row 0 is `dividend : divisor = quotient`;
 * each step k then gets a product row (1 + 2k) and a remainder row
 * (2 + 2k) — the remainder row also holds the lehozott számjegy, which
 * makes it the next step's partial dividend.
 *
 * `fields` are the student's inputs, in writing order: quotient digit,
 * product, remainder, lehozott számjegy, then the next quotient digit.
 * A product or remainder field spans its whole partial dividend's
 * width, so the cell count never gives away how many digits it has.
 */
export function buildDivisionLayout({ dividend, divisor, steps }) {
  const dividendStr = String(dividend)
  const divisorStr = String(divisor)
  const n = dividendStr.length
  const d = divisorStr.length
  const gridCol = (index) => index + 1
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

  const statics = []
  dividendStr.split('').forEach((ch, i) => {
    statics.push({ row: 0, col: gridCol(i), text: ch, dividendIndex: i })
  })
  statics.push({ row: 0, col: n + 1, text: ':' })
  divisorStr.split('').forEach((ch, i) => statics.push({ row: 0, col: n + 2 + i, text: ch }))
  statics.push({ row: 0, col: n + 2 + d, text: '=' })
  const quotientStart = n + 3 + d

  const fields = []
  const lines = []
  steps.forEach((step, k) => {
    const productRow = 1 + 2 * k
    const remainderRow = 2 + 2 * k
    const span = range(gridCol(step.startCol), gridCol(step.endCol))

    fields.push({ id: `q${k}`, kind: 'quotient', step: k, row: 0, cols: [quotientStart + k], expected: String(step.digit) })
    statics.push({ row: productRow, col: gridCol(step.startCol) - 1, text: '−' })
    fields.push({ id: `p${k}`, kind: 'product', step: k, row: productRow, cols: span, expected: String(step.product) })
    lines.push({ row: productRow, fromCol: gridCol(step.startCol) - 1, toCol: gridCol(step.endCol) })
    fields.push({ id: `r${k}`, kind: 'remainder', step: k, row: remainderRow, cols: span, expected: String(step.remainder) })
    if (k < steps.length - 1) {
      const dividendIndex = step.endCol + 1
      fields.push({
        id: `l${k}`,
        kind: 'lehozott',
        step: k,
        row: remainderRow,
        cols: [gridCol(dividendIndex)],
        dividendIndex,
        expected: dividendStr[dividendIndex],
      })
    }
  })

  return {
    columns: quotientStart + steps.length,
    rows: 1 + 2 * steps.length,
    statics,
    fields,
    lines,
    firstTickIndex: steps[0].endCol,
  }
}

// --- Entering digits -----------------------------------------------------
// A field's value is stored cell by cell (an array as wide as the field,
// '' for an empty cell), so a typed digit never moves. The product row
// is written left to right, like reading the product off ("1 · 24 =
// 24"); the remainder row is worked out by completion (pótlás) from the
// units, so right to left. Single-cell fields don't care.

/** The digits in a field as a number string; '' if empty, null if they have a gap. */
export function fieldText(cells) {
  const raw = (cells ?? []).map((c) => c || ' ').join('').trim()
  return raw.includes(' ') ? null : raw
}

export function isLeftToRight(field) {
  return field.kind === 'product'
}

/**
 * The cell the first digit of a field goes into. A remainder starts at
 * its units cell. A product starts where it has to begin to end under
 * the partial dividend's last digit — its width follows from the
 * student's OWN quotient digit (q · divisor), so this says nothing about
 * whether that digit is right. Without a quotient digit yet, it starts
 * at the leftmost cell.
 */
export function firstCell(field, values, divisor) {
  if (!isLeftToRight(field)) return field.cols.length - 1
  const quotientDigit = fieldText(values[`q${field.step}`])
  if (!quotientDigit) return 0
  const width = String(Number(quotientDigit) * divisor).length
  return Math.max(field.cols.length - width, 0)
}

/**
 * The partial dividend a product field is computed from — the static
 * first one for step 0, otherwise whatever the student wrote on the
 * previous remainder row (remainder + lehozott számjegy). Null when that
 * row isn't complete yet.
 */
export function studentPartial(step, steps, values) {
  if (step === 0) return steps[0].partial
  const remainder = fieldText(values[`r${step - 1}`])
  const lehozott = fieldText(values[`l${step - 1}`])
  if (!remainder || !lehozott) return null
  return Number(remainder + lehozott)
}

/**
 * Whether typing into `field` is clearly finished, so focus can move on
 * by itself: the next cell would fall outside the field, or one more
 * digit would break the arithmetic — a product can't exceed its partial
 * dividend, a remainder can't reach the divisor. Those are the rules
 * themselves, not hints about this problem's answer. (A remainder grows
 * leftward, so the smallest number one more digit could make is
 * 10^len + value; a product grows rightward, so it's value · 10.)
 */
export function isFieldFinished(field, cells, nextCell, { divisor, steps, values }) {
  if (nextCell < 0 || nextCell >= field.cols.length) return true
  const text = fieldText(cells)
  if (!text) return false
  const value = Number(text)
  if (field.kind === 'remainder') return 10 ** text.length + value >= divisor
  if (field.kind === 'product') {
    const partial = studentPartial(field.step, steps, values)
    return partial !== null && value * 10 > partial
  }
  return false
}

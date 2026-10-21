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
    statics.push({ row: productRow, col: gridCol(step.startCol) - 1, text: '−', step: k })
    fields.push({ id: `p${k}`, kind: 'product', step: k, row: productRow, cols: span, expected: String(step.product) })
    lines.push({ row: productRow, fromCol: gridCol(step.startCol) - 1, toCol: gridCol(step.endCol), step: k })
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
// '' for an empty cell), so a typed digit never moves. Every row is
// typed right to left, from its units cell: the product row because
// written multiplication starts with the ones, the remainder row because
// the subtraction (by completion) does too.

/**
 * The digits in a field as a number string; '' if empty. Null if they
 * have a gap or don't reach the units cell — a number written one
 * column too far left is a different number, not the same one.
 */
export function fieldText(cells) {
  const raw = (cells ?? []).map((c) => c || ' ').join('').trimStart()
  return raw.includes(' ') ? null : raw
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
 * The carries of a subtraction done by completion (pótlás), right to
 * left: `carries[j]` is true when a 1 is carried INTO column j — the
 * small 1 written at the top right of the product's digit there. Both
 * numbers are right-aligned in `width` columns. Null if they don't fit
 * or the product is larger (nothing sensible to show then).
 */
export function subtractionCarries(partial, product, width) {
  const top = String(partial).padStart(width, '0')
  const bottom = String(product).padStart(width, '0')
  if (top.length > width || bottom.length > width || product > partial) return null
  const carries = Array(width).fill(false)
  let carry = 0
  for (let j = width - 1; j >= 0; j--) {
    carry = Number(bottom[j]) + carry > Number(top[j]) ? 1 : 0
    if (j > 0) carries[j - 1] = carry === 1
  }
  return carries
}

// "…-ban/-ben" forms of the place names, by place (0 = egyes).
const PLACE_NAMES_IN = ['egyesben', 'tízesben', 'százasban', 'ezresben', 'tízezresben']

/**
 * What question the given field answers, worded with the student's OWN
 * numbers so far (their partial dividend, their quotient digit, their
 * product) — so it explains the step without giving away its answer.
 */
export function fieldQuestion(field, { divisor, steps, values }) {
  const textOf = (id) => {
    const text = fieldText(values[id])
    return text ? String(Number(text)) : null
  }
  const partial = studentPartial(field.step, steps, values)
  if (field.kind === 'quotient') {
    if (partial === null) return 'Előbb fejezd be az előző sort!'
    // The partial dividend counts units of the place its last digit sits
    // in — 77 százas, 338 tízes — which is why this quotient digit has
    // that same place value.
    const place = steps.at(-1).endCol - steps[field.step].endCol
    return `Hányszor van meg ${partial} ${PLACE_NAMES_IN[place]} az osztó? (${partial} : ${divisor})`
  }
  if (field.kind === 'product') {
    const digit = textOf(`q${field.step}`)
    if (!digit) return 'Előbb írd be a hányados jegyét!'
    return `${digit} · ${divisor} = ? (A hányados jegyét szorozd meg az osztóval.)`
  }
  if (field.kind === 'remainder') {
    const product = textOf(`p${field.step}`)
    if (partial === null) return 'Előbb fejezd be az előző sort!'
    if (!product) return 'Előbb írd be a szorzatot!'
    return `${partial} − ${product} = ? (Vond ki a szorzatot a fölötte lévő számból.)`
  }
  return 'Hozd le az osztandó következő jegyét!'
}

/**
 * How many fields (a prefix, in writing order) the student has reached:
 * the first one always, then each next one once the field before it
 * has any digit — so rows appear one at a time as the work proceeds
 * instead of the whole grid facing the student from the start.
 */
export function reachedFieldCount(fields, values) {
  let count = 1
  while (count < fields.length && values[fields[count - 1].id]?.some(Boolean)) count += 1
  return count
}

/**
 * Whether typing into `field` is clearly finished, so focus can move on
 * by itself: the field is full, or one more digit would break the
 * arithmetic — a product can't exceed its partial dividend, a remainder
 * can't reach the divisor. Those are the rules themselves, not hints
 * about this problem's answer. Digits are added on the left, so the
 * smallest number one more digit could make is 10^len + value.
 */
export function isFieldFinished(field, cells, { divisor, steps, values }) {
  const text = fieldText(cells)
  if (!text) return false
  if (text.length >= field.cols.length) return true
  const smallestLonger = 10 ** text.length + Number(text)
  if (field.kind === 'remainder') return smallestLonger >= divisor
  if (field.kind === 'product') {
    const partial = studentPartial(field.step, steps, values)
    return partial !== null && smallestLonger > partial
  }
  return false
}

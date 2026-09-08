import { denominationName, drawerPluralName, exchangeTargetSuffixed } from './placeInfo'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Accusative suffix for a multiple of ten, written digit-first as the
// textbook does ("20-at", "40-et") rather than spelled out — hardcoded
// because the vowel-harmony choice ("-at" vs "-et") isn't a simple rule.
const TEN_MULTIPLE_SUFFIX = { 10: 'et', 20: 'at', 30: 'at', 40: 'et', 50: 'et', 60: 'at', 70: 'et', 80: 'at', 90: 'et' }

// "a" before a consonant, "az" before a vowel (egyesek, ezresek).
function article(word) {
  return /^[aeiouáéíóöőúüű]/i.test(word) ? 'Az' : 'A'
}

/**
 * A Hungarian sentence describing one drawer's step of the exchange,
 * matching the textbook's worked-solution style (e.g. "A tízesek
 * fiókjában 90 tízest bevált 9 százasra, 2 pénz marad.").
 */
export function describeStep(step) {
  const { place, original, carryIn, incoming, exchanged, remainder } = step
  const plural = drawerPluralName(place)
  const name = denominationName(place)
  const a = article(plural)

  if (exchanged === 0) {
    if (carryIn === 0) {
      return `${a} ${plural} fiókjában nem történik beváltás.`
    }
    if (original === 0) {
      return `${a} ${plural} fiókjába ${carryIn} pénz került.`
    }
    return `${a} ${plural} fiókjában ${original} volt, ${carryIn} érkezett hozzá, összesen ${incoming}. Beváltás nem történik.`
  }

  const exchangedAmount = exchanged * 10
  const target = exchangeTargetSuffixed(place)

  if (carryIn === 0) {
    // No earlier clause has named the denomination yet, so this one
    // does: "90 tízest bevált 9 százasra" (numeral + denomination in
    // the accusative, e.g. tízes -> tízest).
    return `${a} ${plural} fiókjában ${exchangedAmount} ${name}t bevált ${exchanged} ${target}, ${remainder} pénz marad.`
  }

  // The denomination was already named via "van", so "ebből" now takes
  // just the accusative numeral itself, digit-first (20 -> 20-at, 40 -> 40-et).
  const suffix = TEN_MULTIPLE_SUFFIX[exchangedAmount] ?? 'et'
  return `${a} ${plural} fiókjában ${original}+${carryIn}=${incoming} ${name} van, ebből ${exchangedAmount}-${suffix} bevált ${exchanged} ${target}, ${remainder} pénz marad.`
}

/**
 * Simulates the perfect cash register: given a raw deposit count per
 * drawer (index 0 = ones/egyes, index 1 = tens/tízes, ...), cascades
 * every group of ten upward into the next drawer, exactly like the
 * register in the textbook example. `deposits[i]` need not be a single
 * digit — that's the whole point, it's what forces an exchange.
 *
 * Returns the final (single-digit-per-drawer) counts, a `steps` log for
 * the per-drawer explanation, and any `carryOverflow` left over after
 * the highest drawer in play (should be 0 for a well-formed round —
 * an overflow means the number needs a drawer beyond what's shown).
 */
export function resolveExchanges(deposits) {
  const steps = []
  const finalCounts = []
  let carry = 0

  for (let i = 0; i < deposits.length; i++) {
    const place = i + 1
    const original = deposits[i]
    const carryIn = carry
    const incoming = original + carryIn
    const exchanged = Math.floor(incoming / 10)
    const remainder = incoming % 10

    steps.push({ place, original, carryIn, incoming, exchanged, remainder })
    finalCounts.push(remainder)
    carry = exchanged
  }

  return { finalCounts, steps, carryOverflow: carry }
}

export function finalNumberFromCounts(finalCounts) {
  return finalCounts.reduce((sum, count, i) => sum + count * 10 ** i, 0)
}

const MIN_EXCHANGES = 1
const MAX_EXCHANGES = 3

/**
 * Generates a round: `drawerCount` raw deposits that resolve cleanly
 * (no overflow beyond the drawers in play), with some non-top drawers
 * inflated past 9 to force real exchanges — the trivial "already valid,
 * no exchange" case isn't interesting enough to generate. The number of
 * drawers that actually end up exchanging is kept to 1-3, even though
 * cascading carries could in principle ripple through every drawer —
 * too many at once stops testing the concept and starts testing
 * bookkeeping stamina.
 */
export function generateRound(drawerCount) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const deposits = []
    for (let i = 0; i < drawerCount; i++) {
      const isTop = i === drawerCount - 1
      if (isTop) {
        deposits.push(randomInt(1, 9))
        continue
      }
      const inflate = Math.random() < 0.55
      deposits.push(inflate ? randomInt(10, 40) : randomInt(0, 9))
    }

    const resolved = resolveExchanges(deposits)
    const exchangeCount = resolved.steps.filter((step) => step.exchanged > 0).length
    if (resolved.carryOverflow === 0 && exchangeCount >= MIN_EXCHANGES && exchangeCount <= MAX_EXCHANGES) {
      return { deposits, ...resolved, finalNumber: finalNumberFromCounts(resolved.finalCounts) }
    }
  }

  // Fallback: force exactly one exchange in the lowest drawer. The top
  // drawer is capped at 8 (not 9) so it can never overflow even if it
  // receives a carry-in of 1.
  const deposits = Array.from({ length: drawerCount }, (_, i) => {
    if (i === 0) return randomInt(10, 19)
    if (i === drawerCount - 1) return randomInt(1, 8)
    return randomInt(0, 9)
  })
  const resolved = resolveExchanges(deposits)
  return { deposits, ...resolved, finalNumber: finalNumberFromCounts(resolved.finalCounts) }
}

// Every number you can form by using each of `digits` exactly once —
// the combinatorics behind SzámAlkotó's permutation tree.

/**
 * All valid digit-orderings, as an array of digit-string arrays (one
 * per valid number, e.g. `[['3','4','5'], ['3','5','4'], ...]`).
 * When `noLeadingZero` is true (the default — a real number never
 * starts with a written 0), any ordering starting with '0' is skipped
 * entirely rather than produced and then discarded.
 */
export function generatePermutations(digits, noLeadingZero = true) {
  const results = []

  function recurse(remaining, path) {
    if (remaining.length === 0) {
      results.push(path)
      return
    }
    remaining.forEach((digit, i) => {
      if (noLeadingZero && path.length === 0 && digit === '0') return
      const rest = remaining.slice(0, i).concat(remaining.slice(i + 1))
      recurse(rest, path.concat(digit))
    })
  }

  recurse(digits, [])
  return results
}

/** Digit-string array (e.g. `['3','4','5']`) to the number `345`. */
export function digitsToNumber(digitStrings) {
  return Number(digitStrings.join(''))
}

// Picked (not fully random) so a round sometimes includes a 0 — the
// only thing that makes the leading-digit rule bite — and sometimes
// doesn't, so both cases show up across rounds rather than only one.
export function pickDigitSet(count) {
  const includeZero = Math.random() < 0.5
  const pool = includeZero
    ? Array.from({ length: 9 }, (_, i) => String(i + 1))
    : Array.from({ length: 9 }, (_, i) => String(i + 1))
  const nonZeroCount = includeZero ? count - 1 : count
  const chosen = []
  const available = [...pool]
  for (let i = 0; i < nonZeroCount; i++) {
    const idx = Math.floor(Math.random() * available.length)
    chosen.push(available[idx])
    available.splice(idx, 1)
  }
  if (includeZero) chosen.push('0')

  // Shuffle so 0 (when present) isn't always shown last.
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chosen[i], chosen[j]] = [chosen[j], chosen[i]]
  }
  return chosen
}

/**
 * The digit of `number` at the given place (1 = ones, 2 = tens, ...).
 * Returns 0 for a place beyond the number's own length, so shorter and
 * longer numbers can be compared place-by-place as if the shorter one
 * had implicit leading zeros.
 */
function digitAtPlace(number, place) {
  return Math.floor(number / 10 ** (place - 1)) % 10
}

/**
 * The highest place at which two distinct natural numbers differ — the
 * digit position that alone decides which number is larger. Returns
 * null if the numbers are equal.
 */
export function decidingPlace(a, b) {
  if (a === b) return null
  const maxPlace = Math.max(String(a).length, String(b).length)
  for (let place = maxPlace; place >= 1; place--) {
    if (digitAtPlace(a, place) !== digitAtPlace(b, place)) return place
  }
  return null
}

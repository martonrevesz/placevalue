function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// When zeros are allowed, a non-leading digit is 0 this often — well
// above the flat 1-in-10 a uniform digit would give. Numbers with
// several zeros (e.g. 2 005 070) are common in real life and are the
// case students most often misread, so they should show up regularly
// rather than being a rare edge case.
const ZERO_BIAS = 0.3

function randomNonLeadingDigit(allowZeros) {
  if (!allowZeros) return randomInt(1, 9)
  return Math.random() < ZERO_BIAS ? 0 : randomInt(1, 9)
}

/**
 * Generates a random natural number with exactly `digitCount` digits.
 * The leading digit is never 0 (so the number actually has that many
 * digits). `allowZeros` is an on/off switch for whether the remaining
 * digits may be 0 at all — when on, zeros are deliberately common
 * rather than uniformly likely (see ZERO_BIAS).
 */
export function generateNumber(digitCount, allowZeros = true) {
  if (!Number.isInteger(digitCount) || digitCount < 1) {
    throw new Error('digitCount must be a positive integer')
  }

  const digits = [randomInt(1, 9)]
  for (let i = 1; i < digitCount; i++) {
    digits.push(randomNonLeadingDigit(allowZeros))
  }
  return Number(digits.join(''))
}

export function hasZeroDigit(number) {
  return String(number).includes('0')
}

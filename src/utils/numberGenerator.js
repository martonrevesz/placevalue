function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generates a random natural number with exactly `digitCount` digits.
 * The leading digit is never 0 (so the number actually has that many
 * digits). `allowZeros` controls whether the remaining digits may be 0
 * — a plain on/off switch, not a graduated density.
 */
export function generateNumber(digitCount, allowZeros = true) {
  if (!Number.isInteger(digitCount) || digitCount < 1) {
    throw new Error('digitCount must be a positive integer')
  }

  const digits = [randomInt(1, 9)]
  for (let i = 1; i < digitCount; i++) {
    digits.push(allowZeros ? randomInt(0, 9) : randomInt(1, 9))
  }
  return Number(digits.join(''))
}

export function hasZeroDigit(number) {
  return String(number).includes('0')
}

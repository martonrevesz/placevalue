/**
 * Formats a natural number with thin spaces between digit groups of
 * three, textbook-style (e.g. 1234567 -> "1 234 567").
 */
export function formatWithSpaces(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

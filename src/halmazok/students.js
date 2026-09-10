import { shuffle } from '../utils/shuffle'

// A fresh, invented roster — deliberately not reusing any specific
// textbook's named characters, so exercises inspired by a book's
// exercise structure don't reproduce its actual content.
const NAME_POOL = [
  'Anna', 'Márk', 'Luca', 'Bálint', 'Nóra', 'Ábel', 'Flóra', 'Kristóf',
  'Vivien', 'Levente', 'Zoé', 'Barna', 'Dorka', 'Ármin', 'Lili', 'Marcell',
]

/**
 * `count` distinct students (`{ id, label }`, `label` the first name),
 * drawn from a shared invented name pool and shuffled — a fresh subset
 * and order each call. `count` should stay well under the pool size so
 * the roster reads as a plausible small class, not the whole pool.
 */
export function pickStudents(count) {
  return shuffle(NAME_POOL)
    .slice(0, count)
    .map((name) => ({ id: name, label: name }))
}

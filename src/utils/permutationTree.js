// Pure structural helpers for the permutation tree: which branches
// exist at each depth, and how a box's path-key relates to its
// ancestors and siblings. No React here — PermutationTree.jsx renders
// this shape, and NumberBuilderTask.jsx uses isTreeComplete to gate
// its "Ellenőrzés" button.
//
// A path-key is a dot-separated chain of sibling-indices, e.g. "0.2.1"
// — it identifies a box's position in the tree, not what's typed into
// it. Depth 0 is the first digit's position (where a leading '0' is
// excluded when `noLeadingZero` is true); depth d is the (d+1)-th
// digit's position.

export function branchCountAtDepth(depth, digitCount, hasZero, noLeadingZero) {
  const reservedForLeadingZero = depth === 0 && hasZero && noLeadingZero ? 1 : 0
  return digitCount - depth - reservedForLeadingZero
}

/** Path-keys of every box, grouped by depth: `levels[0]` is the first digit's boxes, etc. */
export function buildLevels(digits, noLeadingZero) {
  const hasZero = digits.includes('0')
  const levels = []
  let parentKeys = ['']
  for (let depth = 0; depth < digits.length; depth++) {
    const count = branchCountAtDepth(depth, digits.length, hasZero, noLeadingZero)
    const keys = []
    parentKeys.forEach((prefix) => {
      for (let i = 0; i < count; i++) {
        keys.push(prefix ? `${prefix}.${i}` : `${i}`)
      }
    })
    levels.push(keys)
    parentKeys = keys
  }
  return levels
}

/** Path-keys of every ancestor of `pathKey`, ordered root-first (shallowest to deepest). */
export function ancestorKeys(pathKey) {
  const parts = pathKey.split('.')
  const keys = []
  for (let i = 1; i < parts.length; i++) keys.push(parts.slice(0, i).join('.'))
  return keys
}

/** Path-keys of every box sharing `pathKey`'s parent, `pathKey` itself included. */
export function siblingKeys(pathKey, digits, noLeadingZero) {
  const parts = pathKey.split('.')
  const depth = parts.length - 1
  const prefix = parts.slice(0, -1).join('.')
  const hasZero = digits.includes('0')
  const count = branchCountAtDepth(depth, digits.length, hasZero, noLeadingZero)
  const keys = []
  for (let i = 0; i < count; i++) keys.push(prefix ? `${prefix}.${i}` : `${i}`)
  return keys
}

/**
 * A vertical "row" position (fractional, not yet multiplied by a row
 * height) for every node: leaves get evenly-spaced whole-number rows,
 * and every node above is centered on the midpoint of its own
 * children's rows, computed bottom-up. This is what keeps a path's
 * start and end close together vertically instead of the tree
 * fanning out unpredictably — a parent with two children sits exactly
 * between them, not pinned to the top of its column.
 */
export function computeNodeRows(levels) {
  const rows = {}
  const leafLevel = levels[levels.length - 1] ?? []
  leafLevel.forEach((key, i) => {
    rows[key] = i
  })
  for (let depth = levels.length - 2; depth >= 0; depth--) {
    levels[depth].forEach((key) => {
      const childRows = levels[depth + 1].filter((k) => k.startsWith(`${key}.`)).map((k) => rows[k])
      rows[key] = childRows.reduce((sum, r) => sum + r, 0) / childRows.length
    })
  }
  return rows
}

/** True once every leaf box (the last digit's position) is filled. */
export function isTreeComplete(digits, noLeadingZero, values) {
  const levels = buildLevels(digits, noLeadingZero)
  const leafKeys = levels[levels.length - 1] ?? []
  return leafKeys.length > 0 && leafKeys.every((key) => Boolean(values[key]))
}

/** How many of the boxes across the whole tree are filled in so far. */
export function countFilled(digits, noLeadingZero, values) {
  const levels = buildLevels(digits, noLeadingZero)
  return levels.reduce((sum, keys) => sum + keys.filter((key) => Boolean(values[key])).length, 0)
}

/** Total number of boxes across the whole tree. */
export function countTotalBoxes(digits, noLeadingZero) {
  const levels = buildLevels(digits, noLeadingZero)
  return levels.reduce((sum, keys) => sum + keys.length, 0)
}

/**
 * Where to put keyboard/entry focus right after finishing a number
 * (filling `afterLeafKey`): the first still-empty box on the next
 * not-yet-complete number, scanning forward through the leaves (and
 * wrapping around). A "number" shares its early digits with whichever
 * neighbors branch off the same ancestors, so this is almost never the
 * next number's *first* digit — e.g. after 390, the next leaf is
 * 0.1.0 (940), but box "0" (the shared leading 9) is already filled,
 * so the real entry point is "0.1" (the second digit). Returns `null`
 * once every number is complete.
 */
export function findNextEntryPoint(levels, values, afterLeafKey) {
  const leafKeys = levels[levels.length - 1] ?? []
  const startIndex = leafKeys.indexOf(afterLeafKey)
  for (let offset = 1; offset <= leafKeys.length; offset++) {
    const candidate = leafKeys[(startIndex + offset) % leafKeys.length]
    const chain = [...ancestorKeys(candidate), candidate]
    const firstEmpty = chain.find((key) => !values[key])
    if (firstEmpty) return firstEmpty
  }
  return null
}

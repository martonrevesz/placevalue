import { useCallback, useEffect, useMemo, useState } from 'react'
import { ancestorKeys, buildLevels, computeNodeRows, siblingKeys } from '../../utils/permutationTree'
import './PermutationTree.css'

// Pixel geometry for the computed layout below — a node's row (from
// computeNodeRows) times ROW_HEIGHT gives its vertical center; a
// node's depth times COL_WIDTH gives its left edge.
const ROW_HEIGHT = 48
const COL_WIDTH = 100
const BOX_SIZE = 40

/**
 * An interactive permutation tree: given a set of distinct digit
 * cards, a student fills in every possible ordering by placing a
 * digit into each box, one branch per digit still available at that
 * point — exactly the "1st digit can be / 2nd digit can be / ..."
 * diagram this is modeled on. The tree's SHAPE (how many branches per
 * level) depends only on how many digits there are, so the whole
 * empty skeleton renders up front; filling it in is the exercise.
 *
 * Validity is enforced live, not just checked afterwards: a digit
 * already used by an ancestor (the same branch — the same "chain" —
 * back to the root) or by an already-filled sibling can't be placed
 * there, and the first position can't take '0' when `noLeadingZero`
 * is true. Because of that, a *fully filled* tree is always a fully
 * correct one — there's nothing left to grade about the tree itself,
 * only whether every box got filled (see `isTreeComplete` in
 * `utils/permutationTree.js`, meant for the caller's own check step).
 *
 * Controlled like VennSets: `values` is `{ [pathKey]: digit | null }`
 * owned by the caller, updated via `onChange(nextValues)`. A pathKey
 * is a dot-separated chain of sibling-indices (e.g. "0.2.1") — stable
 * identity for a box regardless of what's placed in it. `digits` is
 * an array of distinct digit strings (e.g. `['3','4','5']`).
 *
 * Three ways to fill a box, all routing through the same validity
 * check: tap a box to select it, then tap a digit card or press the
 * matching number key on the keyboard; or drag a digit card straight
 * onto a box (Pointer Events, ghost chip — same technique as
 * VennSets). Tapping an already-filled box clears it (and, since
 * changing an ancestor invalidates its descendants, clears everything
 * below it too). After a placement, selection jumps to that box's own
 * first child — the next digit of the *same* number — not sideways to
 * a sibling, so a keyboard-only student can type a whole number's
 * worth of digits in a row without touching the mouse.
 */
function PermutationTree({ digits, noLeadingZero = true, values, onChange, disabled = false }) {
  const [selectedKey, setSelectedKey] = useState(null)
  const [dragDigit, setDragDigit] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  const levels = useMemo(() => buildLevels(digits, noLeadingZero), [digits, noLeadingZero])
  const rows = useMemo(() => computeNodeRows(levels), [levels])
  const leafCount = levels[levels.length - 1]?.length ?? 0
  const canvasHeight = leafCount * ROW_HEIGHT
  const canvasWidth = levels.length * COL_WIDTH

  const edges = useMemo(() => {
    const list = []
    levels.forEach((keys, depth) => {
      if (depth === 0) return
      keys.forEach((key) => {
        list.push({ parent: key.split('.').slice(0, -1).join('.'), child: key })
      })
    })
    return list
  }, [levels])

  const isValidPlacement = (pathKey, digit) => {
    const depth = pathKey.split('.').length - 1
    if (depth === 0 && noLeadingZero && digit === '0') return false
    const blockingKeys = [...ancestorKeys(pathKey), ...siblingKeys(pathKey, digits, noLeadingZero)]
    return !blockingKeys.some((key) => key !== pathKey && values[key] === digit)
  }

  const place = useCallback(
    (pathKey, digit) => {
      if (disabled || !isValidPlacement(pathKey, digit)) return
      const next = { ...values, [pathKey]: digit }
      Object.keys(next).forEach((key) => {
        if (key !== pathKey && key.startsWith(`${pathKey}.`)) delete next[key]
      })
      onChange(next)
      // Advance into this box's own first child — the next digit of
      // the SAME number — rather than leaving selection where a
      // default tab order would take it (down to the next sibling,
      // i.e. the first digit of a different number entirely).
      const depth = pathKey.split('.').length - 1
      setSelectedKey(depth + 1 < digits.length ? `${pathKey}.0` : null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, values, digits, noLeadingZero, onChange],
  )

  const clear = (pathKey) => {
    if (disabled) return
    const next = { ...values }
    Object.keys(next).forEach((key) => {
      if (key === pathKey || key.startsWith(`${pathKey}.`)) delete next[key]
    })
    onChange(next)
  }

  const handleBoxClick = (pathKey) => {
    if (disabled) return
    if (values[pathKey]) {
      clear(pathKey)
      return
    }
    setSelectedKey((current) => (current === pathKey ? null : pathKey))
  }

  const handleDigitTap = (digit) => {
    if (disabled || !selectedKey) return
    place(selectedKey, digit)
  }

  // Typing the matching number key does the same thing as tapping the
  // digit card — only listening while a (necessarily empty, per
  // handleBoxClick) box is selected, so it never steals keystrokes
  // meant for the page's other inputs (the count/odd/min/max fields).
  useEffect(() => {
    if (!selectedKey || disabled) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedKey(null)
        return
      }
      if (/^[0-9]$/.test(e.key) && digits.includes(e.key)) {
        place(selectedKey, e.key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedKey, disabled, digits, place])

  const handleSourcePointerDown = (digit) => (e) => {
    if (disabled) return
    setDragDigit(digit)
    setDragPos({ x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (dragDigit === null) return
    setDragPos({ x: e.clientX, y: e.clientY })
  }

  const endDrag = (e) => {
    if (dragDigit === null) return
    const target = document.elementFromPoint(e.clientX, e.clientY)
    const boxEl = target && target.closest('[data-ptree-key]')
    if (boxEl) place(boxEl.getAttribute('data-ptree-key'), dragDigit)
    setDragDigit(null)
  }

  return (
    <div className="ptree-root">
      <div className="ptree-source">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            className="ptree-source-chip"
            onClick={() => handleDigitTap(digit)}
            onPointerDown={handleSourcePointerDown(digit)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={() => setDragDigit(null)}
            disabled={disabled}
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="ptree-columns-wrap">
        <div className="ptree-headers" style={{ width: canvasWidth + 100 }}>
          {levels.map((_, depth) => (
            <div key={depth} className="ptree-column-title" style={{ width: COL_WIDTH }}>
              {depth + 1}. számjegy lehet:
            </div>
          ))}
        </div>

        <div className="ptree-canvas" style={{ width: canvasWidth + 100, height: canvasHeight }}>
          <svg className="ptree-edges" width={canvasWidth} height={canvasHeight}>
            {edges.map(({ parent, child }) => {
              const parentDepth = parent.split('.').length - 1
              const x1 = parentDepth * COL_WIDTH + BOX_SIZE
              const y1 = rows[parent] * ROW_HEIGHT + ROW_HEIGHT / 2
              const x2 = (parentDepth + 1) * COL_WIDTH
              const y2 = rows[child] * ROW_HEIGHT + ROW_HEIGHT / 2
              return <line key={child} x1={x1} y1={y1} x2={x2} y2={y2} className="ptree-edge" />
            })}
          </svg>

          {levels.map((keys, depth) =>
            keys.map((key) => {
              const value = values[key] ?? null
              const isLeaf = depth === digits.length - 1
              const branchIndex = Number(key.split('.')[0])
              const top = rows[key] * ROW_HEIGHT + ROW_HEIGHT / 2 - BOX_SIZE / 2
              return (
                <div key={key} className="ptree-node-abs" style={{ left: depth * COL_WIDTH, top }}>
                  <button
                    type="button"
                    data-ptree-key={key}
                    className={`ptree-box ptree-branch-${branchIndex % 6} ${selectedKey === key ? 'is-selected' : ''} ${value ? 'is-filled' : ''}`}
                    onClick={() => handleBoxClick(key)}
                    disabled={disabled}
                  >
                    {value ?? ''}
                  </button>
                  {isLeaf && value && (
                    <span className="ptree-leaf-number">
                      {ancestorKeys(key)
                        .map((k) => values[k])
                        .join('')}
                      {value}
                    </span>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {dragDigit !== null && (
        <div className="ptree-drag-ghost" style={{ left: dragPos.x, top: dragPos.y }}>
          {dragDigit}
        </div>
      )}
    </div>
  )
}

export default PermutationTree

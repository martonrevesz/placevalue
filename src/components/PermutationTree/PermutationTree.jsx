import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ancestorKeys,
  buildLevels,
  computeNodeRows,
  findNextEntryPoint,
  siblingKeys,
} from '../../utils/permutationTree'
import './PermutationTree.css'

// Pixel geometry for the computed layout below. Two orientations share
// this one geometry (and the rest of the component — selection,
// keyboard entry, drag-and-drop, focus sync — is identical either way,
// since none of it cares which screen axis "depth" happens to be
// drawn on): a 3-digit tree reads left-to-right (depth is the
// horizontal axis), a 4-digit tree reads top-to-bottom (depth is the
// vertical axis, chosen once there'd otherwise be too many columns to
// read comfortably left-to-right). A node's "row" (from
// computeNodeRows — bottom-up centering so a path's start and end
// stay close together) always drives whichever axis ISN'T depth.
const DEPTH_SIZE = 88
// Kept tight enough that a full 4-digit tree (up to 24 leaves) fits
// most desktop widths without the canvas needing to scroll — a wider
// value looked nicer for the smaller 3-digit case, but wasn't worth a
// scrollbar showing up on ordinary screens for the 4-digit one.
const LEAF_SIZE = 46
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
 * a sibling, letting a keyboard-only student type one whole number in
 * a row. Finishing a number (the leaf) moves the highlight on to the
 * next useful spot for a *different* number (see findNextEntryPoint)
 * — only the highlight moves, never a digit; which value to type there
 * is still entirely the student's own choice.
 *
 * Only the selected box (if any) is in the native Tab order — every
 * other box gets `tabIndex={-1}` — so Tab can't land on some unrelated
 * box purely because of where it happens to sit in the DOM.
 *
 * A digit that's already used by the selected box's ancestors or
 * siblings is dimmed among the source chips rather than only being
 * silently rejected on attempt — and any rejected attempt (typed,
 * tapped, or dropped) gives the target box a brief shake, so there's
 * always some feedback for "that digit's taken," not just nothing.
 */
function PermutationTree({ digits, noLeadingZero = true, values, onChange, disabled = false }) {
  const [selectedKey, setSelectedKey] = useState(null)
  const [dragDigit, setDragDigit] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  const levels = useMemo(() => buildLevels(digits, noLeadingZero), [digits, noLeadingZero])
  const rows = useMemo(() => computeNodeRows(levels), [levels])
  const leafCount = levels[levels.length - 1]?.length ?? 0
  // 4 digits means too many columns to read comfortably left-to-right,
  // so that's the only case that flips to top-to-bottom.
  const isVertical = digits.length >= 4

  const rowExtent = leafCount * LEAF_SIZE
  // + one extra band's worth of room for the leaf-number readout past the last depth level.
  const depthExtent = levels.length * DEPTH_SIZE + DEPTH_SIZE * 0.6
  const canvasWidth = isVertical ? rowExtent : depthExtent
  const canvasHeight = isVertical ? depthExtent : rowExtent

  // Where a box at (depth, row) lands on screen — the one place both
  // orientations funnel through, so a layout change only has to happen here.
  const boxPos = useCallback(
    (depth, row) => {
      const depthPx = depth * DEPTH_SIZE
      const rowPx = row * LEAF_SIZE + (LEAF_SIZE - BOX_SIZE) / 2
      return isVertical ? { left: rowPx, top: depthPx } : { left: depthPx, top: rowPx }
    },
    [isVertical],
  )

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

  // A digit already used by an ancestor or sibling of the SELECTED box
  // is rejected on placement anyway (see isValidPlacement) — dimming
  // its source chip up front means a student can see that before
  // trying it, instead of only finding out by getting turned down.
  const invalidDigitsForSelection = selectedKey
    ? new Set(digits.filter((digit) => !isValidPlacement(selectedKey, digit)))
    : null

  // A short shake + red flash on the box itself, for whichever input
  // method just got rejected — a digit already used by an ancestor or
  // sibling (via `place`, below), or a keystroke that isn't even one
  // of this round's digit cards at all (handled directly in the
  // keydown effect, since there's no digit worth passing to `place`).
  // Manipulated directly rather than through state so a box can shake
  // again immediately even if it's already mid-shake. Stable across
  // renders (no reactive values involved) so effects can depend on it
  // without re-subscribing every render.
  const triggerReject = useCallback((pathKey) => {
    const el = document.querySelector(`[data-ptree-key="${pathKey}"]`)
    if (!el) return
    el.classList.remove('ptree-box-rejected')
    void el.offsetWidth
    el.classList.add('ptree-box-rejected')
  }, [])

  const place = useCallback(
    (pathKey, digit) => {
      if (disabled) return
      if (!isValidPlacement(pathKey, digit)) {
        triggerReject(pathKey)
        return
      }
      const next = { ...values, [pathKey]: digit }
      Object.keys(next).forEach((key) => {
        if (key !== pathKey && key.startsWith(`${pathKey}.`)) delete next[key]
      })
      onChange(next)
      // Advance into this box's own first child — the next digit of
      // the SAME number — rather than leaving selection where a
      // default tab order would take it (down to the next sibling,
      // i.e. the first digit of a different number entirely). Once a
      // whole number is finished, selection jumps to the next useful
      // spot for a DIFFERENT number (see findNextEntryPoint) — it only
      // ever moves the highlight, never places a digit on its own.
      const depth = pathKey.split('.').length - 1
      setSelectedKey(depth + 1 < digits.length ? `${pathKey}.0` : findNextEntryPoint(levels, next, pathKey))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, values, digits, noLeadingZero, onChange, levels],
  )

  const clear = (pathKey, sourceEl) => {
    if (disabled) return
    const next = { ...values }
    Object.keys(next).forEach((key) => {
      if (key === pathKey || key.startsWith(`${pathKey}.`)) delete next[key]
    })
    onChange(next)
    // Clearing a box doesn't select anything, so nothing else claims
    // its browser focus — left alone, the just-cleared box would keep
    // showing the native focus ring even though it no longer means
    // "you can type here."
    sourceEl?.blur()
  }

  const handleBoxClick = (pathKey, e) => {
    if (disabled) return
    if (values[pathKey]) {
      clear(pathKey, e.currentTarget)
      return
    }
    setSelectedKey((current) => (current === pathKey ? null : pathKey))
  }

  // Keeps real browser focus in sync with `selectedKey` — without
  // this, auto-advancing selection (see `place`) only moved the blue
  // "selected" ring, while the native focus outline stayed stuck on
  // whichever box was last actually clicked. That left two different
  // boxes looking highlighted at once, in two different styles. When
  // selection clears entirely (a number just got finished, or Escape),
  // there's no new box to focus — but the old one still has real
  // browser focus unless something explicitly gives it up, so blur it
  // instead of leaving a stray native ring on a box that isn't selected.
  useEffect(() => {
    if (!selectedKey) {
      const active = document.activeElement
      if (active?.hasAttribute?.('data-ptree-key')) active.blur()
      return
    }
    document.querySelector(`[data-ptree-key="${selectedKey}"]`)?.focus({ preventScroll: true })
  }, [selectedKey])

  const handleDigitTap = (digit) => {
    if (disabled || !selectedKey) return
    place(selectedKey, digit)
  }

  // Typing the matching number key does the same thing as tapping the
  // digit card. `selectedKey` only ever points at an empty box (see
  // handleBoxClick), but it stays set until that box gets a value or
  // the tree is deselected some other way — the student can click
  // into an unrelated text field (say, one of the count/odd/min/max
  // answers) without ever "closing" that selection first. Without the
  // target check below, typing a digit there would also — silently,
  // confusingly — place it in the still-selected tree box.
  useEffect(() => {
    if (!selectedKey || disabled) return undefined
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        setSelectedKey(null)
        return
      }
      if (!/^[0-9]$/.test(e.key)) return
      if (digits.includes(e.key)) {
        place(selectedKey, e.key)
      } else {
        // Not even one of this round's cards (e.g. pressing "7" when
        // the cards are 8/3/5) — still worth a shake, since silently
        // doing nothing reads the same as an unresponsive key.
        triggerReject(selectedKey)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedKey, disabled, digits, place, triggerReject])

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
            className={`ptree-source-chip ${invalidDigitsForSelection?.has(digit) ? 'is-unavailable' : ''}`}
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

      <div className={`ptree-diagram ${isVertical ? 'is-vertical' : 'is-horizontal'}`}>
        <div className="ptree-level-labels" style={isVertical ? { height: canvasHeight } : { width: canvasWidth }}>
          {levels.map((_, depth) => (
            <div
              key={depth}
              className="ptree-level-label"
              style={isVertical ? { height: DEPTH_SIZE } : { width: DEPTH_SIZE }}
            >
              {depth + 1}. számjegy lehet:
            </div>
          ))}
        </div>

        <div className="ptree-canvas-scroll">
          <div className="ptree-canvas" style={{ width: canvasWidth, height: canvasHeight }}>
            <svg className="ptree-edges" width={canvasWidth} height={canvasHeight}>
              {edges.map(({ parent, child }) => {
                const parentDepth = parent.split('.').length - 1
                const parentPos = boxPos(parentDepth, rows[parent])
                const childPos = boxPos(parentDepth + 1, rows[child])
                // Connect the trailing edge of the parent box to the
                // leading edge of the child box, along the depth axis.
                const x1 = parentPos.left + (isVertical ? BOX_SIZE / 2 : BOX_SIZE)
                const y1 = parentPos.top + (isVertical ? BOX_SIZE : BOX_SIZE / 2)
                const x2 = childPos.left + (isVertical ? BOX_SIZE / 2 : 0)
                const y2 = childPos.top + (isVertical ? 0 : BOX_SIZE / 2)
                return <line key={child} x1={x1} y1={y1} x2={x2} y2={y2} className="ptree-edge" />
              })}
            </svg>

            {levels.map((keys, depth) =>
              keys.map((key) => {
                const value = values[key] ?? null
                const isLeaf = depth === digits.length - 1
                const branchIndex = Number(key.split('.')[0])
                const { left, top } = boxPos(depth, rows[key])
                return (
                  <div key={key} className="ptree-node-abs" style={{ left, top }}>
                    <button
                      type="button"
                      data-ptree-key={key}
                      tabIndex={selectedKey === key ? 0 : -1}
                      className={`ptree-box ptree-branch-${branchIndex % 6} ${selectedKey === key ? 'is-selected' : ''} ${value ? 'is-filled' : ''}`}
                      onClick={(e) => handleBoxClick(key, e)}
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

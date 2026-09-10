import { useCallback, useRef, useState } from 'react'
import './VennSets.css'

const ZONES = ['intersection', 'onlyA', 'onlyB', 'base']

function pointInRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

/**
 * A drag-and-drop Venn diagram for one or two sets (A, and optionally
 * B) with an optional enclosing base/universal set. Elements are
 * dragged between homes: the tray (unplaced), base-only (a dedicated
 * strip below the circle(s), rather than the thin leftover margin
 * around them — easier to hit on a phone — only reachable when
 * `hasBaseSet`), A-only, and — when `hasSetB` — B-only and the A∩B
 * intersection too. Set `hasSetB={false}` for a task that only needs
 * one set and its base set (e.g. "which of these are/aren't in A?");
 * the diagram collapses to a single centered circle, and 'onlyB'/
 * 'intersection' simply aren't offered as drop targets. Every zone is
 * a disjoint rectangle, so hit-testing is a plain "which rect contains
 * this point" check with no priority/overlap cases to worry about.
 *
 * Each element is `{ id, label, content? }` — `content` is an optional
 * React node shown on the chip instead of the plain `label` text (e.g.
 * a richer card with an avatar and icons), while `label` still names
 * the element in the ghost ARIA sense and as a fallback.
 *
 * Controlled: `placement` is `{ [elementId]: 'unplaced' | 'base' |
 * 'onlyA' | 'onlyB' | 'intersection' }`, owned by the caller, updated
 * via `onPlacementChange(nextPlacement)` as soon as a drag ends over a
 * valid zone (a drop outside every zone leaves the placement
 * unchanged, rather than losing the element). The zone vocabulary is
 * the same regardless of `hasSetB` — 'onlyA' just means "inside A"
 * whether or not a B exists to subtract — so a caller's placement/
 * feedback handling doesn't need to branch on which mode is active.
 *
 * Mouse and touch both work via Pointer Events — the dragged element
 * is shown as a `position: fixed` ghost that follows the pointer, so
 * it can travel across the whole diagram regardless of which zone it
 * started in, not just within one container.
 *
 * Validation is intentionally NOT this component's job: pass a
 * `feedback` map (`{ [elementId]: true | false }`) after checking, and
 * each chip in that map gets a correct/incorrect ring. Comparing
 * `placement` against an expected answer is the caller's concern.
 */
function VennSets({
  labelA,
  labelB,
  hasSetB = true,
  hasBaseSet = false,
  baseLabel,
  elements,
  placement,
  onPlacementChange,
  disabled = false,
  feedback = null,
}) {
  const [dragId, setDragId] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [hoverZone, setHoverZone] = useState(null)
  const zoneRefs = useRef({})

  // Stable across every render — an inline `ref={(el) => ...}` arrow
  // function is a *new* function object each render, which makes React
  // tear down and re-attach the ref on every single placement update.
  // A drag that starts right in that window can read a momentarily-
  // missing ref for one zone and silently fall through to the next
  // zone checked, misplacing the element. useCallback with an empty
  // dependency array keeps one identity per setter for the component's
  // whole lifetime, closing that window entirely.
  const setOnlyARef = useCallback((el) => {
    if (el) zoneRefs.current.onlyA = el
    else delete zoneRefs.current.onlyA
  }, [])
  const setIntersectionRef = useCallback((el) => {
    if (el) zoneRefs.current.intersection = el
    else delete zoneRefs.current.intersection
  }, [])
  const setOnlyBRef = useCallback((el) => {
    if (el) zoneRefs.current.onlyB = el
    else delete zoneRefs.current.onlyB
  }, [])
  const setBaseRef = useCallback((el) => {
    if (el) zoneRefs.current.base = el
    else delete zoneRefs.current.base
  }, [])
  const setTrayRef = useCallback((el) => {
    if (el) zoneRefs.current.tray = el
    else delete zoneRefs.current.tray
  }, [])

  const zoneAt = (x, y) => {
    for (const zone of ZONES) {
      if (zone === 'base' && !hasBaseSet) continue
      if ((zone === 'onlyB' || zone === 'intersection') && !hasSetB) continue
      const el = zoneRefs.current[zone]
      if (el && pointInRect(x, y, el.getBoundingClientRect())) return zone
    }
    const tray = zoneRefs.current.tray
    if (tray && pointInRect(x, y, tray.getBoundingClientRect())) return 'unplaced'
    return null
  }

  const handlePointerDown = (id) => (e) => {
    if (disabled) return
    setDragId(id)
    setDragPos({ x: e.clientX, y: e.clientY })
    setHoverZone(placement[id])
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (dragId === null) return
    setDragPos({ x: e.clientX, y: e.clientY })
    setHoverZone(zoneAt(e.clientX, e.clientY))
  }

  const endDrag = (e) => {
    if (dragId === null) return
    const zone = zoneAt(e.clientX, e.clientY)
    if (zone) {
      onPlacementChange({ ...placement, [dragId]: zone })
    }
    setDragId(null)
    setHoverZone(null)
  }

  const renderChip = (element) => {
    const isDragSource = element.id === dragId
    const ok = feedback ? feedback[element.id] : null
    const chipClass = [
      'venn-chip',
      isDragSource && 'is-drag-source',
      feedback && ok === true && 'is-correct',
      feedback && ok === false && 'is-incorrect',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <div
        key={element.id}
        className={chipClass}
        onPointerDown={handlePointerDown(element.id)}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {element.content ?? element.label}
      </div>
    )
  }

  const inZone = (zone) => elements.filter((el) => placement[el.id] === zone)

  const draggedElement = elements.find((el) => el.id === dragId)

  return (
    <div className="venn-root">
      <div className="venn-canvas">
        {hasBaseSet && (
          <div className="venn-base">
            {baseLabel && <div className="venn-base-label">{baseLabel}</div>}
          </div>
        )}

        <div className={`venn-circle venn-circle-a ${!hasSetB ? 'venn-circle-a-solo' : ''}`} />
        {hasSetB && <div className="venn-circle venn-circle-b" />}
        <div className={`venn-set-label venn-set-label-a ${!hasSetB ? 'venn-set-label-a-solo' : ''}`}>
          {labelA}
        </div>
        {hasSetB && <div className="venn-set-label venn-set-label-b">{labelB}</div>}

        <div
          ref={setOnlyARef}
          className={`venn-zone venn-zone-onlyA ${!hasSetB ? 'venn-zone-onlyA-solo' : ''} ${hoverZone === 'onlyA' ? 'is-hover' : ''}`}
        >
          {inZone('onlyA').map(renderChip)}
        </div>
        {hasSetB && (
          <div
            ref={setIntersectionRef}
            className={`venn-zone venn-zone-intersection ${hoverZone === 'intersection' ? 'is-hover' : ''}`}
          >
            {inZone('intersection').map(renderChip)}
          </div>
        )}
        {hasSetB && (
          <div
            ref={setOnlyBRef}
            className={`venn-zone venn-zone-onlyB ${hoverZone === 'onlyB' ? 'is-hover' : ''}`}
          >
            {inZone('onlyB').map(renderChip)}
          </div>
        )}

        {hasBaseSet && (
          <div
            ref={setBaseRef}
            className={`venn-zone venn-base-zone ${hoverZone === 'base' ? 'is-hover' : ''}`}
          >
            {inZone('base').map(renderChip)}
          </div>
        )}
      </div>

      <div ref={setTrayRef} className={`venn-tray ${hoverZone === 'unplaced' ? 'is-hover' : ''}`}>
        {inZone('unplaced').map(renderChip)}
      </div>

      {dragId !== null && draggedElement && (
        <div
          className="venn-chip venn-chip-ghost"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          {draggedElement.content ?? draggedElement.label}
        </div>
      )}
    </div>
  )
}

export default VennSets

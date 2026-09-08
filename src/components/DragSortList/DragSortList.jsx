import { Fragment, useRef, useState } from 'react'
import './DragSortList.css'

/**
 * A horizontal, drag-to-reorder list — mouse and touch both work via
 * Pointer Events (no separate touch handling needed). Controlled: the
 * order lives in `items` (owned by the parent), and `onReorder` is
 * called with the new array as soon as a drag crosses a neighbor's
 * midpoint, live during the drag rather than only on drop.
 *
 * `getId(item)` must return a stable key so a tile keeps its identity
 * (and mid-drag position) across reorders. `renderItem(item, { isDragging })`
 * renders a tile's content.
 *
 * `renderSeparator(index)`, if given, renders a fixed marker between
 * item `index` and `index + 1` (not before the first or after the
 * last). It's a plain flex sibling, untouched by any item's drag
 * transform, so it stays put in its slot regardless of which item
 * currently sits next to it.
 */
function DragSortList({ items, getId, renderItem, renderSeparator, onReorder, disabled = false }) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const itemRefs = useRef(new Map())
  const startXRef = useRef(0)

  const handlePointerDown = (id) => (e) => {
    if (disabled) return
    startXRef.current = e.clientX
    setDraggingId(id)
    setDragOffset(0)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (draggingId === null) return
    setDragOffset(e.clientX - startXRef.current)

    const draggedIndex = items.findIndex((item) => getId(item) === draggingId)
    if (draggedIndex === -1) return

    let targetIndex = draggedIndex
    items.forEach((item, i) => {
      if (i === draggedIndex) return
      const el = itemRefs.current.get(getId(item))
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mid = rect.left + rect.width / 2
      if (e.clientX > mid && i > targetIndex) targetIndex = i
      if (e.clientX < mid && i < targetIndex) targetIndex = i
    })

    if (targetIndex !== draggedIndex) {
      const next = [...items]
      const [moved] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, moved)
      onReorder(next)
    }
  }

  const endDrag = () => {
    setDraggingId(null)
    setDragOffset(0)
  }

  return (
    <div
      className="drag-sort-list"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {items.map((item, index) => {
        const id = getId(item)
        const isDragging = draggingId === id
        return (
          <Fragment key={id}>
            <div
              ref={(el) => {
                if (el) itemRefs.current.set(id, el)
                else itemRefs.current.delete(id)
              }}
              className={`drag-sort-item ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
              style={isDragging ? { transform: `translateX(${dragOffset}px)` } : undefined}
              onPointerDown={handlePointerDown(id)}
            >
              {renderItem(item, { isDragging })}
            </div>
            {renderSeparator && index < items.length - 1 && (
              <div className="drag-sort-separator">{renderSeparator(index)}</div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default DragSortList

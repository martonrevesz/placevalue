import { useEffect, useRef } from 'react'
import './WrittenDivision.css'

/**
 * Written division on squared paper, laid out by `buildDivisionLayout`
 * (utils/longDivision.js). Static cells (dividend, divisor, signs) are
 * plain text; the student's inputs are `fields`, each spanning one or
 * more cells. A field is filled right to left, starting at its units
 * cell — the way the multiplication and subtraction are worked out on
 * paper — so every digit stays in the cell it was typed into, and a
 * number shorter than its row still lands in the right columns.
 *
 * Controlled: `values` is `{ [fieldId]: digitString }`, `activeIndex`
 * the field (index into `layout.fields`) currently being typed into, and
 * `replaceNext` whether the next digit starts that field over (from its
 * units cell) instead of continuing to its left. The cell the next digit
 * will land in is highlighted and holds focus. Keys pressed there are
 * reported as `onDigit`, `onBackspace`, `onMove(±1)`; clicking any cell
 * of a field calls `onSelect(index)`. Only that one cell is in the Tab
 * order.
 *
 * `results` (`{ [fieldId]: boolean }`, after grading) tints each field
 * green or red. A dividend digit gets its tick once it has been brought
 * down (its lehozott field is filled); the first partial dividend's
 * last digit is ticked from the start, as on paper.
 */
function WrittenDivision({
  layout,
  values,
  activeIndex,
  replaceNext = false,
  results = null,
  disabled = false,
  onSelect,
  onDigit,
  onBackspace,
  onMove,
}) {
  const activeCellRef = useRef(null)

  const activeField = layout.fields[activeIndex]
  const activeValue = values[activeField?.id] ?? ''
  const targetCell = activeField
    ? replaceNext
      ? activeField.cols.length - 1
      : Math.max(activeField.cols.length - activeValue.length - 1, 0)
    : null

  useEffect(() => {
    if (!disabled) activeCellRef.current?.focus({ preventScroll: true })
  }, [activeIndex, targetCell, disabled])

  const tickedIndices = new Set([layout.firstTickIndex])
  layout.fields.forEach((field) => {
    if (field.kind === 'lehozott' && values[field.id]) tickedIndices.add(field.dividendIndex)
  })

  const handleKeyDown = (e) => {
    if (disabled) return
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      onDigit(e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onBackspace()
    } else if (e.key === 'Enter' || e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      if (e.key === 'Tab' && activeIndex === layout.fields.length - 1) return
      e.preventDefault()
      onMove(1)
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      if (e.key === 'Tab' && activeIndex === 0) return
      e.preventDefault()
      onMove(-1)
    }
  }

  return (
    <div className="wd-paper">
      <div
        className="wd-grid"
        style={{
          '--wd-cols': layout.columns,
          gridTemplateColumns: `repeat(${layout.columns}, var(--wd-cell))`,
          gridTemplateRows: `repeat(${layout.rows}, var(--wd-cell))`,
        }}
        onKeyDown={handleKeyDown}
      >
        {layout.statics.map((cell) => (
          <div
            key={`s-${cell.row}-${cell.col}`}
            className={`wd-static ${tickedIndices.has(cell.dividendIndex) ? 'has-tick' : ''}`}
            style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
          >
            {cell.text}
          </div>
        ))}

        {layout.fields.map((field, index) => {
          const value = values[field.id] ?? ''
          const offset = field.cols.length - value.length
          const isActiveField = !disabled && index === activeIndex
          const result = results ? (results[field.id] ? 'ok' : 'wrong') : null
          return field.cols.map((col, i) => {
            const digit = i >= offset ? value[i - offset] : ''
            const isTarget = isActiveField && i === targetCell
            return (
              <button
                key={`${field.id}-${col}`}
                ref={isTarget ? activeCellRef : undefined}
                type="button"
                className={[
                  'wd-cell',
                  !digit && 'is-empty',
                  isActiveField && 'is-in-active-field',
                  isTarget && 'is-active',
                  result && `is-${result}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ gridRow: field.row + 1, gridColumn: col + 1 }}
                tabIndex={isTarget ? 0 : -1}
                disabled={disabled}
                onClick={() => onSelect(index)}
                aria-label={`${FIELD_LABELS[field.kind]}${digit ? `, ${digit}` : ', üres'}`}
              >
                {digit}
              </button>
            )
          })
        })}

        {layout.lines.map((line) => (
          <div
            key={`line-${line.row}`}
            className="wd-line"
            style={{ gridRow: line.row + 1, gridColumn: `${line.fromCol + 1} / ${line.toCol + 2}` }}
          />
        ))}
      </div>
    </div>
  )
}

const FIELD_LABELS = {
  quotient: 'hányados számjegye',
  product: 'szorzat',
  remainder: 'maradék',
  lehozott: 'lehozott számjegy',
}

export default WrittenDivision

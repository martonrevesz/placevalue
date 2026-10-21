import { useEffect, useRef } from 'react'
import './WrittenDivision.css'

/**
 * Written division on squared paper, laid out by `buildDivisionLayout`
 * (utils/longDivision.js). Static cells (dividend, divisor, signs) are
 * plain text; the student's inputs are `fields`, each spanning one or
 * more cells. Every digit stays in the cell it was typed into — which
 * cell comes next (rows are written right to left, from the units) is
 * the task's business, passed in as `activeCell`.
 *
 * Controlled: `values` is `{ [fieldId]: cells[] }` ('' = empty cell),
 * `activeIndex` the field (index into `layout.fields`) being typed into,
 * `activeCell` the cell within it the next digit lands in — highlighted,
 * and holding focus. Any cell can be written: clicking one calls
 * `onSelect(fieldIndex, cellIndex)`. Keys pressed are reported as
 * `onDigit`, `onBackspace`, `onMoveCell(±1)` (arrow keys, one cell) and
 * `onMove(±1)` (Enter / Tab, one field). Only that one cell is in the
 * Tab order. `revealed` limits drawing to the first that-many fields, so
 * rows can appear one at a time; the paper itself keeps its full size,
 * so nothing shifts as they do.
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
  activeCell,
  revealed = Infinity,
  results = null,
  disabled = false,
  onSelect,
  onDigit,
  onBackspace,
  onMove,
  onMoveCell,
}) {
  const activeCellRef = useRef(null)

  useEffect(() => {
    if (!disabled) activeCellRef.current?.focus({ preventScroll: true })
  }, [activeIndex, activeCell, disabled])

  // Only the first `revealed` fields (in writing order) are drawn, plus
  // every quotient cell — those sit on the header line, which shows
  // from the start. A step's minus sign and rule appear with its product.
  const isShown = (field, index) => field.kind === 'quotient' || index < revealed
  const shownSteps = new Set(
    layout.fields.flatMap((field, index) => (field.kind === 'product' && isShown(field, index) ? [field.step] : [])),
  )
  const isStepPartShown = (item) => item.step === undefined || shownSteps.has(item.step)

  const tickedIndices = new Set([layout.firstTickIndex])
  layout.fields.forEach((field) => {
    if (field.kind === 'lehozott' && values[field.id]?.some(Boolean)) tickedIndices.add(field.dividendIndex)
  })

  const handleKeyDown = (e) => {
    if (disabled) return
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      onDigit(e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onBackspace()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onMoveCell(e.key === 'ArrowRight' ? 1 : -1)
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      if (e.key === 'Tab' && activeIndex === layout.fields.length - 1) return
      e.preventDefault()
      onMove(1)
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (activeIndex === 0) return
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
        {layout.statics.filter(isStepPartShown).map((cell) => (
          <div
            key={`s-${cell.row}-${cell.col}`}
            className={`wd-static ${tickedIndices.has(cell.dividendIndex) ? 'has-tick' : ''}`}
            style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
          >
            {cell.text}
          </div>
        ))}

        {layout.fields.map((field, index) => {
          if (!isShown(field, index)) return null
          const cells = values[field.id] ?? []
          const isActiveField = !disabled && index === activeIndex
          const result = results ? (results[field.id] ? 'ok' : 'wrong') : null
          return field.cols.map((col, i) => {
            const digit = cells[i] || ''
            const isTarget = isActiveField && i === activeCell
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
                onClick={() => onSelect(index, i)}
                aria-label={`${FIELD_LABELS[field.kind]}${digit ? `, ${digit}` : ', üres'}`}
              >
                {digit}
              </button>
            )
          })
        })}

        {layout.lines.filter(isStepPartShown).map((line) => (
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

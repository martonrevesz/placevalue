import { useEffect, useRef } from 'react'
import './PlaceValueTable.css'

const CLASS_NAMES = ['Egyesek', 'Ezresek', 'Milliók']
// Textbook convention: lowercase within the ones class, uppercase from
// the thousands class up.
const LOWER_ABBR = ['e', 't', 'sz']
const UPPER_ABBR = ['E', 'T', 'Sz']

// place 1 = egyes, 2 = tízes, 3 = százas, 4 = ezres, 5 = tízezres, ...
function describePlace(place, cellIndex) {
  const classIndex = Math.floor((place - 1) / 3)
  const subIndex = (place - 1) % 3
  return {
    place,
    cellIndex,
    classIndex,
    className: CLASS_NAMES[classIndex],
    abbr: (classIndex === 0 ? LOWER_ABBR : UPPER_ABBR)[subIndex],
  }
}

function contiguousPlaces(digitCount) {
  const places = []
  for (let place = digitCount; place >= 1; place--) places.push(place)
  return places
}

function groupByClass(columns) {
  const groups = []
  for (const col of columns) {
    const last = groups[groups.length - 1]
    if (last && last.classIndex === col.classIndex) {
      last.columns.push(col)
    } else {
      groups.push({ classIndex: col.classIndex, className: col.className, columns: [col] })
    }
  }
  return groups
}

/**
 * Renders a place value table grouped into classes (egyesek/ezresek/milliók),
 * matching the textbook layout.
 *
 * - `mode="display"`: read-only, shows `values` as plain digits.
 * - `mode="interactive"`: cells are clickable buttons. Clicking a cell
 *   calls `onCellClick(index)` so a parent can drive a digit pad (for
 *   touch devices). The first cell also auto-focuses and each cell
 *   accepts keyboard digit typing directly — `onDigitKey(index, digit)`
 *   and `onBackspaceKey(index)` — with focus auto-advancing to the next
 *   cell, so a desktop user can just type the number.
 *
 * Which columns render is controlled by `places`, an array of place
 * numbers (1 = egyes, 2 = tízes, 3 = százas, 4 = ezres, ...), left to
 * right in the given order — not every task needs every digit (e.g. a
 * table without a millions class). For the common case of "every digit
 * from ones up to N", pass `digitCount` instead and `places` is derived
 * automatically.
 *
 * `values[i]` corresponds to `places[i]`.
 *
 * `feedback` ('success' | 'error' | null) tints the whole table after a
 * check — always alongside a separate icon+text message elsewhere on
 * the screen, never as the only signal. `disabled` locks the cells
 * (e.g. between checking an answer and moving to the next one).
 */
function PlaceValueTable({
  places,
  digitCount,
  mode = 'display',
  values = [],
  activeIndex = null,
  feedback = null,
  disabled = false,
  onCellClick,
  onDigitKey,
  onBackspaceKey,
}) {
  const resolvedPlaces = places ?? contiguousPlaces(digitCount ?? 0)
  const groups = groupByClass(resolvedPlaces.map(describePlace))
  const cellRefs = useRef([])

  useEffect(() => {
    if (mode === 'interactive' && !disabled && activeIndex !== null) {
      cellRefs.current[activeIndex]?.focus()
    }
  }, [mode, activeIndex, disabled])

  const handleKeyDown = (cellIndex) => (e) => {
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      onDigitKey?.(cellIndex, e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onBackspaceKey?.(cellIndex)
    }
  }

  return (
    <div className="pv-table" data-mode={mode} data-feedback={feedback}>
      {groups.map((group, groupIndex) => (
        <div className="pv-class" key={`${group.classIndex}-${groupIndex}`}>
          <div className="pv-class-name">{group.className}</div>
          <div className="pv-cells">
            {group.columns.map((col) => {
              const cellIndex = col.cellIndex
              const digit = values[cellIndex]
              const hasDigit = digit !== undefined && digit !== null && digit !== ''
              const isActive = mode === 'interactive' && activeIndex === cellIndex
              const cellClassName = [
                'pv-cell',
                !hasDigit && 'is-empty',
                isActive && 'is-active',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div className="pv-cell-wrap" key={col.place}>
                  {mode === 'interactive' ? (
                    <button
                      ref={(el) => {
                        cellRefs.current[cellIndex] = el
                      }}
                      type="button"
                      className={cellClassName}
                      disabled={disabled}
                      onClick={() => onCellClick?.(cellIndex)}
                      onKeyDown={handleKeyDown(cellIndex)}
                      aria-label={`${col.className}, ${col.abbr} hely${hasDigit ? `, ${digit}` : ', üres'}`}
                      aria-pressed={isActive}
                    >
                      {hasDigit ? digit : ''}
                    </button>
                  ) : (
                    <div className={cellClassName}>{hasDigit ? digit : ''}</div>
                  )}
                  <div className="pv-place-label">{col.abbr}</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlaceValueTable

import './DigitPad.css'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * A 0-9 keypad for filling a selected PlaceValueTable cell.
 * `onDigit(digit)` is called with a single digit character;
 * `onClear` clears the currently selected cell; `onClearAll` resets
 * every cell so a student can restart an attempt from scratch.
 */
function DigitPad({ onDigit, onClear, onClearAll, disabled = false }) {
  return (
    <div className="digit-pad">
      <div className="digit-pad-grid">
        {DIGITS.map((d) => (
          <button
            key={d}
            type="button"
            className="digit-pad-btn"
            onClick={() => onDigit(d)}
            disabled={disabled}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="digit-pad-actions">
        <button type="button" className="digit-pad-btn digit-pad-clear" onClick={onClear} disabled={disabled}>
          Törlés
        </button>
        <button
          type="button"
          className="digit-pad-btn digit-pad-clear-all"
          onClick={onClearAll}
          disabled={disabled}
        >
          Összes törlése
        </button>
      </div>
    </div>
  )
}

export default DigitPad

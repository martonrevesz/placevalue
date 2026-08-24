import './DigitPad.css'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * A 0-9 keypad for filling a selected PlaceValueTable cell.
 * `onDigit(digit)` is called with a single digit character;
 * `onClear` clears the currently selected cell.
 */
function DigitPad({ onDigit, onClear, disabled = false }) {
  return (
    <div className="digit-pad">
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
      <button
        type="button"
        className="digit-pad-btn digit-pad-clear"
        onClick={onClear}
        disabled={disabled}
      >
        Törlés
      </button>
    </div>
  )
}

export default DigitPad

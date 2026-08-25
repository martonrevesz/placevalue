import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { checkAnswer } from '../utils/checkAnswer'
import { formatWithSpaces } from '../utils/formatNumber'
import { useDigitEntry } from '../hooks/useDigitEntry'
import { useScore } from '../hooks/useScore'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import DigitPad from '../components/DigitPad/DigitPad'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './BuildNumberTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 9
const DEFAULT_DIGITS = 6

// The table always shows every place up to hundred-millions, regardless
// of the target's own digit count — otherwise the number of empty
// cells would just tell the student how many digits to type, turning
// "build the number" into a typing exercise instead of a place-value
// one. The student has to work out which columns to leave blank.
const TABLE_DIGITS = 9

function hasAnyValue(values) {
  return values.some((v) => v !== null && v !== undefined && v !== '')
}

// Cells the student left blank count as 0 (a blank higher-order column
// is exactly the correct answer for a number that doesn't reach that
// magnitude) — this also naturally still marks a skipped *real* digit
// as wrong, since substituting 0 there just makes the built number not
// match the target.
function valuesToAnswer(values) {
  return values.map((v) => (v === null || v === undefined || v === '' ? '0' : v))
}

function BuildNumberTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [target, setTarget] = useState(() => generateNumber(DEFAULT_DIGITS, true))
  const [result, setResult] = useState(null)

  const { values, activeIndex, enterDigit, enterDigitAt, backspaceAt, clearActive, setActiveIndex, reset } =
    useDigitEntry(TABLE_DIGITS)
  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setTarget(generateNumber(nextDigitCount, nextAllowZeros))
    setResult(null)
    reset()
  }

  const handleDigitCountChange = (value) => {
    setDigitCount(value)
    startNewRound(value, allowZeros)
  }

  const handleAllowZerosChange = (value) => {
    setAllowZeros(value)
    startNewRound(digitCount, value)
  }

  const handleDigitKey = (index, digit) => {
    if (isChecked) return
    enterDigitAt(index, digit)
  }

  const handleBackspaceKey = (index) => {
    if (isChecked) return
    backspaceAt(index)
  }

  const handleDigit = (digit) => {
    if (isChecked) return
    enterDigit(digit)
  }

  const handleClear = () => {
    if (isChecked) return
    clearActive()
  }

  const handleClearAll = () => {
    if (isChecked) return
    reset()
  }

  const handleCheck = () => {
    const ok = checkAnswer(valuesToAnswer(values), target)
    setResult(ok)
    recordAttempt(ok)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  return (
    <div className="build-number-task">
      <header className="build-number-header">
        <div>
          <h1>Építsd meg a számot</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="build-number-controls">
        <label className="build-number-slider">
          Számjegyek száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="build-number-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      <p className="build-number-prompt">
        Rakd ki a táblázatban ezt a számot: <strong>{formatWithSpaces(target)}</strong>
      </p>
      <p className="build-number-hint">A nem használt magasabb helyiértékeket hagyd üresen.</p>

      <PlaceValueTable
        mode="interactive"
        digitCount={TABLE_DIGITS}
        values={values}
        activeIndex={activeIndex}
        feedback={isChecked ? (result ? 'success' : 'error') : null}
        disabled={isChecked}
        onCellClick={setActiveIndex}
        onDigitKey={handleDigitKey}
        onBackspaceKey={handleBackspaceKey}
      />

      <DigitPad onDigit={handleDigit} onClear={handleClear} onClearAll={handleClearAll} disabled={isChecked} />

      <div className="build-number-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={!hasAnyValue(values)}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Következő szám
          </button>
        )}

        {isChecked && (
          <span className={`feedback-pill ${result ? 'feedback-success' : 'feedback-error'}`}>
            {result ? <CheckIcon size={20} /> : <CrossIcon size={20} />}
            {result ? 'Helyes!' : `Nem jó — a helyes szám: ${formatWithSpaces(target)}`}
          </span>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="build-number-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default BuildNumberTask

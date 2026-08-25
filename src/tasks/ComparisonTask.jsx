import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { decidingPlace } from '../utils/compareNumbers'
import { useScore } from '../hooks/useScore'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './ComparisonTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 6
const DEFAULT_DIGITS = 4

function randomDigitCount(max) {
  return MIN_DIGITS + Math.floor(Math.random() * (max - MIN_DIGITS + 1))
}

function generatePair(maxDigitCount, allowZeros) {
  let a, b, digitsA, digitsB
  do {
    digitsA = randomDigitCount(maxDigitCount)
    digitsB = randomDigitCount(maxDigitCount)
    a = generateNumber(digitsA, allowZeros)
    b = generateNumber(digitsB, allowZeros)
  } while (a === b)
  return { a, b, digitsA, digitsB }
}

function digitsOf(number, digitCount) {
  return String(number).padStart(digitCount, '0').split('').map(Number)
}

// Converts a place (1 = ones, 2 = tens, ...) into the cell index used by
// this number's own table, or null if that place is beyond its length
// (i.e. the other number is longer and wins purely on digit count).
function cellIndexForPlace(place, digitCount) {
  if (place > digitCount) return null
  return digitCount - place
}

function ComparisonTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [pair, setPair] = useState(() => generatePair(DEFAULT_DIGITS, true))
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null
  const place = decidingPlace(pair.a, pair.b)
  const winner = pair.a > pair.b ? 'a' : 'b'

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setPair(generatePair(nextDigitCount, nextAllowZeros))
    setResult(null)
  }

  const handleDigitCountChange = (value) => {
    setDigitCount(value)
    startNewRound(value, allowZeros)
  }

  const handleAllowZerosChange = (value) => {
    setAllowZeros(value)
    startNewRound(digitCount, value)
  }

  const handleSelect = (side) => {
    if (isChecked) return
    const ok = side === winner
    setResult({ picked: side, ok })
    recordAttempt(ok)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  const highlightA = isChecked ? cellIndexForPlace(place, pair.digitsA) : null
  const highlightB = isChecked ? cellIndexForPlace(place, pair.digitsB) : null

  return (
    <div className="comparison-task">
      <header className="comparison-header">
        <div>
          <h1>Számok összehasonlítása</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="comparison-controls">
        <label className="comparison-slider">
          Számjegyek száma (legfeljebb): <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="comparison-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      <p className="comparison-prompt">Melyik szám a nagyobb? Kattints a táblázatra!</p>

      <div className="comparison-pair">
        <button
          type="button"
          className={`comparison-card ${isChecked && winner === 'a' ? 'is-winner' : ''}`}
          disabled={isChecked}
          onClick={() => handleSelect('a')}
        >
          <PlaceValueTable
            mode="display"
            digitCount={pair.digitsA}
            values={digitsOf(pair.a, pair.digitsA)}
            highlightIndex={highlightA}
          />
        </button>

        <span className="comparison-vs">{isChecked ? (winner === 'a' ? '>' : '<') : '?'}</span>

        <button
          type="button"
          className={`comparison-card ${isChecked && winner === 'b' ? 'is-winner' : ''}`}
          disabled={isChecked}
          onClick={() => handleSelect('b')}
        >
          <PlaceValueTable
            mode="display"
            digitCount={pair.digitsB}
            values={digitsOf(pair.b, pair.digitsB)}
            highlightIndex={highlightB}
          />
        </button>
      </div>

      <div className="comparison-actions">
        {isChecked && (
          <button type="button" onClick={handleNext}>
            Következő pár
          </button>
        )}

        {isChecked && (
          <span className={`feedback-pill ${result.ok ? 'feedback-success' : 'feedback-error'}`}>
            {result.ok ? <CheckIcon size={20} /> : <CrossIcon size={20} />}
            {result.ok
              ? 'Helyes!'
              : `Nem jó — a ${winner === 'a' ? 'bal' : 'jobb'} oldali szám a nagyobb.`}
          </span>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="comparison-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default ComparisonTask

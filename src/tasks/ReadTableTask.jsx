import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { checkWrittenNumber, numberToHungarianWords } from '../utils/hungarianNumberWords'
import { useScore } from '../hooks/useScore'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './ReadTableTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 9
const DEFAULT_DIGITS = 6

function digitsOf(number, digitCount) {
  return String(number).padStart(digitCount, '0').split('').map(Number)
}

function ReadTableTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [target, setTarget] = useState(() => generateNumber(DEFAULT_DIGITS, true))
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setTarget(generateNumber(nextDigitCount, nextAllowZeros))
    setInput('')
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

  const handleCheck = () => {
    const ok = checkWrittenNumber(input, target)
    setResult(ok)
    recordAttempt(ok)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  return (
    <div className="read-table-task">
      <header className="read-table-header">
        <div>
          <h1>Olvasd le a táblázatot</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="read-table-controls">
        <label className="read-table-slider">
          Számjegyek száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="read-table-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      <p className="read-table-prompt">Írd le szöveggel a táblázatban látható számot:</p>

      <PlaceValueTable mode="display" digitCount={digitCount} values={digitsOf(target, digitCount)} />

      <div className="read-table-input-row">
        <input
          type="text"
          className="read-table-input"
          value={input}
          onChange={(e) => {
            if (isChecked) return
            setInput(e.target.value)
          }}
          placeholder="pl. száztizenkétezer-háromszáznegyven"
          disabled={isChecked}
        />
      </div>

      <div className="read-table-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={input.trim() === ''}>
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
            {result ? 'Helyes!' : `Nem jó — a helyes alak: ${numberToHungarianWords(target)}`}
          </span>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="read-table-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default ReadTableTask

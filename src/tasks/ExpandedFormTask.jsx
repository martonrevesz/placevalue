import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { checkAnswer } from '../utils/checkAnswer'
import { checkExpandedForm, numberToExpandedForm } from '../utils/expandedForm'
import { formatWithSpaces } from '../utils/formatNumber'
import { useScore } from '../hooks/useScore'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './ExpandedFormTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 6
const DEFAULT_DIGITS = 4
const DIRECTIONS = ['toExpanded', 'toNumber']

function digitsOf(number, digitCount) {
  return String(number).padStart(digitCount, '0').split('').map(Number)
}

function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
}

function ExpandedFormTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [target, setTarget] = useState(() => generateNumber(DEFAULT_DIGITS, true))
  const [direction, setDirection] = useState(randomDirection)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null
  const isToExpanded = direction === 'toExpanded'

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setTarget(generateNumber(nextDigitCount, nextAllowZeros))
    setDirection(randomDirection())
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
    const ok = isToExpanded ? checkExpandedForm(input, target) : checkAnswer(input, target)
    setResult(ok)
    recordAttempt(ok)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  const correctAnswerText = isToExpanded
    ? numberToExpandedForm(target)
    : formatWithSpaces(target)

  return (
    <div className="expanded-form-task">
      <header className="expanded-form-header">
        <div>
          <h1>Bontott alak</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="expanded-form-controls">
        <label className="expanded-form-slider">
          Számjegyek száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="expanded-form-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      {isToExpanded ? (
        <>
          <p className="expanded-form-prompt">Írd fel bontott alakban a táblázatban látható számot:</p>
          <PlaceValueTable mode="display" digitCount={digitCount} values={digitsOf(target, digitCount)} />
          <div className="expanded-form-input-row">
            <input
              type="text"
              className="expanded-form-input"
              value={input}
              onChange={(e) => {
                if (isChecked) return
                setInput(e.target.value)
              }}
              placeholder="pl. 4000 + 500 + 60 + 7"
              disabled={isChecked}
            />
          </div>
        </>
      ) : (
        <>
          <p className="expanded-form-prompt">Írd le, melyik szám bontott alakja ez:</p>
          <p className="expanded-form-expression">{numberToExpandedForm(target)}</p>
          <div className="expanded-form-input-row">
            <input
              type="text"
              inputMode="numeric"
              className="expanded-form-input"
              value={input}
              onChange={(e) => {
                if (isChecked) return
                setInput(e.target.value)
              }}
              placeholder="pl. 4567"
              disabled={isChecked}
            />
          </div>
        </>
      )}

      <div className="expanded-form-actions">
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
            {result ? 'Helyes!' : `Nem jó — a helyes válasz: ${correctAnswerText}`}
          </span>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="expanded-form-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default ExpandedFormTask

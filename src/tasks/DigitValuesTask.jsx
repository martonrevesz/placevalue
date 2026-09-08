import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { checkAnswer } from '../utils/checkAnswer'
import { formatWithSpaces } from '../utils/formatNumber'
import { useScore } from '../hooks/useScore'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import HintIcon from '../components/HintIcon/HintIcon'
import './DigitValuesTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 9
const DEFAULT_DIGITS = 4

const FIELDS = [
  {
    key: 'faceValue',
    label: 'Alaki érték',
    hint: 'A számjegy önmagában, a helyétől függetlenül.',
  },
  {
    key: 'placeValue',
    label: 'Helyi érték',
    hint: 'Az a szám (1, 10, 100, ...), amit a számjegy helye jelent.',
  },
  {
    key: 'trueValue',
    label: 'Valódi érték',
    hint: 'Az alaki érték és a helyi érték szorzata — amennyit a számjegy a szám egészében ér.',
  },
]

function buildRows(target, digitCount) {
  const digits = String(target).padStart(digitCount, '0').split('').map(Number)
  return digits.map((digit, i) => {
    const place = digitCount - i
    const placeValue = 10 ** (place - 1)
    return { place, digit, faceValue: digit, placeValue, trueValue: digit * placeValue }
  })
}

function emptyAnswers(digitCount) {
  return Array.from({ length: digitCount }, () => ({ faceValue: '', placeValue: '', trueValue: '' }))
}

function digitsOf(number, digitCount) {
  return String(number).padStart(digitCount, '0').split('').map(Number)
}

function DigitValuesTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [target, setTarget] = useState(() => generateNumber(DEFAULT_DIGITS, true))
  const [answers, setAnswers] = useState(() => emptyAnswers(DEFAULT_DIGITS))
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null
  const rows = buildRows(target, digitCount)

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setTarget(generateNumber(nextDigitCount, nextAllowZeros))
    setAnswers(emptyAnswers(nextDigitCount))
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

  const handleFieldChange = (rowIndex, field, value) => {
    if (isChecked) return
    setAnswers((prev) => {
      const next = [...prev]
      next[rowIndex] = { ...next[rowIndex], [field]: value }
      return next
    })
  }

  const isComplete = answers.every((row) => FIELDS.every(({ key }) => row[key].trim() !== ''))

  const handleCheck = () => {
    const grid = rows.map((row, i) => {
      const cell = {}
      FIELDS.forEach(({ key }) => {
        cell[key] = checkAnswer(answers[i][key], row[key])
      })
      return cell
    })
    const allCorrect = grid.every((cell) => FIELDS.every(({ key }) => cell[key]))
    setResult({ grid, allCorrect })
    recordAttempt(allCorrect)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  return (
    <div className="digit-values-task">
      <header className="digit-values-header">
        <div>
          <h1>Helyi érték, alaki érték, valódi érték</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="digit-values-controls">
        <label className="digit-values-slider">
          Számjegyek száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="digit-values-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      <p className="digit-values-prompt">
        Töltsd ki a táblázatot: add meg minden számjegy alaki, helyi és valódi értékét.
      </p>

      <PlaceValueTable mode="display" digitCount={digitCount} values={digitsOf(target, digitCount)} />

      <div className="digit-values-table-wrap">
        <table className="digit-values-table">
          <thead>
            <tr>
              <th>Számjegy</th>
              {rows.map((row) => (
                <th key={row.place} className="digit-values-digit">
                  {row.digit}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, hint }) => (
              <tr key={key}>
                <th scope="row">
                  {label}
                  <HintIcon hint={hint} />
                </th>
                {rows.map((row, i) => {
                  const cellOk = isChecked ? result.grid[i][key] : null
                  const cellClass = [
                    'digit-values-cell',
                    isChecked && (cellOk ? 'is-correct' : 'is-incorrect'),
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <td key={row.place} className={cellClass}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={answers[i][key]}
                        onChange={(e) => handleFieldChange(i, key, e.target.value)}
                        disabled={isChecked}
                      />
                      {isChecked && !cellOk && (
                        <div className="digit-values-hint">helyes: {formatWithSpaces(row[key])}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="digit-values-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={!isComplete}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Következő szám
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect ? 'Helyes!' : 'Nem jó — a piros mezők hibásak.'}
          </FeedbackPill>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="digit-values-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default DigitValuesTask

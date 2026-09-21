import { useState } from 'react'
import PermutationTree from '../components/PermutationTree/PermutationTree'
import { digitsToNumber, generatePermutations, pickDigitSet } from '../utils/permutations'
import { isTreeComplete, countFilled, countTotalBoxes } from '../utils/permutationTree'
import { checkAnswer } from '../utils/checkAnswer'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './NumberBuilderTask.css'

const MIN_DIGITS = 3
const MAX_DIGITS = 4

function summarize(digits) {
  const permutations = generatePermutations(digits, true)
  const numbers = permutations.map(digitsToNumber)
  const oddCount = permutations.filter((p) => Number(p[p.length - 1]) % 2 === 1).length
  return {
    totalCount: numbers.length,
    oddCount,
    minNumber: Math.min(...numbers),
    maxNumber: Math.max(...numbers),
  }
}

function NumberBuilderTask() {
  const [digitCount, setDigitCount] = useState(MIN_DIGITS)
  // First round (and the first round after changing the digit count)
  // is always zero-free — the leading-zero exception is worth meeting
  // only once the plain, no-exceptions case is already familiar.
  const [digits, setDigits] = useState(() => pickDigitSet(MIN_DIGITS, { forceNoZero: true }))
  const [treeValues, setTreeValues] = useState({})
  const [countInput, setCountInput] = useState('')
  const [oddInput, setOddInput] = useState('')
  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null
  const isComplete =
    isTreeComplete(digits, true, treeValues) &&
    countInput.trim() !== '' &&
    oddInput.trim() !== '' &&
    minInput.trim() !== '' &&
    maxInput.trim() !== ''

  const startNewRound = (nextDigitCount, options) => {
    setDigits(pickDigitSet(nextDigitCount, options))
    setTreeValues({})
    setCountInput('')
    setOddInput('')
    setMinInput('')
    setMaxInput('')
    setResult(null)
  }

  const handleDigitCountChange = (value) => {
    setDigitCount(value)
    startNewRound(value, { forceNoZero: true })
  }

  const handleCheck = () => {
    const { totalCount, oddCount, minNumber, maxNumber } = summarize(digits)
    const countOk = checkAnswer(countInput, totalCount)
    const oddOk = checkAnswer(oddInput, oddCount)
    const minOk = checkAnswer(minInput, minNumber)
    const maxOk = checkAnswer(maxInput, maxNumber)
    const allCorrect = countOk && oddOk && minOk && maxOk

    setResult({ countOk, oddOk, minOk, maxOk, totalCount, oddCount, minNumber, maxNumber, allCorrect })
    recordAttempt(allCorrect)
  }

  const handleNext = () => {
    startNewRound(digitCount)
  }

  const filled = countFilled(digits, true, treeValues)
  const totalBoxes = countTotalBoxes(digits, true)

  return (
    <div className="number-builder-task">
      <header className="number-builder-header">
        <div>
          <h1>SzámAlkotó</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="number-builder-controls">
        <label className="number-builder-slider">
          Számkártyák száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
      </section>

      <p className="number-builder-prompt">
        Ennyi számkártyád van: <strong>{digits.join(', ')}</strong>. Rakd ki mind a{' '}
        <strong>{digitCount}</strong>-jegyű számot, amit ezekből — mindegyik kártyát pontosan egyszer
        felhasználva — ki lehet rakni! Egy számban egy kártya nem szerepelhet kétszer, és a szám nem
        kezdődhet 0-val.
      </p>
      <p className="number-builder-progress">
        Kitöltve: {filled} / {totalBoxes}
      </p>

      <PermutationTree
        digits={digits}
        noLeadingZero
        values={treeValues}
        onChange={setTreeValues}
        disabled={isChecked}
      />

      <div className="number-builder-counts">
        <label className={`number-builder-count-field ${isChecked ? (result.countOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Hány különböző {digitCount}-jegyű szám rakható ki?
          <input
            type="text"
            inputMode="numeric"
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.countOk && <span className="number-builder-count-hint">helyes: {result.totalCount}</span>}
        </label>
        <label className={`number-builder-count-field ${isChecked ? (result.oddOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Hány lesz közülük páratlan?
          <input
            type="text"
            inputMode="numeric"
            value={oddInput}
            onChange={(e) => setOddInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.oddOk && <span className="number-builder-count-hint">helyes: {result.oddCount}</span>}
        </label>
        <label className={`number-builder-count-field ${isChecked ? (result.minOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Mennyi a legkisebb kirakható szám?
          <input
            type="text"
            inputMode="numeric"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.minOk && <span className="number-builder-count-hint">helyes: {result.minNumber}</span>}
        </label>
        <label className={`number-builder-count-field ${isChecked ? (result.maxOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Mennyi a legnagyobb kirakható szám?
          <input
            type="text"
            inputMode="numeric"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.maxOk && <span className="number-builder-count-hint">helyes: {result.maxNumber}</span>}
        </label>
      </div>

      <div className="number-builder-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={!isComplete}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Következő
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect ? 'Helyes!' : 'Nem jó — nézd meg a piros kérdéseket.'}
          </FeedbackPill>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="number-builder-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default NumberBuilderTask

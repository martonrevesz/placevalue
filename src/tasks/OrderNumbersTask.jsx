import { useState } from 'react'
import { generateNumber } from '../utils/numberGenerator'
import { formatWithSpaces } from '../utils/formatNumber'
import { useScore } from '../hooks/useScore'
import DragSortList from '../components/DragSortList/DragSortList'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './OrderNumbersTask.css'

const MIN_DIGITS = 2
const MAX_DIGITS = 9
const DEFAULT_DIGITS = 4

const COUNT = 4

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Most numbers use the full (max) digit count; occasionally one uses a
// randomly smaller one — a minority-case mixed length forces the
// student to actually compare magnitudes rather than just eyeballing
// digit count once and reading off the rest, without every round
// turning into a digit-count exercise instead of an ordering one.
const SHORTER_CHANCE = 0.25

function pickDigitCount(maxDigitCount) {
  if (maxDigitCount <= MIN_DIGITS || Math.random() >= SHORTER_CHANCE) return maxDigitCount
  return MIN_DIGITS + Math.floor(Math.random() * (maxDigitCount - MIN_DIGITS))
}

function generateSet(maxDigitCount, allowZeros, count) {
  const values = new Set()
  while (values.size < count) {
    values.add(generateNumber(pickDigitCount(maxDigitCount), allowZeros))
  }
  return shuffle([...values])
}

function OrderNumbersTask() {
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGITS)
  const [allowZeros, setAllowZeros] = useState(true)
  const [items, setItems] = useState(() => generateSet(DEFAULT_DIGITS, true, COUNT))
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const startNewRound = (nextDigitCount, nextAllowZeros) => {
    setItems(generateSet(nextDigitCount, nextAllowZeros, COUNT))
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

  const handleReorder = (nextItems) => {
    if (isChecked) return
    setItems(nextItems)
  }

  const handleCheck = () => {
    const sorted = [...items].sort((a, b) => a - b)
    const positionsCorrect = items.map((value, i) => value === sorted[i])
    const allCorrect = positionsCorrect.every(Boolean)
    setResult({ positionsCorrect, allCorrect, sorted })
    recordAttempt(allCorrect)
  }

  const handleNext = () => {
    startNewRound(digitCount, allowZeros)
  }

  return (
    <div className="order-numbers-task">
      <header className="order-numbers-header">
        <div>
          <h1>Számok sorba rendezése</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="order-numbers-controls">
        <label className="order-numbers-slider">
          Számjegyek száma (legfeljebb): <strong>{digitCount}</strong>
          <input
            type="range"
            min={MIN_DIGITS}
            max={MAX_DIGITS}
            value={digitCount}
            onChange={(e) => handleDigitCountChange(Number(e.target.value))}
          />
        </label>
        <label className="order-numbers-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => handleAllowZerosChange(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
      </section>

      <p className="order-numbers-prompt">
        Húzd a sorrendbe a számokat: legkisebb balra, legnagyobb jobbra.
      </p>

      <DragSortList
        items={items}
        getId={(value) => value}
        onReorder={handleReorder}
        disabled={isChecked}
        renderSeparator={() => <span className="order-numbers-separator">{'<'}</span>}
        renderItem={(value, { isDragging }) => {
          const index = items.indexOf(value)
          const isCorrect = isChecked ? result.positionsCorrect[index] : null
          const tileClass = [
            'order-numbers-tile',
            isDragging && 'is-dragging',
            isChecked && (isCorrect ? 'is-correct' : 'is-incorrect'),
          ]
            .filter(Boolean)
            .join(' ')
          return <div className={tileClass}>{formatWithSpaces(value)}</div>
        }}
      />

      <div className="order-numbers-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Következő
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect
              ? 'Helyes!'
              : `Nem jó — a helyes sorrend: ${result.sorted.map(formatWithSpaces).join(' < ')}`}
          </FeedbackPill>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="order-numbers-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default OrderNumbersTask

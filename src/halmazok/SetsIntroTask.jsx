import { useState } from 'react'
import VennSets from '../components/VennSets/VennSets'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './SetsIntroTask.css'

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1)
const ELEMENTS = NUMBERS.map((n) => ({ id: String(n), label: String(n) }))

// The "home" zone for each number when a base set exists: A = even
// numbers, B = multiples of three. A number belonging to neither goes
// to the base set, outside both circles.
function homeZone(n) {
  const inA = n % 2 === 0
  const inB = n % 3 === 0
  if (inA && inB) return 'intersection'
  if (inA) return 'onlyA'
  if (inB) return 'onlyB'
  return 'base'
}

function emptyPlacement() {
  return Object.fromEntries(ELEMENTS.map((el) => [el.id, 'unplaced']))
}

function SetsIntroTask({ onBack }) {
  const [hasBaseSet, setHasBaseSet] = useState(true)
  const [placement, setPlacement] = useState(emptyPlacement)
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const expectedZone = (n) => {
    const zone = homeZone(n)
    // Without a base set, "outside A and B" has nowhere to go but the tray.
    return zone === 'base' && !hasBaseSet ? 'unplaced' : zone
  }

  const handleHasBaseSetChange = (value) => {
    setHasBaseSet(value)
    setPlacement(emptyPlacement())
    setResult(null)
  }

  const handleCheck = () => {
    const feedback = {}
    NUMBERS.forEach((n) => {
      feedback[String(n)] = placement[String(n)] === expectedZone(n)
    })
    const allCorrect = Object.values(feedback).every(Boolean)
    setResult({ feedback, allCorrect })
    recordAttempt(allCorrect)
  }

  const handleReset = () => {
    setPlacement(emptyPlacement())
    setResult(null)
  }

  return (
    <div className="sets-intro-task">
      <header className="sets-intro-header">
        <div>
          <h1>Halmazok</h1>
          <button type="button" className="back-link" onClick={onBack}>
            ← Vissza a főoldalra
          </button>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="sets-intro-controls">
        <label className="sets-intro-checkbox">
          <input
            type="checkbox"
            checked={hasBaseSet}
            onChange={(e) => handleHasBaseSetChange(e.target.checked)}
          />
          Van alaphalmaz
        </label>
      </section>

      <p className="sets-intro-prompt">
        Húzd az 1-től 10-ig terjedő számokat a helyükre:{' '}
        <strong>A = {'{páros számok}'}</strong>, <strong>B = {'{3-mal osztható számok}'}</strong>
        {hasBaseSet && ', a többi szám az alaphalmazba kerül.'}
      </p>

      <VennSets
        labelA="A"
        labelB="B"
        hasBaseSet={hasBaseSet}
        baseLabel="Alaphalmaz: 1-10"
        elements={ELEMENTS}
        placement={placement}
        onPlacementChange={setPlacement}
        disabled={isChecked}
        feedback={isChecked ? result.feedback : null}
      />

      <div className="sets-intro-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleReset}>
            Újra
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect ? 'Helyes!' : 'Nem jó — a piros számok rossz helyen vannak.'}
          </FeedbackPill>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="sets-intro-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default SetsIntroTask

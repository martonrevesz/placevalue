import { useMemo, useState } from 'react'
import VennSets from '../components/VennSets/VennSets'
import { STUDENTS, PROPERTIES, valuesFor } from './students'
import GenderPanel from './GenderPanel'
import StudentCard from './StudentCard'
import { checkAnswer } from '../utils/checkAnswer'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './ClassSetsTask.css'

const GIRLS = STUDENTS.filter((s) => s.gender === 'F')
const BOYS = STUDENTS.filter((s) => s.gender === 'M')

// Every pair of properties, in a fixed order — cycled through
// deterministically rather than picked at random.
const PROPERTY_PAIRS = []
for (let i = 0; i < PROPERTIES.length; i++) {
  for (let j = i + 1; j < PROPERTIES.length; j++) {
    PROPERTY_PAIRS.push([PROPERTIES[i], PROPERTIES[j]])
  }
}

function expectedZone(hasA, hasB, id) {
  const a = hasA[id]
  const b = hasB[id]
  if (a && b) return 'intersection'
  if (a) return 'onlyA'
  if (b) return 'onlyB'
  return 'base'
}

function emptyPlacement() {
  return Object.fromEntries(STUDENTS.map((s) => [s.id, 'unplaced']))
}

function TwoPropertiesTask() {
  // The roster and each student's real attributes never change, only
  // which pair of properties is being asked about this round.
  const [pairIndex, setPairIndex] = useState(0)
  const [placement, setPlacement] = useState(emptyPlacement)
  const [intersectionInput, setIntersectionInput] = useState('')
  const [unionInput, setUnionInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const [propertyA, propertyB] = PROPERTY_PAIRS[pairIndex]
  const hasA = valuesFor(propertyA.key)
  const hasB = valuesFor(propertyB.key)
  const isChecked = result !== null

  const elements = useMemo(
    () => STUDENTS.map((s) => ({ ...s, content: <StudentCard student={s} /> })),
    [],
  )

  const isComplete =
    STUDENTS.every((s) => placement[s.id] !== 'unplaced') &&
    intersectionInput.trim() !== '' &&
    unionInput.trim() !== ''

  const startNewRound = () => {
    setPairIndex((i) => (i + 1) % PROPERTY_PAIRS.length)
    setPlacement(emptyPlacement())
    setIntersectionInput('')
    setUnionInput('')
    setResult(null)
  }

  const handleCheck = () => {
    const feedback = {}
    STUDENTS.forEach((s) => {
      feedback[s.id] = placement[s.id] === expectedZone(hasA, hasB, s.id)
    })
    const intersectionCount = STUDENTS.filter((s) => hasA[s.id] && hasB[s.id]).length
    const unionCount = STUDENTS.filter((s) => hasA[s.id] || hasB[s.id]).length
    const intersectionOk = checkAnswer(intersectionInput, intersectionCount)
    const unionOk = checkAnswer(unionInput, unionCount)
    const allCorrect = Object.values(feedback).every(Boolean) && intersectionOk && unionOk

    setResult({ feedback, intersectionOk, unionOk, intersectionCount, unionCount, allCorrect })
    recordAttempt(allCorrect)
  }

  return (
    <div className="class-sets-task">
      <header className="class-sets-header">
        <div>
          <h1>Halmazok — két tulajdonság</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <p className="class-sets-prompt">
        Ez egy 5. osztály névsora. Húzd mindenkit a megfelelő helyre:{' '}
        <strong>A = {`{${propertyA.label}}`}</strong>,{' '}
        <strong>B = {`{${propertyB.label}}`}</strong>, a többiek az osztály többi tanulója.
      </p>

      <div className="class-sets-layout">
        <GenderPanel gender="F" students={GIRLS} />

        <div className="class-sets-diagram-column">
          <VennSets
            labelA="A"
            labelB="B"
            hasBaseSet
            baseLabel="Az osztály"
            elements={elements}
            placement={placement}
            onPlacementChange={setPlacement}
            disabled={isChecked}
            feedback={isChecked ? result.feedback : null}
          />
        </div>

        <GenderPanel gender="M" students={BOYS} />
      </div>

      <div className="class-sets-counts">
        <label className={`class-sets-count-field ${isChecked ? (result.intersectionOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Hány gyerek van A ÉS B halmazban (a metszetben)?
          <input
            type="text"
            inputMode="numeric"
            value={intersectionInput}
            onChange={(e) => setIntersectionInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.intersectionOk && (
            <span className="class-sets-count-hint">helyes: {result.intersectionCount}</span>
          )}
        </label>
        <label className={`class-sets-count-field ${isChecked ? (result.unionOk ? 'is-correct' : 'is-incorrect') : ''}`}>
          Hány gyerek van A VAGY B halmazban (az egyesítésben)?
          <input
            type="text"
            inputMode="numeric"
            value={unionInput}
            onChange={(e) => setUnionInput(e.target.value)}
            disabled={isChecked}
          />
          {isChecked && !result.unionOk && (
            <span className="class-sets-count-hint">helyes: {result.unionCount}</span>
          )}
        </label>
      </div>

      <div className="class-sets-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={!isComplete}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={startNewRound}>
            Következő
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect ? 'Helyes!' : 'Nem jó — nézd meg a piros részeket.'}
          </FeedbackPill>
        )}
      </div>

      {total > 0 && (
        <button type="button" className="class-sets-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default TwoPropertiesTask

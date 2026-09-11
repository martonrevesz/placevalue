import { useMemo, useState } from 'react'
import VennSets from '../components/VennSets/VennSets'
import { STUDENTS, PROPERTIES, valuesFor } from './students'
import GenderPanel from './GenderPanel'
import StudentCard from './StudentCard'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './ClassSetsTask.css'

const GIRLS = STUDENTS.filter((s) => s.gender === 'F')
const BOYS = STUDENTS.filter((s) => s.gender === 'M')

function emptyPlacement() {
  return Object.fromEntries(STUDENTS.map((s) => [s.id, 'unplaced']))
}

function OnePropertyTask() {
  // Cycles through the fixed property list — the roster and each
  // student's real attributes never change, only which property is
  // being asked about this round.
  const [propertyIndex, setPropertyIndex] = useState(0)
  const [placement, setPlacement] = useState(emptyPlacement)
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const property = PROPERTIES[propertyIndex]
  const hasProperty = valuesFor(property.key)
  const isChecked = result !== null

  const elements = useMemo(
    () => STUDENTS.map((s) => ({ ...s, content: <StudentCard student={s} /> })),
    [],
  )

  const startNewRound = () => {
    setPropertyIndex((i) => (i + 1) % PROPERTIES.length)
    setPlacement(emptyPlacement())
    setResult(null)
  }

  const handleCheck = () => {
    const feedback = {}
    STUDENTS.forEach((s) => {
      const expected = hasProperty[s.id] ? 'onlyA' : 'base'
      feedback[s.id] = placement[s.id] === expected
    })
    const allCorrect = Object.values(feedback).every(Boolean)
    setResult({ feedback, allCorrect })
    recordAttempt(allCorrect)
  }

  return (
    <div className="class-sets-task">
      <header className="class-sets-header">
        <div>
          <h1>Halmazok — egy tulajdonság</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <p className="class-sets-prompt">
        Ez egy 5. osztály névsora. Húzd mindenkit a megfelelő helyre:{' '}
        <strong>A = {`{${property.label}}`}</strong>, a többiek az osztály többi tanulója.
      </p>

      <div className="class-sets-layout">
        <div className="class-sets-diagram-column">
          <VennSets
            labelA="A"
            hasSetB={false}
            hasBaseSet
            baseLabel="Az osztály"
            elements={elements}
            placement={placement}
            onPlacementChange={setPlacement}
            disabled={isChecked}
            feedback={isChecked ? result.feedback : null}
          />
        </div>

        <GenderPanel gender="F" students={GIRLS} />
        <GenderPanel gender="M" students={BOYS} />
      </div>

      <div className="class-sets-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={startNewRound}>
            Következő
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result.allCorrect}>
            {result.allCorrect ? 'Helyes!' : 'Nem jó — a piros nevek rossz helyen vannak.'}
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

export default OnePropertyTask

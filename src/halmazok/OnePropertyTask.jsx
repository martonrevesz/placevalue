import { useState } from 'react'
import VennSets from '../components/VennSets/VennSets'
import { pickStudents } from './students'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './ClassSetsTask.css'

const STUDENT_COUNT = 8

// Each property is independently 50/50 per student — an occasional
// round where everyone (or no one) has the property is a valid, real
// outcome, not a bug to design around.
const PROPERTIES = [
  { key: 'bike', label: 'kerékpárral jár iskolába' },
  { key: 'english', label: 'angolul tanul' },
  { key: 'swim', label: 'úszásra jár' },
  { key: 'football', label: 'focizik' },
]

function generateRound() {
  const students = pickStudents(STUDENT_COUNT)
  const property = PROPERTIES[Math.floor(Math.random() * PROPERTIES.length)]
  const hasProperty = Object.fromEntries(students.map((s) => [s.id, Math.random() < 0.5]))
  return { students, property, hasProperty }
}

function emptyPlacement(students) {
  return Object.fromEntries(students.map((s) => [s.id, 'unplaced']))
}

function OnePropertyTask() {
  const [round, setRound] = useState(generateRound)
  const [placement, setPlacement] = useState(() => emptyPlacement(round.students))
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const startNewRound = () => {
    const next = generateRound()
    setRound(next)
    setPlacement(emptyPlacement(next.students))
    setResult(null)
  }

  const handleCheck = () => {
    const feedback = {}
    round.students.forEach((s) => {
      const expected = round.hasProperty[s.id] ? 'onlyA' : 'base'
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
        <strong>A = {`{${round.property.label}}`}</strong>, a többiek az osztály többi tanulója.
      </p>

      <VennSets
        labelA="A"
        hasSetB={false}
        hasBaseSet
        baseLabel="Az osztály"
        elements={round.students}
        placement={placement}
        onPlacementChange={setPlacement}
        disabled={isChecked}
        feedback={isChecked ? result.feedback : null}
      />

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

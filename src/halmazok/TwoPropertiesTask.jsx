import { useState } from 'react'
import VennSets from '../components/VennSets/VennSets'
import { pickStudents } from './students'
import { checkAnswer } from '../utils/checkAnswer'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './ClassSetsTask.css'

const STUDENT_COUNT = 8

const PROPERTIES = [
  { key: 'bike', label: 'kerékpárral jár iskolába' },
  { key: 'english', label: 'angolul tanul' },
  { key: 'swim', label: 'úszásra jár' },
  { key: 'football', label: 'focizik' },
]

function pickTwoProperties() {
  const shuffled = [...PROPERTIES].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1]]
}

function generateRound() {
  const students = pickStudents(STUDENT_COUNT)
  const [propertyA, propertyB] = pickTwoProperties()
  const hasA = Object.fromEntries(students.map((s) => [s.id, Math.random() < 0.5]))
  const hasB = Object.fromEntries(students.map((s) => [s.id, Math.random() < 0.5]))
  return { students, propertyA, propertyB, hasA, hasB }
}

function expectedZone(round, id) {
  const a = round.hasA[id]
  const b = round.hasB[id]
  if (a && b) return 'intersection'
  if (a) return 'onlyA'
  if (b) return 'onlyB'
  return 'base'
}

function emptyPlacement(students) {
  return Object.fromEntries(students.map((s) => [s.id, 'unplaced']))
}

function TwoPropertiesTask() {
  const [round, setRound] = useState(generateRound)
  const [placement, setPlacement] = useState(() => emptyPlacement(round.students))
  const [intersectionInput, setIntersectionInput] = useState('')
  const [unionInput, setUnionInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null
  const isComplete =
    round.students.every((s) => placement[s.id] !== 'unplaced') &&
    intersectionInput.trim() !== '' &&
    unionInput.trim() !== ''

  const startNewRound = () => {
    const next = generateRound()
    setRound(next)
    setPlacement(emptyPlacement(next.students))
    setIntersectionInput('')
    setUnionInput('')
    setResult(null)
  }

  const handleCheck = () => {
    const feedback = {}
    round.students.forEach((s) => {
      feedback[s.id] = placement[s.id] === expectedZone(round, s.id)
    })
    const intersectionCount = round.students.filter((s) => round.hasA[s.id] && round.hasB[s.id]).length
    const unionCount = round.students.filter((s) => round.hasA[s.id] || round.hasB[s.id]).length
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
        <strong>A = {`{${round.propertyA.label}}`}</strong>,{' '}
        <strong>B = {`{${round.propertyB.label}}`}</strong>, a többiek az osztály többi tanulója.
      </p>

      <VennSets
        labelA="A"
        labelB="B"
        hasBaseSet
        baseLabel="Az osztály"
        elements={round.students}
        placement={placement}
        onPlacementChange={setPlacement}
        disabled={isChecked}
        feedback={isChecked ? result.feedback : null}
      />

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

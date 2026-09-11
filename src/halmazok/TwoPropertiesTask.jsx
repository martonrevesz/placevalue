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

function pairOf(keyA, keyB) {
  return [PROPERTIES.find((p) => p.key === keyA), PROPERTIES.find((p) => p.key === keyB)]
}

// Every pair of properties, hand-ordered (not generated/shuffled) so
// each kind of Venn relationship shows up deliberately rather than by
// chance: most rounds split into four non-empty regions, but a few are
// worth meeting on purpose —
//  - "bike"/"walk", "english"/"german", "swim"/"football": the two
//    alternatives of one category, always a full partition (empty
//    intersection AND empty "neither", since every student picks
//    exactly one option).
//  - "walk"/"german": every German speaker also walks (§students.js),
//    so "B only" (German but not walking) is empty — a strict subset,
//    not a partition.
//  - "bike"/"english": the mirror case — every biker also learns
//    English, so "A only" (bike but not English) is empty.
const PROPERTY_PAIRS = [
  pairOf('bike', 'swim'),
  pairOf('bike', 'walk'),
  pairOf('bike', 'football'),
  pairOf('walk', 'swim'),
  pairOf('walk', 'german'),
  pairOf('walk', 'football'),
  pairOf('english', 'german'),
  pairOf('bike', 'english'),
  pairOf('bike', 'german'),
  pairOf('walk', 'english'),
  pairOf('english', 'swim'),
  pairOf('english', 'football'),
  pairOf('german', 'swim'),
  pairOf('german', 'football'),
  pairOf('swim', 'football'),
]

// Only worth a callout when the round hits one of the special Venn
// shapes (see the PROPERTY_PAIRS comment above) — an ordinary round
// where all four regions are just "some, but not all or none" doesn't
// need a note, so this returns null and the feedback area stays quiet.
function describeSpecialCase({ interCount, onlyACount, onlyBCount, baseCount, labelA, labelB }) {
  if (interCount === 0 && baseCount === 0) {
    return 'Ez a két tulajdonság kizárja egymást: senki sem teljesíti mindkettőt, de mindenki teljesíti legalább az egyiket.'
  }
  if (onlyACount === 0 && onlyBCount === 0) {
    return 'Ez a két tulajdonság mindig együtt jár: aki teljesíti az egyiket, az a másikat is teljesíti.'
  }
  if (onlyACount === 0) {
    return `Mindenki, aki ${labelA}, az ${labelB} is — tehát A részhalmaza B-nek.`
  }
  if (onlyBCount === 0) {
    return `Mindenki, aki ${labelB}, az ${labelA} is — tehát B részhalmaza A-nak.`
  }
  if (interCount === 0) {
    return 'Ennek a két tulajdonságnak nincs közös teljesítője: senki sem felel meg mindkettőnek egyszerre.'
  }
  if (baseCount === 0) {
    return 'A két tulajdonság együtt mindenkit lefed: mindenki teljesíti legalább az egyiket.'
  }
  return null
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
    const onlyACount = STUDENTS.filter((s) => hasA[s.id] && !hasB[s.id]).length
    const onlyBCount = STUDENTS.filter((s) => !hasA[s.id] && hasB[s.id]).length
    const baseCount = STUDENTS.length - intersectionCount - onlyACount - onlyBCount
    const unionCount = intersectionCount + onlyACount + onlyBCount
    const intersectionOk = checkAnswer(intersectionInput, intersectionCount)
    const unionOk = checkAnswer(unionInput, unionCount)
    const allCorrect = Object.values(feedback).every(Boolean) && intersectionOk && unionOk
    const specialCase = describeSpecialCase({
      interCount: intersectionCount,
      onlyACount,
      onlyBCount,
      baseCount,
      labelA: propertyA.label,
      labelB: propertyB.label,
    })

    setResult({ feedback, intersectionOk, unionOk, intersectionCount, unionCount, allCorrect, specialCase })
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

        <GenderPanel gender="F" students={GIRLS} />
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

      {isChecked && result.specialCase && (
        <p className="class-sets-observation">
          <strong>Megfigyelés:</strong> {result.specialCase}
        </p>
      )}

      {total > 0 && (
        <button type="button" className="class-sets-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default TwoPropertiesTask

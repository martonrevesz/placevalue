import { useMemo, useState } from 'react'
import {
  buildDivisionLayout,
  fieldQuestion,
  fieldText,
  generateDivisionProblem,
  isFieldFinished,
  reachedFieldCount,
} from '../utils/longDivision'
import { useScore } from '../hooks/useScore'
import WrittenDivision from '../components/WrittenDivision/WrittenDivision'
import DigitPad from '../components/DigitPad/DigitPad'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import HintIcon from '../components/HintIcon/HintIcon'
import './WrittenDivisionTask.css'

const MIN_DIVIDEND_DIGITS = 3
const MAX_DIVIDEND_DIGITS = 5
const DEFAULT_DIVIDEND_DIGITS = 4
const MIN_DIVISOR_DIGITS = 1
const MAX_DIVISOR_DIGITS = 2
const DEFAULT_DIVISOR_DIGITS = 2

// `values` maps a field id to its cells ('' = empty); `active` is the
// field being typed into and `cursor` the cell within it the next digit
// goes into. The first field is a single quotient cell, so cursor 0.
// `revealed` is how many fields (in writing order) are shown so far —
// it only ever grows, so erasing a digit doesn't make a row vanish.
const emptyEntry = () => ({ values: {}, active: 0, cursor: 0, revealed: 1 })

// "05" for a remainder of 5 is a notation slip, not an arithmetic one —
// and the highlighted empty tens cell all but invites it, since after
// the 5 the grid can't know a second digit isn't coming (it could be 15).
function withoutLeadingZeros(text) {
  return text?.replace(/^0+(?=\d)/, '') ?? text
}

function parseNumberInput(text) {
  const cleaned = text.replace(/\s/g, '')
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null
}

/**
 * Written division in the workbook's subtraction form, in three parts:
 * becslés (how many digits will the quotient have — asked before the
 * grid appears, since the grid's quotient cells would give it away),
 * the division itself, then ellenőrzés (multiply back, using the
 * student's OWN quotient and remainder, as one would on paper). All
 * three are graded together at the end — the button is "Kész" rather
 * than the usual "Ellenőrzés" so it doesn't collide with that step.
 */
function WrittenDivisionTask() {
  const [dividendDigits, setDividendDigits] = useState(DEFAULT_DIVIDEND_DIGITS)
  const [divisorDigits, setDivisorDigits] = useState(DEFAULT_DIVISOR_DIGITS)
  const [problem, setProblem] = useState(() => generateDivisionProblem(DEFAULT_DIVIDEND_DIGITS, DEFAULT_DIVISOR_DIGITS))
  const [phase, setPhase] = useState('estimate')
  const [estimateInput, setEstimateInput] = useState('')
  const [entry, setEntry] = useState(emptyEntry)
  const [checkInput, setCheckInput] = useState('')
  const [result, setResult] = useState(null)
  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const layout = useMemo(() => buildDivisionLayout(problem), [problem])
  const { fields } = layout
  const isChecked = result !== null

  const quotientFields = fields.filter((f) => f.kind === 'quotient')
  const finalRemainderField = fields.filter((f) => f.kind === 'remainder').at(-1)
  const textOf = (field) => fieldText(entry.values[field.id])
  const studentQuotient = quotientFields.every(textOf) ? Number(quotientFields.map(textOf).join('')) : null
  const studentRemainder = textOf(finalRemainderField) ? Number(textOf(finalRemainderField)) : null
  // A field with a gap in it (null) counts as filled — and gets graded wrong.
  const allFieldsFilled = fields.every((f) => textOf(f) !== '')
  const unitsCell = (index) => fields[index].cols.length - 1
  const cellsOf = (values, field) => [...(values[field.id] ?? Array(field.cols.length).fill(''))]

  const estimateDigits = parseNumberInput(estimateInput)

  const startNewRound = (nextDividendDigits, nextDivisorDigits) => {
    setProblem(generateDivisionProblem(nextDividendDigits, nextDivisorDigits))
    setPhase('estimate')
    setEstimateInput('')
    setEntry(emptyEntry())
    setCheckInput('')
    setResult(null)
  }

  const handleDividendDigitsChange = (value) => {
    setDividendDigits(value)
    startNewRound(value, divisorDigits)
  }

  const handleDivisorDigitsChange = (value) => {
    setDivisorDigits(value)
    startNewRound(dividendDigits, value)
  }

  // Any cell can be written — the digit goes into the highlighted cell,
  // overwriting only that cell. Focus then just suggests the logical next
  // cell: one to the left (rows are written from the units), unless an
  // empty cell was left to the right, which comes first; once the row is
  // complete, the next field's units cell.
  // Every update goes through here: rows appear as the student reaches
  // them (see reachedFieldCount), or moves into them on purpose — and
  // stay once shown.
  const updateEntry = (compute) =>
    setEntry((prev) => {
      const next = compute(prev)
      if (next === prev) return prev
      const revealed = Math.max(prev.revealed, reachedFieldCount(fields, next.values), next.active + 1)
      return { ...next, revealed }
    })

  const enterDigit = (digit) => {
    if (isChecked) return
    updateEntry((prev) => {
      const field = fields[prev.active]
      const cells = cellsOf(prev.values, field)
      const cell = prev.cursor
      cells[cell] = digit
      const values = { ...prev.values, [field.id]: cells }
      const emptyToTheRight = cells.lastIndexOf('')
      if (emptyToTheRight > cell) return { values, active: prev.active, cursor: emptyToTheRight }
      const finished =
        cell === 0 || isFieldFinished(field, cells, { divisor: problem.divisor, steps: problem.steps, values })
      if (!finished) return { values, active: prev.active, cursor: cell - 1 }
      if (prev.active === fields.length - 1) return { values, active: prev.active, cursor: cell }
      return { values, active: prev.active + 1, cursor: unitsCell(prev.active + 1) }
    })
  }

  // Clears the highlighted cell; on an empty one, steps back the way
  // the row was typed (one cell to the right, then into the previous
  // field) and clears that instead.
  const backspace = () => {
    if (isChecked) return
    updateEntry((prev) => {
      const field = fields[prev.active]
      const cells = cellsOf(prev.values, field)
      if (cells[prev.cursor] || prev.cursor < field.cols.length - 1) {
        const cell = cells[prev.cursor] ? prev.cursor : prev.cursor + 1
        cells[cell] = ''
        return { ...prev, values: { ...prev.values, [field.id]: cells }, cursor: cell }
      }
      if (prev.active === 0) return prev
      const previous = fields[prev.active - 1]
      const previousCells = cellsOf(prev.values, previous)
      const filled = previousCells.flatMap((c, i) => (c ? [i] : []))
      const cell = filled.length ? filled[0] : previous.cols.length - 1
      previousCells[cell] = ''
      return { values: { ...prev.values, [previous.id]: previousCells }, active: prev.active - 1, cursor: cell }
    })
  }

  const move = (delta) => {
    updateEntry((prev) => {
      const active = Math.min(Math.max(prev.active + delta, 0), fields.length - 1)
      return { ...prev, active, cursor: unitsCell(active) }
    })
  }

  // Arrow keys: one cell at a time, crossing into the neighbouring field
  // at a field's edge.
  const moveCell = (delta) => {
    updateEntry((prev) => {
      const cursor = prev.cursor + delta
      if (cursor >= 0 && cursor < fields[prev.active].cols.length) return { ...prev, cursor }
      const active = prev.active + delta
      if (active < 0 || active >= fields.length) return prev
      return { ...prev, active, cursor: delta > 0 ? 0 : unitsCell(active) }
    })
  }

  const select = (index, cell) => updateEntry((prev) => ({ ...prev, active: index, cursor: cell }))

  const clearAll = () => {
    if (isChecked) return
    setEntry(emptyEntry())
  }

  const handleCheck = () => {
    const fieldResults = {}
    fields.forEach((f) => {
      fieldResults[f.id] = withoutLeadingZeros(textOf(f)) === f.expected
    })
    const estimateOk = estimateDigits === problem.steps.length
    const checkExpected =
      studentQuotient !== null && studentRemainder !== null ? studentQuotient * problem.divisor + studentRemainder : null
    const checkOk = checkExpected !== null && parseNumberInput(checkInput) === checkExpected
    const allOk = Object.values(fieldResults).every(Boolean) && estimateOk && checkOk
    setResult({ fieldResults, estimateOk, checkOk, checkExpected, allOk })
    recordAttempt(allOk)
  }

  const exercise = `${problem.dividend} : ${problem.divisor}`

  // The same row is the input in the becslés step and a read-only recap
  // (tinted after grading) under it once the grid is showing.
  const goToSolve = () => {
    if (estimateDigits !== null) setPhase('solve')
  }
  const estimateRow = (editable) => (
    <label
      className={`written-division-field ${isChecked ? (result.estimateOk ? 'is-correct' : 'is-incorrect') : ''}`}
    >
      Hány jegyű lesz a hányados?
      <input
        type="text"
        inputMode="numeric"
        className="is-short"
        value={estimateInput}
        onChange={(e) => setEstimateInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goToSolve()
        }}
        disabled={!editable}
        autoFocus={editable}
      />
    </label>
  )

  return (
    <div className="written-division-task">
      <header className="written-division-header">
        <div>
          <h1>Írásbeli osztás</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <section className="written-division-controls">
        <label className="written-division-slider">
          Osztandó jegyei: <strong>{dividendDigits}</strong>
          <input
            type="range"
            min={MIN_DIVIDEND_DIGITS}
            max={MAX_DIVIDEND_DIGITS}
            value={dividendDigits}
            onChange={(e) => handleDividendDigitsChange(Number(e.target.value))}
          />
        </label>
        <label className="written-division-slider">
          Osztó jegyei: <strong>{divisorDigits}</strong>
          <input
            type="range"
            min={MIN_DIVISOR_DIGITS}
            max={MAX_DIVISOR_DIGITS}
            value={divisorDigits}
            onChange={(e) => handleDivisorDigitsChange(Number(e.target.value))}
          />
        </label>
      </section>

      <p className="written-division-prompt">
        Végezd el az írásbeli osztást: <strong>{exercise}</strong>
      </p>

      {phase === 'estimate' ? (
        <section className="written-division-step">
          <h2>1. Becslés</h2>
          {estimateRow(true)}
          <p className="written-division-hint">
            Tipp: vegyél az osztandó elejéről annyi jegyet, hogy megvan benne az osztó — ez adja a hányados első jegyét,
            és az osztandó minden további jegye még egy-egy jegyet.
          </p>
          <div className="written-division-actions">
            <button type="button" onClick={goToSolve} disabled={estimateDigits === null}>
              Tovább
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="written-division-step">
            <h2>1. Becslés</h2>
            {estimateRow(false)}
            {isChecked && !result.estimateOk && (
              <p className="written-division-hint">
                A hányados {problem.steps.length} jegyű ({problem.quotient}).
              </p>
            )}
          </section>

          <section className="written-division-step">
            <h2>2. Számolás</h2>
            <p className="written-division-hint">
              Írd be a hányados jegyeit, a szorzatokat, a maradékokat és a lehozott számjegyeket. A szorzatot és a
              maradékot jobbról balra, az egyesektől kezdve írd, ahogy papíron is. Bármelyik négyzetbe kattinthatsz; a
              nyilakkal négyzetenként, Enterrel a következő mezőre léphetsz.
            </p>
            <div className="written-division-work">
              <WrittenDivision
                layout={layout}
                values={entry.values}
                activeIndex={entry.active}
                activeCell={entry.cursor}
                revealed={isChecked ? fields.length : entry.revealed}
                results={isChecked ? result.fieldResults : null}
                disabled={isChecked}
                onSelect={select}
                onDigit={enterDigit}
                onBackspace={backspace}
                onMove={move}
                onMoveCell={moveCell}
              />
              {/* The osztó's 5× and 10× multiples: comparing a partial
                  dividend with them tells whether its quotient digit is
                  below or above 5 — it can never reach 10. */}
              <aside className="written-division-tipbox">
                <p className="written-division-tipbox-title">Segítség</p>
                <p>
                  5 · {problem.divisor} = {5 * problem.divisor}
                </p>
                <p>
                  10 · {problem.divisor} = {10 * problem.divisor}
                </p>
                {/* What the cell being filled answers, on hover — kept
                    here rather than in the grid so the grid stays clean. */}
                {!isChecked && (
                  <p className="written-division-tipbox-question">
                    Mit számolok most?{' '}
                    <HintIcon
                      hint={fieldQuestion(fields[entry.active], {
                        divisor: problem.divisor,
                        steps: problem.steps,
                        values: entry.values,
                      })}
                    />
                  </p>
                )}
              </aside>
            </div>
            <DigitPad onDigit={enterDigit} onClear={backspace} onClearAll={clearAll} disabled={isChecked} />
          </section>

          <section className="written-division-step">
            <h2>3. Ellenőrzés</h2>
            <label
              className={`written-division-field ${isChecked ? (result.checkOk ? 'is-correct' : 'is-incorrect') : ''}`}
            >
              <span className="written-division-check-expression">
                {studentQuotient ?? '…'} · {problem.divisor} + {studentRemainder ?? '…'} =
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                disabled={isChecked}
              />
            </label>
            {isChecked && !result.checkOk && result.checkExpected !== null && (
              <p className="written-division-hint">A szorzás eredménye: {result.checkExpected}</p>
            )}
            {isChecked && result.checkOk && (
              <p className="written-division-hint">
                {result.checkExpected === problem.dividend
                  ? 'Megegyezik az osztandóval — az ellenőrzés szerint jól számoltál.'
                  : `Nem egyezik az osztandóval (${problem.dividend}) — az ellenőrzés hibát jelez a számolásban.`}
              </p>
            )}
          </section>

          <div className="written-division-actions">
            {!isChecked ? (
              <button type="button" onClick={handleCheck} disabled={!allFieldsFilled || !checkInput.trim()}>
                Kész
              </button>
            ) : (
              <button type="button" onClick={() => startNewRound(dividendDigits, divisorDigits)}>
                Következő feladat
              </button>
            )}
            {isChecked && (
              <FeedbackPill ok={result.allOk}>
                {result.allOk
                  ? 'Helyes!'
                  : `Nem jó — ${exercise} = ${problem.quotient}${problem.remainder ? `, maradék: ${problem.remainder}` : ''}`}
              </FeedbackPill>
            )}
          </div>
          {!isChecked && !allFieldsFilled && (
            <p className="written-division-hint">A „Kész” gomb akkor válik elérhetővé, ha minden mezőt kitöltöttél.</p>
          )}
        </>
      )}

      {total > 0 && (
        <button type="button" className="written-division-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default WrittenDivisionTask

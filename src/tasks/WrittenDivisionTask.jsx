import { useMemo, useState } from 'react'
import {
  buildDivisionLayout,
  fieldText,
  firstCell,
  generateDivisionProblem,
  isAcceptedEstimateQuotient,
  isFieldFinished,
  isLeftToRight,
  isReasonableRoundedDividend,
  roundDivisorForEstimate,
  suggestEstimate,
} from '../utils/longDivision'
import { useScore } from '../hooks/useScore'
import WrittenDivision from '../components/WrittenDivision/WrittenDivision'
import DigitPad from '../components/DigitPad/DigitPad'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './WrittenDivisionTask.css'

const MIN_DIVIDEND_DIGITS = 3
const MAX_DIVIDEND_DIGITS = 5
const DEFAULT_DIVIDEND_DIGITS = 4
const MIN_DIVISOR_DIGITS = 1
const MAX_DIVISOR_DIGITS = 2
const DEFAULT_DIVISOR_DIGITS = 2

// `values` maps a field id to its cells ('' = empty). `cursor` is the
// cell the next digit goes into; null means the active field was just
// (re)entered, so the next digit starts it over from its first cell.
const emptyEntry = () => ({ values: {}, active: 0, cursor: null })
const emptyEstimate = () => ({ dividend: '', divisor: '', quotient: '' })

function parseNumberInput(text) {
  const cleaned = text.replace(/\s/g, '')
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null
}

/**
 * Written division in the workbook's subtraction form, in three parts:
 * becslés (round both numbers and divide in your head, as in the
 * textbooks — done before the grid appears, so it's a real estimate),
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
  const [estimate, setEstimate] = useState(emptyEstimate)
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
  const activeCell = entry.cursor ?? firstCell(fields[entry.active], entry.values, problem.divisor)

  // A one-digit divisor is already easy to divide by, so only the
  // dividend gets rounded then.
  const roundsDivisor = problem.divisor >= 10
  const estimateDividend = parseNumberInput(estimate.dividend)
  const estimateDivisor = roundsDivisor ? parseNumberInput(estimate.divisor) : problem.divisor
  const estimateQuotient = parseNumberInput(estimate.quotient)
  const estimateComplete = estimateDividend !== null && estimateDivisor !== null && estimateQuotient !== null
  const updateEstimate = (part) => (e) => setEstimate((prev) => ({ ...prev, [part]: e.target.value }))
  const estimateClass = (ok) => (isChecked ? (ok ? 'is-correct' : 'is-incorrect') : '')

  const startNewRound = (nextDividendDigits, nextDivisorDigits) => {
    setProblem(generateDivisionProblem(nextDividendDigits, nextDivisorDigits))
    setPhase('estimate')
    setEstimate(emptyEstimate())
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

  // A digit lands in the cursor cell and stays there; the cursor then
  // steps right (product row) or left (remainder row). A field being
  // (re)entered starts over from its first cell, so fixing one is just
  // "click it, type the number again".
  const enterDigit = (digit) => {
    if (isChecked) return
    setEntry((prev) => {
      const field = fields[prev.active]
      const width = field.cols.length
      const fresh = prev.cursor === null
      const cells = fresh ? Array(width).fill('') : [...(prev.values[field.id] ?? Array(width).fill(''))]
      const cell = fresh ? firstCell(field, prev.values, problem.divisor) : prev.cursor
      cells[cell] = digit
      const values = { ...prev.values, [field.id]: cells }
      const nextCell = cell + (isLeftToRight(field) ? 1 : -1)
      const finished = isFieldFinished(field, cells, nextCell, { divisor: problem.divisor, steps: problem.steps, values })
      if (!finished) return { values, active: prev.active, cursor: nextCell }
      return { values, active: Math.min(prev.active + 1, fields.length - 1), cursor: null }
    })
  }

  // Erases the most recently typed digit — the rightmost one in a product
  // row, the leftmost in a remainder row — stepping back into the
  // previous field once this one is empty.
  const backspace = () => {
    if (isChecked) return
    setEntry((prev) => {
      const eraseLastIn = (index) => {
        const field = fields[index]
        const cells = [...(prev.values[field.id] ?? Array(field.cols.length).fill(''))]
        const filled = cells.flatMap((c, i) => (c ? [i] : []))
        if (filled.length === 0) return null
        const cell = isLeftToRight(field) ? filled.at(-1) : filled[0]
        cells[cell] = ''
        return { values: { ...prev.values, [field.id]: cells }, active: index, cursor: cell }
      }
      return (
        eraseLastIn(prev.active) ??
        (prev.active > 0 ? (eraseLastIn(prev.active - 1) ?? { ...prev, active: prev.active - 1, cursor: null }) : prev)
      )
    })
  }

  const move = (delta) => {
    setEntry((prev) => {
      const active = Math.min(Math.max(prev.active + delta, 0), fields.length - 1)
      return { ...prev, active, cursor: null }
    })
  }

  const select = (index) => setEntry((prev) => ({ ...prev, active: index, cursor: null }))

  const clearAll = () => {
    if (isChecked) return
    setEntry(emptyEntry())
  }

  const handleCheck = () => {
    const fieldResults = {}
    fields.forEach((f) => {
      fieldResults[f.id] = textOf(f) === f.expected
    })
    const estimateResult = {
      dividendOk: isReasonableRoundedDividend(estimateDividend, problem.dividend),
      divisorOk: estimateDivisor === roundDivisorForEstimate(problem.divisor),
      quotientOk: isAcceptedEstimateQuotient(estimateQuotient, estimateDividend, estimateDivisor),
    }
    const estimateOk = Object.values(estimateResult).every(Boolean)
    const checkExpected =
      studentQuotient !== null && studentRemainder !== null ? studentQuotient * problem.divisor + studentRemainder : null
    const checkOk = checkExpected !== null && parseNumberInput(checkInput) === checkExpected
    const allOk = Object.values(fieldResults).every(Boolean) && estimateOk && checkOk
    setResult({ fieldResults, estimateResult, estimateOk, checkOk, checkExpected, allOk })
    recordAttempt(allOk)
  }

  const exercise = `${problem.dividend} : ${problem.divisor}`
  const suggestion = suggestEstimate(problem.dividend, problem.divisor)

  // The same row is the input in the becslés step and a read-only recap
  // (tinted after grading) under it once the grid is showing.
  const goToSolve = () => {
    if (estimateComplete) setPhase('solve')
  }
  const estimateRow = (editable) => (
    <div className="written-division-field">
      <span className="written-division-check-expression">{exercise} ≈</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label="kerekített osztandó"
        className={estimateClass(result?.estimateResult.dividendOk)}
        value={estimate.dividend}
        onChange={updateEstimate('dividend')}
        disabled={!editable}
        autoFocus={editable}
      />
      <span className="written-division-check-expression">:</span>
      {roundsDivisor ? (
        <input
          type="text"
          inputMode="numeric"
          aria-label="kerekített osztó"
          className={`is-short ${estimateClass(result?.estimateResult.divisorOk)}`}
          value={estimate.divisor}
          onChange={updateEstimate('divisor')}
          disabled={!editable}
        />
      ) : (
        <span className="written-division-check-expression">{problem.divisor}</span>
      )}
      <span className="written-division-check-expression">=</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label="becsült hányados"
        className={estimateClass(result?.estimateResult.quotientOk)}
        value={estimate.quotient}
        onChange={updateEstimate('quotient')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goToSolve()
        }}
        disabled={!editable}
      />
    </div>
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
          <p className="written-division-hint">Kerekítsd a számokat, és becsüld meg fejben a hányadost!</p>
          {estimateRow(true)}
          <p className="written-division-hint">
            Tipp: {roundsDivisor ? 'az osztót kerekítsd tízesre, az osztandót pedig' : 'az osztandót kerekítsd'} egy olyan
            kerek számra, amely közel van hozzá, és fejben könnyen osztható. Például: 4180 : 38 ≈ 4000 : 40 = 100.
          </p>
          <div className="written-division-actions">
            <button type="button" onClick={goToSolve} disabled={!estimateComplete}>
              Tovább
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="written-division-step">
            <h2>1. Becslés</h2>
            {estimateRow(false)}
            {isChecked && (
              <p className="written-division-hint">
                Becslésed: ≈ {estimateQuotient}, a pontos hányados: {problem.quotient}.
                {!result.estimateOk &&
                  ` Egy jó becslés például: ${suggestion.roundedDividend} : ${suggestion.roundedDivisor} ${
                    suggestion.exact ? '=' : '≈'
                  } ${suggestion.quotient}.`}
              </p>
            )}
          </section>

          <section className="written-division-step">
            <h2>2. Számolás</h2>
            <p className="written-division-hint">
              Írd be a hányados jegyeit, a szorzatokat, a maradékokat és a lehozott számjegyeket. A szorzatot balról
              jobbra, a maradékot jobbról balra, az egyesektől kezdve írd, ahogy papíron is. Enter vagy → a következő
              mezőre lép.
            </p>
            <WrittenDivision
              layout={layout}
              values={entry.values}
              activeIndex={entry.active}
              activeCell={activeCell}
              results={isChecked ? result.fieldResults : null}
              disabled={isChecked}
              onSelect={select}
              onDigit={enterDigit}
              onBackspace={backspace}
              onMove={move}
            />
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

import { useState } from 'react'
import { describePlace } from '../utils/placeInfo'
import { generateRound, describeStep } from '../utils/cashRegister'
import { checkAnswer } from '../utils/checkAnswer'
import { formatWithSpaces } from '../utils/formatNumber'
import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import FeedbackPill from '../components/FeedbackPill/FeedbackPill'
import './CashRegisterTask.css'

const MIN_DRAWERS = 2
// Capped at the tízezres (10 000) drawer — no higher denomination.
const MAX_DRAWERS = 5
const DEFAULT_DRAWERS = 5

// Places 1-3 (egyes/tízes/százas, values 1/10/100) are drawn as coins;
// 4 and up (ezres and beyond, values 1000+) as notes — matching the
// coin/note boundary a student would actually expect.
const NOTE_START_PLACE = 4

function buildDrawers(deposits) {
  const drawers = []
  for (let place = deposits.length; place >= 1; place--) {
    drawers.push({ place, deposit: deposits[place - 1], ...describePlace(place) })
  }
  return drawers
}

function groupByClass(drawers) {
  const groups = []
  for (const drawer of drawers) {
    const last = groups[groups.length - 1]
    if (last && last.classIndex === drawer.classIndex) {
      last.drawers.push(drawer)
    } else {
      groups.push({ classIndex: drawer.classIndex, className: drawer.className, drawers: [drawer] })
    }
  }
  return groups
}

function DrawerShape({ place, count }) {
  const isCoin = place < NOTE_START_PLACE
  const layers = Math.min(Math.max(count, 1), 3)
  const value = 10 ** (place - 1)

  return (
    <div className="cr-shape-stack">
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          className={`cr-shape ${isCoin ? 'cr-coin' : 'cr-note'}`}
          style={{ '--i': layers - 1 - i }}
        >
          {i === layers - 1 ? formatWithSpaces(value) : null}
        </div>
      ))}
    </div>
  )
}

function CashRegisterTask() {
  const [drawerCount, setDrawerCount] = useState(DEFAULT_DRAWERS)
  const [round, setRound] = useState(() => generateRound(DEFAULT_DRAWERS))
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const { correct, total, recordAttempt, reset: resetScore } = useScore()

  const isChecked = result !== null

  const startNewRound = (nextDrawerCount) => {
    setRound(generateRound(nextDrawerCount))
    setInput('')
    setResult(null)
  }

  const handleDrawerCountChange = (value) => {
    setDrawerCount(value)
    startNewRound(value)
  }

  const handleCheck = () => {
    const ok = checkAnswer(input, round.finalNumber)
    setResult(ok)
    recordAttempt(ok)
  }

  const handleNext = () => {
    startNewRound(drawerCount)
  }

  const groups = groupByClass(buildDrawers(round.deposits))

  return (
    <div className="cash-register-task">
      <header className="cash-register-header">
        <div>
          <h1>A tökéletes pénztárgép</h1>
          <a href="./">← Vissza az alkalmazáshoz</a>
        </div>
        <ScoreDisplay correct={correct} total={total} />
      </header>

      <p className="cash-register-intro">
        A tökéletes pénztárgépnek fiókjai vannak minden helyiértékhez: egyes, tízes, százas és így
        tovább. Minden fiók csak a saját címletű pénzt fogadja. Ha egy fiókban tíz egyforma pénz
        gyűlik össze, a gép azonnal beváltja: kiveszi a tíz egyformát, és a következő (tízszer
        akkora értékű) fiókba tesz belőle egyet, majd kiírja a fiók (immár beváltás utáni)
        tartalmát.
      </p>

      <section className="cash-register-controls">
        <label className="cash-register-slider">
          Fiókok száma: <strong>{drawerCount}</strong>
          <input
            type="range"
            min={MIN_DRAWERS}
            max={MAX_DRAWERS}
            value={drawerCount}
            onChange={(e) => handleDrawerCountChange(Number(e.target.value))}
          />
        </label>
      </section>

      <p className="cash-register-prompt">Mit ír ki a gép, ha a fiókokba ennyit teszünk bele?</p>

      <div className="cr-drawers">
        {groups.map((group) => (
          <div className="cr-class" key={group.classIndex}>
            <div className="cr-class-name">{group.className}</div>
            <div className="cr-class-drawers">
              {group.drawers.map((drawer) => (
                <div className="cr-drawer" key={drawer.place}>
                  <DrawerShape place={drawer.place} count={drawer.deposit} />
                  <div className="cr-drawer-count">×{drawer.deposit}</div>
                  <div className="cr-drawer-abbr">{drawer.abbr}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cash-register-input-row">
        <input
          type="text"
          inputMode="numeric"
          className="cash-register-input"
          value={input}
          onChange={(e) => {
            if (isChecked) return
            setInput(e.target.value)
          }}
          placeholder="pl. 47225"
          disabled={isChecked}
        />
      </div>

      <div className="cash-register-actions">
        {!isChecked ? (
          <button type="button" onClick={handleCheck} disabled={input.trim() === ''}>
            Ellenőrzés
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Következő
          </button>
        )}

        {isChecked && (
          <FeedbackPill ok={result}>
            {result ? 'Helyes!' : `Nem jó — a gép ezt írja ki: ${formatWithSpaces(round.finalNumber)}`}
          </FeedbackPill>
        )}
      </div>

      {isChecked && (
        <ol className="cr-steps">
          {round.steps.map((step) => (
            <li key={step.place} className={step.exchanged > 0 ? 'cr-step-exchanged' : ''}>
              <span className="cr-step-text">{describeStep(step)}</span>
              <span className="cr-step-result">{step.remainder}</span>
            </li>
          ))}
        </ol>
      )}

      {total > 0 && (
        <button type="button" className="cash-register-reset-score" onClick={resetScore}>
          Pontszám visszaállítása
        </button>
      )}
    </div>
  )
}

export default CashRegisterTask

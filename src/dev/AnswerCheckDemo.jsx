import { useState } from 'react'
import { checkAnswer } from '../utils/checkAnswer'
import { generateNumber } from '../utils/numberGenerator'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import DigitPad from '../components/DigitPad/DigitPad'
import { useDigitEntry } from '../hooks/useDigitEntry'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './AnswerCheckDemo.css'

const TEST_CASES = [
  { label: "checkAnswer(1234, 1234)", actual: 1234, expected: 1234, expectPass: true },
  { label: "checkAnswer(1234, 4321)", actual: 1234, expected: 4321, expectPass: false },
  { label: "checkAnswer('1234', 1234)", actual: '1234', expected: 1234, expectPass: true },
  { label: "checkAnswer(['1','2','3','4'], 1234)", actual: ['1', '2', '3', '4'], expected: 1234, expectPass: true },
  { label: "checkAnswer([1,2,3,4], 1234)", actual: [1, 2, 3, 4], expected: 1234, expectPass: true },
  { label: "checkAnswer(['1','2',null,'4'], 1234) — hiányos", actual: ['1', '2', null, '4'], expected: 1234, expectPass: false },
]

function FeedbackPill({ ok }) {
  return (
    <span className={`feedback-pill ${ok ? 'feedback-success' : 'feedback-error'}`}>
      {ok ? <CheckIcon size={18} /> : <CrossIcon size={18} />}
      {ok ? 'Helyes' : 'Hibás'}
    </span>
  )
}

function TryItYourself() {
  const [target] = useState(() => generateNumber(6, true))
  const digitCount = String(target).length
  const { values, activeIndex, enterDigit, clearActive, setActiveIndex, reset } = useDigitEntry(digitCount)
  const [result, setResult] = useState(null)

  const handleDigit = (digit) => {
    enterDigit(digit)
    setResult(null)
  }

  const handleClear = () => {
    clearActive()
    setResult(null)
  }

  const handleClearAll = () => {
    reset()
    setResult(null)
  }

  const handleCheck = () => {
    setResult(checkAnswer(values, target))
  }

  return (
    <div className="answer-demo-block">
      <p>
        Cél szám: <code>{target}</code> (csak a demó kedvéért látható)
      </p>
      <PlaceValueTable
        mode="interactive"
        digitCount={digitCount}
        values={values}
        activeIndex={activeIndex}
        onCellClick={setActiveIndex}
      />
      <DigitPad onDigit={handleDigit} onClear={handleClear} onClearAll={handleClearAll} />
      <div className="answer-demo-actions">
        <button type="button" onClick={handleCheck}>
          Ellenőrzés
        </button>
        {result !== null && <FeedbackPill ok={result} />}
      </div>
    </div>
  )
}

function AnswerCheckDemo() {
  return (
    <div className="answer-demo">
      <header>
        <h1>Válaszellenőrző — demó</h1>
        <p>A megosztott, általános checkAnswer segédfüggvény bemutatója.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section>
        <h2>Automatikus tesztesetek</h2>
        <p className="section-note">
          Szám, szöveges szám és számjegy-tömb (pl. a táblázatból) egyaránt
          elfogadott bemenet. Hiányos tömb (üres cellával) mindig hibás.
        </p>
        <ul className="test-case-list">
          {TEST_CASES.map((tc) => {
            const actualResult = checkAnswer(tc.actual, tc.expected)
            const testPassed = actualResult === tc.expectPass
            return (
              <li key={tc.label}>
                <code>{tc.label}</code>
                <FeedbackPill ok={testPassed} />
                <span className="test-case-detail">
                  (eredmény: {String(actualResult)}, elvárt: {String(tc.expectPass)})
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2>Próbáld ki</h2>
        <p className="section-note">
          Írd be a fenti cél számot a táblázatba, majd ellenőrizd.
        </p>
        <TryItYourself />
      </section>
    </div>
  )
}

export default AnswerCheckDemo

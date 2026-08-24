import { useState } from 'react'
import { numberToHungarianWords, checkWrittenNumber } from '../utils/hungarianNumberWords'
import { generateNumber } from '../utils/numberGenerator'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './HungarianWordsDemo.css'

const TEST_CASES = [
  { target: 100, input: 'száz', expectAccept: true, note: 'kanonikus alak' },
  { target: 100, input: 'egyszáz', expectAccept: true, note: 'elfogadott változat' },
  { target: 100, input: 'Száz', expectAccept: true, note: 'kis/nagybetű nem számít' },
  { target: 100, input: 'kétszáz', expectAccept: false, note: 'ez 200, nem 100' },
  { target: 2000, input: 'kétezer', expectAccept: true, note: 'kanonikus alak' },
  { target: 2000, input: 'kettőezer', expectAccept: true, note: 'elfogadott változat' },
  { target: 71000, input: 'hetvenegyezer', expectAccept: true, note: 'itt az "egy" NEM hagyható el' },
  { target: 71000, input: 'hetvenezer', expectAccept: false, note: 'ez 70 000, nem 71 000' },
  { target: 1000000, input: 'egymillió', expectAccept: true, note: 'milliónál az "egy" kötelező' },
  { target: 1000000, input: 'millió', expectAccept: false, note: 'milliónál nem hagyható el az "egy"' },
  { target: 123, input: 'száz huszonhárom', expectAccept: true, note: 'szóköz nem számít' },
  { target: 345, input: 'Három-száz-negyven-öt', expectAccept: true, note: 'kötőjel és nagybetű nem számít' },
]

function ResultPill({ ok }) {
  return (
    <span className={`feedback-pill ${ok ? 'feedback-success' : 'feedback-error'}`}>
      {ok ? <CheckIcon size={18} /> : <CrossIcon size={18} />}
      {ok ? 'Helyes' : 'Hibás'}
    </span>
  )
}

function NumberToWordsExplorer() {
  const [value, setValue] = useState('123456')
  const n = Number(value)
  const valid = Number.isInteger(n) && n >= 0

  return (
    <div className="words-explorer">
      <label>
        Szám:{' '}
        <input
          type="number"
          value={value}
          min="0"
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <p className="words-explorer-output">{valid ? numberToHungarianWords(n) : 'érvénytelen szám'}</p>
    </div>
  )
}

function TryItYourself() {
  const [target] = useState(() => generateNumber(6, true))
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const handleCheck = () => {
    setResult(checkWrittenNumber(input, target))
  }

  return (
    <div className="words-try-it">
      <p>
        Cél szám: <code>{target}</code> (csak a demó kedvéért látható)
      </p>
      <input
        type="text"
        className="words-try-it-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setResult(null)
        }}
        placeholder="Írd le a számot szöveggel…"
      />
      <div className="words-try-it-actions">
        <button type="button" onClick={handleCheck}>
          Ellenőrzés
        </button>
        {result !== null && <ResultPill ok={result} />}
      </div>
    </div>
  )
}

function HungarianWordsDemo() {
  return (
    <div className="words-demo">
      <header>
        <h1>Magyar számnevek — demó</h1>
        <p>A szám → szöveg generátor és a diákválasz-normalizáló bemutatója.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section>
        <h2>Szám → szöveg</h2>
        <NumberToWordsExplorer />
      </section>

      <section>
        <h2>Automatikus tesztesetek</h2>
        <p className="section-note">
          Trükkös esetek: elfogadott alternatív alakok ("egyszáz", "kettőezer"),
          és olyan esetek, ahol az "egy" NEM hagyható el (pl. "hetvenegyezer").
        </p>
        <ul className="test-case-list">
          {TEST_CASES.map((tc, i) => {
            const actual = checkWrittenNumber(tc.input, tc.target)
            const testPassed = actual === tc.expectAccept
            return (
              <li key={i}>
                <code>
                  {tc.target} — "{tc.input}"
                </code>
                <ResultPill ok={testPassed} />
                <span className="test-case-detail">
                  ({tc.note}; elfogadva: {String(actual)}, elvárt: {String(tc.expectAccept)})
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2>Próbáld ki</h2>
        <TryItYourself />
      </section>
    </div>
  )
}

export default HungarianWordsDemo

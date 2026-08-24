import { useState } from 'react'
import { generateNumber, hasZeroDigit } from '../utils/numberGenerator'
import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import './NumberGeneratorDemo.css'

function NumberGeneratorDemo() {
  const [digitCount, setDigitCount] = useState(6)
  const [allowZeros, setAllowZeros] = useState(true)
  const [samples, setSamples] = useState([])

  const generateBatch = () => {
    setSamples(Array.from({ length: 10 }, () => generateNumber(digitCount, allowZeros)))
  }

  const latest = samples[0]

  return (
    <div className="generator-demo">
      <header>
        <h1>Számgenerátor — demó</h1>
        <p>A megosztott véletlenszám-generáló segédfüggvény bemutatója.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section className="generator-controls">
        <label className="generator-slider">
          Számjegyek száma: <strong>{digitCount}</strong>
          <input
            type="range"
            min={2}
            max={9}
            value={digitCount}
            onChange={(e) => setDigitCount(Number(e.target.value))}
          />
        </label>
        <label className="generator-checkbox">
          <input
            type="checkbox"
            checked={allowZeros}
            onChange={(e) => setAllowZeros(e.target.checked)}
          />
          Nullák engedélyezése
        </label>
        <button type="button" onClick={generateBatch}>
          10 minta generálása
        </button>
      </section>

      {samples.length > 0 && (
        <section>
          <h2>Generált számok</h2>
          <p className="section-note">
            Pirossal kiemelve azok, amelyekben van 0 számjegy — ha a
            nullák ki vannak kapcsolva, egyik szám sem lehet piros.
          </p>
          <ul className="generator-samples">
            {samples.map((n, i) => (
              <li key={i} className={hasZeroDigit(n) ? 'has-zero' : ''}>
                {n}
              </li>
            ))}
          </ul>

          <h3>Az első minta a helyiérték táblázatban</h3>
          <PlaceValueTable mode="display" digitCount={digitCount} values={String(latest).split('')} />
        </section>
      )}
    </div>
  )
}

export default NumberGeneratorDemo

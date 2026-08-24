import PlaceValueTable from '../components/PlaceValueTable/PlaceValueTable'
import DigitPad from '../components/DigitPad/DigitPad'
import { useDigitEntry } from '../hooks/useDigitEntry'
import './PlaceValueTableDemo.css'

function digitsOf(number) {
  return String(number).split('')
}

function digitAt(number, place) {
  return String(Math.floor(number / 10 ** (place - 1)) % 10)
}

function InteractiveDemo({ places }) {
  const { values, activeIndex, enterDigit, enterDigitAt, clearActive, backspaceAt, setActiveIndex, reset } =
    useDigitEntry(places.length)
  const readout = values.map((v) => v ?? '_').join(' ')

  return (
    <div className="table-demo-block">
      <PlaceValueTable
        mode="interactive"
        places={places}
        values={values}
        activeIndex={activeIndex}
        onCellClick={setActiveIndex}
        onDigitKey={enterDigitAt}
        onBackspaceKey={backspaceAt}
      />
      <DigitPad onDigit={enterDigit} onClear={clearActive} onClearAll={reset} />
      <p className="table-demo-readout">
        Beírt számjegyek: <code>{readout}</code>
      </p>
    </div>
  )
}

function PlaceValueTableDemo() {
  const sample = 3254917

  return (
    <div className="table-demo">
      <header>
        <h1>PlaceValueTable — demó</h1>
        <p>A megosztott, újrafelhasználható helyiérték táblázat komponens bemutatója.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section>
        <h2>Megjelenítő mód (display)</h2>
        <p className="section-note">
          Kész számokkal, csak olvasható. Különböző számjegyszám esetén az
          osztályok automatikusan a szükséges oszlopokra szűkülnek.
        </p>
        <h3>7 jegyű szám (3 254 917)</h3>
        <PlaceValueTable mode="display" digitCount={7} values={digitsOf(sample)} />
        <h3>4 jegyű szám (1234) — részleges ezres osztály</h3>
        <PlaceValueTable mode="display" digitCount={4} values={digitsOf(1234)} />
      </section>

      <section>
        <h2>Egyedi oszlopválasztás (places prop)</h2>
        <p className="section-note">
          Nem minden feladathoz kell minden osztály. A <code>places</code>{' '}
          paraméterrel tetszőleges (összefüggő) helyiértékek jeleníthetők
          meg — pl. csak az egyesek osztálya, milliók és ezresek nélkül.
        </p>
        <h3>Csak az egyesek osztálya (places=[3,2,1])</h3>
        <PlaceValueTable
          mode="display"
          places={[3, 2, 1]}
          values={[digitAt(sample, 3), digitAt(sample, 2), digitAt(sample, 1)]}
        />
      </section>

      <section>
        <h2>Interaktív mód (interactive)</h2>
        <p className="section-note">
          Kattints egy mezőre és válassz egy számjegyet a billentyűzeten,
          vagy asztali gépen egyszerűen gépeld be a számot — az első mező
          eleve ki van jelölve, és gépelés közben automatikusan a
          következő mezőre ugrik a fókusz.
        </p>
        <InteractiveDemo places={[7, 6, 5, 4, 3, 2, 1]} />
      </section>
    </div>
  )
}

export default PlaceValueTableDemo

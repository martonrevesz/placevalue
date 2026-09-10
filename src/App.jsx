import { useState } from 'react'
import StyleGuide from './dev/StyleGuide'
import PlaceValueTableDemo from './dev/PlaceValueTableDemo'
import NumberGeneratorDemo from './dev/NumberGeneratorDemo'
import AnswerCheckDemo from './dev/AnswerCheckDemo'
import ScoreDemo from './dev/ScoreDemo'
import BuildNumberTask from './tasks/BuildNumberTask'
import ReadTableTask from './tasks/ReadTableTask'
import ExpandedFormTask from './tasks/ExpandedFormTask'
import ComparisonTask from './tasks/ComparisonTask'
import CashRegisterTask from './tasks/CashRegisterTask'
import OrderNumbersTask from './tasks/OrderNumbersTask'
import DigitValuesTask from './tasks/DigitValuesTask'
import SetsIntroTask from './halmazok/SetsIntroTask'
import HungarianWordsDemo from './dev/HungarianWordsDemo'
import './App.css'

const TASKS = [
  { label: 'Építsd meg a számot', view: 'build-number' },
  { label: 'Olvasd le a táblázatot', view: 'read-table' },
  { label: 'Bontott alak', view: 'expanded-form' },
  { label: 'Számok összehasonlítása', view: 'compare-numbers' },
  { label: 'Számok sorba rendezése', view: 'order-numbers' },
  { label: 'Helyi érték, alaki érték, valódi érték', view: 'digit-values' },
  { label: 'A tökéletes pénztárgép', view: 'cash-register' },
]

function App() {
  // Which subject area is showing on the plain (no ?view=) URL. Not
  // reflected in the URL on purpose (yet) — a plain in-memory choice,
  // separate from the ?view= deep-linking the individual tasks use.
  const [subject, setSubject] = useState(null)
  const view = new URLSearchParams(window.location.search).get('view')

  if (view === 'styleguide') {
    return <StyleGuide />
  }

  if (view === 'table-demo') {
    return <PlaceValueTableDemo />
  }

  if (view === 'generator-demo') {
    return <NumberGeneratorDemo />
  }

  if (view === 'answer-demo') {
    return <AnswerCheckDemo />
  }

  if (view === 'score-demo') {
    return <ScoreDemo />
  }

  if (view === 'build-number') {
    return <BuildNumberTask />
  }

  if (view === 'read-table') {
    return <ReadTableTask />
  }

  if (view === 'expanded-form') {
    return <ExpandedFormTask />
  }

  if (view === 'compare-numbers') {
    return <ComparisonTask />
  }

  if (view === 'cash-register') {
    return <CashRegisterTask />
  }

  if (view === 'order-numbers') {
    return <OrderNumbersTask />
  }

  if (view === 'digit-values') {
    return <DigitValuesTask />
  }

  if (view === 'words-demo') {
    return <HungarianWordsDemo />
  }

  if (subject === 'placevalue') {
    return (
      <div className="app-shell">
        <button type="button" className="back-link" onClick={() => setSubject(null)}>
          ← Vissza a főoldalra
        </button>

        <header>
          <h1>Helyiérték gyakorló</h1>
        </header>

        <nav aria-label="Feladatok">
          <ul className="task-nav">
            {TASKS.map((task) => (
              <li key={task.label}>
                {task.view ? (
                  <a className="task-nav-item" href={`?view=${task.view}`}>
                    {task.label}
                  </a>
                ) : (
                  <span className="task-nav-item">{task.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <main className="content-placeholder">
          <p>Itt jelenik majd meg a kiválasztott feladat.</p>
        </main>

        <footer className="dev-footer">
          <a href="?view=styleguide">Stílus referencia (fejlesztői)</a>
          {' · '}
          <a href="?view=table-demo">Táblázat demó (fejlesztői)</a>
          {' · '}
          <a href="?view=generator-demo">Számgenerátor demó (fejlesztői)</a>
          {' · '}
          <a href="?view=answer-demo">Válaszellenőrző demó (fejlesztői)</a>
          {' · '}
          <a href="?view=score-demo">Pontszám demó (fejlesztői)</a>
          {' · '}
          <a href="?view=words-demo">Számnevek demó (fejlesztői)</a>
        </footer>
      </div>
    )
  }

  if (subject === 'halmazok') {
    return <SetsIntroTask onBack={() => setSubject(null)} />
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Matematika gyakorló feladatok</h1>
      </header>

      <div className="task-nav">
        <button type="button" className="task-nav-item" onClick={() => setSubject('placevalue')}>
          Helyiérték gyakorló
        </button>
        <button type="button" className="task-nav-item" onClick={() => setSubject('halmazok')}>
          Halmazok
        </button>
      </div>
    </div>
  )
}

export default App

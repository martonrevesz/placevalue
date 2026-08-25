import StyleGuide from './dev/StyleGuide'
import PlaceValueTableDemo from './dev/PlaceValueTableDemo'
import NumberGeneratorDemo from './dev/NumberGeneratorDemo'
import AnswerCheckDemo from './dev/AnswerCheckDemo'
import ScoreDemo from './dev/ScoreDemo'
import BuildNumberTask from './tasks/BuildNumberTask'
import ReadTableTask from './tasks/ReadTableTask'
import ExpandedFormTask from './tasks/ExpandedFormTask'
import ComparisonTask from './tasks/ComparisonTask'
import HungarianWordsDemo from './dev/HungarianWordsDemo'
import './App.css'

const TASKS = [
  { label: 'Építsd meg a számot', view: 'build-number' },
  { label: 'Olvasd le a táblázatot', view: 'read-table' },
  { label: 'Bontott alak', view: 'expanded-form' },
  { label: 'Számok összehasonlítása', view: 'compare-numbers' },
  { label: 'Számok sorba rendezése', view: null },
  { label: 'Helyi érték, alaki érték, valódi érték', view: null },
]

function App() {
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

  if (view === 'words-demo') {
    return <HungarianWordsDemo />
  }

  return (
    <div className="app-shell">
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

export default App

import StyleGuide from './dev/StyleGuide'
import PlaceValueTableDemo from './dev/PlaceValueTableDemo'
import NumberGeneratorDemo from './dev/NumberGeneratorDemo'
import AnswerCheckDemo from './dev/AnswerCheckDemo'
import './App.css'

const TASKS = [
  'Építsd meg a számot',
  'Olvasd le a táblázatot',
  'Bontott alak',
  'Számok összehasonlítása',
  'Számok sorba rendezése',
  'Helyi érték, alaki érték, valódi érték',
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

  return (
    <div className="app-shell">
      <header>
        <h1>Helyiérték gyakorló</h1>
      </header>

      <nav aria-label="Feladatok">
        <ul className="task-nav">
          {TASKS.map((label) => (
            <li key={label}>
              <span className="task-nav-item">{label}</span>
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
      </footer>
    </div>
  )
}

export default App

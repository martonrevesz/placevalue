import StyleGuide from './dev/StyleGuide'
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
      </footer>
    </div>
  )
}

export default App

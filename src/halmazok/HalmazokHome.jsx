const TASKS = [
  { label: 'Egy tulajdonság', view: 'sets-one-property' },
  { label: 'Két tulajdonság', view: 'sets-two-properties' },
  { label: 'Számhalmazok', view: 'sets-numbers' },
]

function HalmazokHome({ onBack }) {
  return (
    <div className="app-shell">
      <button type="button" className="back-link" onClick={onBack}>
        ← Vissza a főoldalra
      </button>

      <header>
        <h1>Halmazok</h1>
      </header>

      <nav aria-label="Feladatok">
        <ul className="task-nav">
          {TASKS.map((task) => (
            <li key={task.label}>
              <a className="task-nav-item" href={`?view=${task.view}`}>
                {task.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default HalmazokHome

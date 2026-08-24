import { useScore } from '../hooks/useScore'
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay'
import './ScoreDemo.css'

function ScoreDemo() {
  const { correct, total, recordAttempt, reset } = useScore()

  return (
    <div className="score-demo">
      <header>
        <h1>Pontszám — demó</h1>
        <p>A megosztott, folyamatos pontszám (helyes / összes) bemutatója.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section>
        <ScoreDisplay correct={correct} total={total} />
        <div className="score-demo-actions">
          <button type="button" className="score-demo-btn-correct" onClick={() => recordAttempt(true)}>
            Helyes válasz szimulálása
          </button>
          <button type="button" className="score-demo-btn-wrong" onClick={() => recordAttempt(false)}>
            Hibás válasz szimulálása
          </button>
          <button type="button" className="score-demo-btn-reset" onClick={reset}>
            Visszaállítás
          </button>
        </div>
      </section>
    </div>
  )
}

export default ScoreDemo

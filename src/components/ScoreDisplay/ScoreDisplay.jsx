import './ScoreDisplay.css'

/**
 * Shows the running score (correct out of total attempted).
 */
function ScoreDisplay({ correct, total }) {
  return (
    <div className="score-display">
      <span className="score-display-value">
        {correct} / {total}
      </span>
      <span className="score-display-label">helyes</span>
    </div>
  )
}

export default ScoreDisplay

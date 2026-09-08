import './HintIcon.css'

/**
 * A small "?" badge with a native hover tooltip — the app-wide style
 * for a short inline explanation next to a label or term.
 */
function HintIcon({ hint }) {
  return (
    <span className="hint-icon" title={hint} aria-label={hint} role="img">
      ?
    </span>
  )
}

export default HintIcon

import { CheckIcon, CrossIcon } from '../icons/FeedbackIcons'
import './FeedbackPill.css'

/**
 * Correct/incorrect feedback badge: icon + text, never color alone
 * (color-blind accessibility — see the design notes in StyleGuide).
 */
function FeedbackPill({ ok, children }) {
  return (
    <span className={`feedback-pill ${ok ? 'feedback-success' : 'feedback-error'}`}>
      {ok ? <CheckIcon size={20} /> : <CrossIcon size={20} />}
      {children}
    </span>
  )
}

export default FeedbackPill

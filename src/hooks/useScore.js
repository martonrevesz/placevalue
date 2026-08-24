import { useState } from 'react'

/**
 * Running score for a task screen: correct count and total attempted.
 * Open-ended — no fixed session length, no time limit.
 */
export function useScore() {
  const [state, setState] = useState({ correct: 0, total: 0 })

  const recordAttempt = (isCorrect) => {
    setState((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const reset = () => setState({ correct: 0, total: 0 })

  return { correct: state.correct, total: state.total, recordAttempt, reset }
}

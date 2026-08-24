import { useState } from 'react'

/**
 * State for click-to-place (or type-to-place) digit entry into a
 * PlaceValueTable: which cell is selected and what's been typed so
 * far, with auto-advance to the next cell after each digit.
 *
 * Values and activeIndex are updated together in one functional
 * setState so that two inputs arriving before React re-renders (e.g. a
 * fast double-tap on a tablet, or fast typing on a keyboard) still read
 * the true latest state instead of a stale snapshot from the render
 * that scheduled the first one.
 */
export function useDigitEntry(length) {
  const [state, setState] = useState(() => ({
    values: Array(length).fill(null),
    activeIndex: 0,
  }))

  const enterDigit = (digit) => {
    setState((prev) => {
      const values = [...prev.values]
      values[prev.activeIndex] = digit
      const activeIndex = prev.activeIndex < length - 1 ? prev.activeIndex + 1 : prev.activeIndex
      return { values, activeIndex }
    })
  }

  // Like enterDigit, but targets a specific cell rather than "whichever
  // cell is currently active" — used for keyboard typing, where the key
  // event already tells us which cell has focus.
  const enterDigitAt = (index, digit) => {
    setState((prev) => {
      const values = [...prev.values]
      values[index] = digit
      const activeIndex = index < length - 1 ? index + 1 : index
      return { values, activeIndex }
    })
  }

  const clearActive = () => {
    setState((prev) => {
      const values = [...prev.values]
      values[prev.activeIndex] = null
      return { ...prev, values }
    })
  }

  // Backspace at a cell: clear it if it has a digit; if it's already
  // empty, step back and clear the previous cell instead (matches the
  // usual behavior of one-time-code style boxes).
  const backspaceAt = (index) => {
    setState((prev) => {
      const values = [...prev.values]
      const hasDigit = values[index] !== null && values[index] !== undefined && values[index] !== ''
      if (hasDigit) {
        values[index] = null
        return { values, activeIndex: index }
      }
      const prevIndex = index > 0 ? index - 1 : index
      values[prevIndex] = null
      return { values, activeIndex: prevIndex }
    })
  }

  const setActiveIndex = (index) => {
    setState((prev) => ({ ...prev, activeIndex: index }))
  }

  const reset = () => {
    setState({ values: Array(length).fill(null), activeIndex: 0 })
  }

  return {
    values: state.values,
    activeIndex: state.activeIndex,
    enterDigit,
    enterDigitAt,
    clearActive,
    backspaceAt,
    setActiveIndex,
    reset,
  }
}

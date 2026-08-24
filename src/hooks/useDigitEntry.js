import { useState } from 'react'

/**
 * State for click-to-place digit entry into a PlaceValueTable: which
 * cell is selected and what's been typed so far, with auto-advance to
 * the next cell after each digit.
 *
 * Values and activeIndex are updated together in one functional
 * setState so that two clicks arriving before React re-renders (e.g. a
 * fast double-tap on a tablet) still read the true latest state instead
 * of a stale snapshot from the render that scheduled the first click.
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

  const clearActive = () => {
    setState((prev) => {
      const values = [...prev.values]
      values[prev.activeIndex] = null
      return { ...prev, values }
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
    clearActive,
    setActiveIndex,
    reset,
  }
}

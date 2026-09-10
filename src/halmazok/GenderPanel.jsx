import { CATEGORIES, STUDENT_DATA } from './students'

/**
 * A static (non-draggable) reference board listing one gender's
 * students with their real, positive attributes (e.g. "kerékpárral jár
 * iskolába") — never a negative ("nem tanul angolul"), since every
 * attribute here is really a choice between named alternatives (bike
 * vs. walk, English vs. German, ...), not a trait someone simply lacks.
 * Styled as one solid block (not chip-like cards) so it visually reads
 * as fixed reference material, never a drag target.
 */
function GenderPanel({ gender, students }) {
  const symbol = gender === 'F' ? '♀' : '♂'
  return (
    <div className={`gender-panel gender-${gender}`}>
      <div className="gender-panel-icon" aria-hidden="true">
        {symbol}
      </div>
      <div className="gender-panel-board">
        {students.map((student) => {
          const data = STUDENT_DATA[student.id]
          return (
            <div key={student.id} className="gender-panel-row">
              <div className="gender-panel-name">{student.label}</div>
              <ul className="gender-panel-facts">
                {CATEGORIES.map((category) => {
                  const chosen = category.options.find((o) => o.key === data[category.key])
                  return (
                    <li key={category.key} className="gender-panel-fact">
                      {chosen.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GenderPanel

import { PROPERTIES, STUDENT_DATA } from './students'
import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'

/**
 * A static (non-draggable) reference board listing one gender's
 * students with their real attributes in plain words (e.g. "kerékpárral
 * jár iskolába: igen") — not the abstract A/B set labels the exercise
 * itself uses, so translating "real fact" into "which set" is still
 * the student's job, not something read straight off the board. Styled
 * as one solid block (not chip-like cards) so it visually reads as
 * fixed reference material, never a drag target.
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
                {PROPERTIES.map((p) => (
                  <li key={p.key} className="gender-panel-fact">
                    {data[p.key] ? (
                      <CheckIcon size={13} className="gender-panel-yes" />
                    ) : (
                      <CrossIcon size={13} className="gender-panel-no" />
                    )}
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GenderPanel

import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'

/**
 * A static (non-draggable) reference sidebar listing one gender's
 * students, each with a check/cross per property column — the same
 * "who actually has this?" answer key as before, just grouped by
 * gender instead of one shared table, and free to be as roomy as it
 * likes since nothing here has to fit into a small drop zone.
 *
 * `columns`: `[{ label, values: { [studentId]: boolean } }]`.
 */
function GenderPanel({ gender, students, columns }) {
  const symbol = gender === 'F' ? '♀' : '♂'
  return (
    <div className={`gender-panel gender-${gender}`}>
      <div className="gender-panel-icon" aria-hidden="true">
        {symbol}
      </div>
      <div className="gender-panel-cards">
        {students.map((student) => (
          <div key={student.id} className="gender-panel-card">
            <div className="gender-panel-card-name">{student.label}</div>
            <div className="gender-panel-card-props">
              {columns.map((col) => (
                <span key={col.label} className="gender-panel-prop">
                  <span className="gender-panel-prop-label">{col.label}</span>
                  {col.values[student.id] ? (
                    <CheckIcon size={14} className="gender-panel-yes" />
                  ) : (
                    <CrossIcon size={14} className="gender-panel-no" />
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GenderPanel

import { PROPERTIES, STUDENT_DATA } from './students'

/**
 * The content shown on one draggable student chip: a gender badge, the
 * name, and a row of icons for every property (dim when the student
 * doesn't have it) — so a card carries its own real attributes rather
 * than requiring a name lookup elsewhere.
 */
function StudentCard({ student }) {
  const data = STUDENT_DATA[student.id]
  return (
    <div className="student-card">
      <div className={`student-card-avatar gender-${student.gender}`} aria-hidden="true">
        {student.gender === 'F' ? '♀' : '♂'}
      </div>
      <div className="student-card-name">{student.label}</div>
      <div className="student-card-props">
        {PROPERTIES.map((p) => (
          <span
            key={p.key}
            className={`student-card-prop ${data[p.key] ? 'is-active' : 'is-inactive'}`}
            title={p.label}
          >
            {p.icon}
          </span>
        ))}
      </div>
    </div>
  )
}

export default StudentCard

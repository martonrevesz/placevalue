/**
 * The content shown on one draggable student chip: a small gender
 * badge plus the name. Deliberately minimal — a card carrying property
 * badges too was hard to drop precisely into the small Venn zones,
 * so per-property detail now lives only in the static gender sidebars.
 */
function StudentCard({ student }) {
  return (
    <div className="student-card">
      <div className={`student-card-avatar gender-${student.gender}`} aria-hidden="true">
        {student.gender === 'F' ? '♀' : '♂'}
      </div>
      <div className="student-card-name">{student.label}</div>
    </div>
  )
}

export default StudentCard

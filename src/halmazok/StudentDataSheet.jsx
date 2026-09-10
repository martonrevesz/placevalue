import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'

/**
 * A reference "adatlap" (data sheet): one row per student, one column
 * per property, showing whether that student actually has it. Without
 * this, a "who has property X?" exercise is unsolvable — the book this
 * is modeled on always kept its class roster's real data visible while
 * working a set-classification problem, not just the property's name.
 *
 * `columns`: `[{ label, values: { [studentId]: boolean } }]`.
 */
function StudentDataSheet({ students, columns }) {
  return (
    <div className="class-sets-sheet">
      <h2 className="class-sets-sheet-title">Adatlap</h2>
      <table className="class-sets-sheet-table">
        <thead>
          <tr>
            <th>Név</th>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="class-sets-sheet-name">{student.label}</td>
              {columns.map((col) => (
                <td key={col.label} className="class-sets-sheet-cell">
                  {col.values[student.id] ? (
                    <CheckIcon size={16} className="class-sets-sheet-yes" />
                  ) : (
                    <CrossIcon size={16} className="class-sets-sheet-no" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentDataSheet

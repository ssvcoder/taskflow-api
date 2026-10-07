import { useState } from 'react'

// Shared by "new task" and "edit task". When `initial` is provided,
// the form edits that task; otherwise it creates a new one.
export default function TaskForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'Todo')
  const [priority, setPriority] = useState(initial?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ''
  )
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        // The API accepts null; an empty date input means "no due date".
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit task' : 'New task'}</h2>
        <label>
          Title
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
          />
        </label>
        <div className="row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Todo">To do</option>
              <option value="InProgress">In progress</option>
              <option value="Done">Done</option>
            </select>
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={busy || !title.trim()}>
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  )
}

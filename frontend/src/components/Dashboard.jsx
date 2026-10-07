import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import TaskForm from './TaskForm'

const FILTERS = ['All', 'Todo', 'InProgress', 'Done']
const FILTER_LABELS = { All: 'All', Todo: 'To do', InProgress: 'In progress', Done: 'Done' }

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isOverdue(task) {
  return (
    task.dueDate &&
    task.status !== 'Done' &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [project, setProject] = useState(null) // detail incl. tasks
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)

  const loadProjects = async (selectId) => {
    const list = await api.getProjects()
    setProjects(list)
    // Keep the current selection if it still exists, otherwise pick the first.
    const id = list.some((p) => p.id === selectId) ? selectId : list[0]?.id ?? null
    setSelectedId(id)
    return id
  }

  const loadProject = async (id) => {
    if (!id) {
      setProject(null)
      return
    }
    setProject(await api.getProject(id))
  }

  // Initial load.
  useEffect(() => {
    ;(async () => {
      try {
        const id = await loadProjects()
        await loadProject(id)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const selectProject = async (id) => {
    setSelectedId(id)
    setFilter('All')
    setError('')
    try {
      await loadProject(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const refresh = async () => {
    const id = await loadProjects(selectedId)
    await loadProject(id)
  }

  const createProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    try {
      const created = await api.createProject(newProjectName.trim(), null)
      setNewProjectName('')
      setShowNewProject(false)
      const id = await loadProjects(created.id)
      await loadProject(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteProject = async (id, name) => {
    if (!window.confirm(`Delete project "${name}" and all its tasks?`)) return
    try {
      await api.deleteProject(id)
      const nextId = await loadProjects(null)
      await loadProject(nextId)
    } catch (err) {
      setError(err.message)
    }
  }

  const saveTask = async (data) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, data)
      } else {
        await api.createTask(selectedId, data)
      }
      setShowTaskForm(false)
      setEditingTask(null)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const quickStatusChange = async (task, status) => {
    try {
      await api.updateTask(task.id, {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        dueDate: task.dueDate,
      })
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    try {
      await api.deleteTask(task.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const visibleTasks = useMemo(() => {
    if (!project) return []
    return project.tasks.filter((t) => filter === 'All' || t.status === filter)
  }, [project, filter])

  if (loading) return <div className="center muted">Loading…</div>

  return (
    <div className="app">
      <header className="topbar">
        <strong>TaskFlow</strong>
        <span className="muted">
          {user.username} · <button className="link" onClick={logout}>Sign out</button>
        </span>
      </header>

      {error && (
        <div className="error banner">
          {error}
          <button className="link" onClick={() => setError('')}>dismiss</button>
        </div>
      )}

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-head">
            <h2>Projects</h2>
            <button className="secondary small" onClick={() => setShowNewProject((v) => !v)}>
              + New
            </button>
          </div>
          {showNewProject && (
            <form className="inline-form" onSubmit={createProject}>
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                maxLength={100}
                autoFocus
              />
              <button type="submit">Add</button>
            </form>
          )}
          {projects.length === 0 && (
            <p className="muted small">No projects yet — create your first one.</p>
          )}
          <ul className="project-list">
            {projects.map((p) => (
              <li
                key={p.id}
                className={p.id === selectedId ? 'active' : ''}
                onClick={() => selectProject(p.id)}
              >
                <span className="project-name">{p.name}</span>
                <span className="muted small">
                  {p.completedTaskCount}/{p.taskCount} done
                </span>
                <button
                  className="icon-btn"
                  title="Delete project"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteProject(p.id, p.name)
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {!project ? (
            <p className="muted center">Select a project to see its tasks.</p>
          ) : (
            <>
              <div className="content-head">
                <div>
                  <h2>{project.name}</h2>
                  {project.description && <p className="muted">{project.description}</p>}
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null)
                    setShowTaskForm(true)
                  }}
                >
                  + New task
                </button>
              </div>

              <div className="filters">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    className={filter === f ? 'chip active' : 'chip'}
                    onClick={() => setFilter(f)}
                  >
                    {FILTER_LABELS[f]}
                  </button>
                ))}
              </div>

              {visibleTasks.length === 0 ? (
                <p className="muted center">No tasks here yet.</p>
              ) : (
                <ul className="task-list">
                  {visibleTasks.map((t) => (
                    <li key={t.id} className={`task priority-${t.priority.toLowerCase()}`}>
                      <div className="task-main">
                        <strong className={t.status === 'Done' ? 'done' : ''}>
                          {t.title}
                        </strong>
                        {t.description && <p className="muted small">{t.description}</p>}
                        <div className="task-meta">
                          <span className={`badge status-${t.status.toLowerCase()}`}>
                            {FILTER_LABELS[t.status]}
                          </span>
                          <span className="badge">{t.priority}</span>
                          {t.dueDate && (
                            <span className={isOverdue(t) ? 'overdue' : 'muted small'}>
                              Due {formatDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="task-actions">
                        <select
                          value={t.status}
                          onChange={(e) => quickStatusChange(t, e.target.value)}
                          title="Change status"
                        >
                          <option value="Todo">To do</option>
                          <option value="InProgress">In progress</option>
                          <option value="Done">Done</option>
                        </select>
                        <button
                          className="secondary small"
                          onClick={() => {
                            setEditingTask(t)
                            setShowTaskForm(true)
                          }}
                        >
                          Edit
                        </button>
                        <button className="danger small" onClick={() => deleteTask(t)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>

      {showTaskForm && (
        <TaskForm
          initial={editingTask}
          onSave={saveTask}
          onCancel={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}

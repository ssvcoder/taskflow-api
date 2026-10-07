// Thin wrapper around fetch for the TaskFlow API.
// The JWT is read from localStorage on every call.

const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('taskflow_token')
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    // Token expired or invalid — force a fresh login.
    localStorage.removeItem('taskflow_token')
    localStorage.removeItem('taskflow_user')
    window.location.reload()
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data.message || data.title || message
    } catch {
      /* keep the default message */
    }
    throw new Error(message)
  }

  // 204 No Content (DELETE) has no body to parse.
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (username, email, password) =>
    request('/auth/register', { method: 'POST', body: { username, email, password } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (name, description) =>
    request('/projects', { method: 'POST', body: { name, description } }),
  updateProject: (id, name, description) =>
    request(`/projects/${id}`, { method: 'PUT', body: { name, description } }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  getTasks: (projectId) => request(`/projects/${projectId}/tasks`),
  createTask: (projectId, task) =>
    request(`/projects/${projectId}/tasks`, { method: 'POST', body: task }),
  updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: task }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}

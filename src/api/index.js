// ===== 后端 REST 客户端 =====
// USE_BACKEND=true：所有数据通过后端 API（PostgreSQL + SqlSugar）存取。
// 登录后所有请求带 Authorization: Bearer <token>，按当前账号隔离数据。
// 开发时走 vite proxy /api → http://localhost:5000；后端托管 dist 时同源。
export const USE_BACKEND = true
const BASE = (import.meta.env.VITE_API_BASE || '') + '/api'

const TOKEN_KEY = 'lk_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t || '')
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const tok = getToken()
  if (tok) headers['Authorization'] = 'Bearer ' + tok

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new Error('网络错误，请确认后端已启动（localhost:5000）')
  }

  // 未认证（登录接口除外）→ 清除 token 回登录页
  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
    clearToken()
    if (window.location.hash !== '#/login') window.location.hash = '#/login'
    throw new Error('登录已过期，请重新登录')
  }

  if (!res.ok) {
    let msg = ''
    try { const j = await res.json(); msg = j && j.message ? j.message : JSON.stringify(j) } catch { /* ignore */ }
    throw new Error(msg || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // 认证
  register: (b) => request('POST', '/auth/register', b),
  login: (b) => request('POST', '/auth/login', b),
  // 待办
  getTodos: () => request('GET', '/todos'),
  createTodo: (b) => request('POST', '/todos', b),
  updateTodo: (id, b) => request('PUT', `/todos/${id}`, b),
  toggleTodo: (id) => request('PUT', `/todos/${id}/toggle`),
  deleteTodo: (id) => request('DELETE', `/todos/${id}`),
  // 习惯
  getHabits: () => request('GET', '/habits'),
  createHabit: (b) => request('POST', '/habits', b),
  updateHabit: (id, b) => request('PUT', `/habits/${id}`, b),
  toggleHabit: (id) => request('PUT', `/habits/${id}/toggle`),
  deleteHabit: (id) => request('DELETE', `/habits/${id}`),
  // 名言
  getQuotes: () => request('GET', '/quotes'),
  createQuote: (b) => request('POST', '/quotes', b),
  updateQuote: (id, b) => request('PUT', `/quotes/${id}`, b),
  deleteQuote: (id) => request('DELETE', `/quotes/${id}`),
  // 读后感（文件夹 + 笔记）
  getFolders: () => request('GET', '/reading/folders'),
  addFolder: (b) => request('POST', '/reading/folders', b),
  deleteFolder: (name) => request('DELETE', `/reading/folders/${encodeURIComponent(name)}`),
  getNotes: () => request('GET', '/reading/notes'),
  createNote: (b) => request('POST', '/reading/notes', b),
  updateNote: (id, b) => request('PUT', `/reading/notes/${id}`, b),
  deleteNote: (id) => request('DELETE', `/reading/notes/${id}`),
  // 日记
  getDiaries: () => request('GET', '/diaries'),
  createDiary: (b) => request('POST', '/diaries', b),
  updateDiary: (id, b) => request('PUT', `/diaries/${id}`, b),
  deleteDiary: (id) => request('DELETE', `/diaries/${id}`),
  // 分类
  getTodoCats: () => request('GET', '/categories/todo'),
  addTodoCat: (b) => request('POST', '/categories/todo', b),
  deleteTodoCat: (name) => request('DELETE', `/categories/todo/${encodeURIComponent(name)}`),
  getHabitCats: () => request('GET', '/categories/habit'),
  addHabitCat: (b) => request('POST', '/categories/habit', b),
  deleteHabitCat: (name) => request('DELETE', `/categories/habit/${encodeURIComponent(name)}`),
  // 统计
  stats: (a, b) => request('GET', `/stats/range?start=${encodeURIComponent(a)}&end=${encodeURIComponent(b)}`)
}

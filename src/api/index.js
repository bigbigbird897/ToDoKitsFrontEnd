// ===== 后端 REST 客户端 =====
// USE_BACKEND=true 时，所有数据通过后端 API（PostgreSQL + SqlSugar）存取；
// 默认 false（本地内存模拟），方便单独跑前端测试。
// 后端启动后：改这里为 true，并把 VITE_API_BASE 指向后端地址（或走 vite proxy /api）。
export const USE_BACKEND = false
const BASE = (import.meta.env.VITE_API_BASE || '') + '/api'

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) throw new Error(`API ${method} ${path} -> ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // 待办
  getTodos: () => request('GET', '/todos'),
  createTodo: (b) => request('POST', '/todos', b),
  updateTodo: (id, b) => request('PUT', `/todos/${id}`, b),
  deleteTodo: (id) => request('DELETE', `/todos/${id}`),
  // 习惯
  getHabits: () => request('GET', '/habits'),
  createHabit: (b) => request('POST', '/habits', b),
  updateHabit: (id, b) => request('PUT', `/habits/${id}`, b),
  deleteHabit: (id) => request('DELETE', `/habits/${id}`),
  // 名言
  getQuotes: () => request('GET', '/quotes'),
  createQuote: (b) => request('POST', '/quotes', b),
  updateQuote: (id, b) => request('PUT', `/quotes/${id}`, b),
  deleteQuote: (id) => request('DELETE', `/quotes/${id}`),
  // 读后感（文件夹 + 笔记）
  getFolders: () => request('GET', '/reading/folders'),
  createFolder: (b) => request('POST', '/reading/folders', b),
  deleteFolder: (id) => request('DELETE', `/reading/folders/${id}`),
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
  getHabitCats: () => request('GET', '/categories/habit'),
  // 统计
  stats: (a, b) => request('GET', `/stats/range?start=${a}&end=${b}`)
}

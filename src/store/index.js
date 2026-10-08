import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { api, getToken, setToken, clearToken } from '../api'

// ===== 数据格式工具 =====
const fmt = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const weekdayCN = (d) => `星期${WEEK[new Date(d).getDay()]}`
const TODAY = fmt(new Date())

// 主题持久化：启动时读取本地偏好并立即应用到 <html>，否则刷新页面后会回到浅色主题
const savedDark = localStorage.getItem('lk-theme') === 'dark'
document.documentElement.classList.toggle('dark', savedDark)

// 后端名言 tags 是逗号分隔字符串，前端统一为数组
const quoteTags = (q) => (q.tags ? String(q.tags).split(',').filter(Boolean) : [])

export const useStore = defineStore('app', {
  state: () => ({
    // 初始为空，启动后 init() 从后端数据库加载
    todoCats: [],
    todos: [],
    habitCats: [],
    habits: [],
    quoteTags: [],
    quotes: [],
    folders: [],
    notes: [],
    diaries: [],
    // 工作笔记：文件夹树（扁平列表按 ParentId 组装）+ 当前文件夹文件列表
    workFolders: [],
    workFiles: [],
    loaded: false,
    // 认证（登录后写入 localStorage）
    token: getToken() || '',
    user: (() => { try { return JSON.parse(localStorage.getItem('lk_user') || 'null') } catch { return null } })(),
    // 界面
    dark: savedDark,
    // 侧栏折叠状态：桌面端默认展开、移动端默认收起（由汉堡按钮切换）
    menuOpen: window.innerWidth > 900,
    statsPreset: 'week',
    statsRange: [fmt(addDays(new Date(), -6)), TODAY]
  }),
  getters: {
    todayTodos(state) { return state.todos.filter(t => t.status !== 'done') },
    doneToday(state) { return state.todos.filter(t => t.status === 'done' && t.completedAt === TODAY) },
    overdue(state) { return state.todos.filter(t => t.status !== 'done' && t.due && t.due < TODAY) },
    totalStreak(state) { return state.habits.reduce((s, h) => s + h.streak, 0) },
    statsStart: (s) => s.statsRange ? s.statsRange[0] : null,
    statsEnd: (s) => s.statsRange ? s.statsRange[1] : null,
    rangeLabel() { const a = this.statsStart, b = this.statsEnd; return a && b ? (a === b ? a : `${a} ~ ${b}`) : '—' },
    trendLabel() { const a = this.statsStart, b = this.statsEnd; if (!a || !b) return ''; const d = diffDays(a, b) + 1; return d <= 31 ? '按日' : (d <= 370 ? '按月' : '按年') },
    completedInRange() { const a = this.statsStart, b = this.statsEnd; if (!a || !b) return []; return this.todos.filter(t => t.status === 'done' && t.completedAt >= a && t.completedAt <= b) },
    statsCards() {
      const list = this.completedInRange, byCat = {}
      this.todoCats.forEach(c => byCat[c] = 0)
      list.forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + 1)
      const top = Object.entries(byCat).sort((x, y) => y[1] - x[1])[0]
      return [
        { k: '完成总数', v: `${list.length} 项` },
        { k: '覆盖类别', v: `${Object.values(byCat).filter(x => x > 0).length} 类` },
        { k: '总超期', v: `${list.reduce((s, t) => s + this.overdueDays(t), 0)} 天` },
        { k: '占比最高', v: top && top[1] ? `${top[0]} ${Math.round(top[1] / (list.length || 1) * 100)}%` : '—' }
      ]
    },
    catRows() {
      const list = this.completedInRange, byCat = {}
      this.todoCats.forEach(c => byCat[c] = 0)
      list.forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + 1)
      return Object.entries(byCat).filter(([k, v]) => v > 0).map(([k, v]) => ({ name: k, count: v, pct: Math.round(v / (list.length || 1) * 100), sample: list.filter(t => t.cat === k).slice(0, 2).map(t => t.name).join('、') }))
    }
  },
  actions: {
    overdueDays(t) {
      // 没设置预计完成时间 → 不算超期
      if (!t.due) return 0
      // “实际日期”：已完成用实际完成日，未完成用今天
      const actual = t.status === 'done' ? (t.completedAt || TODAY) : TODAY
      // 超期天数 = 实际日期 − 预计完成日期；只有实际晚于预期才计为正数（提前完成计 0）
      const d = diffDays(t.due, actual)
      return d > 0 ? d : 0
    },

    // ---- 认证 ----
    async login({ username, password }) {
      try {
        const r = await api.login({ username, password })
        setToken(r.token); this.token = r.token; this.user = r.user
        localStorage.setItem('lk_user', JSON.stringify(r.user))
        ElMessage.success(`欢迎回来，${r.user.username}`)
        await this.init()
        return true
      } catch (e) { ElMessage.error((e && e.message) || '登录失败'); return false }
    },
    async register({ username, password }) {
      try {
        const r = await api.register({ username, password })
        setToken(r.token); this.token = r.token; this.user = r.user
        localStorage.setItem('lk_user', JSON.stringify(r.user))
        ElMessage.success('注册成功，欢迎使用')
        await this.init()
        return true
      } catch (e) { ElMessage.error((e && e.message) || '注册失败'); return false }
    },
    logout() {
      clearToken(); localStorage.removeItem('lk_user')
      this.token = ''; this.user = null
      this.resetData()
      window.location.hash = '#/login'
    },
    resetData() {
      this.todoCats = []; this.todos = []; this.habitCats = []; this.habits = []
      this.quoteTags = []; this.quotes = []; this.folders = []; this.notes = []; this.diaries = []
      this.workFolders = []; this.workFiles = []
      this.loaded = false
    },

    // ---- 启动：从后端数据库加载全部数据 ----
    async init() {
      try {
        const [cats, todos, hcats, habits, quotes, folders, notes, diaries] = await Promise.all([
          api.getTodoCats(), api.getTodos(), api.getHabitCats(), api.getHabits(),
          api.getQuotes(), api.getFolders(), api.getNotes(), api.getDiaries()
        ])
        this.todoCats = cats.length ? cats : ['工作', '学习', '个人', '财务', '旅游', '健康']
        this.todos = todos || []
        this.habitCats = hcats.length ? hcats : ['健康', '学习', '生活']
        this.habits = habits || []
        this.quotes = (quotes || []).map(q => ({ ...q, tags: quoteTags(q) }))
        this.quoteTags = [...new Set(this.quotes.flatMap(q => q.tags))].filter(Boolean)
        this.folders = folders || []
        this.notes = notes || []
        this.diaries = diaries || []
        this.loaded = true
        ElMessage.success('数据已从数据库加载')
      } catch (e) {
        ElMessage.error('连接后端失败：' + (e && e.message ? e.message : e))
      }
    },

    // ---- 待办 ----
    async addTodo(p) {
      try {
        const input = { name: p.name, cat: p.cat, start: p.start, due: p.due, status: p.status || 'doing', repeat: p.repeat || '', note: p.note || '' }
        const todo = await api.createTodo(input)
        this.todos.unshift(todo)
        ElMessage.success('已创建待办')
      } catch (e) { ElMessage.error('创建待办失败：' + (e && e.message ? e.message : e)) }
    },
    async updateTodo(todo) {
      try {
        const input = { name: todo.name, cat: todo.cat, start: todo.start, due: todo.due, status: todo.status, repeat: todo.repeat || '', note: todo.note || '' }
        const updated = await api.updateTodo(todo.id, input)
        const i = this.todos.findIndex(t => t.id === todo.id); if (i > -1) this.todos.splice(i, 1, updated)
      } catch (e) { ElMessage.error('更新待办失败：' + (e && e.message ? e.message : e)) }
    },
    async deleteTodo(id) {
      try { await api.deleteTodo(id); this.todos = this.todos.filter(t => t.id !== id) }
      catch (e) { ElMessage.error('删除待办失败：' + (e && e.message ? e.message : e)) }
    },
    async toggleTodo(id) {
      try {
        const t = await api.toggleTodo(id)
        const i = this.todos.findIndex(x => x.id === id); if (i > -1) this.todos.splice(i, 1, t)
        if (t.status === 'done' && t.repeat) ElMessage.info(`周期事项（${t.repeat}）已完成，明天会自动生成新的一项`)
      } catch (e) { ElMessage.error('操作失败：' + (e && e.message ? e.message : e)) }
    },
    async addTodoCat(c) {
      if (c && !this.todoCats.includes(c)) {
        try { await api.addTodoCat({ name: c }); this.todoCats.push(c); ElMessage.success('已新增分类') }
        catch (e) { ElMessage.error('新增分类失败：' + (e && e.message ? e.message : e)) }
      }
    },
    async delTodoCat(c) {
      if (this.todos.some(t => t.cat === c)) { ElMessage.warning('该分类下有待办，不能删除'); return }
      try { await api.deleteTodoCat(c); this.todoCats = this.todoCats.filter(x => x !== c) }
      catch (e) { ElMessage.error('删除分类失败：' + (e && e.message ? e.message : e)) }
    },

    // ---- 习惯 ----
    async addHabit(p) {
      try {
        const input = { name: p.name, cat: p.cat, goal: p.goal, time: p.time }
        const h = await api.createHabit(input)
        this.habits.push(h)
      } catch (e) { ElMessage.error('创建习惯失败：' + (e && e.message ? e.message : e)) }
    },
    async updateHabit(h) {
      try {
        const input = { name: h.name, cat: h.cat, goal: h.goal, time: h.time }
        const updated = await api.updateHabit(h.id, input)
        const i = this.habits.findIndex(x => x.id === h.id); if (i > -1) this.habits.splice(i, 1, updated)
      } catch (e) { ElMessage.error('更新习惯失败：' + (e && e.message ? e.message : e)) }
    },
    async deleteHabit(id) {
      try { await api.deleteHabit(id); this.habits = this.habits.filter(h => h.id !== id) }
      catch (e) { ElMessage.error('删除习惯失败：' + (e && e.message ? e.message : e)) }
    },
    async toggleHabit(id) {
      try {
        const h = await api.toggleHabit(id)
        const i = this.habits.findIndex(x => x.id === id); if (i > -1) this.habits.splice(i, 1, h)
      } catch (e) { ElMessage.error('打卡失败：' + (e && e.message ? e.message : e)) }
    },
    async addHabitCat(c) {
      if (c && !this.habitCats.includes(c)) {
        try { await api.addHabitCat({ name: c }); this.habitCats.push(c) }
        catch (e) { ElMessage.error('新增分类失败：' + (e && e.message ? e.message : e)) }
      }
    },
    async delHabitCat(c) {
      if (this.habits.some(h => h.cat === c)) { ElMessage.warning('该分类下有习惯，不能删除'); return }
      try { await api.deleteHabitCat(c); this.habitCats = this.habitCats.filter(x => x !== c) }
      catch (e) { ElMessage.error('删除分类失败：' + (e && e.message ? e.message : e)) }
    },

    // ---- 名言（tags 数组 ↔ 后端逗号字符串）----
    async addQuote(p) {
      try {
        const input = { text: p.text, who: p.who, src: p.src, tags: (p.tags || []).join(','), date: p.date || TODAY }
        const q = await api.createQuote(input)
        this.quotes.unshift({ ...q, tags: quoteTags(q) })
        this.syncQuoteTags()
      } catch (e) { ElMessage.error('创建名言失败：' + (e && e.message ? e.message : e)) }
    },
    async updateQuote(q) {
      try {
        const input = { text: q.text, who: q.who, src: q.src, tags: (q.tags || []).join(','), date: q.date || TODAY }
        const updated = await api.updateQuote(q.id, input)
        const m = { ...updated, tags: quoteTags(updated) }
        const i = this.quotes.findIndex(x => x.id === q.id); if (i > -1) this.quotes.splice(i, 1, m)
        this.syncQuoteTags()
      } catch (e) { ElMessage.error('更新名言失败：' + (e && e.message ? e.message : e)) }
    },
    async deleteQuote(id) {
      try { await api.deleteQuote(id); this.quotes = this.quotes.filter(q => q.id !== id); this.syncQuoteTags() }
      catch (e) { ElMessage.error('删除名言失败：' + (e && e.message ? e.message : e)) }
    },
    syncQuoteTags() { this.quoteTags = [...new Set(this.quotes.flatMap(q => q.tags || []))] },

    // ---- 读后感：文件夹 + 笔记 ----
    async addFolder(n) {
      if (n && !this.folders.includes(n)) {
        try { await api.addFolder({ name: n }); this.folders.push(n); ElMessage.success('已创建文件夹') }
        catch (e) { ElMessage.error('创建文件夹失败：' + (e && e.message ? e.message : e)) }
      }
    },
    async delFolder(f) {
      if (this.notes.some(n => n.folder === f)) { ElMessage.warning('该文件夹下有笔记，不能删除'); return }
      try { await api.deleteFolder(f); this.folders = this.folders.filter(x => x !== f) }
      catch (e) { ElMessage.error('删除文件夹失败：' + (e && e.message ? e.message : e)) }
    },
    async addNote(p) {
      try {
        const input = { folder: p.folder, title: p.title, content: p.content, date: p.date || TODAY }
        const note = await api.createNote(input)
        this.notes.unshift(note)
      } catch (e) { ElMessage.error('保存笔记失败：' + (e && e.message ? e.message : e)) }
    },
    async updateNote(n) {
      try {
        const input = { folder: n.folder, title: n.title, content: n.content, date: n.date }
        const updated = await api.updateNote(n.id, input)
        const i = this.notes.findIndex(x => x.id === n.id); if (i > -1) this.notes.splice(i, 1, updated)
      } catch (e) { ElMessage.error('更新笔记失败：' + (e && e.message ? e.message : e)) }
    },
    async deleteNote(id) {
      try { await api.deleteNote(id); this.notes = this.notes.filter(n => n.id !== id) }
      catch (e) { ElMessage.error('删除笔记失败：' + (e && e.message ? e.message : e)) }
    },

    // ---- 日记 ----
    async addDiary(p) {
      try {
        p.date = p.date || TODAY; p.weekday = weekdayCN(p.date)
        const input = { date: p.date, weekday: p.weekday, location: p.location, weather: p.weather, text: p.text }
        const d = await api.createDiary(input)
        this.diaries.unshift(d)
      } catch (e) { ElMessage.error('保存日记失败：' + (e && e.message ? e.message : e)) }
    },
    async updateDiary(d) {
      try {
        const input = { date: d.date, weekday: d.weekday, location: d.location, weather: d.weather, text: d.text }
        const updated = await api.updateDiary(d.id, input)
        const i = this.diaries.findIndex(x => x.id === d.id); if (i > -1) this.diaries.splice(i, 1, updated)
      } catch (e) { ElMessage.error('更新日记失败：' + (e && e.message ? e.message : e)) }
    },
    async deleteDiary(id) {
      try { await api.deleteDiary(id); this.diaries = this.diaries.filter(d => d.id !== id) }
      catch (e) { ElMessage.error('删除日记失败：' + (e && e.message ? e.message : e)) }
    },

    // ---- 工作笔记：文件夹树 + 文件 ----
    async loadWorkFolders() { this.workFolders = (await api.getWorkFolders()) || [] },
    async loadWorkFiles(folderId = 0) { this.workFiles = (await api.getWorkFiles(folderId)) || [] },
    async addWorkFolder(name, parentId = null) {
      const f = await api.addWorkFolder({ name, parentId })
      this.workFolders.push(f)
      return f
    },
    async renameWorkFolder(id, name) {
      const f = await api.renameWorkFolder(id, { name })
      this.workFolders = this.workFolders.map(x => x.id === id ? f : x)
    },
    async deleteWorkFolder(id) {
      await api.deleteWorkFolder(id)
      this.workFolders = this.workFolders.filter(x => x.id !== id)
      this.workFiles = this.workFiles.filter(x => x.folderId !== id)
    },
    async addWorkFile(p) {
      const f = await api.createWorkFile({ name: p.name, folderId: p.folderId || 0, type: p.type || 'txt', content: p.content || '' })
      this.workFiles.push(f)
      return f
    },
    async updateWorkFile(id, patch) {
      const f = await api.updateWorkFile(id, patch)
      this.workFiles = this.workFiles.map(x => x.id === id ? f : x)
      return f
    },
    async deleteWorkFile(id) { await api.deleteWorkFile(id); this.workFiles = this.workFiles.filter(x => x.id !== id) },
    async getWorkFile(id) { return await api.getWorkFile(id) },
    async exportWorkNotes() {
      const files = (await api.getWorkFilesAll()) || []
      const fmap = {}
      this.workFolders.forEach(f => fmap[f.id] = f)
      const pathOf = (id, acc = []) => {
        if (!id || !fmap[id]) return acc
        acc.unshift(fmap[id].name)
        return pathOf(fmap[id].parentId, acc)
      }
      const rows = [['所属文件夹', '文件名', '类型', '内容', '修改时间'], ...files.map(fl => [pathOf(fl.folderId).join('/') || '根目录', fl.name, fl.type, fl.content || '', fl.updatedAt])]
      this.download(`工作笔记全部-${TODAY}.csv`, this.csv(rows))
    },

    // ---- 主题 ----
    toggleTheme() { this.dark = !this.dark; document.documentElement.classList.toggle('dark', this.dark); localStorage.setItem('lk-theme', this.dark ? 'dark' : 'light') },

    // ---- 导出 ----
    csv(rows) { return rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') },
    download(name, content, type = 'text/csv') {
      const blob = new Blob(['\ufeff' + content], { type })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href)
    },
    exportModule(kind, from = '', to = '') {
      const inRange = (date) => (!from || date >= from) && (!to || date <= to)
      const todo = () => [['名称', '类别', '开始', '预计完成', '状态', '周期', '备注', '完成时间'], ...this.todos.filter(t => inRange(t.start)).map(t => [t.name, t.cat, t.start, t.due, t.status, t.repeat || '无', t.note, t.completedAt])]
      const habit = () => [['名称', '类别', '目标', '连续天数', '提醒', '今日完成'], ...this.habits.map(h => [h.name, h.cat, h.goal, h.streak, h.time, h.doneToday ? '是' : '否'])]
      const quote = () => [['内容', '作者', '来源', '标签', '日期'], ...this.quotes.filter(q => inRange(q.date)).map(q => [q.text, q.who, q.src, (q.tags || []).join('、'), q.date])]
      const note = () => [['文件夹', '标题', '内容', '日期'], ...this.notes.filter(n => inRange(n.date)).map(n => [n.folder, n.title, n.content, n.date])]
      const diary = () => [['日期', '星期', '地点', '天气', '内容'], ...this.diaries.filter(d => inRange(d.date)).map(d => [d.date, d.weekday, d.location, d.weather, d.text])]
      const map = { todo, habit, quote, note, diary }
      const rows = (map[kind] || todo)()
      const suffix = (from || to) ? `-${from}~${to}` : ''
      this.download(`${kind}${suffix}-${TODAY}.csv`, this.csv(rows))
      ElMessage.success('已导出')
    },
    exportAll(from = '', to = '') {
      const inRange = (date) => (!from || date >= from) && (!to || date <= to)
      const parts = []
      parts.push('# 待办\n' + this.csv([['名称', '类别', '开始', '预计完成', '状态', '周期', '备注', '完成时间'], ...this.todos.filter(t => inRange(t.start)).map(t => [t.name, t.cat, t.start, t.due, t.status, t.repeat || '无', t.note, t.completedAt])]))
      parts.push('# 习惯\n' + this.csv([['名称', '类别', '目标', '连续天数', '提醒', '今日完成'], ...this.habits.map(h => [h.name, h.cat, h.goal, h.streak, h.time, h.doneToday ? '是' : '否'])]))
      parts.push('# 名言\n' + this.csv([['内容', '作者', '来源', '标签', '日期'], ...this.quotes.filter(q => inRange(q.date)).map(q => [q.text, q.who, q.src, (q.tags || []).join('、'), q.date])]))
      parts.push('# 读后感\n' + this.csv([['文件夹', '标题', '内容', '日期'], ...this.notes.filter(n => inRange(n.date)).map(n => [n.folder, n.title, n.content, n.date])]))
      parts.push('# 日记\n' + this.csv([['日期', '星期', '地点', '天气', '内容'], ...this.diaries.filter(d => inRange(d.date)).map(d => [d.date, d.weekday, d.location, d.weather, d.text])]))
      const suffix = (from || to) ? `-${from}~${to}` : ''
      this.download(`生活助手全部数据${suffix}-${TODAY}.csv`, parts.join('\n\n'))
      ElMessage.success('已导出全部数据')
    },
    exportStats() {
      const a = this.statsStart, b = this.statsEnd, list = this.completedInRange
      const rows = [['开始', '结束', '完成日期', '类别', '事项', '超期(天)'], ...list.map(t => [a, b, t.completedAt, t.cat, t.name, this.overdueDays(t)])]
      this.download(`数据统计-${a === b ? a : a + '~' + b}.csv`, this.csv(rows))
    },
    setStatsPreset(k) {
      let s, e
      if (k === 'today') { s = TODAY; e = TODAY } else if (k === 'week') { s = fmt(addDays(new Date(), -6)); e = TODAY } else if (k === 'month') { s = fmt(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); e = TODAY } else if (k === 'year') { s = fmt(new Date(new Date().getFullYear(), 0, 1)); e = TODAY }
      this.statsPreset = k; this.statsRange = [s, e]
    }
  }
})

import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

// 数据格式工具
const fmt = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const weekdayCN = (d) => `星期${WEEK[new Date(d).getDay()]}`
const TODAY = fmt(new Date())

export const useStore = defineStore('app', {
  state: () => ({
    // 待办
    todoCats: ['工作', '学习', '个人', '财务', '旅游', '健康'],
    todos: [
      { id: 1, name: '完成季度述职报告', cat: '工作', start: '2026-09-20', due: '2026-09-28', status: 'doing', repeat: '', note: '', completedAt: '' },
      { id: 2, name: '预订周末苏州周边行程', cat: '旅游', start: '2026-09-22', due: '2026-09-26', status: 'done', repeat: '', note: '', completedAt: fmt(addDays(new Date(), -1)) },
      { id: 3, name: '整理硬盘里的一批照片', cat: '个人', start: '2026-09-10', due: '2026-09-25', status: 'done', repeat: '', note: '', completedAt: TODAY },
      { id: 4, name: '学习 Vue Router', cat: '学习', start: '2026-09-01', due: '2026-09-30', status: 'doing', repeat: '', note: '', completedAt: '' },
      { id: 5, name: '去银行办社保卡', cat: '财务', start: '2026-09-05', due: '2026-09-18', status: 'done', repeat: '', note: '', completedAt: fmt(addDays(new Date(), -2)) },
      { id: 6, name: '收拾阳台绿植', cat: '个人', start: '2026-09-24', due: '2026-09-29', status: 'doing', repeat: '', note: '', completedAt: '' },
      { id: 7, name: '晨跑 30 分钟', cat: '健康', start: '2026-09-01', due: '2026-09-30', status: 'doing', repeat: 'daily', note: '', completedAt: '' },
      { id: 8, name: '月度复盘', cat: '工作', start: '2026-09-01', due: '2026-09-30', status: 'done', repeat: 'monthly', note: '', completedAt: fmt(addDays(new Date(), -4)) },
      { id: 9, name: '读一章《百年孤独》', cat: '学习', start: '2026-09-01', due: '2026-09-30', status: 'done', repeat: 'daily', note: '', completedAt: fmt(addDays(new Date(), -6)) },
      { id: 10, name: '体检预约', cat: '健康', start: '2026-09-15', due: '2026-09-22', status: 'done', repeat: '', note: '', completedAt: fmt(addDays(new Date(), -3)) },
      { id: 11, name: '整理读书笔记', cat: '学习', start: '2026-09-21', due: '2026-09-27', status: 'done', repeat: '', note: '', completedAt: fmt(addDays(new Date(), -5)) }
    ],
    // 好习惯（类别独立）
    habitCats: ['健康', '学习', '生活'],
    habits: [
      { id: 1, name: '早起后喝一杯温水', cat: '健康', goal: '每天一次', streak: 12, time: '07:30', doneToday: true },
      { id: 2, name: '阅读 30 分钟', cat: '学习', goal: '每天一次', streak: 58, time: '21:00', doneToday: true },
      { id: 3, name: '每日运动', cat: '健康', goal: '每天一次', streak: 23, time: '18:30', doneToday: true },
      { id: 4, name: '记账', cat: '生活', goal: '每天一次', streak: 6, time: '22:00', doneToday: false }
    ],
    // 名言
    quoteTags: ['时间', '成长', '行动', '心态'],
    quotes: [
      { id: 1, text: '如果你想要一个跟别人不一样的人生，就不要和别人一样的时间表。', who: '罗振宇', src: '《罗辑思维》', tags: ['时间'], date: '2026-09-10' },
      { id: 2, text: '把时间放在哪里，成果就出现在哪里。', who: '李笑来', src: '《把时间当作朋友》', tags: ['时间', '行动'], date: '2026-09-15' },
      { id: 3, text: '种一棵树最好的时间是十年前，其次是现在。', who: '佚名', src: '', tags: ['行动', '心态'], date: '2026-09-20' }
    ],
    // 读后感：文件夹 + 笔记
    folders: ['文学', '历史', '哲学', '个人成长', '科技'],
    notes: [
      { id: 1, folder: '文学', title: '《活着》读后感', content: '福贵的一生，把「活着」这个词写到了极致。苦难不是生活的全部，但承受苦难的坚韧，是生活本身。', date: '2026-09-18' },
      { id: 2, folder: '文学', title: '《百年孤独》札记', content: '马孔多的历史，是一本写满了孤独的家族史。布恩迪亚家族七代人的兴衰，映照出人类对孤独的逃避与拥抱。', date: '2026-09-06' },
      { id: 3, folder: '历史', title: '《万历十五年》笔记', content: '以万历十五年这个看似平淡的年份切入，剖析明代文官制度的运转与僵化，以小见大。', date: '2026-08-28' },
      { id: 4, folder: '哲学', title: '《沉思录》摘记', content: '「你所做的每一件事，都要像人生的最后一件事那样去做。」斯多葛的平静与自省。', date: '2026-09-12' },
      { id: 5, folder: '个人成长', title: '《把时间当作朋友》读后感', content: '时间不可管理，能管理的只有自己。积累、耐心、思考，是时间给我们的回报。', date: '2026-09-22' },
      { id: 6, folder: '科技', title: '《失控》读书笔记', content: '失控不是混乱，而是去中心化的涌现。蜂群、市场、生命，都是在没有中央控制下自组织的智慧。', date: '2026-08-15' }
    ],
    // 电子日记
    diaries: [
      { id: 1, date: TODAY, weekday: weekdayCN(TODAY), location: '苏州', weather: '晴', text: '今天状态不错，把积压的待办清掉了大半。晚上读了几页书，心很静。' },
      { id: 2, date: fmt(addDays(new Date(), -1)), weekday: weekdayCN(addDays(new Date(), -1)), location: '苏州', weather: '多云', text: '周末去了趟山塘街，秋天的风很舒服。晚上和朋友聊了聊近况，有些启发。' }
    ],
    // 界面
    dark: false,
    menuOpen: false,
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
      if (t.status === 'done' || !t.due) return 0
      const d = diffDays(t.due, TODAY)
      return d < 0 ? -d : 0
    },
    // ---- 待办 ----
    addTodo(p) {
      const id = Math.max(0, ...this.todos.map(t => t.id)) + 1
      this.todos.push({ id, ...p, status: 'doing', completedAt: '' })
      ElMessage.success('已创建待办')
    },
    updateTodo(todo) { const i = this.todos.findIndex(t => t.id === todo.id); if (i > -1) this.todos.splice(i, 1, todo) },
    deleteTodo(id) { this.todos = this.todos.filter(t => t.id !== id) },
    toggleTodo(id) {
      const t = this.todos.find(x => x.id === id)
      if (!t) return
      if (t.status === 'done') { t.status = 'doing'; t.completedAt = '' }
      else {
        t.status = 'done'; t.completedAt = TODAY
        if (t.repeat) ElMessage.info(`周期事项（${t.repeat}）已完成，明天会自动生成新的一项`)
      }
    },
    addTodoCat(c) { if (c && !this.todoCats.includes(c)) { this.todoCats.push(c); ElMessage.success('已新增分类') } },
    delTodoCat(c) {
      if (this.todos.some(t => t.cat === c)) { ElMessage.warning('该分类下有待办，不能删除'); return }
      this.todoCats = this.todoCats.filter(x => x !== c)
    },
    // ---- 习惯 ----
    addHabit(p) { const id = Math.max(0, ...this.habits.map(h => h.id)) + 1; this.habits.push({ id, ...p, streak: 0, doneToday: false }) },
    updateHabit(h) { const i = this.habits.findIndex(x => x.id === h.id); if (i > -1) this.habits.splice(i, 1, h) },
    deleteHabit(id) { this.habits = this.habits.filter(h => h.id !== id) },
    toggleHabit(id) { const h = this.habits.find(x => x.id === id); if (!h) return; h.doneToday = !h.doneToday; if (h.doneToday) h.streak += 1; else h.streak = Math.max(0, h.streak - 1) },
    addHabitCat(c) { if (c && !this.habitCats.includes(c)) this.habitCats.push(c) },
    delHabitCat(c) { if (this.habits.some(h => h.cat === c)) { ElMessage.warning('该分类下有习惯，不能删除'); return } this.habitCats = this.habitCats.filter(x => x !== c) },
    // ---- 名言 ----
    addQuote(p) { const id = Math.max(0, ...this.quotes.map(q => q.id)) + 1; this.quotes.push({ id, ...p, date: TODAY }); this.syncQuoteTags() },
    updateQuote(q) { const i = this.quotes.findIndex(x => x.id === q.id); if (i > -1) this.quotes.splice(i, 1, q); this.syncQuoteTags() },
    deleteQuote(id) { this.quotes = this.quotes.filter(q => q.id !== id); this.syncQuoteTags() },
    syncQuoteTags() { this.quoteTags = [...new Set(this.quotes.flatMap(q => q.tags || []))] },
    // ---- 读后感 ----
    addFolder(n) { if (n && !this.folders.includes(n)) { this.folders.push(n); ElMessage.success('已创建文件夹') } },
    delFolder(f) { if (this.notes.some(n => n.folder === f)) { ElMessage.warning('该文件夹下有笔记，不能删除'); return } this.folders = this.folders.filter(x => x !== f) },
    addNote(p) { const id = Math.max(0, ...this.notes.map(n => n.id)) + 1; this.notes.push({ id, ...p, date: TODAY }) },
    updateNote(n) { const i = this.notes.findIndex(x => x.id === n.id); if (i > -1) this.notes.splice(i, 1, n) },
    deleteNote(id) { this.notes = this.notes.filter(n => n.id !== id) },
    // ---- 日记 ----
    addDiary(p) {
      p.date = p.date || TODAY; p.weekday = weekdayCN(p.date)
      const id = Math.max(0, ...this.diaries.map(d => d.id)) + 1
      this.diaries.unshift({ id, ...p })
    },
    updateDiary(d) { const i = this.diaries.findIndex(x => x.id === d.id); if (i > -1) this.diaries.splice(i, 1, d) },
    deleteDiary(id) { this.diaries = this.diaries.filter(d => d.id !== id) },
    // ---- 主题 ----
    toggleTheme() { this.dark = !this.dark; document.documentElement.classList.toggle('dark', this.dark); localStorage.setItem('lk-theme', this.dark ? 'dark' : 'light') },
    // ---- 导出 ----
    csv(rows) { return rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') },
    download(name, content, type = 'text/csv') {
      const blob = new Blob(['\ufeff' + content], { type })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href)
    },
    exportModule(kind) {
      const map = {
        todo: () => [['名称', '类别', '开始', '预计完成', '状态', '周期', '备注', '完成时间'], ...this.todos.map(t => [t.name, t.cat, t.start, t.due, t.status, t.repeat || '无', t.note, t.completedAt])],
        habit: () => [['名称', '类别', '目标', '连续天数', '提醒', '今日完成'], ...this.habits.map(h => [h.name, h.cat, h.goal, h.streak, h.time, h.doneToday ? '是' : '否'])],
        quote: () => [['内容', '作者', '来源', '标签', '日期'], ...this.quotes.map(q => [q.text, q.who, q.src, (q.tags || []).join('、'), q.date])],
        note: () => [['文件夹', '标题', '内容', '日期'], ...this.notes.map(n => [n.folder, n.title, n.content, n.date])],
        diary: () => [['日期', '星期', '地点', '天气', '内容'], ...this.diaries.map(d => [d.date, d.weekday, d.location, d.weather, d.text])]
      }
      const rows = (map[kind] || map.todo)()
      this.download(`${kind}-${TODAY}.csv`, this.csv(rows))
      ElMessage.success('已导出')
    },
    exportAll() {
      const parts = []
      parts.push('# 待办\n' + this.csv([['名称', '类别', '开始', '预计完成', '状态', '周期', '备注', '完成时间'], ...this.todos.map(t => [t.name, t.cat, t.start, t.due, t.status, t.repeat || '无', t.note, t.completedAt])]))
      parts.push('# 习惯\n' + this.csv([['名称', '类别', '目标', '连续天数', '提醒', '今日完成'], ...this.habits.map(h => [h.name, h.cat, h.goal, h.streak, h.time, h.doneToday ? '是' : '否'])]))
      parts.push('# 名言\n' + this.csv([['内容', '作者', '来源', '标签', '日期'], ...this.quotes.map(q => [q.text, q.who, q.src, (q.tags || []).join('、'), q.date])]))
      parts.push('# 读后感\n' + this.csv([['文件夹', '标题', '内容', '日期'], ...this.notes.map(n => [n.folder, n.title, n.content, n.date])]))
      parts.push('# 日记\n' + this.csv([['日期', '星期', '地点', '天气', '内容'], ...this.diaries.map(d => [d.date, d.weekday, d.location, d.weather, d.text])]))
      this.download(`生活助手全部数据-${TODAY}.csv`, parts.join('\n\n'))
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

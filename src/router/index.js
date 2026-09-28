import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Overview from '../views/Overview.vue'
import Todos from '../views/Todos.vue'
import Stats from '../views/Stats.vue'
import Quotes from '../views/Quotes.vue'
import Reading from '../views/Reading.vue'
import Habits from '../views/Habits.vue'
import Diary from '../views/Diary.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { title: '登录' } },
  { path: '/', name: 'overview', component: Overview, meta: { title: '工作台' } },
  { path: '/todos', name: 'todos', component: Todos, meta: { title: '待办事项' } },
  { path: '/stats', name: 'stats', component: Stats, meta: { title: '数据统计' } },
  { path: '/quotes', name: 'quotes', component: Quotes, meta: { title: '名言警句' } },
  { path: '/reading', name: 'reading', component: Reading, meta: { title: '读后感' } },
  { path: '/habits', name: 'habits', component: Habits, meta: { title: '好习惯' } },
  { path: '/diary', name: 'diary', component: Diary, meta: { title: '电子日记' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局守卫：未登录一律去登录页；已登录不能停留在登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('lk_token')
  if (to.path === '/login') {
    return token ? next('/') : next()
  }
  return token ? next() : next('/login')
})

export default router

<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">工作台</div>
        <div class="page-desc">今天想做的事、刚记录的话、要养成的习惯，都从这里开始。</div>
      </div>
      <div><el-button type="primary" @click="router.push('/todos')">新建待办</el-button></div>
    </div>

    <el-row :gutter="14" class="mb">
      <el-col :xs="12" :sm="6" :md="6" v-for="c in statCards" :key="c.k">
        <div class="stat-link" @click="c.to">
          <div class="stat-card">
            <div class="v" :class="{ amber: c.amber }">{{ c.v }}</div>
            <div class="k">{{ c.k }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="week-panel">
      <el-card shadow="never">
        <template #header>今日待办 · {{ store.todayTodos.length }} 项未完成</template>
        <div v-for="t in store.todayTodos" :key="t.id" class="ov-item">
          <el-checkbox :model-value="t.status === 'done'" @change="store.toggleTodo(t.id)"></el-checkbox>
          <div class="meta">
            <div class="n">{{ t.name }}</div>
            <div class="m">{{ t.cat }} · 起 {{ t.start }}</div>
          </div>
          <el-tag :type="t.due && t.due < today ? 'danger' : 'primary'" size="small" effect="light">
            {{ t.due && t.due < today ? '已逾期' : '进行中' }}
          </el-tag>
        </div>
        <el-empty v-if="!store.todayTodos.length" description="今天没有待办了" :image-size="60"></el-empty>
      </el-card>

      <el-card shadow="never">
        <template #header>最近名言 · 习惯打卡</template>
        <div v-for="q in store.quotes.slice(0, 2)" :key="q.id" class="quote">
          <div class="txt">“{{ q.text }}”</div>
          <div class="who">{{ q.who }}{{ q.src ? '《' + q.src + '》' : '' }}</div>
        </div>
        <div v-for="h in store.habits" :key="h.id" class="ov-item">
          <el-checkbox :model-value="h.doneToday" @change="store.toggleHabit(h.id)"></el-checkbox>
          <div class="meta">
            <div class="n">{{ h.name }}</div>
            <div class="m">连续 {{ h.streak }} 天</div>
          </div>
          <el-tag size="small" :type="h.doneToday ? 'success' : 'info'" effect="light">{{ h.doneToday ? '已打卡' : '待打卡' }}</el-tag>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useStore } from '../store'
const router = useRouter()
const store = useStore()
const today = new Date().toISOString().slice(0, 10)
const statCards = computed(() => [
  { k: '未完成待办', v: store.todayTodos.length, to: () => router.push('/todos') },
  { k: '今日已完成', v: store.doneToday.length, to: () => router.push('/todos') },
  { k: '已逾期', v: store.overdue.length, amber: true, to: () => router.push('/todos') },
  { k: '习惯累计打卡', v: store.totalStreak, to: () => router.push('/habits') }
])
</script>

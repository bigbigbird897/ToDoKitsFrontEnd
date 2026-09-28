<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">待办事项</div>
        <div class="page-desc">按状态 / 类别筛选，支持周期重复；一周记录单独呈现。</div>
      </div>
      <div>
        <el-button @click="manageCat = true">管理分类</el-button>
        <el-button type="primary" @click="openAdd()">新增待办</el-button>
      </div>
    </div>

    <div class="mb filters">
      <el-input v-model="q" placeholder="搜索事项名称…" clearable style="width:220px"></el-input>
      <el-select v-model="cat" placeholder="全部类别" clearable style="width:150px">
        <el-option v-for="c in store.todoCats" :key="c" :label="c" :value="c"></el-option>
      </el-select>
      <el-select v-model="status" placeholder="全部状态" clearable style="width:150px">
        <el-option label="未完成" value="doing"></el-option>
        <el-option label="已完成" value="done"></el-option>
        <el-option label="已逾期" value="overdue"></el-option>
      </el-select>
    </div>

    <el-card shadow="never" class="mb">
      <template #header>全部待办（{{ filtered.length }}）</template>
      <div class="table-wrap"><el-table :data="filtered" size="small" style="width:100%">
        <el-table-column label="完成" width="60">
          <template #default="{ row }">
            <el-checkbox :model-value="row.status === 'done'" @change="store.toggleTodo(row.id)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="180"><template #default="{ row }">{{ row.name }}</template></el-table-column>
        <el-table-column label="类别" width="90"><template #default="{ row }"><span class="cat-cell"><i class="cat-dot" :style="{ background: catColor(row.cat) }"></i>{{ row.cat }}</span></template></el-table-column>
        <el-table-column label="开始" width="110"><template #default="{ row }">{{ row.start }}</template></el-table-column>
        <el-table-column label="预计完成" width="110"><template #default="{ row }">{{ row.due }}</template></el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'done' ? 'success' : (row.due && row.due < today ? 'danger' : 'primary')" size="small" effect="light">
              {{ row.status === 'done' ? '已完成' : (row.due && row.due < today ? '已逾期' : '进行中') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="周期" width="80"><template #default="{ row }">{{ row.repeat || '—' }}</template></el-table-column>
        <el-table-column label="超期" width="80"><template #default="{ row }">{{ store.overdueDays(row) ? store.overdueDays(row) + ' 天' : '—' }}</template></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="store.deleteTodo(row.id)">删除</el-button>
          </template>
        </el-table-column>
        </el-table></div>
      <el-empty v-if="!filtered.length" description="没有符合条件的待办" :image-size="60"></el-empty>
    </el-card>

    <el-card shadow="never">
      <template #header>本周记录（{{ weekTodos.length }}）</template>
      <div v-for="t in weekTodos" :key="t.id" class="ov-item">
        <el-checkbox :model-value="t.status === 'done'" @change="store.toggleTodo(t.id)"></el-checkbox>
        <div class="meta"><div class="n">{{ t.name }}</div><div class="m">{{ t.cat }} · 预计 {{ t.due }}</div></div>
        <el-tag size="small" :type="t.status === 'done' ? 'success' : 'primary'" effect="light">{{ t.status === 'done' ? '已完成' : '待办' }}</el-tag>
      </div>
      <el-empty v-if="!weekTodos.length" description="本周还没有待办" :image-size="60"></el-empty>
    </el-card>

    <el-dialog v-model="dlg.show" :title="dlg.editing ? '编辑待办' : '新增待办'" width="520px">
      <el-form label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" placeholder="要做什么？"></el-input></el-form-item>
        <el-form-item label="类别">
          <el-select v-model="form.cat" style="width:100%">
            <el-option v-for="c in store.todoCats" :key="c" :label="c" :value="c"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间"><el-date-picker v-model="form.start" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item>
        <el-form-item label="预计完成"><el-date-picker v-model="form.due" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item>
        <el-form-item label="周期重复">
          <el-select v-model="form.repeat" style="width:100%">
            <el-option label="不重复" value=""></el-option>
            <el-option label="每天" value="daily"></el-option>
            <el-option label="每周" value="weekly"></el-option>
            <el-option label="每月" value="monthly"></el-option>
            <el-option label="每年" value="yearly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.note" type="textarea" :rows="2"></el-input></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.show = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="manageCat" title="管理待办分类" width="440px">
      <div class="cat-manage">
        <el-tag v-for="c in store.todoCats" :key="c" closable @close="store.delTodoCat(c)" size="large">{{ c }}</el-tag>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <el-input v-model="newCat" placeholder="新分类名称"></el-input>
        <el-button type="primary" @click="addCat">添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useStore } from '../store'
const store = useStore()
const today = new Date().toISOString().slice(0, 10)
const q = ref(''); const cat = ref(''); const status = ref('')
const manageCat = ref(false); const newCat = ref('')
const dlg = reactive({ show: false, editing: false })
const emptyForm = () => ({ id: 0, name: '', cat: '工作', start: today, due: today, status: 'doing', repeat: '', note: '', completedAt: '' })
const form = reactive(emptyForm())
const CAT_COLORS = ['#2E7D6B', '#3F8A5C', '#C97B4A', '#3F7DB0', '#C75C5C', '#7A5FA0', '#A06A3C', '#5E8C9E', '#6E9B6E', '#B0605A']
const catColor = (c) => CAT_COLORS[store.todoCats.indexOf(c) % CAT_COLORS.length]

const filtered = computed(() => {
  return store.todos.filter(t => {
    if (q.value && !t.name.includes(q.value)) return false
    if (cat.value && t.cat !== cat.value) return false
    if (status.value === 'done' && t.status !== 'done') return false
    if (status.value === 'doing' && t.status === 'done') return false
    if (status.value === 'overdue' && !(t.status !== 'done' && t.due && t.due < today)) return false
    return true
  })
})
const weekAgo = today.slice(0, 8) + '01'
const weekTodos = computed(() => store.todos.filter(t => t.start >= weekAgo))
function openAdd() { Object.assign(form, emptyForm()); dlg.editing = false; dlg.show = true }
function openEdit(t) { Object.assign(form, { ...t }); dlg.editing = true; dlg.show = true }
function save() {
  if (!form.name.trim()) return
  if (dlg.editing) store.updateTodo({ ...form })
  else store.addTodo({ ...form })
  dlg.show = false
}
function addCat() { const c = newCat.value.trim(); if (c) { store.addTodoCat(c); newCat.value = '' } }
</script>

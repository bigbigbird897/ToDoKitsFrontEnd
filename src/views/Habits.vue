<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">好习惯</div>
        <div class="page-desc">每天打卡，积累那些值得坚持的事。习惯分类与待办分类分开维护。</div>
      </div>
      <div>
        <RangeExport kind="habit" />
        <el-button type="primary" @click="openAdd()">新增习惯</el-button>
      </div>
    </div>

    <div class="mb" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <el-select v-model="cat" placeholder="全部类别" clearable style="width:150px">
        <el-option v-for="c in store.habitCats" :key="c" :label="c" :value="c"></el-option>
      </el-select>
      <el-button @click="manageCat = true">管理习惯分类</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="8" v-for="h in filtered" :key="h.id" style="margin-bottom:16px">
        <el-card shadow="never">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div class="page-title" style="font-size:17px">{{ h.name }}</div>
              <div class="diary-attr" style="margin-top:6px"><el-tag size="small" effect="light">{{ h.cat }}</el-tag> 目标 {{ h.goal }}</div>
            </div>
            <el-checkbox :model-value="h.doneToday" size="large" @change="store.toggleHabit(h.id)" :aria-label="h.name"></el-checkbox>
          </div>
          <div class="habit-card">
            <div class="streak">{{ h.streak }}<span style="font-size:13px;color:var(--el-text-color-secondary)"> 天</span></div>
            <div class="m" style="font-size:12px;color:var(--el-text-color-secondary)">连续打卡 · 提醒 {{ h.time }}</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
            <el-button link type="primary" @click="openEdit(h)">编辑</el-button>
            <el-button link type="danger" @click="store.deleteHabit(h.id)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!filtered.length" description="还没有习惯" :image-size="60"></el-empty>

    <el-dialog v-model="dlg.show" :title="dlg.editing ? '编辑习惯' : '新增习惯'" width="520px">
      <el-form label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" placeholder="要养成的习惯"></el-input></el-form-item>
        <el-form-item label="类别">
          <el-select v-model="form.cat" style="width:100%">
            <el-option v-for="c in store.habitCats" :key="c" :label="c" :value="c"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标"><el-input v-model="form.goal" placeholder="例如：每天一次"></el-input></el-form-item>
        <el-form-item label="提醒时间"><el-time-picker v-model="form.time" value-format="HH:mm" format="HH:mm" style="width:100%"></el-time-picker></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.show = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="manageCat" title="管理习惯分类" width="440px">
      <div class="cat-manage">
        <el-tag v-for="c in store.habitCats" :key="c" closable @close="store.delHabitCat(c)" size="large">{{ c }}</el-tag>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <el-input v-model="newCat" placeholder="新习惯分类"></el-input>
        <el-button type="primary" @click="addCat">添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import RangeExport from '../components/RangeExport.vue'
import { useStore } from '../store'
const store = useStore()
const cat = ref(''); const manageCat = ref(false); const newCat = ref('')
const dlg = reactive({ show: false, editing: false })
const empty = () => ({ id: 0, name: '', cat: '健康', goal: '每天一次', streak: 0, time: '08:00', doneToday: false })
const form = reactive(empty())
const filtered = computed(() => cat.value ? store.habits.filter(h => h.cat === cat.value) : store.habits)
function openAdd() { Object.assign(form, empty()); dlg.editing = false; dlg.show = true }
function openEdit(h) { Object.assign(form, { ...h }); dlg.editing = true; dlg.show = true }
function save() { if (!form.name.trim()) return; if (dlg.editing) store.updateHabit({ ...form }); else store.addHabit({ ...form }); dlg.show = false }
function addCat() { const c = newCat.value.trim(); if (c) { store.addHabitCat(c); newCat.value = '' } }
</script>

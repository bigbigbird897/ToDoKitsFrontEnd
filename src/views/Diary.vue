<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">电子日记</div>
        <div class="page-desc">每天写一点感悟，记录星期几、地点与天气。</div>
      </div>
      <div><RangeExport kind="diary" /><el-button type="primary" style="margin-left:12px" @click="openAdd()">写日记</el-button></div>
    </div>

    <div class="reading">
      <el-card shadow="never">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span style="flex-shrink:0;white-space:nowrap">日记列表</span>
            <el-input v-model="q" placeholder="搜索日记内容…" clearable size="small" style="flex:1;min-width:130px"></el-input>
          </div>
        </template>
        <el-scrollbar height="460px" always>
          <div v-for="d in filteredDiaries" :key="d.id" class="notes-row" :class="{ active: current === d.id }" @click="current = d.id; fill(d)">
            <div class="meta"><div class="n">{{ d.date }} {{ d.weekday }}</div><div class="m">{{ d.location }} · {{ d.weather }}</div></div>
          </div>
        </el-scrollbar>
        <el-empty v-if="!filteredDiaries.length" :description="q ? '没有匹配的日记' : '还没有日记'" :image-size="50"></el-empty>
      </el-card>

      <el-card shadow="never" class="diary-editor">
        <template #header>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
            <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width:140px"></el-date-picker>
            <el-select v-model="form.weekday" style="width:110px" placeholder="星期">
              <el-option v-for="w in weekdays" :key="w" :label="w" :value="w"></el-option>
            </el-select>
            <el-input v-model="form.location" placeholder="地点（城市）" style="width:140px"></el-input>
            <el-select v-model="form.weather" style="width:110px" placeholder="天气">
              <el-option v-for="w in weathers" :key="w" :label="w" :value="w"></el-option>
            </el-select>
          </div>
        </template>
        <div class="diary-attr" style="margin-bottom:8px">{{ form.date }} · {{ form.weekday }} · {{ form.location }} · {{ form.weather }}</div>
        <el-input v-model="form.text" type="textarea" :rows="10" placeholder="今天的感悟…" @keydown.tab.prevent="onTabKey"></el-input>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
          <el-button @click="store.deleteDiary(form.id)" :disabled="!form.id">删除</el-button>
          <el-button type="primary" @click="save">保存日记</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import RangeExport from '../components/RangeExport.vue'
import { useStore } from '../store'
const store = useStore()
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const weathers = ['晴', '多云', '阴', '小雨', '大雨', '雪', '风', '雾']
const current = ref(null)
const empty = () => { const today = new Date().toISOString().slice(0, 10); return { id: 0, date: today, weekday: '星期' + '日一二三四五六'[new Date().getDay()], location: '', weather: '晴', text: '' } }
const form = reactive(empty())
// 日记搜索：按正文内容过滤
const q = ref('')
const filteredDiaries = computed(() => q.value ? store.diaries.filter(d => (d.text || '').includes(q.value)) : store.diaries)
// 编辑区按 Tab 插入 4 空格缩进（默认 Tab 会跳出文本框）
function onTabKey(e) {
  const ta = e.target
  const start = ta.selectionStart, end = ta.selectionEnd
  const next = form.text.slice(0, start) + '    ' + form.text.slice(end)
  form.text = next
  requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4 })
}
function openAdd() { Object.assign(form, empty()); current.value = null }
function fill(d) { Object.assign(form, { ...d }) }
function save() {
  if (!form.text.trim()) return
  if (form.id) store.updateDiary({ ...form })
  else { store.addDiary({ ...form }); }
  Object.assign(form, empty()); current.value = null
}
</script>

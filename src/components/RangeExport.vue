<template>
  <el-button :class="btnClass" :type="btnType || 'default'" @click="open">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
    <span class="export-label" style="margin-left:6px">{{ text }}</span>
  </el-button>

  <el-dialog v-model="show" :title="'按时间段导出' + title" width="460px" append-to-body>
    <div class="ex-presets">
      <el-radio-group v-model="preset" size="small">
        <el-radio-button value="today">今天</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
        <el-radio-button value="year">本年</el-radio-button>
      </el-radio-group>
    </div>
    <div style="margin-top:14px">
      <el-date-picker v-model="range" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" style="width:100%"></el-date-picker>
    </div>
    <p v-if="noDate" class="ex-hint">「{{ title }}」没有日期字段，将导出该模块的全部记录。</p>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" @click="doExport">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useStore } from '../store'
const store = useStore()
const props = defineProps({
  kind: { type: String, required: true }, // all|todo|habit|quote|note|diary
  text: { type: String, default: '导出' },
  btnClass: { type: String, default: '' },
  btnType: { type: String, default: '' }
})
const TITLES = { all: '全部数据', todo: '待办', habit: '习惯', quote: '名言', note: '读后感', diary: '日记' }
const NO_DATE = { habit: true }
const title = computed(() => TITLES[props.kind] || '数据')
const noDate = computed(() => !!NO_DATE[props.kind])
const show = ref(false)
const preset = ref('week')
const range = ref([])
const toStr = (d) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''
watch(preset, (k) => {
  const now = new Date()
  if (k === 'today') range.value = [now, now]
  else if (k === 'week') { const d = now.getDay(); const off = d === 0 ? -6 : 1 - d; const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off); range.value = [mon, now] }
  else if (k === 'month') range.value = [new Date(now.getFullYear(), now.getMonth(), 1), now]
  else if (k === 'year') range.value = [new Date(now.getFullYear(), 0, 1), now]
}, { immediate: true })
function open() { preset.value = 'week'; show.value = true }
function doExport() {
  const from = range.value && range.value[0] ? toStr(range.value[0]) : ''
  const to = range.value && range.value[1] ? toStr(range.value[1]) : ''
  if (props.kind === 'all') store.exportAll(from, to)
  else store.exportModule(props.kind, from, to)
  show.value = false
}
</script>

<style scoped>
.ex-presets { display: flex; flex-wrap: wrap; }
.ex-hint { color: var(--el-text-color-secondary); font-size: 12px; margin-top: 10px; }
</style>

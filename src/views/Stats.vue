<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">数据统计</div>
        <div class="page-desc">可统计某一天，也可统计一段时间；支持本周、本月、今年等快捷方式。</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div class="stat-presets">
          <el-button size="small" :type="store.statsPreset === 'today' ? 'primary' : ''" @click="pick('today')">今天</el-button>
          <el-button size="small" :type="store.statsPreset === 'week' ? 'primary' : ''" @click="pick('week')">本周</el-button>
          <el-button size="small" :type="store.statsPreset === 'month' ? 'primary' : ''" @click="pick('month')">本月</el-button>
          <el-button size="small" :type="store.statsPreset === 'year' ? 'primary' : ''" @click="pick('year')">今年</el-button>
        </div>
        <el-date-picker v-model="store.statsRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:300px" @change="store.statsPreset = ''"></el-date-picker>
        <el-button @click="store.exportStats()">导出统计</el-button>
      </div>
    </div>

    <el-row :gutter="14" class="mb">
      <el-col :xs="12" :sm="6" :md="6" v-for="c in store.statsCards" :key="c.k">
        <div class="stat-card"><div class="v">{{ c.v }}</div><div class="k">{{ c.k }}</div></div>
      </el-col>
    </el-row>

    <div class="week-panel">
      <el-card shadow="never">
        <template #header>完成 · 类别占比（{{ store.rangeLabel }}）</template>
        <div class="donut-box" ref="donutBox"></div>
      </el-card>
      <el-card shadow="never">
        <template #header>完成趋势 · 按类别堆叠（{{ store.trendLabel }}）</template>
        <div class="donut-box" ref="barBox"></div>
      </el-card>
    </div>

    <el-card shadow="never" class="mb" style="margin-top:14px">
      <template #header>类别明细（{{ store.rangeLabel }}）</template>
      <div class="table-wrap"><el-table :data="store.catRows" size="small" style="width:100%">
        <el-table-column label="类别" width="160"><template #default="{ row }"><span class="cat-cell"><i class="cat-dot" :style="{ background: catColor(row.name) }"></i>{{ row.name }}</span></template></el-table-column>
        <el-table-column label="完成数量" width="140"><template #default="{ row }">{{ row.count }} 项</template></el-table-column>
        <el-table-column label="占比" width="140"><template #default="{ row }">{{ row.pct }}%</template></el-table-column>
        <el-table-column label="代表事项"><template #default="{ row }">{{ row.sample }}</template></el-table-column>
      </el-table></div>
      <el-empty v-if="!store.catRows.length" description="该范围内还没有完成的事项" :image-size="60"></el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useStore } from '../store'
const store = useStore()
const donutBox = ref(null); const barBox = ref(null)
let donut = null; let bar = null
const CAT_COLORS = ['#2E7D6B', '#3F8A5C', '#C97B4A', '#3F7DB0', '#C75C5C', '#7A5FA0', '#A06A3C', '#5E8C9E', '#6E9B6E', '#B0605A']
const catColor = (c) => CAT_COLORS[store.todoCats.indexOf(c) % CAT_COLORS.length]

function render() {
  if (!donutBox.value || !barBox.value) return
  const dark = document.documentElement.classList.contains('dark')
  const cTxt = dark ? '#e8e6e0' : '#26282a', cSub = dark ? '#a3a49d' : '#6e7377', cSliceBg = dark ? '#171a18' : '#fff', cGrid = dark ? '#343a36' : '#ece8df'
  const list = store.completedInRange
  const byCat = {}; store.todoCats.forEach(c => byCat[c] = 0); list.forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + 1)
  const catData = Object.entries(byCat).filter(([k, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))

  donut = donut || echarts.init(donutBox.value)
  donut.setOption({
    color: Object.keys(byCat).filter(k => byCat[k] > 0).map(k => catColor(k)),
    tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11, color: cSub } },
    series: [{ type: 'pie', radius: ['45%', '72%'], center: ['50%', '44%'], itemStyle: { borderColor: cSliceBg, borderWidth: 3, borderRadius: 6 }, label: { show: false }, data: catData, emphasis: { scaleSize: 8 } }],
    graphic: list.length ? [{ type: 'text', left: 'center', top: '33%', style: { text: String(list.length), textAlign: 'center', fontSize: 24, fontWeight: 700, fill: cTxt } }, { type: 'text', left: 'center', top: '46%', style: { text: '完成项', textAlign: 'center', fontSize: 11, fill: cSub } }] : []
  })

  const a = store.statsStart, b = store.statsEnd, buckets = []
  if (a && b) {
    const days = Math.round((new Date(b) - new Date(a)) / 86400000) + 1
    const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
    const f = (x) => { const y = x.getFullYear(), mm = String(x.getMonth() + 1).padStart(2, '0'), dd = String(x.getDate()).padStart(2, '0'); return `${y}-${mm}-${dd}` }
    const addD = (x, n) => { const v = new Date(x); v.setDate(v.getDate() + n); return v }
    if (days <= 31) { for (let i = 0; i < days; i++) { const day = f(addD(parse(a), i)); buckets.push({ label: day.slice(5), from: day, to: day }) } }
    else if (days <= 370) { let y = parse(a).getFullYear(), m = parse(a).getMonth(); while (new Date(y, m, 1).getTime() <= parse(b).getTime()) { const from = f(new Date(y, m, 1)), to = f(new Date(y, m + 1, 0)); buckets.push({ label: `${y}-${String(m + 1).padStart(2, '0')}`, from, to }); m++; if (m > 11) { m = 0; y++ } } }
    else { for (let y = parse(a).getFullYear(); y <= parse(b).getFullYear(); y++) buckets.push({ label: String(y), from: `${y}-01-01`, to: `${y}-12-31` }) }
  }
  const completedBetween = (x, y) => store.todos.filter(t => t.status === 'done' && t.completedAt >= x && t.completedAt <= y)
  const data = buckets.length ? store.todoCats.filter(cat => buckets.some(bk => completedBetween(bk.from, bk.to).some(t => t.cat === cat))).map(cat => ({ name: cat, type: 'bar', stack: 't', barMaxWidth: 34, itemStyle: { color: catColor(cat) }, data: buckets.map(bk => completedBetween(bk.from, bk.to).filter(t => t.cat === cat).length) })) : []
  bar = bar || echarts.init(barBox.value)
  bar.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: cSub } },
    grid: { left: 40, right: 16, top: 20, bottom: 34 },
    xAxis: { type: 'category', data: buckets.map(x => x.label), axisLabel: { color: cSub, interval: 0, rotate: buckets.length > 15 ? 40 : 0 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: cGrid } }, axisLabel: { color: cSub } },
    series: data
  })
}

function pick(k) { store.setStatsPreset(k); nextTick(render) }
function onResize() { donut && donut.resize(); bar && bar.resize() }
onMounted(() => { render(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
watch(() => [store.statsStart, store.statsEnd], () => nextTick(render))
</script>

<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">工作笔记</div>
        <div class="page-desc">左侧管理文件夹，文件在所在文件夹内增删改查，支持 txt / md 在线查看与编辑。</div>
      </div>
      <div class="head-actions">
        <el-button @click="exportAll">导出全部</el-button>
        <el-button type="primary" @click="openCreateFile">新建文件</el-button>
      </div>
    </div>

    <div class="work">
      <!-- 左侧：文件夹树 -->
      <el-card shadow="never" class="left-card">
        <template #header>
          <div class="card-head">
            <span>文件夹</span>
            <el-button size="small" type="primary" plain @click="openNewFolder(null)">新建文件夹</el-button>
          </div>
        </template>
        <el-input v-model="folderQuery" placeholder="搜索文件夹..." clearable class="mb8" />
        <el-scrollbar height="520px" always>
          <div v-for="n in visibleTree" :key="n.id">
            <div class="tree-row" :class="{ active: n.id === curId }" @click="enter(n.id)" :style="{ paddingLeft: 10 + n.depth * 18 + 'px' }">
              <span class="tree-label">
                <span v-if="hasChildren(n.id)" class="caret">{{ expanded.has(n.id) ? '▾' : '▸' }}</span>
                <span v-else class="caret caret-empty"></span>
                <span>{{ n.name }}</span>
              </span>
              <span class="tree-ops" @click.stop>
                <el-button link size="small" @click="openNewFolder(n.id)">+</el-button>
                <el-button link size="small" @click="openRenameFolder(n)">改名</el-button>
                <el-button link size="small" type="danger" @click="removeFolder(n)">删</el-button>
              </span>
            </div>
          </div>
        </el-scrollbar>
        <el-empty v-if="!visibleTree.length" description="还没有文件夹，点右上角新建" :image-size="50" />
      </el-card>

      <!-- 右侧：列表 / 查看 / 编辑 三态切换 -->
      <el-card shadow="never" class="right-card">
        <!-- 列表态 -->
        <template v-if="contentMode === 'list'">
          <div class="card-head file-head">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item @click="enter(0)">全部文件</el-breadcrumb-item>
              <el-breadcrumb-item v-for="p in path" :key="p.id" @click="enter(p.id)">{{ p.name }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="head-actions">
              <el-button size="small" @click="triggerUpload">上传文件</el-button>
              <el-button size="small" @click="openCreateFile">新建文件</el-button>
            </div>
          </div>

          <div v-if="childFolders.length" class="sec-title">文件夹</div>
          <div v-for="cf in childFolders" :key="cf.id" class="item-row" @click="enter(cf.id)">
            <span class="type-badge">DIR</span>
            <span class="item-name">{{ cf.name }}</span>
            <span class="item-meta">{{ subCount(cf.id) }} 项</span>
            <span class="item-ops" @click.stop>
              <el-button link size="small" @click="openRenameFolder(cf)">重命名</el-button>
              <el-button link size="small" type="danger" @click="removeFolder(cf)">删除</el-button>
            </span>
          </div>

          <div class="sec-title">文件</div>
          <div v-for="fl in visibleFiles" :key="fl.id" class="item-row" @click="openPreview(fl)">
            <span class="type-badge" :class="isMarkdown(fl) ? 'md' : 'txt'">{{ (isMarkdown(fl) ? 'md' : fl.type).toUpperCase() }}</span>
            <span class="item-name">{{ fl.name }}</span>
            <span class="item-meta">{{ fl.updatedAt }}</span>
            <span class="item-ops" @click.stop>
              <el-button link size="small" @click="openPreview(fl)">查看</el-button>
              <el-button link size="small" @click="openEdit(fl)">编辑</el-button>
              <el-button link size="small" @click="renameFile(fl)">重命名</el-button>
              <el-button link size="small" @click="downloadFile(fl)">下载</el-button>
              <el-button link size="small" type="danger" @click="removeFile(fl)">删除</el-button>
            </span>
          </div>
          <el-empty v-if="!childFolders.length && !visibleFiles.length" description="当前文件夹还没有内容" :image-size="60" />
        </template>

        <!-- 查看态 -->
        <template v-else-if="contentMode === 'view' && contentFile">
          <div class="card-head file-head">
            <span class="file-title">{{ contentFile.name }}</span>
            <div class="head-actions">
              <el-button size="small" @click="backToList">返回列表</el-button>
              <el-button size="small" @click="openEditFromView">编辑</el-button>
              <el-button size="small" @click="downloadFile(contentFile)">下载</el-button>
            </div>
          </div>
          <div class="content-meta">{{ contentFile.type.toUpperCase() }} · {{ contentFile.updatedAt }}</div>
          <div v-if="isMarkdown(contentFile)" class="content-body md" v-html="renderMd(contentFile.content || '')"></div>
          <pre v-else class="content-body txt">{{ contentFile.content || '' }}</pre>
        </template>

        <!-- 编辑态 -->
        <template v-else-if="contentMode === 'edit' && contentFile">
          <div class="card-head file-head">
            <span class="file-title">编辑 · {{ contentFile.name }}</span>
            <div class="head-actions">
              <el-button size="small" @click="backToList">取消</el-button>
              <el-button type="primary" size="small" @click="saveEdit">保存</el-button>
            </div>
          </div>
          <el-input v-model="editContent" type="textarea" class="editor" resize="none" @keydown.tab.prevent="onTabKey" placeholder="支持 Tab 键缩进（插入 4 个空格）..." />
        </template>
      </el-card>
    </div>

    <!-- 新建 / 重命名 文件夹 -->
    <el-dialog v-model="folderDlg.show" :title="folderDlg.title" width="400px">
      <el-input v-model="folderDlg.name" placeholder="文件夹名称" @keyup.enter="confirmFolder" />
      <template #footer>
        <el-button @click="folderDlg.show = false">取消</el-button>
        <el-button type="primary" @click="confirmFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建 / 重命名 文件 -->
    <el-dialog v-model="fileDlg.show" :title="fileDlg.title" width="440px">
      <el-form label-width="70px" @submit.prevent>
        <el-form-item label="文件名">
          <el-input v-model="fileDlg.name" :placeholder="fileDlg.mode === 'create' ? '例如：需求文档.txt 或 README.md' : '新文件名（保留后缀）'" @keyup.enter="confirmFile" />
        </el-form-item>
        <el-form-item label="类型" v-if="fileDlg.mode === 'create'">
          <el-radio-group v-model="fileDlg.type">
            <el-radio-button label="txt">.txt</el-radio-button>
            <el-radio-button label="md">.md</el-radio-button>
          </el-radio-group>
          <div class="type-hint">文件名若已带后缀，以输入为准；否则按所选类型自动补全</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fileDlg.show = false">取消</el-button>
        <el-button type="primary" @click="confirmFile">确定</el-button>
      </template>
    </el-dialog>

    <input ref="fileInput" type="file" multiple hidden @change="onPickFiles" />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from '../store'
const store = useStore()

// ===== 文件夹树 =====
const curId = ref(0)                       // 0 = 根目录
const folderQuery = ref('')
const expanded = ref(new Set())            // 展开的文件夹 id 集合（默认全部展开）

// 展平树：深度优先，带缩进层级
function buildFlat(list) {
  const out = []
  const walk = (pid, depth) => {
    list.filter(f => (f.parentId || 0) === pid).forEach(f => {
      out.push({ ...f, depth })
      walk(f.id, depth + 1)
    })
  }
  walk(0, 0)
  return out
}

const flatTree = computed(() => buildFlat(store.workFolders))
const visibleTree = computed(() => {
  const q = (folderQuery.value || '').trim().toLowerCase()
  if (!q) return flatTree.value
  const match = new Set(store.workFolders.filter(f => f.name.toLowerCase().includes(q)).map(f => f.id))
  // 保留命中节点的全部祖先，形成完整路径
  const map = {}; store.workFolders.forEach(f => map[f.id] = f)
  match.forEach(id => { let p = map[id]; while (p && p.parentId) { if (map[p.parentId]) match.add(p.parentId); p = map[p.parentId] } })
  return flatTree.value.filter(n => match.has(n.id))
})

function hasChildren(id) { return store.workFolders.some(f => (f.parentId || 0) === id) }
function toggleNode(id) { const s = new Set(expanded.value); s.has(id) ? s.delete(id) : s.add(id); expanded.value = s }
function childFoldersOf(id) { return store.workFolders.filter(f => (f.parentId || 0) === id) }
function subCount(id) { return store.workFolders.filter(f => (f.parentId || 0) === id).length }

// 当前所在路径（从根到当前），供面包屑
const path = computed(() => {
  const map = {}; store.workFolders.forEach(f => map[f.id] = f)
  const acc = []; let p = map[curId.value]
  while (p) { acc.unshift(p); p = p.parentId ? map[p.parentId] : null }
  return acc
})

const childFolders = computed(() => childFoldersOf(curId.value))
const visibleFiles = computed(() => {
  const q = (folderQuery.value || '').trim().toLowerCase()
  if (!q) return store.workFiles
  return store.workFiles.filter(f => f.name.toLowerCase().includes(q))
})

async function enter(id) {
  curId.value = id
  contentMode.value = 'list'
  try { await store.loadWorkFiles(id) } catch { /* 已由 store 提示 */ }
}

// ===== 文件夹操作 =====
const folderDlg = reactive({ show: false, title: '', mode: 'create', parentId: null, id: 0, name: '' })
function openNewFolder(parentId) { folderDlg.title = '新建文件夹'; folderDlg.mode = 'create'; folderDlg.parentId = parentId; folderDlg.id = 0; folderDlg.name = ''; folderDlg.show = true }
function openRenameFolder(f) { folderDlg.title = '重命名文件夹'; folderDlg.mode = 'rename'; folderDlg.parentId = f.parentId; folderDlg.id = f.id; folderDlg.name = f.name; folderDlg.show = true }
async function confirmFolder() {
  const n = folderDlg.name.trim(); if (!n) return
  try {
    if (folderDlg.mode === 'create') { await store.addWorkFolder(n, folderDlg.parentId) }
    else { await store.renameWorkFolder(folderDlg.id, n) }
    ElMessage.success(folderDlg.mode === 'create' ? '已创建文件夹' : '已重命名')
    folderDlg.show = false
  } catch (e) { ElMessage.error('操作失败：' + (e && e.message ? e.message : e)) }
}
async function removeFolder(f) {
  const res = await ElMessageBox.confirm(`删除文件夹「${f.name}」将连同其中所有内容一起删除，确定？`, '删除文件夹', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }).catch(() => false)
  if (!res) return
  try {
    await store.deleteWorkFolder(f.id)
    if (curId.value === f.id) { curId.value = 0; await store.loadWorkFiles(0) }
    ElMessage.success('已删除文件夹')
  } catch (e) { ElMessage.error('删除失败：' + (e && e.message ? e.message : e)) }
}

// ===== 文件操作 =====
const contentMode = ref('list')    // 'list' | 'view' | 'edit'
const contentFile = ref(null)
const editContent = ref('')
const fileDlg = reactive({ show: false, title: '', mode: 'create', id: 0, name: '', type: 'txt' })
const fileInput = ref(null)

function openCreateFile() { fileDlg.title = '新建文件'; fileDlg.mode = 'create'; fileDlg.id = 0; fileDlg.name = ''; fileDlg.type = 'txt'; fileDlg.show = true }
function renameFile(fl) { fileDlg.title = '重命名文件'; fileDlg.mode = 'rename'; fileDlg.id = fl.id; fileDlg.name = fl.name; fileDlg.type = fl.type; fileDlg.show = true }

async function confirmFile() {
  let name = fileDlg.name.trim(); if (!name) return
  if (fileDlg.mode === 'create') {
    // 输入未带后缀时按所选类型补全
    if (!/\.(txt|md)$/i.test(name)) name += '.' + fileDlg.type
  }
  try {
    if (fileDlg.mode === 'create') {
      const type = name.toLowerCase().endsWith('.md') ? 'md' : 'txt'
      await store.addWorkFile({ name, folderId: curId.value, type, content: '' })
      ElMessage.success('已创建文件')
    } else {
      await store.updateWorkFile(fileDlg.id, { name })
      ElMessage.success('已重命名')
    }
    fileDlg.show = false
  } catch (e) { ElMessage.error('操作失败：' + (e && e.message ? e.message : e)) }
}

async function ensureContent(fl) {
  if (fl.content !== undefined && fl.content !== null) return fl
  try { const full = await store.getWorkFile(fl.id); return full || fl } catch { return fl }
}

async function openPreview(fl) {
  const full = await ensureContent(fl)
  contentFile.value = full
  contentMode.value = 'view'
}
function openEditFromView() { openEdit(contentFile.value) }
async function openEdit(fl) {
  const full = await ensureContent(fl)
  contentFile.value = full
  editContent.value = full.content || ''
  contentMode.value = 'edit'
}
async function saveEdit() {
  try {
    const f = await store.updateWorkFile(contentFile.value.id, { content: editContent.value })
    contentFile.value = f
    ElMessage.success('已保存')
    backToList()
  } catch (e) { ElMessage.error('保存失败：' + (e && e.message ? e.message : e)) }
}
function backToList() { contentMode.value = 'list' }
function onTabKey(e) {
  const ta = e.target; const s = ta.selectionStart, en = ta.selectionEnd
  editContent.value = editContent.value.slice(0, s) + '    ' + editContent.value.slice(en)
  nextTick(() => { ta.selectionStart = ta.selectionEnd = s + 4 })
}

async function removeFile(fl) {
  const res = await ElMessageBox.confirm(`删除文件「${fl.name}」？`, '删除文件', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }).catch(() => false)
  if (!res) return
  try { await store.deleteWorkFile(fl.id); if (contentFile.value && contentFile.value.id === fl.id) backToList(); ElMessage.success('已删除文件') }
  catch (e) { ElMessage.error('删除失败：' + (e && e.message ? e.message : e)) }
}

async function downloadFile(fl) {
  const full = await ensureContent(fl)
  const content = full.content || ''
  const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = full.name; a.click(); URL.revokeObjectURL(a.href)
  ElMessage.success('已下载 ' + full.name)
}

// ===== 上传（支持多文件）=====
function triggerUpload() { fileInput.value.click() }
async function onPickFiles(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  for (const f of files) {
    const text = await f.text().catch(() => '')
    const name = f.name
    const type = name.toLowerCase().endsWith('.md') ? 'md' : 'txt'
    try { await store.addWorkFile({ name, folderId: curId.value, type, content: text }) }
    catch (err) { ElMessage.error('上传失败：' + (err && err.message ? err.message : err)) }
  }
  ElMessage.success(`已上传 ${files.length} 个文件`)
}

// ===== 导出全部 =====
async function exportAll() {
  try { await store.exportWorkNotes(); ElMessage.success('已导出全部工作笔记') }
  catch (e) { ElMessage.error('导出失败：' + (e && e.message ? e.message : e)) }
}

// ===== 轻量 Markdown 渲染 =====
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
}
// 判断是否按 Markdown 渲染：type 为 md，或文件名以 .md 结尾（兼容历史 type 存成 txt 的记录）
function isMarkdown(f) { return !!f && (f.type === 'md' || /\.md$/i.test(f.name || '')) }
function renderMd(t) {
  const lines = (t || '').split('\n')
  let html = '', codeBuf = [], inCode = false, inList = false
  const flushList = () => { if (inList) { html += '</ul>'; inList = false } }
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '')
    if (/^```/.test(line)) {
      if (inCode) { html += '</pre></code>'; inCode = false }
      else { flushList(); html += '<code><pre>'; inCode = true }
      continue
    }
    if (inCode) { html += esc(line) + '\n'; continue }
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) { flushList(); const lv = h[1].length; html += `<h${lv}>${inline(h[2])}</h${lv}>`; continue }
    if (/^\s*[-*]\s+/.test(line)) { if (!inList) { html += '<ul>'; inList = true } html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`; continue }
    if (/^\s*>\s?/.test(line)) { flushList(); html += `<blockquote>${inline(line.replace(/^\s*>\s?/, ''))}</blockquote>`; continue }
    if (/^\s*$/.test(line)) { flushList(); continue }
    flushList(); html += `<p>${inline(line)}</p>`
  }
  flushList()
  return html
}

onMounted(async () => {
  try {
    await store.loadWorkFolders()
    await store.loadWorkFiles(0)
  } catch { /* store 已提示 */ }
})
</script>

<style scoped>
.work { display: grid; grid-template-columns: 300px 1fr; gap: 16px; min-height: 440px; align-items: start; }
.left-card { min-width: 0; }
.right-card { min-width: 0; display: flex; flex-direction: column; min-height: 440px; }
.card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.file-head { padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); margin-bottom: 6px; }
.head-actions { display: inline-flex; gap: 8px; flex-wrap: wrap; }
.mb8 { margin-bottom: 10px; }

.tree-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 8px 10px; border-radius: 8px; cursor: pointer; color: var(--el-text-color-regular); transition: background .2s, color .2s; }
.tree-row:hover { background: #efece4; }
html.dark .tree-row:hover { background: rgba(46, 125, 107, .2); }
.tree-row.active { background: var(--el-color-primary-light-9); color: var(--el-color-primary-dark-2); font-weight: 600; }
html.dark .tree-row.active { background: rgba(46, 125, 107, .28); color: #8db8a9; }
.tree-label { display: inline-flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.caret { font-size: 11px; color: var(--el-text-color-secondary); width: 12px; flex: none; text-align: center; }
.caret-empty { width: 12px; }
.tree-ops { display: none; gap: 0; }
.tree-row:hover .tree-ops { display: inline-flex; }

.item-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--el-border-color-lighter); cursor: pointer; border-radius: 8px; }
.item-row:hover { background: var(--el-fill-color-light); }
html.dark .item-row { border-bottom-color: #2e3230; }
html.dark .item-row:hover { background: rgba(46, 125, 107, .15); }
.item-name { font-weight: 500; color: var(--el-text-color-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 12px; color: var(--el-text-color-secondary); white-space: nowrap; }
.item-ops { display: none; gap: 2px; }
.item-row:hover .item-ops { display: inline-flex; }
.type-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: var(--el-color-primary-light-9); color: var(--el-color-primary-dark-2); flex: none; letter-spacing: .5px; }
.type-badge.md { background: #f3e6d3; color: #a86a2b; }
html.dark .type-badge { background: rgba(46, 125, 107, .25); color: #8db8a9; }
html.dark .type-badge.md { background: rgba(168, 106, 43, .25); color: #d9a05f; }

.sec-title { font-size: 12px; color: var(--el-text-color-secondary); margin: 10px 2px 6px; font-weight: 600; }
.file-title { font-weight: 600; color: var(--el-text-color-primary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.content-meta { font-size: 12px; color: var(--el-text-color-secondary); margin: 10px 0; }
.content-body { padding: 6px 4px; font-size: 14px; color: var(--el-text-color-primary); }
.content-body.txt { white-space: pre-wrap; font-family: Consolas, "JetBrains Mono", monospace; line-height: 1.7; overflow-wrap: break-word; }
.content-body.md { line-height: 1.75; overflow-wrap: break-word; }
.content-body.md h1, .content-body.md h2, .content-body.md h3 { margin: .6em 0 .3em; }
.content-body.md pre { background: var(--el-fill-color-light); padding: 12px; border-radius: 8px; overflow: auto; border: 1px solid var(--el-border-color); }
html.dark .content-body.md pre { background: #2a2e2b; border-color: #3a3f3b; }
.content-body.md code { background: var(--el-fill-color-light); padding: 1px 5px; border-radius: 4px; font-family: Consolas, monospace; }
html.dark .content-body.md code { background: #2a2e2b; }
.content-body.md blockquote { border-left: 3px solid var(--el-color-primary-light-5); margin: .5em 0; padding: 2px 12px; color: var(--el-text-color-secondary); }
.editor { width: 100%; flex: 1; }
.editor :deep(textarea) { font-family: Consolas, "JetBrains Mono", monospace; font-size: 14px; line-height: 1.7; min-height: 520px; }
.type-hint { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 6px; }
@media (max-width: 900px) { .work { grid-template-columns: 1fr; } }
</style>

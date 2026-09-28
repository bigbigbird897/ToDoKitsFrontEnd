<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">读后感</div>
        <div class="page-desc">以文件夹组织读书笔记，沉淀阅读所得。</div>
      </div>
      <div>
        <RangeExport kind="note" />
        <el-button type="primary" @click="openNote()">新建笔记</el-button>
      </div>
    </div>

    <div class="reading">
      <el-card shadow="never">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>文件夹</span>
            <el-button size="small" type="primary" plain @click="folderDlg = true">新建文件夹</el-button>
          </div>
        </template>
        <div>
          <div v-for="f in store.folders" :key="f" class="tree-node" :class="{ active: f === current }" @click="current = f">
            <span style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>{{ f }}（{{ countIn(f) }}）</span>
            <el-button link type="danger" size="small" @click.stop="store.delFolder(f)">删</el-button>
          </div>
          <el-empty v-if="!store.folders.length" description="还没有文件夹" :image-size="50"></el-empty>
        </div>
        <div style="font-size:12px;color:var(--el-text-color-secondary);margin-top:12px">当前位置：{{ current }}</div>
      </el-card>

      <el-card shadow="never">
        <template #header>笔记 · {{ current }}</template>
        <div v-for="n in folderNotes" :key="n.id" class="notes-row" @click="openNote(n)">
          <div class="meta"><div class="n">{{ n.title }}</div><div class="m">{{ n.date }}</div></div>
          <el-button link type="danger" @click.stop="store.deleteNote(n.id)">删除</el-button>
        </div>
        <el-empty v-if="!folderNotes.length" description="该文件夹下还没有笔记" :image-size="60"></el-empty>
      </el-card>
    </div>

    <el-dialog v-model="folderDlg" title="新建文件夹" width="400px">
      <el-input v-model="folderName" placeholder="例如：历史"></el-input>
      <template #footer>
        <el-button @click="folderDlg = false">取消</el-button>
        <el-button type="primary" @click="saveFolder">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dlg.show" :title="dlg.editing ? '编辑读后感' : '新建读后感'" width="640px">
      <el-form label-width="70px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="例如：《活着》读后感"></el-input></el-form-item>
        <el-form-item label="文件夹">
          <el-select v-model="form.folder" style="width:100%">
            <el-option v-for="f in store.folders" :key="f" :label="f" :value="f"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="8"></el-input></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.show = false">取消</el-button>
        <el-button type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import RangeExport from '../components/RangeExport.vue'
import { useStore } from '../store'
const store = useStore()
const current = ref(store.folders[0] || '')
const folderDlg = ref(false); const folderName = ref('')
const dlg = reactive({ show: false, editing: false })
const empty = () => ({ id: 0, title: '', folder: '', content: '', date: '' })
const form = reactive(empty())
const countIn = (f) => store.notes.filter(n => n.folder === f).length
const folderNotes = computed(() => store.notes.filter(n => n.folder === current.value))
function saveFolder() { const n = folderName.value.trim(); if (!n) return; store.addFolder(n); if (current.value === '') current.value = n; folderDlg.value = false; folderName.value = '' }
function openNote(n) { if (n) { Object.assign(form, { ...n }); dlg.editing = true } else { Object.assign(form, { ...empty(), folder: current.value }); dlg.editing = false } dlg.show = true }
function saveNote() { if (!form.title.trim()) return; if (dlg.editing) store.updateNote({ ...form }); else store.addNote({ ...form }); dlg.show = false }
</script>

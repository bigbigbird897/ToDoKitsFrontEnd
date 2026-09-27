<template>
  <div>
    <div class="view-head mb">
      <div>
        <div class="page-title">名言警句</div>
        <div class="page-desc">记下那些有智慧的话，让它常伴左右。</div>
      </div>
      <div><el-button @click="store.exportModule('quote')">导出</el-button><el-button type="primary" @click="openAdd()">记一句话</el-button></div>
    </div>

    <div class="mb" style="display:flex;gap:10px;flex-wrap:wrap">
      <el-input v-model="q" placeholder="搜索内容或作者…" clearable style="width:260px"></el-input>
      <el-select v-model="tag" placeholder="全部标签" clearable style="width:150px">
        <el-option v-for="t in store.quoteTags" :key="t" :label="t" :value="t"></el-option>
      </el-select>
    </div>

    <div v-for="qu in filtered" :key="qu.id" class="quote">
      <div class="txt">“{{ qu.text }}”</div>
      <div class="who" style="display:flex;justify-content:space-between;align-items:center">
        <span>{{ qu.who }}{{ qu.src ? ' · 《' + qu.src + '》' : '' }}</span>
        <span style="display:flex;gap:8px">
          <el-button link type="primary" size="small" @click="openEdit(qu)">编辑</el-button>
          <el-button link type="danger" size="small" @click="store.deleteQuote(qu.id)">删除</el-button>
        </span>
      </div>
    </div>
    <el-empty v-if="!filtered.length" description="还没有名言" :image-size="60"></el-empty>

    <el-dialog v-model="dlg.show" :title="dlg.editing ? '编辑名言' : '记一句话'" width="520px">
      <el-form label-width="70px">
        <el-form-item label="内容"><el-input v-model="form.text" type="textarea" :rows="3" placeholder="有智慧的话"></el-input></el-form-item>
        <el-form-item label="作者"><el-input v-model="form.who" placeholder="谁说/作者"></el-input></el-form-item>
        <el-form-item label="来源"><el-input v-model="form.src" placeholder="出处（可选）"></el-input></el-form-item>
        <el-form-item label="标签"><el-input v-model="tagText" placeholder="逗号分隔，如：时间, 心态"></el-input></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.show = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useStore } from '../store'
const store = useStore()
const q = ref(''); const tag = ref(''); const tagText = ref('')
const dlg = reactive({ show: false, editing: false })
const empty = () => ({ id: 0, text: '', who: '', src: '', tags: [] })
const form = reactive(empty())
const filtered = computed(() => store.quotes.filter(x => {
  if (q.value && !(x.text + x.who).includes(q.value)) return false
  if (tag.value && !(x.tags || []).includes(tag.value)) return false
  return true
}))
function openAdd() { Object.assign(form, empty()); tagText.value = ''; dlg.editing = false; dlg.show = true }
function openEdit(x) { Object.assign(form, { ...x }); tagText.value = (x.tags || []).join(', '); dlg.editing = true; dlg.show = true }
function save() {
  if (!form.text.trim()) return
  form.tags = tagText.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
  if (dlg.editing) store.updateQuote({ ...form }); else store.addQuote({ ...form })
  dlg.show = false
}
</script>

<template>
  <router-view v-if="!store.token" />
  <el-container v-else class="layout">
    <div class="mask" :class="{ show: store.menuOpen }" @click="store.menuOpen = false"></div>
    <el-aside width="220px" class="side" :class="{ open: store.menuOpen }">
      <div class="side-pad"></div>
      <el-menu class="menu" :default-active="route.path" router>
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path :d="m.icon" />
          </svg>
          <span>{{ m.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="top" height="60px">
        <button class="icon-btn hamburger" @click="store.menuOpen = !store.menuOpen" aria-label="菜单">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span class="title">{{ route.meta.title }}</span>
        <span class="today">今天 {{ today }}</span>
        <div class="spacer"></div>
        <button class="icon-btn" @click="store.toggleTheme" :title="store.dark ? '切换到浅色' : '切换到深色'" aria-label="切换主题">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        </button>
        <el-button class="top-export" @click="store.exportAll">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span class="export-label">导出全部数据</span>
        </el-button>
        <span class="who" v-if="store.user" :title="store.user.username">{{ store.user.username }}</span>
        <el-button class="logout-btn" size="small" @click="store.logout">退出</el-button>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useStore } from './store'
import { onMounted } from 'vue'
const route = useRoute()
const store = useStore()
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
onMounted(() => { if (store.token) store.init() })
const menus = [
  { path: '/', label: '工作台', icon: 'M4 13h6V4H4zM14 20h6V11h-6zM4 20h6v-4H4zM14 9h6V4h-6z' },
  { path: '/todos', label: '待办事项', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { path: '/stats', label: '数据统计', icon: 'M3 3v18h18M7 16l4-6 4 3 5-8' },
  { path: '/quotes', label: '名言警句', icon: 'M7 4v18M3 4h8M5 9h4M5 14h4M5 19h4M15 4h6M17 4v6c0 2-2 3-4 3' },
  { path: '/reading', label: '读后感', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z' },
  { path: '/habits', label: '好习惯', icon: 'M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { path: '/diary', label: '电子日记', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5' }
]
</script>

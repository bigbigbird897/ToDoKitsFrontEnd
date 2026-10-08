<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="logo">生活助手</span>
        <span class="logo-en">LifeKit</span>
      </div>
      <p class="login-sub">登录后查看属于你账号的待办、习惯、名言、读后感与日记。</p>

      <el-form @submit.prevent>
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large" :disabled="loading" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password :disabled="loading" @keyup.enter="submit" />
        </el-form-item>
        <el-button class="login-btn" type="primary" size="large" :loading="loading" @click="submit">
          {{ mode === 'login' ? '登 录' : '注册并登录' }}
        </el-button>
      </el-form>

      <div class="login-switch">
        <!-- <span>{{ mode === 'login' ? '还没有账号？' : '已有账号？' }}</span> -->
        
        <el-button link type="primary" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </el-button>
       
        <div>
          请通过邮箱联系:dfxsd@foxmail.com
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const store = useStore()
const router = useRouter()
const mode = ref('login')
const loading = ref(false)
const form = reactive({ username: '', password: '' })

async function submit() {
  if (loading.value) return
  if (!form.username.trim() || !form.password) { return }
  loading.value = true
  const ok = mode.value === 'login'
    ? await store.login({ username: form.username.trim(), password: form.password })
    : await store.register({ username: form.username.trim(), password: form.password })
  loading.value = false
  if (ok) router.push('/')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--el-bg-color-page, #f6f4ef);
  box-sizing: border-box;
}
.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px 28px;
  box-shadow: var(--el-box-shadow, 0 8px 24px rgba(38, 40, 42, .08));
}
.login-brand { display: flex; flex-direction: column; align-items: center; margin-bottom: 6px; }
.logo { font-size: 26px; font-weight: 700; color: var(--el-text-color-primary); letter-spacing: 1px; }
.logo-en { font-size: 12px; color: var(--el-text-color-secondary); letter-spacing: 2px; margin-top: 2px; }
.login-sub { text-align: center; color: var(--el-text-color-secondary); font-size: 13px; margin: 10px 0 24px; line-height: 1.6; }
.login-btn { width: 100%; margin-top: 4px; }
.login-switch { margin-top: 18px; text-align: center; font-size: 13px; color: var(--el-text-color-secondary); }
</style>

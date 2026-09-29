# ToDoKits 前端（FrontEnd）

个人生活助手前端工程，基于 **Vue 3 + Element Plus（最新）+ Vue Router + Pinia + ECharts**，暖纸色定制主题，深/浅双主题，多尺寸响应式。

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Element Plus（最新版，默认主题定制为暖纸色）
- Pinia（状态管理：全部数据 + 增删改查/周期/导出/主题/统计 getters）
- Vue Router（7 路由）
- ECharts（统计图表）
- Vite 5（构建）

## 目录结构

```
FrontEnd/
├── index.html
├── vite.config.js        # 端口 5173，代理 /api → localhost:5000
├── package.json
└── src/
    ├── main.js
    ├── App.vue           # 布局：侧栏 + 顶栏 + 主题切换 + 导出
    ├── router/index.js   # 7 个路由
    ├── store/index.js    # Pinia：数据 + actions + 统计 getters + CSV 导出
    ├── api/index.js      # 后端 REST 客户端（USE_BACKEND 开关）
    ├── styles/theme.css  # 暖纸色主题 token + 深色暖调 + 响应式
    └── views/            # Overview · Todos · Stats · Quotes · Reading · Habits · Diary
```

## 运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产出 dist/
```

## 接入后端

已开启后端接入：`src/api/index.js` 中 `USE_BACKEND = true`，所有数据通过 `/api/*` 从后端 PostgreSQL 存取；`store/index.js` 启动时调用 `init()` 从数据库加载全部模块（待办/习惯/名言/读后感/日记/分类），增删改查全部走后端接口。开发时 `vite.config.js` 将 `/api` 代理到 `http://localhost:5000`；后端启动后亦会托管本目录 `dist/`。

## 变更记录

- 2026-09-27：工程创建，7 视图 + store + api 契约完成，build 通过。
- 2026-09-27：主题对齐静态预览定稿（暖纸色）；修复 Reading 图标（emoji → 内联 SVG）。
- 2026-09-28：移动端（≤640px）UI 优化——顶栏导出改图标（去拥挤）、正文/表单字号加大（≥15px/16px 防 iOS 聚焦缩放）、筛选控件堆叠全宽、表格横向滚动不截断；移除侧栏「生活助手」品牌标识（顶栏保留标题与功能图标）。
- 2026-09-28：前后端接线——`USE_BACKEND=true`，store 启动 `init()` 从数据库加载全部模块，所有增删改查改走后端接口（待办/习惯/名言/读后感/日记/分类），经 vite 代理 `/api`→5000；端到端实测从 PostgreSQL 加载数据渲染通过。
- 2026-09-28：修复 `type=primary plain`（浅色）按钮文字不可见——主题对 `.el-button--primary` 的实心绿背景覆盖了 Element Plus 的 plain 浅色背景，造成绿字绿底；改为实心绿只作用于非 plain 按钮，plain 按钮用浅绿底+深绿字。
- 2026-09-28：修复手机端电子日记页两栏并排——`Diary.vue` 容器内联 `grid-template-columns:260px 1fr` 覆盖了 ≤900px 断点的单列堆叠；改为直接使用 `.reading` 类（桌面 230px+1fr，移动单列）。
- 2026-09-28：新增登录/注册——`Login.vue` + 路由守卫（无 token 一律跳 `/login`）；请求统一带 `Authorization: Bearer <token>`，401 自动清 token 回登录页；store 增加 `auth` 状态与 `login/register/logout`，数据按当前账号从后端加载；顶栏显示登录用户名与「退出」。端到端实测：登录→加载本账号数据→退出 通过。
- 2026-09-29：布局间距优化——待办页「全部待办」卡片与筛选控件之间加间距（`filters` 下边距 16px）；待办页「导出」与「管理分类」、日记页「导出」与「写日记」按钮左右间距各加大 12px（在 `view-head` 原有 12px gap 基础上累加）。工作台顶栏「导出全部数据」经 `RangeExport` 已实现为 `el-dialog` 弹窗（非内嵌）。

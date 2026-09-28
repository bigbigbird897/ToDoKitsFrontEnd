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

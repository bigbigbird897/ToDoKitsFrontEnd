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

`src/api/index.js` 中 `USE_BACKEND = false` 默认本地内存模拟；置 `true` 后通过 `/api/*` 调用后端（契约与后端 Controller 一致）。后端启动后亦会托管本目录 `dist/`。

## 变更记录

- 2026-09-27：工程创建，7 视图 + store + api 契约完成，build 通过。
- 2026-09-27：主题对齐静态预览定稿（暖纸色）；修复 Reading 图标（emoji → 内联 SVG）。

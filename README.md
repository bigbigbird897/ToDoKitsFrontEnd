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
- 2026-09-29：修复「导出全部数据」弹窗不可见——`RangeExport` 的 `el-dialog` 渲染在顶栏 flex 容器内，定位到视口外（DOM 存在但视觉不显示）；加 `append-to-body` 使弹窗挂到 body 顶层、正常居中显示；浏览器实测弹窗完整可见（预设+日期范围+取消/导出）。
- 2026-09-29：超期天数口径修正——改为「实际日期 − 预计完成日期」：已完成待办用实际完成日（`completedAt`）计算，未完成待办用当天计算；实际晚于预期才计正数、提前完成计 0。修复「数据统计·总超期」恒为 0 的问题（此前对已完成待办一律返回 0）。
- 2026-09-30：暗色主题修复——①刷新后不再回浅色：store 启动时读取 `localStorage['lk-theme']` 并立即把 `dark` 类挂到 `<html>`，`dark` 状态初始值同步为本地偏好；②暗色下切换主题按钮不再白底：给 `.icon-btn` 增加 `html.dark` 深色背景/边框/悬停覆盖。
- 2026-09-30：导航栏展开/隐藏——桌面端（>900px）顶栏汉堡按钮常显，点击可折叠/展开侧栏（收起时宽度收缩为 0、主内容占满、无遮罩）；移动端保持原逻辑（默认收起，点击展开并带遮罩）。`menuOpen` 初始值按窗口宽度：桌面展开、移动收起。
- 2026-10-01：修复打包后访问不到后端接口——API 前缀按环境区分：开发（vite dev）走 `/api` 代理；打包生产用 `/todokits/api`（nginx 子路径 `^~ /todokits/api/` 代理到后端 `/api`），并保留 `VITE_API_BASE` 环境变量覆盖。配套 `vite.config.js` 已设 `base: '/todokits/'`（静态资源子路径）、路由用 hash 模式。构建产物实测包含 `/todokits/api` 前缀。
- 2026-10-02：待办「周期重复」下拉默认不再显示空白——Element Plus 的 `el-select` 会把空字符串 `value=""` 当作"未选中"显示占位；将「不重复」改为占位值 `none`（新建/编辑时默认选中），保存时转回空字符串（后端不重复约定），表格"周期"列仍显示 `—`。
- 2026-10-02：登录页暗色主题适配——`.login-card` 原硬编码 `#fff`、`.login-page` 用浅色变量，暗色下未覆盖；`theme.css` 增加 `html.dark` 对登录页背景/卡片/文字（logo、说明、切换区）的深色覆盖。
- 2026-10-07：日记/读后感组件优化——①电子日记新增按正文内容搜索（header 搜索框过滤列表，无结果显示"没有匹配的日记"）；②日记侧边列表与读后感左侧文件夹列表加滚动条；③日记编辑区支持按 Tab 插入 4 空格缩进（拦截默认跳焦点）；④修复创建读后感文件夹"提示失败但成功"——后端创建成功返回 200 空 body，`res.json()` 抛 `Unexpected end of JSON input`，api 客户端改为先取文本、空则返回 null。
- 2026-10-07：日记/读后感列表滚动条改用 `el-scrollbar`（固定高度 + `always` 始终可见滚动条轨道，内容超出可滚动；此前 `overflow-y:auto` 在内容不足时不显示滚动条，被误以为没加）；修复窄屏下"日记列表"标题被搜索框挤压——标题 `flex-shrink:0;white-space:nowrap`，搜索框 `flex:1;min-width:130px` 自适应。

# 个人动态页 - 需求拆解文档

## 产品概述

- **产品类型**: 个人动态页（类似说说/朋友圈/微博）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 个人博主/内容创作者，希望在自己的网站上展示动态并与访客互动
- **核心价值**: 提供一个轻量级的个人动态发布与互动平台，基于 Twikoo 评论系统实现数据持久化
- **界面语言**: 中文
- **主题偏好**: 浅色（清新舒适配色）
- **导航模式**: 无导航（单页应用，所有功能在一个页面内完成）

---

## 页面结构总览

> **说明**：本应用为单页场景，所有功能集中在一个页面内

**页面文件**: `HomePage.tsx`

| 区域 | 说明 |
|-----|------|
| 个人信息区 | 展示博主头像、昵称、个人简介 |
| 发布动态区 | 文字输入框 + 图片上传 + 发布按钮 |
| 动态时间线 | 按时间倒序排列的动态卡片列表，支持无限滚动加载 |
| 动态卡片 | 每条动态包含：用户信息、发布时间、文字内容、图片（如有）、点赞按钮、评论区 |
| 图片预览弹窗 | 点击图片后全屏放大预览 |

---

## 页面布局建议

- **布局模式**: 单栏布局（移动端）→ 居中窄栏布局（桌面端），最大宽度约 640px 居中显示，类似朋友圈/微博的阅读体验
- **视觉重心**: 动态时间线列表——用户的核心浏览区域，发布框为次要操作区
- **结果承载区**: 动态时间线列表；初始态为“暂无动态，来发布第一条吧”空状态提示；发布成功后新动态插入列表顶部

---

## 导航配置

> **说明**：单页应用，无导航配置

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 个人信息（头像、昵称、简介） | demo-mock | 页面顶部静态展示，数据写死在 `src/data/profile.ts` 常量中 | ✅ 本身就是 mock |
| 动态列表获取 | real-api | 对接 Twikoo API `GET /api/comment?url=xxx` 获取评论列表作为动态数据源，按时间倒序排列，支持分页参数 `page` / `pageSize` | 初始 3 条 mock 动态（source='mock'），API 不可用时展示 |
| 发布动态 | real-api | 对接 Twikoo API `POST /api/comment` 提交新评论（作为新动态），成功后刷新列表 | 无（API 不可用时 toast 错误提示） |
| 删除动态 | real-api | 对接 Twikoo API `DELETE /api/comment/:id` 删除指定评论，成功后从列表移除 | 无（API 不可用时 toast 错误提示） |
| 评论功能（获取/发布评论） | real-api | 基于 Twikoo 评论系统，每条动态作为独立评论线程，对接 Twikoo 的评论获取和发布接口 | 无（API 不可用时 toast 错误提示） |
| 点赞功能 | real-api | 对接 Twikoo API `POST /api/comment/like` 点赞，`POST /api/comment/cancel-like` 取消点赞 | 无（API 不可用时 toast 错误提示） |
| 图片上传 | real-api | 对接 Twikoo 的图片上传接口（如支持），或将图片转为 base64 嵌入评论内容；具体方式取决于 Twikoo API 能力 | 无（API 不可用时 toast 错误提示） |

> **说明**：Twikoo 是一个开源的评论系统，其 API 文档需参考 [Twikoo 官方文档](https://twikoo.js.org/api.html)。核心思路是将每条“动态”映射为一条“顶级评论”，动态的评论映射为该顶级评论的“子评论”。由于 Twikoo API 地址 `http://192.166.0.117:8088` 当前无法访问，实际对接时需确认 API 可用性及具体接口路径。

---

## 功能列表

- **页面/区块**: 个人信息区
  - **页面目标**: 展示博主身份信息，建立个人品牌认知
  - **功能点**:
    - 展示博主头像（圆形头像，支持默认占位图）
    - 展示博主昵称
    - 展示个人简介（一句话描述）

- **页面/区块**: 发布动态区
  - **页面目标**: 让博主快速发布新动态
  - **功能点**:
    - 文字输入框：支持多行文本输入，placeholder 提示“分享你的想法...”
    - 图片上传按钮：点击触发文件选择器，支持选择多张图片，上传后显示缩略图预览，可移除已选图片
    - 发布按钮：点击后将文字+图片提交到 Twikoo API，成功后清空输入框并刷新动态列表，失败时 toast 错误提示
    - 发布中显示加载状态（按钮禁用+loading 动画）

- **页面/区块**: 动态时间线
  - **页面目标**: 按时间倒序展示所有动态，支持无限滚动
  - **功能点**:
    - 动态卡片列表：每条动态卡片展示头像、昵称、发布时间（相对时间如“3分钟前”）、文字内容、图片（如有，网格布局）
    - 无限滚动加载：滚动到底部自动加载更多动态，加载中显示骨架屏/loading 指示器
    - 空状态：无动态时显示“暂无动态，来发布第一条吧”提示插画
    - 加载失败时显示重试按钮

- **页面/区块**: 动态卡片 - 互动功能
  - **页面目标**: 支持访客与动态互动（点赞、评论）
  - **功能点**:
    - 点赞按钮：显示当前点赞数，点击切换点赞/取消点赞状态，调用 Twikoo API 并即时更新 UI
    - 评论区：默认收起，点击“评论”展开评论区，展示已有评论列表（嵌套在动态下方）
    - 评论输入框：展开评论区后显示，支持输入文字并提交评论，调用 Twikoo API 提交子评论
    - 删除按钮：仅博主可见（或通过某种身份标识判断），点击弹出确认对话框，确认后调用 Twikoo API 删除动态

- **页面/区块**: 图片预览
  - **页面目标**: 点击动态中的图片可放大查看
  - **功能点**:
    - 点击图片触发全屏遮罩层预览，显示高清大图
    - 支持左右滑动切换多张图片（如有）
    - 点击遮罩层或关闭按钮退出预览
    - 预览时有平滑的缩放过渡动画

---

## 数据共享配置

本应用为单页，无需跨页面数据共享。所有状态在 `HomePage.tsx` 内部管理。

```ts
// 动态数据类型定义
interface IPost {
  /** Twikoo 评论 ID */
  id: string;
  /** 发布者昵称 */
  nick: string;
  /** 发布者头像 URL */
  avatar: string;
  /** 动态文字内容 */
  content: string;
  /** 图片 URL 数组 */
  images: string[];
  /** 发布时间 (ISO 字符串) */
  created: string;
  /** 点赞数 */
  like: number;
  /** 当前用户是否已点赞 */
  liked: boolean;
  /** 子评论列表 */
  replies: IReply[];
  /** 数据来源标识 */
  source: 'api' | 'mock';
}

interface IReply {
  id: string;
  nick: string;
  avatar: string;
  content: string;
  created: string;
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考材料，从产品语义与使用场景自主建立视觉方向
- **核心情绪 / 应用类型**: 个人动态时间线（说说/朋友圈/微博），轻社交、个人表达、日常记录，需要温暖、亲切、低压力
- **独特记忆点**: 每一条动态像一张手写便签贴在软木墙上——轻阴影、微圆角、暖白底，时间线左侧有一条细线串联所有动态，营造个人日记的亲密感

## 2. Art Direction

- **方向名**: 暖白日记
- **Design Style**: Soft Blocks + Warm Natural —— 柔色块承载内容，暖调中性底营造个人空间的舒适感，适合轻社交与日常记录场景
- **DNA 参数**: 圆角 subtle（rounded-lg ~ rounded-xl）/ 阴影 subtle（shadow-sm，hover 时微升）/ 间距 spacious（gap-6 ~ gap-8）/ 字体方向 人文无衬线 / 装饰手法 时间线细线 + 轻量分割线
- **应用类型**: Content —— 单列时间线，移动端优先，桌面端居中收窄

## 3. Color System

**色彩关系**: 暖杏主色 + 同色极浅反馈底 + 暖白日记背景 + 深灰文字
**配色设计理由**: primary 暖杏色用于主按钮、点赞激活态、时间线节点，传递温暖但不甜腻；bg 暖白模拟纸张质感，降低屏幕刺眼感；text 深灰保持可读性，textMuted 浅灰用于时间戳和辅助信息
**主色推导**: 个人动态页需要比纯工具多一层情感温度，暖杏色介于橙与粉之间，既有活力又不失柔和，适合个人表达场景
**使用比例**: 60% 中性（暖白底 + 白卡片 + 浅灰边框）/ 30% 辅助（浅杏反馈底 + hover 态）/ 10% primary（主按钮、点赞激活、时间线节点）

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(30 20% 97%) | 暖白页面背景，模拟纸张质感 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片，与暖白底形成微妙层次 |
| text | `--foreground` | `text-foreground` | hsl(220 15% 20%) | 深灰标题和正文，高对比可读 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(220 10% 55%) | 时间戳、辅助信息、占位符 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(22 65% 58%) | 暖杏主色，主按钮、点赞激活、时间线节点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的白色文字和图标 |
| accent | `--accent` | `bg-accent` | hsl(22 50% 94%) | 浅杏反馈底，hover/focus/选中态 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(22 40% 35%) | accent 上的文字，比 primary 弱 |
| border | `--border` | `border-border` | hsl(30 10% 88%) | 输入框、卡片、时间线细线边界 |

**语义色提示**:
- 成功：`hsl(145 45% 48%)` — 发布成功提示，bg `hsl(145 45% 94%)` / border `hsl(145 40% 80%)` / text `hsl(145 50% 35%)`，饱和度与 primary 对齐
- 警告：`hsl(38 75% 52%)` — 删除确认，bg `hsl(38 70% 94%)` / border `hsl(38 65% 80%)` / text `hsl(38 70% 35%)`
- 错误：`hsl(0 55% 52%)` — 网络错误/发布失败，bg `hsl(0 50% 94%)` / border `hsl(0 45% 82%)` / text `hsl(0 50% 38%)`
- 点赞激活：使用 primary `hsl(22 65% 58%)`，不另设独立色

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 中文人文无衬线，温暖可读，适合个人表达场景
- **font-body**: Noto Sans SC —— 与 display 统一，保持整体感
- **字号**: H1 text-2xl ~ text-3xl（个人信息区昵称）；H2 text-lg ~ text-xl（动态内容）；body text-base；muted text-sm
- **圆角**: subtle —— 卡片 rounded-xl，按钮 rounded-lg，输入框 rounded-lg，保持柔和但不幼稚

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导——顶部个人信息区 → 中部发布区 → 下部时间线列表
- **Page / Section Order**: 个人信息区（头像、昵称、简介）→ 发布输入区（文字输入 + 图片上传）→ 动态时间线（无限滚动，倒序）
- **Standard Content Zone**: `max-w-2xl mx-auto`，单列时间线适合 672px 最大宽度，保证阅读行长舒适
- **Shell / Frame Alignment**: 独立滚动，页面无侧边栏，内容区居中
- **Padding & Rhythm**: `px-4 md:px-6 py-6 md:py-8`，动态卡片间距 `gap-6`
- **Full-bleed Zones**: 无全宽区域，所有内容受 Standard Content Zone 约束
- **Local Narrowing**: 评论区内文字 `max-w-full`，嵌套在卡片内自然收窄
- **Overflow Strategy**: 图片网格使用 `overflow-hidden` + `rounded-lg`，长图限制最大高度并支持点击放大
- **Flexibility Boundary**: 允许移动端 padding 缩至 `px-4`，卡片内边距微调；不允许改变 max-w-2xl、圆角系统、主色

## 6. 视觉与动效

- **装饰**: 时间线左侧细线（`border-l-2 border-border`）+ 节点圆点（primary 色小圆）
- **阴影/边界**: 轻 —— 卡片 `shadow-sm`，hover 时 `shadow-md` 微升，输入框聚焦时 `ring-2 ring-primary/20`
- **动效**: 精致 —— 新动态入场 `animate-in fade-in slide-in-from-top-4 duration-300`，点赞心形缩放弹跳 `scale-110` 200ms，评论展开/收起 `collapsible` 300ms ease-out，图片放大预览 `scale-100 → scale-105` 过渡

## 7. 组件原则

- 发布按钮使用 primary 实心，禁用态降低不透明度至 50%
- 点赞按钮默认 ghost（accentForeground 色图标），激活态切换为 primary 色 + 心形填充
- 删除按钮使用 ghost + 错误色文字，hover 时出现浅红底
- 评论输入框使用 border + accent 聚焦环，与主输入区风格一致
- 加载骨架屏使用 accent 色脉冲，保持暖调
- 空状态（无动态）使用 textMuted 色文字 + 轻量插画占位

## 8. Image Direction

- **Image Role**: 空状态插画（无动态时的占位视觉）+ 动态配图（用户上传内容）
- **Image Art Direction**: 空状态插画采用柔和线条插画风格，暖杏色单色或双色，主题为"写下第一条动态"的笔记本或羽毛笔意象，构图居中留白，光线柔和均匀，材质为哑光纸质感，情绪安静温暖
- **Image Prompt Keywords**: soft line illustration, warm beige and cream tones, notebook and pen, cozy personal journal, minimal composition, matte paper texture, gentle lighting, centered with breathing room
- **Image Avoidance**: 避免通用社交网络图标堆叠、蓝色渐变科技感插画、过于卡通或过于写实的风格、多人场景商务图库素材

## 9. Anti-patterns

- **Split personality**: 动态卡片与发布区使用不同圆角或阴影强度；全站统一 rounded-lg ~ rounded-xl + shadow-sm
- **Phantom tokens**: 编造不存在的 CSS 变量如 `--timeline-dot`；时间线节点用 `bg-primary` + `rounded-full` 实现
- **Default SaaS drift**: 回到默认蓝色按钮或通用灰色卡片；保持暖杏 primary + 暖白 bg 的产品语义
- **Invisible interaction**: 点赞按钮只有颜色变化无缩放反馈；hover 加微升阴影，active 加 scale-95，focus-visible 加 ring
- **Mono-hue tyranny**: primary 暖杏色同时用于按钮、链接、图标、边框、时间线；链接用 accentForeground，边框用 border，仅 CTA 和点赞激活态使用 primary
- **Status color drift**: 错误红色过于刺眼（饱和度 > 60%）；语义色饱和度与 primary 的 65% 对齐，保持在 45-55% 区间
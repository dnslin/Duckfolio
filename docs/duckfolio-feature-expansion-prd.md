# Duckfolio 功能拓展 PRD

> **版本**：v1.0
> **日期**：2026-03-09
> **作者**：dnslin
> **状态**：Draft

---

## 1. Executive Summary

Duckfolio 是一个基于 Next.js 15 + Tailwind CSS v4 + Framer Motion 的个人主页项目，当前具备头像展示、社交链接和网站链接功能。本 PRD 定义四大功能拓展方向：**项目展示/技能树**、**GitHub 集成**、**交互增强**、**视觉个性化**，目标是将 Duckfolio 打造为兼具个人自用和开源模板价值的高质量 Link-in-bio 产品。

### 项目定位

- **个人自用**：展示 dnslin 的项目、技能、社交动态
- **开源模板**：提供清晰的配置化接口，使其他开发者可通过修改 `platform-config.json` 快速部署自己的主页

### 成功目标

| 目标 | 衡量方式 |
|------|---------|
| 展示专业度 | 项目卡片 + 技能树完整呈现 |
| 增加互动性 | 访客可互动的动效 + 音乐播放器 |
| GitHub 影响力 | GitHub Activity 可视化 + 开源模板 Star 数 |
| 视觉差异化 | 主题系统 + 自定义动效 + 独特的视觉风格 |

---

## 2. Problem Statement

当前 Duckfolio 仅支持静态个人信息和链接展示，缺乏：

1. **项目作品集**：无法展示个人开源/商业项目
2. **技能可视化**：无法直观传达技术栈和熟练度
3. **动态数据**：GitHub 贡献等实时数据无法展示
4. **交互深度**：访客只能点击链接跳转，缺乏页面内互动
5. **视觉个性化**：主题自定义能力有限

---

## 3. Success Metrics

| 指标 | 基线 | 目标 (MVP) | 目标 (v1.0) |
|------|------|-----------|------------|
| 页面 Section 数量 | 2 (profile, links) | 4 (+projects, skills) | 6+ |
| Lighthouse Performance | 当前值 | ≥ 90 | ≥ 95 |
| GitHub Star (模板仓库) | 0 | 50 | 200 |
| 配置化覆盖率 | ~60% | 85% | 95% |
| 首屏加载时间 (Cloudflare) | — | < 2s | < 1.5s |

---

## 4. User Personas

### Persona 1: dnslin（站长 / 主要用户）

- **背景**：全栈开发者，活跃于 GitHub、知乎、StackOverflow
- **需求**：一个能体现技术深度、展示项目、且视觉出众的个人主页
- **痛点**：现有主页只是 Link 聚合页，缺乏专业感

### Persona 2: 开源社区开发者（模板用户）

- **背景**：前端/全栈开发者，想要一个好看的个人主页但不想从零开发
- **需求**：Fork 后改配置即可部署，支持自定义主题和内容
- **痛点**：市面模板要么太简陋要么太臃肿，配置不够灵活

### Persona 3: 招聘方 / 潜在合作者（访客）

- **背景**：技术负责人、猎头、开源项目维护者
- **需求**：快速了解候选人的技术栈、项目经验、代码质量
- **痛点**：传统简历缺乏交互性，GitHub Profile 过于技术化

---

## 5. User Stories

### 5.1 项目展示

| ID | 用户故事 | 优先级 | 验收标准 |
|----|---------|--------|---------|
| US-P01 | 作为站长，我希望以大卡片形式展示我的项目，包含封面图、标签、Star/Fork 数、Demo/Code 链接，以便访客快速了解我的作品 | P0 | 1. 项目卡片包含：封面图（16:9）、项目名、描述、技术标签、Star/Fork 统计、Demo 链接、Code 链接<br>2. 卡片支持 hover 动效<br>3. 数据从 `platform-config.json` 读取 |
| US-P02 | 作为站长，我希望项目卡片可以按分类过滤（如：开源工具、Web 应用、CLI 工具等），以便访客按兴趣浏览 | P1 | 1. 顶部有标签过滤栏<br>2. 点击标签筛选对应分类<br>3. 切换有过渡动画 |
| US-P03 | 作为模板用户，我希望通过修改配置文件即可添加自己的项目卡片，无需改代码 | P0 | 1. `platform-config.json` 中新增 `projects` 数组<br>2. 每个项目的字段有清晰的 TypeScript 类型定义 |

### 5.2 技能树

| ID | 用户故事 | 优先级 | 验收标准 |
|----|---------|--------|---------|
| US-S01 | 作为站长，我希望以进度条样式展示我的技能，包含分类（前端/后端/DevOps 等）、图标、进度条和百分比 | P0 | 1. 技能按分类分组<br>2. 每个技能项包含：图标、名称、进度条、百分比<br>3. 进度条有入场动画（从 0 到目标值）<br>4. 数据从配置文件读取 |
| US-S02 | 作为访客，我希望看到技能分类可以折叠展开，以便聚焦感兴趣的领域 | P2 | 1. 分类默认展开<br>2. 点击分类标题可折叠/展开<br>3. 折叠有平滑动画 |
| US-S03 | 作为模板用户，我希望技能图标支持配置自定义 SVG 或使用内置图标库 | P1 | 1. 支持内联 SVG 图标<br>2. 支持 lucide-react 图标名引用<br>3. 配置文件有示例说明 |

### 5.3 GitHub 集成

| ID | 用户故事 | 优先级 | 验收标准 |
|----|---------|--------|---------|
| US-G01 | 作为站长，我希望展示我的 GitHub 贡献热力图（类似 GitHub Profile 的 Contribution Graph） | P1 | 1. 展示近一年的贡献热力图<br>2. 支持主题色适配<br>3. hover 显示具体日期和贡献数 |
| US-G02 | 作为站长，我希望展示我的 GitHub 统计数据（总 Star、总 Commit、总 PR、总 Issue） | P1 | 1. 数字卡片式展示<br>2. 数字有计数动画<br>3. 数据通过 GitHub API 或静态配置获取 |
| US-G03 | 作为站长，我希望展示我的 Pinned Repositories，与项目卡片联动 | P2 | 1. 可配置是否从 GitHub 自动拉取 Pinned Repos<br>2. 自动填充 Star/Fork/Language 信息 |
| US-G04 | 作为模板用户，我希望 GitHub 集成是可选的，不配置时不显示相关 Section | P1 | 1. `platform-config.json` 中 `github` 字段可选<br>2. 未配置时 GitHub Section 自动隐藏 |

### 5.4 交互增强

| ID | 用户故事 | 优先级 | 验收标准 |
|----|---------|--------|---------|
| US-I01 | 作为站长，我希望嵌入一个音乐播放器（网易云 / Spotify），为页面增加氛围感 | P1 | 1. 支持网易云和 Spotify 嵌入式播放器<br>2. 播放器位置固定在页面底部或角落<br>3. 支持最小化/展开切换<br>4. 配置文件中设置播放列表 URL |
| US-I02 | 作为访客，我希望页面滚动时有平滑的视差效果和 Section 过渡动画 | P2 | 1. 各 Section 有 scroll-triggered 入场动画<br>2. 支持视差滚动效果<br>3. 动画不影响 Performance 评分 |
| US-I03 | 作为访客，我希望有一个评论功能，可通过 GitHub 账号留言 | P3 | 1. 集成 giscus 或 utterances 评论组件<br>2. 评论通过 GitHub Discussions/Issues 存储<br>3. 零后端依赖，纯前端 iframe 嵌入 |

### 5.5 视觉个性化

| ID | 用户故事 | 优先级 | 验收标准 |
|----|---------|--------|---------|
| US-V01 | 作为站长，我希望支持更多主题预设（如赛博朋克、极简、自然、复古等），并支持自定义主题色 | P1 | 1. 提供 4-6 个预设主题<br>2. 每个主题定义完整的色板（primary、secondary、accent、background、surface、text）<br>3. 支持用户自定义色值 |
| US-V02 | 作为站长，我希望页面背景支持动态效果（粒子、渐变、几何图形等） | P2 | 1. 提供 3-4 种背景效果选项<br>2. 背景效果可在配置文件中选择<br>3. 效果不影响文字可读性和性能 |
| US-V03 | 作为模板用户，我希望字体可以通过配置切换（中英文分别配置） | P2 | 1. 配置文件支持 `fonts.heading`、`fonts.body` 字段<br>2. 支持 Google Fonts 或本地字体<br>3. 中英文字体可分别指定 |
| US-V04 | 作为访客，我希望暗色/亮色主题切换有平滑过渡，而不是闪烁 | P1 | 1. 主题切换使用 CSS transition 或 View Transitions API<br>2. 无白屏闪烁（已部分实现，需验证） |

---

## 6. Functional Requirements

### 6.1 模块一：项目展示 (Projects)

#### 6.1.1 数据模型

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  cover: string;              // 封面图路径，16:9 推荐
  tags: string[];              // 技术标签，如 ["Next.js", "TypeScript"]
  category: string;            // 分类，如 "开源工具"
  stats?: {
    stars?: number;
    forks?: number;
  };
  links: {
    demo?: string;
    code?: string;
  };
  featured?: boolean;          // 是否置顶/高亮
}
```

#### 6.1.2 UI 规格

- **卡片布局**：响应式网格，桌面 2 列，平板 2 列，移动端 1 列
- **卡片结构**：
  - 顶部：封面图（`aspect-video`，Next.js `<Image>` 优化加载）
  - 中部：项目名（`text-xl font-bold`）+ 描述（`text-sm` 2 行截断）
  - 标签区：Pill 样式标签，最多展示 4 个，超出显示 `+N`
  - 底部栏：左侧 Star/Fork 图标+数字，右侧 Demo/Code 按钮
- **交互**：Hover 时卡片轻微上浮 + 阴影增强（Framer Motion `whileHover`）
- **过滤**：顶部水平标签栏，`All` 默认选中，点击切换带 `layoutId` 动画

#### 6.1.3 导航集成

在顶部导航栏新增 `projects` Section，与现有 `profile`、`links` 并列。

### 6.2 模块二：技能树 (Skills)

#### 6.2.1 数据模型

```typescript
interface SkillCategory {
  id: string;
  name: string;               // 如 "前端开发"
  icon?: string;               // 分类图标（SVG 或 lucide 图标名）
  skills: Skill[];
}

interface Skill {
  name: string;
  icon?: string;               // 技能图标
  level: number;               // 0-100 百分比
  color?: string;              // 进度条自定义颜色（可选）
}
```

#### 6.2.2 UI 规格

- **分组展示**：每个分类一个卡片区块
- **分类头部**：图标 + 分类名 + 折叠/展开按钮
- **技能行**：
  - 左侧：图标 + 技能名
  - 右侧：进度条（`h-2 rounded-full`）+ 百分比文字
  - 进度条颜色：默认使用主题 primary 色，支持 `color` 覆盖
- **动画**：进度条在 viewport 可见时从 0% 动画到目标值（`useInView` + Framer Motion）
- **响应式**：桌面 2 列分类网格，移动端 1 列

#### 6.2.3 导航集成

在顶部导航栏新增 `skills` Section。

### 6.3 模块三：GitHub 集成 (GitHub)

#### 6.3.1 数据模型

```typescript
interface GitHubConfig {
  username: string;
  showContributionGraph?: boolean;   // 默认 true
  showStats?: boolean;                // 默认 true
  showPinnedRepos?: boolean;          // 默认 false
  statsOverrides?: {                  // 手动覆盖统计数据
    totalStars?: number;
    totalCommits?: number;
    totalPRs?: number;
    totalIssues?: number;
  };
}
```

#### 6.3.2 数据获取策略

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| GitHub REST API (客户端) | 实时数据 | 速率限制（60/h 无 token）、CORS | 不推荐 |
| GitHub GraphQL API (服务端) | 灵活查询、速率高 | 需要 PAT Token、服务端逻辑 | 推荐 |
| 静态配置 + 定期更新 | 零依赖、最简 | 数据不实时 | 作为 fallback |
| ISR (Next.js) | 平衡实时性和性能 | Cloudflare Pages 不完全支持 ISR | 需验证 |

**推荐方案**：构建时通过 GitHub GraphQL API 获取数据，生成静态 JSON。配合 GitHub Actions 定时触发 rebuild（如每天一次），实现准实时更新。同时支持 `statsOverrides` 手动覆盖。

#### 6.3.3 UI 规格

- **贡献热力图**：
  - 52 周 × 7 天格子矩阵
  - 颜色强度映射贡献数量（4 级 + 空白）
  - 使用主题色渐变（而非 GitHub 默认绿色）
  - Hover 显示 tooltip：日期 + 贡献数
- **统计卡片**：
  - 4 个数据卡片横排（移动端 2×2）
  - 数字从 0 计数动画到目标值
  - 图标 + 数字 + 标签
- **导航**：可选独立 Section 或并入 Projects Section

### 6.4 模块四：交互增强 & 视觉个性化

#### 6.4.1 音乐播放器

```typescript
interface MusicPlayerConfig {
  enabled: boolean;
  provider: 'netease' | 'spotify';
  playlistUrl: string;          // 嵌入式播放器 URL
  position?: 'bottom-left' | 'bottom-right';  // 默认 bottom-right
  autoMinimize?: boolean;       // 默认 true
}
```

- **展示方式**：Fixed 定位在页面角落
- **状态**：最小化（仅显示音符图标 + 歌曲名滚动）/ 展开（完整嵌入播放器）
- **嵌入**：使用 `<iframe>` 嵌入网易云/Spotify 小组件
- **交互**：点击切换展开/最小化，带 Framer Motion 动画

#### 6.4.2 主题预设系统

```typescript
interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  backgroundEffect?: 'none' | 'particles' | 'gradient' | 'geometric' | 'waves';
}
```

内置预设：

| 预设名 | 风格 | 主色调 |
|--------|------|--------|
| Default | 现代简洁 | 当前主题色 |
| Cyberpunk | 赛博朋克 | 紫+青 |
| Minimal | 极简黑白 | 灰色系 |
| Nature | 自然清新 | 绿+棕 |
| Sunset | 日落暖调 | 橙+紫 |
| Ocean | 海洋深邃 | 蓝+青 |

#### 6.4.3 动态背景效果

- **粒子效果**：轻量粒子动画（需评估性能，考虑 Canvas 或 CSS-only 方案）
- **渐变动效**：缓慢流动的渐变背景（CSS `@keyframes`，零 JS 开销）
- **几何图形**：SVG 几何图案 + 微动效
- **波浪**：CSS/SVG 波浪动效

---

## 7. Technical Constraints

### 7.1 技术栈

| 类别 | 技术 | 备注 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | Turbopack dev |
| 样式 | Tailwind CSS v4 | PostCSS 集成 |
| 状态管理 | Zustand | 已有 persist 中间件 |
| 动画 | Framer Motion | 已深度使用 |
| UI 组件 | Radix UI + shadcn/ui 模式 | 已有部分依赖 |
| 部署 | Cloudflare Pages | `@cloudflare/next-on-pages` |
| 包管理 | pnpm | 版本 ≥ 9 |

### 7.2 约束条件

1. **Cloudflare Pages 兼容性**：不支持完整 Node.js runtime，需使用 Edge Runtime 或纯静态方案
2. **纯静态架构（全阶段）**：项目不引入任何后端依赖，所有阶段均为纯静态部署。评论功能使用 GitHub Issues/Discussions-based 方案（giscus / utterances），数据存储和 API 全部由 GitHub 提供
3. **性能预算**：
   - 首屏 JS Bundle < 150KB (gzipped)
   - Lighthouse Performance ≥ 90
   - 新增动效不能导致主线程阻塞 > 50ms
4. **可访问性**：所有交互组件需满足 WCAG 2.1 AA 标准
5. **配置化优先**：所有新功能的内容数据必须支持通过 `platform-config.json` 配置

### 7.3 配置文件扩展方案

`platform-config.json` 将扩展为：

```jsonc
{
  "profile": { /* 现有 */ },
  "socialLinks": [ /* 现有 */ ],
  "websiteLinks": [ /* 现有 */ ],
  // --- 新增 ---
  "projects": [
    {
      "id": "duckfolio",
      "title": "Duckfolio",
      "description": "现代化个人主页模板",
      "cover": "/projects/duckfolio-cover.png",
      "tags": ["Next.js", "TypeScript", "Tailwind"],
      "category": "开源工具",
      "stats": { "stars": 128, "forks": 32 },
      "links": { "demo": "https://dnsl.in", "code": "https://github.com/dnslin/Duckfolio" },
      "featured": true
    }
  ],
  "skills": [
    {
      "id": "frontend",
      "name": "前端开发",
      "skills": [
        { "name": "TypeScript", "level": 85 },
        { "name": "React", "level": 90 },
        { "name": "Next.js", "level": 80 }
      ]
    }
  ],
  "github": {
    "username": "dnslin",
    "showContributionGraph": true,
    "showStats": true
  },
  "musicPlayer": {
    "enabled": true,
    "provider": "netease",
    "playlistUrl": "https://music.163.com/outchain/player?type=0&id=xxx",
    "position": "bottom-right"
  },
  "theme": {
    "preset": "default",
    "backgroundEffect": "gradient"
  }
}
```

---

## 8. MVP Scope & Phasing

### Phase 1: MVP（项目展示 + 技能树）

**目标**：交付核心展示能力，验证配置化架构

| 任务 | 涉及文件 | 估计 Issues |
|------|---------|-------------|
| 扩展 `platform-config.json` 数据模型 | `public/platform-config.json`, `src/lib/config.ts`, `src/lib/store.ts` | 1 |
| 实现 Projects Section UI | `src/components/projects.tsx`, `src/app/page.tsx` | 2 |
| 实现 Skills Section UI | `src/components/skills.tsx`, `src/app/page.tsx` | 2 |
| 导航栏扩展（支持 4 个 Section） | `src/app/page.tsx` | 1 |
| 响应式适配 & 动画调优 | 各组件文件 | 1 |
| TypeScript 类型定义 | `src/lib/config.ts`, `src/lib/store.ts` | 1 |

**交付物**：
- 4 个 Section（Profile, Links, Projects, Skills）
- 项目卡片：封面图 + 标签 + Stats + 链接
- 技能进度条：分类 + 图标 + 进度条动画
- 完整的 TypeScript 类型安全
- 配置文件示例和文档

### Phase 2: GitHub 集成 + 音乐播放器

**目标**：增加动态数据源和交互层

| 任务 | 涉及文件 | 估计 Issues |
|------|---------|-------------|
| GitHub GraphQL 数据获取脚本 | `scripts/fetch-github-data.ts` | 1 |
| 贡献热力图组件 | `src/components/github-heatmap.tsx` | 2 |
| GitHub 统计卡片组件 | `src/components/github-stats.tsx` | 1 |
| 音乐播放器组件 | `src/components/music-player.tsx` | 2 |
| GitHub Actions 定时构建 | `.github/workflows/rebuild.yml` | 1 |

### Phase 3: 视觉个性化 + 交互增强

**目标**：提升视觉差异化和沉浸体验

| 任务 | 涉及文件 | 估计 Issues |
|------|---------|-------------|
| 主题预设系统 | `src/lib/themes.ts`, `src/components/theme-provider.tsx` | 2 |
| 动态背景效果 | `src/components/background-effects/` | 2 |
| 字体配置系统 | `src/lib/fonts.ts`, `src/app/layout.tsx` | 1 |
| 滚动视差 & Section 过渡动画 | 各组件文件 | 1 |
| 主题切换器 UI | `src/components/toggle-theme.tsx` | 1 |

### Phase 4: 社区功能（可选）

**目标**：访客互动能力（纯静态方案）

| 任务 | 涉及文件 | 估计 Issues |
|------|---------|-------------|
| 评论组件（giscus/utterances 集成） | `src/components/comments.tsx` | 1 |

---

## 9. Risk Assessment

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Cloudflare Pages 不支持某些 Next.js 功能 | 中 | 高 | MVP 使用纯静态渲染；提前在 `next-on-pages` 环境验证每个新功能 |
| GitHub API 速率限制 | 中 | 中 | 使用构建时静态化 + 定期 rebuild；提供 `statsOverrides` fallback |
| 动效过多导致性能下降 | 中 | 中 | 制定动画性能预算；复杂动画使用 `will-change` 和 GPU 加速；Lighthouse CI 监控 |
| `platform-config.json` 膨胀过大 | 低 | 低 | 考虑后期拆分为多配置文件（`projects.json`, `skills.json` 等） |
| 音乐播放器第三方嵌入不稳定 | 中 | 低 | 使用 `loading="lazy"` + 错误边界；播放器为可选功能 |
| 开源模板维护负担 | 低 | 中 | 保持配置化设计；编写清晰的 README 和配置示例 |
| 图片资源加载影响首屏性能 | 中 | 中 | 项目封面使用 Next.js `<Image>` 自动优化 + `placeholder="blur"` + 懒加载 |

---

## 10. Out of Scope (本次迭代不包含)

- 多语言 (i18n) 支持
- CMS 管理后台
- SEO 优化（独立 Issue 跟踪）
- 博客/文章功能
- Analytics 集成
- PWA 支持
- 自建后端 API / 数据库（项目定位为纯静态架构）

---

## 11. Appendix

### A. 导航结构（MVP 后）

```
[Logo]                    [Profile] [Links] [Projects] [Skills] [GitHub]
```

### B. 配置文件类型定义（完整）

```typescript
// src/lib/types.ts

export interface PlatformConfig {
  profile: ProfileConfig;
  socialLinks: SocialLink[];
  websiteLinks: WebsiteLink[];
  projects?: Project[];
  skills?: SkillCategory[];
  github?: GitHubConfig;
  musicPlayer?: MusicPlayerConfig;
  comments?: CommentsConfig;
  theme?: ThemeConfig;
}

export interface ProfileConfig {
  name: string;
  bio: string;
  avatar: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface WebsiteLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cover: string;
  tags: string[];
  category: string;
  stats?: { stars?: number; forks?: number };
  links: { demo?: string; code?: string };
  featured?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon?: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  icon?: string;
  level: number;
  color?: string;
}

export interface GitHubConfig {
  username: string;
  showContributionGraph?: boolean;
  showStats?: boolean;
  showPinnedRepos?: boolean;
  statsOverrides?: {
    totalStars?: number;
    totalCommits?: number;
    totalPRs?: number;
    totalIssues?: number;
  };
}

export interface MusicPlayerConfig {
  enabled: boolean;
  provider: 'netease' | 'spotify';
  playlistUrl: string;
  position?: 'bottom-left' | 'bottom-right';
  autoMinimize?: boolean;
}

export interface CommentsConfig {
  enabled: boolean;
  provider: 'giscus' | 'utterances';
  repo: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: 'pathname' | 'title' | 'og:title';
}

export interface ThemeConfig {
  preset?: string;
  backgroundEffect?: 'none' | 'particles' | 'gradient' | 'geometric' | 'waves';
  customColors?: Partial<ThemeColors>;
  fonts?: {
    heading?: string;
    body?: string;
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}
```

### C. 参考竞品

- [Linktree](https://linktr.ee) — 链接聚合，但缺乏项目展示
- [Bento.me](https://bento.me) — 卡片式布局，视觉丰富
- [Read.cv](https://read.cv) — 专业简历，但不够个性化
- [GitHub Profile README](https://github.com) — 技术向，但限于 Markdown

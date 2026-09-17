# 🦆 Duckfolio

**Duckfolio** 是一个简洁、现代、有趣的个人主页模板。

本项目旨在为开发者、设计师或创作者提供一个清爽、易于维护的在线名片，快速展示你的个人信息、社交链接与博客等内容。  
同时也展示了如何使用现代 Web 技术（Next.js、TailwindCSS、Shadcn UI 等）构建轻量级的静态网站。

---

## ✨ 项目特色

- 使用 **Next.js 16 + Turbopack**，开发和生产构建统一使用 Turbopack
- 🎨 采用 **Tailwind CSS 4** 实现原子化、响应式布局
- 🌗 支持 **深色/浅色主题自动切换**
- 💫 利用 **Framer Motion** 增添自然平滑的过渡动画
- 🧩 使用 **Shadcn UI** 构建现代交互组件
- 🧠 通过 **Zustand** 管理全局状态（如主题）
- 📱 完全响应式，适配移动端和大屏设备
- 🧼 结构清晰，易于维护和定制

---

## 🖼️ 页面预览

### 首页 - Profile  
![Preview](https://blog.yorlg.it/wp-content/uploads/2025/05/Duckfolio-Preview1.png)

### 链接页 - Links  
![Preview](https://blog.yorlg.it/wp-content/uploads/2025/05/Duckfolio-Preview2.png)

---

## 🛠️ 使用技术

| 技术                                                      | 用途         |
| --------------------------------------------------------- | ------------ |
| [Next.js](https://nextjs.org/)                            | 框架         |
| [Turbopack](https://turbo.build/pack)                     | 构建工具     |
| [Tailwind CSS](https://tailwindcss.com/)                  | 样式框架     |
| [Shadcn UI](https://ui.shadcn.com/ )                      | 无障碍组件库 |
| [Framer Motion](https://www.framer.com/motion/)           | 动画库       |
| [Zustand](https://github.com/pmndrs/zustand)              | 状态管理     |
| [next-themes](https://github.com/pacocoursey/next-themes) | 主题切换     |
| [Lucide Icons](https://lucide.dev/)                       | 图标         |

---

## 🚀 快速开始

要求 Node.js 22.13+、pnpm 11+。依赖安装配置位于 `pnpm-workspace.yaml`。

当前工具链使用 React 19.3、Motion 13、Tailwind CSS 4.3 和 TypeScript 6。
TypeScript 7 暂无编译器 API，当前 ESLint 插件也尚未支持 ESLint 10；因此分别使用 TypeScript 6 和 ESLint 9，不引入双版本兼容包。

检查命令：`pnpm test`、`pnpm typecheck`、`pnpm lint`。构建输出为静态目录 `out/`；`pnpm start` 使用 [serve](https://github.com/vercel/serve) 在端口 3000 本地预览已有产物，`pnpm preview` 先构建再预览。

`pnpm build` 不会改写 `public/platform-config.json` 或删除其中的项目。自动封面写入派生产物 `public/project-covers.json`，再由构建配置注入页面；GitHub 元数据请求失败时保留项目并使用 Socialify 封面。未生成封面文件的开发环境使用资料中配置的封面。

GitHub 数据写入 `public/github-data.json`。未配置账号、缺少 `GITHUB_TOKEN` 或请求失败时，页面明确显示无数据，而非伪造零贡献；真实的 `0` 和 `statsOverrides` 中的 `0` 都是有效数值。Stars 统计按星数排序的最多 100 个可访问、自有且非 fork 的仓库，Commits 统计快照生成时过去一年的贡献提交，页面显示实际起止日期；PRs 和 Issues 为累计数量。

### 1. 开发与构建

```bash
git clone https://github.com/Yorlg/Duckfolio.git
cd duckfolio

# 安装依赖
pnpm install --frozen-lockfile

# 启动开发服务器
pnpm dev

# 类型检查与代码检查
pnpm test
pnpm typecheck
pnpm lint

# 构建静态网站
pnpm build

# 预览已有构建产物：http://localhost:3000
pnpm start
```

也可以运行 `pnpm preview`，先构建再启动同一个本地静态预览服务。

### 2. 通用静态部署

项目采用 Next.js 静态导出，不需要 Next.js 服务端或平台专用适配器。

1. 在构建环境安装 Node.js 22.13+ 和 pnpm 11+，执行 `pnpm install --frozen-lockfile`。
2. 按需配置 `GITHUB_TOKEN`，执行 `pnpm build`。
3. 将生成的 `out/` 目录内容发布到任意静态文件服务器或静态网站托管服务；网站根目录应指向这些文件，而非项目源码。
4. 使用构建出的 `404.html` 作为未找到页面，检查首页、页面资源及 `/github-data.json` 是否可访问。

项目的配置文件位于 `public/platform-config.json`，你可以在这里修改个人信息、社交链接等内容。资料在构建时写入页面；修改后需要重新构建并部署，仅替换已部署的 JSON 文件不会更新已构建页面。

静态资料不存入浏览器本地缓存，旧的资料快照不会覆盖新部署。浏览器只保存访客选择的明暗模式和主题配色。减少动态效果偏好会关闭自定义指针跟随、头像倾斜和界面位移动画，保留颜色与透明度反馈。
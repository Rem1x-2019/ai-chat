# 🤖 AI Chat - 您的个人 AI 聊天助理

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,OPENAI_API_KEY,ADMIN_EMAILS&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

一个基于 Next.js + Tailwind CSS + Prisma 构建的多模型 AI 聊天应用。它支持在不同的 AI 模型（如 OpenAI, DeepSeek）之间动态切换，拥有用户配额控制、多会话持久化、管理员后台等高级功能，并为 Vercel 和 Docker 提供了极致优化的部署流程。

![应用截图](https://raw.githubusercontent.com/Rem1x-2019/aichat/main/public/screenshot.png) 
<!-- 建议您将应用截图命名为 screenshot.png 并放在 public 目录下，然后替换上面的链接 -->

---

## ✨ 功能特性

- **动态多模型支持**:
    - 数据库驱动的 API 服务管理，可在后台动态添加、修改 API Key、Base URL 等。
    - 支持任何兼容 OpenAI 接口的托管模型。
    - 管理员可设置全站默认模型，用户可在前台自由切换。
- **持久化聊天**:
    - 所有对话会话和消息都通过 Prisma 持久化存储在 PostgreSQL 数据库中。
    - **自动命名**: 新会话的标题会根据用户的第一条消息由 AI 自动生成。
- **完善的用户与会话管理**:
    - 支持游客模式，并通过 `guest_id` cookie 追踪游客身份。
    - 集成 NextAuth.js 实现安全的 GitHub OAuth 登录。
    - 用户可在左侧边栏轻松创建、切换和**删除**多个聊天会话。
- **灵活的配额与权限系统**:
    - 管理员可在后台为每个独立用户（包括游客）设置每日消息数量上限。
    - 基于角色的后台访问控制，只有指定管理员才能进入 `/admin` 页面。
- **强大的管理后台**:
    - **API 服务管理**: 集中管理所有 AI 模型的配置和查看其使用次数。
    - **用户管理**: 查看所有用户列表，并能在线修改他们的每日消息额度。
    - **系统设置**: 动态调整全站默认 AI 模型。
- **现代且响应式 UI**:
    - 采用 Tailwind CSS 构建，界面干净、美观，在桌面和移动设备上均有良好体验。
    - 支持 Markdown 渲染，完美展示 AI 返回的代码块、列表、粗体等格式。
- **一键部署**:
    - 提供优化的 Vercel 部署配置，集成了所有必需的环境变量。
    - 提供完整的 Docker 本地开发环境。

---

## 🛠️ 近期更新与修复记录 (截至今日)

这个项目在最近经历了一次密集的迭代和问题修复，从一个基础原型演变成了一个功能完备、可部署的 Web 应用。以下是关键的更新日志：

- **功能迭代**:
    - **新增管理后台**: 创建了 `/admin` 页面，实现了基于环境变量的管理员权限验证。
    - **动态 API 管理**: 后台现在可以动态管理 AI 服务（API Key, Base URL, 模型名）并统计使用次数，配置从环境变量解耦至数据库。
    - **用户管理与额度控制**: 后台可以展示用户列表，并为每个用户独立设置消息额度。
    - **模型选择**: 管理员可设置默认模型，前台用户也可在聊天窗口自由切换模型。
    - **会话自动命名**: 新建会话的标题可根据用户的第一条消息由 AI 自动生成。
    - **会话删除**: 为侧边栏的会话列表添加了删除功能。
    - **用户认证 UI**: 新增了用户菜单，可显示登录状态、用户信息，并处理登录/登出操作。

- **布局与 UI 优化**:
    - **主窗口布局重构**: 实现了类似 ChatGPT 的居中、带边框和阴影的窗口布局，并优化了整体尺寸和背景色。
    - **组件样式微调**: 优化了按钮、输入框、消息气泡等组件的视觉效果。

- **核心 Bug 修复与重构**:
    - **API 路由 404 问题**: 修复了因 `api` 目录位置错误导致的线上 API 无法访问的问题。
    - **Vercel 构建失败**:
        - 解决了因 `OPENAI_API_KEY` 等环境变量缺失导致的构建错误。
        - 修复了因文件编码非 `UTF-8` 格式导致的 `Failed to read source code` 错误。
    - **数据库连接失败 (`P1001`)**:
        - 通过在 `schema.prisma` 中正确配置 `url` 和 `directUrl`，并添加对应的 `DATABASE_URL_UNPOOLED` 环境变量，解决了线上无法连接 Neon 数据库的问题。
        - 通过使用 Prisma 事务 (`$transaction`) 重构了会话创建逻辑，保证了数据一致性。
    - **前端逻辑修复**:
        - 重构了主页面的状态管理逻辑，解决了因异步操作竞争导致的“新建会话无反应”和卡在加载状态的问题。
        - 修复并重构了 `ChatWindow` 组件，使其与主页面的状态管理完全同步。

---

## 🚀 部署到 Vercel (推荐)

部署您自己的版本是体验本项目的最佳方式。

1.  **Fork 本仓库**: 点击此页面右上角的 "Fork" 按钮，创建您自己的副本。
2.  **创建云数据库**: 访问 [Neon](https://neon.tech/) 并创建一个新的免费 PostgreSQL 数据库。您将从 Neon 获得 `DATABASE_URL` 和 `DATABASE_URL_UNPOOLED` 两个连接字符串。
3.  **点击下方按钮进行部署**:

    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,OPENAI_API_KEY,ADMIN_EMAILS&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

4.  **配置环境变量**: Vercel 会提示您填入环境变量。请按照 `.env.example` 文件的说明，从 Neon 和您的 GitHub OAuth App 获取并填入所有必需的值。
5.  **手动初始化 API 服务**: 部署成功后，您的应用数据库还是空的。您需要访问后台管理页面 `/admin`，手动添加您的 AI 服务配置（如 aichat, deepseek 的 API Key, URL, Model Name 等）。

---

## 📦 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) (推荐使用 [Neon](https://neon.tech/) 或 Vercel Postgres)
- **ORM**: [Prisma](https://www.prisma.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + `@tailwindcss/typography`
- **认证**: [NextAuth.js](https://next-auth.js.org/)
- **部署**: [Vercel](https://vercel.com/) / [Docker](https://www.docker.com/)

---

## 🧑‍💻 本地开发环境设置

1.  **克隆您的 Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/aichat.git
    cd aichat
    ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **设置环境变量**:
    *   复制示例文件: `cp .env.example .env`
    *   打开 `.env` 文件，填入您的数据库连接信息和 API 密钥。本地开发推荐使用 Docker。

4.  **应用数据库迁移**:
    *   确保您的 `.env` 文件中的 `DATABASE_URL` 指向一个可访问的数据库。
    *   运行:
      ```bash
      npx prisma migrate dev
      ```

5.  **启动开发服务器**:
    ```bash
    npm run dev
    ```
    应用将在 [http://localhost:3000](http://localhost:3000) 上运行。首次运行时，别忘了去 `/admin` 页面配置 API 服务。

---

## 🔐 环境变量说明 (`.env.example`)

- `DATABASE_URL`: **[必需]** 您的 PostgreSQL 数据库的**连接池** URL (例如，来自 Neon，包含 `-pooler`)。
- `DATABASE_URL_UNPOOLED`: **[必需]** 您的 PostgreSQL 数据库的**直连** URL (用于数据库迁移)。
- `NEXTAUTH_URL`: **[必需]** 您应用部署后的公开 URL (例如, `https://your-app.vercel.app`)。
- `NEXTAUTH_SECRET`: **[必需]** 用于加密会话的随机字符串，可以通过 `openssl rand -base64 32` 生成。
- `OPENAI_API_KEY`: **[必需]** 即使不使用，也需要一个虚拟值 (例如, `dummy-key`) 以便构建通过。
- `ADMIN_EMAILS`: **[必需]** 管理员的邮箱地址，多个用逗号分隔（无空格）。
- `GITHUB_ID` / `GITHUB_SECRET`: (可选) 用于 GitHub 登录。
- `DEFAULT_DAILY_LIMIT`: (可选) **注意：此变量已废弃**，额度现在在后台按用户管理。

**注意**: `DEEPSEEK_` 相关的环境变量已被数据库取代，您需要在应用的后台管理页面进行配置。

---

## 📈 未来路线图

- [ ] 流式输出 (Streaming Response) 以提升体验。
- [ ] 为代码块添加“一键复制”功能。
- [ ] 在用户菜单中动态显示真实的消息剩余额度。
- [ ] 侧边栏会话标题在自动命名后实时更新。
- [ ] 更完善的用户管理功能（如禁用用户、重置额度）。

---

## 📄 许可证

本项目采用 [MIT 许可证](/LICENSE)。
# 🤖 AI Chat - 您的个人 AI 聊天助理

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,ADMIN_EMAILS&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

一个基于 Next.js 14 (App Router) 构建的全栈 AI 聊天应用。它拥有动态模型配置、流式响应、多会话管理、用户额度控制和功能强大的管理员后台，并为 Vercel 和 Docker 提供了极致优化的部署流程。

![应用截图](https://raw.githubusercontent.com/Rem1x-2019/aichat/main/public/screenshot.png) 
<!-- 建议您将应用截图命名为 screenshot.png 并放在 public 目录下，然后替换上面的链接 -->

---

## ✨ 功能特性

- **流式响应 (Streaming)**: AI 的回复像打字机一样实时输出，显著提升用户交互体验。
- **动态多模型支持**:
    - 数据库驱动的 API 服务管理，可在后台动态添加、修改 API Key、Base URL 等。
    - 管理员可设置全站默认模型，用户可在前台自由切换。
- **持久化与智能会话**:
    - 所有对话会话和消息均通过 Prisma 持久化存储。
    - **自动命名**: 新会话标题根据用户的第一条消息由 AI 自动生成，并实时更新。
- **完善的用户与会话管理**:
    - 支持游客模式与 GitHub OAuth 登录。
    - 用户可轻松创建、切换和**删除**多个聊天会话。
- **强大的管理后台 (`/admin`)**:
    - **返回首页**: 增加了便捷的返回按钮。
    - **API 服务管理**: 集中管理 AI 模型配置、查看使用次数，更新后提供成功提示。
    - **用户管理**: 查看所有用户（包括游客）列表，可在线修改其每日消息额度，并能**删除用户**。
    - **系统设置**: 动态调整全站默认 AI 模型。
- **灵活的配额系统**:
    - 管理员可在后台为每个独立用户设置每日消息数量上限。
- **现代且响应式 UI**:
    - 采用 Tailwind CSS 构建，界面干净、美观。
    - 支持 Markdown 渲染，完美展示 AI 返回的代码块、列表等格式。
- **一键部署**:
    - 提供优化的 Vercel 部署配置和完整的 Docker 本地开发环境。

---

## 🛠️ 近期更新与修复记录 (截至今日)

- **核心功能升级**:
    - **实现流式输出**: 集成 Vercel AI SDK (`ai` 包)，重构前后端以支持流式响应。
    - **全局状态管理**: 引入 `Zustand`，解决了跨组件状态同步问题，确保了会话标题在自动命名后能实时更新。
- **后台功能增强**:
    - 在用户管理列表中增加了**删除用户**的功能。
    - 在后台管理页面顶部增加了**返回首页**的按钮。
    - 为后台的表单操作（如更新 API 配置）增加了**成功/失败提示**。
- **UI/UX 优化**:
    - 修复了后台用户管理列表中因 ID 长度不一导致的**按钮未对齐**问题。
- **此前的主要迭代**:
    - 新增了完整的管理后台，实现了 API、用户和系统设置的动态管理。
    - 实现了会话自动命名、删除会话、用户认证 UI 等核心功能。
    - 修复了从 Vercel 构建失败到数据库连接失败等一系列部署问题。

---

## 🚀 部署到 Vercel (推荐)

1.  **Fork 本仓库**。
2.  **创建云数据库**: 访问 [Neon](https://neon.tech/) 并创建一个新的免费 PostgreSQL 数据库，获取 `DATABASE_URL` 和 `DATABASE_URL_UNPOOLED`。
3.  **点击下方按钮进行部署**:

    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,ADMIN_EMAILS&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

4.  **配置环境变量**: Vercel 会提示您填入环境变量。请按照 `.env.example` 文件的说明进行配置。
5.  **手动初始化 API 服务**: 部署成功后，访问您的应用，用管理员账户登录并进入 `/admin` 页面，手动添加您的 AI 服务配置。

---

## 📦 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI/流式处理**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) (推荐 [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/)
- **认证**: [NextAuth.js](https://next-auth.js.org/)
- **部署**: [Vercel](https://vercel.com/) / [Docker](https://www.docker.com/)

---

## 🧑‍💻 本地开发环境设置

1.  **克隆您的 Fork**。
2.  **安装依赖**:
    ```bash
    npm install
    ```
3.  **设置环境变量**:
    *   复制示例文件: `cp .env.example .env`
    *   打开 `.env` 文件，填入您的配置。
4.  **应用数据库迁移**:
    *   如果您是首次设置或修改了 `schema.prisma`，请运行：
      ```bash
      # 如果您在 Windows 上无法直接使用 npx，
      # 可以先在 package.json 的 scripts 中添加 "migrate:dev": "prisma migrate dev"
      # 然后运行 npm run migrate:dev
      npx prisma migrate dev
      ```
5.  **启动开发服务器**:
    ```bash
    npm run dev
    ```
    应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

---

## 🔐 环境变量说明 (`.env.example`)

- `DATABASE_URL`: **[必需]** 您的 PostgreSQL 数据库的**连接池** URL。
- `DATABASE_URL_UNPOOLED`: **[必需]** 您的 PostgreSQL 数据库的**直连** URL (用于数据库迁移)。
- `NEXTAUTH_URL`: **[必需]** 您应用部署后的公开 URL。
- `NEXTAUTH_SECRET`: **[必需]** 用于加密会话的随机字符串。
- `ADMIN_EMAILS`: **[必需]** 管理员的邮箱地址，多个用逗号分隔（无空格）。
- `OPENAI_API_KEY`: (可选) 如果您想在后台配置 OpenAI 服务，此变量不再需要，但保留一个虚拟值可以防止某些旧的构建脚本报错。
- `GITHUB_ID` / `GITHUB_SECRET`: (可选) 用于 GitHub 登录。

**注意**: AI 模型的 API Key 等配置已从环境变量转移到数据库中，请在应用的后台管理页面进行配置。

---

## 📈 未来路线图

- [x] ~~流式输出 (Streaming Response)~~
- [ ] 为代码块添加“一键复制”功能。
- [ ] 在用户菜单中动态显示真实的消息剩余额度。
- [ ] 更完善的用户管理功能（如禁用用户、批量操作）。
- [ ] 对话历史搜索功能。
- [ ] 更美观的 Toast/Notification 提示系统。

---

## 📄 许可证

本项目采用 [MIT 许可证](/LICENSE)。
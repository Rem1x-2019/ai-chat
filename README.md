# 🤖 AI Chat (Remix) - 个人AI聊天助理

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,DEEPSEEK_API_KEY,DEEPSEEK_API_URL,DEEPSEEK_MODEL_NAME,OPENAI_API_KEY&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

一个基于 Next.js + Tailwind CSS + Prisma 构建的多模型 AI 聊天应用。它支持 OpenAI 与 DeepSeek (或任何兼容 OpenAI 接口的托管模型) 之间的切换、用户配额控制、多会话持久化，以及为 Vercel 和 Docker 优化的便捷部署流程。

 <!-- 您可以将这个链接替换为您应用的真实截图 -->

---

## ✨ 功能特性

- **多模型支持**: 已集成 DeepSeek 和 OpenAI 接口，可轻松扩展至其他模型。
- **持久化聊天**: 所有对话会话和消息都通过 Prisma 持久化存储在 PostgreSQL 数据库中。
- **多会话管理**: 在左侧边栏轻松创建、切换和管理多个聊天会话。
- **用户与游客系统**: 支持游客模式，并通过 `guest_id` cookie 追踪游客身份。
- **消息额度限制**: 为每位用户（包括游客）设置可配置的每日消息上限。
- **Markdown 渲染**: 完美展示 AI 返回的代码块、列表、粗体等 Markdown 格式。
- **现代且响应式 UI**: 采用 Tailwind CSS 构建，界面干净、美观，在桌面和移动设备上均有良好体验。
- **一键部署**: 提供优化的 Vercel 部署配置和完整的 Docker 本地开发环境。
- **安全认证**: (可轻松集成) 已搭建 NextAuth.js 基础，可快速添加 GitHub、Google 等 OAuth 提供商。

---

## 📦 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) (通过 [Neon](https://neon.tech/) 或 Vercel Postgres)
- **ORM**: [Prisma](https://www.prisma.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Headless UI](https://headlessui.dev/) (隐式)
- **认证**: [NextAuth.js](https://next-auth.js.org/)
- **部署**: [Vercel](https://vercel.com/) / [Docker](https://www.docker.com/)

---

## 🚀 部署到 Vercel (推荐)

部署您自己的版本是体验本项目的最佳方式。

1.  **Fork 本仓库**: 点击此页面右上角的 "Fork" 按钮。
2.  **创建云数据库**: 访问 [Neon](https://neon.tech/) 并创建一个新的免费 PostgreSQL 数据库。
3.  **点击下方按钮进行部署**:

    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRem1x-2019%2Faichat&env=DATABASE_URL,DATABASE_URL_UNPOOLED,NEXTAUTH_URL,NEXTAUTH_SECRET,DEEPSEEK_API_KEY,DEEPSEEK_API_URL,DEEPSEEK_MODEL_NAME,OPENAI_API_KEY&envDescription=Enter%20your%20environment%20variables%20for%20deployment.&project-name=my-ai-chat&repository-name=my-ai-chat)

4.  **配置环境变量**: Vercel 会提示您填入环境变量。请按照 `.env.example` 文件的说明，从 Neon 和您的 AI 服务提供商处获取并填入所有必需的值。

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
    *   打开 `.env` 文件，填入您的**本地开发数据库**（推荐使用 Docker）或 Neon 数据库的连接信息，以及您的 API 密钥。

4.  **生成迁移文件 (如果 `prisma/migrations` 文件夹为空)**:
    *   确保您的 `.env` 文件中的 `DATABASE_URL` 指向一个可访问的数据库。
    *   运行:
      ```bash
      npx prisma migrate dev --name "initial-schema"
      ```

5.  **启动开发服务器**:
    ```bash
    npm run dev
    ```
    应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

---

## 🐳 使用 Docker 进行本地开发

如果您安装了 Docker，这是最简单的本地启动方式。

1.  确保您已经创建并配置好了 `.env` 文件（`DATABASE_URL` 可以指向 `localhost`）。
2.  启动 Docker Compose 服务:
    ```bash
    docker compose -f docker-compose.prod.yml up --build -d
    ```
    这将同时启动应用和 PostgreSQL 数据库容器。
3.  要应用数据库迁移，请在新终端中运行:
    ```bash
    docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
    ```

---

## 🔐 环境变量说明 (`.env.example`)

- `DATABASE_URL`: **[必需]** 您的 PostgreSQL 数据库的**连接池** URL (例如，来自 Neon，包含 `-pooler`)。
- `DATABASE_URL_UNPOOLED`: **[必需]** 您的 PostgreSQL 数据库的**直连** URL (用于数据库迁移)。
- `DEEPSEEK_API_KEY`: **[必需]** 您的 DeepSeek 或兼容模型的 API 密钥。
- `DEEPSEEK_API_URL`: **[必需]** 您的 DeepSeek 或兼容模型的 API 端点 URL。
- `DEEPSEEK_MODEL_NAME`: **[必需]** 您要使用的模型名称 (例如, `DeepSeek-R1`)。
- `NEXTAUTH_URL`: **[必需]** 您应用部署后的公开 URL (例如, `https://your-app.vercel.app`)。
- `NEXTAUTH_SECRET`: **[必需]** 用于加密会话的随机字符串，可以通过 `openssl rand -base64 32` 生成。
- `OPENAI_API_KEY`: **[必需]** 即使不使用，也需要一个虚拟值 (例如, `dummy-key`) 以便构建通过。
- `GITHUB_ID` / `GITHUB_SECRET`: (可选) 用于 GitHub 登录。
- `DEFAULT_DAILY_LIMIT`: (可选) 每日消息限制，默认为 `20`。

---

## 📄 许可证

本项目采用 [MIT 许可证](/LICENSE)。
# 🤖 AI 聊天机器人 (修复版)

一个基于 Next.js + Tailwind CSS + Prisma 构建的多模型 AI 聊天机器人，支持 OpenAI 与 DeepSeek 接口选择、用户配额控制、多会话持久化，以及 Docker / Vercel 一键部署。

---

## ✨ 功能特性

- **模型选择**: 在 OpenAI (GPT-4) 和 DeepSeek 模型之间自由切换。
- **多会话聊天**: 用户的对话会被保存，可以随时回顾和继续。
- **用户配额**: 为游客和登录用户设置每日消息数量限制。
- **用户认证**: 使用 NextAuth.js 和 GitHub OAuth 实现安全登录。
- **Markdown 支持**: 在聊天中完美渲染代码块、列表等 Markdown 格式。
- **现代 UI**: 基于 Shadcn/UI 和 Tailwind CSS 的简洁、响应式界面。
- **便捷部署**: 支持 Vercel 一键部署和完整的 Docker 本地环境。

---

## 📦 技术栈

- Next.js 14 (App Router)
- React Server Components (RSC)
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth.js (GitHub OAuth)
- OpenAI & DeepSeek APIs
- Docker & Docker Compose

---

## 🧑‍💻 本地开发

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/Rem1x-2019/aichat.git
    cd aichat
    ```
2.  **配置环境变量**:
    ```bash
    cp .env.example .env
    ```
    然后打开 `.env` 文件，填入您的个人凭证。

3.  **安装依赖并初始化数据库**:
    ```bash
    npm install
    npx prisma migrate dev
    ```

4.  **启动开发服务器**:
    ```bash
    npm run dev
    ```
    在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

---

## 🐳 使用 Docker 部署

我们提供了一个包含应用和数据库的 Docker Compose 配置。

1.  确保您已经按照上述步骤创建并配置好了 `.env` 文件。
2.  构建并启动容器:
    ```bash
    docker compose up --build -d
    ```
应用将在 [http://localhost:3000](http://localhost:3000) 上可用。

---

## 🌐 在 Vercel 上部署

1.  将您的代码推送到一个 GitHub 仓库。
2.  访问 [Vercel](https://vercel.com) 并导入您的项目。
3.  在 Vercel 的项目设置中，添加您 `.env` 文件里的所有环境变量。**切勿将您的 `.env` 文件或任何密钥提交到 GitHub。**
4.  部署！Vercel 将自动完成构建和部署流程。

---

## 📄 许可证

MIT © [Rem1x-2019](https://github.com/Rem1x-2019)
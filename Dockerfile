# 使用 Node.js 作为基础镜像
FROM docker.gptmanage.top/node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 bun
RUN npm install -g bun

# 复制全部项目文件
COPY . .

# 设置环境变量（构建和运行时都需要）
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_PUBLIC_SUPABASE_URL=https://example-project.supabase.co \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUtcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxMjM0NTY3ODkwLCJleHAiOjk4NzY1NDMyMTB9.EXAMPLE-FAKE-TOKEN-SIGNATURE \
    SUPABASE_DATABASE_URL=postgresql://postgres.example:FAKE-PASSWORD@example.pooler.supabase.com:6543/postgres \
    CSB_API_KEY=csb_v1_FAKE-KEY-EXAMPLE-123456789abcdefg \
    ANTHROPIC_API_KEY=sk-ant-api03-FAKE-KEY-EXAMPLE-123456789abcdefghijklmnopqrstuvwxyz-FAKE \
    MORPH_API_KEY=sk-FAKE-MORPH-KEY-123456789abcdef \
    RELACE_API_KEY=sk-FAKE-RELACE-KEY-123456789abcdef \
    GOOGLE_GENERATIVE_AI_API_KEY=sk-FAKE-GOOGLE-KEY-123456789abcdef \
    GOOGLE_AI_STUDIO_API_KEY=sk-FAKE-GOOGLE-STUDIO-KEY-123456789abcdef

# 安装依赖并构建
RUN bun install && bun run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["bun", "run", "start"] 
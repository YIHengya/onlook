# 使用 Node.js 作为基础镜像
FROM docker.gptmanage.top/node:20-alpine

# 设置工作目录
WORKDIR /app

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 bun.lock 文件
COPY package.json bun.lock* ./

# 复制所有应用和包的 package.json 文件
COPY apps/web/client/package.json ./apps/web/client/
COPY apps/web/server/package.json ./apps/web/server/
COPY apps/web/preload/package.json ./apps/web/preload/
COPY apps/backend/package.json ./apps/backend/
COPY packages/*/package.json ./packages/*/

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"] 
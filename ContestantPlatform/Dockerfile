# Sử dụng Node.js để build ứng dụng
FROM node:16 AS builder
WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY package.json package-lock.json ./
RUN npm install

# Copy phần còn lại của mã nguồn và build ứng dụng
COPY . .
RUN npm run build

# Sử dụng image nhẹ để chạy ứng dụng
FROM node:16-alpine AS runner
WORKDIR /app

# Cài đặt serve để phục vụ ứng dụng
RUN npm install -g serve

# Copy thư mục build từ giai đoạn builder
COPY --from=builder /app/dist /app/dist

# Chạy ứng dụng trên port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

# Expose port 3000
EXPOSE 3000

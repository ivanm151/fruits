# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем все package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем ВСЕ исходники (важно!)
COPY . .

# Проверяем что скопировалось (для отладки)
RUN ls -la src/services/ && ls -la src/stores/

# Собираем проект
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Добавляем конфиг для SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
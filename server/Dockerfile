FROM node:20-alpine

WORKDIR /app

# Копируем только файлы манифестов зависимостей
COPY package*.json ./

# Устанавливаем только продакшен-зависимости
RUN npm ci --only=production

# Копируем весь остальной код бэкенда
COPY . .

# Открываем внутренний порт для Express
EXPOSE 5000

# Команда для запуска приложения
CMD ["node", "app.js"]
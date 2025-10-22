#!/bin/bash

# Скрипт первоначальной настройки проекта
# Использование: ./init-project.sh

set -e

echo "🚀 Инициализация проекта Grooming Salon"
echo "========================================"

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

echo "✅ Docker установлен"

# Создание .env файла
if [ ! -f "config/env/.env" ]; then
    echo "📝 Создание файла .env..."
    cp config/env/.env.example config/env/.env
    echo "⚠️  ВАЖНО: Отредактируйте config/env/.env и укажите свои параметры!"
else
    echo "✅ Файл .env уже существует"
fi

# Создание директории для данных
echo "📁 Создание директорий для данных..."
mkdir -p data/postgres
mkdir -p data/n8n
mkdir -p data/redis
mkdir -p logs

# Установка прав доступа для скриптов
echo "🔐 Установка прав доступа..."
chmod +x scripts/backup/*.sh
chmod +x scripts/maintenance/*.sh
chmod +x scripts/setup/*.sh

# Установка зависимостей бота
if [ -d "src/bot" ]; then
    echo "📦 Установка зависимостей Telegram бота..."
    cd src/bot
    npm install
    cd ../..
    echo "✅ Зависимости установлены"
fi

echo ""
echo "✨ Инициализация завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Отредактируйте config/env/.env"
echo "2. Запустите: cd config/docker && docker-compose up -d"
echo "3. Примените схему БД: docker exec -i groomer-postgres-1 psql -U grooming_user grooming_salon < src/database/schema.sql"
echo "4. Импортируйте workflows в N8N (http://localhost:5678)"
echo ""

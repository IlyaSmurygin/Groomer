#!/bin/bash

# Скрипт очистки логов и временных файлов
# Использование: ./cleanup.sh

set -e

echo "🧹 Очистка проекта..."

# Удаление старых логов (старше 7 дней)
if [ -d "logs" ]; then
    echo "📝 Удаление старых логов..."
    find logs -name "*.log" -mtime +7 -delete
    echo "✅ Старые логи удалены"
fi

# Удаление временных файлов
echo "🗑️  Удаление временных файлов..."
find . -name "*.tmp" -delete
find . -name ".DS_Store" -delete

# Очистка кэша npm
if [ -d "src/bot/node_modules" ]; then
    echo "📦 Очистка кэша npm..."
    cd src/bot
    npm cache clean --force
    cd ../..
fi

# Удаление неиспользуемых Docker образов
read -p "Очистить неиспользуемые Docker образы? (yes/no): " cleanup_docker
if [ "$cleanup_docker" = "yes" ]; then
    echo "🐳 Очистка Docker..."
    docker system prune -f
    echo "✅ Docker очищен"
fi

echo ""
echo "✨ Очистка завершена!"

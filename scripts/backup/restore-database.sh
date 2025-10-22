#!/bin/bash

# Скрипт восстановления базы данных из резервной копии
# Использование: ./restore-database.sh <путь_к_backup_файлу>

set -e

if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите путь к файлу резервной копии"
    echo "Использование: ./restore-database.sh <путь_к_backup.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Файл не найден: $BACKUP_FILE"
    exit 1
fi

# Загрузка переменных окружения
if [ -f "../../config/env/.env" ]; then
    source ../../config/env/.env
else
    echo "❌ Файл .env не найден!"
    exit 1
fi

echo "⚠️  ВНИМАНИЕ: Эта операция перезапишет текущую базу данных!"
read -p "Вы уверены? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Операция отменена"
    exit 0
fi

echo "🔄 Начинаем восстановление базы данных..."

# Разархивирование если файл сжат
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Разархивирование файла..."
    gunzip -c "$BACKUP_FILE" | docker exec -i groomer-postgres-1 psql -U ${POSTGRES_USER:-grooming_user} ${POSTGRES_DB:-grooming_salon}
else
    cat "$BACKUP_FILE" | docker exec -i groomer-postgres-1 psql -U ${POSTGRES_USER:-grooming_user} ${POSTGRES_DB:-grooming_salon}
fi

echo "✅ База данных успешно восстановлена!"
echo "✨ Готово!"

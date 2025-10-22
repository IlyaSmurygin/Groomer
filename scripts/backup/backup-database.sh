#!/bin/bash

# Скрипт резервного копирования базы данных PostgreSQL
# Использование: ./backup-database.sh

set -e

# Загрузка переменных окружения
if [ -f "../../config/env/.env" ]; then
    source ../../config/env/.env
else
    echo "❌ Файл .env не найден!"
    exit 1
fi

# Настройки
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="grooming_salon_backup_${DATE}.sql"

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

echo "🔄 Начинаем резервное копирование базы данных..."

# Выполнение резервного копирования
docker exec groomer-postgres-1 pg_dump -U ${POSTGRES_USER:-grooming_user} ${POSTGRES_DB:-grooming_salon} > "${BACKUP_DIR}/${BACKUP_FILE}"

# Сжатие бэкапа
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "✅ Резервная копия создана: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Удаление старых бэкапов (старше 30 дней)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "🧹 Старые бэкапы (>30 дней) удалены"
echo "✨ Готово!"

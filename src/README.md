# src/

Директория с исходным кодом приложения.

## Структура

### bot/
Telegram бот - основная точка входа для клиентов.

**Файлы:**
- `index.js` - Главный файл бота с обработчиками команд
- `package.json` - Зависимости Node.js

**Запуск:**
```bash
cd bot
npm install
npm start
```

### workflows/
N8N workflows - оркестратор бизнес-логики.

**Файлы:**
- `telegram-bot-main.json` - Основной workflow обработки команд бота
- `notifications.json` - Автоматические уведомления за день до записи
- `admin-stats.json` - Ежедневная статистика для администратора

**Импорт:**
1. Откройте N8N (http://localhost:5678)
2. Перейдите в Workflows → Import from File
3. Загрузите каждый JSON файл

### database/
Схемы и миграции базы данных PostgreSQL.

**Файлы:**
- `schema.sql` - Полная схема БД с таблицами и данными

**Применение схемы:**
```bash
docker exec -i groomer-postgres-1 psql -U grooming_user grooming_salon < database/schema.sql
```

**migrations/**
Директория для будущих миграций БД.

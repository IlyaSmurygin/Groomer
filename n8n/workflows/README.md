# N8N Workflows для Груминг Салона

Эта папка содержит workflow файлы для N8N, которые обрабатывают логику Telegram бота.

## Список Workflows

### 1. telegram-bot-main.json
**Основной обработчик команд бота**

Функции:
- Прием сообщений от Telegram
- Проверка и регистрация пользователей
- Маршрутизация команд (/start, /book, /services, и т.д.)
- Отправка приветственных сообщений и помощи

Триггер: Telegram Webhook

### 2. appointments-manager.json (создайте сами)
**Управление записями**

Функции:
- Создание новых записей
- Проверка доступности времени
- Показ доступных слотов
- Отмена записей
- Просмотр записей клиента

### 3. notifications.json (создайте сами)
**Система уведомлений**

Функции:
- Отправка напоминаний за 24 часа
- Подтверждение записей
- Уведомления об изменениях

Триггер: Cron (каждый час)

### 4. admin-panel.json (опционально)
**Админ панель**

Функции:
- Просмотр статистики
- Управление записями
- Управление клиентами
- Экспорт данных

## Как импортировать Workflows

### Через UI N8N:

1. Откройте N8N в браузере (http://localhost:5678)
2. Нажмите на кнопку "Import from File" или "+" -> "Import from File"
3. Выберите JSON файл workflow
4. Нажмите "Import"
5. Настройте credentials:
   - Telegram Bot API
   - PostgreSQL Database

### Через CLI:

```bash
# Скопируйте файлы в контейнер N8N
docker cp n8n/workflows/*.json grooming_n8n:/home/node/.n8n/workflows/

# Перезапустите N8N
docker-compose restart n8n
```

## Настройка Credentials

### Telegram Bot API

1. В N8N перейдите в Settings -> Credentials
2. Добавьте "Telegram API"
3. Введите Bot Token от @BotFather
4. Сохраните

### PostgreSQL Database

1. В N8N перейдите в Settings -> Credentials
2. Добавьте "Postgres"
3. Введите данные:
   - Host: postgres
   - Database: grooming_salon
   - User: grooming_user
   - Password: grooming_pass
   - Port: 5432
4. Тест Connection -> Сохранить

## Активация Workflows

После импорта обязательно:

1. Откройте каждый workflow
2. Проверьте все узлы
3. Убедитесь, что credentials настроены
4. Нажмите "Active" для активации

## Тестирование

1. Откройте Telegram
2. Найдите своего бота
3. Отправьте команду /start
4. В N8N откройте вкладку "Executions" для просмотра выполнения

## Структура Workflow

```
Telegram Trigger
    ↓
Check User (PostgreSQL)
    ↓
Route Command (Switch)
    ↓
├── /start → Welcome Message
├── /book → Booking Flow
├── /services → Show Services
├── /myappointments → Show Appointments
├── /addpet → Add Pet Flow
└── /help → Help Message
```

## Переменные окружения в Workflows

Используйте переменные окружения для конфигурации:

- `{{ $env.TELEGRAM_BOT_TOKEN }}` - токен бота
- `{{ $env.SALON_NAME }}` - название салона
- `{{ $env.SALON_PHONE }}` - телефон салона
- `{{ $env.SALON_ADDRESS }}` - адрес салона

## Отладка

### Просмотр логов выполнения:

1. В N8N откройте "Executions"
2. Найдите нужное выполнение
3. Кликните для просмотра деталей

### Ручное тестирование:

1. Откройте workflow
2. Нажмите "Execute Workflow"
3. Введите тестовые данные
4. Просмотрите результаты

## Best Practices

1. **Используйте Error Handling**: Добавляйте узлы для обработки ошибок
2. **Логирование**: Добавляйте узлы для логирования важных действий
3. **Валидация**: Проверяйте входные данные перед обработкой
4. **Кэширование**: Используйте Redis для кэширования частых запросов
5. **Безопасность**: Не храните секреты в workflow, используйте credentials

## Расширение Workflows

### Добавление новой команды:

1. Откройте telegram-bot-main.json
2. Добавьте новый case в Switch узел "Route Command"
3. Создайте обработчик команды
4. Добавьте отправку ответа

### Интеграция с внешними API:

1. Добавьте HTTP Request узел
2. Настройте URL и параметры
3. Обработайте ответ
4. Отправьте результат пользователю

## Бэкап Workflows

```bash
# Создайте бэкап всех workflows
docker exec grooming_n8n tar czf /tmp/workflows-backup.tar.gz /home/node/.n8n/workflows/

# Скопируйте бэкап на хост
docker cp grooming_n8n:/tmp/workflows-backup.tar.gz ./backups/
```

## Поддержка

Документация N8N: https://docs.n8n.io/
Community: https://community.n8n.io/

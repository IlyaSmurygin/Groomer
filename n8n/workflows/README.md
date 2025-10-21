# N8N Workflows для Груминг Салона

Эта папка содержит готовые workflow файлы для N8N, которые обрабатывают логику Telegram бота и автоматизируют процессы салона.

## 📋 Список Workflows

### 1. telegram-bot-main.json ✅
**Основной обработчик команд Telegram бота**

**Функции:**
- Прием сообщений от Telegram
- Автоматическая регистрация новых пользователей
- Маршрутизация команд (/start, /services, /help)
- Отправка приветственных сообщений
- Показ списка услуг

**Триггер:** Telegram Trigger
**Статус:** Готов к использованию

**Узлы:**
1. Telegram Trigger - получение сообщений
2. Check User Exists - проверка пользователя в БД
3. Is New User? - условие для новых пользователей
4. Create User - создание пользователя
5. Extract Data - извлечение данных из сообщения
6. Route Command - маршрутизация по командам
7. Send Welcome - приветствие
8. Get Services - получение услуг из БД
9. Send Services - отправка списка услуг
10. Send Help - справка

### 2. notifications.json ✅
**Автоматические напоминания о записях**

**Функции:**
- Проверка предстоящих записей каждый час
- Отправка напоминаний клиентам за 24 часа
- Отметка отправленных напоминаний
- Логирование уведомлений в БД

**Триггер:** Schedule (каждый час)
**Статус:** Готов к использованию

**Узлы:**
1. Schedule Every Hour - триггер по расписанию
2. Find Appointments for Reminder - поиск записей
3. Has Appointments? - проверка наличия
4. Prepare Message - подготовка сообщения
5. Send Reminder - отправка в Telegram
6. Mark Reminder Sent - отметка в БД
7. Log Notification - сохранение в историю

### 3. admin-stats.json ✅
**Ежедневная статистика для администратора**

**Функции:**
- Сбор статистики за день
- Подсчет клиентов, питомцев, записей
- Расчет дохода за месяц
- Список записей на завтра
- Отправка администратору в Telegram

**Триггер:** Schedule (каждый день в 20:00)
**Статус:** Готов к использованию

**Узлы:**
1. Daily at 20:00 - триггер по расписанию
2. Get Statistics - сбор общей статистики
3. Get Tomorrow Appointments - записи на завтра
4. Merge Data - объединение данных
5. Format Message - форматирование сообщения
6. Send to Admin - отправка администратору

## 🚀 Как импортировать Workflows

### Способ 1: Через UI N8N

1. Откройте N8N в браузере (`http://localhost:5678`)
2. Войдите (admin / admin123 по умолчанию)
3. Нажмите **"+"** в верхнем меню
4. Выберите **"Import from File"**
5. Выберите JSON файл из этой папки
6. Нажмите **"Import"**
7. Повторите для всех workflows

### Способ 2: Через Docker

```bash
# Скопируйте файлы в контейнер N8N
docker cp n8n/workflows/telegram-bot-main.json grooming_n8n:/home/node/.n8n/
docker cp n8n/workflows/notifications.json grooming_n8n:/home/node/.n8n/
docker cp n8n/workflows/admin-stats.json grooming_n8n:/home/node/.n8n/

# Перезапустите N8N
docker-compose restart n8n
```

## ⚙️ Настройка Credentials

Перед активацией workflows настройте credentials:

### Telegram Bot API

1. В N8N: **Settings** → **Credentials** → **New**
2. Найдите **"Telegram API"**
3. Введите **Access Token** (от @BotFather)
4. Нажмите **"Save"**

### PostgreSQL Database

1. В N8N: **Settings** → **Credentials** → **New**
2. Найдите **"Postgres"**
3. Заполните данные:
   ```
   Host: postgres
   Database: grooming_salon
   User: grooming_user
   Password: grooming_pass
   Port: 5432
   SSL: Off
   ```
4. **Test Connection** → **Save**

## ✅ Активация Workflows

После импорта **для каждого workflow**:

1. Откройте workflow
2. Проверьте все узлы (не должно быть красных)
3. Убедитесь, что credentials настроены
4. Нажмите переключатель **"Active"** вверху
5. Workflow начнет работать!

## 📊 Мониторинг

### Просмотр выполнений

1. В N8N откройте **"Executions"** (левое меню)
2. Увидите историю всех запусков
3. Кликните на выполнение для деталей
4. Смотрите входные/выходные данные каждого узла

### Тестирование

**Telegram Bot (telegram-bot-main.json):**
1. Откройте бота в Telegram
2. Отправьте `/start`
3. В N8N → Executions увидите новое выполнение
4. Проверьте, что все узлы зеленые

**Notifications (notifications.json):**
1. Создайте тестовую запись на завтра
2. Дождитесь следующего часа
3. Проверьте, что напоминание отправлено

**Admin Stats (admin-stats.json):**
1. Можно запустить вручную: откройте workflow
2. Нажмите **"Execute Workflow"**
3. Администратор получит статистику в Telegram

## 🔧 Переменные окружения

Workflows используют переменные из `.env`:

```env
TELEGRAM_BOT_TOKEN=your_token        # Токен бота
TELEGRAM_ADMIN_ID=your_id            # ID администратора
SALON_NAME=Груминг Салон             # Название
SALON_ADDRESS=Адрес салона           # Адрес
SALON_PHONE=+7 (999) 123-45-67       # Телефон
```

В N8N доступны через `{{ $env.VARIABLE_NAME }}`

## 🛠 Расширение функционала

### Добавление новой команды в бот

1. Откройте `telegram-bot-main.json`
2. Найдите узел **"Route Command"** (Switch)
3. Добавьте новое правило:
   ```json
   {
     "conditions": {
       "conditions": [{
         "leftValue": "={{ $json.command }}",
         "rightValue": "/yourcommand",
         "operator": {
           "type": "string",
           "operation": "startsWith"
         }
       }]
     },
     "renameOutput": true,
     "outputKey": "yourcommand"
   }
   ```
4. Добавьте обработчик (Telegram node)
5. Соедините через connections

### Добавление нового уведомления

1. Дублируйте `notifications.json`
2. Измените SQL запрос в "Find Appointments"
3. Настройте расписание в Schedule Trigger
4. Измените текст сообщения

### Добавление статистики

1. Откройте `admin-stats.json`
2. Измените SQL в "Get Statistics"
3. Добавьте новые поля в "Format Message"

## 📝 Структура Workflow

### Типичная структура:

```
Trigger (Telegram/Schedule)
    ↓
Database Query (PostgreSQL)
    ↓
Condition Check (IF)
    ↓
Data Processing (Set/Code)
    ↓
Action (Telegram/Database)
    ↓
Logging (PostgreSQL)
```

## 🐛 Отладка

### Workflow не активируется

- Проверьте credentials (должны быть зеленые галочки)
- Убедитесь, что PostgreSQL запущен
- Проверьте, что Telegram token верный

### Узлы красные

- Откройте узел
- Посмотрите ошибку
- Проверьте credentials
- Проверьте SQL запросы

### Сообщения не приходят

- Проверьте Executions - есть ли ошибки
- Проверьте webhook Telegram: `https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo`
- Убедитесь, что workflow Active

### Просмотр данных в узле

1. Запустите workflow
2. Откройте Executions
3. Кликните на выполнение
4. Каждый узел покажет input/output данные

## 💡 Best Practices

1. **Тестируйте перед активацией**
   - Используйте "Execute Workflow"
   - Проверяйте данные на каждом узле

2. **Обработка ошибок**
   - Добавляйте IF узлы для проверок
   - Используйте "Continue On Fail" где нужно

3. **Логирование**
   - Сохраняйте важные события в БД
   - Используйте таблицу notifications

4. **Производительность**
   - Ограничивайте SQL запросы (LIMIT)
   - Используйте индексы в БД
   - Не запускайте тяжелые workflows слишком часто

5. **Безопасность**
   - Не храните токены в workflow
   - Используйте credentials
   - Проверяйте входные данные

## 📦 Бэкап

### Экспорт workflows

```bash
# Через UI: Workflow → ... → Download
# Или через Docker:
docker exec grooming_n8n tar czf /tmp/workflows.tar.gz /home/node/.n8n/
docker cp grooming_n8n:/tmp/workflows.tar.gz ./backup/
```

### Восстановление

```bash
docker cp ./backup/workflows.tar.gz grooming_n8n:/tmp/
docker exec grooming_n8n tar xzf /tmp/workflows.tar.gz -C /
docker-compose restart n8n
```

## 🔗 Полезные ссылки

- [N8N Документация](https://docs.n8n.io/)
- [N8N Community](https://community.n8n.io/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs n8n`
2. Проверьте Executions в UI
3. Посмотрите документацию N8N
4. Создайте issue в репозитории

---

**Все workflows готовы к работе!** 🚀

Для быстрого старта используйте `QUICK_START.md` в корне проекта.

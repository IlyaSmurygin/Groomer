# 🚀 Быстрый старт - Груминг Салон Бот

Минимальная инструкция для запуска за 10 минут!

## Шаг 1: Создайте Telegram бота (2 мин)

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Введите имя: `Груминг Салон`
5. Введите username: `your_salon_bot` (должен заканчиваться на bot)
6. Скопируйте токен (он выглядит так: `1234567890:ABCdef...`)

## Шаг 2: Клонируйте проект (1 мин)

```bash
git clone <url-репозитория>
cd Groomer
```

## Шаг 3: Настройте переменные (2 мин)

```bash
cp .env.example .env
nano .env  # или любой редактор
```

Измените только эти строки:

```env
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
TELEGRAM_ADMIN_ID=ВАШ_TELEGRAM_ID  # Узнайте через @userinfobot
```

Остальное оставьте как есть!

## Шаг 4: Запустите Docker (2 мин)

```bash
docker compose up -d
```

Дождитесь, пока все контейнеры запустятся.

## Шаг 5: Откройте N8N (1 мин)

1. Откройте браузер: http://localhost:5678
2. Войдите:
   - Username: `admin`
   - Password: `admin123`

## Шаг 6: Настройте Credentials в N8N (2 мин)

### Telegram API

1. Settings → Credentials → Add Credential
2. Найдите "Telegram"
3. Access Token: вставьте ваш токен бота
4. Save

### PostgreSQL

1. Settings → Credentials → Add Credential
2. Найдите "Postgres"
3. Введите:
   - Host: `postgres`
   - Database: `grooming_salon`
   - User: `grooming_user`
   - Password: `grooming_pass`
   - Port: `5432`
4. Test Connection
5. Save

## Шаг 7: Импортируйте Workflow (1 мин)

1. В N8N нажмите "+" → "Import from File"
2. Выберите `n8n/workflows/telegram-bot-main.json`
3. Откройте импортированный workflow
4. Проверьте, что все узлы зеленые (credentials настроены)
5. Включите Active (переключатель вверху)

## Шаг 8: Протестируйте! (1 мин)

1. Откройте Telegram
2. Найдите своего бота
3. Отправьте `/start`
4. Бот должен ответить приветствием!

---

## ✅ Готово!

Теперь ваш бот работает локально.

### Что дальше?

- **Попробуйте команды**: `/services`, `/addpet`, `/book`
- **Настройте данные салона** в `.env`
- **Добавьте свои услуги** через PgAdmin (http://localhost:5050)
- **Разверните на сервер** - см. `deploy/beget-setup.md`

## Альтернативный вариант: без N8N

Если хотите запустить только Node.js бота:

```bash
cd bot
npm install
npm start
```

Бот будет работать в режиме polling (без webhook).

## Проблемы?

### Бот не отвечает

```bash
# Проверьте логи
docker compose logs -f n8n

# Проверьте, что workflow активен
# Откройте N8N и проверьте переключатель Active
```

### Ошибка подключения к БД

```bash
# Перезапустите контейнеры
docker compose restart

# Проверьте статус
docker compose ps
```

### Забыли пароль N8N

```bash
# Откройте .env и посмотрите N8N_BASIC_AUTH_PASSWORD
cat .env | grep N8N_BASIC_AUTH_PASSWORD
```

## Полезные команды

```bash
# Просмотр логов
docker compose logs -f

# Остановить все
docker compose down

# Запустить все
docker compose up -d

# Перезапустить
docker compose restart

# Подключиться к базе
docker exec -it grooming_db psql -U grooming_user -d grooming_salon
```

## Следующие шаги

1. **Кастомизация**: Измените данные салона в `.env`
2. **Добавьте услуги**: Отредактируйте `database/schema.sql`
3. **Развертывание**: Следуйте `deploy/beget-setup.md`
4. **Расширение**: Добавьте свои workflows в N8N

Удачи! 🐾🤖

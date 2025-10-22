# 🐾 Груминг Салон - Telegram Бот для записи клиентов

Автоматизированная система записи клиентов в груминг салон через Telegram бота с использованием N8N в качестве оркестратора.

## 🏗 Архитектура

```
┌─────────────────┐
│  Telegram Bot   │  ← Точка входа для клиентов
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      N8N        │  ← Оркестратор workflow
│   (Workflows)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL/    │  ← База данных
│    SQLite       │
└─────────────────┘
```

### Компоненты системы:

1. **Telegram Bot** - интерфейс взаимодействия с клиентами
2. **N8N** - автоматизация бизнес-процессов
3. **База данных** - хранение данных (клиенты, питомцы, записи)
4. **Webhook сервер** - обработка запросов от Telegram
5. **Beget** - облачный хостинг для развертывания

## 📋 Возможности

### Для клиентов (через Telegram):
- 📝 Регистрация в системе
- 🐕 Добавление информации о питомцах
- 📅 Запись на процедуры
- 📋 Просмотр доступных услуг
- 🕐 Выбор даты и времени
- ✏️ Управление своими записями
- 🔔 Уведомления о записях

### Для администратора:
- 👥 Просмотр всех клиентов
- 📊 Статистика и аналитика
- 📆 Управление календарем записей
- ✅ Подтверждение/отмена записей

## 🛠 Технологии

- **Telegram Bot API** - интерфейс бота
- **N8N** - workflow automation
- **PostgreSQL** - основная база данных
- **Node.js** - runtime для webhook сервера
- **Docker** - контейнеризация
- **Beget** - облачный хостинг

## 📁 Структура проекта

```
Groomer/
├── src/                        # Исходный код
│   ├── bot/                   # Telegram бот (Node.js + Grammy)
│   │   ├── index.js           # Главный файл бота
│   │   └── package.json       # Зависимости
│   ├── workflows/             # N8N workflows
│   │   ├── telegram-bot-main.json    # Обработчик команд
│   │   ├── notifications.json        # Автоматические напоминания
│   │   └── admin-stats.json          # Ежедневная статистика
│   └── database/              # База данных
│       ├── schema.sql         # Полная схема PostgreSQL
│       └── migrations/        # Будущие миграции
│
├── docs/                       # Документация
│   ├── deployment/            # Инструкции по развертыванию
│   │   ├── beget-setup.md    # Развертывание на Beget VPS
│   │   └── bot-setup.md      # Настройка Telegram бота
│   ├── workflows/             # Документация workflows
│   │   ├── README.md         # Описание workflows
│   │   └── AUDIT_REPORT.md   # Отчет о проверке
│   └── architecture/          # Архитектура системы
│       └── SYSTEM_OVERVIEW.md # Обзор архитектуры
│
├── config/                     # Конфигурация
│   ├── docker/                # Docker конфигурация
│   │   └── docker-compose.yml # Все сервисы
│   ├── env/                   # Переменные окружения
│   │   └── .env.example      # Пример конфигурации
│   └── nginx/                 # Nginx конфигурация
│       └── n8n.conf          # Reverse proxy для N8N
│
├── scripts/                    # Вспомогательные скрипты
│   ├── setup/                 # Настройка проекта
│   │   └── init-project.sh   # Инициализация
│   ├── backup/                # Резервное копирование
│   │   ├── backup-database.sh    # Бэкап БД
│   │   └── restore-database.sh   # Восстановление
│   └── maintenance/           # Обслуживание
│       └── cleanup.sh        # Очистка временных файлов
│
├── tests/                      # Тесты
│   ├── bot/                   # Тесты бота
│   └── workflows/             # Тесты workflows
│
├── README.md                   # Этот файл
├── QUICK_START.md             # Быстрый старт
└── LICENSE                    # Лицензия MIT
```

> 📘 Каждая директория содержит собственный README.md с подробным описанием.

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Telegram Bot Token (от @BotFather)
- Аккаунт на Beget (для продакшена)

### Автоматическая настройка (рекомендуется)

```bash
# 1. Клонируйте репозиторий
git clone <repo-url>
cd Groomer

# 2. Запустите скрипт инициализации
./scripts/setup/init-project.sh

# 3. Отредактируйте .env файл
nano config/env/.env
# Добавьте TELEGRAM_BOT_TOKEN и другие параметры

# 4. Запустите все сервисы
cd config/docker
docker-compose up -d

# 5. Примените схему БД
docker exec -i groomer-postgres-1 psql -U grooming_user grooming_salon < ../../src/database/schema.sql

# 6. Импортируйте workflows в N8N
# Откройте http://localhost:5678
# Импортируйте файлы из src/workflows/
```

### Ручная настройка

1. **Клонируйте репозиторий**
```bash
git clone <repo-url>
cd Groomer
```

2. **Настройте переменные окружения**
```bash
cp config/env/.env.example config/env/.env
# Отредактируйте config/env/.env и добавьте:
# TELEGRAM_BOT_TOKEN=your_token_from_botfather
# N8N_BASIC_AUTH_USER=admin
# N8N_BASIC_AUTH_PASSWORD=secure_password
# POSTGRES_PASSWORD=secure_db_password
```

3. **Запустите через Docker Compose**
```bash
cd config/docker
docker-compose up -d
```

4. **Примените схему базы данных**
```bash
docker exec -i groomer-postgres-1 psql -U grooming_user grooming_salon < ../../src/database/schema.sql
```

5. **Откройте N8N и импортируйте workflows**
```
http://localhost:5678
Логин: admin
Пароль: (из .env файла)
```

Импортируйте файлы из `src/workflows/`:
- telegram-bot-main.json
- notifications.json
- admin-stats.json

### Команды бота

#### Для клиентов:
- `/start` - Начало работы с ботом
- `/register` - Регистрация в системе
- `/addpet` - Добавить питомца
- `/book` - Записаться на процедуру
- `/services` - Список услуг
- `/myappointments` - Мои записи
- `/cancel` - Отменить запись
- `/help` - Помощь

#### Для администратора:
- `/admin` - Админ панель
- `/stats` - Статистика
- `/appointments` - Все записи
- `/clients` - Список клиентов

## 💾 База данных

### Таблицы:

1. **clients** - Клиенты салона
2. **pets** - Питомцы клиентов
3. **services** - Каталог услуг
4. **appointments** - Записи на процедуры
5. **time_slots** - Временные слоты
6. **notifications** - История уведомлений

Подробная схема в файле `database/schema.sql`

## 🔧 N8N Workflows

> 📂 Все workflows находятся в `src/workflows/`
> 📖 Подробная документация в `docs/workflows/`

### 1. telegram-bot-main.json
Основной workflow обработки команд бота:
- Получение сообщений через Telegram Trigger
- Автоматическая регистрация новых пользователей
- Маршрутизация команд (/start, /services, /help)
- Получение данных из БД и форматирование ответов
- Отправка сообщений клиентам

### 2. notifications.json
Автоматические напоминания о записях:
- Запуск: ежедневно в 10:00 (Schedule Trigger)
- Выборка записей на завтра
- Форматирование персонализированных сообщений
- Отправка напоминаний через Telegram
- Обновление флага reminder_sent в БД

### 3. admin-stats.json
Ежедневная статистика для администратора:
- Запуск: ежедневно в 20:00 (Schedule Trigger)
- Сбор общей статистики по записям
- Получение списка завтрашних записей
- Форматирование детального отчета
- Отправка администратору в Telegram

> ✅ Все workflows проверены и исправлены (см. `docs/workflows/AUDIT_REPORT.md`)

## 🌐 Развертывание на Beget

> 📖 **Полная инструкция:** `docs/deployment/beget-setup.md`

### Краткое руководство

1. **Подготовка VPS**
   - Закажите VPS на Beget
   - Установите Docker и Docker Compose

2. **Клонирование проекта**
   ```bash
   git clone <repo-url>
   cd Groomer
   ```

3. **Конфигурация**
   ```bash
   cp config/env/.env.example config/env/.env
   nano config/env/.env
   # Укажите токен бота и пароли
   ```

4. **Запуск сервисов**
   ```bash
   cd config/docker
   docker-compose up -d
   ```

5. **Инициализация БД**
   ```bash
   docker exec -i groomer-postgres-1 psql -U grooming_user grooming_salon < ../../src/database/schema.sql
   ```

6. **Настройка Nginx + SSL**
   ```bash
   sudo cp config/nginx/n8n.conf /etc/nginx/sites-available/
   sudo certbot --nginx -d n8n.yourdomain.com
   ```

7. **Импорт workflows**
   - Откройте https://n8n.yourdomain.com
   - Импортируйте файлы из `src/workflows/`
   - Настройте Telegram credentials

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Резервное копирование БД
./scripts/backup/backup-database.sh

# Обновление проекта
git pull && cd config/docker && docker-compose restart
```

## 🎯 Workflow процесс записи

1. Клиент отправляет `/book` в Telegram
2. Бот запрашивает выбор питомца
3. Бот показывает доступные услуги
4. Клиент выбирает дату
5. Бот показывает свободные слоты
6. Клиент выбирает время
7. N8N проверяет доступность
8. Создается запись в БД
9. Клиент получает подтверждение
10. За 24 часа отправляется напоминание

## 📊 Каталог услуг

1. **Стрижка** - 2000₽, 60 мин
2. **Мытье и сушка** - 1000₽, 45 мин
3. **Тримминг** - 2500₽, 90 мин
4. **Стрижка когтей** - 300₽, 15 мин
5. **Чистка ушей** - 400₽, 20 мин
6. **Комплексный уход** - 3500₽, 120 мин
7. **Экспресс линька** - 1500₽, 60 мин
8. **SPA процедуры** - 3000₽, 90 мин

## 🔐 Безопасность

- Используйте webhook вместо polling для production
- Настройте SSL сертификат
- Храните секреты в переменных окружения
- Регулярно делайте бэкапы БД
- Ограничьте доступ к N8N админ панели

## 🐛 Отладка

### Просмотр логов
```bash
# Все сервисы
cd config/docker && docker-compose logs -f

# Только N8N
docker-compose logs -f n8n

# Только PostgreSQL
docker-compose logs -f postgres
```

### Подключение к БД
```bash
# Через psql
docker exec -it groomer-postgres-1 psql -U grooming_user grooming_salon

# Через pgAdmin
# Откройте http://localhost:5050
```

### Тестирование workflows
1. Откройте N8N (http://localhost:5678)
2. Выберите workflow
3. Нажмите "Execute Workflow"
4. Проверьте результаты каждой ноды

## 📈 Мониторинг

- **N8N**: Встроенная панель выполнения workflows с историей
- **PostgreSQL**: pgAdmin для мониторинга БД
- **Логи**: Автоматическое сохранение в директории `logs/`
- **Бэкапы**: Автоматическое удаление старше 30 дней

## 🔄 Обновление

```bash
# Остановка сервисов
cd config/docker
docker-compose down

# Получение обновлений
git pull

# Перезапуск с обновлениями
docker-compose up -d --build

# Проверка статуса
docker-compose ps
```

## 📚 Дополнительная документация

- **[Быстрый старт](QUICK_START.md)** - Сокращенная версия для быстрого запуска
- **[Архитектура системы](docs/architecture/SYSTEM_OVERVIEW.md)** - Детальное описание архитектуры
- **[Развертывание на Beget](docs/deployment/beget-setup.md)** - Полная инструкция по деплою
- **[Настройка Telegram бота](docs/deployment/bot-setup.md)** - Конфигурация бота
- **[Документация workflows](docs/workflows/README.md)** - Описание N8N workflows
- **[Отчет об аудите](docs/workflows/AUDIT_REPORT.md)** - Проверка и исправления workflows
- **[Скрипты](scripts/README.md)** - Вспомогательные скрипты для управления
- **[Конфигурация](config/README.md)** - Настройка окружения
- **[Исходный код](src/README.md)** - Структура кодовой базы
- **[Тесты](tests/README.md)** - Информация о тестировании

## 📝 Примеры использования

### Регистрация нового клиента
```
Клиент: /start
Бот: Добро пожаловать! Пожалуйста, отправьте ваше имя
Клиент: Иван Иванов
Бот: Отлично! Теперь отправьте ваш номер телефона
Клиент: +79991234567
Бот: Регистрация завершена! Теперь добавьте питомца /addpet
```

### Запись на процедуру
```
Клиент: /book
Бот: Выберите питомца: [Барсик] [Мурзик]
Клиент: Барсик
Бот: Выберите услугу: [Стрижка] [Мытье] [Комплекс]
Клиент: Стрижка
Бот: Выберите дату: [Сегодня] [Завтра] [Выбрать дату]
...
```

## 🤝 Поддержка

Для вопросов и предложений создавайте issue в репозитории.

## 📄 Лицензия

MIT License

---

**Разработано с использованием N8N и Telegram Bot API** 🤖✨
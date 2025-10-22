# Структура проекта Grooming Salon

> Подробное описание организации файлов и директорий

## Обзор

Проект организован в соответствии с современными best practices разработки, с четким разделением исходного кода, конфигурации, документации и вспомогательных скриптов.

## Корневая структура

```
Groomer/
├── src/                # Исходный код приложения
├── docs/               # Документация проекта
├── config/             # Конфигурационные файлы
├── scripts/            # Вспомогательные скрипты
├── tests/              # Тесты
├── README.md           # Основная документация
├── PROJECT_STRUCTURE.md  # Этот файл
├── QUICK_START.md      # Быстрый старт
├── LICENSE             # Лицензия MIT
└── .gitignore          # Git ignore правила
```

## Детальная структура

### 📂 src/ - Исходный код

Содержит весь исполняемый код приложения.

```
src/
├── bot/                    # Telegram Bot (Node.js)
│   ├── index.js           # Главный файл с обработчиками команд
│   ├── package.json       # NPM зависимости
│   └── README.md          # Документация бота
│
├── workflows/              # N8N Workflows (JSON)
│   ├── telegram-bot-main.json   # Основной workflow
│   ├── notifications.json        # Уведомления клиентам
│   ├── admin-stats.json          # Статистика для админа
│   └── README.md                 # Описание workflows
│
└── database/               # База данных
    ├── schema.sql         # Полная схема PostgreSQL
    │                      # - clients (клиенты)
    │                      # - pets (питомцы)
    │                      # - services (услуги)
    │                      # - appointments (записи)
    ├── migrations/        # Будущие миграции БД
    └── README.md          # Документация по БД
```

**Назначение:**
- `bot/` - Standalone Telegram бот на Grammy framework
- `workflows/` - N8N workflow определения для автоматизации
- `database/` - SQL схемы и миграции

### 📂 docs/ - Документация

Вся документация проекта, включая deployment guides и архитектуру.

```
docs/
├── deployment/                    # Инструкции по развертыванию
│   ├── beget-setup.md            # Полное руководство для Beget VPS
│   │                             # - Установка Docker
│   │                             # - Настройка SSL
│   │                             # - Конфигурация Nginx
│   └── bot-setup.md              # Настройка Telegram бота
│
├── workflows/                     # Документация N8N workflows
│   ├── README.md                 # Описание всех workflows
│   └── AUDIT_REPORT.md           # Отчет о проверке и исправлениях
│                                 # (24 проблемы исправлены)
│
├── architecture/                  # Архитектурная документация
│   └── SYSTEM_OVERVIEW.md        # Обзор системы
│                                 # - Диаграммы
│                                 # - Потоки данных
│                                 # - Компоненты
│
└── README.md                      # Индекс документации
```

**Назначение:**
- `deployment/` - Пошаговые инструкции по развертыванию
- `workflows/` - Техническая документация N8N workflows
- `architecture/` - Архитектурные решения и диаграммы

### 📂 config/ - Конфигурация

Все конфигурационные файлы для различных сервисов.

```
config/
├── docker/                        # Docker конфигурация
│   └── docker-compose.yml        # Все сервисы:
│                                 # - postgres (БД)
│                                 # - n8n (автоматизация)
│                                 # - redis (кэширование)
│                                 # - pgadmin (управление БД)
│
├── env/                           # Переменные окружения
│   └── .env.example              # Шаблон с примерами:
│                                 # - TELEGRAM_BOT_TOKEN
│                                 # - N8N credentials
│                                 # - PostgreSQL настройки
│   # .env - создается локально
│
├── nginx/                         # Nginx конфигурация
│   └── n8n.conf                  # Reverse proxy для N8N
│                                 # - SSL настройки
│                                 # - WebSocket поддержка
│                                 # - Таймауты
│
└── README.md                      # Документация конфигов
```

**Назначение:**
- `docker/` - Оркестрация всех контейнеров
- `env/` - Секретные данные и параметры окружения
- `nginx/` - Веб-сервер и reverse proxy конфигурация

### 📂 scripts/ - Вспомогательные скрипты

Автоматизация рутинных операций.

```
scripts/
├── setup/                         # Инициализация проекта
│   └── init-project.sh           # Автоматическая настройка:
│                                 # - Проверка Docker
│                                 # - Создание .env
│                                 # - Установка прав
│                                 # - npm install
│
├── backup/                        # Резервное копирование
│   ├── backup-database.sh        # Создание бэкапа БД:
│   │                             # - Дамп PostgreSQL
│   │                             # - Сжатие gzip
│   │                             # - Ротация (30 дней)
│   └── restore-database.sh       # Восстановление из бэкапа:
│                                 # - Подтверждение
│                                 # - Распаковка
│                                 # - Импорт в БД
│
├── maintenance/                   # Обслуживание
│   └── cleanup.sh                # Очистка проекта:
│                                 # - Удаление старых логов
│                                 # - Очистка tmp файлов
│                                 # - npm cache clean
│                                 # - Docker prune
│
└── README.md                      # Документация скриптов
```

**Назначение:**
- `setup/` - Быстрый запуск для новых установок
- `backup/` - Защита данных и disaster recovery
- `maintenance/` - Поддержание чистоты проекта

### 📂 tests/ - Тесты

Директория для будущих тестов.

```
tests/
├── bot/                           # Тесты Telegram бота
│   # Планируется:
│   # - Тесты команд
│   # - Валидация данных
│   # - Моки Telegram API
│
├── workflows/                     # Тесты N8N workflows
│   # Планируется:
│   # - Тесты логики
│   # - SQL запросы
│   # - Форматирование
│
└── README.md                      # Гайд по тестированию
```

**Назначение:**
- Структура подготовлена для будущего покрытия тестами
- README содержит рекомендации по фреймворкам (Jest, Supertest)

## Ключевые файлы

### В корне проекта

| Файл | Назначение |
|------|-----------|
| `README.md` | Главная документация с обзором проекта |
| `PROJECT_STRUCTURE.md` | Детальное описание структуры (этот файл) |
| `QUICK_START.md` | Сокращенное руководство для быстрого старта |
| `LICENSE` | MIT лицензия |
| `.gitignore` | Исключения для Git (node_modules, .env, logs) |

### Важные конфигурационные файлы

| Файл | Назначение |
|------|-----------|
| `config/docker/docker-compose.yml` | Определение всех Docker сервисов |
| `config/env/.env.example` | Шаблон переменных окружения |
| `config/nginx/n8n.conf` | Nginx конфигурация для production |

### Основной исполняемый код

| Файл | Назначение |
|------|-----------|
| `src/bot/index.js` | Telegram бот с обработчиками команд |
| `src/database/schema.sql` | Полная схема PostgreSQL БД |
| `src/workflows/*.json` | N8N workflow определения |

## Соглашения

### Именование директорий
- Все директории в lowercase
- Используем дефисы для разделения слов (kebab-case)
- README.md в каждой важной директории

### Структура файлов
- Исходный код → `src/`
- Конфигурация → `config/`
- Документация → `docs/`
- Скрипты → `scripts/`
- Тесты → `tests/`

### Git
- `.env` файлы никогда не коммитятся
- `node_modules/` исключены
- `logs/` и `data/` в .gitignore

## Зависимости

### Прямые зависимости

**Telegram Bot (src/bot/):**
- `grammy` - Telegram bot framework
- `pg` - PostgreSQL клиент
- `dotenv` - Загрузка .env

**N8N Workflows:**
- Не требуют установки (импортируются в N8N)

### Инфраструктурные зависимости

**Через Docker:**
- PostgreSQL 15-alpine
- N8N latest
- Redis 7-alpine
- pgAdmin 4 latest

## Развертывание

### Локальная разработка
```bash
./scripts/setup/init-project.sh
cd config/docker && docker-compose up -d
```

### Production (Beget)
См. `docs/deployment/beget-setup.md`

## Расширение структуры

### Добавление новых компонентов

**Новый микросервис:**
```
src/
└── service-name/
    ├── index.js
    ├── package.json
    └── README.md
```

**Новый workflow:**
```
src/workflows/
└── new-workflow.json

docs/workflows/
└── new-workflow-guide.md
```

**Новый скрипт:**
```
scripts/
└── category/
    ├── script-name.sh
    └── README.md (обновить)
```

## Резервное копирование

### Критичные данные

1. **База данных** - `./scripts/backup/backup-database.sh`
2. **Переменные окружения** - `config/env/.env` (ручное резервирование)
3. **N8N credentials** - Экспорт из N8N UI

### Восстановление

```bash
# БД
./scripts/backup/restore-database.sh backups/file.sql.gz

# Workflows
# Импорт через N8N UI из src/workflows/
```

## Лучшие практики

### При работе с проектом

1. **Всегда** используйте `git mv` для перемещения файлов
2. **Никогда** не коммитьте `.env` файлы
3. **Обновляйте** README.md при добавлении новых файлов
4. **Документируйте** все скрипты и workflows
5. **Тестируйте** изменения локально перед деплоем

### Безопасность

- Секреты только в `.env`
- `.env` в `.gitignore`
- SSL для production
- Регулярные бэкапы БД

## Дополнительная информация

Для более подробной информации см.:
- [README.md](README.md) - Обзор проекта
- [QUICK_START.md](QUICK_START.md) - Быстрый старт
- [docs/](docs/) - Вся документация
- Каждая директория имеет свой README.md

---

**Последнее обновление:** 2025-10-22
**Версия структуры:** 2.0 (После реорганизации)

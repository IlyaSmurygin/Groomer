# config/

Конфигурационные файлы проекта.

## Структура

### docker/
Docker Compose конфигурация для всех сервисов.

**Файлы:**
- `docker-compose.yml` - Описание всех контейнеров (PostgreSQL, N8N, Redis, pgAdmin)

**Запуск:**
```bash
cd docker
docker-compose up -d
```

**Остановка:**
```bash
docker-compose down
```

### env/
Переменные окружения.

**Файлы:**
- `.env.example` - Пример файла с переменными окружения
- `.env` - Актуальные переменные (не коммитится в git)

**Настройка:**
```bash
cp .env.example .env
# Отредактируйте .env своими значениями
```

**Переменные:**
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота от @BotFather
- `POSTGRES_*` - Параметры подключения к БД
- `N8N_*` - Настройки N8N
- `WEBHOOK_URL` - URL для вебхуков Telegram

### nginx/
Конфигурация Nginx для reverse proxy.

**Файлы:**
- `n8n.conf` - Конфигурация для N8N с SSL

**Установка:**
```bash
sudo cp nginx/n8n.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/n8n.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

# Развертывание Груминг Салона на Beget

Подробная инструкция по развертыванию Telegram бота с N8N на облачном сервере Beget.

## Требования

- VPS тариф на Beget (минимум 1GB RAM)
- Домен (опционально, для SSL)
- Telegram Bot Token
- SSH доступ к серверу

## Шаг 1: Заказ и настройка VPS на Beget

### 1.1 Заказ VPS

1. Перейдите на https://beget.com/ru/vps
2. Выберите подходящий тариф (рекомендуется START или OPTIMAL)
3. Оформите заказ
4. Дождитесь письма с данными доступа

### 1.2 Первоначальная настройка

После получения доступа к VPS:

```bash
# Подключитесь по SSH
ssh root@your-server-ip

# Обновите систему
apt update && apt upgrade -y

# Установите необходимые пакеты
apt install -y git curl wget nano htop
```

## Шаг 2: Установка Docker и Docker Compose

### 2.1 Установка Docker

```bash
# Удалите старые версии (если есть)
apt remove docker docker-engine docker.io containerd runc

# Установите зависимости
apt install -y ca-certificates curl gnupg lsb-release

# Добавьте GPG ключ Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавьте репозиторий Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установите Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверьте установку
docker --version
docker compose version
```

### 2.2 Настройка Docker

```bash
# Запустите Docker
systemctl start docker
systemctl enable docker

# Проверьте статус
systemctl status docker
```

## Шаг 3: Клонирование проекта

```bash
# Создайте директорию для проектов
mkdir -p /var/www
cd /var/www

# Клонируйте репозиторий
git clone https://github.com/your-username/Groomer.git
cd Groomer

# Или если у вас уже есть архив
# scp -r ./Groomer root@your-server-ip:/var/www/
```

## Шаг 4: Создание Telegram бота

### 4.1 Создание бота через BotFather

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте команду `/newbot`
4. Следуйте инструкциям:
   - Введите имя бота (например: "Груминг Салон")
   - Введите username бота (например: "grooming_salon_bot")
5. Скопируйте полученный токен (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 4.2 Настройка вебхука (потом, после запуска N8N)

```bash
# Установите webhook (замените YOUR_TOKEN и YOUR_DOMAIN)
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://YOUR_DOMAIN/webhook/telegram"
```

## Шаг 5: Настройка переменных окружения

```bash
cd /var/www/Groomer

# Скопируйте пример
cp .env.example .env

# Отредактируйте файл
nano .env
```

Заполните следующие переменные:

```env
# Ваш токен от BotFather
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Ваш Telegram ID (узнайте через @userinfobot)
TELEGRAM_ADMIN_ID=123456789

# База данных (оставьте как есть для Docker)
DATABASE_URL=postgresql://grooming_user:grooming_pass@postgres:5432/grooming_salon

# Смените пароли!
DB_PASSWORD=your_strong_password_here
N8N_BASIC_AUTH_PASSWORD=your_admin_password_here

# URL вашего сервера (если есть домен)
WEBHOOK_URL=https://yourdomain.com/

# Данные салона
SALON_NAME=Ваш Груминг Салон
SALON_ADDRESS=Москва, ул. Примерная, д. 1
SALON_PHONE=+7 (999) 123-45-67
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X)

## Шаг 6: Запуск приложения

### 6.1 Запуск через Docker Compose

```bash
# Находясь в директории проекта
cd /var/www/Groomer

# Запустите контейнеры
docker compose up -d

# Проверьте статус
docker compose ps

# Проверьте логи
docker compose logs -f
```

### 6.2 Проверка работоспособности

```bash
# Проверьте, что контейнеры запущены
docker ps

# Должны быть запущены:
# - grooming_db (PostgreSQL)
# - grooming_n8n (N8N)
# - grooming_redis (Redis)
# - grooming_pgadmin (PgAdmin)
```

## Шаг 7: Настройка N8N

### 7.1 Доступ к N8N

1. Откройте в браузере: `http://your-server-ip:5678`
2. Войдите с учетными данными из .env:
   - Username: admin
   - Password: (ваш пароль из N8N_BASIC_AUTH_PASSWORD)

### 7.2 Импорт Workflows

1. В N8N нажмите "Import from File"
2. Выберите файлы из `n8n/workflows/`:
   - telegram-bot-main.json
   - (другие workflows)
3. Для каждого workflow:
   - Откройте workflow
   - Проверьте все узлы
   - Активируйте workflow (переключатель Active)

### 7.3 Настройка Credentials

#### Telegram API

1. Settings → Credentials → Add Credential
2. Выберите "Telegram API"
3. Введите Bot Token из .env
4. Сохраните

#### PostgreSQL

1. Settings → Credentials → Add Credential
2. Выберите "Postgres"
3. Введите данные:
   ```
   Host: postgres
   Database: grooming_salon
   User: grooming_user
   Password: (из .env DB_PASSWORD)
   Port: 5432
   ```
4. Test Connection → Save

## Шаг 8: Настройка Nginx (для production)

### 8.1 Установка Nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 8.2 Создание конфигурации

```bash
nano /etc/nginx/sites-available/grooming
```

Вставьте конфигурацию:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook/ {
        proxy_pass http://localhost:5678/webhook/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 8.3 Активация конфигурации

```bash
# Создайте символическую ссылку
ln -s /etc/nginx/sites-available/grooming /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t

# Перезапустите Nginx
systemctl restart nginx
```

## Шаг 9: Установка SSL сертификата

```bash
# Получите SSL сертификат от Let's Encrypt
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями
# - Выберите редирект с HTTP на HTTPS (опция 2)

# Проверьте автообновление
certbot renew --dry-run
```

## Шаг 10: Настройка Webhook для Telegram

```bash
# После настройки SSL установите webhook
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://yourdomain.com/webhook/telegram"

# Проверьте статус webhook
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"
```

## Шаг 11: Инициализация базы данных

```bash
# Подключитесь к контейнеру PostgreSQL
docker exec -it grooming_db psql -U grooming_user -d grooming_salon

# Проверьте, что таблицы созданы
\dt

# Проверьте услуги
SELECT * FROM services;

# Выйдите
\q
```

## Шаг 12: Тестирование

### 12.1 Проверка бота

1. Откройте Telegram
2. Найдите своего бота по username
3. Отправьте `/start`
4. Проверьте, что бот отвечает

### 12.2 Проверка N8N

1. Откройте N8N: https://yourdomain.com
2. Перейдите в Executions
3. Проверьте, что workflow выполняются

### 12.3 Проверка базы данных

```bash
# Откройте PgAdmin: http://your-server-ip:5050
# Войдите с учетными данными:
# Email: admin@grooming.local
# Password: admin123

# Подключитесь к базе и проверьте данные
```

## Шаг 13: Мониторинг и логи

### 13.1 Просмотр логов

```bash
# Логи всех контейнеров
docker compose logs -f

# Логи конкретного контейнера
docker compose logs -f n8n
docker compose logs -f postgres

# Последние 100 строк
docker compose logs --tail=100 n8n
```

### 13.2 Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
df -h
docker system df
```

## Шаг 14: Резервное копирование

### 14.1 Бэкап базы данных

Создайте скрипт для автоматического бэкапа:

```bash
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

docker exec grooming_db pg_dump -U grooming_user grooming_salon > \
  $BACKUP_DIR/grooming_backup_$DATE.sql

# Удалите старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: grooming_backup_$DATE.sql"
```

```bash
# Сделайте скрипт исполняемым
chmod +x /root/backup-db.sh

# Добавьте в cron (каждый день в 3:00)
crontab -e
# Добавьте строку:
0 3 * * * /root/backup-db.sh
```

## Шаг 15: Обновление приложения

```bash
# Перейдите в директорию проекта
cd /var/www/Groomer

# Получите обновления
git pull

# Пересоберите и перезапустите контейнеры
docker compose down
docker compose up -d --build

# Проверьте статус
docker compose ps
```

## Troubleshooting

### Проблема: N8N не запускается

```bash
# Проверьте логи
docker compose logs n8n

# Проверьте, что PostgreSQL работает
docker compose ps postgres
docker compose logs postgres

# Пересоздайте контейнер
docker compose down n8n
docker compose up -d n8n
```

### Проблема: Бот не отвечает

```bash
# Проверьте webhook
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"

# Проверьте логи N8N
docker compose logs -f n8n

# Переустановите webhook
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/deleteWebhook"
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://yourdomain.com/webhook/telegram"
```

### Проблема: Недостаточно памяти

```bash
# Проверьте использование памяти
free -h
docker stats

# Увеличьте swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Проблема: Ошибка подключения к базе

```bash
# Проверьте, что PostgreSQL запущен
docker compose ps postgres

# Перезапустите PostgreSQL
docker compose restart postgres

# Проверьте логи
docker compose logs postgres

# Проверьте подключение из N8N
docker exec -it grooming_n8n ping postgres
```

## Безопасность

### Рекомендации:

1. **Смените все пароли по умолчанию**
2. **Настройте файрвол:**

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

3. **Ограничьте доступ к N8N**:
   - Используйте сложные пароли
   - Настройте IP whitelist в Nginx

4. **Регулярно обновляйте систему:**

```bash
apt update && apt upgrade -y
```

5. **Настройте автоматические бэкапы**

## Полезные команды

```bash
# Перезапуск всех контейнеров
docker compose restart

# Остановка приложения
docker compose down

# Запуск приложения
docker compose up -d

# Просмотр статуса
docker compose ps

# Очистка неиспользуемых данных
docker system prune -a

# Экспорт базы данных
docker exec grooming_db pg_dump -U grooming_user grooming_salon > backup.sql

# Импорт базы данных
docker exec -i grooming_db psql -U grooming_user grooming_salon < backup.sql
```

## Поддержка

При возникновении проблем:

1. Проверьте логи контейнеров
2. Проверьте документацию Beget
3. Проверьте документацию N8N
4. Создайте issue в репозитории проекта

---

**Удачного развертывания!** 🚀

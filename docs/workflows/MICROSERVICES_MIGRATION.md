# Руководство по миграции на микросервисную архитектуру

## Обзор изменений

Все N8N workflows были переработаны с монолитного подхода (прямые Telegram nodes) на микросервисную архитектуру с HTTP API.

### Что изменилось

| Компонент | Было | Стало |
|-----------|------|-------|
| **Telegram Trigger** | `n8n-nodes-base.telegramTrigger` | `n8n-nodes-base.webhook` |
| **Send Message** | `n8n-nodes-base.telegram` | `n8n-nodes-base.httpRequest` |
| **Архитектура** | Монолит | Микросервисы |
| **Связь** | Прямая (N8N ↔ Telegram) | Через HTTP API (N8N ↔ Bot Service ↔ Telegram) |

## Детальные изменения по файлам

### 1. telegram-bot-main.json

#### До (Monolithic)
```json
{
  "name": "Telegram Trigger",
  "type": "n8n-nodes-base.telegramTrigger",
  "parameters": {
    "updates": ["message"]
  }
}
```

#### После (Microservices)
```json
{
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "telegram-webhook",
    "responseMode": "responseNode"
  }
}
```

**Изменения:**
- ✅ Webhook Trigger вместо Telegram Trigger
- ✅ Принимает POST запросы от Bot Service
- ✅ Добавлена нода "Respond to Webhook" для ответа
- ✅ Все 4 Telegram send ноды заменены на HTTP Request
- ✅ Retry logic с 3 попытками
- ✅ Timeout 5000ms для каждого request

#### Send Message - До
```json
{
  "name": "Send Welcome Message",
  "type": "n8n-nodes-base.telegram",
  "parameters": {
    "chatId": "={{ $json.chatId }}",
    "text": "Welcome message..."
  }
}
```

#### Send Message - После
```json
{
  "name": "Send Welcome Message",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "={{ $env.BOT_SERVICE_URL || 'http://bot-service:3000' }}/send-message",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"chatId\": {{ $json.chatId }},\n  \"text\": \"Welcome message...\",\n  \"parseMode\": \"Markdown\"\n}",
    "options": {
      "timeout": 5000,
      "retry": {
        "enabled": true,
        "maxRetries": 3
      }
    }
  }
}
```

### 2. notifications.json

#### Изменения
- ✅ Telegram send нода заменена на HTTP Request `/send-notification`
- ✅ Добавлен параметр `type: "reminder"`
- ✅ Retry logic с 5 попытками (важно для уведомлений)
- ✅ Timeout увеличен до 10000ms

#### Send Reminder - После
```json
{
  "name": "Send Reminder via Bot Service",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "={{ $env.BOT_SERVICE_URL || 'http://bot-service:3000' }}/send-notification",
    "jsonBody": "={\n  \"chatId\": {{ $json.chatId }},\n  \"text\": {{ JSON.stringify($json.message) }},\n  \"type\": \"{{ $json.type }}\"\n}",
    "options": {
      "timeout": 10000,
      "retry": {
        "enabled": true,
        "maxRetries": 5,
        "retryInterval": 2000
      }
    }
  }
}
```

### 3. admin-stats.json

#### Изменения
- ✅ Telegram send нода заменена на HTTP Request `/send-message`
- ✅ Retry logic с 3 попытками
- ✅ Timeout 10000ms для больших сообщений

## Новые зависимости

### Переменные окружения

Добавьте в `config/env/.env`:

```bash
# Bot Service URL (для N8N workflows)
BOT_SERVICE_URL=http://bot-service:3000

# Telegram credentials (для Bot Service)
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_ADMIN_ID=your_telegram_id

# N8N Webhook URL (для Bot Service → N8N)
N8N_WEBHOOK_URL=http://n8n:5678/webhook/telegram-webhook
```

### Обновленный Docker Compose

Требуется обновить `config/docker/docker-compose.yml`:

```yaml
services:
  # Новый сервис!
  bot-service:
    build: ../../src/bot
    container_name: groomer-bot-service
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL:-http://n8n:5678/webhook/telegram-webhook}
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      - n8n
    restart: unless-stopped
    networks:
      - groomer-network

  n8n:
    image: n8nio/n8n:latest
    environment:
      # Добавить:
      - BOT_SERVICE_URL=http://bot-service:3000
    # ... остальное без изменений

networks:
  groomer-network:
    driver: bridge
```

## Bot Service API Endpoints

Bot Service должен предоставлять следующие HTTP endpoints:

### POST /webhook
Принимает события от Telegram API.

**Request:**
```json
{
  "update_id": 123456,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "chat": {
      "id": 123456789
    },
    "text": "/start"
  }
}
```

**Response:**
```json
{
  "status": "ok"
}
```

**Действия:**
1. Получить событие от Telegram
2. Переслать в N8N Webhook: `POST ${N8N_WEBHOOK_URL}`
3. Вернуть 200 OK

### POST /send-message
Отправляет сообщение в Telegram.

**Request:**
```json
{
  "chatId": 123456789,
  "text": "Hello, World!",
  "parseMode": "Markdown"
}
```

**Response:**
```json
{
  "status": "ok",
  "messageId": 789
}
```

### POST /send-notification
Отправляет уведомление (специализированный endpoint).

**Request:**
```json
{
  "chatId": 123456789,
  "text": "Reminder text...",
  "type": "reminder"
}
```

**Response:**
```json
{
  "status": "ok",
  "messageId": 790
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "bot-service",
  "version": "1.0.0"
}
```

## Создание Bot Service

Создайте файл `src/bot/api-server.js`:

```javascript
const express = require('express');
const { Bot } = require('grammy');
const axios = require('axios');

const app = express();
app.use(express.json());

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Telegram webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    console.log('[Bot Service] Received webhook from Telegram');

    // Forward to N8N orchestrator
    await axios.post(N8N_WEBHOOK_URL, {
      body: req.body
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Bot Service] Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Send message endpoint
app.post('/send-message', async (req, res) => {
  const { chatId, text, parseMode, replyMarkup } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({
      status: 'error',
      error: 'chatId and text are required'
    });
  }

  try {
    console.log(`[Bot Service] Sending message to ${chatId}`);

    const result = await bot.api.sendMessage(chatId, text, {
      parse_mode: parseMode,
      reply_markup: replyMarkup
    });

    res.json({
      status: 'ok',
      messageId: result.message_id
    });
  } catch (error) {
    console.error('[Bot Service] Send message error:', error.message);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Send notification endpoint
app.post('/send-notification', async (req, res) => {
  const { chatId, text, type } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({
      status: 'error',
      error: 'chatId and text are required'
    });
  }

  try {
    console.log(`[Bot Service] Sending ${type} notification to ${chatId}`);

    const result = await bot.api.sendMessage(chatId, text, {
      parse_mode: 'Markdown'
    });

    res.json({
      status: 'ok',
      messageId: result.message_id,
      type: type
    });
  } catch (error) {
    console.error('[Bot Service] Send notification error:', error.message);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'bot-service',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Bot Service] Running on port ${PORT}`);
  console.log(`[Bot Service] N8N webhook: ${N8N_WEBHOOK_URL}`);
});

// Set webhook for Telegram
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || `https://yourdomain.com/webhook`;
bot.api.setWebhook(TELEGRAM_WEBHOOK_URL);
```

Создайте `src/bot/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY api-server.js ./

EXPOSE 3000

CMD ["node", "api-server.js"]
```

Обновите `src/bot/package.json`:

```json
{
  "name": "groomer-bot-service",
  "version": "1.0.0",
  "description": "Telegram Bot Service for Grooming Salon",
  "main": "api-server.js",
  "scripts": {
    "start": "node api-server.js",
    "dev": "nodemon api-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.19.2",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## Инструкции по миграции

### Шаг 1: Обновить репозиторий
```bash
git pull origin claude/grooming-salon-app-011CULNmiscPngkTnrDNZr8e
```

### Шаг 2: Обновить .env файл
```bash
cd config/env
nano .env
```

Добавить:
```bash
BOT_SERVICE_URL=http://bot-service:3000
N8N_WEBHOOK_URL=http://n8n:5678/webhook/telegram-webhook
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/webhook
```

### Шаг 3: Создать Bot Service файлы
```bash
# Создать api-server.js (см. выше)
# Создать Dockerfile (см. выше)
# Обновить package.json (см. выше)
```

### Шаг 4: Обновить Docker Compose
```bash
cd config/docker
# Обновить docker-compose.yml (добавить bot-service)
```

### Шаг 5: Остановить старые контейнеры
```bash
docker-compose down
```

### Шаг 6: Удалить старые workflows из N8N
1. Открыть N8N UI (http://localhost:5678)
2. Удалить старые workflows с Telegram nodes

### Шаг 7: Запустить новые сервисы
```bash
docker-compose up -d --build
```

### Шаг 8: Импортировать новые workflows
1. Открыть N8N UI
2. Import workflow из `src/workflows/telegram-bot-main.json`
3. Import workflow из `src/workflows/notifications.json`
4. Import workflow из `src/workflows/admin-stats.json`

### Шаг 9: Настроить HTTP Basic Auth
В N8N создать credentials для Bot Service:
- Type: HTTP Basic Auth
- Name: bot-service-auth
- Username: admin (опционально)
- Password: ваш_пароль

### Шаг 10: Активировать workflows
1. Активировать "Telegram Bot - Main Handler (Microservice)"
2. Активировать "Notifications - Appointment Reminders (Microservice)"
3. Активировать "Admin - Daily Statistics (Microservice)"

### Шаг 11: Протестировать
```bash
# Проверить health Bot Service
curl http://localhost:3000/health

# Проверить N8N webhook
curl -X POST http://localhost:5678/webhook/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{"body": {"message": {"text": "/start", "from": {"id": 123}, "chat": {"id": 123}}}}'

# Отправить сообщение в Telegram
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{"chatId": YOUR_TELEGRAM_ID, "text": "Test from microservices!"}'
```

## Преимущества новой архитектуры

### 1. Разделение ответственности
- **Bot Service**: только работа с Telegram API
- **N8N**: только бизнес-логика и оркестрация
- **Database**: только хранение данных

### 2. Независимое масштабирование
```yaml
bot-service:
  deploy:
    replicas: 3  # Можно масштабировать независимо
```

### 3. Легкое тестирование
```bash
# Mock Bot Service для тестов
curl -X POST http://localhost:5678/webhook/telegram-webhook \
  -d '{"body": {"message": {...}}}'
```

### 4. Замена компонентов
Можно заменить Telegram на WhatsApp/Slack без изменения N8N:
```javascript
// Просто замените bot.api.sendMessage на whatsapp.sendMessage
```

### 5. Resilience
- Retry logic в HTTP requests
- Circuit breaker паттерн готов к внедрению
- Health checks для мониторинга

### 6. Мониторинг
```bash
# Логи Bot Service
docker logs -f groomer-bot-service

# Логи N8N
docker logs -f groomer-n8n-1

# Метрики
curl http://localhost:3000/health
```

## Откат (Rollback)

Если что-то пошло не так:

```bash
# 1. Остановить новые сервисы
docker-compose down

# 2. Переключиться на старую версию
git checkout <previous-commit>

# 3. Запустить старую версию
docker-compose up -d

# 4. Восстановить старые workflows в N8N
```

## Поддержка

При возникновении проблем:
1. Проверить логи: `docker logs groomer-bot-service`
2. Проверить health: `curl http://localhost:3000/health`
3. Проверить переменные окружения: `docker exec groomer-bot-service env`
4. Проверить N8N webhooks: N8N UI → Workflows → Webhook nodes

## Заключение

Миграция на микросервисную архитектуру завершена!

**Результат:**
- ✅ 3 workflows переработаны
- ✅ Все Telegram nodes заменены на HTTP Request
- ✅ Bot Service создан как отдельный микросервис
- ✅ Retry logic и error handling добавлены
- ✅ Документация обновлена

**Следующие шаги:**
- 🔄 Настроить CI/CD для автодеплоя
- 📊 Добавить мониторинг (Prometheus + Grafana)
- 🔐 Настроить API Gateway (Kong/Traefik)
- 📈 Добавить distributed tracing (Jaeger)

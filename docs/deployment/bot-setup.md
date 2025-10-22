# Telegram Bot для Груминг Салона

Простая Node.js реализация бота, которая может работать независимо от N8N или вместе с ним.

## Возможности

- ✅ Регистрация клиентов
- ✅ Добавление питомцев
- ✅ Просмотр услуг
- ✅ Запись на процедуры
- ✅ Просмотр своих записей
- ✅ Интерактивные кнопки (inline keyboard)
- ✅ Проверка занятости временных слотов

## Установка

```bash
cd bot
npm install
```

## Настройка

Создайте файл `.env` в корне проекта (или используйте `.env` из корня):

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://user:password@localhost:5432/grooming_salon
NODE_ENV=development

# Опционально
SALON_NAME=Груминг Салон
SALON_ADDRESS=Москва, ул. Примерная, д. 1
SALON_PHONE=+7 (999) 123-45-67
WORKING_HOURS_START=09:00
WORKING_HOURS_END=19:00
```

## Запуск

### Режим разработки (с автоперезагрузкой)

```bash
npm run dev
```

### Продакшен

```bash
npm start
```

## Docker

Если хотите запустить бота отдельно в Docker:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
```

Запуск:

```bash
docker build -t grooming-bot .
docker run -d --name grooming-bot --env-file ../.env grooming-bot
```

## Использование

### Команды бота

- `/start` - Начало работы и регистрация
- `/help` - Помощь по командам
- `/services` - Просмотр списка услуг
- `/addpet` - Добавить питомца
- `/book` - Записаться на процедуру
- `/myappointments` - Посмотреть свои записи
- `/cancel` - Отменить запись

### Процесс записи

1. Клиент вызывает `/book`
2. Выбирает питомца из списка
3. Выбирает услугу
4. Выбирает дату
5. Выбирает свободное время
6. Получает подтверждение

## Архитектура

```
bot/
├── index.js           # Основной файл бота
├── package.json       # Зависимости
├── handlers/          # Обработчики команд (можно расширить)
├── keyboards/         # Клавиатуры (можно вынести)
└── utils/             # Утилиты (можно добавить)
```

## Расширение функционала

### Добавление новой команды

```javascript
bot.command('mycommand', async (ctx) => {
  await ctx.reply('Ответ на команду');
});
```

### Добавление обработки callback

```javascript
if (data.startsWith('my_action_')) {
  const actionData = data.replace('my_action_', '');
  // обработка
  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Результат');
}
```

### Добавление middleware

```javascript
bot.use(async (ctx, next) => {
  console.log('Получено сообщение от:', ctx.from?.id);
  await next();
});
```

## Интеграция с N8N

Этот бот может работать параллельно с N8N:

1. **Вариант 1: Полностью N8N**
   - Используйте только N8N workflows
   - Этот код как reference

2. **Вариант 2: Гибридный**
   - Простые команды через этот бот
   - Сложная логика через N8N workflows
   - Бот может вызывать N8N webhooks

3. **Вариант 3: Полностью код**
   - Используйте только этот бот
   - N8N только для scheduled tasks (напоминания)

## Отладка

Включите DEBUG режим:

```javascript
bot.use(async (ctx, next) => {
  console.log('Update:', JSON.stringify(ctx.update, null, 2));
  await next();
});
```

Просмотр логов:

```bash
# Если запущено через Docker
docker logs -f grooming-bot

# Если запущено через npm
# Логи будут в консоли
```

## Best Practices

1. **Обработка ошибок**
   ```javascript
   bot.catch((err) => {
     console.error('Error:', err);
   });
   ```

2. **Валидация**
   ```javascript
   if (!ctx.session.data.petId) {
     await ctx.reply('Сначала выберите питомца');
     return;
   }
   ```

3. **Очистка сессии**
   ```javascript
   ctx.session.step = null;
   ctx.session.data = {};
   ```

4. **Graceful Shutdown**
   ```javascript
   process.once('SIGINT', () => bot.stop());
   ```

## Безопасность

1. Не храните токены в коде
2. Используйте переменные окружения
3. Валидируйте все входные данные
4. Ограничьте права доступа к БД
5. Используйте SSL для webhook (в продакшене)

## Мониторинг

Добавьте логирование важных событий:

```javascript
await pool.query('INSERT INTO bot_logs (event, data) VALUES ($1, $2)',
  ['appointment_created', JSON.stringify(appointmentData)]);
```

## Production Deployment

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start index.js --name grooming-bot
pm2 save
pm2 startup
```

### Systemd Service

Создайте `/etc/systemd/system/grooming-bot.service`:

```ini
[Unit]
Description=Grooming Salon Bot
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/var/www/Groomer/bot
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/var/www/Groomer/.env

[Install]
WantedBy=multi-user.target
```

Запуск:

```bash
systemctl enable grooming-bot
systemctl start grooming-bot
systemctl status grooming-bot
```

## Troubleshooting

### Бот не отвечает

1. Проверьте токен
2. Проверьте подключение к БД
3. Проверьте логи
4. Проверьте, что бот запущен

### Ошибка БД

1. Проверьте строку подключения
2. Проверьте, что PostgreSQL запущен
3. Проверьте, что схема создана
4. Проверьте права доступа

### Webhook vs Polling

Для локальной разработки используется polling (по умолчанию).

Для продакшена настройте webhook:

```javascript
// Вместо bot.start() используйте:
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.listen(3000);

// Установите webhook
await bot.api.setWebhook('https://yourdomain.com/webhook');
```

## Поддержка

Для вопросов и предложений создавайте issues в репозитории.

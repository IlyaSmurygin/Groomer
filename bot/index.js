/**
 * Telegram Bot для Груминг Салона
 * Альтернативный вариант для использования без N8N
 */

import { Bot, session, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import { format, addDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

dotenv.config();

// Инициализация бота
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Тестирование подключения к БД
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err);
  } else {
    console.log('✅ Подключено к базе данных:', res.rows[0].now);
  }
});

// Middleware для session
bot.use(session({
  initial: () => ({
    step: null,
    data: {}
  })
}));

// ========== КОМАНДЫ ==========

// Команда /start
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username || '';
  const firstName = ctx.from.first_name || '';
  const lastName = ctx.from.last_name || '';

  // Проверяем, есть ли пользователь в БД
  const result = await pool.query(
    'SELECT * FROM clients WHERE telegram_id = $1',
    [telegramId]
  );

  if (result.rows.length === 0) {
    // Регистрируем нового пользователя
    await pool.query(
      'INSERT INTO clients (telegram_id, username, first_name, last_name) VALUES ($1, $2, $3, $4)',
      [telegramId, username, firstName, lastName]
    );
  }

  const welcomeMessage = `🐾 Добро пожаловать в ${process.env.SALON_NAME || 'Груминг Салон'}!

Я помогу вам записаться на процедуры для вашего питомца.

Доступные команды:
/book - 📅 Записаться на процедуру
/services - 📋 Наши услуги
/addpet - 🐕 Добавить питомца
/myappointments - 📝 Мои записи
/cancel - ❌ Отменить запись
/help - ℹ️ Помощь

Для начала добавьте информацию о своем питомце командой /addpet`;

  await ctx.reply(welcomeMessage);
});

// Команда /help
bot.command('help', async (ctx) => {
  const helpMessage = `ℹ️ Помощь по использованию бота:

📋 Основные команды:
/start - Начало работы
/book - Записаться на процедуру
/services - Список услуг
/addpet - Добавить питомца
/myappointments - Мои записи
/cancel - Отменить запись

📞 Контакты:
Телефон: ${process.env.SALON_PHONE || 'не указан'}
Адрес: ${process.env.SALON_ADDRESS || 'не указан'}

⏰ Рабочие часы:
${process.env.WORKING_HOURS_START || '09:00'} - ${process.env.WORKING_HOURS_END || '19:00'}

Если у вас возникли вопросы, напишите нам!`;

  await ctx.reply(helpMessage);
});

// Команда /services
bot.command('services', async (ctx) => {
  const result = await pool.query(
    'SELECT * FROM services WHERE is_active = true ORDER BY id'
  );

  if (result.rows.length === 0) {
    await ctx.reply('Услуги временно недоступны.');
    return;
  }

  let message = '📋 Наши услуги:\n\n';

  result.rows.forEach((service, index) => {
    message += `${index + 1}. ${service.name}\n`;
    message += `   💰 Стоимость: ${service.price} ₽\n`;
    message += `   ⏱️ Длительность: ${service.duration} мин\n`;
    message += `   📝 ${service.description}\n\n`;
  });

  message += 'Для записи используйте команду /book';

  await ctx.reply(message);
});

// Команда /addpet
bot.command('addpet', async (ctx) => {
  ctx.session.step = 'awaiting_pet_name';
  ctx.session.data = {};

  await ctx.reply('Давайте добавим информацию о вашем питомце.\n\n🐾 Введите кличку питомца:');
});

// Команда /myappointments
bot.command('myappointments', async (ctx) => {
  const telegramId = ctx.from.id;

  // Получаем ID клиента
  const clientResult = await pool.query(
    'SELECT id FROM clients WHERE telegram_id = $1',
    [telegramId]
  );

  if (clientResult.rows.length === 0) {
    await ctx.reply('Вы не зарегистрированы. Используйте /start');
    return;
  }

  const clientId = clientResult.rows[0].id;

  // Получаем записи клиента
  const appointmentsResult = await pool.query(`
    SELECT
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      p.name as pet_name,
      s.name as service_name,
      s.price
    FROM appointments a
    JOIN pets p ON a.pet_id = p.id
    JOIN services s ON a.service_id = s.id
    WHERE a.client_id = $1 AND a.status != 'cancelled'
    ORDER BY a.appointment_date, a.appointment_time
  `, [clientId]);

  if (appointmentsResult.rows.length === 0) {
    await ctx.reply('У вас пока нет активных записей.\n\nИспользуйте /book для записи на процедуру.');
    return;
  }

  let message = '📝 Ваши записи:\n\n';

  appointmentsResult.rows.forEach((apt, index) => {
    const date = format(parseISO(apt.appointment_date.toISOString()), 'd MMMM yyyy', { locale: ru });
    const statusEmoji = apt.status === 'scheduled' ? '📅' : apt.status === 'confirmed' ? '✅' : '✔️';

    message += `${index + 1}. ${statusEmoji} ${date} в ${apt.appointment_time}\n`;
    message += `   🐾 Питомец: ${apt.pet_name}\n`;
    message += `   ✂️ Услуга: ${apt.service_name}\n`;
    message += `   💰 Стоимость: ${apt.price} ₽\n`;
    message += `   ID: ${apt.id}\n\n`;
  });

  message += 'Для отмены записи используйте /cancel';

  await ctx.reply(message);
});

// Команда /book
bot.command('book', async (ctx) => {
  const telegramId = ctx.from.id;

  // Получаем ID клиента
  const clientResult = await pool.query(
    'SELECT id FROM clients WHERE telegram_id = $1',
    [telegramId]
  );

  if (clientResult.rows.length === 0) {
    await ctx.reply('Сначала зарегистрируйтесь с помощью команды /start');
    return;
  }

  const clientId = clientResult.rows[0].id;

  // Проверяем, есть ли питомцы
  const petsResult = await pool.query(
    'SELECT * FROM pets WHERE client_id = $1',
    [clientId]
  );

  if (petsResult.rows.length === 0) {
    await ctx.reply('Сначала добавьте питомца с помощью команды /addpet');
    return;
  }

  // Создаем клавиатуру с питомцами
  const keyboard = new InlineKeyboard();

  petsResult.rows.forEach(pet => {
    keyboard.text(`${pet.name} (${pet.breed})`, `select_pet_${pet.id}`).row();
  });

  ctx.session.step = 'selecting_pet';
  ctx.session.data = { clientId };

  await ctx.reply('🐾 Выберите питомца:', {
    reply_markup: keyboard
  });
});

// ========== ОБРАБОТКА ШАГОВ ==========

// Обработка текстовых сообщений (шаги добавления питомца)
bot.on('message:text', async (ctx) => {
  const step = ctx.session.step;

  if (!step) {
    await ctx.reply('Используйте команды для работы с ботом. Введите /help для справки.');
    return;
  }

  // Добавление питомца - шаг 1: имя
  if (step === 'awaiting_pet_name') {
    ctx.session.data.petName = ctx.message.text;
    ctx.session.step = 'awaiting_pet_type';

    const keyboard = new InlineKeyboard()
      .text('🐕 Собака', 'pet_type_dog')
      .text('🐈 Кошка', 'pet_type_cat').row()
      .text('🐾 Другое', 'pet_type_other');

    await ctx.reply('Выберите тип животного:', {
      reply_markup: keyboard
    });
    return;
  }

  // Добавление питомца - шаг 3: порода
  if (step === 'awaiting_pet_breed') {
    ctx.session.data.petBreed = ctx.message.text;
    ctx.session.step = 'awaiting_pet_size';

    const keyboard = new InlineKeyboard()
      .text('Маленький (до 10 кг)', 'pet_size_small').row()
      .text('Средний (10-25 кг)', 'pet_size_medium').row()
      .text('Крупный (более 25 кг)', 'pet_size_large');

    await ctx.reply('Выберите размер питомца:', {
      reply_markup: keyboard
    });
    return;
  }
});

// ========== CALLBACK QUERIES ==========

// Обработка нажатий на кнопки
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Выбор типа питомца
  if (data.startsWith('pet_type_')) {
    const type = data.replace('pet_type_', '');
    ctx.session.data.petType = type;
    ctx.session.step = 'awaiting_pet_breed';

    await ctx.answerCallbackQuery();
    await ctx.editMessageText('Введите породу питомца:');
    return;
  }

  // Выбор размера питомца
  if (data.startsWith('pet_size_')) {
    const size = data.replace('pet_size_', '');
    ctx.session.data.petSize = size;

    const telegramId = ctx.from.id;

    // Получаем ID клиента
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE telegram_id = $1',
      [telegramId]
    );

    const clientId = clientResult.rows[0].id;

    // Сохраняем питомца в БД
    await pool.query(
      'INSERT INTO pets (client_id, name, type, breed, size) VALUES ($1, $2, $3, $4, $5)',
      [clientId, ctx.session.data.petName, ctx.session.data.petType, ctx.session.data.petBreed, size]
    );

    ctx.session.step = null;
    ctx.session.data = {};

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`✅ Питомец ${ctx.session.data.petName} успешно добавлен!\n\nТеперь вы можете записаться на процедуру командой /book`);
    return;
  }

  // Выбор питомца для записи
  if (data.startsWith('select_pet_')) {
    const petId = parseInt(data.replace('select_pet_', ''));
    ctx.session.data.petId = petId;

    // Получаем список услуг
    const servicesResult = await pool.query(
      'SELECT * FROM services WHERE is_active = true ORDER BY id'
    );

    const keyboard = new InlineKeyboard();

    servicesResult.rows.forEach(service => {
      keyboard.text(`${service.name} - ${service.price}₽`, `select_service_${service.id}`).row();
    });

    ctx.session.step = 'selecting_service';

    await ctx.answerCallbackQuery();
    await ctx.editMessageText('✂️ Выберите услугу:', {
      reply_markup: keyboard
    });
    return;
  }

  // Выбор услуги
  if (data.startsWith('select_service_')) {
    const serviceId = parseInt(data.replace('select_service_', ''));
    ctx.session.data.serviceId = serviceId;

    // Создаем кнопки с датами (сегодня + 14 дней)
    const keyboard = new InlineKeyboard();

    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dateLabel = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : format(date, 'd MMMM', { locale: ru });

      keyboard.text(dateLabel, `select_date_${dateStr}`).row();
    }

    ctx.session.step = 'selecting_date';

    await ctx.answerCallbackQuery();
    await ctx.editMessageText('📅 Выберите дату:', {
      reply_markup: keyboard
    });
    return;
  }

  // Выбор даты
  if (data.startsWith('select_date_')) {
    const date = data.replace('select_date_', '');
    ctx.session.data.date = date;

    // Генерируем временные слоты
    const slots = generateTimeSlots();

    // Проверяем занятость
    const bookedResult = await pool.query(
      'SELECT appointment_time FROM appointments WHERE appointment_date = $1 AND status != $2',
      [date, 'cancelled']
    );

    const bookedTimes = bookedResult.rows.map(row => row.appointment_time);

    const keyboard = new InlineKeyboard();

    slots.forEach(slot => {
      if (!bookedTimes.includes(slot)) {
        keyboard.text(slot, `select_time_${slot}`).row();
      }
    });

    ctx.session.step = 'selecting_time';

    await ctx.answerCallbackQuery();
    await ctx.editMessageText('🕐 Выберите время:', {
      reply_markup: keyboard
    });
    return;
  }

  // Выбор времени и создание записи
  if (data.startsWith('select_time_')) {
    const time = data.replace('select_time_', '');

    const { clientId, petId, serviceId, date } = ctx.session.data;

    // Создаем запись
    await pool.query(
      'INSERT INTO appointments (client_id, pet_id, service_id, appointment_date, appointment_time, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [clientId, petId, serviceId, date, time, 'scheduled']
    );

    // Получаем информацию для подтверждения
    const result = await pool.query(`
      SELECT
        p.name as pet_name,
        s.name as service_name,
        s.price,
        s.duration
      FROM pets p, services s
      WHERE p.id = $1 AND s.id = $2
    `, [petId, serviceId]);

    const info = result.rows[0];
    const dateFormatted = format(parseISO(date), 'd MMMM yyyy', { locale: ru });

    ctx.session.step = null;
    ctx.session.data = {};

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`✅ Запись успешно создана!

🐾 Питомец: ${info.pet_name}
✂️ Услуга: ${info.service_name}
📅 Дата: ${dateFormatted}
🕐 Время: ${time}
💰 Стоимость: ${info.price} ₽
⏱️ Длительность: ${info.duration} мин

📍 Адрес: ${process.env.SALON_ADDRESS || 'см. /help'}

Мы ждем вас! До встречи! 🐕🐈`);
    return;
  }

  await ctx.answerCallbackQuery();
});

// ========== УТИЛИТЫ ==========

function generateTimeSlots() {
  const slots = [];
  const start = parseInt(process.env.WORKING_HOURS_START?.split(':')[0] || '9');
  const end = parseInt(process.env.WORKING_HOURS_END?.split(':')[0] || '19');

  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return slots;
}

// ========== ЗАПУСК БОТА ==========

bot.catch((err) => {
  console.error('❌ Ошибка бота:', err);
});

console.log('🤖 Бот запускается...');
bot.start({
  onStart: (info) => {
    console.log('✅ Бот запущен:', info.username);
  }
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('Остановка бота...');
  bot.stop();
  pool.end();
});

process.once('SIGTERM', () => {
  console.log('Остановка бота...');
  bot.stop();
  pool.end();
});

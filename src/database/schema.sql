-- Схема базы данных для груминг салона
-- PostgreSQL / SQLite совместимая версия

-- Таблица клиентов
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по telegram_id
CREATE INDEX idx_clients_telegram_id ON clients(telegram_id);

-- Таблица питомцев
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('dog', 'cat', 'other')),
    breed VARCHAR(255),
    size VARCHAR(50) CHECK (size IN ('small', 'medium', 'large')),
    age INTEGER,
    weight DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска питомцев клиента
CREATE INDEX idx_pets_client_id ON pets(client_id);

-- Таблица услуг
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- в минутах
    price DECIMAL(10, 2) NOT NULL,
    pet_types TEXT, -- JSON массив типов животных ['dog', 'cat', 'other']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка стандартных услуг
INSERT INTO services (name, description, duration, price, pet_types) VALUES
    ('Стрижка', 'Полная стрижка питомца по стандартам породы', 60, 2000.00, '["dog", "cat"]'),
    ('Мытье и сушка', 'Купание с профессиональными шампунями и сушка феном', 45, 1000.00, '["dog", "cat", "other"]'),
    ('Тримминг', 'Выщипывание шерсти для жесткошерстных пород', 90, 2500.00, '["dog"]'),
    ('Стрижка когтей', 'Подрезание когтей с обработкой', 15, 300.00, '["dog", "cat", "other"]'),
    ('Чистка ушей', 'Профессиональная чистка ушей', 20, 400.00, '["dog", "cat"]'),
    ('Комплексный уход', 'Стрижка + мытье + когти + уши', 120, 3500.00, '["dog", "cat"]'),
    ('Экспресс линька', 'Удаление подшерстка в период линьки', 60, 1500.00, '["dog", "cat"]'),
    ('SPA процедуры', 'Расслабляющие процедуры с масками и массажем', 90, 3000.00, '["dog", "cat"]');

-- Таблица временных слотов (рабочее время салона)
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Воскресенье, 6=Суббота
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- Вставка стандартных временных слотов (Пн-Сб 9:00-19:00)
INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES
    (1, '09:00', '19:00'), -- Понедельник
    (2, '09:00', '19:00'), -- Вторник
    (3, '09:00', '19:00'), -- Среда
    (4, '09:00', '19:00'), -- Четверг
    (5, '09:00', '19:00'), -- Пятница
    (6, '10:00', '18:00'); -- Суббота

-- Таблица записей
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(appointment_date, appointment_time) -- Одно время - одна запись
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_date, appointment_time);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'confirmation', 'cancellation', 'update')),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Индекс для быстрого поиска уведомлений
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_appointment_id ON notifications(appointment_id);

-- Таблица состояний чата (для FSM - Finite State Machine)
CREATE TABLE IF NOT EXISTS chat_states (
    telegram_id BIGINT PRIMARY KEY,
    state VARCHAR(100),
    data TEXT, -- JSON данные состояния
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица админских настроек
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка базовых настроек
INSERT INTO settings (key, value, description) VALUES
    ('working_hours_start', '09:00', 'Начало рабочего дня'),
    ('working_hours_end', '19:00', 'Конец рабочего дня'),
    ('slot_duration', '30', 'Длительность временного слота в минутах'),
    ('reminder_hours', '24', 'За сколько часов отправлять напоминание'),
    ('max_advance_days', '30', 'Максимум дней для бронирования заранее'),
    ('admin_telegram_id', '', 'Telegram ID администратора'),
    ('salon_name', 'Груминг Салон', 'Название салона'),
    ('salon_address', '', 'Адрес салона'),
    ('salon_phone', '', 'Телефон салона');

-- Представление для удобного просмотра записей
CREATE OR REPLACE VIEW v_appointments AS
SELECT
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
    c.phone AS client_phone,
    c.telegram_id AS client_telegram_id,
    p.name AS pet_name,
    p.breed AS pet_breed,
    s.name AS service_name,
    s.duration AS service_duration,
    s.price AS service_price,
    a.notes,
    a.created_at
FROM appointments a
JOIN clients c ON a.client_id = c.id
JOIN pets p ON a.pet_id = p.id
JOIN services s ON a.service_id = s.id;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_states_updated_at BEFORE UPDATE ON chat_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE clients IS 'Клиенты груминг салона';
COMMENT ON TABLE pets IS 'Питомцы клиентов';
COMMENT ON TABLE services IS 'Каталог услуг';
COMMENT ON TABLE appointments IS 'Записи на процедуры';
COMMENT ON TABLE notifications IS 'История уведомлений';
COMMENT ON TABLE chat_states IS 'Состояния чатов для FSM бота';
COMMENT ON TABLE settings IS 'Настройки системы';

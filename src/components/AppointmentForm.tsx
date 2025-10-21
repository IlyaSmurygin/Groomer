import React, { useState } from 'react';
import { Client, Pet, Service, Appointment } from '../types';
import { generateId, getTimeSlots, isTimeSlotAvailable } from '../utils/helpers';
import { storage } from '../utils/storage';

interface AppointmentFormProps {
  clients: Client[];
  pets: Pet[];
  services: Service[];
  appointments: Appointment[];
  onAppointmentAdded: (appointment: Appointment) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  clients,
  pets,
  services,
  appointments,
  onAppointmentAdded
}) => {
  const [clientId, setClientId] = useState('');
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const clientPets = clientId ? pets.filter(p => p.clientId === clientId) : [];
  const timeSlots = getTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !petId || !serviceId || !date || !time) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!isTimeSlotAvailable(date, time, appointments)) {
      alert('Это время уже занято. Пожалуйста, выберите другое время.');
      return;
    }

    const newAppointment: Appointment = {
      id: generateId(),
      clientId,
      petId,
      serviceId,
      date,
      time,
      status: 'scheduled',
      notes
    };

    storage.addAppointment(newAppointment);
    onAppointmentAdded(newAppointment);

    // Очистка формы
    setServiceId('');
    setDate('');
    setTime('');
    setNotes('');

    alert('Запись успешно создана!');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="appointment-form">
      <h3>Запись на процедуру</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Клиент *
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setPetId('');
              }}
              required
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.phone}
                </option>
              ))}
            </select>
          </label>
        </div>

        {clientId && (
          <div className="form-group">
            <label>
              Питомец *
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                required
              >
                <option value="">Выберите питомца</option>
                {clientPets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.breed})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="form-group">
          <label>
            Услуга *
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              <option value="">Выберите услугу</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price} ₽ ({service.duration} мин)
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Дата *
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getTodayDate()}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Время *
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={!date}
            >
              <option value="">Выберите время</option>
              {timeSlots.map(slot => {
                const available = isTimeSlotAvailable(date, slot, appointments);
                return (
                  <option key={slot} value={slot} disabled={!available}>
                    {slot} {!available ? '(занято)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Примечания
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительные пожелания..."
              rows={3}
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Записать
        </button>
      </form>
    </div>
  );
};

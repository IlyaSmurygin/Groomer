import React from 'react';
import { Appointment, Client, Pet, Service } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import { storage } from '../utils/storage';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  clients: Client[];
  pets: Pet[];
  services: Service[];
  onUpdate: () => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  clients,
  pets,
  services,
  onUpdate
}) => {
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Неизвестный клиент';
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? `${pet.name} (${pet.breed})` : 'Неизвестный питомец';
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Неизвестная услуга';
  };

  const getServicePrice = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.price || 0;
  };

  const handleCancel = (appointmentId: string) => {
    if (window.confirm('Вы уверены, что хотите отменить эту запись?')) {
      storage.updateAppointment(appointmentId, { status: 'cancelled' });
      onUpdate();
    }
  };

  const handleComplete = (appointmentId: string) => {
    if (window.confirm('Отметить процедуру как выполненную?')) {
      storage.updateAppointment(appointmentId, { status: 'completed' });
      onUpdate();
    }
  };

  const handleDelete = (appointmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      storage.deleteAppointment(appointmentId);
      onUpdate();
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const upcomingAppointments = sortedAppointments.filter(
    apt => apt.status === 'scheduled' && new Date(`${apt.date}T${apt.time}`) >= new Date()
  );

  const pastAppointments = sortedAppointments.filter(
    apt => apt.status !== 'scheduled' || new Date(`${apt.date}T${apt.time}`) < new Date()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="badge badge-success">Запланировано</span>;
      case 'completed':
        return <span className="badge badge-info">Выполнено</span>;
      case 'cancelled':
        return <span className="badge badge-warning">Отменено</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="appointment-calendar">
      <h3>Календарь записей</h3>

      {upcomingAppointments.length > 0 && (
        <div className="appointments-section">
          <h4>Предстоящие записи ({upcomingAppointments.length})</h4>
          <div className="appointments-list">
            {upcomingAppointments.map(apt => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-date">
                    📅 {formatDate(apt.date)} в {formatTime(apt.time)}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="appointment-details">
                  <p><strong>Клиент:</strong> {getClientName(apt.clientId)}</p>
                  <p><strong>Питомец:</strong> {getPetName(apt.petId)}</p>
                  <p><strong>Услуга:</strong> {getServiceName(apt.serviceId)}</p>
                  <p><strong>Стоимость:</strong> {getServicePrice(apt.serviceId)} ₽</p>
                  {apt.notes && <p><strong>Примечания:</strong> {apt.notes}</p>}
                </div>
                <div className="appointment-actions">
                  <button
                    onClick={() => handleComplete(apt.id)}
                    className="btn btn-sm btn-success"
                  >
                    Выполнено
                  </button>
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="btn btn-sm btn-warning"
                  >
                    Отменить
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastAppointments.length > 0 && (
        <div className="appointments-section">
          <h4>История ({pastAppointments.length})</h4>
          <div className="appointments-list">
            {pastAppointments.map(apt => (
              <div key={apt.id} className="appointment-card past">
                <div className="appointment-header">
                  <div className="appointment-date">
                    📅 {formatDate(apt.date)} в {formatTime(apt.time)}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="appointment-details">
                  <p><strong>Клиент:</strong> {getClientName(apt.clientId)}</p>
                  <p><strong>Питомец:</strong> {getPetName(apt.petId)}</p>
                  <p><strong>Услуга:</strong> {getServiceName(apt.serviceId)}</p>
                  <p><strong>Стоимость:</strong> {getServicePrice(apt.serviceId)} ₽</p>
                  {apt.notes && <p><strong>Примечания:</strong> {apt.notes}</p>}
                </div>
                <div className="appointment-actions">
                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="empty-state">
          <p>Записей пока нет. Создайте первую запись!</p>
        </div>
      )}
    </div>
  );
};

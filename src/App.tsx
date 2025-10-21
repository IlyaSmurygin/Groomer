import React, { useState, useEffect } from 'react';
import { Client, Pet, Appointment } from './types';
import { storage } from './utils/storage';
import { defaultServices } from './data/services';
import { ClientForm } from './components/ClientForm';
import { PetForm } from './components/PetForm';
import { ServiceList } from './components/ServiceList';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import './App.css';

type TabType = 'appointments' | 'clients' | 'services';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(storage.getClients());
    setPets(storage.getPets());
    setAppointments(storage.getAppointments());
  };

  const handleClientAdded = (client: Client) => {
    setClients([...clients, client]);
  };

  const handlePetAdded = (pet: Pet) => {
    setPets([...pets, pet]);
  };

  const handleAppointmentAdded = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const stats = {
    totalClients: clients.length,
    totalPets: pets.length,
    upcomingAppointments: appointments.filter(
      apt => apt.status === 'scheduled' && new Date(`${apt.date}T${apt.time}`) >= new Date()
    ).length,
    completedAppointments: appointments.filter(apt => apt.status === 'completed').length
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐾 Груминг Салон</h1>
        <p className="subtitle">Система управления записями</p>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.totalClients}</div>
          <div className="stat-label">Клиентов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPets}</div>
          <div className="stat-label">Питомцев</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.upcomingAppointments}</div>
          <div className="stat-label">Предстоящих записей</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedAppointments}</div>
          <div className="stat-label">Выполнено процедур</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Записи
        </button>
        <button
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          👥 Клиенты и питомцы
        </button>
        <button
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          ✂️ Услуги
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="row">
              <div className="col">
                <AppointmentForm
                  clients={clients}
                  pets={pets}
                  services={defaultServices}
                  appointments={appointments}
                  onAppointmentAdded={handleAppointmentAdded}
                />
              </div>
              <div className="col-wide">
                <AppointmentCalendar
                  appointments={appointments}
                  clients={clients}
                  pets={pets}
                  services={defaultServices}
                  onUpdate={loadData}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="clients-tab">
            <div className="row">
              <div className="col">
                <ClientForm onClientAdded={handleClientAdded} />
              </div>
              <div className="col">
                <PetForm clients={clients} onPetAdded={handlePetAdded} />
              </div>
            </div>

            <div className="clients-list">
              <h3>Список клиентов ({clients.length})</h3>
              {clients.length === 0 ? (
                <p className="empty-state">Клиентов пока нет. Добавьте первого клиента!</p>
              ) : (
                <div className="client-cards">
                  {clients.map(client => {
                    const clientPets = pets.filter(p => p.clientId === client.id);
                    return (
                      <div key={client.id} className="client-card">
                        <h4>{client.name}</h4>
                        <p>📞 {client.phone}</p>
                        {client.email && <p>✉️ {client.email}</p>}
                        <div className="client-pets">
                          <strong>Питомцы ({clientPets.length}):</strong>
                          {clientPets.length > 0 ? (
                            <ul>
                              {clientPets.map(pet => (
                                <li key={pet.id}>
                                  {pet.name} - {pet.breed} ({pet.size === 'small' ? 'маленький' : pet.size === 'medium' ? 'средний' : 'крупный'})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">Нет зарегистрированных питомцев</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <ServiceList services={defaultServices} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

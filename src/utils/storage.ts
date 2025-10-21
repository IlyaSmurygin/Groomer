import { Client, Pet, Appointment } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'grooming_clients',
  PETS: 'grooming_pets',
  APPOINTMENTS: 'grooming_appointments'
};

export const storage = {
  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  saveClients: (clients: Client[]): void => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  addClient: (client: Client): void => {
    const clients = storage.getClients();
    clients.push(client);
    storage.saveClients(clients);
  },

  // Pets
  getPets: (): Pet[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PETS);
    return data ? JSON.parse(data) : [];
  },

  savePets: (pets: Pet[]): void => {
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
  },

  addPet: (pet: Pet): void => {
    const pets = storage.getPets();
    pets.push(pet);
    storage.savePets(pets);
  },

  getPetsByClient: (clientId: string): Pet[] => {
    return storage.getPets().filter(pet => pet.clientId === clientId);
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveAppointments: (appointments: Appointment[]): void => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  addAppointment: (appointment: Appointment): void => {
    const appointments = storage.getAppointments();
    appointments.push(appointment);
    storage.saveAppointments(appointments);
  },

  updateAppointment: (id: string, updates: Partial<Appointment>): void => {
    const appointments = storage.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      storage.saveAppointments(appointments);
    }
  },

  deleteAppointment: (id: string): void => {
    const appointments = storage.getAppointments();
    storage.saveAppointments(appointments.filter(a => a.id !== id));
  }
};

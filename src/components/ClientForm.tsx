import React, { useState } from 'react';
import { Client } from '../types';
import { generateId } from '../utils/helpers';
import { storage } from '../utils/storage';

interface ClientFormProps {
  onClientAdded: (client: Client) => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onClientAdded }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    const newClient: Client = {
      id: generateId(),
      name,
      phone,
      email
    };

    storage.addClient(newClient);
    onClientAdded(newClient);

    // Очистка формы
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="client-form">
      <h3>Регистрация клиента</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Имя *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Телефон *
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Добавить клиента
        </button>
      </form>
    </div>
  );
};

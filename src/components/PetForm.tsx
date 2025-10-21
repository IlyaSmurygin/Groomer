import React, { useState } from 'react';
import { Client, Pet } from '../types';
import { generateId } from '../utils/helpers';
import { storage } from '../utils/storage';

interface PetFormProps {
  clients: Client[];
  onPetAdded: (pet: Pet) => void;
}

export const PetForm: React.FC<PetFormProps> = ({ clients, onPetAdded }) => {
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'dog' | 'cat' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !name || !breed) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    const newPet: Pet = {
      id: generateId(),
      clientId,
      name,
      type,
      breed,
      size,
      notes
    };

    storage.addPet(newPet);
    onPetAdded(newPet);

    // Очистка формы
    setName('');
    setBreed('');
    setNotes('');
  };

  return (
    <div className="pet-form">
      <h3>Регистрация питомца</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Владелец *
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
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

        <div className="form-group">
          <label>
            Кличка питомца *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Барсик"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Тип животного *
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="dog">Собака</option>
              <option value="cat">Кошка</option>
              <option value="other">Другое</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Порода *
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Йоркширский терьер"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Размер
            <select value={size} onChange={(e) => setSize(e.target.value as any)}>
              <option value="small">Маленький (до 10 кг)</option>
              <option value="medium">Средний (10-25 кг)</option>
              <option value="large">Крупный (более 25 кг)</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Примечания
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особенности характера, аллергии и т.д."
              rows={3}
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Добавить питомца
        </button>
      </form>
    </div>
  );
};

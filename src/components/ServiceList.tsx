import React from 'react';
import { Service } from '../types';

interface ServiceListProps {
  services: Service[];
  selectedServiceId?: string;
  onSelectService?: (serviceId: string) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  selectedServiceId,
  onSelectService
}) => {
  const getPetTypeLabel = (type: string) => {
    switch (type) {
      case 'dog': return '🐕 Собаки';
      case 'cat': return '🐈 Кошки';
      case 'other': return '🐾 Другие';
      default: return type;
    }
  };

  return (
    <div className="service-list">
      <h3>Наши услуги</h3>
      <div className="services-grid">
        {services.map(service => (
          <div
            key={service.id}
            className={`service-card ${selectedServiceId === service.id ? 'selected' : ''}`}
            onClick={() => onSelectService?.(service.id)}
          >
            <h4>{service.name}</h4>
            <p className="description">{service.description}</p>
            <div className="service-info">
              <p className="duration">⏱️ {service.duration} мин</p>
              <p className="price">{service.price} ₽</p>
            </div>
            <div className="pet-types">
              {service.petTypes.map(type => (
                <span key={type} className="pet-type-badge">
                  {getPetTypeLabel(type)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

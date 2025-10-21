export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  size: 'small' | 'medium' | 'large';
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // в минутах
  price: number;
  petTypes: ('dog' | 'cat' | 'other')[];
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

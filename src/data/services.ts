import { Service } from '../types';

export const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Стрижка',
    description: 'Полная стрижка питомца',
    duration: 60,
    price: 2000,
    petTypes: ['dog', 'cat']
  },
  {
    id: '2',
    name: 'Мытье и сушка',
    description: 'Купание с профессиональными шампунями и сушка',
    duration: 45,
    price: 1000,
    petTypes: ['dog', 'cat', 'other']
  },
  {
    id: '3',
    name: 'Тримминг',
    description: 'Выщипывание шерсти для жесткошерстных пород',
    duration: 90,
    price: 2500,
    petTypes: ['dog']
  },
  {
    id: '4',
    name: 'Стрижка когтей',
    description: 'Подрезание когтей с обработкой',
    duration: 15,
    price: 300,
    petTypes: ['dog', 'cat', 'other']
  },
  {
    id: '5',
    name: 'Чистка ушей',
    description: 'Профессиональная чистка ушей',
    duration: 20,
    price: 400,
    petTypes: ['dog', 'cat']
  },
  {
    id: '6',
    name: 'Комплексный уход',
    description: 'Стрижка + мытье + когти + уши',
    duration: 120,
    price: 3500,
    petTypes: ['dog', 'cat']
  },
  {
    id: '7',
    name: 'Экспресс линька',
    description: 'Удаление подшерстка в период линьки',
    duration: 60,
    price: 1500,
    petTypes: ['dog', 'cat']
  },
  {
    id: '8',
    name: 'SPA процедуры',
    description: 'Расслабляющие процедуры с масками и массажем',
    duration: 90,
    price: 3000,
    petTypes: ['dog', 'cat']
  }
];

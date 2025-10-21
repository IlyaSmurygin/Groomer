export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU');
};

export const formatTime = (time: string): string => {
  return time;
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 19; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 19) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const isTimeSlotAvailable = (
  date: string,
  time: string,
  appointments: any[]
): boolean => {
  return !appointments.some(
    apt => apt.date === date && apt.time === time && apt.status === 'scheduled'
  );
};

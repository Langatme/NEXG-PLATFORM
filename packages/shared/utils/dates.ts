export const greetingForHour = (hour: number): string => {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export type TimeOfDay = 'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'night';

export const timeOfDayForHour = (hour: number): TimeOfDay => {
  if (hour < 8) return 'earlyMorning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const formatDayLabel = (date: Date): string => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return WEEKDAYS[date.getDay()];
  return `${target.getDate()}.${target.getMonth() + 1}`;
};

export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

export const nextNDays = (n: number, from: Date = new Date()): Date[] => {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return d;
  });
};

export const generateTimeSlots = (
  fromHour: number,
  toHour: number,
  stepMinutes: number = 30
): Date[] => {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const slots: Date[] = [];
  for (let h = fromHour; h <= toHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const slot = new Date(base);
      slot.setHours(h, m);
      slots.push(slot);
    }
  }
  return slots;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

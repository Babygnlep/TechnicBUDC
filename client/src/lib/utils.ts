import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHours(minutes: number) {
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

export function calculateDuration(start: string, end: string, breakTime: number) {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  const diff = endMinutes - startMinutes - breakTime;
  return Math.max(diff, 0);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

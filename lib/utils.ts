import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateRelative(date: Date | string | number): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = new Date(date).getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, 'minute');
  return rtf.format(diffSecs, 'second');
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

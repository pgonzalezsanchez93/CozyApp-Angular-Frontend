export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC'
  };

  switch (format) {
    case 'short':
      options.day = 'numeric';
      options.month = 'numeric';
      options.year = 'numeric';
      break;
    case 'medium':
      options.day = 'numeric';
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'long':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      options.weekday = 'long';
      break;
    case 'full':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      options.weekday = 'long';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
}

export function getDaysDifference(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;


  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);


  const diffInTime = end.getTime() - start.getTime();
  const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));

  return diffInDays;
}

export function isToday(date: Date | string): boolean {
  const today = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  return today.getDate() === targetDate.getDate() &&
         today.getMonth() === targetDate.getMonth() &&
         today.getFullYear() === targetDate.getFullYear();
}


export function isPastDate(date: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = typeof date === 'string' ? new Date(date) : date;
  targetDate.setHours(0, 0, 0, 0);

  return targetDate < today;
}


export function addDays(date: Date | string, days: number): Date {
  const result = typeof date === 'string' ? new Date(date) : new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


export function getFirstDayOfWeek(date: Date | string): Date {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = targetDate.getDay();


  const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);

  const result = new Date(targetDate);
  result.setDate(diff);
  return result;
}

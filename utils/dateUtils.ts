import { DayInfo } from '../types';

export const getMonthDays = (year: number, month: number): DayInfo[] => {
  const days: DayInfo[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 0 = Sunday, 1 = Monday. We want Monday to be 0 for the grid loop or adjust accordingly.
  // Standard JS: Sun=0, Mon=1. 
  // We want the calendar to start on Monday.
  let startDayOfWeek = firstDay.getDay(); 
  // Convert to Mon=0, Sun=6
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: d,
      dayNumber: d.getDate(),
      isToday: isSameDay(d, new Date()),
      isPast: isPastDate(d),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dayNumber: i,
      isToday: isSameDay(d, new Date()),
      isPast: isPastDate(d),
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 42 cells (6 rows)
  const remainingSlots = 42 - days.length;
  for (let i = 1; i <= remainingSlots; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dayNumber: i,
      isToday: isSameDay(d, new Date()),
      isPast: isPastDate(d),
      isCurrentMonth: false,
    });
  }

  return days;
};

export const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
};

const isPastDate = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

export const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start) return false;
  if (start && !end) return isSameDay(date, start);
  if (start && end) {
      // Create fresh date objects to avoid time conflicts
      const d = new Date(date); d.setHours(0,0,0,0);
      const s = new Date(start); s.setHours(0,0,0,0);
      const e = new Date(end); e.setHours(0,0,0,0);
      return d >= s && d <= e;
  }
  return false;
};

export const isDateBlocked = (date: Date, blockedRanges: { start: Date, end: Date }[]) => {
  const checkDate = new Date(date);
  checkDate.setHours(0,0,0,0);
  
  return blockedRanges.some(range => {
      const s = new Date(range.start); s.setHours(0,0,0,0);
      const e = new Date(range.end); e.setHours(0,0,0,0);
      return checkDate >= s && checkDate <= e;
  });
};

export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('fi-FI', { weekday: 'long', month: 'long', day: 'numeric' });
};

export const formatDateRange = (start: Date, end: Date): string => {
  const startStr = start.toLocaleDateString('fi-FI', { month: 'numeric', day: 'numeric' });
  const endStr = end.toLocaleDateString('fi-FI', { month: 'numeric', day: 'numeric' });
  return `${startStr}. - ${endStr}.`;
};

export const getDaysDifference = (start: Date, end: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  // Use UTC or set hours to 0 to avoid DST issues
  const firstDate = new Date(start); firstDate.setHours(0,0,0,0);
  const secondDate = new Date(end); secondDate.setHours(0,0,0,0);
  
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
};

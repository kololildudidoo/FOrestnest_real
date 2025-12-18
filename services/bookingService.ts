import { UserDetails } from '../types';

const STORAGE_KEY = 'artbooker_bookings';

let blockedRangeCache: { start: Date; end: Date }[] | null = null;
let blockedRangePromise: Promise<{ start: Date; end: Date }[]> | null = null;

const readStoredBookings = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

export const fetchBlockedRanges = async (): Promise<{start: Date, end: Date}[]> => {
  if (blockedRangeCache) return blockedRangeCache;
  if (blockedRangePromise) return blockedRangePromise;

  blockedRangePromise = Promise.resolve().then(() => {
    try {
      const bookings = readStoredBookings();

      const ranges = bookings.map((b: any) => ({
        start: new Date(b.startDate),
        end: new Date(b.endDate)
      }));

      blockedRangeCache = ranges;
      blockedRangePromise = null;
      return ranges;
    } catch (error) {
      console.error("Error reading from local storage", error);
      blockedRangePromise = null;
      return [];
    }
  });

  return blockedRangePromise;
};

export const createBooking = async (startDate: Date, endDate: Date, userDetails: UserDetails) => {
  try {
    const bookings = readStoredBookings();

    const newBooking = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userDetails,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

    blockedRangeCache = null;
    blockedRangePromise = null;
    return true;
  } catch (error) {
    console.error("Error saving to local storage", error);
    throw error;
  }
};

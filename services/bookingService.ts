import { UserDetails } from '../types';

const STORAGE_KEY = 'artbooker_bookings';

// Helper to simulate network delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchBlockedRanges = async (): Promise<{start: Date, end: Date}[]> => {
  await delay(600); // Simulate network latency
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    let bookings = storedData ? JSON.parse(storedData) : [];
    
    // Convert string dates back to Date objects
    let ranges = bookings.map((b: any) => ({
      start: new Date(b.startDate),
      end: new Date(b.endDate)
    }));

    return ranges;
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
};

export const createBooking = async (startDate: Date, endDate: Date, userDetails: UserDetails) => {
  await delay(1000); // Simulate network processing
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const bookings = storedData ? JSON.parse(storedData) : [];

    const newBooking = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userDetails,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error("Error saving to local storage", error);
    throw error;
  }
};
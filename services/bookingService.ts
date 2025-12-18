import { UserDetails } from '../types';
import { addDoc, collection, getDocs, query, serverTimestamp, type DocumentData, where } from 'firebase/firestore';
import { getDb, isFirebaseEnabled } from './firebase';
import { parseIcalEvents, toInclusiveDateRange } from '../utils/ical';

const STORAGE_KEY = 'artbooker_bookings';
const BLOCKED_RANGES_CACHE_KEY = 'forestnest_blocked_ranges_cache_v1';
const FIRESTORE_TIMEOUT_MS = 4000;

type BlockedRange = { start: Date; end: Date };

type StoredBooking = {
  startDate: string;
  endDate: string;
  userDetails: UserDetails;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
};

const rangesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
  const aStart = new Date(startA); aStart.setHours(0, 0, 0, 0);
  const aEnd = new Date(endA); aEnd.setHours(0, 0, 0, 0);
  const bStart = new Date(startB); bStart.setHours(0, 0, 0, 0);
  const bEnd = new Date(endB); bEnd.setHours(0, 0, 0, 0);
  return aStart <= bEnd && aEnd >= bStart;
};

const parseDateLike = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object' && typeof (value as any).toDate === 'function') {
    try {
      return (value as any).toDate();
    } catch {
      return null;
    }
  }
  return null;
};

const toBlockedRangesFromDoc = (data: DocumentData): BlockedRange | null => {
  if (data?.status && data.status !== 'confirmed') {
    return null;
  }

  const start = parseDateLike(data?.startDate);
  const end = parseDateLike(data?.endDate);
  if (!start || !end) {
    return null;
  }

  return { start, end };
};

let cachedIcalRanges: { fetchedAt: number; ranges: BlockedRange[] } | null = null;
const ICAL_CACHE_MS = 5 * 60 * 1000;
const ICAL_TIMEOUT_MS = 2500;

type FetchBlockedRangesOptions = {
  cache?: 'cache-first' | 'network-first';
  maxAgeMs?: number;
};

const serializeRanges = (ranges: BlockedRange[]) =>
  ranges.map(range => ({ start: range.start.toISOString(), end: range.end.toISOString() }));

const deserializeRanges = (ranges: any): BlockedRange[] => {
  if (!Array.isArray(ranges)) return [];
  return ranges
    .map(item => {
      const start = item?.start ? new Date(item.start) : null;
      const end = item?.end ? new Date(item.end) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
      return { start, end } as BlockedRange;
    })
    .filter((range): range is BlockedRange => Boolean(range));
};

const mergeRanges = (ranges: BlockedRange[]) => {
  const normalized = ranges
    .map(range => {
      const start = new Date(range.start); start.setHours(0, 0, 0, 0);
      const end = new Date(range.end); end.setHours(0, 0, 0, 0);
      return { start, end };
    })
    .filter(range => range.end >= range.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: BlockedRange[] = [];
  for (const range of normalized) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(range);
      continue;
    }

    const lastEndPlusOne = new Date(last.end);
    lastEndPlusOne.setDate(lastEndPlusOne.getDate() + 1);
    if (range.start <= lastEndPlusOne) {
      if (range.end > last.end) {
        last.end = range.end;
      }
    } else {
      merged.push(range);
    }
  }

  return merged;
};

const readBlockedRangesCache = (): { fetchedAt: number; ranges: BlockedRange[] } | null => {
  try {
    const raw = localStorage.getItem(BLOCKED_RANGES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.fetchedAt !== 'number') return null;
    return { fetchedAt: parsed.fetchedAt, ranges: deserializeRanges(parsed.ranges) };
  } catch {
    return null;
  }
};

const writeBlockedRangesCache = (ranges: BlockedRange[]) => {
  try {
    localStorage.setItem(
      BLOCKED_RANGES_CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), ranges: serializeRanges(ranges) }),
    );
  } catch {
    // Ignore cache write issues (private mode, quota, etc.)
  }
};

const fetchWithTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method: 'GET', signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
};

const runWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = window.setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    // Clear timer when original settles
    promise.finally(() => window.clearTimeout(id));
  });
  return Promise.race([promise, timeoutPromise]) as Promise<T>;
};

const fetchIcalBlockedRanges = async (): Promise<BlockedRange[]> => {
  const url = typeof __AIRBNB_ICAL_URL__ === 'string' ? __AIRBNB_ICAL_URL__.trim() : '';
  if (!url) {
    return [];
  }

  if (cachedIcalRanges && Date.now() - cachedIcalRanges.fetchedAt < ICAL_CACHE_MS) {
    return cachedIcalRanges.ranges;
  }

  try {
    const response = await fetchWithTimeout(url, ICAL_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`iCal fetch failed (${response.status})`);
    }
    const text = await response.text();
    const events = parseIcalEvents(text);

    const ranges = events
      .map(toInclusiveDateRange)
      .filter(range => range.end >= range.start);

    cachedIcalRanges = { fetchedAt: Date.now(), ranges };
    return ranges;
  } catch (error) {
    console.warn('Failed to fetch/parse iCal feed; continuing without iCal blocks.', error);
    return [];
  }
};

const fetchBlockedRangesFromLocalStorage = async (): Promise<BlockedRange[]> => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const bookings: StoredBooking[] = storedData ? JSON.parse(storedData) : [];
    
    // Convert string dates back to Date objects
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .map(booking => ({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      }));
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
};

const fetchBlockedRangesNetwork = async (): Promise<BlockedRange[]> => {
  const icalPromise = fetchIcalBlockedRanges();

  if (!isFirebaseEnabled()) {
    const [icalRanges, localRanges] = await Promise.all([icalPromise, fetchBlockedRangesFromLocalStorage()]);
    return mergeRanges([...icalRanges, ...localRanges]);
  }

  const db = getDb();
  if (!db) {
    const [icalRanges, localRanges] = await Promise.all([icalPromise, fetchBlockedRangesFromLocalStorage()]);
    return mergeRanges([...icalRanges, ...localRanges]);
  }

  const bookingsQuery = query(collection(db, 'bookings'), where('status', '==', 'confirmed'));
  const firestorePromise = (async () => {
    const snapshot = await runWithTimeout(getDocs(bookingsQuery), FIRESTORE_TIMEOUT_MS, 'Firestore availability fetch');
    return snapshot.docs
      .map(doc => toBlockedRangesFromDoc(doc.data()))
      .filter((range): range is BlockedRange => Boolean(range));
  })();

  try {
    const [icalRanges, firebaseRanges] = await Promise.all([icalPromise, firestorePromise]);
    return mergeRanges([...icalRanges, ...firebaseRanges]);
  } catch (error) {
    console.warn('Availability fetch (Firestore) failed; falling back to cached/local ranges.', error);
    const [icalRanges, localRanges] = await Promise.all([icalPromise, fetchBlockedRangesFromLocalStorage()]);
    return mergeRanges([...icalRanges, ...localRanges]);
  }
};

export const fetchBlockedRanges = async (options: FetchBlockedRangesOptions = {}): Promise<BlockedRange[]> => {
  const { cache = 'network-first', maxAgeMs = 5 * 60 * 1000 } = options;

  const cached = readBlockedRangesCache();
  const isFresh = cached ? Date.now() - cached.fetchedAt < maxAgeMs : false;

  if (cache === 'cache-first' && cached?.ranges.length) {
    // Return immediately; caller can optionally re-fetch with network-first.
    return cached.ranges;
  }

  if (cache === 'network-first' && isFresh && cached?.ranges.length) {
    // Fast path for repeated mounts within the TTL.
    return cached.ranges;
  }

  try {
    const ranges = await fetchBlockedRangesNetwork();
    writeBlockedRangesCache(ranges);
    return ranges;
  } catch (error) {
    console.warn('Availability fetch failed; using cached/local ranges.', error);
    if (cached?.ranges?.length) {
      return cached.ranges;
    }
    const localFallback = await fetchBlockedRangesFromLocalStorage();
    return localFallback;
  }
};

export const createBooking = async (startDate: Date, endDate: Date, userDetails: UserDetails) => {
  if (!isFirebaseEnabled()) {
    console.warn('Firebase not configured; saving booking locally as fallback.');
    return createBookingInLocalStorage(startDate, endDate, userDetails);
  }

  const db = getDb();
  if (!db) {
    console.warn('Firebase not initialized; saving booking locally as fallback.');
    return createBookingInLocalStorage(startDate, endDate, userDetails);
  }

  const blocked = await fetchBlockedRanges({ cache: 'network-first' });
  const overlapsExisting = blocked.some(range => rangesOverlap(startDate, endDate, range.start, range.end));
  if (overlapsExisting) {
    throw new Error('Selected dates overlap an existing booking.');
  }

  try {
    await runWithTimeout(
      addDoc(collection(db, 'bookings'), {
        startDate,
        endDate,
        userDetails,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        source: 'website',
      }),
      FIRESTORE_TIMEOUT_MS,
      'Firestore booking write'
    );

    // Update local cache immediately so availability reflects the new booking
    const newRanges = mergeRanges([...blocked, { start: startDate, end: endDate }]);
    writeBlockedRangesCache(newRanges);
    return true;
  } catch (error) {
    console.warn('Firestore write failed; saving booking locally as fallback.', error);
    return createBookingInLocalStorage(startDate, endDate, userDetails);
  }

  return true;
};

const createBookingInLocalStorage = async (startDate: Date, endDate: Date, userDetails: UserDetails) => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const bookings = storedData ? JSON.parse(storedData) : [];

    const newBooking: StoredBooking = {
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

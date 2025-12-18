import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const isNonEmpty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

// Normalize env values to handle accidental quotes/trailing commas in .env files.
const cleanValue = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const withoutTrailingCommas = value.trim().replace(/,+$/, '');
  const withoutQuotes = withoutTrailingCommas.replace(/^['"`]/, '').replace(/['"`]$/, '');
  return withoutQuotes.trim();
};

const cleanOptionalValue = (value: unknown): string | undefined => {
  const cleaned = cleanValue(value);
  return cleaned.length ? cleaned : undefined;
};

const getConfig = (): FirebaseWebConfig | null => {
  const config = __FIREBASE_CONFIG__ as FirebaseWebConfig | undefined;
  if (!config) {
    return null;
  }

  const normalized: FirebaseWebConfig = {
    apiKey: cleanValue(config.apiKey),
    authDomain: cleanValue(config.authDomain),
    projectId: cleanValue(config.projectId),
    storageBucket: cleanOptionalValue(config.storageBucket),
    messagingSenderId: cleanOptionalValue(config.messagingSenderId),
    appId: cleanOptionalValue(config.appId),
    measurementId: cleanOptionalValue(config.measurementId),
  };

  if (!isNonEmpty(normalized.apiKey) || !isNonEmpty(normalized.authDomain) || !isNonEmpty(normalized.projectId)) {
    return null;
  }

  return normalized;
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const isFirebaseEnabled = (): boolean => Boolean(getConfig());

export const getFirebaseApp = (): FirebaseApp | null => {
  const config = getConfig();
  if (!config) {
    return null;
  }

  if (cachedApp) {
    return cachedApp;
  }

  cachedApp = getApps().length ? getApps()[0] : initializeApp(config);
  return cachedApp;
};

export const getDb = (): Firestore | null => {
  if (cachedDb) {
    return cachedDb;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  cachedDb = getFirestore(app);
  return cachedDb;
};

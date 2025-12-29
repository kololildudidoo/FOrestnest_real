'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Image as ImageIcon,
  LogOut,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserCircle2,
  XCircle,
} from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { formatDateRange } from '../utils/dateUtils';
import { getAuthClient, getDb, getStorageClient, isFirebaseEnabled } from '../services/firebase';

type TabKey = 'home' | 'requests' | 'gallery' | 'reviews';

type BookingRequest = {
  id: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  createdAt: Date | null;
  userDetails: {
    name?: string;
    email?: string;
    notes?: string;
    adults?: number;
    children?: number;
    hasPets?: boolean;
    extras?: {
      firewood?: boolean;
      lateCheckout?: boolean;
    };
    totalPrice?: number;
  };
};

type GalleryItem = {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  order: number;
  storagePath?: string;
};

type ReviewItem = {
  id: string;
  name: string;
  date: string;
  text: string;
  img?: string;
};

const parseDateLike = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
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

const toInputDate = (value: Date | null) => (value ? value.toISOString().slice(0, 10) : '');

const fromInputDate = (value: string) => (value ? new Date(`${value}T00:00:00`) : null);

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('home');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestDraft, setRequestDraft] = useState<BookingRequest | null>(null);
  const [requestSaveState, setRequestSaveState] = useState<'idle' | 'saving' | 'error'>('idle');

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryEdits, setGalleryEdits] = useState<Record<string, { title: string; subtitle: string }>>({});
  const [galleryUploadState, setGalleryUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewDraft, setReviewDraft] = useState({ name: '', date: '', text: '', img: '' });
  const [reviewSaveState, setReviewSaveState] = useState<'idle' | 'saving' | 'error'>('idle');

  const firebaseReady = isFirebaseEnabled();
  const latestRequest = bookingRequests[0] ?? null;
  const selectedRequest = useMemo(
    () => bookingRequests.find((request) => request.id === selectedRequestId) ?? null,
    [bookingRequests, selectedRequestId]
  );

  useEffect(() => {
    if (!firebaseReady) {
      setAuthLoading(false);
      return;
    }

    const auth = getAuthClient();
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
  }, [firebaseReady]);

  useEffect(() => {
    if (!authUser) {
      setBookingRequests([]);
      return;
    }

    const db = getDb();
    if (!db) {
      return;
    }

    const requestsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    return onSnapshot(requestsQuery, (snapshot) => {
      const nextRequests = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          startDate: parseDateLike(data.startDate),
          endDate: parseDateLike(data.endDate),
          status: data.status ?? 'pending',
          createdAt: parseDateLike(data.createdAt),
          userDetails: data.userDetails ?? {},
        } as BookingRequest;
      });
      setBookingRequests(nextRequests);
    });
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setGalleryItems([]);
      return;
    }

    const db = getDb();
    if (!db) {
      return;
    }

    const galleryQuery = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    return onSnapshot(galleryQuery, (snapshot) => {
      const nextItems = snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          src: data.src ?? '',
          title: data.title ?? 'Gallery image',
          subtitle: data.subtitle ?? '',
          order: typeof data.order === 'number' ? data.order : index,
          storagePath: data.storagePath,
        } as GalleryItem;
      });

      nextItems.sort((a, b) => a.order - b.order);
      setGalleryItems(nextItems);
      setGalleryEdits((prev) => {
        const next = { ...prev };
        nextItems.forEach((item) => {
          if (!next[item.id]) {
            next[item.id] = { title: item.title, subtitle: item.subtitle };
          }
        });
        return next;
      });
    });
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setReviews([]);
      return;
    }

    const db = getDb();
    if (!db) {
      return;
    }

    const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    return onSnapshot(reviewsQuery, (snapshot) => {
      const nextReviews = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          name: data.name ?? 'Guest',
          date: data.date ?? '',
          text: data.text ?? '',
          img: data.img ?? '',
        } as ReviewItem;
      });
      setReviews(nextReviews);
    });
  }, [authUser]);

  useEffect(() => {
    if (!selectedRequest) {
      setRequestDraft(null);
      return;
    }

    setRequestDraft({
      ...selectedRequest,
      userDetails: {
        ...selectedRequest.userDetails,
        adults: selectedRequest.userDetails.adults ?? 2,
        children: selectedRequest.userDetails.children ?? 0,
        hasPets: selectedRequest.userDetails.hasPets ?? false,
        extras: {
          firewood: selectedRequest.userDetails.extras?.firewood ?? false,
          lateCheckout: selectedRequest.userDetails.extras?.lateCheckout ?? false,
        },
      },
    });
    setRequestSaveState('idle');
  }, [selectedRequest]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseReady) return;

    const auth = getAuthClient();
    if (!auth) return;

    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError('Unable to sign in. Check your credentials and try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuthClient();
    if (!auth) return;
    await signOut(auth);
  };

  const handleRequestFieldChange = (field: keyof BookingRequest['userDetails'], value: any) => {
    if (!requestDraft) return;
    setRequestDraft({
      ...requestDraft,
      userDetails: {
        ...requestDraft.userDetails,
        [field]: value,
      },
    });
  };

  const handleRequestExtrasChange = (field: keyof NonNullable<BookingRequest['userDetails']['extras']>, value: boolean) => {
    if (!requestDraft) return;
    setRequestDraft({
      ...requestDraft,
      userDetails: {
        ...requestDraft.userDetails,
        extras: {
          ...requestDraft.userDetails.extras,
          [field]: value,
        },
      },
    });
  };

  const handleSaveRequest = async () => {
    if (!requestDraft) return;
    const db = getDb();
    if (!db) return;

    const updatedRequest: BookingRequest = {
      ...requestDraft,
      userDetails: { ...requestDraft.userDetails },
    };

    setRequestSaveState('saving');
    try {
      await updateDoc(doc(db, 'bookings', requestDraft.id), {
        startDate: requestDraft.startDate ?? null,
        endDate: requestDraft.endDate ?? null,
        userDetails: requestDraft.userDetails,
      });
      setBookingRequests((prev) =>
        prev.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))
      );
      setRequestDraft(updatedRequest);
      setRequestSaveState('idle');
    } catch {
      setRequestSaveState('error');
    }
  };

  const handleRequestStatus = async (status: 'confirmed' | 'rejected') => {
    if (!selectedRequest) return;
    const db = getDb();
    if (!db) return;

    await updateDoc(doc(db, 'bookings', selectedRequest.id), { status });
  };

  const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const db = getDb();
    const storage = getStorageClient();
    if (!db || !storage) return;

    setGalleryUploadState('uploading');
    const maxOrder = galleryItems.reduce((max, item) => Math.max(max, item.order), 0);

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const storagePath = `gallery/${Date.now()}-${file.name}`;
        const fileRef = ref(storage, storagePath);
        await uploadBytes(fileRef, file);
        const src = await getDownloadURL(fileRef);
        await addDoc(collection(db, 'gallery'), {
          src,
          title: file.name.replace(/\.[^.]+$/, ''),
          subtitle: '',
          order: maxOrder + index + 1,
          storagePath,
          createdAt: serverTimestamp(),
        });
      }
      setGalleryUploadState('idle');
      event.target.value = '';
    } catch {
      setGalleryUploadState('error');
    }
  };

  const handleSaveGalleryItem = async (item: GalleryItem) => {
    const db = getDb();
    if (!db) return;

    const edit = galleryEdits[item.id];
    if (!edit) return;

    await updateDoc(doc(db, 'gallery', item.id), {
      title: edit.title,
      subtitle: edit.subtitle,
    });
  };

  const handleMoveGalleryItem = async (index: number, direction: -1 | 1) => {
    const current = galleryItems[index];
    const target = galleryItems[index + direction];
    if (!current || !target) return;

    const db = getDb();
    if (!db) return;

    await Promise.all([
      updateDoc(doc(db, 'gallery', current.id), { order: target.order }),
      updateDoc(doc(db, 'gallery', target.id), { order: current.order }),
    ]);
  };

  const handleRemoveGalleryItem = async (item: GalleryItem) => {
    const db = getDb();
    if (!db) return;

    await deleteDoc(doc(db, 'gallery', item.id));

    const storage = getStorageClient();
    if (storage && item.storagePath) {
      await deleteObject(ref(storage, item.storagePath));
    }
  };

  const handleAddReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewDraft.name || !reviewDraft.text) return;

    const db = getDb();
    if (!db) return;

    setReviewSaveState('saving');
    try {
      await addDoc(collection(db, 'reviews'), {
        name: reviewDraft.name,
        date: reviewDraft.date,
        text: reviewDraft.text,
        img: reviewDraft.img,
        createdAt: serverTimestamp(),
      });
      setReviewDraft({ name: '', date: '', text: '', img: '' });
      setReviewSaveState('idle');
    } catch {
      setReviewSaveState('error');
    }
  };

  const handleRemoveReview = async (reviewId: string) => {
    const db = getDb();
    if (!db) return;

    await deleteDoc(doc(db, 'reviews', reviewId));
  };

  if (!firebaseReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-900 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Firebase required</h1>
          <p className="text-gray-500">
            Configure Firebase in <code>.env.local</code> to enable the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading admin dashboard...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <form
          onSubmit={handleSignIn}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <UserCircle2 className="w-9 h-9 text-gray-900" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Forest Admin</h1>
              <p className="text-sm text-gray-500">Sign in with your admin account.</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#ffd166]/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#ffd166]/40"
              placeholder="••••••••"
            />
          </div>

          {authError && <p className="text-sm text-red-500">{authError}</p>}

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full rounded-xl bg-gray-900 text-white py-3 font-semibold hover:bg-black transition-colors disabled:opacity-60"
          >
            {isSigningIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#ffd166] flex items-center justify-center font-bold text-gray-900">
            FN
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Forest Nest</p>
            <p className="text-xs text-gray-400">Admin dashboard</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <button
            type="button"
            onClick={() => setTab('home')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
              tab === 'home' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck size={18} /> Home
          </button>
          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
              tab === 'requests' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList size={18} /> Booking requests
          </button>
          <button
            type="button"
            onClick={() => setTab('gallery')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
              tab === 'gallery' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ImageIcon size={18} /> Gallery
          </button>
          <button
            type="button"
            onClick={() => setTab('reviews')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
              tab === 'reviews' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star size={18} /> Reviews
          </button>
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen px-10 py-10 space-y-8">
        {tab === 'home' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Home</h1>
              <p className="text-gray-500 mt-2">Quick overview of the latest activity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  <Calendar size={16} /> Latest booking request
                </div>
                {latestRequest ? (
                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {latestRequest.userDetails?.name ?? 'Guest'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {latestRequest.startDate && latestRequest.endDate
                          ? formatDateRange(latestRequest.startDate, latestRequest.endDate)
                          : 'Dates not set'}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                      Status: {latestRequest.status}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('requests')}
                      className="text-sm font-semibold text-gray-900 hover:text-black"
                    >
                      View all requests →
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-5">No requests yet.</p>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  <ImageIcon size={16} /> Gallery preview
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {galleryItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl overflow-hidden bg-gray-100">
                      <img src={item.src} alt={item.title} className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
                {galleryItems.length === 0 && <p className="text-sm text-gray-500 mt-5">No gallery images yet.</p>}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  <Star size={16} /> Reviews preview
                </div>
                <div className="mt-5 space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="text-sm">
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-gray-500 line-clamp-2">{review.text}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking requests</h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {bookingRequests.map((request) => {
                  const isSelected = request.id === selectedRequestId;
                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedRequestId(request.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                        isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="text-sm font-semibold">{request.userDetails?.name ?? 'Guest'}</p>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                        {request.startDate && request.endDate
                          ? formatDateRange(request.startDate, request.endDate)
                          : 'Dates not set'}
                      </p>
                      <p className={`text-xs mt-1 uppercase tracking-wider ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {request.status}
                      </p>
                    </button>
                  );
                })}
                {bookingRequests.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              {requestDraft ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Request details</h2>
                      <p className="text-sm text-gray-500">Update details before confirming.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRequestStatus('confirmed')}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-700 px-4 py-2 text-sm font-semibold hover:bg-emerald-500/20"
                      >
                        <CheckCircle2 size={16} /> Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestStatus('rejected')}
                        className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500/20"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Start date</label>
                      <input
                        type="date"
                        value={toInputDate(requestDraft.startDate)}
                        onChange={(event) =>
                          setRequestDraft({ ...requestDraft, startDate: fromInputDate(event.target.value) })
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">End date</label>
                      <input
                        type="date"
                        value={toInputDate(requestDraft.endDate)}
                        onChange={(event) =>
                          setRequestDraft({ ...requestDraft, endDate: fromInputDate(event.target.value) })
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Name</label>
                      <input
                        type="text"
                        value={requestDraft.userDetails?.name ?? ''}
                        onChange={(event) => handleRequestFieldChange('name', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        value={requestDraft.userDetails?.email ?? ''}
                        onChange={(event) => handleRequestFieldChange('email', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Notes</label>
                    <textarea
                      value={requestDraft.userDetails?.notes ?? ''}
                      onChange={(event) => handleRequestFieldChange('notes', event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Adults</label>
                      <input
                        type="number"
                        min={1}
                        value={requestDraft.userDetails?.adults ?? 1}
                        onChange={(event) => handleRequestFieldChange('adults', Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Children</label>
                      <input
                        type="number"
                        min={0}
                        value={requestDraft.userDetails?.children ?? 0}
                        onChange={(event) => handleRequestFieldChange('children', Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <input
                        type="checkbox"
                        checked={Boolean(requestDraft.userDetails?.hasPets)}
                        onChange={(event) => handleRequestFieldChange('hasPets', event.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Pets included</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(requestDraft.userDetails.extras?.firewood)}
                        onChange={(event) => handleRequestExtrasChange('firewood', event.target.checked)}
                      />
                      Firewood extra
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(requestDraft.userDetails.extras?.lateCheckout)}
                        onChange={(event) => handleRequestExtrasChange('lateCheckout', event.target.checked)}
                      />
                      Late checkout
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        Status: <span className="font-semibold text-gray-900">{requestDraft.status}</span>
                      </p>
                      {requestDraft.userDetails?.totalPrice ? (
                        <p>
                          Total: <span className="font-semibold text-gray-900">{requestDraft.userDetails.totalPrice} €</span>
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveRequest}
                      className="rounded-full bg-gray-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-black"
                    >
                      {requestSaveState === 'saving' ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                  {requestSaveState === 'error' && (
                    <p className="text-sm text-red-500">Failed to save. Try again.</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Select a request to view details.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Gallery</h1>
                <p className="text-gray-500 text-sm">Upload, reorder, and edit gallery images.</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold cursor-pointer hover:bg-black">
                <Upload size={16} /> Upload images
                <input type="file" multiple accept="image/*" onChange={handleUploadImages} className="hidden" />
              </label>
            </div>
            {galleryUploadState === 'error' && (
              <p className="text-sm text-red-500">Upload failed. Try again.</p>
            )}

            <div className="space-y-4">
              {galleryItems.map((item, index) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex gap-5">
                  <div className="w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={galleryEdits[item.id]?.title ?? item.title}
                      onChange={(event) =>
                        setGalleryEdits((prev) => ({
                          ...prev,
                          [item.id]: { title: event.target.value, subtitle: prev[item.id]?.subtitle ?? item.subtitle },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={galleryEdits[item.id]?.subtitle ?? item.subtitle}
                      onChange={(event) =>
                        setGalleryEdits((prev) => ({
                          ...prev,
                          [item.id]: { title: prev[item.id]?.title ?? item.title, subtitle: event.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                      placeholder="Subtitle"
                    />
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleMoveGalleryItem(index, -1)}
                        disabled={index === 0}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                      >
                        <ChevronUp size={16} /> Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGalleryItem(index, 1)}
                        disabled={index === galleryItems.length - 1}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                      >
                        <ChevronDown size={16} /> Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveGalleryItem(item)}
                        className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(item)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {galleryItems.length === 0 && (
                <p className="text-sm text-gray-500">No gallery images yet. Upload to get started.</p>
              )}
            </div>
            {galleryUploadState === 'uploading' && (
              <p className="text-sm text-gray-500">Uploading images...</p>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Reviews</h1>
              <p className="text-gray-500 text-sm">Add, edit, or remove reviews displayed on the landing page.</p>
            </div>

            <form onSubmit={handleAddReview} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    value={reviewDraft.name}
                    onChange={(event) => setReviewDraft({ ...reviewDraft, name: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Date</label>
                  <input
                    type="text"
                    value={reviewDraft.date}
                    onChange={(event) => setReviewDraft({ ...reviewDraft, date: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                    placeholder="Oct 2024"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Review text</label>
                <textarea
                  value={reviewDraft.text}
                  onChange={(event) => setReviewDraft({ ...reviewDraft, text: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 min-h-[120px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Image URL (optional)</label>
                <input
                  type="url"
                  value={reviewDraft.img}
                  onChange={(event) => setReviewDraft({ ...reviewDraft, img: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-gray-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-black"
              >
                {reviewSaveState === 'saving' ? 'Saving...' : 'Add review'}
              </button>
              {reviewSaveState === 'error' && <p className="text-sm text-red-500">Failed to add review.</p>}
            </form>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {review.img ? (
                      <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReview(review.id)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-red-500"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{review.text}</p>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

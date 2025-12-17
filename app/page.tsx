'use client';

import React, { useState } from 'react';
import BookingLayout from '../components/BookingLayout';
import DateTimeSelection from '../components/DateTimeSelection';
import ExtrasSelection from '../components/ExtrasSelection';
import ContactForm from '../components/ContactForm';
import SuccessView from '../components/SuccessView';
import LandingPage from '../components/LandingPage';
import ExperiencesPage from '../components/ExperiencesPage';
import TermsPage from '../components/TermsPage';
import GalleryPage from '../components/GalleryPage';
import ContactPage from '../components/ContactPage';
import { BookingState, BookingDetails, ContactDetails } from '../types';

type ViewState = 'landing' | 'booking' | 'experiences' | 'terms' | 'gallery' | 'contact';

const Page: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'date-time',
    resource: 'art-suitcase',
    startDate: null,
    endDate: null,
    bookingDetails: {
        adults: 2,
        children: 0,
        hasPets: false,
        extras: { firewood: false, lateCheckout: false },
        totalPrice: 0
    },
    contactDetails: null,
  });

  const handleWeekSelect = (start: Date, end: Date | null) => {
    setBookingState(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  };

  const handleDateContinue = () => {
    if (bookingState.startDate && bookingState.endDate) {
      setBookingState(prev => ({
        ...prev,
        step: 'extras'
      }));
    }
  };

  const handleExtrasContinue = (details: BookingDetails) => {
      setBookingState(prev => ({
          ...prev,
          bookingDetails: details,
          step: 'contact'
      }));
  };

  const handleContactSubmit = (details: ContactDetails) => {
    setBookingState(prev => ({
      ...prev,
      contactDetails: details,
      step: 'success'
    }));
  };

  const handleBack = () => {
    setBookingState(prev => {
      if (prev.step === 'contact') return { ...prev, step: 'extras' };
      if (prev.step === 'extras') return { ...prev, step: 'date-time' };
      return prev;
    });
  };

  const handleEditDates = () => {
    setBookingState(prev => ({
        ...prev,
        step: 'date-time'
    }));
  };

  const handleReset = () => {
    setBookingState({
      step: 'date-time',
      resource: 'art-suitcase',
      startDate: null,
      endDate: null,
      bookingDetails: {
        adults: 2,
        children: 0,
        hasPets: false,
        extras: { firewood: false, lateCheckout: false },
        totalPrice: 0
      },
      contactDetails: null,
    });
  };

  const navigateTo = (page: string) => {
      const normalizedPage = page === 'location' || page === 'locations' ? 'contact' : page;
      if (['landing', 'booking', 'experiences', 'terms', 'gallery', 'contact'].includes(normalizedPage)) {
          setView(normalizedPage as ViewState);
          window.scrollTo(0, 0);
      }
  };

  const startBooking = () => setView('booking');

  if (view === 'experiences') return <ExperiencesPage onNavigate={navigateTo} onStartBooking={startBooking} />;
  if (view === 'terms') return <TermsPage onNavigate={navigateTo} onStartBooking={startBooking} />;
  if (view === 'gallery') return <GalleryPage onNavigate={navigateTo} onStartBooking={startBooking} />;
  if (view === 'contact') return <ContactPage onNavigate={navigateTo} onStartBooking={startBooking} />;

  if (view === 'landing') {
    return <LandingPage onStartBooking={startBooking} onNavigate={navigateTo} />;
  }

  return (
    <div className="font-sans text-gray-900 animate-fade-in">
      {bookingState.step === 'success' ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative">
              <button 
                onClick={() => setView('landing')} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
              >
                  Close
              </button>
              <SuccessView bookingData={bookingState} onReset={handleReset} />
           </div>
        </div>
      ) : (
        <BookingLayout 
            state={bookingState} 
            onBack={handleBack} 
            onEditDates={handleEditDates}
            onReturnHome={() => setView('landing')}
        >
          {bookingState.step === 'date-time' && (
            <DateTimeSelection 
              selectedStart={bookingState.startDate}
              selectedEnd={bookingState.endDate}
              onWeekSelect={handleWeekSelect}
              onContinue={handleDateContinue}
            />
          )}
          {bookingState.step === 'extras' && bookingState.startDate && bookingState.endDate && (
             <ExtrasSelection 
                startDate={bookingState.startDate}
                endDate={bookingState.endDate}
                initialDetails={bookingState.bookingDetails}
                onContinue={handleExtrasContinue}
                onBack={handleBack}
             />
          )}
          {bookingState.step === 'contact' && bookingState.startDate && bookingState.endDate && (
            <ContactForm 
              startDate={bookingState.startDate} 
              endDate={bookingState.endDate}
              bookingDetails={bookingState.bookingDetails}
              onSubmit={handleContactSubmit}
              onBack={handleBack}
            />
          )}
        </BookingLayout>
      )}
    </div>
  );
};

export default Page;

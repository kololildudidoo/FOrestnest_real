
export type ResourceType = 'art-suitcase' | 'art-bag';

export interface BookingDetails {
  adults: number;
  children: number;
  hasPets: boolean;
  extras: {
    firewood: boolean;
    lateCheckout: boolean;
  };
  totalPrice: number;
}

export interface ContactDetails {
  name: string;
  email: string;
  notes?: string;
}

export interface UserDetails extends BookingDetails, ContactDetails {}

export interface BookingState {
  step: 'date-time' | 'extras' | 'contact' | 'success';
  resource: ResourceType;
  startDate: Date | null;
  endDate: Date | null;
  bookingDetails: BookingDetails;
  contactDetails: ContactDetails | null;
}

export interface DayInfo {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
}

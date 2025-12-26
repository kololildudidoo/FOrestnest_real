import React, { useState } from 'react';
import { User, Mail, FileText, Check, Loader2, AlertCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { ContactDetails, BookingDetails } from '../types';
import { createBooking } from '../services/bookingService';
import { formatDateRange, getDaysDifference } from '../utils/dateUtils';
import { calculateTotal, PRICING } from '../utils/pricing';

const SUBMIT_TIMEOUT_MS = 8000;

interface ContactFormProps {
  startDate: Date;
  endDate: Date;
  bookingDetails: BookingDetails;
  onSubmit: (details: ContactDetails) => void;
  onBack: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ startDate, endDate, bookingDetails, onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate price for display (ensure consistency)
  const nights = Math.max(1, getDaysDifference(startDate, endDate));
  const { finalPrice, breakdown } = calculateTotal(
      nights, 
      bookingDetails.adults, 
      bookingDetails.children, 
      bookingDetails.hasPets, 
      bookingDetails.extras
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && isCaptchaVerified) {
      setIsSubmitting(true);
      setError(null);
      
      const contactDetails: ContactDetails = { name, email, notes };
      
      const fullBookingData = {
          ...contactDetails,
          ...bookingDetails, 
          totalPrice: finalPrice
      };

      try {
        await createBooking(startDate, endDate, fullBookingData);
        onSubmit(contactDetails);
      } catch (err) {
        console.error(err);
        setError("Varauksen tallennus epäonnistui. Tarkista verkkoyhteytesi tai kokeile myöhemmin uudelleen.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCaptchaClick = () => {
    if (isCaptchaVerified || isCaptchaLoading) return;
    
    setIsCaptchaLoading(true);
    setTimeout(() => {
        setIsCaptchaLoading(false);
        setIsCaptchaVerified(true);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row animate-fade-in">
      
        {/* Left Column: Form Controls */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
             <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors mb-6 w-max"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-gray-300 flex items-center justify-center bg-white transition-all">
                    <ArrowLeft size={16} />
                </div>
                <span>Takaisin</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Viimeistele varaus</h2>
            <p className="text-gray-500 text-sm mb-6">Täytä yhteystietosi varauksen vahvistamiseksi.</p>

            {/* Contact Details */}
            <div className="space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 ml-1">Koko nimi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        id="name"
                        required
                        disabled={isSubmitting}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                        placeholder="Matti Meikäläinen"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1">Sähköpostiosoite</label>
                     <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        id="email"
                        required
                        disabled={isSubmitting}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                        placeholder="matti@esimerkki.fi"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 ml-1">Lisätiedot (valinnainen)</label>
                     <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                        <FileText size={18} />
                      </div>
                      <textarea
                        id="notes"
                        rows={4}
                        disabled={isSubmitting}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm resize-none disabled:bg-gray-50 disabled:text-gray-400"
                        placeholder="Erityistoiveita, ruoka-aineallergiat, saapumisaika..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Captcha */}
                  <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 select-none mt-6">
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={!isSubmitting ? handleCaptchaClick : undefined}
                            className={`w-[24px] h-[24px] border-2 bg-white rounded-[2px] cursor-pointer flex items-center justify-center transition-all
                                ${isCaptchaVerified ? 'border-transparent' : 'border-[#c1c1c1] hover:border-[#b2b2b2]'}
                            `}
                        >
                            {isCaptchaLoading && <div className="w-4 h-4 rounded-full border-2 border-[#4a90e2] border-t-transparent animate-spin" />}
                            {isCaptchaVerified && <Check strokeWidth={4} className="text-[#009688] w-5 h-5" />}
                        </div>
                        <span onClick={!isSubmitting ? handleCaptchaClick : undefined} className="font-roboto text-[14px] text-black font-normal cursor-pointer">En ole robotti</span>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-1 pr-1 opacity-60">
                        <div className="text-[10px] text-[#555] font-bold">reCAPTCHA</div>
                        <div className="text-[8px] text-[#555]">Privacy - Terms</div>
                    </div>
                  </div>
                  
                   {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
            </div>
        </div>

        {/* Right Column: Final Summary (Sidebar) */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 md:p-8 overflow-y-auto flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <CreditCard size={20} className="text-gray-500"/>
                Yhteenveto
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                    <span>{nights} yötä x {PRICING.BASE_PRICE} €</span>
                    <span>{breakdown.basePriceTotal} €</span>
                </div>
                
                {breakdown.extraAdultTotal > 0 && (
                    <div className="flex justify-between text-gray-900 font-medium">
                        <span>Lisäaikuiset ({breakdown.extraAdults})</span>
                        <span>{breakdown.extraAdultTotal} €</span>
                    </div>
                )}

                {breakdown.extraChildTotal > 0 && (
                    <div className="flex justify-between text-gray-900 font-medium">
                        <span>Lisälapset ({breakdown.extraChildren})</span>
                        <span>{breakdown.extraChildTotal} €</span>
                    </div>
                )}
                
                {breakdown.petTotal > 0 && (
                    <div className="flex justify-between">
                        <span>Lemmikkimaksu</span>
                        <span>{breakdown.petTotal} €</span>
                    </div>
                )}

                {bookingDetails.extras.firewood && (
                    <div className="flex justify-between">
                        <span>Polttopuut</span>
                        <span>{PRICING.FIREWOOD} €</span>
                    </div>
                )}

                {bookingDetails.extras.lateCheckout && (
                    <div className="flex justify-between">
                        <span>Joustava aika</span>
                        <span>{PRICING.LATE_CHECKOUT} €</span>
                    </div>
                )}

                <div className="h-px bg-gray-200 my-2" />
                
                <div className="flex justify-between items-end text-gray-900">
                    <span className="font-bold">Yhteensä</span>
                    <span className="text-2xl font-bold">{finalPrice} €</span>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 text-xs text-gray-500 shadow-sm">
                <p className="mb-2"><span className="text-gray-900 font-semibold">Ajankohta:</span> {formatDateRange(startDate, endDate)}</p>
                <p><span className="text-gray-900 font-semibold">Henkilöt:</span> {bookingDetails.adults} aikuista, {bookingDetails.children} lasta</p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isCaptchaVerified || isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-gray-900 shadow-lg transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-auto
                    ${isCaptchaVerified && !isSubmitting
                    ? 'bg-[#ffd166] hover:bg-[#ffc642] shadow-orange-100 hover:shadow-orange-200' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }
                `}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Vahvista varaus"}
            </button>
        </div>
    </div>
  );
};

export default ContactForm;

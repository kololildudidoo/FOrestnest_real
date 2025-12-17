import React, { useState, useEffect } from 'react';
import { User, Mail, FileText, Check, Loader2, AlertCircle, Minus, Plus, PawPrint, Flame, Clock, CreditCard } from 'lucide-react';
import { formatDateRange, getDaysDifference } from '../utils/dateUtils';
import { UserDetails } from '../types';
import { createBooking } from '../services/bookingService';

interface UserDetailsFormProps {
  startDate: Date;
  endDate: Date;
  onSubmit: (details: UserDetails) => void;
}

// Pricing Constants
const BASE_PRICE_PER_NIGHT = 120; // Assumption based on context
const EXTRA_PERSON_PRICE_PER_NIGHT = 15;
const PET_FEE = 20;
const FIREWOOD_PRICE = 10;
const LATE_CHECKOUT_PRICE = 40;
const INCLUDED_GUESTS = 2;

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ startDate, endDate, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Booking Details State
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  const [extras, setExtras] = useState({
    firewood: false,
    lateCheckout: false
  });

  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price Calculation
  const nights = Math.max(1, getDaysDifference(startDate, endDate));
  const totalGuests = adults + children;
  const extraGuests = Math.max(0, totalGuests - INCLUDED_GUESTS);
  
  const basePriceTotal = nights * BASE_PRICE_PER_NIGHT;
  const extraPersonTotal = extraGuests * EXTRA_PERSON_PRICE_PER_NIGHT * nights;
  const petTotal = hasPets ? PET_FEE : 0;
  const extrasTotal = (extras.firewood ? FIREWOOD_PRICE : 0) + (extras.lateCheckout ? LATE_CHECKOUT_PRICE : 0);
  
  const finalPrice = basePriceTotal + extraPersonTotal + petTotal + extrasTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && isCaptchaVerified) {
      setIsSubmitting(true);
      setError(null);
      
      const userDetails: UserDetails = {
        name,
        email,
        notes,
        adults,
        children,
        hasPets,
        extras,
        totalPrice: finalPrice
      };

      try {
        await createBooking(startDate, endDate, userDetails);
        onSubmit(userDetails);
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

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => setter(value + 1);
  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number) => {
    if (value > min) setter(value - 1);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-4xl mx-auto md:mx-0">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vieraat ja lisäpalvelut</h2>
              <p className="text-gray-500 text-sm">Valitse henkilömäärä ja haluamasi lisäpalvelut.</p>
            </div>

            {/* People Quantity Editor */}
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex flex-col">
                     <span className="font-semibold text-gray-900">Aikuiset</span>
                     <span className="text-xs text-gray-500">Yli 12-vuotiaat</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <button 
                       type="button"
                       onClick={() => decrement(setAdults, adults, 1)}
                       className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                       disabled={adults <= 1}
                     >
                       <Minus size={16} />
                     </button>
                     <span className="w-4 text-center font-bold text-gray-900">{adults}</span>
                     <button 
                       type="button"
                       onClick={() => increment(setAdults, adults)}
                       className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                     >
                       <Plus size={16} />
                     </button>
                  </div>
               </div>

               <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex flex-col">
                     <span className="font-semibold text-gray-900">Lapset</span>
                     <span className="text-xs text-gray-500">2-12 vuotiaat</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <button 
                       type="button"
                       onClick={() => decrement(setChildren, children, 0)}
                       className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                       disabled={children <= 0}
                     >
                       <Minus size={16} />
                     </button>
                     <span className="w-4 text-center font-bold text-gray-900">{children}</span>
                     <button 
                       type="button"
                       onClick={() => increment(setChildren, children)}
                       className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                     >
                       <Plus size={16} />
                     </button>
                  </div>
               </div>

               {/* Pet Checkbox */}
               <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${hasPets ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex-1 flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${hasPets ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                        <PawPrint size={20} />
                     </div>
                     <div>
                        <span className="block font-semibold text-gray-900">Lemmikki mukana</span>
                        <span className="text-xs text-gray-500">+ {PET_FEE} € / varaus</span>
                     </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${hasPets ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                      {hasPets && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} />
               </label>
            </div>

            {/* Extras */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 mt-2">Lisäpalvelut</h3>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${extras.firewood ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                   <div className="flex-1 flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${extras.firewood ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                          <Flame size={20} />
                       </div>
                       <div>
                          <span className="block font-semibold text-gray-900">Polttopuut</span>
                          <span className="text-xs text-gray-500">2 saunavuoroa • + {FIREWOOD_PRICE} €</span>
                       </div>
                   </div>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${extras.firewood ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                       {extras.firewood && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                   </div>
                   <input type="checkbox" className="hidden" checked={extras.firewood} onChange={(e) => setExtras({...extras, firewood: e.target.checked})} />
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${extras.lateCheckout ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                   <div className="flex-1 flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${extras.lateCheckout ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                          <Clock size={20} />
                       </div>
                       <div>
                          <span className="block font-semibold text-gray-900">Joustava aika</span>
                          <span className="text-xs text-gray-500">Aikainen sisään / myöhäinen ulos (+2h) • + {LATE_CHECKOUT_PRICE} €</span>
                       </div>
                   </div>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${extras.lateCheckout ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                       {extras.lateCheckout && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                   </div>
                   <input type="checkbox" className="hidden" checked={extras.lateCheckout} onChange={(e) => setExtras({...extras, lateCheckout: e.target.checked})} />
                </label>
            </div>

            <hr className="border-gray-100" />
            
            {/* Contact Details */}
            <div>
               <h2 className="text-xl font-bold text-gray-900 mb-4">Yhteystiedot</h2>
               <div className="space-y-4">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm"
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm"
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
                        rows={3}
                        disabled={isSubmitting}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none transition-all placeholder:text-gray-300 shadow-sm resize-none"
                        placeholder="Erityistoiveita?"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
               </div>
            </div>
            
            {/* Captcha */}
            <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 select-none">
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

        {/* Right Column: Price Preview */}
        <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl sticky top-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                   <CreditCard size={20} className="text-[#ffd166]"/>
                   Hintaerittely
                </h3>
                
                <div className="space-y-3 text-sm text-gray-300 mb-6">
                    <div className="flex justify-between">
                        <span>{nights} yötä x {BASE_PRICE_PER_NIGHT} €</span>
                        <span>{basePriceTotal} €</span>
                    </div>
                    
                    {extraPersonTotal > 0 && (
                        <div className="flex justify-between text-[#ffd166]">
                           <span>Lisähenkilöt ({extraGuests})</span>
                           <span>{extraPersonTotal} €</span>
                        </div>
                    )}
                    
                    {hasPets && (
                        <div className="flex justify-between">
                           <span>Lemmikkimaksu</span>
                           <span>{petTotal} €</span>
                        </div>
                    )}

                    {extras.firewood && (
                        <div className="flex justify-between">
                           <span>Polttopuut</span>
                           <span>{FIREWOOD_PRICE} €</span>
                        </div>
                    )}

                    {extras.lateCheckout && (
                        <div className="flex justify-between">
                           <span>Joustava aika</span>
                           <span>{LATE_CHECKOUT_PRICE} €</span>
                        </div>
                    )}

                    <div className="h-px bg-gray-700 my-2" />
                    
                    <div className="flex justify-between items-end text-white">
                        <span className="font-medium">Yhteensä</span>
                        <span className="text-2xl font-bold">{finalPrice} €</span>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 mb-4 text-xs text-gray-400">
                    <p className="mb-2"><span className="text-white font-semibold">Ajankohta:</span> {formatDateRange(startDate, endDate)}</p>
                    <p><span className="text-white font-semibold">Henkilöt:</span> {adults} aikuista, {children} lasta</p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!isCaptchaVerified || isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-gray-900 shadow-lg transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2
                      ${isCaptchaVerified && !isSubmitting
                        ? 'bg-[#ffd166] hover:bg-[#ffc642] shadow-orange-900/20' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }
                    `}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Vahvista varaus"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetailsForm;

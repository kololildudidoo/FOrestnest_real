import React, { useState } from 'react';
import { Minus, Plus, PawPrint, Flame, Clock, Check, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { BookingDetails } from '../types';
import { getDaysDifference, formatDateRange } from '../utils/dateUtils';
import { calculateTotal, PRICING } from '../utils/pricing';

interface ExtrasSelectionProps {
  startDate: Date;
  endDate: Date;
  initialDetails: BookingDetails;
  onContinue: (details: BookingDetails) => void;
  onBack: () => void;
}

const ExtrasSelection: React.FC<ExtrasSelectionProps> = ({ startDate, endDate, initialDetails, onContinue, onBack }) => {
  const [adults, setAdults] = useState(initialDetails.adults);
  const [children, setChildren] = useState(initialDetails.children);
  const [hasPets, setHasPets] = useState(initialDetails.hasPets);
  const [extras, setExtras] = useState(initialDetails.extras);

  const nights = Math.max(1, getDaysDifference(startDate, endDate));
  const { finalPrice, breakdown } = calculateTotal(nights, adults, children, hasPets, extras);

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => setter(value + 1);
  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number) => {
    if (value > min) setter(value - 1);
  };

  const handleContinue = () => {
      onContinue({
          adults,
          children,
          hasPets,
          extras,
          totalPrice: finalPrice
      });
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

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vieraat ja lisäpalvelut</h2>
            <p className="text-gray-500 text-sm mb-6">Valitse henkilömäärä ja haluamasi lisäpalvelut.</p>
            
            <div className="space-y-6 max-w-xl">
                {/* People Quantity Editor */}
                <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors">
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">Aikuiset</span>
                        <span className="text-xs text-gray-500">Yli 12-vuotiaat</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                        onClick={() => decrement(setAdults, adults, 1)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-white"
                        disabled={adults <= 1}
                        >
                        <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-bold text-lg text-gray-900 tabular-nums">{adults}</span>
                        <button 
                        onClick={() => increment(setAdults, adults)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                        <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors">
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">Lapset</span>
                        <span className="text-xs text-gray-500">3-12 vuotiaat (alle 3 v maksutta)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                        onClick={() => decrement(setChildren, children, 0)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-white"
                        disabled={children <= 0}
                        >
                        <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-bold text-lg text-gray-900 tabular-nums">{children}</span>
                        <button 
                        onClick={() => increment(setChildren, children)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                        <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Pet Checkbox */}
                <label className={`group flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${hasPets ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex-1 flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg transition-colors ${hasPets ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                            <PawPrint size={20} />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Lemmikki mukana</span>
                            <span className="text-xs text-gray-500">+ {PRICING.PET_FEE} € / varaus</span>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${hasPets ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                        {hasPets && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} />
                </label>
                </div>

                {/* Extras */}
                <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Lisäpalvelut</h3>
                    
                    <label className={`group flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${extras.firewood ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex-1 flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg transition-colors ${extras.firewood ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                            <Flame size={20} />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Lisäpolttopuut</span>
                            <span className="text-xs text-gray-500">2 saunavuoroa • + {PRICING.FIREWOOD} €</span>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${extras.firewood ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                        {extras.firewood && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={extras.firewood} onChange={(e) => setExtras({...extras, firewood: e.target.checked})} />
                    </label>

                    <label className={`group flex items-center p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${extras.lateCheckout ? 'border-[#ffd166] bg-[#fffbf0]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex-1 flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg transition-colors ${extras.lateCheckout ? 'bg-[#ffd166] text-gray-900' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <span className="block font-semibold text-gray-900">Joustava aika</span>
                            <span className="text-xs text-gray-500">Aikainen sisään / myöhäinen ulos (+2h) • + {PRICING.LATE_CHECKOUT} €</span>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${extras.lateCheckout ? 'border-[#ffd166] bg-[#ffd166]' : 'border-gray-200'}`}>
                        {extras.lateCheckout && <Check size={14} className="text-gray-900" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={extras.lateCheckout} onChange={(e) => setExtras({...extras, lateCheckout: e.target.checked})} />
                    </label>
                </div>
            </div>
        </div>

        {/* Right Column: Price Preview (Sidebar) */}
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
                
                {hasPets && (
                    <div className="flex justify-between">
                        <span>Lemmikkimaksu</span>
                        <span>{breakdown.petTotal} €</span>
                    </div>
                )}

                {extras.firewood && (
                    <div className="flex justify-between">
                        <span>Polttopuut</span>
                        <span>{PRICING.FIREWOOD} €</span>
                    </div>
                )}

                {extras.lateCheckout && (
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
                <p><span className="text-gray-900 font-semibold">Henkilöt:</span> {adults} aikuista, {children} lasta</p>
            </div>

            <button
                onClick={handleContinue}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-gray-900 shadow-lg bg-[#ffd166] hover:bg-[#ffc642] shadow-orange-900/20 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
            >
                Jatka yhteystietoihin <ArrowRight size={18} />
            </button>
        </div>
    </div>
  );
};

export default ExtrasSelection;

import React from 'react';
import { Check, Calendar, Download, Users } from 'lucide-react';
import { BookingState } from '../types';
import { formatDateRange } from '../utils/dateUtils';

interface SuccessViewProps {
    bookingData: BookingState;
    onReset: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ bookingData, onReset }) => {
    const { contactDetails, bookingDetails } = bookingData;

    return (
        <div className="flex flex-col items-center justify-center text-center h-full py-12 animate-scale-in">
            <div className="w-20 h-20 bg-[#fff5d6] rounded-full flex items-center justify-center mb-8 animate-bounce-short">
                <Check className="w-10 h-10 text-[#e0b040]" strokeWidth={3} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Varaus vahvistettu!</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                Kaikki on valmista, {contactDetails?.name}. Olemme lähettäneet vahvistuksen ja maksulinkin osoitteeseen {contactDetails?.email}.
            </p>

            <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-lg p-6 mb-8 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd166] to-[#e0b040]"></div>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kohde</p>
                            <p className="font-semibold text-gray-900 capitalize">Forest Nest</p>
                         </div>
                         {bookingDetails?.totalPrice && (
                             <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hinta</p>
                                <p className="font-bold text-gray-900 text-lg">{bookingDetails.totalPrice} €</p>
                             </div>
                         )}
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full" />

                    <div className="flex gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-600 h-max">
                             <Calendar size={20} />
                        </div>
                        <div>
                             <p className="text-sm font-semibold text-gray-900">
                                {bookingData.startDate && bookingData.endDate ? formatDateRange(bookingData.startDate, bookingData.endDate) : ''}
                             </p>
                             <p className="text-xs text-gray-500">
                                Ajankohta
                             </p>
                        </div>
                    </div>

                    {bookingDetails && (
                        <div className="flex gap-4">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 h-max">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {bookingDetails.adults} aikuista, {bookingDetails.children} lasta
                                </p>
                                <p className="text-xs text-gray-500">
                                    {bookingDetails.hasPets ? '+ Lemmikki' : 'Ei lemmikkejä'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                    <Download size={18} />
                    Lisää kalenteriin
                </button>
                <button 
                    onClick={onReset}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all"
                >
                    Tee uusi varaus
                </button>
            </div>
        </div>
    );
};

export default SuccessView;
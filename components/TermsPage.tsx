import React from 'react';
import { ShieldCheck, Clock, Ban, DollarSign } from 'lucide-react';
import Navbar from './Navbar';

interface TermsPageProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigate, onStartBooking }) => {
  return (
    <div className="min-h-screen bg-white animate-fade-in">
       <Navbar onNavigate={onNavigate} onStartBooking={onStartBooking} variant="solid" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        <div className="space-y-4">
             <h2 className="text-4xl font-medium text-gray-900">Rental Terms</h2>
             <p className="text-gray-500 text-lg font-light leading-relaxed">
                 Please read these terms carefully before booking your stay at Forest Nest. By making a reservation, you agree to adhere to these rules.
             </p>
        </div>

        <div className="grid gap-8">
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-[#e0b040]" size={28} />
                    <h3 className="text-xl font-bold text-gray-900">Cancellation Policy</h3>
                </div>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                    <p>• <strong>Full Refund:</strong> Cancel up to 30 days before check-in for a 100% refund.</p>
                    <p>• <strong>50% Refund:</strong> Cancel between 14 and 30 days before check-in.</p>
                    <p>• <strong>No Refund:</strong> Cancellations made less than 14 days before check-in are non-refundable.</p>
                </div>
            </section>

            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-[#e0b040]" size={28} />
                    <h3 className="text-xl font-bold text-gray-900">Check-in & Check-out</h3>
                </div>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                    <p>• <strong>Check-in:</strong> After 15:00 (3:00 PM).</p>
                    <p>• <strong>Check-out:</strong> Before 11:00 (11:00 AM).</p>
                    <p className="text-sm text-gray-500 italic mt-2">Early check-in or late check-out may be available for an additional fee, subject to availability.</p>
                </div>
            </section>

             <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Ban className="text-[#e0b040]" size={28} />
                    <h3 className="text-xl font-bold text-gray-900">House Rules</h3>
                </div>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                    <p>• No smoking inside the cabin.</p>
                    <p>• Parties or events are not allowed.</p>
                    <p>• Quiet hours are from 22:00 to 07:00.</p>
                    <p>• Pets are allowed with a prior notification and payment of the pet fee.</p>
                    <p>• Leave the cabin in a tidy condition. Wash dishes and take out trash.</p>
                </div>
            </section>

             <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="text-[#e0b040]" size={28} />
                    <h3 className="text-xl font-bold text-gray-900">Payment & Security</h3>
                </div>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                    <p>Payment is due within 5 days of booking confirmation. We accept major credit cards and bank transfers via our secure payment link. We reserve the right to charge for damages exceeding normal wear and tear.</p>
                </div>
            </section>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
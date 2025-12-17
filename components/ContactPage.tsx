import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from './Navbar';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onStartBooking }) => {
  return (
    <div className="min-h-screen bg-white animate-fade-in">
       <Navbar onNavigate={onNavigate} onStartBooking={onStartBooking} variant="solid" />

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Info Section */}
            <div className="space-y-12">
                <div>
                    <h2 className="text-5xl font-medium text-gray-900 mb-6">Get in touch</h2>
                    <p className="text-xl text-gray-500 font-light leading-relaxed">
                        Have questions about the cabin, amenities, or the surrounding area? We're here to help. Send us a message and we'll respond within 24 hours.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#fffbf0] text-[#e0b040] flex items-center justify-center flex-shrink-0">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Email</h3>
                            <p className="text-gray-500">hello@forestnest.fi</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#fffbf0] text-[#e0b040] flex items-center justify-center flex-shrink-0">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Phone</h3>
                            <p className="text-gray-500">+358 40 123 4567</p>
                            <p className="text-xs text-gray-400">Mon-Fri 9am-5pm EET</p>
                        </div>
                    </div>

	                    <div className="flex items-start gap-6">
	                        <div className="w-12 h-12 rounded-2xl bg-[#fffbf0] text-[#e0b040] flex items-center justify-center flex-shrink-0">
	                            <MapPin size={24} />
	                        </div>
	                        <div>
	                            <h3 className="font-bold text-gray-900 text-lg">Location</h3>
	                            <p className="text-gray-500">Hirsjärvi, Finland</p>
	                        </div>
	                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1">Name</label>
                        <input type="text" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1">Email</label>
                        <input type="email" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1">Message</label>
                        <textarea rows={5} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-100 focus:border-[#ffd166] outline-none resize-none" placeholder="How can we help?" />
                    </div>
                    <button type="button" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

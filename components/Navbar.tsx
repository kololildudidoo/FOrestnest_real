import React, { useState } from 'react';
import { TreePine, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
  variant?: 'transparent' | 'solid';
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onStartBooking, variant = 'solid' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (page: string) => {
    const normalizedPage = page === 'location' || page === 'locations' ? 'contact' : page;
    onNavigate(normalizedPage);
    setIsMobileMenuOpen(false);
  };

  // Styles based on variant
  const containerClass = variant === 'transparent' 
    ? "absolute top-0 left-0 right-0 z-50 px-6 py-8 sm:px-12 sm:py-10 flex justify-between items-center transition-all"
    : "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center transition-all";
  
  const textClass = variant === 'transparent' ? "text-white" : "text-gray-900";
  const logoBgClass = variant === 'transparent' ? "bg-[#ffd166] text-gray-900" : "bg-[#ffd166] text-gray-900";
  
  // Adjusted nav background for better visibility on both variants
  const navBgClass = variant === 'transparent' 
    ? "bg-white/10 border border-white/10 text-white/90" 
    : "bg-gray-100/50 border border-gray-200 text-gray-600";
    
  const navHoverClass = variant === 'transparent' ? "hover:bg-white/10" : "hover:bg-white hover:text-gray-900 hover:shadow-sm";
  
  const buttonClass = variant === 'transparent' 
    ? "bg-white/10 hover:bg-white/20 text-white border-white/20" 
    : "bg-gray-900 hover:bg-black text-white border-transparent";

  return (
    <>
      <header className={containerClass}>
        {/* Logo */}
        <div 
            onClick={() => handleNav('landing')}
            className={`flex items-center gap-3 relative z-10 cursor-pointer group`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/5 transition-transform group-hover:scale-105 ${logoBgClass}`}>
                <TreePine size={22} strokeWidth={2.5} />
            </div>
            <span className={`font-semibold text-xl tracking-tight drop-shadow-sm ${textClass}`}>Forest Nest</span>
        </div>

	        {/* Desktop Nav */}
	        <nav className={`hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 font-normal text-sm drop-shadow-sm backdrop-blur-md px-2 py-1.5 rounded-full ${navBgClass}`}>
	            <button onClick={() => handleNav('contact')} className={`px-5 py-2.5 rounded-full transition-all ${navHoverClass}`}>Contact</button>
	            <button onClick={() => handleNav('gallery')} className={`px-5 py-2.5 rounded-full transition-all ${navHoverClass}`}>The Cabin</button>
	            <button onClick={() => handleNav('experiences')} className={`px-5 py-2.5 rounded-full transition-all ${navHoverClass}`}>Experiences</button>
	            <button onClick={() => handleNav('terms')} className={`px-5 py-2.5 rounded-full transition-all ${navHoverClass}`}>Terms</button>
	        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 relative z-10">
            <button 
                onClick={onStartBooking}
                className={`hidden sm:block backdrop-blur-md border px-8 py-3 rounded-full font-semibold text-sm transition-all active:scale-95 shadow-lg ${buttonClass}`}
            >
                Book Now
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`md:hidden backdrop-blur-md border p-3 rounded-full transition-all active:scale-95 shadow-lg ${buttonClass}`}
            >
                <Menu size={20} />
            </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in p-6">
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
                <X size={32} />
            </button>

            <nav className="flex flex-col items-center gap-8 text-white text-2xl font-light tracking-wide">
                <button onClick={() => handleNav('landing')} className="hover:text-[#ffd166] transition-colors">Home</button>
                <button onClick={() => handleNav('contact')} className="hover:text-[#ffd166] transition-colors">Location</button>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#ffd166] transition-colors">The Cabin</button>
                <button onClick={() => handleNav('experiences')} className="hover:text-[#ffd166] transition-colors">Experiences</button>
                <button onClick={() => handleNav('terms')} className="hover:text-[#ffd166] transition-colors">Terms</button>
                <button 
                    onClick={() => {
                        onStartBooking();
                        setIsMobileMenuOpen(false);
                    }}
                    className="mt-8 bg-[#ffd166] text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl"
                >
                    Book Now
                </button>
            </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;

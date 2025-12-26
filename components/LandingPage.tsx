import React, { useEffect, useState } from 'react';
import { 
  Star, MapPin, Wifi, User, Users, Calendar,
  Flame, Utensils, Tv, Wind, Coffee, Wine, BookOpen, 
  Stethoscope, TreePine, Snowflake, Home, Droplets, Map, Car, 
  ShieldCheck, Thermometer, Sparkles, Search, ArrowRight, Plus,
  Waves, Sun, Bike, Music, Briefcase, Umbrella, Zap, Lock, ShowerHead, Archive, Moon, Mountain
} from 'lucide-react';
import Navbar from './Navbar';

// --- CONFIGURATION ---
const HERO_IMAGE_URL = "/images/background.jpg";
const MAP_PREVIEW_URL = "public/images/Screenshot 2025-12-17 at 19.37.06.jpeg";
const FOREST_NEST_ADDRESS = "Hirsjärvi, Finland";
const GOOGLE_MAPS_URL = `https://www.google.com/maps/place/60%C2%B033'27.3%22N+23%C2%B040'59.3%22E/@60.557579,23.6805731,17z/data=!3m1!4b1!4m13!1m8!3m7!1s0x468c2c388a0fbf33:0x2600b5523c18fe41!2s31460+Hirsj%C3%A4rvi!3b1!8m2!3d60.6011701!4d23.645668!16s%2Fg%2F120t3zwl!3m3!8m2!3d60.557579!4d23.683148?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D`;
const LOCATION_MAP_BACKGROUND_URL = "/images/Screenshot 2025-12-17 at 19.37.06.jpeg";

const FRONT_PAGE_GALLERY = [
  { src: "/images/about.webp", label: "Cabin exterior", span: "md:col-span-2 md:row-span-2", variant: "primary" as const },
  { src: "/images/329d1c25-8f01-411f-8522-240681822003.jpg", label: "Living area", variant: "badge" as const },
  { src: "/images/5e116910-052b-4744-88cc-1332658491b8.jpg", label: "Kitchen", variant: "badge" as const },
  { src: "/images/ccbb310f-db0e-469b-85d8-3041d7a8799a.webp", label: "Open full gallery", span: "md:col-span-2", variant: "cta" as const },
];

// --- CUSTOM ICONS ---
const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
);

const BedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
);

// --- DATA ---
const REVIEWS = [
    {
        name: "Juhani",
        date: "Oct 2023",
        text: "Absolutely stunning place. The silence was magical and the sauna was perfect.",
        img: "https://i.pravatar.cc/100?img=60"
    },
    {
        name: "Elina",
        date: "Sep 2023",
        text: "Best Airbnb experience in Finland so far. Highly recommended for families.",
        img: "https://i.pravatar.cc/100?img=44"
    },
    {
        name: "Marcus",
        date: "Aug 2023",
        text: "A true gem in the forest. Stylish, clean, and very peaceful.",
        img: "https://i.pravatar.cc/100?img=11"
    }
];

const ALL_AMENITIES = [
    { icon: <Flame />, label: "Sauna" },
    { icon: <Wifi />, label: "Fast WiFi" },
    { icon: <Car />, label: "Free parking" },
    { icon: <Utensils />, label: "Full Kitchen" },
    { icon: <Tv />, label: "HD TV" },
    { icon: <Droplets />, label: "Washing machine" },
    { icon: <Wind />, label: "AC - Split type" },
    { icon: <Thermometer />, label: "Indoor fireplace" },
    { icon: <KeyIcon />, label: "Private entrance" },
    { icon: <Coffee />, label: "Nespresso" },
    { icon: <Wine />, label: "Wine glasses" },
    { icon: <BedIcon />, label: "Premium linen" },
    { icon: <BookOpen />, label: "Library" },
    { icon: <Sparkles />, label: "Kids toys" },
    { icon: <ShieldCheck />, label: "Smoke alarm" },
    { icon: <Stethoscope />, label: "First aid kit" },
    { icon: <TreePine />, label: "Private Garden" },
    { icon: <Wind />, label: "Hair dryer" },
    { icon: <Snowflake />, label: "Refrigerator" },
    { icon: <Utensils />, label: "BBQ grill" },
    { icon: <Waves />, label: "Lake access" },
    { icon: <Sun />, label: "Patio" },
    { icon: <Bike />, label: "Bikes available" },
    { icon: <Music />, label: "Sound system" },
    { icon: <Briefcase />, label: "Workspace" },
    { icon: <Umbrella />, label: "Outdoor dining" },
    { icon: <Zap />, label: "EV charger" },
    { icon: <Lock />, label: "Smart lock" },
    { icon: <ShowerHead />, label: "Outdoor shower" },
    { icon: <Archive />, label: "Luggage dropoff" },
    { icon: <Moon />, label: "Blackout shades" },
    { icon: <Mountain />, label: "Hiking trails" }
];

interface LandingPageProps {
  onStartBooking: () => void;
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartBooking, onNavigate }) => {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Auto-rotate reviews every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const displayedAmenities = showAllAmenities ? ALL_AMENITIES : ALL_AMENITIES.slice(0, 8);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Main Container */}
      <div className="w-full bg-white relative min-h-screen flex flex-col">
        
        {/* Unified Navbar */}
        <Navbar 
          onNavigate={onNavigate} 
          onStartBooking={onStartBooking} 
          variant="transparent" 
        />

        {/* Hero Section */}
        <section className="relative min-h-screen w-full overflow-hidden shadow-2xl pt-28 sm:pt-32 pb-16 sm:pb-24">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gray-900">
                <img 
                    src={HERO_IMAGE_URL}
                    alt="Cabin in forest" 
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-4 sm:pt-8 pb-44">
                <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-medium text-white mb-8 tracking-tight drop-shadow-xl leading-[1.1]">
                    Find your calm <br/>
                    <span className="text-[#ffd166] font-semibold">in the forest</span>
                </h1>
                
                <p className="text-white/90 text-lg sm:text-xl max-w-xl font-light drop-shadow-md leading-relaxed mb-10">
                    Discover handpicked luxury in the Finnish forest. Unplug, unwind, and reconnect with what matters most.
                </p>
            </div>

	            {/* Bottom Stats / Floating Elements */}
	            <div className="absolute bottom-52 w-full px-8 sm:px-12 flex justify-between items-end max-w-[1600px] left-1/2 -translate-x-1/2 z-20">
	                 
	                 {/* Map Badge - Circular Style */}
	                 <a
	                    href={GOOGLE_MAPS_URL}
	                    target="_blank"
	                    rel="noreferrer"
	                    aria-label={`Open ${FOREST_NEST_ADDRESS} in Google Maps`}
	                    className="hidden md:block transition-transform hover:scale-105 duration-300 cursor-pointer group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40 rounded-full"
	                 >
	                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-[3px] border-white/40 ring-4 ring-[#dcb575]/80 shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-[#e8e4d9]">
	                         {/* Map Image */}
	                         <img 
	                            src={MAP_PREVIEW_URL}
	                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity scale-150" 
	                            alt="map" 
	                            style={{ filter: 'sepia(0.2) contrast(1.1)' }}
	                         />
                         
                         {/* Overlay Gradient for depth */}
                         <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#dcb575]/20 mix-blend-overlay" />

	                         {/* Custom Pin - Black Diamond with Ripples */}
	                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
	                             {/* Outer ripple */}
	                             <div className="absolute w-12 h-12 border border-gray-600/30 rounded-full animate-ping opacity-75" />
	                             {/* Inner ripple */}
	                             <div className="absolute w-8 h-8 border border-gray-800/50 rounded-full" />
	                             {/* The Pin Itself (Diamond) */}
	                             <div className="w-4 h-4 bg-gray-900 rotate-45 rounded-[2px] shadow-sm z-10 relative">
	                                <div className="absolute inset-0 bg-black blur-[1px] opacity-50 translate-y-1" />
	                             </div>
	                         </div>
	                    </div>
	                 </a>

                 {/* Rating Badge */}
                 <div className="hidden md:block text-white text-right drop-shadow-md pb-2">
                     <div className="flex items-center gap-2 justify-end text-5xl font-semibold tracking-tight">
                         <Star fill="#ffd166" className="text-[#ffd166]" size={28} /> 4.98
                     </div>
                     <div className="flex items-center gap-2 justify-end mt-1 opacity-90">
                        <span className="underline font-medium hover:text-[#ffd166] cursor-pointer transition-colors pointer-events-auto">242 reviews</span>
                        <span>•</span>
                        <span className="font-light">Superhost</span>
                     </div>
                 </div>
            </div>

            {/* Action Bar - Rounded Pill Shape */}
            <div 
                onClick={onStartBooking}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl bg-white rounded-full p-2 pr-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row gap-2 cursor-pointer transition-transform hover:scale-[1.01] items-center border border-gray-200"
            >
                {/* Location */}
                <div className="flex-1 flex items-center gap-4 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors group w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                        <MapPin size={22} />
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest">Location</p>
	                        <p className="font-medium text-gray-500 truncate">Hirsjärvi, Finland</p>
                    </div>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-10 bg-gray-200" />

                {/* Check In */}
                <div className="flex-1 flex items-center gap-4 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors group w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                        <Calendar size={22} />
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest">Check in</p>
                        <p className="font-medium text-gray-500 truncate">Add dates</p>
                    </div>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-10 bg-gray-200" />

                {/* Guests */}
                <div className="flex-1 flex items-center gap-4 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors group w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                        <Users size={22} />
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest">Guests</p>
                        <p className="font-medium text-gray-500 truncate">Add guests</p>
                    </div>
                </div>

                {/* Search Button */}
                <div className="pl-2">
                    <button className="bg-[#ffd166] hover:bg-[#ffc642] text-gray-900 w-12 h-12 sm:w-16 sm:h-16 rounded-full font-bold text-lg shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <Search size={28} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </section>

        {/* Content Section */}
        <div className="px-6 py-20 sm:px-12 md:py-32 max-w-7xl mx-auto w-full space-y-32">
            
            {/* Intro Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-[#fffbf0] text-[#e0b040] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase">
                        <TreePine size={14} /> Welcome to Finland
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900 leading-[1.1] tracking-tight">
                        Forest home by a <br/> quiet pond.
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-light">
                        Our place is tucked in the middle of the Finnish forest, about an hour’s drive from Helsinki or Turku. The house blends Scandinavian simplicity with an artistic touch, offering a sanctuary where time slows down.
                    </p>
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-4">
                        <div className="flex -space-x-4">
                            {[1,2,3].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="host" />
                            ))}
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-gray-900 text-base">Hosted by Sarah & Tom</p>
                            <p className="text-gray-400">Superhosts • 5 year hosting</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-10">
                     <div className="flex items-start gap-6 group">
                         <div className="bg-white p-4 rounded-[1.5rem] shadow-sm text-[#e0b040] group-hover:scale-110 transition-transform duration-300">
                             <Home size={28} />
                         </div>
                         <div>
                             <h3 className="font-bold text-xl text-gray-900 mb-2">Sleeps up to 8 Guests</h3>
                             <p className="text-gray-500 leading-relaxed">Two bedrooms plus a sofa bed downstairs and another in the upstairs lounge keep everyone comfortable.</p>
                         </div>
                     </div>
                     <div className="flex items-start gap-6 group">
                         <div className="bg-white p-4 rounded-[1.5rem] shadow-sm text-[#e0b040] group-hover:scale-110 transition-transform duration-300">
                             <Sparkles size={28} />
                         </div>
                         <div>
                             <h3 className="font-bold text-xl text-gray-900 mb-2">Family-ready</h3>
                             <p className="text-gray-500 leading-relaxed">Toys, indoor and outdoor games, a travel crib, and a high chair are waiting for you.</p>
                         </div>
                     </div>
                     <div className="flex items-start gap-6 group">
                         <div className="bg-white p-4 rounded-[1.5rem] shadow-sm text-[#e0b040] group-hover:scale-110 transition-transform duration-300">
                             <TreePine size={28} />
                         </div>
                         <div>
                             <h3 className="font-bold text-xl text-gray-900 mb-2">Nature at doorstep</h3>
                             <p className="text-gray-500 leading-relaxed">National park 20–30 minutes away, activity park nearby, and Somerniemi summer market just 5 km down the road.</p>
                         </div>
                     </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                     <div>
                        <h2 className="text-4xl font-medium text-gray-900 tracking-tight mb-2">Explore the space</h2>
                        <p className="text-gray-500 font-light text-lg">Every corner designed for relaxation.</p>
                     </div>
                     <button onClick={() => onNavigate('gallery')} className="hidden md:flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium">
                        View all photos <ArrowRight size={16} />
                     </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-[800px] md:h-[600px]">
                  {FRONT_PAGE_GALLERY.map((image, idx) => {
                    const isPrimary = image.variant === 'primary';
                    const isCta = image.variant === 'cta';
                    const spanClass = image.span ?? '';

                    return (
                      <div
                        key={image.src}
                        onClick={() => onNavigate('gallery')}
                        className={`relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm ${spanClass}`}
                      >
                        <img
                          src={image.src}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                          alt={image.label}
                        />
                        <div className={`absolute inset-0 transition-opacity duration-500 ${isCta ? 'bg-black/20 group-hover:bg-black/10' : 'bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100'}`} />
                        {isCta ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform hover:bg-white">
                              <Plus size={24} />
                            </div>
                          </div>
                        ) : isPrimary ? (
                          <div className="absolute bottom-6 left-6 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <p className="font-medium text-lg">{image.label}</p>
                            <p className="text-white/80 text-sm">Tap to view the full gallery</p>
                          </div>
                        ) : (
                          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <button onClick={() => onNavigate('gallery')} className="md:hidden w-full flex items-center justify-center gap-2 border border-gray-200 px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                    View all photos <ArrowRight size={16} />
                </button>
            </div>

            {/* Airbnb Trust Section (Guest Favorites) */}
            <div className="bg-[#fffbf0] rounded-[3rem] p-10 sm:p-20 flex flex-col xl:flex-row items-start justify-between gap-16 relative overflow-hidden">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                     <ShieldCheck size={500} />
                </div>
                
                {/* Left: Ratings Badge */}
                <div className="relative z-10 w-full xl:w-auto">
                    <div className="flex items-center gap-2 mb-6">
                         <Star fill="#ffd166" className="text-[#ffd166]" size={28} /> 
                         <span className="font-bold text-2xl tracking-tight">Guest Favorite</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6 tracking-tight max-w-lg">One of the most loved homes on Airbnb</h2>
                    
                     <div className="flex gap-12 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/50 shadow-sm w-max">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-1">4.9</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Rating</div>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-1">242</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Reviews</div>
                        </div>
                    </div>
                </div>

                {/* Right: Reviews Carousel */}
                <div className="relative z-10 w-full xl:w-auto xl:min-w-[400px] flex flex-col items-center xl:items-end">
                    <div key={currentReviewIndex} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 w-full max-w-md animate-fade-in">
                        <div className="flex gap-1 mb-4">
                            {[1,2,3,4,5].map(star => <Star key={star} size={16} className="text-gray-900" fill="black" />)}
                        </div>
                        <p className="text-gray-600 font-light text-lg mb-6 leading-relaxed">"{REVIEWS[currentReviewIndex].text}"</p>
                        <div className="flex items-center gap-4 mt-auto">
                            <img src={REVIEWS[currentReviewIndex].img} alt={REVIEWS[currentReviewIndex].name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-gray-900">{REVIEWS[currentReviewIndex].name}</p>
                                <p className="text-sm text-gray-400">{REVIEWS[currentReviewIndex].date}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Indicators */}
                    <div className="flex gap-2 mt-6 justify-center xl:justify-start">
                       {REVIEWS.map((_, idx) => (
                           <div 
                              key={idx} 
                              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentReviewIndex ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'}`}
                           />
                       ))}
                    </div>
                </div>
            </div>

            {/* Amenities Grid */}
            <div>
                 <h2 className="text-4xl font-medium text-gray-900 mb-16 tracking-tight">What this place offers</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {displayedAmenities.map((amenity, index) => (
                        <Amenity key={index} icon={amenity.icon} label={amenity.label} />
                    ))}
                 </div>
                 
                 <button 
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-16 border border-gray-900 text-gray-900 px-10 py-4 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all text-sm uppercase tracking-wider"
                 >
                     {showAllAmenities ? `Show less` : `Show all ${ALL_AMENITIES.length} amenities`}
                 </button>
            </div>

	            {/* Location Section */}
	            <div className="space-y-10">
	                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
	                    <div>
	                        <h2 className="text-4xl font-medium text-gray-900 tracking-tight">Where you’ll be</h2>
	                        <p className="text-gray-500 font-light text-lg mt-2">{FOREST_NEST_ADDRESS}</p>
	                    </div>
	                    <a
	                        href={GOOGLE_MAPS_URL}
	                        target="_blank"
	                        rel="noreferrer"
	                        className="inline-flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium w-max focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
	                    >
	                        Open in Google Maps <ArrowRight size={16} />
	                    </a>
	                </div>

			            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
	                 <a
	                     href={GOOGLE_MAPS_URL}
	                     target="_blank"
	                     rel="noreferrer"
	                     aria-label={`Open ${FOREST_NEST_ADDRESS} in Google Maps`}
	                     className="lg:col-span-1 bg-[#1a1a1a] rounded-[3rem] p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer self-stretch block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
	                 >
	                     <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffd166] rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-700"></div>
	                     
	                     <div className="relative z-10">
	                        <div className="bg-white/10 backdrop-blur-md w-max p-4 rounded-2xl mb-8 border border-white/5">
	                             <MapPin className="text-[#ffd166]" size={28} />
	                        </div>
	                        <h3 className="text-3xl sm:text-4xl font-medium mb-6">Deep in the forest</h3>
	                        <p className="text-gray-400 leading-relaxed mb-8 text-base sm:text-lg font-light">
	                            A quiet sand road leads you through the pines to a clearing by the pond. You’ll park right beside the house, then step straight into the woods.
	                        </p>
	                        <p className="text-gray-300/80 text-sm font-medium tracking-wide">{FOREST_NEST_ADDRESS}</p>
	                     </div>

	                     <div className="space-y-5 relative z-10 text-base sm:text-lg">
	                         <div className="flex justify-between items-center border-b border-white/10 pb-4">
	                             <span className="font-light">Helsinki / Turku</span>
	                             <span className="font-bold text-[#ffd166]">~1 hour</span>
	                         </div>
                         <div className="flex justify-between items-center border-b border-white/10 pb-4">
                             <span className="font-light">Tampere</span>
                             <span className="font-bold text-[#ffd166]">~2 hours</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/10 pb-4">
                             <span className="font-light">Somerniemi Market</span>
                             <span className="font-bold text-[#ffd166]">5 km</span>
	                         </div>
	                     </div>
	                 </a>

	                 {/* Map Placeholder */}
	                 <a
	                     href={GOOGLE_MAPS_URL}
	                     target="_blank"
	                     rel="noreferrer"
	                     aria-label={`Open ${FOREST_NEST_ADDRESS} in Google Maps`}
	                     className="lg:col-span-2 bg-gray-200 rounded-[3rem] overflow-hidden relative group cursor-pointer h-[420px] sm:h-[520px] lg:h-auto block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40 self-stretch bg-cover bg-center"
	                     style={{ backgroundImage: `url("${encodeURI(LOCATION_MAP_BACKGROUND_URL)}")` }}
	                 >
	                     <div className="absolute inset-0" />
	                     
	                     {/* Phone Map Overlay */}
	                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-72 max-w-[85%] bg-white/95 backdrop-blur-md rounded-[2.5rem] p-4 shadow-2xl transform -rotate-2 border-[6px] border-white/40 ring-1 ring-black/5">
	                        {/* Phone Header simulation */}
	                        <div className="flex justify-between items-center mb-4 px-2 opacity-40">
	                             <div className="text-[10px] font-bold">9:41</div>
	                             <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full bg-black"></div>
                                <div className="w-3 h-3 rounded-full bg-black"></div>
                             </div>
                        </div>

                        {/* Map Card Content */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner mb-2">
                           <div className="flex items-center gap-3">
                               <div className="w-12 h-12 bg-[#ffd166] rounded-full flex items-center justify-center shadow-sm">
                                   <Home size={20} className="text-gray-900" />
                               </div>
	                               <div>
	                                   <p className="font-bold text-gray-900">Forest Nest</p>
	                                   <p className="text-xs text-gray-500">{FOREST_NEST_ADDRESS} • 4.98 ★</p>
	                               </div>
	                           </div>
                           <div className="mt-4 flex gap-2">
                               <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500 w-2/3"></div>
                               </div>
                               <div className="text-[10px] text-gray-400 font-bold whitespace-nowrap">12 min</div>
                           </div>
	                        </div>
	                        
	                        <div className="h-1 bg-gray-200 rounded-full mx-auto w-1/3 mt-2 opacity-50"></div>
	                     </div>

	                     <div className="absolute bottom-8 right-8">
	                         <div className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold shadow-2xl group-hover:scale-105 transition-transform flex items-center gap-3">
	                             <Map size={20} /> View on Google Maps
	                         </div>
	                     </div>
	                 </a>
	            </div>
	            </div>

             {/* Footer CTA */}
             <div className="bg-[#fffbf0] rounded-[3rem] p-12 sm:p-24 text-center space-y-8">
                 <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">Ready for your escape?</h2>
                 <p className="text-gray-500 max-w-xl mx-auto text-xl font-light">Book your stay at Forest Nest today and experience the magic of the Finnish wilderness.</p>
                 <button 
                    onClick={onStartBooking}
                    className="bg-gray-900 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-black transition-all active:scale-95 shadow-xl hover:shadow-2xl"
                 >
                     Check Availability
                 </button>
             </div>
             
             <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm pb-8 px-8 border-t border-gray-100 pt-8 mt-12">
                 <p>© 2024 Forest Nest. All rights reserved.</p>
                 <div className="flex gap-6 mt-4 sm:mt-0">
                    <button className="hover:text-gray-900">Privacy</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-gray-900">Terms</button>
                    <button className="hover:text-gray-900">Sitemap</button>
                 </div>
             </div>

        </div>
      </div>
    </div>
  );
};

// Helper Components
const Amenity = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-4 text-gray-700 group cursor-default">
        <div className="text-gray-400 group-hover:text-gray-900 transition-colors">{icon}</div>
        <span className="text-lg font-light group-hover:font-normal transition-all">{label}</span>
    </div>
);

export default LandingPage;

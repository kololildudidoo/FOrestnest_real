import React from 'react';
import { MapPin, TreePine, Sun, Compass, Coffee } from 'lucide-react';
import Navbar from './Navbar';

interface ExperiencesPageProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
}

const ExperiencesPage: React.FC<ExperiencesPageProps> = ({ onNavigate, onStartBooking }) => {
  const experiences = [
    {
      title: "Iso-Valkee -järven virkistysalue",
      location: "Somerniemi",
      description: "A crystal-clear lake with a nature trail around the shore, great for day hikes, swimming spots, and birdwatching.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/05/IMG_9856-scaled.jpg",
      link: "https://visitsomero.fi/ilmoittaja/iso-valkee",
      icon: <TreePine size={20} />
    },
    {
      title: "Someron Koirametsä",
      location: "Somero",
      description: "A private, fenced forest you can book for off-leash dog time, playdates, and quiet walks.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/06/Someron-Koirametsa-1.jpg",
      link: "https://visitsomero.fi/ilmoittaja/someron-koirametsa",
      icon: <Compass size={20} />
    },
    {
      title: "Hiidenlinna Park Resort",
      location: "Somero",
      description: "A full-day adventure park with treetop courses, zoo attractions, and playful forest trails for all ages.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/05/35543406_1719308358185459_4962796231915995136_n-1-e1720102335517.jpg",
      link: "https://visitsomero.fi/ilmoittaja/hiidenlinna-park-resort",
      icon: <Compass size={20} />
    },
    {
      title: "Huvila Härkä",
      location: "Somero",
      description: "A historic farm courtyard with a summer cafe, small shop, and leafy garden corners to linger in.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/05/cover_photo-600-Huvila-Harka.jpg",
      link: "https://visitsomero.fi/ilmoittaja/huvila-harka",
      icon: <Coffee size={20} />
    },
    {
      title: "Somerniemen Kesätori",
      location: "Somerniemi",
      description: "A lively Saturday summer market filled with local produce, crafts, and relaxed village vibes.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/05/cover_photo-600-Somerniemen-Kesatori.jpg",
      link: "https://visitsomero.fi/ilmoittaja/somerniemen-kesatori",
      icon: <Coffee size={20} />
    },
    {
      title: "Hämeen Härkätie",
      location: "Somero region",
      description: "A historic route between Turku and Hämeenlinna, ideal for scenic drives and cycling detours.",
      image: "https://visitsomero.fi/wp-content/uploads/2024/05/somero-brandikuvat-2022-photo-jouni_kuru-brave_teddy-2400px-19-1-e1720607491201.jpg",
      link: "https://visitsomero.fi/ilmoittaja/hameen-harkatie",
      icon: <Sun size={20} />
    }
  ];

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      <Navbar onNavigate={onNavigate} onStartBooking={onStartBooking} variant="solid" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <span className="text-[#e0b040] font-bold tracking-widest uppercase text-xs">Explore the Area</span>
             <h2 className="text-4xl md:text-5xl font-medium text-gray-900">Deep forest, lively culture.</h2>
             <p className="text-gray-500 text-lg font-light">
                 Forest Nest is located in Somero, Finland, known for its vibrant summer culture, deep forests, and beautiful manor houses.
             </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp, idx) => (
                <a
                    key={idx}
                    href={exp.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${exp.title} on Visit Somero`}
                    className="group rounded-[2rem] overflow-hidden bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
                >
                    <div className="h-64 overflow-hidden relative">
                        <img 
                            src={exp.image} 
                            alt={exp.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1">
                            <MapPin size={12} className="text-[#e0b040]" /> {exp.location}
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="w-12 h-12 bg-[#fffbf0] rounded-2xl flex items-center justify-center text-[#e0b040] mb-6 group-hover:scale-110 transition-transform">
                            {exp.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{exp.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-light">
                            {exp.description}
                        </p>
                        <div className="mt-6 text-sm font-semibold text-gray-900">
                            VisitSomero.fi
                        </div>
                    </div>
                </a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencesPage;

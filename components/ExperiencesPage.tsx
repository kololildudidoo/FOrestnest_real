import React from 'react';
import { MapPin, TreePine, Sun, Compass, Coffee, Music, Fish } from 'lucide-react';
import Navbar from './Navbar';

interface ExperiencesPageProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
}

const ExperiencesPage: React.FC<ExperiencesPageProps> = ({ onNavigate, onStartBooking }) => {
  const experiences = [
    {
      title: "Torronsuo National Park",
      distance: "25 min drive",
      description: "Finland's deepest bog. Extensive duckboard trails perfect for day hiking and bird watching. In winter, it offers excellent skiing tracks.",
      image: "https://images.unsplash.com/photo-1440557653017-487bc2a3ca90?auto=format&fit=crop&q=80&w=800",
      icon: <TreePine size={20} />
    },
    {
      title: "Somerniemi Summer Market",
      distance: "5 km away",
      description: "A legendary local market open on Saturdays during summer. Fresh local produce, handicrafts, flea market finds, and live atmosphere.",
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
      icon: <Coffee size={20} />
    },
    {
      title: "Lake Iso-Valkee",
      distance: "15 min drive",
      description: "A crystal clear wilderness lake with a 3km hiking trail around it. Great for swimming, picnicking, and enjoying absolute silence.",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
      icon: <Fish size={20} />
    },
    {
      title: "Hiidenlinna Adventure Park",
      distance: "20 min drive",
      description: "Fun for the whole family. Climbing parks, troll forests, and an eccentric castle structure in the middle of the woods.",
      image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
      icon: <Compass size={20} />
    },
    {
      title: "Ämyri Dance Pavilion",
      distance: "10 min drive",
      description: "Experience traditional Finnish dance culture at one of the most popular dance pavilions in Southern Finland.",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800",
      icon: <Music size={20} />
    },
    {
      title: "Härkälinna",
      distance: "20 min drive",
      description: "A unique wooden castle restaurant offering local delicacies and a medieval atmosphere.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
      icon: <UtensilsIcon />
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
                 Forest Nest is located in Hirsjärvi, Finland, known for its vibrant summer culture, deep forests, and beautiful manor houses.
             </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp, idx) => (
                <div key={idx} className="group rounded-[2rem] overflow-hidden bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="h-64 overflow-hidden relative">
                        <img 
                            src={exp.image} 
                            alt={exp.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1">
                            <MapPin size={12} className="text-[#e0b040]" /> {exp.distance}
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
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const UtensilsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default ExperiencesPage;

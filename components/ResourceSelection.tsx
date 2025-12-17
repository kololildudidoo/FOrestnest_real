import React from 'react';
import { Package, Briefcase } from 'lucide-react';
import { ResourceType } from '../types';

interface ResourceSelectionProps {
  onSelect: (resource: ResourceType) => void;
}

const ResourceSelection: React.FC<ResourceSelectionProps> = ({ onSelect }) => {
  return (
    <div className="h-full flex flex-col justify-center animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Equipment</h2>
      <p className="text-gray-500 mb-8">What do you need for your project?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('art-bag')}
          className="group relative flex flex-col items-center justify-center p-8 gap-4 rounded-2xl border-2 border-gray-100 hover:border-[#ffd166] hover:shadow-lg hover:shadow-orange-100/50 bg-white transition-all duration-300 text-left"
        >
          <div className="p-4 bg-[#fffbf0] rounded-full group-hover:scale-110 transition-transform duration-300">
            <Package className="w-8 h-8 text-[#e0b040]" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">Art Bag</h3>
            <p className="text-sm text-gray-500 mt-1">Portable basic supplies kit.</p>
          </div>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#ffd166]/10" />
        </button>

        <button
          onClick={() => onSelect('art-suitcase')}
          className="group relative flex flex-col items-center justify-center p-8 gap-4 rounded-2xl border-2 border-gray-100 hover:border-[#ffd166] hover:shadow-lg hover:shadow-orange-100/50 bg-white transition-all duration-300 text-left"
        >
          <div className="p-4 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-8 h-8 text-blue-600 group-hover:text-[#e0b040] transition-colors" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">Art Suitcase</h3>
            <p className="text-sm text-gray-500 mt-1">Full professional equipment set.</p>
          </div>
           <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#ffd166]/10" />
        </button>
      </div>
    </div>
  );
};

export default ResourceSelection;
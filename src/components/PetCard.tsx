/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pet } from '../types';

interface PetCardProps {
  key?: string | number;
  pet: Pet;
  onSelect: (pet: Pet) => void;
}

export default function PetCard({ pet, onSelect }: PetCardProps) {
  // Determine species icon
  const speciesIcon = pet.species === 'dog' ? 'pets' : 'cat';
  
  // Status color styles mapping
  const statusColorMap: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const statusStyle = statusColorMap[pet.statusType] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div 
      id={`pet-card-${pet.id}`}
      onClick={() => onSelect(pet)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Pet Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
        <img 
          src={pet.image} 
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex items-center gap-1 bg-[#00346f]/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
            <span className="material-symbols-outlined text-[14px]">{speciesIcon}</span>
            {pet.species === 'dog' ? 'Perro' : 'Gato'}
          </span>
        </div>

        {/* Location badge on bottom of image */}
        {pet.location && (
          <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            {pet.location}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
            {pet.name}
          </h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {pet.status}
          </span>
        </div>

        {/* Gender and Age details */}
        <div className="flex items-center gap-3 text-slate-500 text-xs mb-3 font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">
              {pet.gender === 'male' ? 'male' : pet.gender === 'female' ? 'female' : 'group'}
            </span>
            {pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Hermanos'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
            {pet.age}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
          {pet.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-slate-100">
          {pet.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

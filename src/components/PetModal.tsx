import React from 'react';
import { Pet } from '../types';

interface PetModalProps {
  pet: Pet;
  onClose: () => void;
}

export default function PetModal({ pet, onClose }: PetModalProps) {
  return (
    <div 
      id={`pet-modal-${pet.id}`}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative animate-scale-up my-2 md:my-8 max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 text-white hover:bg-black/60 rounded-full p-2 z-10 transition-colors"
          title="Cerrar"
        >
          <span className="material-symbols-outlined text-[20px] block">close</span>
        </button>

        {/* Image Left Side */}
        <div className="relative w-full md:w-[45%] h-56 md:h-auto md:min-h-[520px] bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
          <img 
            src={pet.image} 
            alt={pet.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Mobile title overlay */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <div className="md:hidden absolute bottom-4 left-4 right-4 text-white">
            <span className="bg-[#fc9d41] text-[#6b3900] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {pet.status}
            </span>
            <h2 className="font-display font-extrabold text-2xl mt-1 tracking-tight">
              {pet.name}
            </h2>
          </div>
        </div>

        {/* Info Right Side */}
        <div className="overflow-y-auto flex-grow p-5 md:p-8">
          {/* Desktop title */}
          <div className="hidden md:block mb-6">
            <span className="bg-[#fc9d41] text-[#6b3900] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {pet.status}
            </span>
            <h2 className="font-display font-extrabold text-3xl mt-2 tracking-tight text-slate-900">
              {pet.name}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Short stats */}
            <div className="grid grid-cols-3 gap-3 bg-[#eef4ff] rounded-2xl p-4 text-center border border-[#dfe9fa]">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Especie</p>
                <p className="font-bold text-[#00346f] text-sm flex items-center justify-center gap-1">
                  <span className="text-[16px]">{pet.species === 'dog' ? '🐕' : '🐈'}</span>
                  {pet.species === 'dog' ? 'Perro' : 'Gato'}
                </p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Género</p>
                <p className="font-bold text-[#00346f] text-sm flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    {pet.gender === 'male' ? 'male' : pet.gender === 'female' ? 'female' : 'group'}
                  </span>
                  {pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Grupo'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Edad</p>
                <p className="font-bold text-[#00346f] text-sm flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {pet.age}
                </p>
              </div>
            </div>

            {/* Story */}
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_stories</span>
                Su Historia
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {pet.story}
              </p>
            </div>

            {/* Health Checklist */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-display font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-emerald-600">health_and_safety</span>
                Ficha Médica y Estado Sanitario
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">check_circle</span>
                  Vacunación al día
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">check_circle</span>
                  Desparasitado
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">check_circle</span>
                  Esterilizado/a
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">check_circle</span>
                  Evaluación veterinaria regular
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-display font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-red-500">location_on</span>
                Ubicación en el Campus UNDC
              </h4>
              <div className="bg-[#f0f4ff] rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="bg-[#00346f]/10 p-3 rounded-full text-primary">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{pet.location || 'Áreas verdes del campus'}</p>
                  <p className="text-xs text-slate-500">Suele encontrarse cerca de esta zona para descansar o recibir cuidados de estudiantes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

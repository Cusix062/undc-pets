import React, { useState, useEffect, useCallback } from 'react';
import { Pet } from '../types';

interface PetCarouselProps {
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
}

export default function PetCarousel({ pets, onSelectPet }: PetCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const featured = pets.slice(0, 6);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (!isAutoPlaying || featured.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next, featured.length]);

  if (featured.length === 0) return null;

  const pet = featured[current];

  return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative h-[280px] md:h-[520px] w-full">
        {featured.map((p, idx) => (
          <div
            key={p.id}
            className="absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer flex items-center justify-center bg-slate-100"
            style={{
              opacity: idx === current ? 1 : 0,
              zIndex: idx === current ? 1 : 0,
            }}
            onClick={() => onSelectPet(p)}
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-contain max-h-[280px] md:max-h-[520px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none"></div>
          </div>
        ))}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#fc9d41] text-[#6b3900] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {pet.species === 'dog' ? 'Perro' : 'Gato'}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              pet.statusType === 'success' ? 'bg-emerald-500/80 text-white' :
              pet.statusType === 'warning' ? 'bg-amber-500/80 text-white' :
              pet.statusType === 'error' ? 'bg-rose-500/80 text-white' :
              'bg-slate-500/80 text-white'
            }`}>
              {pet.status}
            </span>
          </div>
          <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-1">{pet.name}</h3>
          <p className="text-sm text-white/80 max-w-lg line-clamp-2">{pet.description}</p>
          {pet.location && (
            <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {pet.location}
            </p>
          )}
        </div>
      </div>

      {featured.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">chevron_right</span>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

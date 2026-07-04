/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet } from '../types';

interface PetModalProps {
  pet: Pet;
  onClose: () => void;
  onAdoptRequest: (petName: string, applicantName: string) => void;
}

export default function PetModal({ pet, onClose, onAdoptRequest }: PetModalProps) {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantReason, setApplicantReason] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmitAdoption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone || !applicantReason) {
      alert('Por favor, completa todos los campos del formulario de solicitud.');
      return;
    }
    onAdoptRequest(pet.name, applicantName);
    setFormSubmitted(true);
  };

  return (
    <div 
      id={`pet-modal-${pet.id}`}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-scale-up my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 text-white hover:bg-black/60 rounded-full p-2 z-10 transition-colors"
          title="Cerrar modal"
        >
          <span className="material-symbols-outlined text-[20px] block">close</span>
        </button>

        <div className="overflow-y-auto flex-grow">
          {/* Header Image banner */}
          <div className="relative h-64 md:h-80 bg-slate-100">
            <img 
              src={pet.image} 
              alt={pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            
            {/* Title on banner */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="bg-[#fc9d41] text-[#6b3900] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {pet.status}
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl mt-2 tracking-tight">
                {pet.name}
              </h2>
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main info & Story (Left 2 cols) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Short stats */}
              <div className="grid grid-cols-3 gap-3 bg-[#eef4ff] rounded-2xl p-4 text-center border border-[#dfe9fa]">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Especie</p>
                  <p className="font-bold text-[#00346f] text-sm flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">{pet.species === 'dog' ? 'pets' : 'cat'}</span>
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

              {/* Story Section */}
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">book_heart</span>
                  Su Historia
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {pet.story}
                </p>
              </div>

              {/* Checklists for Health */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-display font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-emerald-600">health_and_safety</span>
                  Ficha Médica y Estado Sanitario
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
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

              {/* Location Detail Map mock */}
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

            {/* Form Column (Right 1 col) */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-md text-slate-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                  Adopción Responsable
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  ¿Te gustaría darle a {pet.name} un hogar definitivo fuera de la universidad? Completa este formulario y el equipo de Bienestar Universitario te contactará.
                </p>

                {formSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3 animate-scale-up">
                    <span className="material-symbols-outlined text-[42px] text-emerald-600">check_circle</span>
                    <p className="font-display font-bold text-emerald-800 text-sm">¡Solicitud Enviada!</p>
                    <p className="text-xs text-emerald-700">
                      Gracias {applicantName}. Hemos registrado tu interés por {pet.name}. Te contactaremos pronto.
                    </p>
                    <button 
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs text-primary font-bold hover:underline block mx-auto mt-2"
                    >
                      Enviar otra solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAdoption} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Ej. Juan Pérez" 
                        required
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Correo Institucional / Personal</label>
                      <input 
                        type="email" 
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="Ej. jperez@undc.edu.pe" 
                        required
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Celular / WhatsApp</label>
                      <input 
                        type="tel" 
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="Ej. 987654321" 
                        required
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">¿Por qué deseas adoptarlo?</label>
                      <textarea 
                        rows={3}
                        value={applicantReason}
                        onChange={(e) => setApplicantReason(e.target.value)}
                        placeholder="Cuento con espacio y tiempo para cuidarlo..." 
                        required
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      Solicitar Adopción
                    </button>
                  </form>
                )}
              </div>

              {/* Sponsoring option */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">¿No puedes adoptar?</p>
                <p className="text-xs text-slate-600 mb-2 font-medium">¡Puedes apadrinar o donar para su comida y vacunas!</p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

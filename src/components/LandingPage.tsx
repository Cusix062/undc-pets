import React, { useState, useEffect } from 'react';
import type { Pet, BlogPost } from '../types';
import MapaRefugios from './MapaRefugios';

interface LandingPageProps {
  pets: Pet[];
  blogPosts: BlogPost[];
  onNavigate: (tab: string) => void;
  onSelectPet: (pet: Pet) => void;
}

export default function LandingPage({ pets, blogPosts, onNavigate, onSelectPet }: LandingPageProps) {
  const featuredPets = pets.slice(0, 5);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (featuredPets.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredPets.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredPets.length]);

  const totalPets = pets.length;
  const healthyPets = pets.filter(p => p.status === 'Sano' || p.status === 'Saludable' || p.status === 'Alegre').length;
  const seekingHome = pets.filter(p => p.status === 'Buscando hogar').length;
  const speciesIcons: Record<string, string> = { dog: 'pets', cat: 'cat', other: 'pets' };

  return (
    <div className="animate-fade-in">

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001a3a] via-[#00346f] to-[#002450] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#fc9d41] rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* Left: Text */}
            <div className="space-y-5 md:space-y-6 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-full px-4 py-1.5 text-xs font-bold text-white/80">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                Bienestar Animal UNDC
              </div>
              <h1 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight">
                Un Hogar Fuera de Casa
                <span className="block text-[#fc9d41] mt-2">para Ellos</span>
              </h1>
              <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Somos una comunidad universitaria dedicada al cuidado, protección y bienestar de los perros y gatos que habitan el campus de la Universidad Nacional de Cañete.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                <button onClick={() => onNavigate('directorio')} className="bg-[#fc9d41] hover:bg-[#fa8b23] text-[#6b3900] font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-[#fc9d41]/25 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">pets</span>
                  Conocer Mascotas
                </button>
                <button onClick={() => onNavigate('donaciones')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3 rounded-2xl backdrop-blur-xs transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  Donar Ahora
                </button>
              </div>
            </div>

            {/* Right: Carousel - visible on all screens */}
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ aspectRatio: '4/3' }}>
                {featuredPets.map((pet, i) => {
                  const isActive = i === currentSlide;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => onSelectPet(pet)}
                      className={`absolute inset-0 transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                      {/* Fondo: imagen cubriendo todo con blur */}
                      <div className="absolute inset-0 scale-110">
                        <img
                          src={pet.image}
                          alt=""
                          className="w-full h-full object-cover blur-xl opacity-60"
                        />
                      </div>
                      {/* Imagen principal centrada sin recortar */}
                      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                    </button>
                  );
                })}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12 z-10">
                  <p className="font-display font-bold text-white text-sm md:text-lg">{featuredPets[currentSlide]?.name}</p>
                  <p className="text-[10px] md:text-xs text-white/60">{featuredPets[currentSlide]?.age} • {featuredPets[currentSlide]?.location}</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-3 md:mt-4">
                {featuredPets.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 md:w-8 bg-[#fc9d41]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'pets', value: totalPets, label: 'Mascotas en el Campus', color: 'text-[#00346f]', bg: 'bg-[#eef4ff]' },
              { icon: 'favorite', value: seekingHome, label: 'Buscan un Hogar', color: 'text-rose-600', bg: 'bg-rose-50' },
              { icon: 'check_circle', value: healthyPets, label: 'Saludables y Felices', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: 'volunteer_activism', value: '3', label: 'Campañas Activas', color: 'text-[#fc9d41]', bg: 'bg-[#fc9d41]/10' },
            ].map(stat => (
              <div key={stat.label} className="text-center space-y-1.5">
                <div className={`h-12 w-12 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto`}>
                  <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
                </div>
                <p className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CÓMO AYUDAR SECTION ===== */}
      <section className="bg-gradient-to-b from-white to-[#f8f9ff] py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="inline-block bg-[#00346f]/10 text-[#00346f] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">Cómo ayudar</span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Formas de Contribuir</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">Hay muchas maneras en las que puedes marcar la diferencia en la vida de nuestras mascotas comunitarias.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'volunteer_activism', title: 'Donar', desc: 'Contribuye con alimento, medicinas o una donación económica para el cuidado de los animalitos del campus.', color: 'bg-[#00346f]', action: () => onNavigate('donaciones'), btnText: 'Ver Campañas' },
              { icon: 'pets', title: 'Adoptar', desc: 'Dale un hogar temporal o definitivo a una de nuestras mascotas. El amor que recibirás será infinito.', color: 'bg-[#fc9d41]', action: () => onNavigate('directorio'), btnText: 'Ver Mascotas' },
              { icon: 'forum', title: 'Reportar', desc: '¿Viste una mascota en situación de riesgo? Reporta en la comunidad para que podamos actuar rápido.', color: 'bg-rose-600', action: () => onNavigate('comunidad'), btnText: 'Ir a Comunidad' },
            ].map(card => (
              <div key={card.title} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 text-center space-y-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`${card.color} h-14 w-14 rounded-2xl flex items-center justify-center mx-auto shadow-md`}>
                  <span className="material-symbols-outlined text-[28px] text-white">{card.icon}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                <button onClick={card.action} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all">
                  {card.btnText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MASCOTAS DESTACADAS ===== */}
      {pets.length > 0 && (
        <section className="bg-[#eef4ff] py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-2">
                <span className="inline-block bg-[#fc9d41]/15 text-[#8f4e00] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">Conócelos</span>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Mascotas del Campus</h2>
              </div>
              <button onClick={() => onNavigate('directorio')} className="hidden md:flex items-center gap-1.5 text-[#00346f] font-bold text-xs hover:underline">
                Ver todas <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {pets.slice(0, 8).map(pet => (
                <button
                  key={pet.id}
                  onClick={() => onSelectPet(pet)}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left shadow-md border-2 border-[#00346f]/10"
                >
                  <div className="h-40 md:h-48 flex items-center justify-center p-4 relative bg-gradient-to-b from-[#00346f]/5 to-white">
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pet.statusType === 'success' ? 'bg-green-100 text-green-700' :
                      pet.statusType === 'warning' ? 'bg-[#fc9d41]/20 text-[#8f4e00]' :
                      pet.statusType === 'error' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {pet.status}
                    </span>
                  </div>
                  <div className="p-3 space-y-1 border-t border-[#00346f]/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm text-slate-900">{pet.name}</h3>
                      <span className="material-symbols-outlined text-[14px] text-[#00346f]/40">{speciesIcons[pet.species] || 'pets'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{pet.age} • {pet.location}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pet.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <button onClick={() => onNavigate('directorio')} className="bg-[#00346f] hover:bg-[#002450] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all">
                Ver Todas las Mascotas
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===== BLOG PREVIEW ===== */}
      {blogPosts.length > 0 && (
        <section className="bg-white py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-2">
                <span className="inline-block bg-[#00346f]/10 text-[#00346f] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">Blog</span>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Noticias y Consejos</h2>
              </div>
              <button onClick={() => onNavigate('blog')} className="hidden md:flex items-center gap-1.5 text-[#00346f] font-bold text-xs hover:underline">
                Ver blog <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map(post => (
                <button key={post.id} onClick={() => onNavigate('blog')} className="group bg-white rounded-2xl border-2 border-slate-100 overflow-hidden text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md">
                  {post.image && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                      {post.date}
                      <span className="text-slate-200">•</span>
                      <span className="material-symbols-outlined text-[12px]">person</span>
                      {post.author}
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-[#00346f] transition-colors">{post.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <button onClick={() => onNavigate('blog')} className="bg-[#00346f] hover:bg-[#002450] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all">
                Ver Blog Completo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===== MAPA DE REFUGIOS ===== */}
      <MapaRefugios />

      {/* ===== CTA FINAL ===== */}
      <section className="bg-gradient-to-r from-[#001a3a] via-[#00346f] to-[#002450] py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-full px-4 py-1.5 text-xs font-bold text-white/80">
            <span className="h-2 w-2 bg-[#fc9d41] rounded-full animate-pulse" />
            #UNDCPets
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight">
            Sé Parte del Cambio
          </h2>
          <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Cada pequeña acción cuenta. Únete a nuestra comunidad y ayudanos a construir un campus más humano y solidario para todos.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button onClick={() => onNavigate('donaciones')} className="bg-[#fc9d41] hover:bg-[#fa8b23] text-[#6b3900] font-bold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
              Donar Ahora
            </button>
            <button onClick={() => onNavigate('comunidad')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3 rounded-2xl backdrop-blur-xs transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">forum</span>
              Unirse a la Comunidad
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

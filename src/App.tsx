/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Pet, DonationCampana, DonationConfig } from './types';
import { INITIAL_PETS, FAQS } from './data';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './lib/AuthContext';
import PetCard from './components/PetCard';
import PetModal from './components/PetModal';
import CommunityFeed from './components/CommunityFeed';
import DonationCampaigns from './components/DonationCampaigns';
import PetCarousel from './components/PetCarousel';
import PhotoAlbum from './components/PhotoAlbum';
import GoogleSignIn from './components/GoogleSignIn';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';

// Initial campaigns
const INITIAL_CAMPAIGNS: DonationCampana[] = [
  {
    id: 'camp_food',
    title: 'Alimento Mensual para el Campus',
    description: 'Compra de bolsas de croquetas de 15kg para perros y gatos. Asegura su ración diaria de comida.',
    currentAmount: 340,
    targetAmount: 500,
    urgency: 'Alta'
  },
  {
    id: 'camp_medical',
    title: 'Cirugía y Terapia de Firulais',
    description: 'Tratamiento especializado de cadera, medicamentos antiinflamatorios y radiografías de control.',
    currentAmount: 210,
    targetAmount: 800,
    urgency: 'Crítica'
  },
  {
    id: 'camp_spay',
    title: 'Campaña de Esterilización Integral',
    description: 'Esterilización preventiva de nuevas mascotas que ingresan o rondan las inmediaciones del campus.',
    currentAmount: 950,
    targetAmount: 1200,
    urgency: 'Media'
  }
];

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAdmin } = useAuth();

  // Tabs: 'directorio' | 'comunidad' | 'donaciones' | 'perfil' | 'faqs' | 'album' | 'admin'
  const [activeTab, setActiveTab] = useState<'directorio' | 'comunidad' | 'donaciones' | 'perfil' | 'faqs' | 'album' | 'admin'>('directorio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | undefined>();
  
  // Data States
  const [pets, setPets] = useState<Pet[]>([]);
  const [campaigns, setCampaigns] = useState<DonationCampana[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load pets and donation config from Supabase on mount
  useEffect(() => {
    const load = async () => {
      const [petsRes, configRes] = await Promise.all([
        supabase.from('pets').select('*'),
        supabase.from('donation_config').select('*').eq('id', 'main').single(),
      ]);
      if (petsRes.data && petsRes.data.length > 0) {
        setPets(petsRes.data.map((r: any) => r.data as Pet));
      } else {
        setPets(INITIAL_PETS);
      }
      if (configRes.data) {
        const cfg = configRes.data.data as DonationConfig;
        if (cfg.campaigns) setCampaigns(cfg.campaigns);
      }
      setDataLoaded(true);
    };
    load();
  }, []);

  // Filters state (Directory)
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive Toast Notification State
  const [notification, setNotification] = useState<string | null>(null);
  
  // FAQ active indexes
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // Show a toast message
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add pet from report form
  const handleAddPetToDirectory = async (newPet: Pet) => {
    setPets(prev => [newPet, ...prev]);
    await supabase.from('pets').upsert({ id: newPet.id, data: newPet as any });
    triggerNotification('Mascota reportada y guardada');
  };

  // Process donation updates
  const handleUpdateCampaignAmount = async (campaignId: string, amount: number) => {
    const updated = campaigns.map(c => {
      if (c.id === campaignId) return { ...c, currentAmount: c.currentAmount + amount };
      return c;
    });
    setCampaigns(updated);
    // Sync back to donation_config
    const { data } = await supabase.from('donation_config').select('*').eq('id', 'main').single();
    if (data) {
      const cfg = data.data as DonationConfig;
      cfg.campaigns = updated;
      await supabase.from('donation_config').upsert({ id: 'main', data: cfg as any });
    }
  };

  // Process adoption request trigger
  // Filtered Pets
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pet.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
    const matchesStatus = statusFilter === 'all' || pet.status === statusFilter;

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col font-sans text-[#121c28]">
      
      {/* Header Navigation Bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('directorio')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-[#00346f] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined font-bold text-[22px]">pets</span>
            </div>
            <div>
              <span className="font-display font-black text-xl text-[#00346f] tracking-tight block">UNDC Pets</span>
              <span className="text-[9px] text-[#8f4e00] font-bold tracking-wider uppercase block">Bienestar Animal</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('directorio')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'directorio' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder_special</span>
              Mascotas del Campus
            </button>
            <button
              onClick={() => setActiveTab('comunidad')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'comunidad' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              Comunidad
            </button>
            <button
              onClick={() => setActiveTab('album')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'album' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">photo_library</span>
              Álbum
            </button>
            <button
              onClick={() => setActiveTab('donaciones')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'donaciones' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              Donaciones
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'perfil' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              Usuario
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faqs' 
                  ? 'bg-[#eef4ff] text-[#00346f]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">help</span>
              FAQs
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin' 
                    ? 'bg-[#eef4ff] text-[#00346f]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                Admin
              </button>
            )}
          </nav>

          {/* Desktop Auth + Sponsoring */}
          <div className="hidden md:flex items-center gap-3">
            <GoogleSignIn />
            <button
              onClick={() => setActiveTab('donaciones')}
              className="bg-[#fc9d41] hover:bg-[#fa8b23] text-[#6b3900] text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">favorite</span>
              Apadrinar Mascota
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }}
              className="bg-[#00346f] text-white p-2 rounded-full shadow-xs flex items-center justify-center"
              title="Mi Perfil"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center"
              title="Menú"
            >
              <span className="material-symbols-outlined text-[22px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg animate-slide-down">
            <div className="px-4 pt-3 pb-2 border-b border-slate-100">
              <GoogleSignIn />
            </div>
            <nav className="flex flex-col py-3 px-4 gap-1">
              {[
                { tab: 'directorio' as const, icon: 'folder_special', label: 'Mascotas del Campus' },
                { tab: 'comunidad' as const, icon: 'forum', label: 'Comunidad' },
                { tab: 'album' as const, icon: 'photo_library', label: 'Álbum' },
                { tab: 'donaciones' as const, icon: 'volunteer_activism', label: 'Donaciones' },
                { tab: 'perfil' as const, icon: 'person', label: 'Usuario' },
                { tab: 'faqs' as const, icon: 'help', label: 'FAQs' },
                ...(isAdmin ? [{ tab: 'admin' as const, icon: 'admin_panel_settings', label: 'Admin' }] : []),
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => { setActiveTab(item.tab); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.tab
                      ? 'bg-[#eef4ff] text-[#00346f]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  onClick={() => { setActiveTab('donaciones'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#6b3900] bg-[#fc9d41]/10 hover:bg-[#fc9d41]/20 transition-all w-full"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  Apadrinar Mascota
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Hero Header Section */}
      {activeTab === 'directorio' && (
        <section className="bg-gradient-to-b from-white to-[#f8f9ff] border-b border-slate-100 py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-center lg:text-left">
              <span className="inline-block bg-[#fc9d41]/10 text-[#8f4e00] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#fc9d41]/25">
                🎓 Universidad Nacional de Cañete
              </span>
              <h1 className="font-display font-extrabold text-3xl md:text-5xl text-slate-900 tracking-tight leading-tight">
                Un Hogar Fuera de Casa para los <span className="text-[#00346f]">Perros y Gatos</span> de la UNDC
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Únete a la red estudiantil y universitaria dedicada a cuidar la salud, alimentación y adopción responsable de nuestras mascotas comunitarias del campus.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-3">
                <button
                  onClick={() => setActiveTab('perfil')}
                  className="bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Mi Perfil
                </button>
                <button
                  onClick={() => { setActiveTab('comunidad'); }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] font-bold">report</span>
                  Reportar Mascota Perdida
                </button>
              </div>
            </div>
            <div className="w-full">
              <PetCarousel pets={pets} onSelectPet={setSelectedPet} />
            </div>
          </div>
        </section>
      )}

      {/* Main Content Body Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* DIRECTORY VIEW */}
        {activeTab === 'directorio' && (
          <div className="space-y-6">

            {/* Search and Filters Layout */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Search query input */}
                <div className="flex-grow relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <span className="material-symbols-outlined">search</span>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar mascota por nombre, zona del campus o etiquetas (ej. Juguetón)..."
                    className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2">
                  
                  {/* Species Filter buttons */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setSpeciesFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        speciesFilter === 'all' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSpeciesFilter('dog')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        speciesFilter === 'dog' ? 'bg-[#00346f] text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">pets</span>
                      Perros
                    </button>
                    <button
                      onClick={() => setSpeciesFilter('cat')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        speciesFilter === 'cat' ? 'bg-[#00346f] text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">cat</span>
                      Gatos
                    </button>
                  </div>

                  {/* Status filter dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary rounded-xl"
                  >
                    <option value="all">Cualquier Estado</option>
                    <option value="Buscando hogar">Buscando hogar</option>
                    <option value="Sano">Saludable / Sano</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Saludable">Saludable</option>
                  </select>

                </div>

              </div>

              {/* Quick statistics tag indicators */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50 text-[11px] font-bold text-slate-500">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">info</span>
                <span>Filtros rápidos:</span>
                {['Juguetón', 'Vacunado', 'Esterilizada', 'Cachorros', 'Tranquilo'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="bg-slate-50 hover:bg-[#eef4ff] text-slate-600 hover:text-[#00346f] border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
                  >
                    #{tag}
                  </button>
                ))}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-rose-600 hover:underline flex items-center gap-0.5 ml-auto"
                  >
                    <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            </div>

            {/* Pets Grid Directory */}
            {filteredPets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPets.map((pet) => (
                  <PetCard 
                    key={pet.id} 
                    pet={pet} 
                    onSelect={setSelectedPet} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-[48px] text-slate-300">sentiment_dissatisfied</span>
                <p className="font-display font-bold text-slate-800 text-sm">No encontramos mascotas con tu filtro</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Prueba cambiando el término de búsqueda o el filtro de especies para conocer a nuestros amigos.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSpeciesFilter('all');
                    setStatusFilter('all');
                  }}
                  className="bg-[#00346f] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reiniciar Filtros
                </button>
              </div>
            )}

          </div>
        )}

        {/* ALBUM VIEW */}
        {activeTab === 'album' && (
          <PhotoAlbum pets={pets} />
        )}

        {/* COMMUNITY VIEW */}
        {activeTab === 'comunidad' && (
          <CommunityFeed 
            onAddPetToDirectory={handleAddPetToDirectory}
            onShowNotification={triggerNotification}
            onViewProfile={(userId) => { setProfileUserId(userId); setActiveTab('perfil'); }}
          />
        )}

        {/* DONATION VIEW */}
        {activeTab === 'donaciones' && (
          <DonationCampaigns 
            campaigns={campaigns}
            onUpdateCampaignAmount={handleUpdateCampaignAmount}
            onShowNotification={triggerNotification}
          />
        )}

        {/* USER PROFILE VIEW */}
        {activeTab === 'perfil' && (
          <UserProfile userId={profileUserId} onGoBack={() => { setProfileUserId(undefined); setActiveTab('comunidad'); }} />
        )}

        {/* FAQS VIEW */}
        {activeTab === 'faqs' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-2 mb-8">
              <span className="material-symbols-outlined text-[48px] text-[#fc9d41] font-bold">help_center</span>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Preguntas Frecuentes</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ¿Tienes dudas sobre cómo funciona la iniciativa de bienestar animal en la Universidad Nacional de Cañete? Encuentra tus respuestas inmediatas aquí:
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-3xs"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none hover:bg-slate-50/50"
                    >
                      <span className="font-display font-bold text-xs md:text-sm text-slate-800">
                        {faq.question}
                      </span>
                      <span className={`material-symbols-outlined transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/30 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Callout inside FAQs */}
            <div className="bg-[#eef4ff] rounded-2xl border border-[#dfe9fa] p-6 text-center space-y-3 mt-8">
              <span className="material-symbols-outlined text-[32px] text-primary">smart_toy</span>
              <h4 className="font-display font-bold text-slate-900 text-sm">¿Aún tienes dudas? Habla con el Guardián AI</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nuestro asistente virtual de Inteligencia Artificial está disponible 24/7 para responder preguntas detalladas sobre los perritos y gatitos.
              </p>
              <button
                onClick={() => setActiveTab('perfil')}
                className="bg-[#00346f] hover:bg-[#002450] text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-xs"
              >
                Ir a Mi Perfil
              </button>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel onShowNotification={triggerNotification} />
        )}

      </main>

      {/* Footer Branding section */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-16 text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo and brief */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#00346f] text-white h-7 w-7 rounded-full flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px] font-bold">pets</span>
              </div>
              <span className="font-display font-black text-slate-800 tracking-tight text-sm">UNDC Pets</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Iniciativa solidaria de la comunidad universitaria de la Universidad Nacional de Cañete para brindar refugio, alimentación y cuidado integral a las mascotas en situación vulnerable dentro de nuestras dependencias académicas.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2 md:pl-10">
            <h4 className="font-display font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Navegación</h4>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => setActiveTab('directorio')} className="hover:text-primary text-left">Mascotas del Campus</button>
              <button onClick={() => setActiveTab('comunidad')} className="hover:text-primary text-left">Muro y Alertas</button>
              <button onClick={() => setActiveTab('donaciones')} className="hover:text-primary text-left">Cuentas y Donaciones</button>
              <button onClick={() => setActiveTab('perfil')} className="hover:text-primary text-left">Mi Perfil</button>
            </div>
          </div>

          {/* Legal / credits */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Contacto Oficial</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Oficina de Bienestar Universitario, Pabellón de Servicios Centrales, Cañete, Lima, Perú.<br/>
              Correo: <a href="mailto:bienestar@undc.edu.pe" className="text-primary hover:underline font-bold">bienestar@undc.edu.pe</a>
            </p>
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} UNDC Pets. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </footer>

      {/* Floating Interactive Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-xl flex items-center gap-3 z-50 animate-slide-up max-w-sm border border-slate-800">
          <div className="bg-[#fc9d41] text-[#6b3900] h-7 w-7 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] font-bold">notifications</span>
          </div>
          <p className="text-xs font-semibold leading-normal">{notification}</p>
        </div>
      )}

      {/* Detail Pet Modal Overlay */}
      {selectedPet && (
        <PetModal 
          pet={selectedPet} 
          onClose={() => setSelectedPet(null)} 
        />
      )}

    </div>
  );
}

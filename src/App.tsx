/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Pet, DonationConfig, PendingDonation, BlogPost, Adoption } from './types';
import { INITIAL_PETS, FAQS, INITIAL_BLOG_POSTS } from './data';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './lib/AuthContext';
import PetCard from './components/PetCard';
import PetModal from './components/PetModal';
import CommunityFeed from './components/CommunityFeed';
import DonationCampaigns from './components/DonationCampaigns';
import PhotoAlbum from './components/PhotoAlbum';
import GoogleSignIn from './components/GoogleSignIn';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import PetBlog from './components/PetBlog';
import AdoptionPanel from './components/AdoptionPanel';
import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAdmin } = useAuth();

  // Tabs: 'directorio' | 'comunidad' | 'donaciones' | 'perfil' | 'faqs' | 'album' | 'blog' | 'admin' | 'adopciones'
  const [activeTab, setActiveTab] = useState<'inicio' | 'directorio' | 'comunidad' | 'donaciones' | 'perfil' | 'faqs' | 'album' | 'blog' | 'admin' | 'adopciones'>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | undefined>();
  const [authOpen, setAuthOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('undc_dark_mode');
    return stored === 'true';
  });
  
  // Data States
  const [pets, setPets] = useState<Pet[]>([]);
  const [donationConfig, setDonationConfig] = useState<DonationConfig>({
    accounts: [],
    yapeNumber: '',
    plinNumber: '',
    qrCodes: { yape: '', plin: '', bcp: '', tunqui: '' },
    campaigns: [],
    pendingDonations: [],
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pet>>({});

  const handlePetsChanged = useCallback((pet?: Pet, action?: string) => {
    if (action === 'delete' && pet) {
      setPets(prev => {
        const updated = prev.filter(p => p.id !== pet.id);
        localStorage.setItem('undc_pets', JSON.stringify(updated));
        return updated;
      });
    } else if (pet) {
      setPets(prev => {
        const filtered = prev.filter(p => p.id !== pet.id);
        const updated = [pet, ...filtered];
        localStorage.setItem('undc_pets', JSON.stringify(updated));
        return updated;
      });
    }
    // Sync to Supabase in background
    supabase.from('pets').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const synced = data.map((r: any) => r.data as Pet);
        setPets(synced);
        localStorage.setItem('undc_pets', JSON.stringify(synced));
      }
    });
  }, []);

  // Load pets and donation config from Supabase on mount
  useEffect(() => {
    const load = async () => {
      const [petsRes, configRes, blogRes] = await Promise.all([
        supabase.from('pets').select('*'),
        supabase.from('donation_config').select('*').eq('id', 'main').single(),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      ]);
      if (petsRes.data && petsRes.data.length > 0) {
        const loaded = petsRes.data.map((r: any) => r.data as Pet);
        setPets(loaded);
        localStorage.setItem('undc_pets', JSON.stringify(loaded));
      } else {
        const cached = localStorage.getItem('undc_pets');
        if (cached) {
          try { setPets(JSON.parse(cached)); } catch { setPets(INITIAL_PETS); }
        } else {
          setPets(INITIAL_PETS);
        }
      }
      if (configRes.data) {
        const cfg = configRes.data.data as DonationConfig;
        setDonationConfig(cfg);
        localStorage.setItem('undc_donation_config', JSON.stringify(cfg));
      } else {
        const cached = localStorage.getItem('undc_donation_config');
        if (cached) {
          try { setDonationConfig(JSON.parse(cached)); } catch {}
        }
      }
      if (blogRes.data && blogRes.data.length > 0) {
        setBlogPosts(blogRes.data.map((r: any) => r.data as BlogPost));
      } else {
        setBlogPosts(INITIAL_BLOG_POSTS);
      }
      setDataLoaded(true);
    };
    load();
  }, []);

  // Realtime: sync donation_config changes across tabs/devices
  useEffect(() => {
    const channel = supabase.channel('donation_config_realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'donation_config', filter: 'id=eq.main' },
        (payload: any) => {
          const cfg = payload.new?.data as DonationConfig;
          if (cfg) {
            setDonationConfig(cfg);
            localStorage.setItem('undc_donation_config', JSON.stringify(cfg));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Sync dark mode to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('undc_dark_mode', isDark ? 'true' : 'false');
  }, [isDark]);

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
    setPets(prev => {
      const updated = [newPet, ...prev];
      localStorage.setItem('undc_pets', JSON.stringify(updated));
      return updated;
    });
    await supabase.from('pets').upsert({ id: newPet.id, data: newPet as any });
    triggerNotification('Mascota reportada y guardada');
  };

  // Add a pending donation (user donated, admin must verify)
  const handleAddPendingDonation = async (pending: PendingDonation) => {
    const updatedConfig = {
      ...donationConfig,
      pendingDonations: [...(donationConfig.pendingDonations || []), pending],
    };
    setDonationConfig(updatedConfig);
    localStorage.setItem('undc_donation_config', JSON.stringify(updatedConfig));
    await supabase.from('donation_config').upsert({ id: 'main', data: updatedConfig as any }).catch(() => {});
  };

  // Handle full config updates from AdminPanel
  const handleConfigChanged = async (newConfig: DonationConfig) => {
    setDonationConfig(newConfig);
    localStorage.setItem('undc_donation_config', JSON.stringify(newConfig));
    await supabase.from('donation_config').upsert({ id: 'main', data: newConfig as any }).catch(() => {});
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
    <div id="app-root-container" className="min-h-screen flex flex-col font-sans text-[#121c28] dark:bg-slate-900 dark:text-slate-100">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onNotification={(msg) => {}} />
      
      {/* Header Navigation Bar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-100/60 z-40 transition-shadow dark:bg-slate-900/90 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-2">

          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="bg-[#00346f] text-white h-8 w-8 md:h-9 md:w-9 rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined font-bold text-[18px] md:text-[20px]">pets</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-base md:text-lg text-[#00346f] tracking-tight block leading-tight">UNDC Pets</span>
              <span className="text-[8px] text-[#8f4e00] font-bold tracking-wider uppercase block leading-tight">Bienestar Animal</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {[
              { tab: 'inicio' as const, icon: 'home', label: 'Inicio' },
              { tab: 'directorio' as const, icon: 'pets', label: 'Mascotas' },
              { tab: 'comunidad' as const, icon: 'forum', label: 'Comunidad' },
              { tab: 'adopciones' as const, icon: 'crowdsource', label: 'Adopciones' },
              { tab: 'album' as const, icon: 'photo_library', label: 'Álbum' },
              { tab: 'blog' as const, icon: 'newspaper', label: 'Blog' },
              { tab: 'faqs' as const, icon: 'help', label: 'FAQ' },
              ...(isAdmin ? [{ tab: 'admin' as const, icon: 'admin_panel_settings', label: 'Panel' }] : []),
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.tab
                    ? 'bg-[#00346f] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right side: actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setActiveTab('donaciones')}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#fc9d41] hover:bg-[#fa8b23] text-[#6b3900] text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">favorite</span>
              Donar
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="hidden md:flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all ${
                activeTab === 'perfil'
                  ? 'bg-[#eef4ff] text-[#00346f]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
              title="Mi Perfil"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>

            <div className="hidden md:flex border-l border-slate-200 pl-2 ml-1">
              <GoogleSignIn onOpenAuth={() => setAuthOpen(true)} />
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
              title="Menú"
            >
              <span className="material-symbols-outlined text-[20px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-14 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-x-0 top-14 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-lg animate-slide-down dark:bg-slate-900/95 dark:border-slate-700">
            <nav className="flex flex-col py-2 px-3 gap-0.5">
              {[
                { tab: 'inicio' as const, icon: 'home', label: 'Inicio' },
                { tab: 'directorio' as const, icon: 'pets', label: 'Mascotas' },
                { tab: 'comunidad' as const, icon: 'forum', label: 'Comunidad' },
                { tab: 'adopciones' as const, icon: 'crowdsource', label: 'Adopciones' },
                { tab: 'album' as const, icon: 'photo_library', label: 'Álbum' },
                { tab: 'blog' as const, icon: 'newspaper', label: 'Blog' },
                { tab: 'faqs' as const, icon: 'help', label: 'FAQ' },
                ...(isAdmin ? [{ tab: 'admin' as const, icon: 'admin_panel_settings', label: 'Panel Admin' }] : []),
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => { setActiveTab(item.tab); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.tab
                      ? 'bg-[#00346f] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 space-y-0.5">
                <button
                  onClick={() => { setActiveTab('donaciones'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#6b3900] bg-[#fc9d41]/10 hover:bg-[#fc9d41]/20 transition-all w-full"
                >
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  Donar / Apadrinar
                </button>
                <button
                  onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all w-full"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Mi Perfil
                </button>
                <div className="px-4 py-2">
                  <GoogleSignIn onOpenAuth={() => setAuthOpen(true)} />
                </div>
              </div>
            </nav>
          </div>
        </>
      )}



      {/* Main Content Body Container */}
      <main className={`flex-grow w-full mx-auto ${activeTab === 'inicio' ? '' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
        
        {/* LANDING PAGE */}
        {activeTab === 'inicio' && (
          <LandingPage
            pets={pets.filter(p => !p.id.startsWith('report_'))}
            blogPosts={blogPosts}
            onNavigate={(tab) => setActiveTab(tab as any)}
            onSelectPet={setSelectedPet}
          />
        )}

        {/* DIRECTORY VIEW */}
        {activeTab === 'directorio' && (
          <div className="space-y-6 animate-fade-in-up">

            {/* Search and Filters Layout */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4 dark:bg-slate-800 dark:border-slate-700">
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
                    className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2">
                  
                  {/* Species Filter buttons */}
                  <div className="flex bg-slate-100 p-1 rounded-xl dark:bg-slate-700">
                    <button
                      onClick={() => setSpeciesFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        speciesFilter === 'all' ? 'bg-white text-slate-800 shadow-3xs dark:bg-slate-600 dark:text-slate-100' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSpeciesFilter('dog')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        speciesFilter === 'dog' ? 'bg-[#00346f] text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">pets</span>
                      Perros
                    </button>
                    <button
                      onClick={() => setSpeciesFilter('cat')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        speciesFilter === 'cat' ? 'bg-[#00346f] text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[14px]">🐈</span>
                      Gatos
                    </button>
                  </div>

                  {/* Status filter dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
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
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">info</span>
                <span>Filtros rápidos:</span>
                {['Juguetón', 'Vacunado', 'Esterilizada', 'Cachorros', 'Tranquilo'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="bg-slate-50 hover:bg-[#eef4ff] text-slate-600 hover:text-[#00346f] border border-slate-200 px-2.5 py-1 rounded-lg transition-all dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-600"
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
                    isAdmin={isAdmin}
                    onEdit={(p) => { setEditingPet(p); setEditForm(p); }}
                    onDelete={(p) => setDeletingPet(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3 dark:bg-slate-800 dark:border-slate-700">
                <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-500">sentiment_dissatisfied</span>
                <p className="font-display font-bold text-slate-800 text-sm dark:text-slate-200">No encontramos mascotas con tu filtro</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed dark:text-slate-400">
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

            {/* Blog / Consejos section on homepage */}
            {blogPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 dark:bg-slate-800 dark:border-slate-700">
                <PetBlog posts={blogPosts} compact />
              </div>
            )}

          </div>
        )}

        {/* Edit Pet Modal */}
        {editingPet && isAdmin && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setEditingPet(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-bold text-lg dark:text-slate-100">Editar Mascota</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Nombre</label>
                  <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Especie</label>
                  <select value={editForm.species || 'dog'} onChange={e => setEditForm({...editForm, species: e.target.value as 'dog' | 'cat'})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <option value="dog">Perro</option><option value="cat">Gato</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Género</label>
                  <select value={editForm.gender || 'male'} onChange={e => setEditForm({...editForm, gender: e.target.value as 'male' | 'female' | 'group'})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <option value="male">Macho</option><option value="female">Hembra</option><option value="group">Grupo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Edad</label>
                  <input value={editForm.age || ''} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Estado</label>
                  <input value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Tipo</label>
                  <select value={editForm.statusType || 'info'} onChange={e => setEditForm({...editForm, statusType: e.target.value as any})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <option value="success">success</option><option value="warning">warning</option><option value="error">error</option><option value="info">info</option><option value="primary">primary</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Tags (separados por coma)</label>
                  <input value={(editForm.tags || []).join(', ')} onChange={e => setEditForm({...editForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Ubicación</label>
                  <input value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Descripción</label>
                  <textarea rows={2} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1 dark:text-slate-400">Historia</label>
                  <textarea rows={3} value={editForm.story || ''} onChange={e => setEditForm({...editForm, story: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingPet(null)} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl dark:bg-slate-700 dark:text-slate-300">Cancelar</button>
                <button onClick={async () => {
                  const updated = { ...editingPet, ...editForm } as Pet;
                  setPets(prev => {
                    const filtered = prev.filter(p => p.id !== updated.id);
                    const result = [updated, ...filtered];
                    localStorage.setItem('undc_pets', JSON.stringify(result));
                    return result;
                  });
                  await supabase.from('pets').upsert({ id: updated.id, data: updated as any }).catch(() => {});
                  setEditingPet(null);
                  triggerNotification('Mascota actualizada');
                }} className="flex-1 bg-[#00346f] text-white text-xs font-bold py-2.5 rounded-xl">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingPet && isAdmin && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setDeletingPet(null)}>
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 text-center dark:bg-slate-800 dark:border dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <span className="material-symbols-outlined text-[48px] text-rose-500">delete_forever</span>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">¿Eliminar {deletingPet.name}?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer. La mascota se eliminará del directorio.</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setDeletingPet(null)} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl dark:bg-slate-700 dark:text-slate-300">Cancelar</button>
                <button onClick={async () => {
                  setPets(prev => {
                    const updated = prev.filter(p => p.id !== deletingPet.id);
                    localStorage.setItem('undc_pets', JSON.stringify(updated));
                    return updated;
                  });
                  await supabase.from('pets').delete().eq('id', deletingPet.id).catch(() => {});
                  setDeletingPet(null);
                  triggerNotification(`"${deletingPet.name}" eliminada`);
                }} className="flex-1 bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* ALBUM VIEW */}
        {activeTab === 'album' && (
          <div className="animate-fade-in-up">
            <PhotoAlbum pets={pets} />
          </div>
        )}

        {/* BLOG VIEW */}
        {activeTab === 'blog' && (
          <div className="animate-fade-in-up">
            <PetBlog posts={blogPosts} />
          </div>
        )}

        {/* COMMUNITY VIEW */}
        {activeTab === 'comunidad' && (
          <div className="animate-fade-in-up">
            <CommunityFeed 
              onAddPetToDirectory={handleAddPetToDirectory}
              onShowNotification={triggerNotification}
              onViewProfile={(userId) => { setProfileUserId(userId); setActiveTab('perfil'); }}
            />
          </div>
        )}

        {/* DONATION VIEW */}
        {activeTab === 'donaciones' && (
          <DonationCampaigns
            config={donationConfig}
            isAdmin={isAdmin}
            onAddPendingDonation={handleAddPendingDonation}
            onConfigChanged={handleConfigChanged}
            onShowNotification={triggerNotification}
          />
        )}

        {/* USER PROFILE VIEW */}
        {activeTab === 'perfil' && (
          <div className="animate-fade-in-up">
            <UserProfile userId={profileUserId} onGoBack={() => { setProfileUserId(undefined); setActiveTab('comunidad'); }} />
          </div>
        )}

        {/* FAQS VIEW */}
        {activeTab === 'faqs' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2 mb-8">
              <span className="material-symbols-outlined text-[48px] text-[#fc9d41] font-bold">help_center</span>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-slate-100">Preguntas Frecuentes</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto dark:text-slate-400">
                ¿Tienes dudas sobre cómo funciona la iniciativa de bienestar animal en la Universidad Nacional de Cañete? Encuentra tus respuestas inmediatas aquí:
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-3xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
                    >
                      <span className="font-display font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">
                        {faq.question}
                      </span>
                      <span className={`material-symbols-outlined transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    
                      {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/30 animate-fade-in dark:text-slate-400 dark:border-slate-700 dark:bg-slate-700/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Callout inside FAQs */}
            <div className="bg-[#eef4ff] rounded-2xl border border-[#dfe9fa] p-6 text-center space-y-3 mt-8 dark:bg-slate-800 dark:border-slate-700">
              <span className="material-symbols-outlined text-[32px] text-primary dark:text-slate-300">smart_toy</span>
              <h4 className="font-display font-bold text-slate-900 text-sm dark:text-slate-100">¿Aún tienes dudas? Habla con el Guardián AI</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto dark:text-slate-400">
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

        {/* ADOPCIONES VIEW */}
        {activeTab === 'adopciones' && (
          <AdoptionPanel onShowNotification={triggerNotification} />
        )}

        {/* ADMIN VIEW */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel onShowNotification={triggerNotification} onPetsChanged={handlePetsChanged} onConfigChanged={handleConfigChanged} donationConfig={donationConfig} />
        )}

      </main>

      {/* Footer Branding section */}
      <footer className="bg-[#00346f] py-10 mt-16 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo and brief */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold backdrop-blur-xs">
                <span className="material-symbols-outlined text-[18px] font-bold">pets</span>
              </div>
              <span className="font-display font-black text-white tracking-tight text-sm">UNDC Pets</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Iniciativa solidaria de la comunidad universitaria de la Universidad Nacional de Cañete para brindar refugio, alimentación y cuidado integral a las mascotas en situación vulnerable dentro de nuestras dependencias académicas.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2 md:pl-10">
            <h4 className="font-display font-bold text-white/70 text-[11px] uppercase tracking-wider mb-2">Navegación</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('directorio')} className="text-slate-300 hover:text-white text-left transition-colors">Mascotas del Campus</button>
              <button onClick={() => setActiveTab('comunidad')} className="text-slate-300 hover:text-white text-left transition-colors">Muro y Alertas</button>
              <button onClick={() => setActiveTab('blog')} className="text-slate-300 hover:text-white text-left transition-colors">Blog y Noticias</button>
              <button onClick={() => setActiveTab('donaciones')} className="text-slate-300 hover:text-white text-left transition-colors">Cuentas y Donaciones</button>
              <button onClick={() => setActiveTab('perfil')} className="text-slate-300 hover:text-white text-left transition-colors">Mi Perfil</button>
            </div>
          </div>

          {/* Legal / credits */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white/70 text-[11px] uppercase tracking-wider mb-2">Contacto Oficial</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Oficina de Bienestar Universitario, Pabellón de Servicios Centrales, Cañete, Lima, Perú.<br/>
              Correo: <a href="mailto:bienestar@undc.edu.pe" className="text-[#fc9d41] hover:text-white font-bold transition-colors">bienestar@undc.edu.pe</a>
            </p>
            <div className="pt-3 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="bg-white/10 px-2.5 py-1 rounded-full">© {new Date().getFullYear()} UNDC Pets</span>
              <span>Todos los derechos reservados</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-slate-400 text-center">
            Hecho con ❤️ por la comunidad UNDC para el bienestar animal
          </p>
        </div>
      </footer>

      {/* Floating Interactive Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-xl flex items-center gap-3 z-50 animate-slide-up max-w-sm border border-slate-800 dark:bg-slate-700 dark:border-slate-600">
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

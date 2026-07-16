import React, { useState, useEffect, useCallback } from 'react';
import { Adoption } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const ADOPTION_IMAGE_PRESETS = [
  { name: 'Perrito 1', url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&q=80' },
  { name: 'Perrito 2', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80' },
  { name: 'Gatito 1', url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80' },
  { name: 'Gatito 2', url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80' },
];

interface AdoptionPanelProps {
  onShowNotification: (msg: string) => void;
}

export default function AdoptionPanel({ onShowNotification }: AdoptionPanelProps) {
  const { user, isAdmin } = useAuth();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Adoption>>({});
  const [imagePreview, setImagePreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase.from('adoptions').select('*').order('created_at', { ascending: false });
      setAdoptions((data || []).map((r: any) => r.data as Adoption));
    } catch {
      // table might not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveAdoption = async () => {
    if (!form.name || !form.description || !form.contactName) {
      onShowNotification('Nombre, descripción y contacto son obligatorios');
      return;
    }
    const adoption: Adoption = {
      id: form.id || `adopt_${Date.now()}`,
      userId: user?.id || '',
      name: form.name || '',
      species: form.species || 'dog',
      gender: form.gender || 'male',
      age: form.age || 'Desconocida',
      description: form.description || '',
      image: imagePreview || form.image || ADOPTION_IMAGE_PRESETS[0].url,
      location: form.location || 'Por definir',
      contactName: form.contactName || '',
      contactPhone: form.contactPhone || '',
      contactEmail: form.contactEmail || user?.email || '',
      vaccinated: form.vaccinated ?? false,
      sterilized: form.sterilized ?? false,
      status: form.status || 'En adopción',
      timeAgo: 'Ahora',
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('adoptions').upsert({ id: adoption.id, data: adoption });
    } catch {}
    if (editingId) {
      setAdoptions(prev => prev.map(a => a.id === adoption.id ? adoption : a));
    } else {
      setAdoptions(prev => [adoption, ...prev]);
    }
    onShowNotification(editingId ? 'Publicación actualizada' : 'Mascota publicada en adopción');
    setShowForm(false); setEditingId(null); setForm({}); setImagePreview('');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('adoptions').delete().eq('id', id);
    setAdoptions(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
    onShowNotification('Publicación eliminada');
  };

  const openEdit = (adopt: Adoption) => {
    setForm(adopt);
    setImagePreview(adopt.image);
    setEditingId(adopt.id);
    setShowForm(true);
  };

  const openNew = () => {
    setForm({ species: 'dog', gender: 'male', status: 'En adopción', vaccinated: false, sterilized: false });
    setImagePreview('');
    setEditingId(null);
    setShowForm(true);
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const filtered = adoptions.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.contactName.toLowerCase().includes(q);
    const matchesSpecies = speciesFilter === 'all' || a.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-2/3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Adopciones Responsables</span>
              <span className="bg-emerald-400 text-emerald-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">🐾 Dar hogar</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              Panel de Adopciones 🏡
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Publica y busca mascotas en adopción. Si ves un animalito que necesita hogar, comparte su información aquí. ¡Juntos encontramos familias responsables!
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-full p-4 border border-white/20">
              <span className="material-symbols-outlined text-[72px] text-white/40 select-none">crowdsource</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{adoptions.length}</p>
            <p className="text-[10px] text-emerald-200 font-medium">En adopción</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{adoptions.filter(a => a.status === 'En adopción').length}</p>
            <p className="text-[10px] text-emerald-200 font-medium">Disponibles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{adoptions.filter(a => a.vaccinated).length}</p>
            <p className="text-[10px] text-emerald-200 font-medium">Vacunados</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar por nombre, descripción..." className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-xl" />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setSpeciesFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${speciesFilter === 'all' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}>Todos</button>
            <button onClick={() => setSpeciesFilter('dog')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${speciesFilter === 'dog' ? 'bg-emerald-600 text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}><span className="material-symbols-outlined text-[14px]">pets</span>Perros</button>
            <button onClick={() => setSpeciesFilter('cat')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${speciesFilter === 'cat' ? 'bg-emerald-600 text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}><span className="text-[14px]">🐈</span>Gatos</button>
          </div>
        </div>
        {user && (
          <button onClick={openNew} className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Publicar Adopción
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mb-3"></div>
          <p className="text-xs font-medium">Cargando adopciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center space-y-3">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[48px] text-emerald-400">pets</span>
          </div>
          <h3 className="font-display font-bold text-base text-slate-800">{searchQuery || speciesFilter !== 'all' ? 'Sin resultados' : 'No hay mascotas en adopción'}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{searchQuery || speciesFilter !== 'all' ? 'Prueba con otros filtros.' : 'Sé el primero en publicar una mascota que necesita hogar.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(adopt => {
            const isOwner = user && adopt.userId === user.id;
            return (
              <div key={adopt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-200 group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={adopt.image} alt={adopt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                      adopt.status === 'Adoptado' ? 'bg-emerald-500 text-white' :
                      adopt.status === 'En proceso' ? 'bg-amber-500 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>{adopt.status}</span>
                    {adopt.vaccinated && <span className="bg-blue-500/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">💉 Vacunado</span>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white drop-shadow-sm">{adopt.name}</h3>
                      <p className="text-[11px] text-white/80 font-medium">{adopt.species === 'dog' ? '🐕 Perro' : '🐈 Gato'} · {adopt.age} · {adopt.gender === 'male' ? '♂️ Macho' : adopt.gender === 'female' ? '♀️ Hembra' : '👥 Grupo'}</p>
                    </div>
                  </div>
                  {(isOwner || isAdmin) && (
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button onClick={() => openEdit(adopt)} className="bg-white/90 hover:bg-white text-slate-700 rounded-lg p-1.5 shadow-xs transition-all" title="Editar">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => setDeletingId(adopt.id)} className="bg-white/90 hover:bg-white text-rose-600 rounded-lg p-1.5 shadow-xs transition-all" title="Eliminar">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{adopt.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {adopt.sterilized && <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">✅ Esterilizado</span>}
                    {adopt.vaccinated && <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200">💉 Vacunado</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-100">
                    <p className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {adopt.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      {adopt.contactName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      {adopt.contactPhone || 'No especificado'}
                    </p>
                    {adopt.contactEmail && (
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                        {adopt.contactEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 h-9 w-9 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">pets</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">{editingId ? 'Editar' : 'Publicar'} Adopción</h3>
                <p className="text-[10px] text-slate-400">Completa los datos de la mascota</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Nombre de la mascota *</label>
                <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Especie</label>
                <select value={form.species || 'dog'} onChange={e => setForm({...form, species: e.target.value as 'dog' | 'cat'})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="dog">🐕 Perro</option>
                  <option value="cat">🐈 Gato</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Género</label>
                <select value={form.gender || 'male'} onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female' | 'group'})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="male">♂️ Macho</option>
                  <option value="female">♀️ Hembra</option>
                  <option value="group">👥 Grupo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Edad</label>
                <input value={form.age || ''} onChange={e => setForm({...form, age: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Estado</label>
                <select value={form.status || 'En adopción'} onChange={e => setForm({...form, status: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="En adopción">En adopción</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Adoptado">Adoptado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Ubicación</label>
                <input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Descripción *</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 resize-none" placeholder="Cuenta sobre su personalidad, tamaño, comportamiento, necesidades especiales..." />
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold text-slate-600 mb-2 text-xs">Información de contacto *</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Nombre de contacto *</label>
                    <input value={form.contactName || ''} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                    <input value={form.contactPhone || ''} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Correo electrónico</label>
                    <input value={form.contactEmail || ''} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold text-slate-600 mb-2 text-xs">Foto de la mascota</p>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all text-xs font-bold text-slate-600 hover:text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 rounded-xl object-cover bg-slate-100 border" />
                  </div>
                )}
                {!imagePreview && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ADOPTION_IMAGE_PRESETS.map(p => (
                      <button key={p.name} type="button" onClick={() => setImagePreview(p.url)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${imagePreview === p.url ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-300'}`}>
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="font-bold text-slate-600 mb-2 text-xs">Información adicional</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.vaccinated ?? false} onChange={e => setForm({...form, vaccinated: e.target.checked})} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs font-bold text-slate-600">Vacunado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.sterilized ?? false} onChange={e => setForm({...form, sterilized: e.target.checked})} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs font-bold text-slate-600">Esterilizado / Castrado</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowForm(false); setEditingId(null); setImagePreview(''); }} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={saveAdoption} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all">
                {editingId ? 'Guardar cambios' : 'Publicar adopción'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-[40px] text-rose-600 block mb-2">warning</span>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Eliminar publicación</h3>
            <p className="text-xs text-slate-600 mb-5">Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta mascota de adopción?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

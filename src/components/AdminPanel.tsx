import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Pet, Post, DonationCampana, DonationConfig, DonationAccount } from '../types';

type AdminTab = 'posts' | 'pets' | 'donaciones' | 'bloqueados';

export default function AdminPanel({ onShowNotification }: { onShowNotification: (msg: string) => void }) {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<AdminTab>('posts');

  if (!isAdmin) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#00346f] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900">Panel de Administración</h2>
          <p className="text-xs text-slate-500">Gestiona posts, mascotas, donaciones y usuarios</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
        {([
          { id: 'posts' as AdminTab, icon: 'forum', label: 'Posts' },
          { id: 'pets' as AdminTab, icon: 'pets', label: 'Mascotas' },
          { id: 'donaciones' as AdminTab, icon: 'volunteer_activism', label: 'Donaciones' },
          { id: 'bloqueados' as AdminTab, icon: 'block', label: 'Bloqueados' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-[#eef4ff] text-[#00346f]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && <PostsPanel onShowNotification={onShowNotification} />}
      {tab === 'pets' && <PetsPanel onShowNotification={onShowNotification} />}
      {tab === 'donaciones' && <DonacionesPanel onShowNotification={onShowNotification} />}
      {tab === 'bloqueados' && <BloqueadosPanel onShowNotification={onShowNotification} />}
    </div>
  );
}

/* ===== Posts Panel ===== */
function PostsPanel({ onShowNotification }: { onShowNotification: (msg: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts((data || []).map((r: any) => r.data as Post));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    onShowNotification('Post eliminado');
    load();
  };

  const handleBlockUser = async (userId: string | undefined, authorName: string) => {
    if (!userId) { onShowNotification('Este post no tiene userId asociado'); return; }
    const reason = window.prompt(`Motivo para bloquear a ${authorName}:`, 'Incumplimiento de normas');
    if (!reason) return;
    await supabase.from('blocked_users').upsert({ user_id: userId, reason, blocked_by: 'admin' });
    onShowNotification(`Usuario ${authorName} bloqueado`);
  };

  if (loading) return <div className="text-xs text-slate-500 py-8 text-center">Cargando posts...</div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{posts.length} publicaciones en total</p>
      {posts.map(post => (
        <div key={post.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-8 w-8 rounded-full ${post.avatarColor || 'bg-slate-500'} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                {post.authorInitials}
              </div>
              <div className="truncate">
                <p className="font-bold text-sm text-slate-800 truncate">{post.authorName}</p>
                <p className="text-[10px] text-slate-400 truncate">{post.authorRole} · {post.timeAgo}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => handleBlockUser(post.userId, post.authorName)} className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg" title="Bloquear usuario">
                <span className="material-symbols-outlined text-[14px]">block</span>
              </button>
              <button onClick={() => handleDelete(post.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg" title="Eliminar post">
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">{post.content}</p>
          <div className="flex gap-3 text-[10px] text-slate-400">
            <span>{post.likes} likes</span>
            <span>{post.commentsCount} comentarios</span>
            {post.sharedBy?.length ? <span>{post.sharedBy.length} compartidos</span> : null}
          </div>
        </div>
      ))}
      {posts.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No hay publicaciones</p>}
    </div>
  );
}

/* ===== Pets Panel ===== */
function PetsPanel({ onShowNotification }: { onShowNotification: (msg: string) => void }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Pet>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from('pets').select('*');
    setPets((data || []).map((r: any) => r.data as Pet));
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePet = async () => {
    const pet: Pet = {
      id: form.id || `pet_${Date.now()}`,
      name: form.name || '',
      species: form.species || 'dog',
      gender: form.gender || 'male',
      age: form.age || '',
      status: form.status || '',
      statusType: form.statusType || 'info',
      tags: form.tags || [],
      description: form.description || '',
      image: form.image || '',
      story: form.story || '',
      location: form.location || '',
    };
    if (!pet.name) { onShowNotification('El nombre es obligatorio'); return; }
    await supabase.from('pets').upsert({ id: pet.id, data: pet });
    onShowNotification(`Mascota ${editing ? 'actualizada' : 'creada'}`);
    setEditing(null); setShowForm(false); setForm({});
    load();
  };

  const deletePet = async (id: string) => {
    await supabase.from('pets').delete().eq('id', id);
    onShowNotification('Mascota eliminada');
    load();
  };

  const startEdit = (pet: Pet) => {
    setEditing(pet); setForm(pet); setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">{pets.length} mascotas registradas</p>
        <button onClick={() => { setEditing(null); setForm({ species: 'dog', gender: 'male', statusType: 'info', tags: [] }); setShowForm(true); }} className="bg-[#00346f] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva Mascota
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg">{editing ? 'Editar' : 'Nueva'} Mascota</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Nombre</label>
                <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Especie</label>
                <select value={form.species || 'dog'} onChange={e => setForm({...form, species: e.target.value as 'dog' | 'cat'})} className="w-full p-2 rounded-xl border border-slate-200">
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Género</label>
                <select value={form.gender || 'male'} onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female' | 'group'})} className="w-full p-2 rounded-xl border border-slate-200">
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                  <option value="group">Grupo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Edad</label>
                <input value={form.age || ''} onChange={e => setForm({...form, age: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Estado</label>
                <input value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">statusType</label>
                <select value={form.statusType || 'info'} onChange={e => setForm({...form, statusType: e.target.value as any})} className="w-full p-2 rounded-xl border border-slate-200">
                  <option value="success">success</option>
                  <option value="warning">warning</option>
                  <option value="error">error</option>
                  <option value="info">info</option>
                  <option value="primary">primary</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Tags (separados por coma)</label>
                <input value={(form.tags || []).join(', ')} onChange={e => setForm({...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Ruta de imagen</label>
                <input value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Ubicación</label>
                <input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Descripción corta</label>
                <textarea rows={2} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Historia</label>
                <textarea rows={3} value={form.story || ''} onChange={e => setForm({...form, story: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl">Cancelar</button>
              <button onClick={savePet} className="flex-1 bg-[#00346f] text-white text-xs font-bold py-2.5 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pets.map(pet => (
          <div key={pet.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 items-center">
            <img src={pet.image} alt={pet.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-800 truncate">{pet.name}</p>
              <p className="text-[10px] text-slate-400">{pet.species === 'dog' ? 'Perro' : 'Gato'} · {pet.age} · {pet.location}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(pet)} className="bg-[#eef4ff] text-primary text-[10px] font-bold px-2 py-1 rounded-lg">Editar</button>
              <button onClick={() => deletePet(pet.id)} className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Donaciones Panel ===== */
function DonacionesPanel({ onShowNotification }: { onShowNotification: (msg: string) => void }) {
  const [config, setConfig] = useState<DonationConfig | null>(null);
  const [editCampaign, setEditCampaign] = useState<DonationCampana | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campForm, setCampForm] = useState<Partial<DonationCampana>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from('donation_config').select('*').eq('id', 'main').single();
    if (data) setConfig(data.data as DonationConfig);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveConfig = async (newConfig: DonationConfig) => {
    await supabase.from('donation_config').upsert({ id: 'main', data: newConfig as any });
    setConfig(newConfig);
    onShowNotification('Configuración de donaciones actualizada');
  };

  if (!config) return <div className="text-xs text-slate-500 py-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Cuentas Bancarias */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance</span>
          Cuentas Bancarias
        </h3>
        {config.accounts.map((acc, i) => (
          <EditableAccountRow
            key={i}
            account={acc}
            onChange={(updated) => {
              const accounts = [...config.accounts];
              accounts[i] = updated;
              saveConfig({ ...config, accounts });
            }}
            onDelete={() => {
              const accounts = config.accounts.filter((_, idx) => idx !== i);
              saveConfig({ ...config, accounts });
            }}
          />
        ))}
        <button
          onClick={() => {
            const accounts = [...config.accounts, { bank: '', number: '', CCI: '' }];
            saveConfig({ ...config, accounts });
          }}
          className="text-primary text-xs font-bold flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Agregar cuenta
        </button>
      </div>

      {/* Yape / Plin */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900">Yape / Plin</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Número Yape</label>
            <input value={config.yapeNumber} onChange={e => saveConfig({ ...config, yapeNumber: e.target.value })} className="w-full p-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Número Plin</label>
            <input value={config.plinNumber} onChange={e => saveConfig({ ...config, plinNumber: e.target.value })} className="w-full p-2 rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>

      {/* QR Codes paths */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900">Rutas de Códigos QR</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {(['yape', 'plin', 'bcp', 'tunqui'] as const).map(key => (
            <div key={key}>
              <label className="block font-bold text-slate-600 mb-1 capitalize">{key}</label>
              <input value={config.qrCodes[key]} onChange={e => saveConfig({ ...config, qrCodes: { ...config.qrCodes, [key]: e.target.value } })} className="w-full p-2 rounded-xl border border-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-sm text-slate-900">Campañas</h3>
          <button onClick={() => { setEditCampaign(null); setCampForm({ urgency: 'Media', currentAmount: 0, targetAmount: 100 }); setShowCampaignForm(true); }} className="bg-[#00346f] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span>
            Nueva
          </button>
        </div>
        {config.campaigns.map((camp, i) => (
          <div key={camp.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-slate-800 truncate">{camp.title}</p>
              <p className="text-[10px] text-slate-400">S/.{camp.currentAmount} / S/.{camp.targetAmount} · {camp.urgency}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditCampaign(camp); setCampForm(camp); setShowCampaignForm(true); }} className="text-primary text-[10px] font-bold px-2 py-1 rounded-lg bg-[#eef4ff]">Editar</button>
              <button onClick={() => {
                const campaigns = config.campaigns.filter((_, idx) => idx !== i);
                saveConfig({ ...config, campaigns });
              }} className="text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-50">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Form Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setShowCampaignForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg">{editCampaign ? 'Editar' : 'Nueva'} Campaña</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Título</label>
                <input value={campForm.title || ''} onChange={e => setCampForm({...campForm, title: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Descripción</label>
                <textarea rows={2} value={campForm.description || ''} onChange={e => setCampForm({...campForm, description: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Monto actual</label>
                  <input type="number" value={campForm.currentAmount ?? 0} onChange={e => setCampForm({...campForm, currentAmount: Number(e.target.value)})} className="w-full p-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Meta</label>
                  <input type="number" value={campForm.targetAmount ?? 100} onChange={e => setCampForm({...campForm, targetAmount: Number(e.target.value)})} className="w-full p-2 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Urgencia</label>
                <select value={campForm.urgency || 'Media'} onChange={e => setCampForm({...campForm, urgency: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200">
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowCampaignForm(false); setEditCampaign(null); }} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl">Cancelar</button>
              <button onClick={() => {
                if (!campForm.title) { onShowNotification('El título es obligatorio'); return; }
                const camp: DonationCampana = {
                  id: campForm.id || `camp_${Date.now()}`,
                  title: campForm.title || '',
                  description: campForm.description || '',
                  currentAmount: campForm.currentAmount ?? 0,
                  targetAmount: campForm.targetAmount ?? 100,
                  urgency: campForm.urgency || 'Media',
                };
                let campaigns: DonationCampana[];
                if (editCampaign) {
                  campaigns = config.campaigns.map(c => c.id === camp.id ? camp : c);
                } else {
                  campaigns = [...config.campaigns, camp];
                }
                saveConfig({ ...config, campaigns });
                setShowCampaignForm(false); setEditCampaign(null);
              }} className="flex-1 bg-[#00346f] text-white text-xs font-bold py-2.5 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableAccountRow({ account, onChange, onDelete }: { account: DonationAccount; onChange: (a: DonationAccount) => void; onDelete: () => void }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <input value={account.bank} onChange={e => onChange({ ...account, bank: e.target.value })} className="font-bold text-slate-800 bg-white p-1.5 rounded-lg border border-slate-200 flex-1 mr-2" placeholder="Nombre del banco" />
        <button onClick={onDelete} className="text-rose-500 hover:text-rose-700"><span className="material-symbols-outlined text-[16px]">remove_circle</span></button>
      </div>
      <input value={account.number} onChange={e => onChange({ ...account, number: e.target.value })} className="w-full bg-white p-1.5 rounded-lg border border-slate-200" placeholder="Número de cuenta" />
      <input value={account.CCI} onChange={e => onChange({ ...account, CCI: e.target.value })} className="w-full bg-white p-1.5 rounded-lg border border-slate-200" placeholder="CCI" />
    </div>
  );
}

/* ===== Bloqueados Panel ===== */
function BloqueadosPanel({ onShowNotification }: { onShowNotification: (msg: string) => void }) {
  const [blocked, setBlocked] = useState<any[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newReason, setNewReason] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('blocked_users').select('*').order('blocked_at', { ascending: false });
    setBlocked(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async () => {
    if (!newUserId) return;
    await supabase.from('blocked_users').upsert({ user_id: newUserId, reason: newReason || 'Sin motivo', blocked_by: 'admin' });
    onShowNotification('Usuario bloqueado');
    setNewUserId(''); setNewReason('');
    load();
  };

  const handleUnblock = async (userId: string) => {
    await supabase.from('blocked_users').delete().eq('user_id', userId);
    onShowNotification('Usuario desbloqueado');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900">Bloquear usuario manualmente</h3>
        <div className="flex gap-2 text-xs">
          <input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="User ID (google-uid)" className="flex-1 p-2 rounded-xl border border-slate-200" />
          <input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Motivo" className="flex-1 p-2 rounded-xl border border-slate-200" />
          <button onClick={handleBlock} className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl">Bloquear</button>
        </div>
      </div>

      <div className="space-y-2">
        {blocked.map(b => (
          <div key={b.user_id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-800">{b.user_id}</p>
              <p className="text-[10px] text-slate-400">{b.reason} · {new Date(b.blocked_at).toLocaleDateString('es-PE')}</p>
            </div>
            <button onClick={() => handleUnblock(b.user_id)} className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-xl">Desbloquear</button>
          </div>
        ))}
        {blocked.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No hay usuarios bloqueados</p>}
      </div>
    </div>
  );
}

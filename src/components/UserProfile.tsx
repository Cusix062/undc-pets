import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Post } from '../types';

type ProfileTab = 'fotos' | 'compartidos';

interface UserProfileProps {
  userId?: string;
  onGoBack?: () => void;
}

export default function UserProfile({ userId, onGoBack }: UserProfileProps) {
  const { user, updateAvatar, deleteAccount } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('fotos');
  const [viewingUser, setViewingUser] = useState<{ name: string; avatar?: string; email?: string; description?: string } | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [modalComment, setModalComment] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const meta = user?.user_metadata || {};
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (user) {
      setGivenName(user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || '');
      setFamilyName(user.user_metadata?.family_name || user.user_metadata?.full_name?.slice(1).join(' ') || '');
      setDescription(user.user_metadata?.description || '');
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setViewingUser(null);
    supabase.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      const all = (data || []).map((r: any) => r.data as Post);
      setAllPosts(all);
      if (userId) {
        const userPost = all.find(p => p.userId === userId);
        if (userPost) {
          setViewingUser({
            name: userPost.authorName,
            avatar: userPost.userAvatar,
            email: userPost.userId,
            description: undefined,
          });
        } else {
          setViewingUser({ name: 'Usuario' });
        }
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [userId, user?.id]);

  const profilePosts = isOwnProfile
    ? allPosts.filter(p => p.userId === user?.id)
    : allPosts.filter(p => p.userId === userId);

  const sharedPosts = isOwnProfile
    ? allPosts.filter(p => p.sharedBy?.includes(user?.id || ''))
    : allPosts.filter(p => p.sharedBy?.includes(userId || ''));

  const photoPosts = profilePosts.filter(p => p.image);
  const totalLikes = profilePosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const profileName = isOwnProfile ? (meta.full_name || user?.email || 'Usuario') : (viewingUser?.name || 'Usuario');
  const profileAvatar = avatarPreview || (isOwnProfile ? meta.avatar_url : viewingUser?.avatar);
  const profileInitials = profileName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.auth.updateUser({
      data: {
        given_name: givenName,
        family_name: familyName,
        full_name: `${givenName} ${familyName}`.trim(),
        description,
      },
    });
    setSaving(false);
    setEditing(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      await updateAvatar(dataUrl);
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      // fallback: sign out and delete user data manually
      await supabase.from('posts').delete().eq('userId', user?.id);
      await supabase.auth.signOut();
    }
    setDeletingAccount(false);
  };

  const handleModalComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalComment.trim() || !viewingPost || !user) return;
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: user.user_metadata?.full_name || user.email || 'Anónimo',
      authorAvatar: user.user_metadata?.avatar_url,
      userId: user.id,
      content: modalComment.trim(),
      timeAgo: 'Ahora',
    };
    const updatedComments = [...viewingPost.comments, newComment];
    const updatedPost = { ...viewingPost, comments: updatedComments, commentsCount: updatedComments.length };
    setViewingPost(updatedPost);
    setModalComment('');
    const idx = allPosts.findIndex(p => p.id === viewingPost.id);
    if (idx !== -1) {
      const newAll = [...allPosts];
      newAll[idx] = updatedPost;
      setAllPosts(newAll);
    }
    await supabase.from('posts').update({ data: updatedPost }).eq('id', viewingPost.id);
  };

  const handleModalLike = async () => {
    if (!viewingPost || !user) return;
    const newLikes = viewingPost.likes + 1;
    const updatedPost = { ...viewingPost, likes: newLikes };
    setViewingPost(updatedPost);
    const idx = allPosts.findIndex(p => p.id === viewingPost.id);
    if (idx !== -1) {
      const newAll = [...allPosts];
      newAll[idx] = updatedPost;
      setAllPosts(newAll);
    }
    await supabase.from('posts').update({ data: updatedPost }).eq('id', viewingPost.id);
  };

  useEffect(() => {
    const channel = supabase.channel('profile-posts-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload: any) => {
        const updated = payload.new.data as Post;
        setAllPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setViewingPost(prev => prev && prev.id === updated.id ? updated : prev);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
        setAllPosts(prev => [payload.new.data as Post, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload: any) => {
        setAllPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const tabs: { key: ProfileTab; icon: string; label: string; count?: number }[] = [
    { key: 'fotos', icon: 'photo_library', label: 'Fotos', count: photoPosts.length },
    { key: 'compartidos', icon: 'share', label: 'Compartidos', count: sharedPosts.length },
  ];

  if (!user && !userId) {
    return (
      <div className="text-center py-24">
        <div className="bg-white max-w-sm mx-auto rounded-2xl border border-slate-100 shadow-xs p-10">
          <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[36px] text-slate-400">person</span>
          </div>
          <p className="text-sm font-bold text-slate-700">Inicia sesión para ver tu perfil</p>
          <p className="text-xs text-slate-400 mt-1">Conecta con tu cuenta de Google o correo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">

      {/* Delete Account Confirmation */}
      {deletingAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setDeletingAccount(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-rose-500">warning</span>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-2">¿Eliminar cuenta?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Esta acción eliminará tus publicaciones y no se puede deshacer. Tus datos personales serán removidos.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingAccount(false)} className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={handleDeleteAccount} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all">Eliminar Cuenta</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {viewingPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewingPost(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[250px]">
              <img src={viewingPost.image} alt="" className="w-full h-full max-h-[60vh] md:max-h-[80vh] object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="md:w-2/5 flex flex-col">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                {viewingPost.userAvatar ? (
                  <img src={viewingPost.userAvatar} alt="" className="h-8 w-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${viewingPost.avatarColor}`}>{viewingPost.authorInitials}</div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">{viewingPost.authorName}</p>
                  <p className="text-[10px] text-slate-400">{viewingPost.timeAgo}</p>
                </div>
                <button onClick={() => setViewingPost(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed">{viewingPost.content}</p>
                {viewingPost.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 items-start">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt="" className="h-6 w-6 rounded-full border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#00346f]/10 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
                        {comment.authorName.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-[10px] text-slate-800">{comment.authorName}</span>
                      <p className="text-[11px] text-slate-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-3 space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                  {user ? (
                    <button onClick={handleModalLike} className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                      <span className="material-symbols-outlined text-rose-500 text-[16px]">favorite</span>{viewingPost.likes}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-rose-500 text-[16px]">favorite</span>{viewingPost.likes}</span>
                  )}
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">chat_bubble</span>{viewingPost.comments.length}</span>
                </div>
                {user ? (
                  <form onSubmit={handleModalComment} className="flex gap-2">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="h-7 w-7 rounded-full border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-slate-300 text-white text-[9px] font-bold flex items-center justify-center shrink-0">?</div>
                    )}
                    <input type="text" value={modalComment} onChange={e => setModalComment(e.target.value)} placeholder="Escribe un comentario..." className="flex-grow text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f]" />
                    <button type="submit" disabled={!modalComment.trim()} className="bg-[#00346f] hover:bg-[#002450] disabled:bg-slate-300 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center disabled:opacity-40">
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center py-1">Inicia sesión para comentar</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#00346f]/5 to-white h-20" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="relative group">
              {profileAvatar ? (
                <img src={profileAvatar} alt={profileName} className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-[#00346f] text-white text-2xl font-bold flex items-center justify-center">
                  {profileInitials}
                </div>
              )}
              {isOwnProfile && editing && (
                <label className="absolute inset-0 bg-black/40 rounded-full border-4 border-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-extrabold text-lg text-slate-900 truncate">{profileName}</h2>
              {isOwnProfile && <p className="text-[11px] text-slate-500">{user?.email}</p>}
            </div>
            <div className="flex gap-2">
              {onGoBack && (
                <button onClick={onGoBack} className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Volver
                </button>
              )}
              {isOwnProfile && (
                <button onClick={() => setEditing(!editing)} className={`shrink-0 border text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${editing ? 'bg-[#00346f] text-white border-[#00346f]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-[14px]">{editing ? 'close' : 'edit'}</span>
                  {editing ? 'Cerrar' : 'Editar'}
                </button>
              )}
            </div>
          </div>

          {isOwnProfile && editing ? (
            <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre</label>
                  <input type="text" value={givenName} onChange={e => setGivenName(e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Apellido</label>
                  <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white resize-none" placeholder="Cuéntanos sobre ti..." />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5">
                    {saving ? <><span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><span className="material-symbols-outlined text-[14px]">save</span> Guardar Cambios</>}
                  </button>
                  <button onClick={() => setEditing(false)} className="border border-slate-200 bg-white text-slate-600 text-xs font-bold px-5 py-2 rounded-xl hover:bg-slate-50 transition-all">
                    Cancelar
                  </button>
                </div>
                <button onClick={() => setDeletingAccount(true)} className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          ) : isOwnProfile && description ? (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
            </div>
          ) : null}

          {isOwnProfile && !editing && (
            <div className="flex justify-end mt-2">
              <button onClick={() => setDeletingAccount(true)} className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">delete_forever</span>
                Eliminar cuenta
              </button>
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="font-extrabold text-sm text-slate-900">{photoPosts.length}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fotos</p>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-sm text-slate-900">{totalLikes}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Me Gusta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Nav */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold transition-all relative ${
                activeTab === tab.key
                  ? 'text-[#00346f]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-[#eef4ff] text-[#00346f]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00346f] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-[#00346f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'fotos' ? (
            photoPosts.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-[40px] text-slate-200">photo_library</span>
                <p className="text-xs text-slate-400 mt-2">No hay fotos compartidas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photoPosts.map(post => (
                  <div key={post.id} className="rounded-xl overflow-hidden border border-slate-100 group cursor-pointer relative bg-slate-50 h-40" onClick={() => setViewingPost(post)}>
                    <img src={post.image} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )
          ) : (
            sharedPosts.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-[40px] text-slate-200">share</span>
                <p className="text-xs text-slate-400 mt-2">No hay publicaciones compartidas.</p>
                <p className="text-[10px] text-slate-300 mt-1">Usa el botón "Compartir" en las publicaciones de la Comunidad.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedPosts.map(post => (
                  <div key={post.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      {post.userAvatar ? (
                        <img src={post.userAvatar} alt="" className="h-6 w-6 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-[#00346f] text-white text-[8px] font-bold flex items-center justify-center">{post.authorInitials}</div>
                      )}
                      <span className="text-[10px] font-bold text-slate-600">{post.authorName}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="" className="mt-2 w-full max-h-40 object-contain rounded-xl border border-slate-100 cursor-pointer" onClick={() => setViewingPost(post)} />
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span>{post.likes}</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

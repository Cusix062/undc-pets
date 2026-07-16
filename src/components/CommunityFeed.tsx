import React, { useState, useEffect, useCallback } from 'react';
import { Post, Pet } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import GoogleSignIn from './GoogleSignIn';

interface CommunityFeedProps {
  onAddPetToDirectory: (newPet: Pet) => void;
  onShowNotification: (msg: string) => void;
  onViewProfile?: (userId: string) => void;
}

const REPORT_IMAGE_PRESETS = [
  { name: 'Perrito Marrón', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2i2W1arQBFTwpEeUo0z4Dsb9h2e3PZMoE10SykRF5jCSUMjzr9r5Z7vtTfMfBENsDKk-0E3UPEeGkzpomvlPGpEL__jT1_YKU7HxFrM8dSbEn1o7Sq4gJUK5hW6zd4IYxkbDLEhLPsK6sFPQK9uGUt9dcAoTHilOZfIhqhwI_ZN_3yHi2EJvdkpwcuZ8CfNFeJnBxUBOK_mzf5dw_ZSg4dezHECvS1WkyQHJPjCXIJ95iPH7CvUqMzzW21HbTYFjl0gyZx53Igw' },
  { name: 'Perrito Cachorro', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIecH4RFZorUrY6K0rGPLEr9Eu0MPEkQ9vbGpv_JhK-QGSmzXE4ipyIp8kYukyUxD_Gkjh8DZ-0-2255XSUHGBjykumWXe7PvIn1ZZIMM8DeK0zaD2WPdstAH6Xe6Pd6WfmcfM0_st5TC_PH4ge7a7Finkg6f1OtbWlRkjJ-oTd0EWsnJTC6bnnnGECB6Ima4SBAmVrYpopyICPBjQmVTi2_UI0erfqYPAW5ebN3aJc2DVBaC33IN0hFfsOJ1hSx5wPRcsAu7Qg' },
  { name: 'Gatito Dormilón', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbwdruzdtZ9fnaKR24BcWSxkVKaBQPC232e6PnZb_zMNpwzXf-OThLK19KFhFc2Q4ivnXSf_cGU13d-wVQun9d_tfe67_jen2N0YNIYJvJiPImqMl1DZqmtooD2xoaaPYa4nXlZCq72eMdJGW2SlD1_K7vb_R4JHfhUGW-jKnkwVW4tuY9kw8itTrzy74ejfI2LkhxISTt_bRCQoQIYJTyaJI7MGK4qxReSDxysHpVgVPUK2_5X9hVAraxQHD8SIR4RlylaE9b6A' },
  { name: 'Gatito Pequeño', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5hU-Itt0ePmS68Rlw3j_hiG6UceKzWLfxKGnpSx1ZRO9cl3Uh97bYjERjO5AOP4eUHcqfqXMS1za5zgrh9toAOMtBsf6mzchv5ylEaxBaJ5VSblu_b3BU2mT7qTxls6kT6mOHg81kBL6wRyBcWKG-UGiJns_DgTD8bH8mIpOTTQ9f9LogYXF39ky-Zn4m9VWACp9NAL7xtqrl8vreo2uYgoiYyJdCqAttFw5Z11BT4iathr8jZ3Od0v6MQWjSra7A74RDb2jldQ' }
];

export default function CommunityFeed({ onAddPetToDirectory, onShowNotification, onViewProfile }: CommunityFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportExpanded, setReportExpanded] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportSpecies, setReportSpecies] = useState<'dog' | 'cat'>('dog');
  const [reportGender, setReportGender] = useState<'male' | 'female' | 'group'>('male');
  const [reportAge, setReportAge] = useState('');
  const [reportStatus, setReportStatus] = useState('Avistado recientemente');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportStory, setReportStory] = useState('');
  const [reportImage, setReportImage] = useState(REPORT_IMAGE_PRESETS[0].url);
  const [reporterEmail, setReporterEmail] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      setPosts((data || []).map((r: any) => r.data as Post));
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const channel = supabase.channel('posts-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload: any) => {
        const updated = payload.new.data as Post;
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
        const inserted = payload.new.data as Post;
        setPosts(prev => [inserted, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload: any) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const updatePost = async (postId: string, newData: Partial<Post>) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedPost = { ...post, ...newData };
    const updated = posts.map(p => p.id === postId ? updatedPost : p);
    setPosts(updated);
    await supabase.from('posts').update({ data: updatedPost }).eq('id', postId);
  };

  const handleLike = async (postId: string) => {
    if (!user) { onShowNotification('Debes iniciar sesión'); return; }
    const isLiked = likedPosts[postId];
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newLikes = post.likes + (isLiked ? -1 : 1);
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    await updatePost(postId, { likes: newLikes });
    onShowNotification(isLiked ? 'Quitaste tu Me gusta' : '¡Le diste Me gusta!');
  };

  const handleReportImageSelect = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setReportImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user) { onShowNotification('Debes iniciar sesión'); return; }
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: user?.user_metadata?.full_name || user?.email || 'Estudiante UNDC',
      authorAvatar: user?.user_metadata?.avatar_url,
      userId: user?.id,
      content: commentText.trim(),
      timeAgo: 'Ahora',
    };
    const updatedComments = [...post.comments, newComment];
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    await updatePost(postId, { comments: updatedComments, commentsCount: updatedComments.length });
    onShowNotification('¡Comentario publicado!');
  };

  const handleFileSelect = (file: File | null) => {
    setNewPostFile(file);
    if (!file) { setNewPostImage(''); return; }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const max = 1200;
        if (w > max || h > max) {
          if (w > h) { h = h * max / w; w = max; }
          else { w = w * max / h; h = max; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        setNewPostImage(canvas.toDataURL('image/jpeg', 0.7));
        setUploadingImage(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    if (!user) { onShowNotification('Debes iniciar sesión para publicar'); return; }

    const { data: blocked } = await supabase.from('blocked_users').select('user_id').eq('user_id', user.id).maybeSingle();
    if (blocked) { onShowNotification('Tu cuenta ha sido bloqueada para publicar. Contacta al administrador.'); return; }

    const meta = user.user_metadata;
    const name = meta.full_name || user.email || 'Anónimo';
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      userAvatar: meta.avatar_url,
      authorName: name,
      authorRole: 'Comunidad UNDC',
      authorInitials: initials,
      avatarColor: 'bg-indigo-600',
      content: newPostContent.trim(),
      image: newPostImage || undefined,
      likes: 0,
      commentsCount: 0,
      comments: [],
      timeAgo: 'Ahora',
    };
    try {
      const { error } = await supabase.from('posts').insert({ id: newPost.id, data: newPost });
      if (error) throw error;
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostImage('');
      setNewPostFile(null);
      onShowNotification('¡Publicación compartida!');
    } catch (e: any) {
      console.error('Error al publicar:', e);
      onShowNotification('Error al publicar: ' + (e.message || 'desconocido'));
    }
  };

  const handleEditSubmit = async (postId: string) => {
    if (!editContent.trim()) return;
    await updatePost(postId, { content: editContent.trim() });
    setEditingPostId(null);
    setEditContent('');
    onShowNotification('Publicación actualizada');
  };

  const handleDelete = async (postId: string) => {
    setDeletingPostId(postId);
  };

  const confirmDelete = async (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    await supabase.from('posts').delete().eq('id', postId);
    setDeletingPostId(null);
    onShowNotification('Publicación eliminada');
  };

  const handleShare = async (postId: string) => {
    if (!user) { onShowNotification('Debes iniciar sesión'); return; }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const sharedBy = post.sharedBy || [];
    if (sharedBy.includes(user.id)) {
      onShowNotification('Ya compartiste esta publicación');
      return;
    }
    await updatePost(postId, { sharedBy: [...sharedBy, user.id] });
    onShowNotification('Publicación compartida en tu perfil');
  };

  const handleReportMascotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onShowNotification('Debes iniciar sesión para reportar'); return; }
    if (!reportName || !reportLocation || !reportDescription) {
      alert('Completa todos los datos obligatorios.');
      return;
    }
    const newPet: Pet = {
      id: `report_${Date.now()}`,
      name: reportName,
      species: reportSpecies,
      gender: reportGender,
      age: reportAge || 'Edad desconocida',
      status: reportStatus,
      statusType: 'warning',
      tags: ['Reportado', reportStatus, reportLocation],
      description: reportDescription,
      image: reportImage,
      story: reportStory || `Mascota reportada en la UNDC (${reportLocation}) por ${reporterEmail || 'Anónimo'}. Descripción: ${reportDescription}`,
      location: reportLocation,
      reportedBy: reporterEmail || user?.email || 'Anónimo',
    };
    onAddPetToDirectory(newPet);
    const newPost: Post = {
      id: `post_report_${Date.now()}`,
      userId: user.id,
      authorName: 'Reporte de Alerta',
      authorRole: 'Bienestar Animal',
      authorInitials: '🚨',
      avatarColor: 'bg-rose-600',
      content: `🚨 NUEVA MASCOTA REPORTADA: Se ha avistado a "${reportName}" en ${reportLocation}. ${reportDescription}`,
      image: reportImage,
      likes: 5,
      commentsCount: 0,
      comments: [],
      timeAgo: 'Ahora',
      tag: 'Alerta de Mascota',
    };
    try {
      const { error } = await supabase.from('posts').insert({ id: newPost.id, data: newPost });
      if (error) throw error;
      setPosts([newPost, ...posts]);
    } catch (e) {
      console.error('Error al reportar:', e);
    }
    setReportName('');
    setReportAge('');
    setReportLocation('');
    setReportDescription('');
    setReportStory('');
    setReporterEmail('');
    onShowNotification(`¡Reporte de ${reportName} registrado!`);
  };

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);
  const alertPosts = posts.filter(p => p.authorName === 'Reporte de Alerta');
  const regularPosts = posts.filter(p => p.authorName !== 'Reporte de Alerta');

  return (
    <div id="community-feed-container" className="space-y-6">
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
          <button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          <img src={viewingImage} alt="" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} referrerPolicy="no-referrer" />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeletingPostId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-[40px] text-rose-600 block mb-2">warning</span>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Eliminar publicación</h3>
            <p className="text-xs text-slate-600 mb-5">Esta acción no se puede deshacer. ¿Estás seguro?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingPostId(null)} className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={() => confirmDelete(deletingPostId)} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#00346f] via-[#004a8c] to-[#005da8] rounded-3xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-2/3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Comunidad UNDC</span>
              <span className="bg-[#fc9d41] text-[#6b3900] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">💬 Muro Social</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              El Rincón de los Amigos Peludos 🐾
            </h2>
            <p className="text-sm text-slate-100 leading-relaxed">
              Comparte fotos, anécdotas y novedades sobre Curly, Princesa, RunRun y todas las mascotas que alegran nuestro campus. ¡Cada publicación ayuda a construir una comunidad más unida y consciente!
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-full p-4 border border-white/20">
              <span className="material-symbols-outlined text-[72px] text-white/40 select-none">pets</span>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{posts.length}</p>
            <p className="text-[10px] text-slate-200 font-medium">Publicaciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{totalLikes}</p>
            <p className="text-[10px] text-slate-200 font-medium">Me gusta</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{totalComments}</p>
            <p className="text-[10px] text-slate-200 font-medium">Comentarios</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex gap-1">
          <div className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold bg-[#00346f] text-white shadow-sm">
            <span className="material-symbols-outlined text-[16px]">forum</span>
            Muro Comunitario
          </div>
        </div>
        <div className="hidden sm:block">
          <GoogleSignIn />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Create Post Card - improved */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-[#eef4ff] to-white px-5 pt-5 pb-3 border-b border-slate-50">
                <div className="flex gap-3 items-center">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="h-11 w-11 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="bg-gradient-to-br from-[#00346f] to-[#0050aa] text-white font-bold h-11 w-11 rounded-full flex items-center justify-center text-sm shadow-sm">
                      {user ? user.user_metadata?.full_name?.charAt(0) || '?' : '?'}
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-slate-800">Comparte con la comunidad</p>
                    <p className="text-[11px] text-slate-400">Fotos, anécdotas o novedades del campus</p>
                  </div>
                </div>
              </div>
              {user ? (
                <form onSubmit={handleCreatePostSubmit} className="p-5 space-y-4">
                  <div className="relative">
                    <textarea rows={3} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="¿Qué está pasando con los amigos peludos hoy?" required className="w-full text-sm p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-2 focus:ring-[#00346f]/10 bg-white resize-none shadow-xs transition-all" />
                    <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{newPostContent.length} caracteres</span>
                  </div>
                  {newPostImage && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm shadow-xs">
                      <img src={newPostImage} alt="Preview" className="w-full max-h-48 object-contain bg-slate-50" />
                      <button type="button" onClick={() => { setNewPostFile(null); setNewPostImage(''); }} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-7 w-7 flex items-center justify-center transition-all backdrop-blur-xs">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#00346f] hover:bg-[#eef4ff] cursor-pointer transition-all text-xs font-bold text-slate-600 hover:text-[#00346f]">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      {uploadingImage ? 'Procesando...' : 'Agregar Foto'}
                      <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                    <div className="flex items-center gap-2">
                      {user?.user_metadata?.full_name && (
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{user.user_metadata.full_name.split(' ')[0]}</span>
                      )}
                      <button type="submit" disabled={!newPostContent.trim()} className="bg-gradient-to-r from-[#00346f] to-[#0050aa] hover:from-[#002450] hover:to-[#00346f] disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Publicar
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-10 mx-5 mb-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="bg-white/60 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <span className="material-symbols-outlined text-[36px] text-slate-400">login</span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold">Inicia sesión con Google</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Comparte fotos, anécdotas y reportes de mascotas</p>
                  <div className="inline-block">
                    <GoogleSignIn />
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00346f] border-t-transparent mb-3"></div>
                <p className="text-xs font-medium">Cargando publicaciones...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center space-y-3">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[48px] text-slate-300">forum</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-800">¡Sé el primero en compartir!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">No hay publicaciones aún. Anímate a contar una anécdota de los peludos del campus.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Alert Posts Section */}
                {alertPosts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="bg-rose-100 h-7 w-7 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-rose-600">crisis_alert</span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-slate-900">Alertas de Mascotas</h3>
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">{alertPosts.length}</span>
                    </div>
                    {alertPosts.map((post) => (
                      <div key={post.id} className="bg-white rounded-2xl border-l-4 border-rose-500 border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 relative">
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-bl-xl">🚨 Alerta</div>
                        <div className="pl-5 pr-4 pt-4 pb-3 flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold font-display shadow-sm bg-rose-600 text-lg">🚨</div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800">{post.authorName}</p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">pets</span>
                                {post.authorRole}
                                <span className="text-slate-300">·</span>
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                {post.timeAgo}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 pb-3">
                          <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-100">
                            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                          </div>
                          {post.image && (
                            <div className="mt-3 rounded-xl overflow-hidden cursor-pointer border border-rose-100 shadow-sm group" onClick={() => setViewingImage(post.image!)}>
                              <div className="relative">
                                <img src={post.image} alt="Reporte" className="w-full max-h-48 object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">zoom_in</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mx-5 mb-2 px-4 py-2 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-rose-500 text-[16px]">favorite</span>
                            {post.likes} Me gusta
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-slate-400 text-[16px]">chat_bubble</span>
                            {post.comments.length} {post.comments.length === 1 ? 'Comentario' : 'Comentarios'}
                          </span>
                        </div>
                        <div className="px-5 pb-2 flex gap-1.5">
                          <button onClick={() => handleLike(post.id)} className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${likedPosts[post.id] ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200'}`}>
                            <span className="material-symbols-outlined text-[18px]">{likedPosts[post.id] ? 'favorite' : 'favorite_border'}</span>
                            {likedPosts[post.id] ? 'Te gusta' : 'Me gusta'}
                          </button>
                          <button onClick={() => handleShare(post.id)} className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200">
                            <span className="material-symbols-outlined text-[18px]">share</span>
                            Compartir
                          </button>
                        </div>
                        <div className="mx-5 mb-4 px-4 py-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-3">
                          {post.comments.length > 0 && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Comentarios</p>
                          )}
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                              {comment.authorAvatar ? (
                                <img src={comment.authorAvatar} alt="" className="h-7 w-7 rounded-full border border-slate-200 mt-0.5" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="bg-gradient-to-br from-rose-600 to-rose-500 text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shadow-xs">
                                  {comment.authorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </div>
                              )}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-bold text-slate-800 text-xs">{comment.authorName}</span>
                                  <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-2">{comment.timeAgo}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-1">
                            {user?.user_metadata?.avatar_url ? (
                              <img src={user.user_metadata.avatar_url} alt="" className="h-8 w-8 rounded-full border border-slate-200 mt-0.5 shadow-xs" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-600 to-rose-500 text-white text-[9px] font-bold flex items-center justify-center mt-0.5 shadow-xs">?</div>
                            )}
                            <div className="flex-grow flex gap-2">
                              <input type="text" value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Escribe un comentario..." disabled={!user} className="flex-grow text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-all" />
                              <button type="submit" disabled={!user} className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center disabled:opacity-40 transition-all">
                                <span className="material-symbols-outlined text-[16px]">send</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    ))}
                    {/* Separator */}
                    <div className="relative py-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Publicaciones de la comunidad</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Posts */}
                {regularPosts.length === 0 && alertPosts.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center space-y-3">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">forum</span>
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-800">¡Sé el primero en compartir!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">No hay publicaciones de la comunidad aún. Anímate a contar una anécdota de los peludos del campus.</p>
                  </div>
                ) : regularPosts.length > 0 ? (
                    regularPosts.map((post) => {
                  const isLiked = likedPosts[post.id];
                  const displayLikes = post.likes;
                  const isOwner = user && post.userId === user.id;
                  return (
                    <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 relative">
                      {/* Colored left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00346f] via-[#fc9d41] to-rose-400 rounded-l-2xl opacity-60" />

                      {/* Post Header */}
                      <div className="pl-5 pr-4 pt-4 pb-3 flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {post.userAvatar ? (
                            <img src={post.userAvatar} alt="" className="h-11 w-11 rounded-full border-2 border-slate-100 cursor-pointer hover:ring-2 hover:ring-[#00346f] transition-all shadow-sm" referrerPolicy="no-referrer" onClick={() => post.userId && onViewProfile?.(post.userId)} />
                          ) : (
                            <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold font-display shadow-sm ${post.avatarColor} cursor-pointer hover:ring-2 hover:ring-[#00346f] transition-all`} onClick={() => post.userId && onViewProfile?.(post.userId)}>{post.authorInitials}</div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-bold text-slate-800 cursor-pointer hover:text-[#00346f] transition-colors truncate" onClick={() => post.userId && onViewProfile?.(post.userId)}>{post.authorName}</p>
                              {post.isCampusFavorite && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shrink-0">⭐ Favorito</span>}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">school</span>
                              {post.authorRole}
                              <span className="text-slate-300">·</span>
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {post.timeAgo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {post.tag && <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-xs">{post.tag}</span>}
                          {isOwner && (
                            <div className="flex gap-0.5">
                              <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="text-slate-400 hover:text-[#00346f] p-1.5 rounded-lg hover:bg-[#eef4ff] transition-all" title="Editar">
                                <span className="material-symbols-outlined text-[17px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(post.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all" title="Eliminar">
                                <span className="material-symbols-outlined text-[17px]">delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-5 pb-3">
                        {editingPostId === post.id ? (
                          <div className="space-y-3">
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full text-sm p-3 rounded-2xl border border-[#00346f] focus:outline-none focus:ring-2 focus:ring-[#00346f]/10 bg-white resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => handleEditSubmit(post.id)} className="bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs">Guardar</button>
                              <button onClick={() => { setEditingPostId(null); setEditContent(''); }} className="border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100">
                            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                          </div>
                        )}
                        {post.image && !editingPostId && (
                          <div className="mt-3 rounded-xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm group" onClick={() => setViewingImage(post.image!)}>
                            <div className="relative">
                              <img src={post.image} alt="Publicación" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">zoom_in</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Post Stats */}
                      <div className="mx-5 mb-2 px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-rose-500 font-bold text-[16px]">favorite</span>
                          {displayLikes} {displayLikes === 1 ? 'Me gusta' : 'Me gusta'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-400 text-[16px]">chat_bubble</span>
                          {post.comments.length} {post.comments.length === 1 ? 'Comentario' : 'Comentarios'}
                        </span>
                      </div>

                      {/* Post Actions */}
                      <div className="px-5 pb-2 flex gap-1.5">
                        <button onClick={() => handleLike(post.id)} className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isLiked ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200'}`}>
                          <span className="material-symbols-outlined text-[18px]">{isLiked ? 'favorite' : 'favorite_border'}</span>
                          {isLiked ? 'Te gusta' : 'Me gusta'}
                        </button>
                        <button onClick={() => handleShare(post.id)} className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-600 hover:bg-[#eef4ff] hover:text-[#00346f] border border-transparent hover:border-[#dfe9fa]">
                          <span className="material-symbols-outlined text-[18px]">share</span>
                          Compartir
                        </button>
                        <div className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-slate-600 border border-transparent cursor-default">
                          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                          Comentar
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mx-5 mb-4 px-4 py-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-3">
                        {post.comments.length > 0 && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Comentarios</p>
                        )}
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                            {comment.authorAvatar ? (
                              <img src={comment.authorAvatar} alt="" className="h-7 w-7 rounded-full border border-slate-200 mt-0.5" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="bg-gradient-to-br from-[#00346f] to-[#0050aa] text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shadow-xs">
                                {comment.authorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-bold text-slate-800 text-xs">{comment.authorName}</span>
                                <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-2">{comment.timeAgo}</span>
                              </div>
                              <p className="text-slate-600 leading-relaxed text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-1">
                          {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="h-8 w-8 rounded-full border border-slate-200 mt-0.5 shadow-xs" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00346f] to-[#0050aa] text-white text-[9px] font-bold flex items-center justify-center mt-0.5 shadow-xs">?</div>
                          )}
                          <div className="flex-grow flex gap-2">
                            <input type="text" value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Escribe un comentario..." disabled={!user} className="flex-grow text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20 bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-all" />
                            <button type="submit" disabled={!user} className="bg-gradient-to-r from-[#00346f] to-[#0050aa] hover:from-[#002450] hover:to-[#00346f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center disabled:opacity-40 transition-all">
                              <span className="material-symbols-outlined text-[16px]">send</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  );
                })
            ) : null}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Community Tips */}
            <div className="bg-gradient-to-br from-[#eef4ff] to-white rounded-2xl border border-[#dfe9fa] p-5 space-y-4 shadow-sm">
              <h3 className="font-display font-bold text-sm text-[#00346f] flex items-center gap-2">
                <span className="bg-[#00346f] text-white h-6 w-6 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">campaign</span>
                </span>
                Normas de Convivencia
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">El bienestar animal es responsabilidad de todos en la UNDC:</p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex gap-2.5">
                  <span className="bg-emerald-100 text-emerald-600 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                  <span><strong className="text-slate-800">Respeta su descanso:</strong> No los molestes mientras duermen en pasillos y jardines.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-emerald-100 text-emerald-600 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                  <span><strong className="text-slate-800">No comida chatarra:</strong> Consulta con el voluntariado qué pueden comer.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-emerald-100 text-emerald-600 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                  <span><strong className="text-slate-800">Reporta heridas:</strong> Si ves un animal lastimado, avisa inmediatamente.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-emerald-100 text-emerald-600 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                  <span><strong className="text-slate-800">Comparte con respeto:</strong> Fotos y videos sin flash ni ruidos fuertes.</span>
                </li>
              </ul>
            </div>

            {/* Volunteer CTA */}
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm text-center space-y-4">
              <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px] text-amber-600">volunteer_activism</span>
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900">¿Quieres ser Voluntario?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coordinamos paseos, baños, jornadas de vacunación y alimentación para los peludos del campus. ¡Tu ayuda es bienvenida!
              </p>
              <a href="https://chat.whatsapp.com/CGE6Aw6FJP01wCHElUuSv0" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd57] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Unirse al Grupo WhatsApp
              </a>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">lightbulb</span>
                Tips rápidos para publicar
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li className="flex gap-2">
                  <span className="text-[#00346f] font-bold">📸</span>
                  Sube fotos claras de los animalitos
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00346f] font-bold">📍</span>
                  Menciona la ubicación en el campus
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00346f] font-bold">❤️</span>
                  Usa un tono positivo y respetuoso
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00346f] font-bold">🏷️</span>
                  Etiqueta a tus compañeros voluntarios
                </li>
              </ul>
            </div>

            {/* Collapsible Report Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setReportExpanded(!reportExpanded)}
                className="w-full p-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-rose-600">crisis_alert</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-900">Reportar Mascota</h4>
                    <p className="text-[10px] text-slate-400">¿Viste un animal perdido o herido?</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${reportExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {reportExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-fade-in">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2 mb-4">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">info</span>
                    <span>Tu reporte creará una publicación en el Muro y registrará la mascota en el sistema.</span>
                  </div>
                  <form onSubmit={(e) => {
                    handleReportMascotSubmit(e);
                    setReportExpanded(false);
                  }} className="space-y-3">
                    <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Nombre temporal *" required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50" />
                    <input type="text" value={reportLocation} onChange={(e) => setReportLocation(e.target.value)} placeholder="Ubicación en el campus *" required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={reportSpecies} onChange={(e) => setReportSpecies(e.target.value as 'dog' | 'cat')} className="text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                        <option value="dog">🐕 Perro</option>
                        <option value="cat">🐈 Gato</option>
                      </select>
                      <select value={reportGender} onChange={(e) => setReportGender(e.target.value as 'male' | 'female' | 'group')} className="text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                        <option value="male">♂️ Macho</option>
                        <option value="female">♀️ Hembra</option>
                        <option value="group">👥 Grupo</option>
                      </select>
                    </div>
                    <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                      <option value="Avistado recientemente">👀 Avistado recientemente</option>
                      <option value="Abandonado recientemente">🏠 Abandonado (Buscando hogar)</option>
                      <option value="Herido / Necesita veterinario">🚑 Herido - Necesita asistencia</option>
                      <option value="Desnutrido">🍽️ Desnutrido - Requiere alimento</option>
                    </select>
                    <textarea rows={2} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe a la mascota (color, tamaño, señas) *" required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50 resize-none"></textarea>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-rose-600 hover:bg-rose-50 cursor-pointer transition-all text-xs font-bold text-slate-600 hover:text-rose-600">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      Subir Foto
                      <input type="file" accept="image/*" onChange={(e) => handleReportImageSelect(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">add_moderator</span>
                      Registrar Alerta
                    </button>
                  </form>
                </div>
              )}
            </div>

        </div>
      </div>
    </div>
  );
}

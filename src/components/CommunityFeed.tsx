import React, { useState, useEffect, useCallback } from 'react';
import { Post, Pet } from '../types';

interface CommunityFeedProps {
  onAddPetToDirectory: (newPet: Pet) => void;
  onShowNotification: (msg: string) => void;
}

const REPORT_IMAGE_PRESETS = [
  { name: 'Perrito Marrón', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2i2W1arQBFTwpEeUo0z4Dsb9h2e3PZMoE10SykRF5jCSUMjzr9r5Z7vtTfMfBENsDKk-0E3UPEeGkzpomvlPGpEL__jT1_YKU7HxFrM8dSbEn1o7Sq4gJUK5hW6zd4IYxkbDLEhLPsK6sFPQK9uGUt9dcAoTHilOZfIhqhwI_ZN_3yHi2EJvdkpwcuZ8CfNFeJnBxUBOK_mzf5dw_ZSg4dezHECvS1WkyQHJPjCXIJ95iPH7CvUqMzzW21HbTYFjl0gyZx53Igw' },
  { name: 'Perrito Cachorro', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIecH4RFZorUrY6K0rGPLEr9Eu0MPEkQ9vbGpv_JhK-QGSmzXE4ipyIp8kYukyUxD_Gkjh8DZ-0-2255XSUHGBjykumWXe7PvIn1ZZIMM8DeK0zaD2WPdstAH6Xe6Pd6WfmcfM0_st5TC_PH4ge7a7Finkg6f1OtbWlRkjJ-oTd0EWsnJTC6bnnnGECB6Ima4SBAmVrYpopyICPBjQmVTi2_UI0erfqYPAW5ebN3aJc2DVBaC33IN0hFfsOJ1hSx5wPRcsAu7Qg' },
  { name: 'Gatito Dormilón', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbwdruzdtZ9fnaKR24BcWSxkVKaBQPC232e6PnZb_zMNpwzXf-OThLK19KFhFc2Q4ivnXSf_cGU13d-wVQun9d_tfe67_jen2N0YNIYJvJiPImqMl1DZqmtooD2xoaaPYa4nXlZCq72eMdJGW2SlD1_K7vb_R4JHfhUGW-jKnkwVW4tuY9kw8itTrzy74ejfI2LkhxISTt_bRCQoQIYJTyaJI7MGK4qxReSDxysHpVgVPUK2_5X9hVAraxQHD8SIR4RlylaE9b6A' },
  { name: 'Gatito Pequeño', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5hU-Itt0ePmS68Rlw3j_hiG6UceKzWLfxKGnpSx1ZRO9cl3Uh97bYjERjO5AOP4eUHcqfqXMS1za5zgrh9toAOMtBsf6mzchv5ylEaxBaJ5VSblu_b3BU2mT7qTxls6kT6mOHg81kBL6wRyBcWKG-UGiJns_DgTD8bH8mIpOTTQ9f9LogYXF39ky-Zn4m9VWACp9NAL7xtqrl8vreo2uYgoiYyJdCqAttFw5Z11BT4iathr8jZ3Od0v6MQWjSra7A74RDb2jldQ' }
];

const API_BASE = '/api';

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`);
  if (!res.ok) return [];
  return res.json();
}

async function createPost(post: Post): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Error del servidor: ' + res.status);
  return res.json();
}

async function updatePost(postId: string, updates: Partial<Post>): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export default function CommunityFeed({ onAddPetToDirectory, onShowNotification }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<' muro' | 'reporte'>(' muro');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthorName, setNewPostAuthorName] = useState('Anónimo (Estudiante)');
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

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts[postId];
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newLikes = post.likes + (isLiked ? -1 : 1);
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    try {
      const updated = await updatePost(postId, { likes: newLikes });
      setPosts(updated);
    } catch {
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    }
    onShowNotification(isLiked ? 'Quitaste tu Me gusta' : '¡Le diste Me gusta!');
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: 'Estudiante UNDC',
      content: commentText.trim(),
      timeAgo: 'Ahora',
    };
    const updatedComments = [...post.comments, newComment];
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    try {
      const updated = await updatePost(postId, { comments: updatedComments, commentsCount: updatedComments.length });
      setPosts(updated);
      onShowNotification('¡Comentario publicado!');
    } catch {
      onShowNotification('Error al publicar comentario');
    }
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
    const initials = newPostAuthorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ES';
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorName: newPostAuthorName || 'Anónimo (Estudiante)',
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
      const updated = await createPost(newPost);
      setPosts(updated);
      setNewPostContent('');
      setNewPostImage('');
      setNewPostFile(null);
      onShowNotification('¡Publicación compartida!');
    } catch (e) {
      console.error('Error al publicar:', e);
      onShowNotification('Error al publicar: ' + (e instanceof Error ? e.message : 'desconocido'));
    }
  };

  const handleReportMascotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      reportedBy: reporterEmail || 'Anónimo',
    };
    onAddPetToDirectory(newPet);
    const newPost: Post = {
      id: `post_report_${Date.now()}`,
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
      const updated = await createPost(newPost);
      setPosts(updated);
    } catch {}
    setReportName('');
    setReportAge('');
    setReportLocation('');
    setReportDescription('');
    setReportStory('');
    setReporterEmail('');
    setActiveSubTab(' muro');
    onShowNotification(`¡Reporte de ${reportName} registrado!`);
  };

  return (
    <div id="community-feed-container" className="space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xs max-w-md mx-auto">
        <button
          onClick={() => setActiveSubTab(' muro')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeSubTab === ' muro' ? 'bg-[#00346f] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          <span className="material-symbols-outlined text-[16px]">forum</span>
          Muro de la Comunidad
        </button>
        <button
          onClick={() => setActiveSubTab('reporte')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'reporte' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-600 hover:bg-rose-50'}`}
        >
          <span className="material-symbols-outlined text-[16px] text-rose-500 font-bold">report</span>
          Reportar Mascota (Alerta)
        </button>
      </div>

      {activeSubTab === ' muro' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
              <div className="flex gap-3 mb-4">
                <div className="bg-[#00346f] text-white font-bold h-10 w-10 rounded-full flex items-center justify-center">C</div>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-slate-800">¿Qué está pasando con los amigos peludos hoy?</p>
                  <p className="text-[11px] text-slate-400">Comparte fotos, anécdotas o actualizaciones del campus</p>
                </div>
              </div>
              <form onSubmit={handleCreatePostSubmit} className="space-y-3">
                <textarea rows={3} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Bobby está durmiendo plácidamente en el patio..." required className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f] bg-slate-50 resize-none"></textarea>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tu Nombre/Facultad</label>
                    <input type="text" value={newPostAuthorName} onChange={(e) => setNewPostAuthorName(e.target.value)} placeholder="Ej. María López (Sistemas)" className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00346f] bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subir Foto (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00346f] bg-slate-50 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#00346f] file:text-white hover:file:bg-[#002450"
                    />
                    {uploadingImage && <span className="text-[10px] text-slate-400 mt-1 block">Procesando imagen...</span>}
                    {newPostImage && !uploadingImage && (
                      <div className="mt-1 flex items-center gap-2">
                        <img src={newPostImage} alt="Preview" className="h-8 w-8 rounded object-cover border" />
                        <button type="button" onClick={() => { setNewPostFile(null); setNewPostImage(''); }} className="text-[10px] text-rose-600 font-bold">Quitar</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    Publicar
                  </button>
                </div>
              </form>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Cargando publicaciones...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No hay publicaciones aún. ¡Sé el primero en compartir!</div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const isLiked = likedPosts[post.id];
                  const displayLikes = post.likes + (isLiked ? 1 : 0);
                  return (
                    <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                      <div className="p-4 flex justify-between items-center border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold font-display ${post.avatarColor}`}>{post.authorInitials}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {post.authorName}
                              {post.isCampusFavorite && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐ Favorito del Campus</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">{post.authorRole} • {post.timeAgo}</p>
                          </div>
                        </div>
                        {post.tag && <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">{post.tag}</span>}
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">{post.content}</p>
                        {post.image && (
                          <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                            <img src={post.image} alt="Publicación" className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2 bg-slate-50/50 border-y border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-rose-500 font-bold text-[14px]">favorite</span>{displayLikes} Me gusta</span>
                        <span>{post.comments.length} Comentarios</span>
                      </div>
                      <div className="px-4 py-1.5 border-b border-slate-50 flex gap-4">
                        <button onClick={() => handleLike(post.id)} className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${isLiked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span className="material-symbols-outlined text-[16px] font-bold">{isLiked ? 'favorite' : 'favorite'}</span>
                          {isLiked ? 'Te gusta' : 'Me gusta'}
                        </button>
                        <div className="flex-1 text-center py-1 text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">chat_bubble</span>Comentar
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50/40 space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="text-xs flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                            <div className="bg-[#00346f]/10 text-primary h-6 w-6 rounded-full flex items-center justify-center font-bold text-[9px]">
                              {comment.authorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-bold text-slate-800 text-[10px]">{comment.authorName}</span>
                                <span className="text-[9px] text-slate-400 font-medium">{comment.timeAgo}</span>
                              </div>
                              <p className="text-slate-600 leading-relaxed text-[11px]">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-2">
                          <input type="text" value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Escribe un comentario..." className="flex-grow text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] bg-white" />
                          <button type="submit" className="bg-[#00346f] hover:bg-[#002450] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#00346f]/5 rounded-2xl border border-[#00346f]/10 p-5 space-y-4">
              <h3 className="font-display font-bold text-md text-[#00346f] flex items-center gap-2"><span className="material-symbols-outlined">campaign</span>Normas de Convivencia</h3>
              <p className="text-xs text-slate-600 leading-relaxed">El bienestar animal es responsabilidad de todos en la UNDC. Sigue estas recomendaciones:</p>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex gap-2"><span className="material-symbols-outlined text-green-600 text-[16px] font-bold">check_circle</span><span>Respeta sus horas de sueño y descanso en los pasillos.</span></li>
                <li className="flex gap-2"><span className="material-symbols-outlined text-green-600 text-[16px] font-bold">check_circle</span><span>No les des comida chatarra; consulta con el voluntariado.</span></li>
                <li className="flex gap-2"><span className="material-symbols-outlined text-green-600 text-[16px] font-bold">check_circle</span><span>Si ves una herida, repórtalo de inmediato.</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs text-center space-y-3">
              <span className="material-symbols-outlined text-[36px] text-[#00346f]">volunteer_activism</span>
              <h4 className="font-display font-bold text-sm text-slate-900">¿Quieres ser Voluntario?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Coordinamos paseos, baños, jornadas de vacunación y alimentación.</p>
              <a href="https://wa.me/51987654321" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1ebd57] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all">
                <span className="material-symbols-outlined text-[15px] font-bold">chat</span>Escribir al WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <span className="material-symbols-outlined text-[48px] text-rose-600 animate-pulse">crisis_alert</span>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Reportar Mascota (Alerta Campus)</h2>
            <p className="text-xs text-slate-500">¿Viste una mascota perdida o herida? Regístrala para que la comunidad pueda ayudarla.</p>
          </div>
          <form onSubmit={handleReportMascotSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre temporal *</label>
                <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Ej. Blanquita, Orejas" required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación *</label>
                <input type="text" value={reportLocation} onChange={(e) => setReportLocation(e.target.value)} placeholder="Ej. Detrás del laboratorio" required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Especie</label>
                <select value={reportSpecies} onChange={(e) => setReportSpecies(e.target.value as 'dog' | 'cat')} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Género</label>
                <select value={reportGender} onChange={(e) => setReportGender(e.target.value as 'male' | 'female' | 'group')} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                  <option value="group">Grupo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Edad</label>
                <input type="text" value={reportAge} onChange={(e) => setReportAge(e.target.value)} placeholder="Ej. Cachorro" className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
              <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50">
                <option value="Avistado recientemente">Avistado recientemente</option>
                <option value="Abandonado recientemente">Abandonado (Buscando hogar)</option>
                <option value="Herido / Necesita veterinario">Herido - Necesita asistencia</option>
                <option value="Desnutrido">Desnutrido - Requiere alimento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descripción *</label>
              <textarea rows={2} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Pelaje negro, collar rojo, tímido..." required className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Historia (Opcional)</label>
              <textarea rows={3} value={reportStory} onChange={(e) => setReportStory(e.target.value)} placeholder="Más detalles para ayudar..." className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Foto Representativa</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {REPORT_IMAGE_PRESETS.map((p, idx) => (
                  <div key={idx} onClick={() => setReportImage(p.url)} className={`relative cursor-pointer rounded-xl overflow-hidden aspect-video border-2 transition-all ${reportImage === p.url ? 'border-rose-600 scale-[1.02] shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'}`}>
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-1.5"><span className="text-[9px] text-white font-bold truncate">{p.name}</span></div>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); let w = img.width, h = img.height, max = 1200; if (w > max || h > max) { if (w > h) { h = h * max / w; w = max; } else { w = w * max / h; h = max; } } c.width = w; c.height = h; c.getContext('2d')!.drawImage(img, 0, 0, w, h); setReportImage(c.toDataURL('image/jpeg', 0.7)); }; img.src = ev.target?.result as string; }; r.readAsDataURL(f); }} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-slate-50 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700" />
              {reportImage && reportImage.startsWith('data:') && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={reportImage} alt="Preview" className="h-10 w-10 rounded object-cover border" />
                  <button type="button" onClick={() => setReportImage(REPORT_IMAGE_PRESETS[0].url)} className="text-[10px] text-rose-600 font-bold">Usar imagen por defecto</button>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tu Correo (Opcional)</label>
              <input type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} placeholder="alu.estudiante@undc.edu.pe" className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-4">
              <span className="material-symbols-outlined font-bold">add_moderator</span>
              Registrar Alerta y Publicar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

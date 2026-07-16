import React, { useState } from 'react';
import { BlogPost, BlogCategory } from '../types';

const CATEGORIES: { key: BlogCategory | 'todas'; label: string; icon: string; color: string }[] = [
  { key: 'todas', label: 'Todas', icon: 'article', color: 'bg-slate-600' },
  { key: 'cuidado', label: 'Cuidado', icon: 'spa', color: 'bg-emerald-600' },
  { key: 'salud', label: 'Salud', icon: 'local_hospital', color: 'bg-rose-600' },
  { key: 'alimentacion', label: 'Alimentación', icon: 'restaurant', color: 'bg-amber-600' },
  { key: 'consejos', label: 'Consejos', icon: 'lightbulb', color: 'bg-blue-600' },
  { key: 'historias', label: 'Historias', icon: 'favorite', color: 'bg-purple-600' },
  { key: 'adopcion', label: 'Adopción', icon: 'pets', color: 'bg-cyan-600' },
];

const CATEGORY_EMOJI: Record<BlogCategory, string> = {
  cuidado: '🛁',
  salud: '💉',
  alimentacion: '🍽️',
  consejos: '💡',
  historias: '📖',
  adopcion: '🐾',
};

function getCategoryColor(cat: BlogCategory): string {
  const map: Record<BlogCategory, string> = {
    cuidado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    salud: 'bg-rose-50 text-rose-700 border-rose-200',
    alimentacion: 'bg-amber-50 text-amber-700 border-amber-200',
    consejos: 'bg-blue-50 text-blue-700 border-blue-200',
    historias: 'bg-purple-50 text-purple-700 border-purple-200',
    adopcion: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  return map[cat] || 'bg-slate-50 text-slate-700 border-slate-200';
}

function getCategoryLabel(cat: BlogCategory): string {
  const map: Record<BlogCategory, string> = {
    cuidado: 'Cuidado', salud: 'Salud', alimentacion: 'Alimentación',
    consejos: 'Consejos', historias: 'Historias', adopcion: 'Adopción',
  };
  return map[cat] || cat;
}

interface PetBlogProps {
  posts: BlogPost[];
  compact?: boolean;
}

export default function PetBlog({ posts, compact }: PetBlogProps) {
  const [filter, setFilter] = useState<BlogCategory | 'todas'>('todas');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filtered = filter === 'todas' ? posts : posts.filter(p => p.category === filter);
  const displayPosts = compact ? posts.filter(p => p.featured).slice(0, 3) : filtered;

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        <span className="material-symbols-outlined text-[48px] block mb-3 text-slate-300">article</span>
        <p className="font-bold text-sm text-slate-500">No hay artículos en esta categoría</p>
        <p className="text-slate-400 mt-1">Explora otras categorías o vuelve más tarde</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {compact ? (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">newspaper</span>
            Consejos y Noticias
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Cuidado animal UNDC</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-[#00346f] to-[#0050aa] text-white h-10 w-10 rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">newspaper</span>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">Blog y Noticias</h2>
              <p className="text-xs text-slate-400">Consejos, historias y novedades sobre las mascotas del campus</p>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  filter === cat.key
                    ? 'bg-[#00346f] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={`grid ${compact ? 'grid-cols-1 md:grid-cols-3 gap-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {displayPosts.map(post => (
          <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            {selectedPost.image && (
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-3xl bg-slate-100">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/30 ${getCategoryColor(selectedPost.category)}`}>
                    {CATEGORY_EMOJI[selectedPost.category]} {getCategoryLabel(selectedPost.category)}
                  </span>
                </div>
              </div>
            )}
            <div className={`p-6 md:p-8 space-y-5 ${!selectedPost.image ? 'pt-8' : ''}`}>
              {!selectedPost.image && (
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(selectedPost.category)}`}>
                    {CATEGORY_EMOJI[selectedPost.category]} {getCategoryLabel(selectedPost.category)}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="font-display font-extrabold text-xl md:text-2xl text-slate-900 leading-tight">{selectedPost.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    {selectedPost.author}
                    <span className="text-slate-300">·</span>
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {new Date(selectedPost.publishedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setSelectedPost(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-2 shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-[18px] block">close</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-5 text-sm text-slate-700 leading-[1.8] space-y-4 whitespace-pre-line">
                {selectedPost.content}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group w-full">
      {post.image ? (
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30 ${getCategoryColor(post.category)}`}>
              {CATEGORY_EMOJI[post.category]} {getCategoryLabel(post.category)}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-[#eef4ff] to-[#dfe9fa] flex items-center justify-center relative">
          <span className="material-symbols-outlined text-[48px] text-primary/30">article</span>
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}>
              {CATEGORY_EMOJI[post.category]} {getCategoryLabel(post.category)}
            </span>
          </div>
        </div>
      )}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">{new Date(post.publishedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
          <span className="material-symbols-outlined text-slate-300 text-[16px] group-hover:text-primary transition-colors">arrow_forward</span>
        </div>
        <h4 className="font-display font-bold text-sm text-slate-900 leading-snug group-hover:text-[#00346f] transition-colors line-clamp-2">{post.title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold pt-1">
          <span>Leer artículo</span>
          <span className="material-symbols-outlined text-[12px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>
    </button>
  );
}

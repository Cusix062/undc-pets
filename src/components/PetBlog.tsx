import React, { useState } from 'react';
import { BlogPost, BlogCategory } from '../types';

const CATEGORIES: { key: BlogCategory | 'todas'; label: string; icon: string }[] = [
  { key: 'todas', label: 'Todas', icon: 'article' },
  { key: 'cuidado', label: 'Cuidado', icon: 'spa' },
  { key: 'salud', label: 'Salud', icon: 'local_hospital' },
  { key: 'alimentacion', label: 'Alimentación', icon: 'restaurant' },
  { key: 'consejos', label: 'Consejos', icon: 'lightbulb' },
  { key: 'historias', label: 'Historias', icon: 'favorite' },
  { key: 'adopcion', label: 'Adopción', icon: 'pets' },
];

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
      <div className="text-center py-8 text-slate-400 text-xs">
        <span className="material-symbols-outlined text-[32px] block mb-2">article</span>
        No hay artículos en esta categoría
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {compact ? (
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">newspaper</span>
            Consejos y Noticias
          </h3>
          <span className="text-[10px] text-slate-400">Cuidado animal UNDC</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#00346f] text-white h-8 w-8 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">newspaper</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Blog y Noticias</h2>
              <p className="text-[10px] text-slate-400">Consejos, historias y novedades sobre las mascotas del campus</p>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  filter === cat.key
                    ? 'bg-[#00346f] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={`grid ${compact ? 'grid-cols-1 md:grid-cols-3 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-5'}`}>
        {displayPosts.map(post => (
          <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-4 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(selectedPost.category)}`}>
                  {getCategoryLabel(selectedPost.category)}
                </span>
                <h3 className="font-display font-extrabold text-lg md:text-xl text-slate-900 leading-tight">{selectedPost.title}</h3>
                <p className="text-[11px] text-slate-400">
                  Por {selectedPost.author} · {new Date(selectedPost.publishedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedPost(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 shrink-0">
                <span className="material-symbols-outlined text-[18px] block">close</span>
              </button>
            </div>
            <div className="border-t border-slate-100 pt-4 text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
              {selectedPost.content}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 text-left space-y-2.5 hover:shadow-md hover:border-slate-200 transition-all group text-start w-full">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(post.category)}`}>
          {getCategoryLabel(post.category)}
        </span>
        <span className="text-[10px] text-slate-400">{new Date(post.publishedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
      </div>
      <h4 className="font-display font-bold text-sm text-slate-900 leading-snug group-hover:text-[#00346f] transition-colors">{post.title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
      <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold">
        <span>Leer artículo</span>
        <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
      </div>
    </button>
  );
}

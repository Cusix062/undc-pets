import React, { useState, useMemo, useEffect } from 'react';
import { Pet, Post } from '../types';
import { GALLERY_IMAGES } from '../gallery';
import { supabase } from '../lib/supabase';

interface AlbumItem {
  id: string;
  name: string;
  image: string;
  source: 'pet' | 'post' | 'gallery';
}

interface PhotoAlbumProps {
  pets: Pet[];
}

export default function PhotoAlbum({ pets }: PhotoAlbumProps) {
  const [selectedItem, setSelectedItem] = useState<AlbumItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pets' | 'posts' | 'gallery'>('all');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data.map((r: any) => r.data as Post));
    }).catch(() => {});
  }, []);

  const items = useMemo<AlbumItem[]>(() => {
    const petItems: AlbumItem[] = pets.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      source: 'pet' as const,
    }));
    const postItems: AlbumItem[] = posts
      .filter(p => p.image)
      .map(p => ({
        id: p.id,
        name: p.authorName,
        image: p.image!,
        source: 'post' as const,
      }));
    const galleryItems: AlbumItem[] = GALLERY_IMAGES.map((img, i) => ({
      id: `gallery_${i}`,
      name: img.name,
      image: img.url,
      source: 'gallery' as const,
    }));
    return [...petItems, ...postItems, ...galleryItems];
  }, [pets, posts]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => i.source === filter);
  }, [filter, items]);

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xs max-w-md mx-auto">
        {(['all', 'pets', 'posts', 'gallery'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? 'bg-[#00346f] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pets' ? 'Mascotas' : f === 'posts' ? 'Comunidad' : 'Galería'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">No hay imágenes para mostrar en esta categoría.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-xs cursor-pointer bg-slate-100 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-white/80 capitalize">{item.source === 'pet' ? 'Mascota' : item.source === 'post' ? 'Comunidad' : 'Galería'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 flex items-center justify-center transition-all">
              <span className="material-symbols-outlined font-bold text-[18px]">close</span>
            </button>
            <img src={selectedItem.image} alt={selectedItem.name} className="w-full max-h-[70vh] object-contain bg-slate-100" referrerPolicy="no-referrer" />
            <div className="p-4">
              <p className="text-sm font-bold text-slate-800">{selectedItem.name}</p>
              <p className="text-xs text-slate-500 capitalize">{selectedItem.source === 'pet' ? 'Mascota del Campus' : selectedItem.source === 'post' ? 'Publicación de la Comunidad' : 'Galería'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

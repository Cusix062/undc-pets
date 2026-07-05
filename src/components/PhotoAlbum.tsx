import React, { useState, useMemo, useEffect } from 'react';
import { Pet, Post } from '../types';
import { GALLERY_IMAGES } from '../gallery';

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
    fetch('/api/posts').then(r => r.ok && r.json()).then(d => setPosts(d || [])).catch(() => {});
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
    const galleryItems: AlbumItem[] = GALLERY_IMAGES.map(g => ({
      id: g.id,
      name: g.name,
      image: g.image,
      source: 'gallery' as const,
    }));
    return [...petItems, ...postItems, ...galleryItems];
  }, [pets, posts]);

  const filtered = filter === 'all' ? items : items.filter(i => i.source === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">photo_library</span>
          Álbum de Fotos
        </h3>
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          {(['all', 'pets', 'posts', 'gallery'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                filter === f ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'pets' ? 'Mascotas' : f === 'posts' ? 'Comunidad' : 'Galería'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
            style={{ aspectRatio: idx % 3 === 0 ? '3/4' : '1/1' }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="font-display font-bold text-sm truncate">{item.name}</p>
              <p className="text-[10px] text-white/80">{item.source === 'pet' ? 'Mascota' : item.source === 'post' ? 'Comunidad' : 'Galería'}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl bg-black"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 rounded-b-2xl">
              <p className="font-display font-bold text-xl text-white">{selectedItem.name}</p>
              <p className="text-xs text-white/60">{selectedItem.source === 'pet' ? 'Mascota del Campus' : selectedItem.source === 'post' ? 'Publicación de la Comunidad' : 'Galería de Fotos'}</p>
            </div>

            {filtered.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const idx = filtered.findIndex(i => i.id === selectedItem.id);
                    setSelectedItem(filtered[(idx - 1 + filtered.length) % filtered.length]);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-[22px] font-bold">chevron_left</span>
                </button>
                <button
                  onClick={() => {
                    const idx = filtered.findIndex(i => i.id === selectedItem.id);
                    setSelectedItem(filtered[(idx + 1) % filtered.length]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-[22px] font-bold">chevron_right</span>
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

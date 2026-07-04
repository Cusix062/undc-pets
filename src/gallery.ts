export interface GalleryImage {
  id: string;
  name: string;
  image: string;
}

// Agrega aquí tus imágenes. Solo pon el nombre y la ruta.
// Las imágenes van en la carpeta public/images/
export const GALLERY_IMAGES: GalleryImage[] = [
  // Ejemplo:
  { id: 'img1', RunRun: 'RunRun en el patio de administracion', image: '/images/runrun3.jpeg' },
  { id: 'img1', Curly: 'Curly en el veterinario', image: '/images/curly3.jpeg' },
  { id: 'img1', Princesa: 'Princesa en los campos de agronomia', image: '/images/princesa2.jpeg' },
  { id: 'img1', Curly: 'Curly en el veterinario', image: '/images/curly2.jpeg' },
  { id: 'img1', RunRun: 'Curly en el veterinario', image: '/images/runrun2.jpeg' },

  // { id: 'img2', name: 'Luna durmiendo', image: '/images/luna-sueno.jpg' },
];

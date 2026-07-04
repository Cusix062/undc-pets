/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pet, Post } from './types';

export const INITIAL_PETS: Pet[] = [
  {
    id: 'Curly',
    name: 'Curly',
    species: 'dog',
    gender: 'male',
    age: '2 Años',
    status: 'Buscando hogar',
    statusType: 'warning',
    tags: ['Juguetón', 'Vacunado', 'Social'],
    description: 'Curly es el guardián de la Universidad Nacional de Cañete , Sede en San Luis. Es muy juguetón y le encantan correr libremente por todo el campo.',
    story: 'Curly llegó al campus hace medio año, buscando a su familia. Fue rescatado por los estudiantes , quienes costearon su veterinario. Ahora, esta muy feliz con sus nuevos amiguitos, vive feliz custodiando los pabellones.',
    image: '/images/curly.jpeg',
    location: 'Sede San Luis'
  },
  {
    id: 'Princesa',
    name: 'Princesa',
    species: 'dog',
    gender: 'female',
    age: '1 Año',
    status: 'Sano',
    statusType: 'success',
    tags: ['Tranquila', 'Esterilizada', 'Sociable'],
    description: 'Princesa prefiere la tranquilidad de la biblioteca. Es la compañía perfecta para estudiar.',
    story: 'Princesa es una perrita llego hace menos de un año a la universidad a darnos muchas alegrias. Pasa sus tardes descansando en la biblioteca o en las aulas de la facultad de agronomia, brindando una presencia relajante a todos los que se preparan para sus exámenes.',
    image: '/images/princesa.jpeg',
    location: 'Multiusos'
  },
  {
    id: 'RunRun',
    name: 'RunRun',
    species: 'dog',
    gender: 'male',
    age: '3 Años',
    status: 'En tratamiento',
    statusType: 'error',
    tags: ['Leal', 'Paciente', 'Cariñoso'],
    description: 'RunRun necesita ayuda para su tratamiento de cadera. Cualquier donación es bienvenida.',
    story: 'RunRun es un perrito muy querido en el pabellón de Administración. Lamentablemente, tiene dificultades para caminar debido a su que solo tiene 3 patitas. Se encuentra bajo tratamiento médico con antiinflamatorios y sesiones de terapia gracias al apoyo del voluntariado y donaciones externas.',
    image: '/images/runrun.jpeg',
    location: 'Pabellón de Administración'
  },
  {
    id: 'Gata Ingeniera',
    name: 'Gata Ingeniera',
    species: 'cat',
    gender: 'female',
    age: '6 meses',
    status: 'Alegre',
    statusType: 'warning',
    tags: ['Juguetona', 'Energética', 'Curiosa'],
    description: 'Es una gatita llena de energía y amor.',
    story: 'Gata Ingeniera fue hallada a las afueras de la facultad. Inmediatamente el personal administrativo la acogió. Es sumamente juguetona y ágil. Se pasa el día en las aulas de la facultad , compartiendo con los estudiantes, radiando alegria y felicidad.',
    image: '/images/gata.jpeg',
    location: 'Facultad de Ingenieria'
  },

];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    authorName: 'María López',
    authorRole: 'Estudiante de Agronomía',
    authorInitials: 'ML',
    avatarColor: 'bg-primary',
    content: 'Les presento a "RunRun ", el guardián de la facultad. Siempre nos espera para recibir sus caricias antes de clases.',
    image: '/images/runrun1.jpeg',
    likes: 124,
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        authorName: 'Juan Carlos',
        content: '¡Es hermosísimo! Siempre me lo cruzo cerca de los laboratorios.',
        timeAgo: 'Hace 1 hora'
      },
      {
        id: 'c2',
        authorName: 'Sofía Ramos',
        content: '¡Le encantan las galletitas de avena! 🐾',
        timeAgo: 'Hace 30 minutos'
      }
    ],
    timeAgo: 'Hace 2 horas',
    isCampusFavorite: true
  },
  {
    id: 'post2',
    authorName: 'Juan Carlos',
    authorRole: 'Facultad de Sistemas',
    authorInitials: 'JC',
    avatarColor: 'bg-emerald-600',
    content: 'Michi ayudándome con el código de hoy. ¡Es el mejor depurador!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACTShdL6dv-0984o8DFk1X6eTVKFGGXGp6laS7iKObiM96KxmGOgj28vtSy0RlG6S_u71wU9xGl5X89P82nzpQ9bTuVMUk2aDZeIgdQT1Q6LgRjWpG79bDZD_uPlXbpL8A88PhYhPVDoQlbzIhwXPGd33jcfZYVt8xo8MWjT3-CRxnwTieMvHqcSR_xMNui7tOecib27XRWHUOxCndmpmGg77joJyvU0hXjCubod9zta5IPKsyrjf-3x40wmuGOVb9pTooMTFmdw',
    likes: 86,
    commentsCount: 1,
    comments: [
      {
        id: 'c3',
        authorName: 'Diego Torres',
        content: 'Ese gato sabe más de TypeScript que yo jaja.',
        timeAgo: 'Hace 4 horas'
      }
    ],
    timeAgo: 'Hace 5 horas'
  },
  {
    id: 'post3',
    authorName: 'Voluntariado Ambiental',
    authorRole: 'Cuenta Oficial',
    authorInitials: 'VA',
    avatarColor: 'bg-amber-600',
    content: 'Pincesa en el campo de agronomia <3.',
    image: '/images/princesa1.jpeg',
    likes: 245,
    commentsCount: 1,
    comments: [
      {
        id: 'c4',
        authorName: 'Dra. Elena Prado',
        content: 'Felicitaciones a los voluntarios de la UNDC por este gran esfuerzo por la salud de los animales.',
        timeAgo: 'Ayer'
      }
    ],
    timeAgo: 'Ayer'
  },
  {
    id: 'post4',
    authorName: 'Sofía Ramos',
    authorRole: 'Derecho',
    authorInitials: 'SR',
    avatarColor: 'bg-purple-600',
    content: 'Curly en su visia al veterinario.',
    image: '/images/curly1.jpeg',
    likes: 52,
    commentsCount: 0,
    comments: [],
    timeAgo: 'Hace 1 día'
  },
  {
    id: 'post5',
    authorName: 'Pablo Alva',
    authorRole: 'Administración',
    authorInitials: 'PA',
    avatarColor: 'bg-indigo-600',
    content: 'Encontré a estos pequeños cerca del jardín botánico. Ya fueron revisados por el vete y están buscando hogar.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5nzcKbkg23wYsOHB-yHY8cHOC0Bqj6RdUSVPlHdPgisJ-XGBhU_gWVDIl3Gyl92LjihqCTHJYg9Sc6o_JNcAunagqTY_INDLgqGr8aX-L5fGvLOMxjMc2KD3LOEE2q4CTV75dmUGX6kaFLO2oqIISLmHpW19mjTdqleQn2Lod9bodjWW8KEQgruPWZ4i2u1iYAuQlUq_f96GMWxQWgayryWumUiNAZVEqvRbx4zq0y7X8DaNNhf5Vte8zr55DZIihjLdjaDYewA',
    likes: 312,
    commentsCount: 1,
    comments: [
      {
        id: 'c5',
        authorName: 'Clara Ortiz',
        content: '¡Son hermosos! Voy a pasar por el jardín a verlos mañana.',
        timeAgo: 'Hace 1 día'
      }
    ],
    timeAgo: 'Hace 2 días',
    tag: 'Urgente: Adopción'
  }
];

export const FAQS = [
  {
    id: 'faq1',
    question: '¿Cómo puedo estar seguro de mi donación?',
    answer: 'Publicamos reportes mensuales de transparencia en nuestro portal con facturas de veterinarias y compras de alimento.'
  },
  {
    id: 'faq2',
    question: '¿Si soy externo a la UNDC puedo donar?',
    answer: '¡Por supuesto! La comunidad de Cañete es fundamental para que este proyecto de bienestar animal prospere.'
  },
  {
    id: 'faq3',
    question: '¿Puedo donar medicinas?',
    answer: 'Sí, siempre que no estén vencidas y el empaque esté íntegro. Por favor, consulta la lista de medicinas necesarias en Bienestar Universitario.'
  },
  {
    id: 'faq4',
    question: '¿Qué días se realizan los paseos?',
    answer: 'Los voluntarios coordinan turnos vía WhatsApp los fines de semana y feriados, cuando el campus está más tranquilo.'
  }
];

export const PUNTOS_ACOPIO = [
  {
    id: 'p1',
    name: 'Puerta Principal (Vigilancia)',
    schedule: 'Lunes a Sábado, 08:00 - 18:00'
  },
  {
    id: 'p2',
    name: 'Oficina de Bienestar Universitario',
    schedule: 'Pabellón Central, 2do Piso'
  }
];

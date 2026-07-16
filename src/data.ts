/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pet, Post, BlogPost } from './types';

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
    image: '/images/curly2.jpeg',
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
    image: '/images/princesa2.jpeg',
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

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog1',
    title: 'Cuidado de perros y gatos en épocas de calor',
    excerpt: 'Conoce las señales de golpe de calor en mascotas y cómo mantenerlas hidratadas durante los meses más calurosos en Cañete.',
    content: `El calor en Cañete puede ser intenso, y nuestras mascotas del campus también lo sufren. Aquí te damos consejos prácticos:

• Agua fresca siempre: Coloca bebederos en puntos estratégicos del campus.
• Sombra disponible: Identifica espacios techados donde puedan refugiarse.
• No dejar en vehículos: Aunque sea "solo un momento", la temperatura sube peligrosamente.
• Señales de alerta: Jadeo excesivo, letargia y encías rojas pueden indicar golpe de calor.
• Horarios de paseo: Prefiere las mañanas temprano o al atardecer.

Si ves a Curly, Princesa o cualquier mascota del campus mostrando signos de agotamiento por calor, avisa al voluntariado de Bienestar Universitario.`,
    category: 'cuidado',
    author: 'Voluntariado UNDC Pets',
    publishedAt: '2026-03-15',
    tags: ['calor', 'hidratacion', 'cuidado basico'],
    featured: true,
    image: '/images/curly.jpeg',
  },
  {
    id: 'blog2',
    title: 'Alimentación adecuada para perros y gatos del campus',
    excerpt: '¿Croquetas o comida húmeda? Te explicamos qué necesita cada mascota según su edad, tamaño y estado de salud.',
    content: `La alimentación es clave para la salud de las mascotas del campus. Recomendaciones del equipo veterinario:

• Perros adultos (como Curly): 2 raciones diarias de croquetas de alta calidad.
• Gatos (como Gata Ingeniera): Alimento balanceado específico para gatos, no uses comida de perro.
• Cachorros: Necesitan raciones más pequeñas y frecuentes.
• Animales en tratamiento (RunRun): Dieta especial según indicación del veterinario.

Marcas recomendadas: Ricocan, Ricocat, Mimaskot, Cambo. Evita el alimento a granel.

Recuerda: No les des huesos cocidos ni chocolate, son tóxicos para ellos.`,
    category: 'alimentacion',
    author: 'Bienestar Universitario',
    publishedAt: '2026-02-28',
    tags: ['alimentacion', 'croquetas', 'nutricion'],
    featured: true,
    image: '/images/princesa.jpeg',
  },
  {
    id: 'blog3',
    title: '¿Cómo saber si un animal necesita atención veterinaria?',
    excerpt: 'Señales de alerta que todo estudiante voluntario debe conocer para actuar a tiempo y ayudar a las mascotas del campus.',
    content: `Como miembros de la comunidad UNDC, es importante identificar cuándo una mascota necesita ayuda profesional:

🚨 SEÑALES DE ALERTA:
• Heridas visibles o sangrado
• Cojera o dificultad para moverse
• Ojos con secreción o enrojecidos
• Vómitos o diarrea repetidos
• Pérdida de apetito por más de 24 horas
• Apatía o aislamiento inusual

✅ QUÉ HACER:
1. Contacta al voluntariado por los canales oficiales
2. No intentes medicar por tu cuenta
3. Si es grave, lleva al animal a la veterinaria más cercana
4. Reporta el caso en el Muro Comunitario para seguimiento

El equipo de Bienestar Universitario tiene convenios con veterinarias locales para la atención de las mascotas del campus.`,
    category: 'salud',
    author: 'Dra. Elena Prado',
    publishedAt: '2026-02-10',
    tags: ['veterinaria', 'emergencia', 'salud'],
    featured: true,
    image: '/images/runrun.jpeg',
  },
  {
    id: 'blog4',
    title: 'Beneficios de la esterilización en mascotas comunitarias',
    excerpt: 'La esterilización ayuda a controlar la población animal y mejora la calidad de vida de perros y gatos en el campus.',
    content: `La campaña de esterilización es una de las iniciativas más importantes de UNDC Pets:

🏥 BENEFICIOS:
• Control de la población: Evita camadas no deseadas en el campus.
• Salud: Reduce riesgos de cáncer y enfermedades reproductivas.
• Comportamiento: Disminuye la agresividad y el marcaje territorial.
• Comunidad: Menos conflictos con la comunidad universitaria.

💉 PROCESO:
El voluntariado coordina jornadas de esterilización con veterinarias aliadas. Los animales son evaluados previamente y reciben cuidados post-operatorios.

📊 Nuestra meta: Esterilizar al menos al 80% de la población animal del campus para fin de año.`,
    category: 'salud',
    author: 'Voluntariado UNDC Pets',
    publishedAt: '2026-01-20',
    tags: ['esterilizacion', 'poblacion', 'prevencion'],
    featured: false,
    image: '/images/gata.jpeg',
  },
  {
    id: 'blog5',
    title: 'Cómo socializar a tu mascota con otros animales del campus',
    excerpt: 'Tips para presentar a tu mascota con los perros y gatos de la universidad de forma segura y respetuosa.',
    content: `Si llevas a tu mascota al campus o quieres interactuar con las mascotas comunitarias, sigue estas pautas:

🐕 PRESENTACIÓN SEGURA:
1. Mantén a tu mascota con correa al principio
2. Permite que se huelan a distancia
3. Observa el lenguaje corporal: cola erguida, orejas hacia atrás = estrés
4. No fuerces el encuentro, deja que ellos decidan el ritmo

🐱 CON GATOS:
Los gatos son más territoriales. Acércate despacio, extiende la mano para que te huelan, y evita movimientos bruscos.

⚠️ RECUERDA:
No todos los animales del campus están acostumbrados al contacto humano frecuente. Respeta su espacio y nunca los persigas.`,
    category: 'consejos',
    author: 'Estudiantes de Veterinaria',
    publishedAt: '2025-12-05',
    tags: ['socializacion', 'comportamiento', 'convivencia'],
    featured: false,
    image: '/images/curly2.jpeg',
  },
  {
    id: 'blog6',
    title: 'La historia de Curly: de vagabundo a guardián del campus',
    excerpt: 'Conoce cómo Curly pasó de deambular por las calles a convertirse en la mascota más querida de la sede San Luis.',
    content: `Curly llegó al campus hace más de dos años, buscando refugio y alimento. Era desconfiado, tenía pulgas y estaba bastante desnutrido.

Los estudiantes de la sede San Luis comenzaron a darle agua y comida. Poco a poco, Curly fue soltando su carácter juguetón. Se ganó el cariño de todos por su lealtad: acompañaba a los vigilantes en sus rondas nocturnas y recibía a los estudiantes en la puerta cada mañana.

Hoy, Curly está vacunado, esterilizado y en busca de un hogar permanente. Pero mientras tanto, sigue siendo el guardián oficial de la sede, moviendo la cola feliz cada vez que alguien llega.

¿Te animas a adoptarlo? Habla con Bienestar Universitario.`,
    category: 'historias',
    author: 'Comunidad UNDC',
    publishedAt: '2025-11-15',
    tags: ['curly', 'historia', 'adopcion', 'campus'],
    featured: false,
    image: '/images/curly3.jpeg',
  },
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

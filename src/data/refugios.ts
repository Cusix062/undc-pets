export interface Refugio {
  id: string;
  name: string;
  description: string;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  schedule: string;
  dogs: number;
  cats: number;
  image?: string;
  website?: string;
}

export const REFUGIOS: Refugio[] = [
  {
    id: 'huellitas-felices',
    name: 'Refugio Huellitas Felices',
    description: 'Refugio temporal y centro de adopción que alberga perros y gatos rescatados de las calles de Cañete.',
    address: 'Av. Mariscal Benavides 850',
    district: 'San Vicente',
    city: 'Cañete',
    lat: -13.0783,
    lng: -76.3847,
    phone: '987 654 321',
    schedule: '8:00 am - 5:00 pm',
    dogs: 18,
    cats: 7,
  },
  {
    id: 'patitas-limpias',
    name: 'Albergue Patitas Limpias',
    description: 'Albergue sin fines de lucro dedicado a la rehabilitación y adopción responsable de animales abandonados.',
    address: 'Calle Las Palmeras 245',
    district: 'San Luis',
    city: 'Cañete',
    lat: -13.0521,
    lng: -76.3739,
    phone: '956 123 789',
    schedule: '9:00 am - 6:00 pm',
    dogs: 24,
    cats: 12,
  },
  {
    id: 'amigos-fieles',
    name: 'Refugio Amigos Fieles',
    description: 'Organización comunitaria que brinda refugio, alimentación y atención veterinaria básica.',
    address: 'Carretera Cañete-Chincha Km 5',
    district: 'Quilmaná',
    city: 'Cañete',
    lat: -13.0317,
    lng: -76.3720,
    phone: '945 678 234',
    schedule: '8:30 am - 5:30 pm',
    dogs: 15,
    cats: 9,
  },
  {
    id: 'veterinaria-san-vicente',
    name: 'Veterinaria San Vicente',
    description: 'Clínica veterinaria que apoya con atención médica y esterilización a bajo costo para mascotas comunitarias.',
    address: 'Jr. Bolívar 412',
    district: 'San Vicente',
    city: 'Cañete',
    lat: -13.0769,
    lng: -76.3812,
    phone: '934 567 890',
    schedule: '9:00 am - 8:00 pm',
    dogs: 5,
    cats: 3,
  },
  {
    id: 'centro-adopcion-canete',
    name: 'Centro de Adopción Cañete',
    description: 'Centro municipal de adopción canina y felina. Promueve la tenencia responsable de mascotas.',
    address: 'Av. 28 de Julio 320',
    district: 'Imperial',
    city: 'Cañete',
    lat: -13.0712,
    lng: -76.3528,
    phone: '912 345 678',
    schedule: '8:00 am - 4:00 pm',
    dogs: 30,
    cats: 15,
  },
  {
    id: 'hogar-animal-lunahuana',
    name: 'Hogar Animal Lunahuaná',
    description: 'Refugio ubicado en el valle de Lunahuaná, especializado en rescate de animales en zonas rurales.',
    address: 'Plaza Principal de Lunahuaná s/n',
    district: 'Lunahuaná',
    city: 'Cañete',
    lat: -12.9611,
    lng: -76.5503,
    phone: '978 901 234',
    schedule: '9:00 am - 5:00 pm',
    dogs: 12,
    cats: 5,
  },
  {
    id: 'mascotas-undc',
    name: 'UNDC Pets — Punto de Alimentación',
    description: 'Punto de alimentación y cuidado temporal dentro del campus de la Universidad Nacional de Cañete.',
    address: 'Universidad Nacional de Cañete, Sede San Luis',
    district: 'San Luis',
    city: 'Cañete',
    lat: -13.0512,
    lng: -76.3755,
    phone: '2301010130',
    schedule: '7:00 am - 7:00 pm',
    dogs: 8,
    cats: 4,
  },
];

export const DISTRITOS = [...new Set(REFUGIOS.map(r => r.district))].sort();

-- ============================================
-- UNDC Pets - Admin System Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Admins table
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add your admin email
INSERT INTO admins (email) VALUES ('2301010130@undc.edu.pe')
ON CONFLICT (email) DO NOTHING;

-- 2. Pets table (mirrors the hardcoded INITIAL_PETS)
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert existing pets
INSERT INTO pets (id, data) VALUES
  ('Curly', '{"id":"Curly","name":"Curly","species":"dog","gender":"male","age":"2 Años","status":"Buscando hogar","statusType":"warning","tags":["Juguetón","Vacunado","Social"],"description":"Curly es el guardián de la Universidad Nacional de Cañete, Sede en San Luis. Es muy juguetón y le encantan correr libremente por todo el campo.","story":"Curly llegó al campus hace medio año, buscando a su familia. Fue rescatado por los estudiantes, quienes costearon su veterinario. Ahora, esta muy feliz con sus nuevos amiguitos, vive feliz custodiando los pabellones.","image":"/images/curly.jpeg","location":"Sede San Luis"}'),
  ('Princesa', '{"id":"Princesa","name":"Princesa","species":"dog","gender":"female","age":"1 Año","status":"Sano","statusType":"success","tags":["Tranquila","Esterilizada","Sociable"],"description":"Princesa prefiere la tranquilidad de la biblioteca. Es la compañía perfecta para estudiar.","story":"Princesa es una perrita llego hace menos de un año a la universidad a darnos muchas alegrias. Pasa sus tardes descansando en la biblioteca o en las aulas de la facultad de agronomia, brindando una presencia relajante a todos los que se preparan para sus exámenes.","image":"/images/princesa.jpeg","location":"Multiusos"}'),
  ('RunRun', '{"id":"RunRun","name":"RunRun","species":"dog","gender":"male","age":"3 Años","status":"En tratamiento","statusType":"error","tags":["Leal","Paciente","Cariñoso"],"description":"RunRun necesita ayuda para su tratamiento de cadera. Cualquier donación es bienvenida.","story":"RunRun es un perrito muy querido en el pabellón de Administración. Lamentablemente, tiene dificultades para caminar debido a su que solo tiene 3 patitas. Se encuentra bajo tratamiento médico con antiinflamatorios y sesiones de terapia gracias al apoyo del voluntariado y donaciones externas.","image":"/images/runrun.jpeg","location":"Pabellón de Administración"}'),
  ('Gata Ingeniera', '{"id":"Gata Ingeniera","name":"Gata Ingeniera","species":"cat","gender":"female","age":"6 meses","status":"Alegre","statusType":"warning","tags":["Juguetona","Energética","Curiosa"],"description":"Es una gatita llena de energía y amor.","story":"Gata Ingeniera fue hallada a las afueras de la facultad. Inmediatamente el personal administrativo la acogió. Es sumamente juguetona y ágil. Se pasa el día en las aulas de la facultad, compartiendo con los estudiantes, radiando alegria y felicidad.","image":"/images/gata.jpeg","location":"Facultad de Ingenieria"}')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for pets
ALTER PUBLICATION supabase_realtime ADD TABLE pets;

-- 3. Donation config table (single row with all config)
CREATE TABLE IF NOT EXISTS donation_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO donation_config (id, data) VALUES ('main', '{
  "accounts": [
    {"bank":"Banco de la Nación (Cta. Corriente)","number":"00-068-123456","CCI":"018-068-000068123456-78"},
    {"bank":"BCP (Cuenta Recaudadora - Bienestar)","number":"191-9876543-0-12","CCI":"002-191-009876543012-54"},
    {"bank":"Yape / Plin (Celular Coordinador)","number":"987 654 321","CCI":"Nombre: Asociación UNDC Pets"}
  ],
  "yapeNumber": "993 376 465",
  "plinNumber": "993 376 465",
  "qrCodes": {
    "yape": "/images/yape.jpeg",
    "plin": "/images/plin.jpeg",
    "bcp": "/images/qr-bcp.svg",
    "tunqui": "/images/qr-tunqui.svg"
  },
  "campaigns": [
    {"id":"camp_food","title":"Alimento Mensual para el Campus","description":"Compra de bolsas de croquetas de 15kg para perros y gatos. Asegura su ración diaria de comida.","currentAmount":340,"targetAmount":500,"urgency":"Alta"},
    {"id":"camp_medical","title":"Cirugía y Terapia de Firulais","description":"Tratamiento especializado de cadera, medicamentos antiinflamatorios y radiografías de control.","currentAmount":210,"targetAmount":800,"urgency":"Crítica"},
    {"id":"camp_spay","title":"Campaña de Esterilización Integral","description":"Esterilización preventiva de nuevas mascotas que ingresan o rondan las inmediaciones del campus.","currentAmount":950,"targetAmount":1200,"urgency":"Media"}
  ]
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  user_id TEXT PRIMARY KEY,
  reason TEXT,
  blocked_by TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW()
);

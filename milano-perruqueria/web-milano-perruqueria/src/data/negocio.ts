// Datos del negocio. Todo lo que hay que confirmar con Patri está aquí,
// en un solo sitio: WhatsApp, horario, servicios y precios.
// El dominio está en astro.config.mjs.

export const negocio = {
  nombre: 'Milano Perruqueria',
  telefono: '937 04 22 07',
  telefonoE164: '+34937042207',
  // PENDIENTE: número de WhatsApp del salón (solo dígitos, con prefijo 34).
  // Vacío = WhatsApp se abre con el mensaje escrito y la clienta elige a quién enviarlo
  // (sirve para enseñar la demo sin mandar nada a nadie).
  whatsapp: '',
  direccion: {
    calle: 'Av. de Martí Pujol, 247',
    cp: '08912',
    ciudad: 'Badalona',
    provincia: 'Barcelona',
    pais: 'ES',
  },
  geo: { lat: 41.4518678, lng: 2.2437799 },
  // Ficha de Google Maps del salón (por su identificador cid).
  mapsUrl: 'https://www.google.com/maps?cid=10674253958540431327',
  mapsEmbed: 'https://www.google.com/maps?q=Milano+Perruqueria,+Av.+de+Mart%C3%AD+Pujol+247,+08912+Badalona&z=17&output=embed',
  // Google Maps, consultado el 28/10/2026. Actualizar antes de publicar.
  valoracion: { nota: '5,0', resenas: 282 },
};

// Horario del cartel de la puerta del salón (foto de la fachada): de martes a viernes
// 9:30–19:30 y sábado 9–14. Google y Fresha dicen 10–19: confirmar con Patri.
// Día 0 = domingo. Tramos en formato HH:MM.
export const horario: Record<number, [string, string][]> = {
  0: [],
  1: [],
  2: [['09:30', '19:30']],
  3: [['09:30', '19:30']],
  4: [['09:30', '19:30']],
  5: [['09:30', '19:30']],
  6: [['09:00', '14:00']],
};

// Familias de servicio (el formulario las llama "linea").
export const lineas = [
  { id: 'corte', num: 1 },
  { id: 'color', num: 2 },
  { id: 'tratamiento', num: 3 },
  { id: 'infantil', num: 4 },
] as const;
export type LineaId = (typeof lineas)[number]['id'];

// PENDIENTE: lista y precios reales. Ahora son precios "desde" de ejemplo.
export const servicios = [
  { id: 'corte-peinado', linea: 'corte', min: 60, desde: 25 },
  { id: 'sanear', linea: 'corte', min: 45, desde: 18 },
  { id: 'peinado', linea: 'corte', min: 30, desde: 15 },
  { id: 'raiz', linea: 'color', min: 90, desde: 35 },
  { id: 'color-completo', linea: 'color', min: 120, desde: 48 },
  { id: 'balayage', linea: 'color', min: 180, desde: 80 },
  { id: 'botox', linea: 'tratamiento', min: 90, desde: 45 },
  { id: 'hidratacion', linea: 'tratamiento', min: 45, desde: 22 },
  { id: 'diagnostico', linea: 'tratamiento', min: 30, desde: 0 },
  { id: 'infantil', linea: 'infantil', min: 30, desde: 12 },
] as const satisfies readonly { id: string; linea: LineaId; min: number; desde: number }[];
export type ServicioId = (typeof servicios)[number]['id'];

// Largos del pelo, de más corto a más largo, con los cm aproximados desde la nuca.
export const largos = [
  { id: 'nuca', cm: 5 },
  { id: 'mandibula', cm: 15 },
  { id: 'hombros', cm: 25 },
  { id: 'pecho', cm: 38 },
  { id: 'espalda', cm: 50 },
  { id: 'cintura', cm: 62 },
] as const;
export type LargoId = (typeof largos)[number]['id'];

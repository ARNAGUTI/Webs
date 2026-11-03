// Datos del negocio. Todo lo que hay que confirmar con el salón está aquí,
// en un solo sitio: teléfono, WhatsApp, horario, servicios, precios y fotos.
// El dominio está en astro.config.mjs.

export const negocio = {
  nombre: 'SempreDivas',
  telefono: '602 85 29 01',
  telefonoE164: '+34602852901',
  // PENDIENTE: confirmar que este móvil tiene WhatsApp (solo dígitos, con prefijo 34).
  whatsapp: '34602852901',
  direccion: {
    calle: 'Av. Bufalà, 21',
    cp: '08915',
    ciudad: 'Badalona',
    provincia: 'Barcelona',
    pais: 'ES',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SempreDivas+peluquer%C3%ACa+Av.+Bufal%C3%A0+21+Badalona',
  mapsEmbed: 'https://www.google.com/maps?q=Av.+Bufal%C3%A0+21,+08915+Badalona&z=16&output=embed',
  // Google, vía PeluqueriaMaster (abril 2026): nº 15 de 229 en Badalona. Revisar antes de publicar.
  valoracion: { nota: '4,8', resenas: 173 },
};

// Horario de su ficha pública de Fresha (noviembre 2026). PENDIENTE: confirmar.
// Día 0 = domingo. Tramos en formato HH:MM.
export const horario: Record<number, [string, string][]> = {
  0: [['09:00', '14:00']],
  1: [],
  2: [['09:00', '20:00']],
  3: [['09:00', '20:00']],
  4: [['09:00', '20:00']],
  5: [['09:00', '20:00']],
  6: [['09:00', '17:00']],
};

// PENDIENTE: precios y duraciones reales. "desde" = orientativo (depende del largo).
// grupo: corte | color | tratamiento
export const servicios = [
  { id: 'corte', grupo: 'corte', min: 45, precio: 22 },
  { id: 'lavar-peinar', grupo: 'corte', min: 30, precio: 15 },
  { id: 'recogido', grupo: 'corte', min: 60, precio: 35 },
  { id: 'tinte', grupo: 'color', min: 90, precio: 35 },
  { id: 'mechas', grupo: 'color', min: 150, precio: 60 },
  { id: 'balayage', grupo: 'color', min: 180, precio: 85 },
  { id: 'keratina', grupo: 'tratamiento', min: 150, precio: 90 },
  { id: 'hidratacion', grupo: 'tratamiento', min: 45, precio: 25 },
] as const;

export type ServicioId = (typeof servicios)[number]['id'];
export type Grupo = (typeof servicios)[number]['grupo'];

// Fotos de MUESTRA de Unsplash (licencia libre). Sustituir por fotos reales del salón:
// guardarlas en public/fotos/ y poner aquí '/fotos/nombre.jpg' en lugar del enlace.
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75`;
export const fotos = {
  color: u('1695527081848-1e46c06e6458'),
  balayage: u('1785456411888-c2e842552820'),
  liso: u('1779350676620-fde279b1d023'),
  recogido: u('1774660810725-fb04e002003d'),
  secador: u('1562322140-8baeececf3df'),
  tijera: u('1700760934268-8aa0ef52ce0a'),
  salon: u('1521590832167-7bcbfaa6381f'),
  sillones: u('1626383137804-ff908d2753a2'),
  melena: u('1536063211352-0b94219f6212'),
  rizos: u('1644718847160-52a922094f69'),
};
export type FotoId = keyof typeof fotos;

// Unsplash recorta y redimensiona por URL; una foto local se sirve tal cual.
export const foto = (id: FotoId, w: number, h?: number) =>
  fotos[id].startsWith('http') ? `${fotos[id]}&w=${w}${h ? `&h=${h}` : ''}` : fotos[id];
export const srcset = (id: FotoId, ws: number[], ratio?: number) =>
  fotos[id].startsWith('http') ? ws.map((w) => `${foto(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ') : undefined;

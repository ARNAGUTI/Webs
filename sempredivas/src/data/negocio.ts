// Datos del negocio. Todo lo que hay que confirmar con el salón está aquí,
// en un solo sitio: teléfonos, WhatsApp, horario, servicios, precios, reseñas y fotos.
// El dominio está en astro.config.mjs.

export const negocio = {
  nombre: 'SempreDivas',
  // Móvil del vinilo del escaparate: se usa para llamar y para WhatsApp.
  telefono: '602 85 29 01',
  telefonoE164: '+34602852901',
  // PENDIENTE: confirmar que este móvil tiene WhatsApp (solo dígitos, con prefijo 34).
  whatsapp: '34602852901',
  // Fijo pintado en el rótulo de la fachada.
  fijo: '931 06 07 75',
  fijoE164: '+34931060775',
  instagram: 'sempredivas32',
  direccion: {
    calle: 'Av. Bufalà, 21',
    cp: '08915',
    ciudad: 'Badalona',
    provincia: 'Barcelona',
    pais: 'ES',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SempreDivas+peluquer%C3%ACa+Av.+Bufal%C3%A0+21+Badalona',
  mapsEmbed: 'https://www.google.com/maps?q=Av.+Bufal%C3%A0+21,+08915+Badalona&z=16&output=embed',
  // Google Maps (noviembre 2026). Revisar antes de publicar.
  valoracion: { nota: '4,8', resenas: 188 },
};

// Horario: PeluqueriaMaster y esopiniones dan el sábado de 9 a 20; Fresha, de 9 a 17.
// PENDIENTE: confirmar con el salón. Día 0 = domingo. Tramos en formato HH:MM.
export const horario: Record<number, [string, string][]> = {
  0: [['09:00', '14:00']],
  1: [],
  2: [['09:00', '20:00']],
  3: [['09:00', '20:00']],
  4: [['09:00', '20:00']],
  5: [['09:00', '20:00']],
  6: [['09:00', '20:00']],
};

// Servicios: la lista del vinilo del escaparate.
// precio: los tres que salen en el escaparate; null = "consultar".
// min: duración ORIENTATIVA para calcular las horas libres. PENDIENTE: confirmar.
export const servicios = [
  { id: 'lavar-cortar', grupo: 'peinado', min: 45, precio: 14.5 },
  { id: 'lavar-peinar', grupo: 'peinado', min: 30, precio: null },
  { id: 'recogido', grupo: 'peinado', min: 60, precio: null },
  { id: 'forma', grupo: 'peinado', min: 90, precio: null },
  { id: 'tenir-peinar', grupo: 'color', min: 90, precio: 25 },
  { id: 'mechas', grupo: 'color', min: 120, precio: null },
  { id: 'balayage', grupo: 'color', min: 180, precio: null },
  { id: 'halo', grupo: 'color', min: 150, precio: null },
  { id: 'keratina', grupo: 'tratamiento', min: 150, precio: null },
  { id: 'hidratacion', grupo: 'tratamiento', min: 45, precio: null },
  { id: 'extensiones', grupo: 'tratamiento', min: 120, precio: null },
  { id: 'cejas-hilo', grupo: 'estetica', min: 15, precio: 6 },
  { id: 'depilacion', grupo: 'estetica', min: 30, precio: null },
  { id: 'maquillaje', grupo: 'estetica', min: 45, precio: null },
  { id: 'manicura', grupo: 'estetica', min: 45, precio: null },
] as const;

export type ServicioId = (typeof servicios)[number]['id'];
export type Grupo = (typeof servicios)[number]['grupo'];
export const grupos: Grupo[] = ['peinado', 'color', 'tratamiento', 'estetica'];

export const precioTexto = (p: number | null, lang: 'es' | 'ca') =>
  p == null ? null : `${p.toLocaleString(lang === 'es' ? 'es-ES' : 'ca-ES', { minimumFractionDigits: p % 1 ? 2 : 0 })} €`;

// Reseñas reales (esopiniones.com, copiadas tal cual, solo el nombre de pila).
export const resenas = [
  { n: 'Joana', lang: 'es', t: 'Muy buen trato, ambiente muy cómodo y cortes de pelo muy bien hechos. Hemos ido 4 chicas a lavar, cortar y peinar y estamos contentísimas con el resultado.' },
  { n: 'Isa', lang: 'es', t: 'Te ofrecen café y están pendientes y explicándote en cada momento qué te van a hacer. El masaje capilar mientras te lavan el cabello es de 100.' },
  { n: 'Montserrat', lang: 'es', t: 'Suelo tener problemas con el corte de mi pelo por tenerlo muy grueso y he salido encantada. ¡Mi peluquería de confianza a partir de ahora!' },
  { n: 'Claudia', lang: 'ca', t: 'Un tracte molt amable i professional. Vaig fer-me un tractament de color amb productes naturals i el seu servei va ser immillorable.' },
  { n: 'Mireia', lang: 'es', t: 'Me he hecho balayage y corte y el resultado se ajusta a lo que quería. Muy hospitalarias y amables.' },
  { n: 'Pepa', lang: 'es', t: 'He ido un domingo por la mañana y he quedado muy satisfecha con el servicio que dan. Ahora llevaré también a mi hija.' },
] as const;

// Fotos REALES del salón (de su ficha de Google Maps). PENDIENTE: pedir permiso para usarlas.
// Están en public/fotos/: nombre.jpg (900 px) y nombre-480.webp / nombre-900.webp.
export const fotos = {
  'trenzas-perlas': { w: 1200, h: 1600 },
  lazo: { w: 1200, h: 1600 },
  'antes-despues': { w: 1200, h: 1200 },
  alisado: { w: 480, h: 848 },
  semirecogido: { w: 1200, h: 1600 },
  'espejo-ondas': { w: 635, h: 850 },
  'trenzas-nina': { w: 1200, h: 1200 },
  'logo-marmol': { w: 576, h: 1024 },
  fachada: { w: 1400, h: 1050 },
} as const;
export type FotoId = keyof typeof fotos;

export const foto = (id: FotoId) => `/fotos/${id}.jpg`;
export const srcset = (id: FotoId) =>
  fotos[id].w > 900 ? `/fotos/${id}-480.webp 480w, /fotos/${id}-900.webp 900w` : `/fotos/${id}-480.webp 480w`;

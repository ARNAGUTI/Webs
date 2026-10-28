// Datos del negocio. Todo lo que hay que confirmar con Johny está aquí,
// en un solo sitio: teléfonos, horario, servicios y precios.
// El dominio está en astro.config.mjs.

export const negocio = {
  nombre: 'Johny García Barber',
  // PENDIENTE: confirmar. Belliata publica el 930 27 98 70 y Fresha el 658 95 65 34.
  telefono: '930 27 98 70',
  telefonoE164: '+34930279870',
  // PENDIENTE: número de WhatsApp real (solo dígitos, con prefijo 34).
  whatsapp: '34658956534',
  direccion: {
    calle: 'Avinguda dels Vents, 1',
    cp: '08917',
    ciudad: 'Badalona',
    provincia: 'Barcelona',
    pais: 'ES',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Johny+Garc%C3%ADa+Barber&query_place_id=ChIJeU19U1K7pBIRN8GnNYXu6xI',
  mapsEmbed: 'https://www.google.com/maps?q=Avinguda+dels+Vents+1,+08917+Badalona&z=16&output=embed',
  // Google, vía Barberhead (octubre 2026). Revisar antes de publicar.
  valoracion: { nota: '5,0', resenas: 42 },
  pago: ['efectivo', 'tarjeta'] as const,
};

// PENDIENTE: horario real (las fichas públicas no coinciden).
// Cuando esté confirmado, poner horarioConfirmado = true.
export const horarioConfirmado = false;
// Día 0 = domingo. Tramos en formato HH:MM.
export const horario: Record<number, [string, string][]> = {
  0: [],
  1: [['14:00', '20:00']],
  2: [['10:00', '20:00']],
  3: [['10:00', '20:00']],
  4: [['10:00', '20:00']],
  5: [['10:00', '20:00']],
  6: [['09:00', '14:00']],
};

// PENDIENTE: precios reales. Servicios sacados de su ficha pública.
export const servicios = [
  { id: 'corte', min: 30, precio: 12 },
  { id: 'degradado', min: 30, precio: 14 },
  { id: 'corte-barba', min: 45, precio: 18 },
  { id: 'barba', min: 15, precio: 8 },
  { id: 'afeitado', min: 30, precio: 12 },
  { id: 'infantil', min: 30, precio: 10 },
] as const;

export type ServicioId = (typeof servicios)[number]['id'];

// Agenda real con Google Calendar (páginas de reserva / appointment schedules).
// Cada barbero crea su página de reserva en Google Calendar y pega aquí el enlace
// de "Compartir > Insertar en sitio web" (el que acaba en ?gv=true).
// Si la lista está vacía, la reserva va por WhatsApp como hasta ahora.
export const barberos: { nombre: string; agenda: string }[] = [
  // { nombre: 'Johny', agenda: 'https://calendar.google.com/calendar/appointments/schedules/XXXX?gv=true' },
];

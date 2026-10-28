# Web de Johny García Barber

Web de una sola página en Astro, en español (`/`) y catalán (`/ca/`).

## Abrirla en tu PC

```bash
cd D:\Webs\johny-garcia-barber
npm run dev -- --port 4322
```

Abre http://localhost:4322 (catalán: http://localhost:4322/ca/). Versión final: `npm run build` y `npm run preview`.

## El sistema de citas (lo que le vendes)

Johny trabaja solo y pierde tiempo al teléfono. Aquí el cliente elige servicio, día y hora (solo dentro del horario y sin pasarse del cierre según lo que dura el servicio), pone nombre y móvil, y se abre WhatsApp con el mensaje ya escrito:

> Hola Johny, soy Marc. Quiero cita para Corte + barba el jueves 29 oct a las 11:00. Mi móvil: 612345678.

Johny solo tiene que contestar "ok" entre cliente y cliente. Además:
- El móvil del cliente recuerda su nombre y teléfono para la próxima vez.
- Botón "Añadir a mi calendario" con aviso 2 h antes (menos clientes que se olvidan).
- Sección "Lo que más le preguntan por teléfono" (sin cita, tarjeta, duración, cancelar).

Límite honesto: la web no sabe qué horas tiene ya cogidas; Johny confirma o propone otra. Si más adelante quiere agenda con huecos reales, se puede conectar una agenda gratuita (Google Calendar con páginas de reserva o Cal.com) sin pagar comisión por cliente.

## Agenda con Google Calendar (horas ocupadas bloqueadas)

La web ya está preparada para usar la agenda de Google de cada barbero. Así el cliente solo ve horas libres y la cita entra en el Google Calendar del barbero, con aviso en el móvil.

1. Johny (y cada barbero) entra en Google Calendar desde el ordenador > **Crear > Agenda de citas** (appointment schedule). Pone su horario, la duración de la cita y el margen entre citas. Las horas que ya tenga ocupadas en su calendario se bloquean solas.
2. Abre la agenda > **Compartir > Insertar en sitio web** y copia la dirección que acaba en `?gv=true`.
3. Pega esa dirección en `src/data/negocio.ts`, en `barberos`:
   ```ts
   export const barberos = [
     { nombre: 'Johny', agenda: 'https://calendar.google.com/calendar/appointments/schedules/XXXX?gv=true' },
   ];
   ```
   Con más de un barbero aparece un selector "Barbero".

Mientras `barberos` esté vacío, la reserva funciona por WhatsApp. Con una cuenta Gmail gratuita sirve una agenda por persona; las funciones extra (varias agendas, recordatorios por email al cliente) piden Google Workspace o Google One Premium.

## Enséñasela a Johny

1. En el móvil: el letrero de neón con su nombre y el cartel ABIERTO/CERRADO que cambia solo según la hora.
2. Pide una cita de prueba hasta que se abra WhatsApp con el mensaje escrito.
3. El argumento: hoy, quien le busca en Google acaba en una ficha automática de Fresha que él no controla, sin reservas y con "reservar online en establecimientos cercanos" (otras barberías). Con su web la cita va directa a él, sin comisiones.

## Lo que hay que confirmar con Johny

Todo está en `src/data/negocio.ts`:
- **Teléfono y WhatsApp**: las fichas públicas no coinciden (930 27 98 70 en Belliata, 658 95 65 34 en Fresha). Ahora: llamar al 930 y WhatsApp al 658.
- **Horario**: de ejemplo (el de Belliata). Fresha dice otra cosa.
- **Servicios y precios**: servicios de su ficha; precios de ejemplo.
- **Vídeos en la cinta de Trabajos**: guardar el vídeo (mp4 corto, sin sonido) en `public/videos/` y en `src/components/Home.astro`, en `galeria`, añadir `video: '/videos/nombre.mp4'` a una foto. La foto hace de portada y el vídeo se reproduce solo cuando la tarjeta está a la vista.
- **Fotos**: de muestra (Unsplash) en `src/assets/img/`. Sustituir por fotos reales con el mismo nombre.
- **Dominio**: `astro.config.mjs` (ahora johnygarciabarber.es, provisional).
- La valoración (5,0, 42 reseñas) viene de Google vía Barberhead; revisar.

Textos en `src/i18n/ui.ts` (español y catalán).

## SEO local incluido

Título y descripción por idioma, `hreflang` es/ca, datos estructurados `BarberShop` (dirección, teléfono, horario, pago), `sitemap.xml` y `robots.txt`. Al publicar: Google Search Console y poner la URL en su ficha de Google Maps.

## Publicarla (gratis)

`npm run build` y subir la carpeta `dist/` a Netlify Drop, Vercel o Cloudflare Pages.

# Web de SempreDivas (demo)

Web de una sola página en Astro, en español (`/`) y catalán (`/ca/`). Estilo "fotomatón": cortina de terciopelo, tira de cuatro fotos y flash.

## Abrirla en tu PC

```bash
cd D:\Webs\sempredivas
npm install
npm run dev -- --port 4325
```

Abre http://localhost:4325 (catalán: http://localhost:4325/ca/). Versión final: `npm run build` y `npm run preview`.

Las fotos de muestra se cargan desde Unsplash, así que hace falta internet.

## El argumento de venta

Ojo: **SempreDivas no usa Fresha para reservar**. Su ficha de Fresha es automática y no reclamada: pone "Llamar para reservar" y debajo "reservar online en establecimientos cercanos", es decir, a quien la busca le enseña otras peluquerías. Su única web es un blog viejo de Blogspot.

Con su web:
1. Buscar "SempreDivas" lleva a su página, con su nombre, su 4,8★ (173 reseñas) y su horario, incluido el domingo por la mañana.
2. La clienta pide cita sola: elige servicio, día y hora, pone su nombre, y se abre WhatsApp con el mensaje ya escrito:
   > Hola SempreDivas, soy Laura. Quiero cita para Mechas el jueves 5 nov a las 10:00. Mi móvil: 612345678.
3. Sin comisiones por clienta (lo que cobraría Fresha si se diera de alta con reservas).

Si más adelante quiere agenda con huecos reales, se conecta Google Calendar (páginas de reserva), como en la demo de Johny.

## Enséñasela

1. En el móvil: los cuatro flashes y la tira de fotos con su nombre y la fecha de hoy.
2. Pide una cita de prueba: cada paso revela una foto de "tu tira" abajo, y al final se abre WhatsApp.
3. Precios con "Reservar" que salta directo a la cita con el servicio elegido.

## Lo que hay que confirmar con el salón

Todo está en `src/data/negocio.ts`:
- **WhatsApp**: ahora usa el 602 85 29 01 (es un móvil). Confirmar que tiene WhatsApp.
- **Horario**: el de su ficha de Fresha.
- **Servicios y precios**: de ejemplo ("desde"). Solo la keratina sale en su ficha.
- **Fotos**: de muestra (Unsplash, licencia libre). Para poner las suyas: guardarlas en `public/fotos/` y cambiar el enlace en `fotos` por `'/fotos/nombre.jpg'`.
- **Dominio**: `astro.config.mjs` (ahora sempredivas.es, provisional).
- La valoración (4,8, 173 reseñas) viene de PeluqueriaMaster (abril 2026); revisar.

Textos en `src/i18n/ui.ts` (español y catalán).

## SEO local incluido

Título y descripción por idioma, `hreflang` es/ca, datos estructurados `HairSalon` (dirección, teléfono, horario), `sitemap.xml` y `robots.txt`.

## Publicarla (gratis)

`npm run build` y subir la carpeta `dist/` a Netlify Drop, Vercel o Cloudflare Pages.

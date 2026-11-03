# Web de SempreDivas (demo)

Web de una sola página en Astro, en español (`/`) y catalán (`/ca/`). Estilo sacado del salón de verdad: rótulo negro con su logo caligráfico, oro, mármol, espejos ovalados y el papel pintado negro y dorado (ver `DESIGN.md` y las fotos de `referencias/`).

> ⚠️ **Antes de ofrecerla**: Google Maps marca el salón como **"Cerrado temporalmente"** (noviembre 2026). Confirmar que sigue abierto.

## Abrirla en tu PC

```bash
cd D:\Webs\sempredivas
npm install
npm run dev -- --port 4325
```

Abre http://localhost:4325 (catalán: http://localhost:4325/ca/). Versión final: `npm run build` y `npm run preview`.

## El argumento de venta

**SempreDivas no usa Fresha para reservar**. Su ficha de Fresha es automática y no reclamada: pone "Llamar para reservar", una foto genérica y debajo "reservar online en establecimientos cercanos", es decir, a quien la busca le enseña otras peluquerías. Su única web es un blog de Blogspot con una sola entrada.

Con su web:
1. Buscar "SempreDivas" lleva a su página, con su logo, sus fotos, su 4,8★ (188 reseñas), sus reseñas reales y su horario, incluido el domingo por la mañana.
2. La clienta pide cita sola: elige servicio, día y hora, pone su nombre, y se abre WhatsApp con el mensaje ya escrito:
   > Hola SempreDivas, soy Laura. Quiero cita para Lavar y cortar el jueves 5 nov a las 10:00. Mi móvil: 612345678.
3. Sin comisiones por clienta (lo que cobraría Fresha si se diera de alta con reservas).

## Enséñasela

1. Al abrirla, su logo se escribe solo y el espejo ovalado se enciende con su trabajo de trenzas con perlas. En el ordenador, mueve el ratón: el espejo se inclina y las plumas del papel pintado brillan en oro.
2. En Trabajos, arrastra la línea dorada del antes/después del color cobrizo, y toca cualquier foto para verla en grande en un espejo ovalado.
3. Su carta de servicios tal cual está en el escaparate, con los precios que ya enseña.
4. Pide una cita de prueba (cada paso hecho se marca con un check dorado): la tarjeta negra "Tu cita" se va rellenando y al final se abre WhatsApp.
5. Sus propias reseñas: el trato, el café, el masaje capilar.

## Lo que hay que confirmar con el salón

Todo está en `src/data/negocio.ts`:
- **¿Sigue abierto?** (ver aviso de arriba).
- **Permiso para usar sus fotos**: son las de su ficha de Google Maps (`referencias/`, optimizadas en `public/fotos/`). Pedirle permiso o que nos pase las suyas en mejor calidad.
- **WhatsApp**: usa el móvil 602 85 29 01. Confirmar que tiene WhatsApp. El fijo 931 06 07 75 sale en el pie.
- **Horario**: el sábado unas fichas dicen hasta las 20:00 y Fresha hasta las 17:00. Ahora pone 20:00.
- **Precios**: solo hay tres reales (los del escaparate: lavar y cortar 14,50 €, teñir y peinar 25 €, cejas con hilo 6 €). El resto sale como "Consultar".
- **Duraciones** de cada servicio: orientativas, solo sirven para calcular las horas libres.
- **Reseñas**: copiadas de esopiniones.com con el nombre de pila. La valoración (4,8, 188 reseñas) es de Google Maps; revisar al publicar.
- **Dominio**: `astro.config.mjs` (ahora sempredivas.es, provisional).

Textos en `src/i18n/ui.ts` (español y catalán).

## Fotos

- `referencias/`: las 9 fotos originales descargadas de Google Maps (fachada, interior y trabajos).
- `public/fotos/`: las mismas, optimizadas (`nombre.jpg` y `nombre-480.webp` / `nombre-900.webp`).
- Para cambiar una foto: sustituir los archivos en `public/fotos/` con el mismo nombre (o añadir uno nuevo en `fotos` de `negocio.ts`).

## SEO local incluido

Título y descripción por idioma, `hreflang` es/ca, datos estructurados `HairSalon` (dirección, teléfono, horario, Instagram), `sitemap.xml` y `robots.txt`.

## Publicarla (gratis)

`npm run build` y subir la carpeta `dist/` a Netlify Drop, Vercel o Cloudflare Pages.

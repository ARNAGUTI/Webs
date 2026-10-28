# Web de Milano Perruqueria

Web de una página en Astro, en español (`/`) y catalán (`/ca/`), con aviso legal y privacidad (`/legal/`, `/ca/legal/`). El análisis del negocio está en `ANALISIS.md`.

## Abrirla en tu PC

```bash
cd D:\Webs\milano-perruqueria\web-milano-perruqueria
npm install
npm run dev -- --port 4323
```

Abre http://localhost:4323 (catalán: http://localhost:4323/ca/). Versión final: `npm run build` y `npm run preview`.

## La idea

La web es su propio salón: arranca en su fachada (el rótulo negro con MILANO y el trazo rosa sobre la A, recreado en la web, y su escaparate iluminado) y sigue con sus espejos dorados y sus fotos reales (el local, el equipo, sus trabajos y sus productos INSIGHT). Habla en nombre del salón y de su equipo, no de una sola persona. Toques de peluquería discretos: tijeras bajo los títulos, púas de peine en las franjas negras y mechones dibujados al fondo.

## Lo que le vendes a Patri

**Pide tu cita** en cinco pasos, uno cada vez y a lo ancho (Siguiente / Atrás), para no tener que bajar:

1. **Servicio**: corte, color, tratamientos o niños, y el servicio con su precio "desde".
2. **Tu pelo**: liso, ondulado o rizado, y si está teñido, con canas, seco o fino.
3. **Largo**: por dónde lo lleva y por dónde lo quiere (de la nuca a la cintura). La web dice cuántos cm se cortan, avisa si pide un largo mayor del que tiene, y la clienta puede marcar que mandará foto de referencia. Esto ataca directamente la única queja reciente en Google (un corte más corto de lo pedido).
4. **Día y hora**: solo horas dentro del horario y sin pasarse del cierre según lo que dura el servicio.
5. **Datos**: nombre y móvil (se recuerdan en el móvil de la clienta).

Al enviar se abre WhatsApp con todo escrito:

> Hola, soy Laura. Quiero pedir cita en Milano para Corte y peinado el jueves 29 oct a las 11:00.
> Mi pelo: ondulado, teñido o con mechas.
> Ahora lo llevo por pecho y lo quiero por hombros.
> Te mando foto de referencia.
> Mi móvil: 612345678.

Si falta algo por marcar, el aviso rosa tiembla cada vez que se pulsa Siguiente. Además: si la clienta lo deja a medias, al volver se encuentra su cita como la dejó; botón "Añadir a mi calendario" con aviso 3 h antes; mapa que solo se carga al pulsar (sin cookies de Google antes); preguntas típicas de teléfono respondidas.

Límite honesto: la web no sabe qué horas tiene ya ocupadas; el salón confirma o propone otra. Si más adelante quiere agenda con huecos reales, se puede conectar Google Calendar como en la web de Johny García Barber.

## Enséñasela a Patri

1. En el móvil: su rótulo con el trazo rosa pintándose al cargar, su escaparate, el cartel ABIERTO/CERRADO que cambia solo según la hora y el 5,0★ con 282 reseñas.
2. Pulsa "Pide cita" y haz una cita de prueba hasta que se abra WhatsApp con el mensaje escrito. Mientras `whatsapp` esté vacío en `negocio.ts`, WhatsApp deja elegir a quién mandarlo (te lo puedes mandar a ti).
3. El argumento: hoy, quien la busca acaba en una ficha automática de Fresha que ella no controla, con "Llamar para reservar" y "Reservar online en establecimientos cercanos" (otros salones). Con su web la cita le llega directa y mejor explicada, sin comisiones.

## Lo que hay que confirmar con Patri

Todo está en `src/data/negocio.ts`:
- **WhatsApp** del salón (ahora vacío).
- **Horario**: el del cartel de su puerta (mar–vie 9:30–19:30, sáb 9–14). Google y Fresha dicen 10–19.
- **Servicios y precios**: los precios son de ejemplo ("desde").
- **Fotos**: son las de su ficha de Google Maps (fachada, interior, Patri, trabajos, productos), ver `src/assets/img/PROCEDENCIA.txt`. Confirmar que se pueden usar; si quiere otras, se cambian con el mismo nombre.
- **Productos**: el taco de productos muestra los 9 INSIGHT que se ven en su estantería (cada carta es un recorte de `productos.jpg`; la lista y los recortes están al principio de `src/components/Home.astro`, en `productos`). Confirmar qué vende y, si tiene fotos de cada producto, se cambian por ellas.
- **Instagram**: una de sus fotos viene de Instagram; si tiene cuenta, se añade el enlace.
- **Aviso legal**: titular, NIF y email en `src/components/Legal.astro` (marcados con [ ]).
- **Dominio**: `astro.config.mjs` (ahora milanoperruqueria.com, provisional).
- La valoración (5,0, 282 reseñas) es de Google Maps a 28/10/2026.

Textos en `src/i18n/ui.ts` (español y catalán). Las opiniones se citan en su idioma original.

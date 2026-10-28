# Web de Milano Perruqueria

Web de una página en Astro, en español (`/`) y catalán (`/ca/`), con aviso legal y privacidad (`/legal/`, `/ca/legal/`). El análisis del negocio está en `ANALISIS.md`.

## Abrirla en tu PC

```bash
cd D:\Webs\milano-perruqueria\web-milano-perruqueria
npm install
npm run dev -- --port 4323
```

Abre http://localhost:4323 (catalán: http://localhost:4323/ca/). Versión final: `npm run build` y `npm run preview`.

## Lo que le vendes a Patri

**Planifica tu visita**: un trayecto de cinco paradas, como una línea de metro.

1. **Destino**: corte, color, tratamientos o niños, y el servicio con su precio "desde".
2. **Tu pelo**: liso, ondulado o rizado, y si está teñido, con canas, seco o fino.
3. **Largo**: por dónde lo lleva y por dónde lo quiere (de la nuca a la cintura). La web dice cuántos cm se cortan, avisa si pide un largo mayor del que tiene, y la clienta puede marcar que mandará foto de referencia. Esto ataca directamente la única queja reciente en Google (un corte más corto de lo pedido).
4. **Día y hora**: solo horas dentro del horario y sin pasarse del cierre según lo que dura el servicio.
5. **Datos**: nombre y móvil (se recuerdan en el móvil de la clienta).

Al enviar se abre WhatsApp con todo escrito:

> Hola Patri, soy Laura. Quiero cita para Corte y peinado el jueves 29 oct a las 11:00.
> Mi pelo: ondulado, teñido o con mechas.
> Ahora lo llevo por pecho y lo quiero por hombros.
> Te mando foto de referencia.
> Mi móvil: 612345678.

Además: si la clienta lo deja a medias, al volver se encuentra su trayecto guardado con una banderita "Lo dejaste aquí"; botón "Añadir a mi calendario" con aviso 3 h antes; mapa que solo se carga al pulsar (sin cookies de Google antes); preguntas típicas de teléfono respondidas.

Límite honesto: la web no sabe qué horas tiene ya ocupadas; Patri confirma o propone otra. Si más adelante quiere agenda con huecos reales, se puede conectar Google Calendar como en la web de Johny García Barber.

## Enséñasela a Patri

1. En el móvil: la banda roja con "Milano", el letrero ABIERTO/CERRADO que cambia solo según la hora y el 5,0★ con 282 reseñas.
2. Pulsa "Corte y peinado" y haz una cita de prueba hasta que se abra WhatsApp con el mensaje escrito. Mientras `whatsapp` esté vacío en `negocio.ts`, WhatsApp deja elegir a quién mandarlo (te lo puedes mandar a ti).
3. El argumento: hoy, quien la busca acaba en una ficha automática de Fresha que ella no controla, con "Llamar para reservar" y "Reservar online en establecimientos cercanos" (otros salones). Con su web la cita le llega directa y mejor explicada, sin comisiones.

## Lo que hay que confirmar con Patri

Todo está en `src/data/negocio.ts`:
- **WhatsApp** del salón (ahora vacío).
- **Horario**: el de Google y Fresha (mar–vie 10–19, sáb 9–14). Un directorio dice 9:30–19:30.
- **Servicios y precios**: los precios son de ejemplo ("desde").
- **Fotos**: de muestra (Unsplash) en `src/assets/img/`, ver `PROCEDENCIA.txt`. Sustituir por fotos reales con el mismo nombre.
- **Aviso legal**: titular, NIF y email en `src/components/Legal.astro` (marcados con [ ]).
- **Dominio**: `astro.config.mjs` (ahora milanoperruqueria.com, provisional).
- La valoración (5,0, 282 reseñas) es de Google Maps a 28/10/2026.

Textos en `src/i18n/ui.ts` (español y catalán). Las opiniones se citan en su idioma original.

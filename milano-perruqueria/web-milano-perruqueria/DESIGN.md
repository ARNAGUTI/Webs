# Design · Milano Perruqueria

Mundo: **su propio salón**. La web arranca en su fachada (el rótulo negro iluminado por cuatro focos, el escaparate con perfiles negros y el zócalo de piedra) y entra al local: paredes blancas, espejos dorados, suelo de roble.

## Color
- Negro del rótulo `--negro #141414`: cabecera, fachada, carta de servicios, pie.
- Pared `--pared #f7f6f3` y blanco `--blanco`; tinta `--ink #1b1a19`, `--ink-2 #4b4845`, `--ink-3 #76716b`; reglas `--rule #e3dfd9`, `--rule-2 #cfc9c1`.
- Rosa del trazo del rótulo: `--rosa-luz #e39cc4` (el trazo, sobre negro), `--rosa #b8457f` (botones y selección, blanco encima con contraste 7:1), `--rosa-hondo #96336a` (hover, errores), `--rosa-velo #f7e9f0` (fondo de selección).
- Oro de los espejos: `--oro #b08636`, `--oro-luz #d9b66c`. Solo filetes, estrellas, títulos de la carta y marcos de foto.
- Roble: `--roble-velo #f2eadf`, fondo de la sección de productos.

## Tipografía
- Logo: Montserrat 700 con el trazo rosa en SVG sobre la A (componente `Logo.astro`), "PERRUQUERIA" en Cinzel con tracking 0.62em, como el rótulo real.
- Titulares: Cinzel 600. Texto e interfaz: Montserrat Variable 450–700. Ambas autoalojadas con @fontsource.

## Componentes
- Fachada: rótulo + escaparate en rejilla puerta (panel negro con estado abierto/cerrado, lema, botones, horario, valoración) / cristal (foto real del interior con reflejo diagonal) + zócalo.
- Marco: foto con fondo blanco de 10px, filete dorado exterior y filete dorado claro interior.
- Botones rectangulares radio 4px: rosa (principal), contorno blanco sobre negro, contorno tinta sobre claro. Chips en píldora.
- Pasos de la cita: números en círculo; el trazo rosa avanza bajo ellos hasta el primer paso pendiente.
- Ficha de clienta con cabecera negra y el logo.
- Carta de servicios sobre negro con títulos dorados y puntos guía hasta el precio.

## Movimiento
- Un momento: al cargar se enciende la luz del rótulo, las letras se enfocan y el trazo rosa se pinta de abajo arriba; después aparece PERRUQUERIA. Todo desactivado con reduced-motion.

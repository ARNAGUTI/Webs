# Design · Milano Perruqueria

Mundo: **señalética de andén del metro de Milán** (banda roja continua, nombres en blanco, líneas de color). La visita al salón es un trayecto con paradas.

## Color
- Fondo piedra gris fría `--stone #e3e6e5` (y `--stone-2 #d4d8d7` para raíles vacíos); paneles de esmalte `--enamel #fbfcfb`; tinta `--ink #17191b`, `--ink-2 #41474b`, `--ink-3 #6a7175`; reglas `--rule #b9bfbe`.
- Banda roja `--red #d3202f` (canto `--red-deep #a9131f`): nombre de la marca, cabecera y pie, acción principal y progreso del trayecto.
- Ley de color por línea de servicio, sin otros usos: corte `--l-corte` (rojo), color `--l-color #12814a`, tratamientos `--l-trat #f0b400` (número en tinta, nunca blanco), niños `--l-inf #7d55c7`. El lila de la L2 real solo en la etiqueta "L2".

## Tipografía
- Una sola familia: Hanken Grotesk Variable (autoalojada, @fontsource). Titulares 800 con tracking -0.03/-0.045em; nombre "Milano" a 5.2–11.5rem, line-height 0.82. Texto 17px, cifras tabulares.

## Componentes
- `line-badge`: cuadrado 44px radio 4px con el número de línea.
- Paradas: aro (pendiente), disco lleno rojo (hecha), banderita negra "Lo dejaste aquí" (trayecto guardado). El estado es una marca, no solo un color.
- Paneles de esmalte con banda superior (6px estaciones, 10px ficha) y esquinas superiores rectas.
- Botones rectangulares radio 6px: primario rojo, secundario esmalte con borde tinta. Chips de 46px mínimo.
- Carteles de foto: esmalte con marco de 8–10px y sombra suave con desplazamiento.

## Movimiento
- Un momento: el nombre se descubre de izquierda a derecha (clip-path) y el cartel sube. El tren del trayecto avanza (ancho de la línea roja) hasta la primera parada pendiente. Todo desactivado con reduced-motion.

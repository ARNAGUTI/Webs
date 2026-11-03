# Design · SempreDivas

Mundo: **el propio salón de Av. Bufalà 21**, sacado de sus fotos reales (carpeta `referencias/`). Glam de barrio: negro, blanco y oro, mármol y letra caligráfica. Sustituye al antiguo mundo "fotomatón" (ciruela y terciopelo), que no tenía nada que ver con la tienda.

- **Rótulo negro carbón** (`--char #2c2b29`, `--char-2`, `--char-3`) con letra blanca (`--on-char #f4f1ec`): portada, cabecera, pared de Trabajos, tarjeta "Tu cita" y pie.
- **Oro del logo de la pared** (`--gold #c9a463`, `--gold-hi`, `--gold-deep #85652f` para texto sobre claro): botón principal, versalitas, adornos, foco.
- **Blanco y mármol** (`--white #fdfcfa`, `--marble #f3f1ed`, `--marble-2 #e8e4de`): secciones de lectura. La "carta" de precios va en el gris del vinilo del escaparate.
- **Papel pintado de plumas negro y oro**: patrón SVG (`--feather`) a baja opacidad en portada, Trabajos y pie.
- **Espejo ovalado de marco blanco**: la foto principal de la portada y una de la galería; el medallón ovalado del rótulo, en pequeño.
- **Adorno del vinilo**: filete fino con un rombo (`.orn`).
- Tipos (autoalojados con @fontsource): **Dancing Script** solo para el logotipo "Sempre Divas"; **Cormorant SC** para las versalitas tipo "PERRUQUERIA & ESTÈTICA" y etiquetas; **Cormorant** para titulares y citas; **Hanken Grotesk** para el texto. Cifras siempre alineadas (Cormorant trae cifras antiguas).
- Momento animado único: al cargar, el espejo "se enciende" (luz dorada detrás y la foto se aclara); el medallón sube después. Sin animación con reduced-motion.
- Botones en píldora; tarjetas de formulario con radio 16px y filete fino; sombras con desplazamiento y desenfoque.

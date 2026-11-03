// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Dominio provisional: cambiarlo por el definitivo antes de publicar.
  site: 'https://www.sempredivas.es',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'ca'],
    routing: { prefixDefaultLocale: false },
  },
});

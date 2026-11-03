# Cuaderno de Webs

App para el móvil y el PC que lleva la actividad de webs: clientes y su estado, cobros y gastos (con foto del ticket), lo que hay que apartar para Hacienda, calendario fiscal propio y un asistente con Claude.

Es una web instalable (PWA): se añade a la pantalla de inicio del iPhone o se instala en Chrome/Edge del PC, se abre a pantalla completa y funciona sin conexión.

## Archivos

| Archivo | Para qué |
| --- | --- |
| `index.html` | La app: pantallas, cálculos de IVA/IRPF y calendario fiscal |
| `store.js` | Dónde se guardan los datos: Supabase (nube) o el propio dispositivo (modo prueba) |
| `config.js` | URL y clave pública de Supabase. Vacío = modo prueba |
| `sw.js`, `manifest.webmanifest`, `icons/` | Lo que la hace instalable y que abra sin conexión |
| `supabase/esquema.sql` | Tablas y permisos de la base de datos. Se pega una vez en Supabase |

## Puesta en marcha

1. **Supabase** (gratis): crea el proyecto `cuaderno-webs` en región West EU. En *SQL Editor* pega `supabase/esquema.sql` y pulsa *Run*.
2. En *Project Settings → API* copia la *Project URL* y la clave *anon public* en `config.js`.
3. **Netlify** (gratis): *Add new site → Import an existing project → GitHub → Webs*. En *Base directory* pon `cuaderno-webs`, deja vacío el comando de build y publica.
4. Abre la web, pulsa **Crear mi cuenta** con tu email y confirma el email.
5. Cuando ya tengas tu cuenta, en Supabase ve a *Authentication → Sign In / Providers* y desactiva *Allow new users to sign up*, para que nadie más pueda registrarse.
6. Para pasar los datos de antes: *Ajustes → Cargar copia* con el archivo JSON.

## Instalarla

- **iPhone:** abre la web en Safari → botón Compartir → *Añadir a pantalla de inicio*.
- **PC:** en Chrome, icono de instalar en la barra de direcciones (o menú ⋮ → *Enviar, guardar y compartir → Instalar página como aplicación*). En Edge, menú ⋯ → *Aplicaciones → Instalar este sitio como aplicación*.

## Asistente

Usa la API de Claude con tu propia clave (`console.anthropic.com` → *API keys*), que se guarda solo en el dispositivo desde *Ajustes*. Se paga por uso, unos céntimos por pregunta. Sin clave, el resto de la app funciona igual.

## Impuestos

Las cifras son estimaciones: IRPF con la escala de Cataluña (Estado + Generalitat) sumando el beneficio del estanco, IVA del trimestre (cobrado menos el de los gastos) y modelo 130 si menos del 70 % de lo facturado lleva retención. El gestor presenta los modelos y tiene la cifra exacta.

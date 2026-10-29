type Tramos = [string, string][];
type Ruta = typeof import('../i18n/ui').ui.es.ruta;
interface Cliente {
  lang: 'es' | 'ca';
  horario: Record<string, Tramos>;
  whatsapp: string;
  servicios: { id: string; linea: string; min: number; desde: number; nombre: string }[];
  lineas: { id: string; num: number; nombre: string }[];
  largos: { id: string; cm: number; nombre: string }[];
  negocio: { nombre: string; direccion: string };
  t: {
    dias: string[]; diasCortos: string[]; meses: string[]; hoy: string; manana: string;
    ruta: Ruta; hero: { abierto: string; cerrado: string }; desde: string; gratis: string;
    visita: { abierto: string; cierraA: string; ahoraCerrado: string; abreHoy: string; abreManana: string; abreEl: string; aLas: string };
  };
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w)\}/g, (_, k) => String(vars[k] ?? ''));
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const go = (el: Element | null, block: ScrollLogicalPosition = 'start') => el?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block });
const CLIENTE = 'milano-cliente';
const TRAYECTO = 'milano-trayecto';

// Hora actual en Badalona, sea cual sea la zona del visitante.
function nowMadrid() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (k: string) => Number(parts.find((p) => p.type === k)?.value);
  const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
  return { date, minutes: get('hour') * 60 + get('minute') };
}
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function leer<T>(k: string): T | null {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function guardar(k: string, v: unknown) {
  try { v ? localStorage.setItem(k, JSON.stringify(v)) : localStorage.removeItem(k); } catch { /* sin almacenamiento */ }
}

export function init() {
  const root = $('#app');
  if (!root) return;
  const c: Cliente = JSON.parse(root.dataset.cliente!);
  const t = c.t;
  const r = t.ruta;
  const now = nowMadrid();
  const SLOT = 30;
  const tramosDe = (d: Date): Tramos => c.horario[String(d.getUTCDay())] ?? [];

  // ---------- Cabecera y barra móvil ----------
  const top = $('[data-top]')!;
  const dock = $('.dock');
  const hero = $('.fachada')!;
  const ruta = $('#cita')!;
  let rutaVisible = false;
  const onScroll = () => {
    top.classList.toggle('is-solid', window.scrollY > 24);
    dock?.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6 && !rutaVisible);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { rutaVisible = en.isIntersecting; onScroll(); }, { rootMargin: '-30% 0px -30% 0px' }).observe(ruta);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // El cambio de idioma conserva la sección en la que estás.
  $$<HTMLAnchorElement>('[data-lang]').forEach((a) =>
    a.addEventListener('click', () => { if (location.hash) a.href = a.pathname + location.hash; }),
  );

  // ---------- Abierto / cerrado ----------
  function estado() {
    const tramos = tramosDe(now.date);
    const abierto = tramos.find(([a, b]) => now.minutes >= toMin(a) && now.minutes < toMin(b));
    if (abierto) return { open: true, label: t.visita.abierto, detail: `${t.visita.cierraA} ${abierto[1]}` };
    const luego = tramos.find(([a]) => toMin(a) > now.minutes);
    if (luego) return { open: false, label: t.visita.ahoraCerrado, detail: `${t.visita.abreHoy} ${luego[0]}` };
    for (let i = 1; i <= 7; i++) {
      const d = addDays(now.date, i);
      const tr = tramosDe(d);
      if (!tr.length) continue;
      const cuando = i === 1 ? t.visita.abreManana : `${t.visita.abreEl} ${t.dias[d.getUTCDay()]} ${t.visita.aLas}`;
      return { open: false, label: t.visita.ahoraCerrado, detail: `${cuando} ${tr[0][0]}` };
    }
    return { open: false, label: t.visita.ahoraCerrado, detail: '' };
  }
  const e = estado();
  const sign = $('[data-open]');
  if (sign) {
    sign.classList.toggle('is-open', e.open);
    $('[data-open-word]', sign)!.textContent = e.open ? t.hero.abierto : t.hero.cerrado;
    $('[data-status]', sign)!.textContent = e.detail;
  }
  const line = $('[data-status-line]');
  if (line) { line.textContent = [e.label, e.detail].filter(Boolean).join(' · '); line.classList.toggle('is-open', e.open); }
  $(`.hours tr[data-day="${now.date.getUTCDay()}"]`)?.classList.add('is-today');

  // ---------- Mapa: solo se carga si lo pides (sin cookies de Google antes) ----------
  const mapbox = $('[data-mapbox]');
  $('[data-map-load]', mapbox ?? document)?.addEventListener('click', () => {
    if (!mapbox) return;
    const f = document.createElement('iframe');
    f.src = mapbox.dataset.src!;
    f.title = mapbox.dataset.title!;
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    mapbox.replaceChildren(f);
    mapbox.classList.add('is-loaded');
  });

  initFondo();
  initCinta();
  initTaco();
  initRuta(c, now, tramosDe, SLOT);
}

function initRuta(c: Cliente, now: ReturnType<typeof nowMadrid>, tramosDe: (d: Date) => Tramos, SLOT: number) {
  const t = c.t;
  const r = t.ruta;
  const form = $<HTMLFormElement>('[data-ruta]');
  if (!form) return;
  const daysBox = $('[data-days]', form)!;
  const slotsBox = $('[data-slots]', form)!;
  const okBox = $('[data-ok]')!;
  const hola = $('[data-hola]', form)!;
  const map = $('[data-map]')!;
  const resume = $('[data-resume]');

  const duracion = (id: string | null) => c.servicios.find((s) => s.id === id)?.min ?? SLOT;
  // Huecos de 30 min; el servicio tiene que acabar antes del cierre; hoy, con una hora de margen.
  function horas(d: Date, servicio: string | null) {
    const dur = duracion(servicio);
    const hoy = isoDay(d) === isoDay(now.date);
    const out: { hora: string; libre: boolean }[] = [];
    for (const [a, b] of tramosDe(d)) {
      for (let m = toMin(a); m + SLOT <= toMin(b); m += SLOT) {
        out.push({ hora: toHHMM(m), libre: !(hoy && m < now.minutes + 60) && m + dur <= toMin(b) });
      }
    }
    return out;
  }
  const dias: Date[] = [];
  for (let i = 0; dias.length < 12 && i < 30; i++) {
    const d = addDays(now.date, i);
    if (!tramosDe(d).length) continue;
    if (i === 0 && !horas(d, null).some((h) => h.libre)) continue;
    dias.push(d);
  }
  const etiquetaDia = (d: Date) => {
    const diff = Math.round((d.getTime() - now.date.getTime()) / 86400000);
    return diff === 0 ? t.hoy : diff === 1 ? t.manana : t.diasCortos[d.getUTCDay()];
  };
  const fechaLarga = (d: Date) => `${t.dias[d.getUTCDay()]} ${d.getUTCDate()} ${t.meses[d.getUTCMonth()]}`;

  daysBox.innerHTML = dias.map((d) => `
    <label class="chip chip-day"><input type="radio" name="dia" value="${isoDay(d)}" />
      <span><small>${etiquetaDia(d)}</small><b>${d.getUTCDate()}</b><small>${t.meses[d.getUTCMonth()]}</small></span></label>`).join('');

  const campo = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const val = (name: string) => (form.elements.namedItem(name) as RadioNodeList | HTMLInputElement | null)?.value || '';
  const checks = (name: string) => $$<HTMLInputElement>(`input[name="${name}"]:checked`, form).map((i) => i.value);
  const lineaSel = () => val('linea');
  const servicioSel = () => c.servicios.find((s) => s.id === val('servicio')) ?? null;
  const diaSel = () => dias.find((d) => isoDay(d) === val('dia')) ?? null;
  const idxLargo = (id: string) => c.largos.findIndex((l) => l.id === id);
  const largoNombre = (id: string) => c.largos.find((l) => l.id === id)?.nombre.toLowerCase() ?? '';
  // El largo solo importa cuando hay tijera de por medio.
  const pideLargo = () => lineaSel() === 'corte';

  // ---------- Línea elegida: filtra servicios y pinta la ficha de su color ----------
  function pintarLinea() {
    const l = lineaSel();
    $$<HTMLLabelElement>('.svc', form).forEach((s) => {
      const visible = !l || s.dataset.linea === l;
      s.hidden = !visible;
      if (!visible) { const i = $<HTMLInputElement>('input', s)!; if (i.checked) i.checked = false; }
    });
    // Una línea con un solo servicio lo deja elegido.
    const vis = $$<HTMLInputElement>('.svc:not([hidden]) input', form);
    if (l && vis.length === 1) vis[0].checked = true;
    const na = !pideLargo() && !!l;
    $('[data-largo-na]', form)!.hidden = !na;
    $('[data-largo]', form)!.classList.toggle('is-optional', na);
  }

  function pintarHoras() {
    const d = diaSel();
    const prev = val('hora');
    if (!d) { slotsBox.innerHTML = `<p class="hint">${r.hora.eligeDia}</p>`; return; }
    const hs = horas(d, servicioSel()?.id ?? null);
    if (!hs.some((h) => h.libre)) { slotsBox.innerHTML = `<p class="hint">${r.hora.sinHoras}</p>`; return; }
    slotsBox.innerHTML = hs.map((h) => `
      <label class="chip chip-slot"><input type="radio" name="hora" value="${h.hora}" ${h.libre ? '' : 'disabled'} ${h.libre && h.hora === prev ? 'checked' : ''} />
        <span>${h.hora}</span></label>`).join('');
  }

  const telLimpio = (v: string) => v.replace(/[\s.()-]/g, '').replace(/^(\+34|0034)/, '');
  const telOk = (v: string) => /^[6789]\d{8}$/.test(telLimpio(v));

  function largoTexto() {
    const a = val('ahora');
    const q = val('quiero');
    if (!a || !q) return '';
    const ia = idxLargo(a);
    const iq = idxLargo(q);
    if (iq > ia) return r.errores.alargar;
    if (iq === ia) return r.largo.igual;
    return fill(r.largo.cortar, { x: c.largos[ia].cm - c.largos[iq].cm });
  }
  const largoOk = () => {
    if (!pideLargo()) return true;
    const a = val('ahora');
    const q = val('quiero');
    return !!a && !!q && idxLargo(q) <= idxLargo(a);
  };
  const peloTexto = () => {
    const tipo = val('pelo');
    const partes = [tipo && tipo !== 'nose' ? (r.pelo.tipos as Record<string, string>)[tipo] : '', ...checks('estado').map((k) => (r.pelo.estados as Record<string, string>)[k])]
      .filter(Boolean).map((x, i) => (i ? x.toLowerCase() : x));
    return partes.join(', ');
  };

  const completo = () => ({
    destino: !!servicioSel(),
    pelo: !!val('pelo'),
    largo: !!lineaSel() && largoOk(),
    hora: !!diaSel() && !!val('hora'),
    datos: !!val('nombre').trim() && telOk(val('tel')),
  });

  // ---------- Mapa de la ruta: paradas hechas, tren y banderita ----------
  function actualizar() {
    const done = completo();
    const keys = Object.keys(done) as (keyof typeof done)[];
    keys.forEach((k) => {
      $(`[data-station="${k}"]`, form)?.classList.toggle('is-done', done[k]);
      $(`[data-stop="${k}"]`, map)?.classList.toggle('is-done', done[k]);
    });
    // La línea roja avanza hasta la primera parada pendiente, como un tren.
    const hasta = keys.findIndex((k) => !done[k]);
    map.parentElement!.style.setProperty('--progress', String((hasta < 0 ? keys.length - 1 : Math.max(0, hasta - 1)) / (keys.length - 1)));
    const s = servicioSel();
    const l = c.lineas.find((x) => x.id === (s?.linea ?? lineaSel()));
    const ficha = $('[data-ficha]')!;
    $('[data-ficha-badge]', ficha)!.textContent = l ? l.nombre : '';
    $('[data-ficha-svc]', ficha)!.textContent = s ? s.nombre : r.fichaVacia;
    $('[data-f="pelo"]', ficha)!.textContent = peloTexto() || '—';
    const lt = largoTexto();
    $('[data-f="largo"]', ficha)!.textContent = !pideLargo() ? '—' : val('ahora') && val('quiero') ? `${largoNombre(val('ahora'))} → ${largoNombre(val('quiero'))}` : '—';
    const d = diaSel();
    $('[data-f="hora"]', ficha)!.textContent = d && val('hora') ? `${fechaLarga(d)}, ${val('hora')}` : d ? fechaLarga(d) : '—';
    $('[data-f="precio"]', ficha)!.textContent = s ? (s.desde ? fill(t.desde, { p: s.desde }) : t.gratis) : '—';
    ficha.classList.toggle('is-ready', keys.every((k) => done[k]));
    const msg = $('[data-largo-msg]', form)!;
    msg.textContent = pideLargo() ? lt : '';
    msg.classList.toggle('is-bad', lt === r.errores.alargar);
    // Marca la fila del largo actual y del deseado en la línea vertical.
    const ia = idxLargo(val('ahora'));
    const iq = idxLargo(val('quiero'));
    $$('[data-largo-row]', form).forEach((row, i) => {
      row.classList.toggle('is-now', i === ia);
      row.classList.toggle('is-want', i === iq);
      row.classList.toggle('is-cut', ia >= 0 && iq >= 0 && iq < ia && i > iq && i <= ia);
    });
  }

  // El aviso tiembla cada vez que se intenta seguir sin completar: así se lee.
  function sacudir(k: string) {
    const el = $(`[data-err="${k}"]`, form);
    if (!el || !el.textContent) return;
    el.classList.remove('is-shake');
    void el.offsetWidth;
    el.classList.add('is-shake');
    const r = el.getBoundingClientRect();
    if (r.bottom > innerHeight - 90 || r.top < 120) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  }
  function setErr(k: string, msg: string) {
    const el = $(`[data-err="${k}"]`, form);
    if (el) el.textContent = msg;
    const input = form.elements.namedItem(k);
    if (input instanceof HTMLInputElement) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  // ---------- Trayecto guardado: vuelves y sigue donde lo dejaste ----------
  const camposTrayecto = ['linea', 'servicio', 'pelo', 'ahora', 'quiero', 'dia', 'hora', 'nota'];
  function guardarTrayecto() {
    const datos: Record<string, string | string[] | boolean> = {};
    camposTrayecto.forEach((k) => { const v = val(k); if (v) datos[k] = v; });
    const est = checks('estado');
    if (est.length) datos.estado = est;
    if (campo('foto').checked) datos.foto = true;
    guardar(TRAYECTO, Object.keys(datos).length ? datos : null);
  }
  function marcar(name: string, value: string) {
    const i = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${CSS.escape(value)}"]`);
    if (i && !i.disabled) i.checked = true;
  }
  function restaurar() {
    const g = leer<Record<string, string | string[] | boolean>>(TRAYECTO);
    if (!g) return false;
    if (typeof g.linea === 'string') { marcar('linea', g.linea); pintarLinea(); }
    (['servicio', 'pelo', 'ahora', 'quiero', 'dia'] as const).forEach((k) => typeof g[k] === 'string' && marcar(k, g[k] as string));
    if (Array.isArray(g.estado)) g.estado.forEach((v) => marcar('estado', v));
    if (g.foto) campo('foto').checked = true;
    if (typeof g.nota === 'string') campo('nota').value = g.nota;
    pintarHoras();
    if (typeof g.hora === 'string') marcar('hora', g.hora);
    return true;
  }
  function banderita() {
    const done = completo();
    const pendiente = (Object.keys(done) as (keyof typeof done)[]).find((k) => !done[k]);
    $$('[data-stop]', map).forEach((li) => li.classList.toggle('is-flag', li.dataset.stop === pendiente));
  }
  function quitarBanderita() {
    $$('[data-stop]', map).forEach((li) => li.classList.remove('is-flag'));
    if (resume) resume.hidden = true;
  }

  // Cliente que vuelve: sus datos ya están puestos.
  function saludo() {
    const g = leer<{ n: string; tel: string }>(CLIENTE);
    if (g?.n) {
      campo('nombre').value = g.n;
      campo('tel').value = g.tel;
      $('[data-hola-text]', hola)!.textContent = fill(r.datos.hola, { n: g.n });
      hola.hidden = false;
    } else hola.hidden = true;
  }
  $('[data-olvidar]', form)?.addEventListener('click', () => {
    guardar(CLIENTE, null);
    campo('nombre').value = '';
    campo('tel').value = '';
    hola.hidden = true;
    actualizar();
    campo('nombre').focus();
  });

  function reiniciar() {
    form.reset();
    guardar(TRAYECTO, null);
    pintarLinea();
    pintarHoras();
    saludo();
    quitarBanderita();
    actualizar();
  }
  $('[data-empezar]')?.addEventListener('click', () => { reiniciar(); mostrar(0); });

  // ---------- Un paso cada vez, a lo ancho ----------
  const pasos = ['destino', 'pelo', 'largo', 'hora', 'datos'] as const;
  const estacionesEl = pasos.map((p) => $(`[data-station="${p}"]`, form)!);
  const btnSig = $<HTMLButtonElement>('[data-sig]', form)!;
  const btnAtras = $<HTMLButtonElement>('[data-atras]', form)!;
  const cuenta = $('[data-cuenta]', form)!;
  const pasosNav = map.closest('nav')!;
  let actual = 0;
  form.classList.add('is-wizard');
  estacionesEl.forEach((st) => st.setAttribute('tabindex', '-1'));

  function mostrar(i: number, foco = true) {
    actual = Math.max(0, Math.min(pasos.length - 1, i));
    estacionesEl.forEach((st, k) => st.classList.toggle('is-active', k === actual));
    $$('[data-stop]', map).forEach((li, k) => {
      li.classList.toggle('is-current', k === actual);
      li.querySelector('a')?.setAttribute('aria-current', k === actual ? 'step' : 'false');
    });
    btnAtras.style.visibility = actual === 0 ? 'hidden' : 'visible';
    btnSig.hidden = actual === pasos.length - 1;
    cuenta.textContent = fill(r.pasoNav.de, { n: actual + 1 });
    if (!foco) return;
    // Si el panel ha quedado fuera de la vista, se vuelve a los pasos.
    const top = form.getBoundingClientRect().top;
    if (top < 60 || top > innerHeight * 0.7) go(pasosNav);
    estacionesEl[actual].focus({ preventScroll: true });
  }
  // El largo solo se pregunta si hay corte; si no, se salta ese paso.
  const salto = (desde: number, dir: 1 | -1) => {
    const k = desde + dir;
    return pasos[k] === 'largo' && !pideLargo() ? k + dir : k;
  };
  function errorDelPaso(k: number): [string, string] | null {
    const p = pasos[k];
    if (p === 'destino' && !servicioSel()) return ['servicio', r.errores.servicio];
    if (p === 'pelo' && !val('pelo')) return ['pelo', r.errores.pelo];
    if (p === 'largo' && pideLargo()) {
      if (!val('ahora') || !val('quiero')) return ['largo', r.errores.largo];
      if (!largoOk()) return ['largo', r.errores.alargar];
    }
    if (p === 'hora' && !diaSel()) return ['dia', r.errores.dia];
    if (p === 'hora' && !val('hora')) return ['hora', r.errores.hora];
    return null;
  }
  function siguiente() {
    const e = errorDelPaso(actual);
    if (e) { setErr(e[0], e[1]); sacudir(e[0]); return; }
    mostrar(salto(actual, 1));
  }
  btnSig.addEventListener('click', siguiente);
  btnAtras.addEventListener('click', () => mostrar(salto(actual, -1)));
  $$<HTMLAnchorElement>('a', map).forEach((a, k) => a.addEventListener('click', (ev) => { ev.preventDefault(); mostrar(k); }));

  form.addEventListener('change', (ev) => {
    const name = (ev.target as HTMLInputElement).name;
    if (name === 'linea') pintarLinea();
    if (name === 'dia' || name === 'servicio' || name === 'linea') pintarHoras();
    if (name === 'ahora' || name === 'quiero') setErr('largo', '');
    if (name === 'servicio' || name === 'linea') setErr('servicio', '');
    if (name) setErr(name, '');
    quitarBanderita();
    actualizar();
    guardarTrayecto();
    // Elegir servicio u hora cierra el paso: se pasa solo al siguiente.
    if (name === 'servicio' && servicioSel()) setTimeout(() => siguiente(), 260);
    if (name === 'hora' && val('hora')) setTimeout(() => siguiente(), 260);
  });
  form.addEventListener('input', (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'nombre' && el.value.trim()) setErr('nombre', '');
    if (el.name === 'tel' && telOk(el.value)) setErr('tel', '');
    if (el.name === 'nota') guardarTrayecto();
    actualizar();
  });

  let ultima: { s: string; d: Date; h: string; min: number; url: string } | null = null;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const s = servicioSel();
    const d = diaSel();
    const h = val('hora');
    const n = val('nombre').trim();
    const tel = val('tel').trim();
    const nota = val('nota').trim();
    const errs: [string, string][] = [];
    if (!s) errs.push(['servicio', r.errores.servicio]);
    if (!val('pelo')) errs.push(['pelo', r.errores.pelo]);
    if (pideLargo() && (!val('ahora') || !val('quiero'))) errs.push(['largo', r.errores.largo]);
    else if (!largoOk()) errs.push(['largo', r.errores.alargar]);
    if (!d) errs.push(['dia', r.errores.dia]);
    else if (!h) errs.push(['hora', r.errores.hora]);
    if (!n) errs.push(['nombre', r.errores.nombre]);
    if (!telOk(tel)) errs.push(['tel', r.errores.tel]);
    ['servicio', 'pelo', 'largo', 'dia', 'hora', 'nombre', 'tel'].forEach((k) => setErr(k, ''));
    errs.forEach(([k, m]) => setErr(k, m));
    if (errs.length) {
      const first = errs[0][0];
      const errEl = $(`[data-err="${first}"]`, form);
      const station = errEl?.closest('.station');
      const target = form.querySelector<HTMLElement>(`[name="${first}"]:not(:disabled)`) ?? station?.querySelector<HTMLElement>('input:not(:disabled)');
      const k = pasos.findIndex((p) => station?.getAttribute('data-station') === p);
      if (k >= 0) mostrar(k);
      target?.focus({ preventScroll: true });
      sacudir(first);
      return;
    }
    guardar(CLIENTE, campo('recordar').checked ? { n, tel } : null);
    const partes = [fill(r.msg.hola, { n, s: s!.nombre, d: fechaLarga(d!), h })];
    const pelo = peloTexto();
    if (pelo) partes.push(fill(r.msg.pelo, { x: pelo.toLowerCase() }));
    if (pideLargo()) {
      const a = largoNombre(val('ahora'));
      const q = largoNombre(val('quiero'));
      partes.push(a === q ? fill(r.msg.largoIgual, { a }) : fill(r.msg.largo, { a, q }));
    }
    if (campo('foto').checked) partes.push(r.msg.foto);
    partes.push(fill(r.msg.tel, { t: telLimpio(tel) }));
    if (nota) partes.push(fill(r.msg.nota, { x: nota }));
    const texto = partes.join('\n');
    const url = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(texto)}`;
    ultima = { s: s!.nombre, d: d!, h, min: s!.min, url };
    window.open(url, '_blank', 'noopener');
    guardar(TRAYECTO, null);

    $('[data-ok-summary]', okBox)!.textContent = `${s!.nombre} · ${fechaLarga(d!)}, ${h}`;
    $<HTMLAnchorElement>('[data-reopen]', okBox)!.href = url;
    form.classList.add('is-sent');
    okBox.hidden = false;
    okBox.focus({ preventScroll: true });
    go(okBox, 'center');
  });

  // Recordatorio en el calendario de la clienta: menos olvidos, menos huecos perdidos.
  $('[data-ics]', okBox)?.addEventListener('click', () => {
    if (!ultima) return;
    const [hh, mm] = ultima.h.split(':').map(Number);
    const ymd = isoDay(ultima.d).replace(/-/g, '');
    const fin = toHHMM(hh * 60 + mm + ultima.min).replace(':', '');
    const icsEsc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Milano Perruqueria//Cita//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@milanoperruqueria`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;TZID=Europe/Madrid:${ymd}T${ultima.h.replace(':', '')}00`,
      `DTEND;TZID=Europe/Madrid:${ymd}T${fin}00`,
      `SUMMARY:${icsEsc(`${ultima.s} · ${c.negocio.nombre}`)}`,
      `LOCATION:${icsEsc(c.negocio.direccion)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(c.negocio.nombre)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'cita-milano-perruqueria.ics';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $('[data-reset]', okBox)?.addEventListener('click', () => {
    okBox.hidden = true;
    form.classList.remove('is-sent');
    reiniciar();
    mostrar(0);
  });

  // La carta de precios entra en la cita con el servicio ya puesto.
  const elegirLinea = (id: string) => {
    marcar('linea', id);
    pintarLinea();
    pintarHoras();
    quitarBanderita();
    actualizar();
    guardarTrayecto();
  };
  $$<HTMLAnchorElement>('[data-go]').forEach((a) => a.addEventListener('click', () => elegirLinea(a.dataset.go!)));
  $$<HTMLAnchorElement>('[data-pick]').forEach((a) =>
    a.addEventListener('click', () => {
      const s = c.servicios.find((x) => x.id === a.dataset.pick);
      if (!s) return;
      elegirLinea(s.linea);
      marcar('servicio', s.id);
      pintarHoras();
      actualizar();
      guardarTrayecto();
      mostrar(1, false);
    }),
  );

  // Sin familia elegida se verían los diez servicios: se abre en Corte y peinado.
  if (!lineaSel()) marcar('linea', c.lineas[0].id);
  pintarLinea();
  saludo();
  let inicio = 0;
  if (restaurar()) {
    actualizar();
    banderita();
    if (resume) resume.hidden = false;
    const done = completo();
    const k = pasos.findIndex((p) => !done[p]);
    inicio = k < 0 ? pasos.length - 1 : k;
  }
  actualizar();
  mostrar(inicio, false);
}

// ---------- Cinta de trabajos: las fotos pasan solas ----------
function initCinta() {
  const belt = $('[data-belt]');
  const track = $('[data-belt-track]');
  if (!belt || !track) return;
  // 45 px por segundo, sea cual sea el ancho de la cinta.
  const ajustar = () => track.style.setProperty('--dur', `${track.scrollWidth / 2 / 45}s`);
  ajustar();
  window.addEventListener('resize', ajustar, { passive: true });
  $$('img', track).forEach((img) => img.addEventListener('load', ajustar, { once: true }));
  // El foco de luz sigue al ratón por la pared.
  const pared = $('[data-pared]');
  if (pared && matchMedia('(hover: hover)').matches) {
    pared.addEventListener('pointermove', (e) => {
      const r = pared.getBoundingClientRect();
      pared.style.setProperty('--mx', `${e.clientX - r.left}px`);
      pared.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
  initVisor();
  const btn = $<HTMLButtonElement>('[data-belt-toggle]');
  const label = $('[data-belt-label]');
  btn?.addEventListener('click', () => {
    const parada = belt.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(parada));
    if (label) label.textContent = parada ? btn.dataset.seguir! : btn.dataset.pausar!;
  });
}

// ---------- Taco de productos: la de arriba se va al fondo ----------
function initTaco() {
  const taco = $('[data-taco]');
  if (!taco) return;
  const cartas = $$('.carta-prod', taco);
  const cuenta = $('[data-taco-cuenta]', taco)!;
  let i = 0;
  const pintar = () => {
    cartas.forEach((c, k) => {
      const pos = (k - i + cartas.length) % cartas.length;
      c.dataset.pos = String(Math.min(pos, 3));
      c.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });
    cuenta.textContent = `${i + 1} / ${cartas.length}`;
  };
  const mover = (d: number) => { i = (i + d + cartas.length) % cartas.length; pintar(); };
  $('[data-taco-next]', taco)?.addEventListener('click', () => mover(1));
  $('[data-taco-prev]', taco)?.addEventListener('click', () => mover(-1));
  // Pulsar la carta de arriba también pasa a la siguiente.
  $('.taco-cartas', taco)?.addEventListener('click', () => mover(1));
  // Deslizar con el dedo.
  let x0 = 0;
  taco.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  taco.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1); });
  taco.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); });
  pintar();
}

// ---------- Visor: el trabajo en grande ----------
function initVisor() {
  const visor = $<HTMLDialogElement>('[data-visor]');
  if (!visor || typeof visor.showModal !== 'function') return;
  const fotos: { src: string; alt: string; nombre: string; k: string }[] = JSON.parse(visor.dataset.fotos!);
  const img = $<HTMLImageElement>('[data-visor-img]', visor)!;
  const nombre = $('[data-visor-nombre]', visor)!;
  let i = 0;
  // La foto anterior no debe asomar: se oculta hasta que la nueva ha cargado.
  img.addEventListener('load', () => { img.style.opacity = '1'; });
  const pintar = () => {
    img.style.opacity = '0';
    img.removeAttribute('src');
    img.alt = fotos[i].alt;
    img.dataset.k = fotos[i].k;
    nombre.textContent = fotos[i].nombre;
    img.src = fotos[i].src;
    if (img.complete && img.naturalWidth) img.style.opacity = '1';
  };
  // Las versiones grandes se precargan para que el visor abra al instante.
  const precargar = () => fotos.forEach((f) => { new Image().src = f.src; });
  if ('requestIdleCallback' in window) requestIdleCallback(precargar); else setTimeout(precargar, 2000);
  const mover = (d: number) => { i = (i + d + fotos.length) % fotos.length; pintar(); };
  $$<HTMLButtonElement>('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    i = Number(b.dataset.zoom); pintar(); visor.showModal();
  }));
  $('[data-visor-prev]', visor)?.addEventListener('click', () => mover(-1));
  $('[data-visor-next]', visor)?.addEventListener('click', () => mover(1));
  $('[data-visor-cerrar]', visor)?.addEventListener('click', () => visor.close());
  // Pulsar fuera de la foto cierra.
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); });
}

// ---------- Fondo vivo: luces que se desplazan y un mechón que se dibuja al bajar ----------
function initFondo() {
  const main = $('main#app');
  const svg = $<SVGSVGElement>('[data-hilo]');
  if (!main || !svg) return;
  const trazos = $$<SVGPathElement>('path', svg);
  let largo = 0;

  // Un mechón que baja en curvas de lado a lado, con algo de irregularidad (siempre la misma).
  function dibujar() {
    const W = main!.clientWidth;
    const H = main!.scrollHeight;
    svg!.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const paso = Math.max(420, Math.min(700, W * 0.55));
    // Tangentes verticales en cada punto: la curva enlaza sin picos.
    let x = W * 0.62;
    let y = 0;
    let k = 0;
    let d = `M ${x} ${y}`;
    while (y < H) {
      const lado = k % 2 === 0 ? 0.1 : 0.9;
      const x2 = W * (lado + Math.sin(k * 1.7) * 0.06);
      const y2 = Math.min(H, y + paso);
      d += ` C ${x} ${y + paso * 0.5}, ${x2} ${y2 - paso * 0.5}, ${x2} ${y2}`;
      x = x2;
      y = y2;
      k++;
    }
    trazos.forEach((p, i) => {
      p.setAttribute('d', d);
      // La línea rosa va un poco desplazada, como dos hebras del mismo mechón.
      p.style.transform = i === 2 ? 'translate(14px, 10px)' : '';
    });
    largo = trazos[0].getTotalLength();
    trazos.forEach((p) => { p.style.strokeDasharray = `${largo}`; });
    avanzar();
  }
  function avanzar() {
    const total = main!.scrollHeight;
    const progreso = Math.min(1, (window.scrollY + innerHeight * 0.75) / total);
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    trazos.forEach((p) => { p.style.strokeDashoffset = quieto ? '0' : `${largo * (1 - progreso)}`; });
    document.documentElement.style.setProperty('--scroll', String(progreso));
  }
  let pendiente = false;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; avanzar(); });
  }, { passive: true });
  if ('ResizeObserver' in window) {
    let t: number | undefined;
    new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(dibujar, 150); }).observe(main);
  } else window.addEventListener('resize', dibujar);
  dibujar();
}

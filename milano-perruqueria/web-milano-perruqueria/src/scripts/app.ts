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
    ruta: Ruta; hero: { abierto: string; cerrado: string }; desde: string; gratis: string; linea: string;
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
  const hero = $('.hero')!;
  const ruta = $('#ruta')!;
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
    map.style.setProperty('--progress', String((hasta < 0 ? keys.length - 1 : Math.max(0, hasta - 1)) / (keys.length - 1)));
    const s = servicioSel();
    const l = c.lineas.find((x) => x.id === (s?.linea ?? lineaSel()));
    const ficha = $('[data-ficha]')!;
    ficha.style.setProperty('--lc', l ? `var(--l-${l.id === 'tratamiento' ? 'trat' : l.id === 'infantil' ? 'inf' : l.id})` : 'var(--ink-3)');
    $('[data-ficha-badge]', ficha)!.textContent = l ? String(l.num) : '–';
    $('[data-ficha-svc]', ficha)!.textContent = s ? s.nombre : l ? l.nombre : r.fichaVacia;
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
  $('[data-empezar]')?.addEventListener('click', () => { reiniciar(); go($('[data-station="destino"]', form)); });

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
    // En el móvil, al cerrar una parada se baja a la siguiente.
    const siguiente: Record<string, string> = { servicio: 'pelo', pelo: 'largo', quiero: 'hora', hora: 'datos' };
    let next = siguiente[name];
    if (name === 'pelo' && !pideLargo()) next = 'hora';
    if (name === 'quiero' && !largoOk()) next = '';
    if (next && matchMedia('(max-width: 900px)').matches) {
      const st = $(`[data-station="${next}"]`, form);
      if (st && !st.classList.contains('is-done')) setTimeout(() => go(st), 200);
    }
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
      target?.focus({ preventScroll: true });
      go(station ?? target ?? null, 'center');
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
    go($('[data-station="destino"]', form));
  });

  // Destinos del andén y precios: entran en la ruta con la línea o el servicio ya puestos.
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
    }),
  );

  pintarLinea();
  saludo();
  if (restaurar()) {
    actualizar();
    banderita();
    if (resume) resume.hidden = false;
  }
  actualizar();
}

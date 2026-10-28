type Tramos = [string, string][];
interface Cliente {
  lang: 'es' | 'ca';
  horario: Record<string, Tramos>;
  servicios: { id: string; min: number; nombre: string }[];
  whatsapp: string;
  negocio: { nombre: string; direccion: string };
  t: {
    dias: string[]; diasCortos: string[]; meses: string[]; hoy: string; manana: string;
    cita: {
      eligeDia: string; sinHoras: string; resumen: string; resumenVacio: string; msg: string; msgNota: string;
      hola: string; errores: Record<'servicio' | 'dia' | 'hora' | 'nombre' | 'tel', string>;
    };
    hero: { abierto: string; cerrado: string };
    visita: { abierto: string; cierraA: string; ahoraCerrado: string; abreHoy: string; abreManana: string; abreEl: string; aLas: string };
  };
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w)\}/g, (_, k) => vars[k] ?? '');
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE = 'jgb-cliente';

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

function leer(): { n: string; tel: string } | null {
  try { const raw = localStorage.getItem(STORE); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function guardar(v: { n: string; tel: string } | null) {
  try { v ? localStorage.setItem(STORE, JSON.stringify(v)) : localStorage.removeItem(STORE); } catch { /* sin almacenamiento */ }
}

export function init() {
  const root = $('#app');
  if (!root) return;
  const c: Cliente = JSON.parse(root.dataset.cliente!);
  const t = c.t;
  const now = nowMadrid();
  const SLOT = 30;

  const tramosDe = (d: Date): Tramos => c.horario[String(d.getUTCDay())] ?? [];
  const duracion = (id: string | null) => c.servicios.find((s) => s.id === id)?.min ?? SLOT;

  // Huecos de 30 min dentro del horario; el servicio tiene que acabar antes del cierre.
  function horas(d: Date, servicio: string | null) {
    const dur = duracion(servicio);
    const hoy = isoDay(d) === isoDay(now.date);
    const out: { hora: string; libre: boolean }[] = [];
    for (const [a, b] of tramosDe(d)) {
      for (let m = toMin(a); m + Math.min(dur, SLOT) <= toMin(b); m += SLOT) {
        out.push({ hora: toHHMM(m), libre: !(hoy && m < now.minutes + 30) && m + dur <= toMin(b) });
      }
    }
    return out;
  }

  // Próximos 12 días con horario (hoy solo si aún quedan horas).
  const dias: Date[] = [];
  for (let i = 0; dias.length < 12 && i < 30; i++) {
    const d = addDays(now.date, i);
    if (!tramosDe(d).length) continue;
    if (i === 0 && !horas(d, null).some((h) => h.libre)) continue;
    dias.push(d);
  }
  const etiquetaDia = (d: Date) => {
    const diff = Math.round((d.getTime() - now.date.getTime()) / 86400000);
    if (diff === 0) return t.hoy;
    if (diff === 1) return t.manana;
    return t.diasCortos[d.getUTCDay()];
  };
  const fechaLarga = (d: Date) => `${t.dias[d.getUTCDay()]} ${d.getUTCDate()} ${t.meses[d.getUTCMonth()]}`;

  // ---------- Cabecera y barra móvil ----------
  const top = $('[data-top]')!;
  const dock = $('.dock');
  const hero = $('.hero')!;
  const book = $('#cita')!;
  let bookVisible = false;
  const onScroll = () => {
    const y = window.scrollY;
    top.classList.toggle('is-solid', y > 40);
    dock?.classList.toggle('is-on', y > hero.offsetHeight * 0.55 && !bookVisible);
  };
  if ('IntersectionObserver' in window) {
    // La barra se esconde mientras rellenas la cita: el botón de enviar ya está ahí.
    new IntersectionObserver(([en]) => { bookVisible = en.isIntersecting; onScroll(); }, { rootMargin: '-35% 0px -35% 0px' }).observe(book);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // El cambio de idioma conserva la sección en la que estás.
  $$<HTMLAnchorElement>('[data-lang]').forEach((a) =>
    a.addEventListener('click', () => { if (location.hash) a.href = a.pathname + location.hash; }),
  );

  // ---------- Letrero: se enciende al cargar ----------
  if (!reduced()) {
    root.classList.add('neon-boot');
    // Quitado al terminar para que el encendido no se repita tras cada parpadeo.
    setTimeout(() => root.classList.remove('neon-boot'), 2600);
  }
  requestAnimationFrame(() => root.classList.add('neon-on'));
  // Con movimiento reducido, el agua del charco se queda quieta.
  if (reduced()) $$('[data-ondas]').forEach((a) => a.remove());

  // De vez en cuando un letrero visible parpadea, como un tubo de neón que falla.
  if (!reduced()) {
    const visibles = new Set<Element>();
    const letreros = $$('[data-flick]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((ens) => ens.forEach((en) => (en.isIntersecting ? visibles.add(en.target) : visibles.delete(en.target))));
      letreros.forEach((el) => io.observe(el));
    }
    letreros.forEach((el) => el.addEventListener('animationend', (ev) => {
      if ((ev as AnimationEvent).animationName === 'tube-flick') el.classList.remove('is-flick');
    }));
    const programar = () => setTimeout(() => {
      const ahora = [...visibles];
      if (!document.hidden && ahora.length) ahora[Math.floor(Math.random() * ahora.length)].classList.add('is-flick');
      programar();
    }, 9000 + Math.random() * 2000);
    setTimeout(programar, 2500);
  }

  // ---------- Cinta de trabajos ----------
  const belt = $('[data-belt]');
  const track = $('[data-belt-track]');
  if (belt && track) {
    // Misma velocidad que los nervios de la banda: 40 px por segundo.
    const ajustar = () => track.style.setProperty('--dur', `${track.scrollWidth / 2 / 40}s`);
    ajustar();
    window.addEventListener('resize', ajustar, { passive: true });
    $$('img', track).forEach((img) => img.addEventListener('load', ajustar, { once: true }));

    const btn = $<HTMLButtonElement>('[data-belt-toggle]');
    const label = $('[data-belt-label]');
    const textos = JSON.parse(belt.closest('section')!.dataset.textos || '{}');
    btn?.addEventListener('click', () => {
      const parada = belt.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(parada));
      if (label) label.textContent = parada ? textos.seguir : textos.pausar;
    });

    // Los vídeos se reproducen solo mientras la tarjeta está a la vista.
    const videos = $$<HTMLVideoElement>('[data-video]', track);
    if (videos.length && 'IntersectionObserver' in window && !reduced()) {
      const vio = new IntersectionObserver((ens) => ens.forEach((en) => {
        const v = en.target as HTMLVideoElement;
        if (en.isIntersecting) v.play().then(() => v.parentElement?.classList.add('is-playing')).catch(() => {});
        else { v.pause(); v.parentElement?.classList.remove('is-playing'); }
      }), { threshold: 0.5 });
      videos.forEach((v) => vio.observe(v));
    }
  }

  // ---------- Abierto / cerrado (en el letrero y junto al horario) ----------
  function estado(): { open: boolean; label: string; detail: string } {
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
  $$('[data-status]').forEach((el) => {
    // En el letrero ya pone ABIERTO/CERRADO: ahí solo hace falta el detalle.
    el.textContent = el.closest('[data-open]') ? e.detail : [e.label, e.detail].filter(Boolean).join(' · ');
    el.classList.toggle('is-open', e.open);
  });
  const openSign = $('[data-open]');
  if (openSign) {
    openSign.classList.toggle('is-open', e.open);
    $('[data-open-word]', openSign)!.textContent = e.open ? t.hero.abierto : t.hero.cerrado;
  }
  $(`.hours tr[data-day="${now.date.getUTCDay()}"]`)?.classList.add('is-today');

  // ---------- Reserva ----------
  const form = $<HTMLFormElement>('[data-reserva]');
  if (!form) { initAgenda(); return; }
  const daysBox = $('[data-days]')!;
  const slotsBox = $('[data-slots]')!;
  const summary = $('[data-summary]')!;
  const ticket = $('[data-ticket]')!;
  const okBox = $('[data-ok]')!;
  const hola = $('[data-hola]')!;

  daysBox.innerHTML = dias.map((d) => `
    <label class="chip chip-day"><input type="radio" name="dia" value="${isoDay(d)}" />
      <span><small>${etiquetaDia(d)}</small><b>${d.getUTCDate()}</b><small>${t.meses[d.getUTCMonth()]}</small></span></label>`).join('');

  const campo = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const val = (name: string) => (form.elements.namedItem(name) as RadioNodeList | HTMLInputElement | null)?.value || '';
  const servicioSel = () => val('servicio') || null;
  const diaSel = () => dias.find((d) => isoDay(d) === val('dia')) ?? null;

  function pintarHoras() {
    const d = diaSel();
    const prev = val('hora');
    if (!d) { slotsBox.innerHTML = `<p class="hint">${t.cita.eligeDia}</p>`; return; }
    const hs = horas(d, servicioSel());
    if (!hs.some((h) => h.libre)) { slotsBox.innerHTML = `<p class="hint">${t.cita.sinHoras}</p>`; return; }
    slotsBox.innerHTML = hs.map((h) => `
      <label class="chip chip-slot"><input type="radio" name="hora" value="${h.hora}" ${h.libre ? '' : 'disabled'} ${h.libre && h.hora === prev ? 'checked' : ''} />
        <span>${h.hora}</span></label>`).join('');
  }

  const telLimpio = (v: string) => v.replace(/[\s.()-]/g, '').replace(/^(\+34|0034)/, '');
  const telOk = (v: string) => /^[6789]\d{8}$/.test(telLimpio(v));
  function datos() {
    return {
      s: c.servicios.find((x) => x.id === servicioSel()), d: diaSel(), h: val('hora'),
      n: val('nombre').trim(), tel: val('tel').trim(), nota: val('nota').trim(),
    };
  }
  function actualizar() {
    const { s, d, h, n, tel } = datos();
    const done = { servicio: !!s, dia: !!d, hora: !!h, datos: !!n && telOk(tel) };
    (Object.keys(done) as (keyof typeof done)[]).forEach((k) =>
      $(`[data-station="${k}"]`, form)?.classList.toggle('is-done', done[k]),
    );
    const listo = Object.values(done).every(Boolean);
    ticket.classList.toggle('is-ready', listo);
    if (s && d && h) {
      summary.textContent = fill(t.cita.resumen, { s: s.nombre, d: fechaLarga(d), h });
      summary.classList.remove('is-empty');
    } else {
      summary.textContent = t.cita.resumenVacio;
      summary.classList.add('is-empty');
    }
  }
  function setErr(k: string, msg: string) {
    const el = $(`[data-err="${k}"]`, form);
    if (el) el.textContent = msg;
    const input = form.elements.namedItem(k);
    if (input instanceof HTMLInputElement) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  // Cliente que vuelve: sus datos ya están puestos.
  function saludo() {
    const g = leer();
    if (g?.n) {
      campo('nombre').value = g.n;
      campo('tel').value = g.tel;
      $('[data-hola-text]', hola)!.textContent = fill(t.cita.hola, { n: g.n });
      hola.hidden = false;
    } else hola.hidden = true;
  }
  saludo();
  $('[data-olvidar]', form)?.addEventListener('click', () => {
    guardar(null);
    campo('nombre').value = '';
    campo('tel').value = '';
    hola.hidden = true;
    actualizar();
    campo('nombre').focus();
  });

  form.addEventListener('change', (ev) => {
    const name = (ev.target as HTMLInputElement).name;
    if (name === 'dia' || name === 'servicio') pintarHoras();
    if (name) setErr(name, '');
    actualizar();
    // En el móvil, al elegir algo se baja al paso siguiente.
    const next = { servicio: 'dia', dia: 'hora', hora: 'datos' }[name];
    if (next && matchMedia('(max-width: 760px)').matches) {
      const st = $(`[data-station="${next}"]`, form);
      const vacio = next === 'datos' ? !val('nombre') : !val(next);
      if (st && vacio) setTimeout(() => st.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }), 180);
    }
  });
  form.addEventListener('input', (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name === 'nombre' && el.value.trim()) setErr('nombre', '');
    if (el.name === 'tel' && telOk(el.value)) setErr('tel', '');
    actualizar();
  });

  let ultima: { s: string; d: Date; h: string; min: number; texto: string; url: string } | null = null;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const { s, d, h, n, tel, nota } = datos();
    const errs: [string, string][] = [];
    if (!s) errs.push(['servicio', t.cita.errores.servicio]);
    if (!d) errs.push(['dia', t.cita.errores.dia]);
    if (!h) errs.push(['hora', t.cita.errores.hora]);
    if (!n) errs.push(['nombre', t.cita.errores.nombre]);
    if (!telOk(tel)) errs.push(['tel', t.cita.errores.tel]);
    ['servicio', 'dia', 'hora', 'nombre', 'tel'].forEach((k) => setErr(k, ''));
    errs.forEach(([k, m]) => setErr(k, m));
    if (errs.length) {
      const first = errs[0][0];
      const target = form.querySelector<HTMLElement>(`[name="${first}"]:not(:disabled)`);
      target?.focus({ preventScroll: true });
      ($(`[data-err="${first}"]`, form)?.closest('.station') ?? target)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    guardar(campo('recordar').checked ? { n, tel } : null);
    const texto = fill(t.cita.msg, { n, s: s!.nombre, d: fechaLarga(d!), h, t: telLimpio(tel) }) + (nota ? fill(t.cita.msgNota, { x: nota }) : '');
    const url = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(texto)}`;
    ultima = { s: s!.nombre, d: d!, h, min: s!.min, texto, url };
    window.open(url, '_blank', 'noopener');

    $('[data-ok-summary]', okBox)!.textContent = fill(t.cita.resumen, { s: s!.nombre, d: fechaLarga(d!), h });
    $<HTMLAnchorElement>('[data-reopen]', okBox)!.href = url;
    form.classList.add('is-sent');
    okBox.hidden = false;
    okBox.focus({ preventScroll: true });
    okBox.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  });

  // Recordatorio en el calendario del cliente: menos olvidos, menos huecos perdidos.
  $('[data-ics]', okBox)?.addEventListener('click', () => {
    if (!ultima) return;
    const [hh, mm] = ultima.h.split(':').map(Number);
    const ymd = isoDay(ultima.d).replace(/-/g, '');
    const fin = toHHMM(hh * 60 + mm + ultima.min).replace(':', '');
    const icsEsc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Johny Garcia Barber//Cita//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@johnygarciabarber`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;TZID=Europe/Madrid:${ymd}T${ultima.h.replace(':', '')}00`,
      `DTEND;TZID=Europe/Madrid:${ymd}T${fin}00`,
      `SUMMARY:${icsEsc(`${ultima.s} · ${c.negocio.nombre}`)}`,
      `LOCATION:${icsEsc(c.negocio.direccion)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(c.negocio.nombre)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'cita-johny-garcia-barber.ics';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $('[data-reset]', okBox)?.addEventListener('click', () => {
    okBox.hidden = true;
    form.classList.remove('is-sent');
    $$<HTMLInputElement>('input[type="radio"]', form).forEach((r) => (r.checked = false));
    campo('nota').value = '';
    pintarHoras();
    saludo();
    actualizar();
    $('[data-station="servicio"]', form)!.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  });

  // Elegir servicio desde la carta de precios.
  $$<HTMLAnchorElement>('[data-pick]').forEach((a) =>
    a.addEventListener('click', () => {
      const r = form.querySelector<HTMLInputElement>(`input[name="servicio"][value="${esc(a.dataset.pick!)}"]`);
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    }),
  );

  actualizar();
}

// Modo agenda: la página de reservas de Google Calendar de cada barbero.
function initAgenda() {
  const box = $('[data-agenda]');
  const frame = $<HTMLIFrameElement>('[data-agenda-frame]');
  if (!box || !frame) return;
  const agendas: { n: string; url: string; title: string }[] = JSON.parse(box.dataset.agenda!);
  box.addEventListener('change', (ev) => {
    const el = ev.target as HTMLInputElement;
    if (el.name !== 'barbero') return;
    const a = agendas[Number(el.value)];
    if (a) { frame.src = a.url; frame.title = a.title; }
  });
}

// Movimiento e interacción: espejo que sigue al cursor, brillo de las plumas,
// antes/después, visor de fotos, entradas al hacer scroll, contador y botones dorados.
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export function efectos() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const mirror = document.querySelector<HTMLElement>('[data-tilt]');
  const ticker = document.querySelector<HTMLElement>('.ticker');

  // Los bucles se paran cuando no se ven.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting)));
    hero && io.observe(hero);
    ticker && io.observe(ticker);
  }

  // ---------- Portada: espejo inclinable y plumas que brillan bajo el cursor ----------
  if (hero && !reduced() && finePointer()) {
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--my', `${e.clientY - r.top}px`);
        if (mirror) {
          const m = mirror.getBoundingClientRect();
          const dx = (e.clientX - (m.left + m.width / 2)) / r.width;
          const dy = (e.clientY - (m.top + m.height / 2)) / r.height;
          mirror.style.setProperty('--ry', `${(dx * 14).toFixed(2)}deg`);
          mirror.style.setProperty('--rx', `${(-dy * 10).toFixed(2)}deg`);
        }
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', '-400px');
      hero.style.setProperty('--my', '-400px');
      mirror?.style.setProperty('--rx', '0deg');
      mirror?.style.setProperty('--ry', '0deg');
    });
  }

  // ---------- Botones dorados que siguen un poco al cursor ----------
  if (!reduced() && finePointer()) {
    document.querySelectorAll<HTMLElement>('.btn-gold').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', `${((e.clientX - r.left) / r.width - 0.5) * 8}px`);
        b.style.setProperty('--by', `${((e.clientY - r.top) / r.height - 0.5) * 6}px`);
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }

  // ---------- Antes / después ----------
  document.querySelectorAll<HTMLElement>('[data-ba]').forEach((ba) => {
    const range = ba.querySelector<HTMLInputElement>('[data-ba-range]')!;
    const set = (v: number) => { const x = Math.max(0, Math.min(100, v)); ba.style.setProperty('--x', `${x}%`); range.value = String(Math.round(x)); };
    range.addEventListener('input', () => set(Number(range.value)));
    // Arrastrar desde cualquier punto de la foto (ratón y dedo).
    let drag = false;
    const fromEvent = (e: PointerEvent) => { const r = ba.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    range.addEventListener('pointerdown', (e) => { drag = true; ba.classList.add('is-drag'); range.setPointerCapture(e.pointerId); fromEvent(e); });
    range.addEventListener('pointermove', (e) => { if (drag) { e.preventDefault(); fromEvent(e); } });
    const stop = () => { drag = false; ba.classList.remove('is-drag'); };
    range.addEventListener('pointerup', stop);
    range.addEventListener('pointercancel', stop);
    // Al aparecer, la línea se pasea una vez para que se vea que se puede arrastrar.
    if (!reduced() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          if (drag) return;
          const p = Math.min(1, (t - t0) / 1800);
          set(50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p));
          if (p < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 700);
      }, { threshold: 0.6 });
      io.observe(ba);
    }
  });

  // ---------- Visor de fotos ----------
  const lb = document.querySelector<HTMLDialogElement>('[data-lb]');
  if (lb && typeof lb.showModal === 'function') {
    const fotos: { src: string; alt: string }[] = JSON.parse(lb.dataset.fotos || '[]');
    const img = lb.querySelector<HTMLImageElement>('[data-lb-img]')!;
    const cap = lb.querySelector<HTMLElement>('[data-lb-cap]')!;
    let i = 0;
    let opener: HTMLElement | null = null;
    const show = (n: number) => {
      i = (n + fotos.length) % fotos.length;
      img.classList.remove('is-oval');
      img.onload = () => img.classList.toggle('is-oval', img.naturalHeight > img.naturalWidth * 1.15);
      img.src = fotos[i].src;
      img.alt = fotos[i].alt;
      cap.textContent = fotos[i].alt;
      if (!reduced()) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
    };
    document.querySelectorAll<HTMLElement>('[data-lb-open]').forEach((b) =>
      b.addEventListener('click', () => { opener = b; show(Number(b.dataset.lbOpen)); lb.showModal(); }),
    );
    lb.querySelector('[data-lb-close]')!.addEventListener('click', () => lb.close());
    lb.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(i - 1));
    lb.querySelector('[data-lb-next]')!.addEventListener('click', () => show(i + 1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
    // Clic fuera de la foto: cerrar.
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => opener?.focus());
    // Deslizar con el dedo.
    let x0: number | null = null;
    const fig = lb.querySelector<HTMLElement>('.lb-fig')!;
    fig.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    fig.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    });
  }

  // ---------- Entradas al hacer scroll (solo lo que está por debajo de la pantalla) ----------
  if (!reduced() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    const vh = innerHeight;
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-mask]').forEach((el) => {
      if (el.getBoundingClientRect().top < vh) return;
      el.classList.add(el.hasAttribute('data-reveal-mask') ? 'rv-mask' : 'rv');
      io.observe(el);
    });
  }

  // ---------- Contador de la nota ----------
  const num = document.querySelector<HTMLElement>('[data-count]');
  if (num && !reduced() && 'IntersectionObserver' in window) {
    const fin = Number(num.dataset.count!.replace(',', '.'));
    const sep = num.dataset.count!.includes(',') ? ',' : '.';
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1300);
        const v = fin * (1 - Math.pow(1 - p, 4));
        num.textContent = v.toFixed(1).replace('.', sep);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.8 });
    io.observe(num);
  }
}

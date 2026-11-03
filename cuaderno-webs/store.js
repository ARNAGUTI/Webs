/* Cuaderno de Webs: capa de datos.
 * Con Supabase configurado en config.js guarda en la nube (con tu usuario) y deja una copia en el
 * dispositivo para abrir sin conexión. Sin configurar, guarda solo en este dispositivo (modo prueba).
 * Expone window.CW = { ready, db, assets, sample, downloads, ticketUrl, mode, user, logout }.
 */
(function () {
  "use strict";
  const cfg = window.CW_CONFIG || {};
  const remoto = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  let sb = null, uid = "local";
  let cache = {};            // { coleccion: { id: data } }
  let cola = [];             // escrituras pendientes de subir
  const oyentes = {};        // coleccion -> [fn]
  const oyentesDoc = {};     // "col/id" -> [fn]
  const cacheKey = () => "cw_cache_" + uid, colaKey = () => "cw_cola_" + uid;

  function snapCol(col) {
    const docs = Object.entries(cache[col] || {}).map(([id, d]) => ({ id, exists: true, data: () => d }));
    return { docs, size: docs.length, empty: !docs.length };
  }
  function emitir(col, id) {
    (oyentes[col] || []).forEach(fn => { try { fn(snapCol(col)); } catch (e) { console.error(e); } });
    const k = col + "/" + id;
    (oyentesDoc[k] || []).forEach(fn => { try { const d = (cache[col] || {})[id]; fn({ id, exists: !!d, data: () => d }); } catch (e) { console.error(e); } });
  }
  function guardarCache() { LS.set(cacheKey(), cache); }

  async function subir(op) {
    if (!sb) return true;
    if (op.tipo === "set") {
      const { error } = await sb.from("docs").upsert({ user_id: uid, col: op.col, id: op.id, data: op.data, updated_at: new Date().toISOString() });
      if (error) throw error;
    } else {
      const { error } = await sb.from("docs").delete().match({ user_id: uid, col: op.col, id: op.id });
      if (error) throw error;
    }
    return true;
  }
  let vaciando = false;
  async function vaciarCola() {
    if (vaciando || !sb || !cola.length) return;
    vaciando = true;
    try {
      while (cola.length) { await subir(cola[0]); cola.shift(); LS.set(colaKey(), cola); }
    } catch (e) { /* sin conexión: se reintenta luego */ }
    vaciando = false;
    pintarEstado();
  }
  async function escribir(op) {
    cache[op.col] = cache[op.col] || {};
    if (op.tipo === "set") cache[op.col][op.id] = op.data; else delete cache[op.col][op.id];
    guardarCache(); emitir(op.col, op.id);
    if (!sb) return;
    cola.push(op); LS.set(colaKey(), cola);
    await vaciarCola();
    if (cola.length) pintarEstado();
  }

  const db = {
    collection(col) {
      return {
        onSnapshot(fn) { (oyentes[col] = oyentes[col] || []).push(fn); setTimeout(() => fn(snapCol(col)), 0); return () => { oyentes[col] = (oyentes[col] || []).filter(f => f !== fn); }; },
        doc(id) { return db.doc(col + "/" + id); },
      };
    },
    doc(path) {
      const [col, id] = path.split("/");
      return {
        set: data => escribir({ tipo: "set", col, id, data: JSON.parse(JSON.stringify(data)) }),
        delete: () => escribir({ tipo: "del", col, id }),
        onSnapshot(fn) { const k = col + "/" + id; (oyentesDoc[k] = oyentesDoc[k] || []).push(fn); setTimeout(() => { const d = (cache[col] || {})[id]; fn({ id, exists: !!d, data: () => d }); }, 0); return () => {}; },
      };
    },
  };

  /* Fotos de tickets: en Supabase Storage (bucket privado "tickets"). */
  const assets = {
    async upload(file) {
      if (!sb) throw new Error("Las fotos de tickets necesitan la base de datos en la nube.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + "." + ext;
      const { error } = await sb.storage.from("tickets").upload(uid + "/" + id, file, { contentType: file.type || undefined });
      if (error) throw error;
      return { id };
    },
  };
  async function ticketUrl(id) {
    if (!sb || !id) return null;
    const { data, error } = await sb.storage.from("tickets").createSignedUrl(uid + "/" + id, 3600);
    return error ? null : data.signedUrl;
  }

  /* Asistente: usa tu clave de la API de Claude guardada en este dispositivo. */
  const MODELO = "claude-haiku-5-5";
  function claveApi() { return LS.get("cw_apikey", ""); }
  async function sample(input, opts) {
    const key = claveApi();
    if (!key) { const e = new Error("Falta la clave de la API"); e.code = "not_granted"; throw e; }
    const messages = typeof input === "string" ? [{ role: "user", content: input }] : input;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: MODELO, max_tokens: 1200, messages }),
      signal: opts && opts.signal,
    });
    if (res.status === 429) { const e = new Error("rate"); e.code = "rate_limited"; throw e; }
    if (res.status === 401) { const e = new Error("clave"); e.code = "not_granted"; throw e; }
    if (!res.ok) throw new Error("API " + res.status);
    const j = await res.json();
    const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    if (opts && opts.onText) opts.onText({ text, delta: text });
    return { text, truncated: j.stop_reason === "max_tokens" };
  }

  const downloads = {
    async save({ filename, data }) {
      const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = filename; document.body.append(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    },
  };

  /* Indicador de conexión en la cabecera */
  function pintarEstado() {
    const el = document.getElementById("hdrSub"); if (!el) return;
    if (!remoto) el.textContent = "Modo prueba: los datos se quedan en este dispositivo";
    else if (cola.length) el.textContent = "Sin conexión: " + cola.length + " cambios por subir";
    else el.textContent = "Guardado en la nube";
  }
  window.addEventListener("online", vaciarCola);
  setInterval(vaciarCola, 30000);

  /* Pantalla de acceso */
  function pantallaLogin(msg) {
    CW.pendingLogin = true;
    const nav = document.querySelector("nav.tabs"); if (nav) nav.hidden = true;
    const done = session => { CW.pendingLogin = false; if (nav) nav.hidden = false; return session; };
    return new Promise(resolve0 => {
      const resolve = x => resolve0(done(x));
      const v = document.getElementById("view");
      document.getElementById("fab").hidden = true;
      v.innerHTML = `<section class="sec" style="max-width:420px;margin:24px auto;width:100%">
        <h3>Entra en tu cuaderno</h3>
        <p class="note">Usa el email y la contraseña con los que te diste de alta. La primera vez, pulsa "Crear mi cuenta".</p>
        ${msg ? `<div class="banner">${msg}</div>` : ""}
        <form id="loginForm">
          <div class="f"><label for="lg_mail">Email</label><input id="lg_mail" type="email" autocomplete="username" required></div>
          <div class="f"><label for="lg_pass">Contraseña</label><input id="lg_pass" type="password" autocomplete="current-password" minlength="8" required></div>
          <button class="pri" type="submit">Entrar</button>
          <button type="button" id="lg_new">Crear mi cuenta</button>
        </form></section>`;
      const go = async (alta) => {
        const email = document.getElementById("lg_mail").value.trim(), password = document.getElementById("lg_pass").value;
        if (!email || password.length < 8) { pantallaLogin("Pon tu email y una contraseña de al menos 8 caracteres.").then(resolve); return; }
        const r = alta ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
        if (r.error) { pantallaLogin(alta ? "No se ha podido crear la cuenta: " + r.error.message : "Email o contraseña incorrectos.").then(resolve); return; }
        if (!r.data.session) { pantallaLogin("Te hemos enviado un email para confirmar la cuenta. Ábrelo y luego entra aquí.").then(resolve); return; }
        resolve(r.data.session);
      };
      document.getElementById("loginForm").onsubmit = e => { e.preventDefault(); go(false); };
      document.getElementById("lg_new").onclick = () => go(true);
    });
  }

  async function cargarRemoto() {
    const { data, error } = await sb.from("docs").select("col,id,data");
    if (error) throw error;
    const nuevo = {};
    for (const r of data) { (nuevo[r.col] = nuevo[r.col] || {})[r.id] = r.data; }
    // Lo que está en la cola aún no ha subido: se respeta la versión local
    for (const op of cola) { nuevo[op.col] = nuevo[op.col] || {}; if (op.tipo === "set") nuevo[op.col][op.id] = op.data; else delete nuevo[op.col][op.id]; }
    cache = nuevo; guardarCache();
    Object.keys({ ...cache, clientes: 1, movimientos: 1, eventos: 1, fiscal: 1, config: 1 }).forEach(c => emitir(c, "ajustes"));
  }

  async function iniciar() {
    if (!remoto) { uid = "local"; cache = LS.get(cacheKey(), {}); pintarEstado(); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
    let { data: { session } } = await sb.auth.getSession();
    if (!session) session = await pantallaLogin();
    uid = session.user.id; CW.user = session.user;
    cache = LS.get(cacheKey(), {}); cola = LS.get(colaKey(), []);
    pintarEstado();
    try { await vaciarCola(); await cargarRemoto(); } catch (e) { pintarEstado(); }
    sb.channel("docs-" + uid)
      .on("postgres_changes", { event: "*", schema: "public", table: "docs", filter: "user_id=eq." + uid }, p => {
        const r = p.new && p.new.col ? p.new : p.old; if (!r || !r.col) return;
        cache[r.col] = cache[r.col] || {};
        if (p.eventType === "DELETE") delete cache[r.col][r.id]; else cache[r.col][r.id] = p.new.data;
        guardarCache(); emitir(r.col, r.id);
      }).subscribe();
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") cargarRemoto().catch(() => {}); });
  }

  const CW = window.CW = {
    mode: remoto ? "nube" : "local", user: null, db, assets: remoto ? assets : null, sample, downloads, ticketUrl,
    tieneClave: () => !!claveApi(), ponerClave: k => (k ? LS.set("cw_apikey", k.trim()) : LS.del("cw_apikey")),
    async logout() { if (sb) await sb.auth.signOut(); location.reload(); },
    ready: null,
  };
  CW.ready = iniciar();
})();

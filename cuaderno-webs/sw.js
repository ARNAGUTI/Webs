/* Guarda la app en el dispositivo para que abra sin conexión. Los datos van aparte (store.js). */
const VERSION = "cw-v2";
const APP = ["./", "index.html", "store.js", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/apple-touch-icon.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => Promise.all(APP.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.endsWith("supabase.co") || u.hostname === "api.anthropic.com") return; // datos: siempre a la red
  // Primero la red (para recibir las actualizaciones) y, sin conexión, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { if (r.ok && (u.origin === location.origin || u.hostname === "cdn.jsdelivr.net" || u.hostname.endsWith("gstatic.com") || u.hostname.endsWith("googleapis.com"))) { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});

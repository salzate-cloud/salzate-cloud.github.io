/* Comentarios anónimos de los libros de santiagoalzates.com
 *
 * Cloudflare Worker con un espacio KV llamado COMENTARIOS y una variable secreta CLAVE.
 *
 *   POST /comentario          guarda {libro, pagina, tipo, texto}  (sin IP, sin nombre, sin correo)
 *   GET  /?clave=TU_CLAVE     bandeja de comentarios (solo para el profesor)
 *   POST /borrar?clave=...&id=...   borra un comentario ya atendido
 *
 * Instalación (unos 10 minutos, desde el panel de Cloudflare):
 *   1. Workers & Pages → Create → Worker → nombre: comentarios → Deploy.
 *   2. Edit code → pega este archivo → Deploy.
 *   3. Storage & Databases → KV → Create namespace: COMENTARIOS.
 *   4. En el Worker → Settings → Bindings → Add → KV namespace → variable COMENTARIOS → el namespace del paso 3.
 *   5. Settings → Variables and Secrets → Add → tipo Secret → nombre CLAVE → una clave que solo tú sepas.
 *   6. Abre https://comentarios.alzattesantiago.workers.dev/?clave=TU_CLAVE para ver la bandeja.
 */

const ORIGENES = ["https://santiagoalzates.com", "https://www.santiagoalzates.com", "https://salzate-cloud.github.io"];

function cors(origen) {
  return {
    "Access-Control-Allow-Origin": ORIGENES.includes(origen) ? origen : ORIGENES[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origen = request.headers.get("Origin") || "";
    const h = cors(origen);
    if (request.method === "OPTIONS") return new Response(null, { headers: h });

    if (url.pathname === "/comentario" && request.method === "POST") {
      if (!ORIGENES.includes(origen)) return new Response("origen no permitido", { status: 403, headers: h });
      let d;
      try { d = await request.json(); } catch (e) { return new Response("json inválido", { status: 400, headers: h }); }
      const texto = String(d.texto || "").trim().slice(0, 1500);
      if (texto.length < 3) return new Response("vacío", { status: 400, headers: h });
      const reg = {
        libro: String(d.libro || "").slice(0, 60), pagina: String(d.pagina || "").slice(0, 80),
        tipo: String(d.tipo || "").slice(0, 60), texto, fecha: new Date().toISOString(),
      };
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      await env.COMENTARIOS.put("c:" + id, JSON.stringify(reg), { expirationTtl: 60 * 60 * 24 * 365 });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...h, "Content-Type": "application/json" } });
    }

    const clave = url.searchParams.get("clave") || "";
    if (!env.CLAVE || clave !== env.CLAVE) return new Response("Bandeja privada.", { status: 401 });

    if (url.pathname === "/borrar" && request.method === "POST") {
      await env.COMENTARIOS.delete("c:" + (url.searchParams.get("id") || ""));
      return Response.redirect(url.origin + "/?clave=" + encodeURIComponent(clave), 303);
    }

    const lista = await env.COMENTARIOS.list({ prefix: "c:", limit: 1000 });
    const items = await Promise.all(lista.keys.map(async (k) => [k.name.slice(2), JSON.parse((await env.COMENTARIOS.get(k.name)) || "{}")]));
    items.sort((a, b) => (b[1].fecha || "").localeCompare(a[1].fecha || ""));
    const filas = items.map(([id, c]) => `<tr><td>${esc((c.fecha || "").slice(0, 16).replace("T", " "))}</td><td>${esc(c.libro)}</td>
      <td><a href="https://santiagoalzates.com/${esc(c.libro)}/${esc(c.pagina)}.html" target="_blank">${esc(c.pagina)}</a></td><td>${esc(c.tipo)}</td>
      <td style="white-space:pre-wrap">${esc(c.texto)}</td><td><form method="post" action="/borrar?clave=${encodeURIComponent(clave)}&id=${id}"><button>Atendido ✓</button></form></td></tr>`).join("");
    return new Response(`<!doctype html><meta charset="utf-8"><title>Comentarios de los libros</title>
      <style>body{font-family:system-ui;margin:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}</style>
      <h1>Comentarios de los libros (${items.length})</h1><table><tr><th>Fecha</th><th>Libro</th><th>Página</th><th>Tipo</th><th>Comentario</th><th></th></tr>${filas}</table>`,
      { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  },
};

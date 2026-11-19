/* Contador de visitas de santiagoalzates.com
 *
 * Cloudflare Worker con un espacio KV llamado VISITAS.
 *
 *   POST /visita   suma una visita y devuelve el total
 *   GET  /         devuelve el total sin tocarlo
 *
 * El navegador sólo hace el POST una vez por sesión, de modo que recargar
 * la página no infla la cuenta.
 */

const CLAVE = "total";

const ORIGENES = [
  "https://santiagoalzates.com",
  "https://www.santiagoalzates.com",
  "https://salzate-cloud.github.io",
];

function cabeceras(origen) {
  return {
    "Access-Control-Allow-Origin": ORIGENES.indexOf(origen) !== -1 ? origen : ORIGENES[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

export default {
  async fetch(request, env) {
    const origen = request.headers.get("Origin") || "";
    const cors = cabeceras(origen);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const ruta = new URL(request.url).pathname;
    let total = parseInt((await env.VISITAS.get(CLAVE)) || "0", 10);
    if (!isFinite(total) || total < 0) total = 0;

    if (ruta === "/visita" && request.method === "POST") {
      total += 1;
      await env.VISITAS.put(CLAVE, String(total));
    }

    return new Response(JSON.stringify({ total: total }), { headers: cors });
  },
};

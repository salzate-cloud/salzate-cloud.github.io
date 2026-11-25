/* Pizarra de construcciones para la clase: puntos, rectas, segmentos, circunferencias,
   perpendiculares, paralelas, punto medio, mediatriz, bisectriz, intersecciones, polígonos,
   medidas de ángulos y distancias, y lápiz libre. Todo se puede arrastrar: las construcciones
   se actualizan solas.  Santiago Alzate · santiagoalzates.com */
(function () {
  'use strict';
  var W = 1280, H = 720, NS = 'http://www.w3.org/2000/svg';
  var COL = ['#1d2420', '#006633', '#1955a0', '#b22222', '#c47800', '#664896', '#006e78'];
  var cont = document.querySelector('.pizarra');
  if (!cont) return;
  var O = [], pila = [], herr = 'mover', sel = [], color = COL[2], fondo = 'transp', rejilla = false, ejes = false;
  var nombres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  cont.innerHTML =
    '<div class="pz-barra">' +
    [['mover', '✋', 'Mover (arrastre puntos)'], ['punto', '•', 'Punto'], ['seg', '⁄', 'Segmento'], ['recta', '↔', 'Recta'], ['rayo', '→', 'Semirrecta'],
     ['circ', '◯', 'Circunferencia (centro y punto)'], ['perp', '⊥', 'Perpendicular (recta y punto)'], ['para', '∥', 'Paralela (recta y punto)'],
     ['medio', 'M', 'Punto medio (dos puntos)'], ['mediatriz', '⊥M', 'Mediatriz (dos puntos)'], ['bisec', '∠½', 'Bisectriz (punto, vértice, punto)'],
     ['inter', '✕', 'Intersección (dos líneas)'], ['poli', '▱', 'Polígono (clic en el primer punto para cerrar)'], ['ang', '∡', 'Medir ángulo (punto, vértice, punto)'],
     ['dist', '↦', 'Medir distancia (dos puntos)'], ['lapiz', '✎', 'Lápiz'], ['borrar', '⌫', 'Borrar objeto']].map(function (h) {
      return '<button class="pz-h" data-h="' + h[0] + '" title="' + h[2] + '">' + h[1] + '</button>';
    }).join('') +
    '<span class="pz-sep"></span>' + COL.map(function (c) { return '<button class="pz-c" data-c="' + c + '" style="background:' + c + '" title="Color"></button>'; }).join('') +
    '<span class="pz-sep"></span><button class="pz-o" data-o="fondo" title="Fondo: sobre la diapositiva / hoja blanca">▣</button><button class="pz-o" data-o="rejilla" title="Cuadrícula">#</button>' +
    '<button class="pz-o" data-o="ejes" title="Ejes cartesianos">⊹</button><button class="pz-o" data-o="deshacer" title="Deshacer (Ctrl+Z)">↶</button>' +
    '<button class="pz-o" data-o="limpiar" title="Borrar todo">🗑</button><button class="pz-o pz-x" data-o="cerrar" title="Cerrar la pizarra (P)">✕</button></div>' +
    '<div class="pz-ayuda"></div><svg class="pz-svg" viewBox="0 0 ' + W + ' ' + H + '"></svg>';
  var svg = cont.querySelector('.pz-svg'), ayuda = cont.querySelector('.pz-ayuda');
  var AY = { mover: 'Arrastre cualquier punto: la construcción se actualiza.', punto: 'Clic para poner un punto.', seg: 'Elija dos puntos (o haga clic en el vacío para crearlos).',
    recta: 'Elija dos puntos.', rayo: 'Elija el origen y otro punto.', circ: 'Elija el centro y un punto de la circunferencia.', perp: 'Elija una recta (o segmento) y luego un punto.',
    para: 'Elija una recta (o segmento) y luego un punto.', medio: 'Elija dos puntos.', mediatriz: 'Elija dos puntos.', bisec: 'Elija un punto, el vértice y otro punto.',
    inter: 'Elija dos líneas o circunferencias.', poli: 'Elija los vértices; cierre tocando el primero.', ang: 'Elija un punto, el vértice y otro punto.', dist: 'Elija dos puntos.',
    lapiz: 'Dibuje a mano alzada.', borrar: 'Toque un objeto para borrarlo (y lo que depende de él).' };

  /* ---------- geometría ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; } function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function mul(a, t) { return [a[0] * t, a[1] * t]; } function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function len(a) { return Math.hypot(a[0], a[1]); } function nor(a) { var n = len(a) || 1; return [a[0] / n, a[1] / n]; }
  function perp(a) { return [-a[1], a[0]]; }
  function byId(id) { for (var k = 0; k < O.length; k++) if (O[k].id === id) return O[k]; return null; }
  var sigId = 1;
  function pos(o) { // posición de un punto
    if (o._p) return o._p;
    var r = null;
    if (o.t === 'P') r = [o.x, o.y];
    else if (o.t === 'medio') { var a = pos(byId(o.a)), b = pos(byId(o.b)); r = a && b ? mul(add(a, b), 0.5) : null; }
    else if (o.t === 'inter') { var I = inters(byId(o.a), byId(o.b)); r = I[o.k] || null; }
    o._p = r; return r;
  }
  function linea(o) { // {p, d, tipo:'recta'|'seg'|'rayo', a, b}
    if (o._l !== undefined) return o._l;
    var r = null, A, B;
    if (o.t === 'seg' || o.t === 'recta' || o.t === 'rayo') { A = pos(byId(o.a)); B = pos(byId(o.b)); if (A && B && len(sub(B, A)) > 1e-6) r = { p: A, d: nor(sub(B, A)), tipo: o.t, A: A, B: B }; }
    else if (o.t === 'perp' || o.t === 'para') { var L = linea(byId(o.l)), P = pos(byId(o.p)); if (L && P) r = { p: P, d: o.t === 'perp' ? perp(L.d) : L.d, tipo: 'recta' }; }
    else if (o.t === 'mediatriz') { A = pos(byId(o.a)); B = pos(byId(o.b)); if (A && B && len(sub(B, A)) > 1e-6) r = { p: mul(add(A, B), 0.5), d: perp(nor(sub(B, A))), tipo: 'recta' }; }
    else if (o.t === 'bisec') { A = pos(byId(o.a)); var V = pos(byId(o.v)); B = pos(byId(o.b)); if (A && V && B) { var u = add(nor(sub(A, V)), nor(sub(B, V))); if (len(u) < 1e-6) u = perp(nor(sub(A, V))); r = { p: V, d: nor(u), tipo: 'rayo', A: V }; } }
    o._l = r; return r;
  }
  function circulo(o) { if (o.t !== 'circ') return null; var C = pos(byId(o.c)), P = pos(byId(o.p)); return C && P ? { c: C, r: len(sub(P, C)) } : null; }
  function inters(o1, o2) {
    if (!o1 || !o2) return [];
    var L1 = linea(o1), L2 = linea(o2), C1 = circulo(o1), C2 = circulo(o2);
    if (L1 && L2) { var den = L1.d[0] * L2.d[1] - L1.d[1] * L2.d[0]; if (Math.abs(den) < 1e-9) return []; var w = sub(L2.p, L1.p), t = (w[0] * L2.d[1] - w[1] * L2.d[0]) / den; return [add(L1.p, mul(L1.d, t))]; }
    if (L1 && C2 || L2 && C1) { var L = L1 || L2, C = C1 || C2, f = sub(L.p, C.c), b = dot(f, L.d), c = dot(f, f) - C.r * C.r, dd = b * b - c; if (dd < 0) return []; var s = Math.sqrt(dd); return [add(L.p, mul(L.d, -b - s)), add(L.p, mul(L.d, -b + s))]; }
    if (C1 && C2) { var D = sub(C2.c, C1.c), d = len(D); if (d < 1e-9 || d > C1.r + C2.r || d < Math.abs(C1.r - C2.r)) return []; var a = (C1.r * C1.r - C2.r * C2.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, C1.r * C1.r - a * a)), u = nor(D), M = add(C1.c, mul(u, a)); return [add(M, mul(perp(u), h)), add(M, mul(perp(u), -h))]; }
    return [];
  }
  function esPunto(o) { return o.t === 'P' || o.t === 'medio' || o.t === 'inter'; }
  function esLinea(o) { return ['seg', 'recta', 'rayo', 'perp', 'para', 'mediatriz', 'bisec'].indexOf(o.t) >= 0; }
  function deps(o) { return ['a', 'b', 'c', 'p', 'l', 'v'].map(function (k) { return o[k]; }).filter(Boolean).concat(o.pts || []); }

  /* ---------- dibujo ---------- */
  function extremos(L) {
    var R = 4000;
    if (L.tipo === 'seg') return [L.A, L.B];
    if (L.tipo === 'rayo') return [L.A || L.p, add(L.A || L.p, mul(L.d, R))];
    return [add(L.p, mul(L.d, -R)), add(L.p, mul(L.d, R))];
  }
  function fmt(x, d) { return x.toFixed(d === undefined ? 1 : d).replace('.', ','); }
  function pinta() {
    O.forEach(function (o) { delete o._p; delete o._l; });
    var h = [];
    if (fondo === 'hoja') h.push('<rect width="' + W + '" height="' + H + '" fill="#fff"/>');
    if (rejilla) { for (var x = 40; x < W; x += 40) h.push('<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '" stroke="#dbe5df" stroke-width="1"/>'); for (var y = 40; y < H; y += 40) h.push('<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" stroke="#dbe5df" stroke-width="1"/>'); }
    if (ejes) { h.push('<line x1="0" y1="360" x2="' + W + '" y2="360" stroke="#7a857f" stroke-width="1.6"/><line x1="640" y1="0" x2="640" y2="' + H + '" stroke="#7a857f" stroke-width="1.6"/>');
      for (var k = -15; k <= 15; k++) if (k) { h.push('<text x="' + (640 + 40 * k) + '" y="378" font-size="12" fill="#7a857f" text-anchor="middle">' + k + '</text>'); if (Math.abs(k) <= 8) h.push('<text x="628" y="' + (364 - 40 * k) + '" font-size="12" fill="#7a857f" text-anchor="end">' + k + '</text>'); } }
    // rellenos primero
    O.forEach(function (o) { if (o.t === 'poli') { var ps = o.pts.map(function (id) { return pos(byId(id)); }); if (ps.every(Boolean)) h.push('<path d="M' + ps.map(function (p) { return p.join(','); }).join('L') + 'Z" fill="' + o.col + '" fill-opacity=".16" stroke="' + o.col + '" stroke-width="2.6" stroke-linejoin="round"/>'); } });
    O.forEach(function (o) {
      var s = esSel(o) ? ' class="pz-sel"' : '';
      if (o.t === 'trazo') h.push('<path d="M' + o.pts.map(function (p) { return p.join(','); }).join('L') + '" fill="none" stroke="' + o.col + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>');
      else if (esLinea(o)) { var L = linea(o); if (!L) return; var e = extremos(L); h.push('<line' + s + ' x1="' + e[0][0] + '" y1="' + e[0][1] + '" x2="' + e[1][0] + '" y2="' + e[1][1] + '" stroke="' + o.col + '" stroke-width="' + (o.t === 'seg' ? 3.2 : 2.4) + '" stroke-linecap="round"' + (o.t === 'mediatriz' || o.t === 'bisec' ? ' stroke-dasharray="10 6"' : '') + '/>'); }
      else if (o.t === 'circ') { var C = circulo(o); if (C) h.push('<circle' + s + ' cx="' + C.c[0] + '" cy="' + C.c[1] + '" r="' + C.r + '" fill="none" stroke="' + o.col + '" stroke-width="2.6"/>'); }
      else if (o.t === 'ang') {
        var A = pos(byId(o.a)), V = pos(byId(o.v)), B = pos(byId(o.b)); if (!A || !V || !B) return;
        var u = nor(sub(A, V)), w = nor(sub(B, V)), t1 = Math.atan2(u[1], u[0]), t2 = Math.atan2(w[1], w[0]), dd = t2 - t1;
        while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI;
        var r = 34, p1 = add(V, mul(u, r)), p2 = add(V, mul([Math.cos(t1 + dd), Math.sin(t1 + dd)], r)), g = Math.abs(dd) * 180 / Math.PI;
        h.push('<path d="M' + V + 'L' + p1 + 'A' + r + ',' + r + ' 0 0 ' + (dd > 0 ? 1 : 0) + ' ' + p2 + 'Z" fill="' + o.col + '" fill-opacity=".22" stroke="' + o.col + '" stroke-width="1.6"/>');
        var m = add(V, mul([Math.cos(t1 + dd / 2), Math.sin(t1 + dd / 2)], r + 26));
        h.push(txt(m, fmt(g) + '°', o.col, 19, true));
      } else if (o.t === 'dist') {
        var P1 = pos(byId(o.a)), P2 = pos(byId(o.b)); if (!P1 || !P2) return;
        var mm = mul(add(P1, P2), 0.5), nn = mul(nor(perp(sub(P2, P1))), 18);
        h.push('<line x1="' + P1[0] + '" y1="' + P1[1] + '" x2="' + P2[0] + '" y2="' + P2[1] + '" stroke="' + o.col + '" stroke-width="1.4" stroke-dasharray="4 4"/>');
        h.push(txt(add(mm, nn), fmt(len(sub(P2, P1)) / 40, 2), o.col, 18, true));
      }
    });
    O.forEach(function (o) {
      if (!esPunto(o)) return; var p = pos(o); if (!p) return;
      var libre = o.t === 'P', sl = esSel(o);
      h.push('<g class="pz-pt' + (libre ? ' libre' : '') + '" data-id="' + o.id + '">' + (libre ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="' + o.col + '" fill-opacity=".12"/>' : '') +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (sl ? 8 : 6) + '" fill="' + (libre ? o.col : '#fff') + '" stroke="' + (libre ? '#fff' : o.col) + '" stroke-width="2.4"/></g>');
      h.push(txt([p[0] + 14, p[1] - 14], o.n, o.col, 20, false, true));
    });
    if (herr === 'poli' && sel.length) { var q = sel.map(function (id) { return pos(byId(id)); }); h.push('<path d="M' + q.map(function (p) { return p.join(','); }).join('L') + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="6 5"/>'); }
    svg.innerHTML = h.join('');
  }
  function txt(p, t, c, s, b, it) { return '<text x="' + p[0] + '" y="' + p[1] + '" fill="' + c + '" font-size="' + s + '" text-anchor="middle" dominant-baseline="middle" font-family="Palatino Linotype,Palatino,Georgia,serif"' + (b ? ' font-weight="700"' : '') + (it ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round">' + t + '</text>'; }
  function esSel(o) { return sel.indexOf(o.id) >= 0; }

  /* ---------- interacción ---------- */
  function guarda() { pila.push(JSON.stringify(O)); if (pila.length > 80) pila.shift(); }
  function nuevo(o) { o.id = sigId++; o.col = o.col || color; if (esPunto(o) && !o.n) o.n = nombreLibre(); O.push(o); return o.id; }
  function nombreLibre() { var usados = O.filter(esPunto).map(function (o) { return o.n; }); for (var k = 0; k < 200; k++) { var n = nombres[k % 26] + (k >= 26 ? Math.floor(k / 26) : ''); if (usados.indexOf(n) < 0) return n; } return '?'; }
  function xy(e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
  function puntoCerca(p) { var mejor = null, dm = 16; O.forEach(function (o) { if (!esPunto(o)) return; var q = pos(o); if (!q) return; var d = len(sub(p, q)); if (d < dm) { dm = d; mejor = o; } }); return mejor; }
  function curvaCerca(p) {
    var mejor = null, dm = 12;
    O.forEach(function (o) {
      var d = 1e9;
      if (esLinea(o)) { var L = linea(o); if (!L) return; var e = extremos(L), v = sub(e[1], e[0]), t = Math.max(0, Math.min(1, dot(sub(p, e[0]), v) / dot(v, v))); d = len(sub(p, add(e[0], mul(v, t)))); }
      else if (o.t === 'circ') { var C = circulo(o); if (C) d = Math.abs(len(sub(p, C.c)) - C.r); }
      else return;
      if (d < dm) { dm = d; mejor = o; }
    });
    return mejor;
  }
  function pidePunto(p) { var o = puntoCerca(p); if (o) return o.id; guarda(); return nuevo({ t: 'P', x: p[0], y: p[1] }); }
  var arr = null, trazo = null;
  svg.addEventListener('pointerdown', function (e) {
    e.stopPropagation(); e.preventDefault();
    var p = xy(e); svg.setPointerCapture(e.pointerId);
    if (herr === 'lapiz') { guarda(); trazo = { t: 'trazo', pts: [p] }; nuevo(trazo); pinta(); return; }
    if (herr === 'mover') { var o = puntoCerca(p); if (o && o.t === 'P') { guarda(); arr = o; } return; }
    if (herr === 'borrar') {
      var b = puntoCerca(p) || curvaCerca(p) || trazoCerca(p); if (!b) return; guarda();
      var fuera = [b.id], cambio = true;
      while (cambio) { cambio = false; O.forEach(function (o) { if (fuera.indexOf(o.id) < 0 && deps(o).some(function (d) { return fuera.indexOf(d) >= 0; })) { fuera.push(o.id); cambio = true; } }); }
      O = O.filter(function (o) { return fuera.indexOf(o.id) < 0; }); pinta(); return;
    }
    if (herr === 'punto') { var c = puntoCerca(p); if (!c) { guarda(); nuevo({ t: 'P', x: p[0], y: p[1] }); } pinta(); return; }
    if (herr === 'perp' || herr === 'para') {
      if (!sel.length) { var cv = curvaCerca(p); if (cv && esLinea(cv)) sel = [cv.id]; pinta(); return; }
      var pp = pidePunto(p); nuevo({ t: herr, l: sel[0], p: pp }); sel = []; pinta(); return;
    }
    if (herr === 'inter') {
      var cu = curvaCerca(p); if (!cu) return; if (sel.indexOf(cu.id) < 0) sel.push(cu.id);
      if (sel.length === 2) { guarda(); var I = inters(byId(sel[0]), byId(sel[1])); for (var k = 0; k < I.length; k++) nuevo({ t: 'inter', a: sel[0], b: sel[1], k: k }); sel = []; }
      pinta(); return;
    }
    if (herr === 'poli') {
      var pid = pidePunto(p);
      if (sel.length >= 3 && pid === sel[0]) { nuevo({ t: 'poli', pts: sel.slice() }); sel = []; }
      else if (sel.indexOf(pid) < 0) sel.push(pid);
      pinta(); return;
    }
    var n = { seg: 2, recta: 2, rayo: 2, circ: 2, medio: 2, mediatriz: 2, dist: 2, bisec: 3, ang: 3 }[herr];
    if (n) {
      var id = pidePunto(p); if (sel.indexOf(id) < 0 || n === 3) sel.push(id);
      if (sel.length === n) {
        if (herr === 'circ') nuevo({ t: 'circ', c: sel[0], p: sel[1] });
        else if (n === 3) nuevo({ t: herr, a: sel[0], v: sel[1], b: sel[2] });
        else nuevo({ t: herr, a: sel[0], b: sel[1] });
        sel = [];
      }
      pinta();
    }
  });
  function trazoCerca(p) { var m = null; O.forEach(function (o) { if (o.t === 'trazo' && o.pts.some(function (q) { return len(sub(q, p)) < 12; })) m = o; }); return m; }
  svg.addEventListener('pointermove', function (e) {
    var p = xy(e);
    if (trazo) { trazo.pts.push(p); pinta(); return; }
    if (arr) { arr.x = p[0]; arr.y = p[1]; if (rejilla || ejes) { arr.x = Math.round(arr.x / 20) * 20; arr.y = Math.round(arr.y / 20) * 20; } pinta(); }
  });
  function suelta() { arr = null; trazo = null; }
  svg.addEventListener('pointerup', suelta); svg.addEventListener('pointercancel', suelta);

  cont.querySelectorAll('.pz-h').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); elige(b.getAttribute('data-h')); }; });
  cont.querySelectorAll('.pz-c').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); color = b.getAttribute('data-c'); cont.querySelectorAll('.pz-c').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
  cont.querySelectorAll('.pz-o').forEach(function (b) {
    b.onclick = function (e) {
      e.stopPropagation(); var o = b.getAttribute('data-o');
      if (o === 'fondo') { fondo = fondo === 'hoja' ? 'transp' : 'hoja'; b.classList.toggle('on', fondo === 'hoja'); }
      else if (o === 'rejilla') { rejilla = !rejilla; b.classList.toggle('on', rejilla); }
      else if (o === 'ejes') { ejes = !ejes; b.classList.toggle('on', ejes); }
      else if (o === 'deshacer') deshace();
      else if (o === 'limpiar') { if (O.length) { guarda(); O = []; sel = []; } }
      else if (o === 'cerrar') return alterna(false);
      pinta();
    };
  });
  function deshace() { if (pila.length) { O = JSON.parse(pila.pop()); sel = []; sigId = O.reduce(function (m, o) { return Math.max(m, o.id + 1); }, 1); pinta(); } }
  function elige(h) { herr = h; sel = []; cont.querySelectorAll('.pz-h').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-h') === h); }); ayuda.textContent = AY[h] || ''; cont.setAttribute('data-h', h); pinta(); }
  function alterna(on) {
    on = on === undefined ? !document.body.classList.contains('pizarra-on') : on;
    document.body.classList.toggle('pizarra-on', on);
    if (on && herr === 'mover' && !O.length) elige('recta');
  }
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); alterna(); }
    else if (document.body.classList.contains('pizarra-on')) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); deshace(); }
      else if (e.key === 'Escape') { if (sel.length) { sel = []; pinta(); } else alterna(false); }
    }
  });
  cont.addEventListener('click', function (e) { e.stopPropagation(); });
  window.Pizarra = { alterna: alterna, elige: elige };
  cont.querySelector('.pz-c[data-c="' + color + '"]').classList.add('on');
  elige('mover');
})();

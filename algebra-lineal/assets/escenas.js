/* Escenas: el dibujo interactivo de cada problema de aplicación.  santiagoalzates.com */
(function () {
  'use strict';
  if (!window.EXPLORA || !window.EXPLORA_U) return;
  var U = window.EXPLORA_U, W = window.EXPLORA, COL = U.COL, f2 = U.f2;

  /* ---------- utilidades comunes ---------- */
  function lienzoPx(cont, alto) {                 /* lienzo en píxeles (para escenas dibujadas a mano) */
    var c = document.createElement('canvas'); c.className = 'exp-canvas esc-canvas'; c.setAttribute('role', 'img');
    cont.appendChild(c);
    var L = { c: c, g: c.getContext('2d'), w: 0, h: alto };
    L.ajusta = function () {
      var w = Math.min(cont.clientWidth || 600, 720), dpr = window.devicePixelRatio || 1;
      var hh = typeof alto === 'function' ? alto(w) : alto; L.h = hh;
      c.style.width = w + 'px'; c.style.height = hh + 'px'; c.width = w * dpr; c.height = hh * dpr;
      L.g.setTransform(dpr, 0, 0, dpr, 0, 0); L.w = w;
    };
    L.ajusta(); window.addEventListener('resize', function () { L.ajusta(); if (L.redibuja) L.redibuja(); });
    return L;
  }
  function fila(c) { var d = document.createElement('div'); d.className = 'exp-ctr'; c.appendChild(d); return d; }
  function boton(cont, txt, fn, tit) { var b = document.createElement('button'); b.type = 'button'; b.className = 'esc-btn'; b.textContent = txt; if (tit) b.title = tit; b.addEventListener('click', fn); cont.appendChild(b); return b; }
  function azar(sem) { return function () { sem = (sem * 16807) % 2147483647; return (sem - 1) / 2147483646; }; }
  function miles(x) { x = Math.round(x); return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function sinAnim() { return document.documentElement.classList.contains('sin-animacion') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function vista(L, xa, xb, ya, yb, pad) {            /* escala isotrópica centrada: mundo → píxeles */
    pad = pad === undefined ? 16 : pad;
    var s = Math.min((L.w - 2 * pad) / (xb - xa), (L.h - 2 * pad) / (yb - ya)), ox = (L.w - s * (xb - xa)) / 2, oy = (L.h - s * (yb - ya)) / 2;
    return { s: s, X: function (x) { return ox + (x - xa) * s; }, Y: function (y) { return L.h - oy - (y - ya) * s; } };
  }
  function flecha(g, x1, y1, x2, y2, col, w, cab) {
    var a = Math.atan2(y2 - y1, x2 - x1), c = cab || 10; g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w || 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - Math.cos(a) * c * 0.6, y2 - Math.sin(a) * c * 0.6); g.stroke();
    g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - c * Math.cos(a - 0.4), y2 - c * Math.sin(a - 0.4)); g.lineTo(x2 - c * Math.cos(a + 0.4), y2 - c * Math.sin(a + 0.4)); g.closePath(); g.fill(); g.restore();
  }
  function rotulo(g, t, x, y, col, al, tam, fondo) {   /* «T_AB» se dibuja con subíndice de verdad */
    var T = tam || 13, f1 = (T > 13 ? '600 ' : '') + T + 'px system-ui, sans-serif', f2 = Math.round(T * 0.72) + 'px system-ui, sans-serif';
    var trozos = String(t).split(/_(\{[^}]*\}|[A-Za-z0-9]+)/).map(function (p, i) { return { t: i % 2 ? p.replace(/[{}]/g, '') : p, sub: i % 2 === 1 }; }).filter(function (p) { return p.t; });
    g.save(); g.textBaseline = 'middle'; g.textAlign = 'left';
    var w = 0; trozos.forEach(function (p) { g.font = p.sub ? f2 : f1; p.w = g.measureText(p.t).width; w += p.w; });
    var x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2, cw = g.canvas.width / (g.getTransform ? g.getTransform().a || 1 : 1);
    if (fondo !== false) x0 = Math.max(6, Math.min(cw - w - 6, x0));
    if (fondo !== false) { g.fillStyle = fondo || 'rgba(255,255,255,.85)'; rr(g, x0 - 5, y - 10, w + 10, 20, 7); g.fill(); }
    g.fillStyle = col || COL.tinta; trozos.forEach(function (p) { g.font = p.sub ? f2 : f1; g.fillText(p.t, x0, y + 0.5 + (p.sub ? T * 0.3 : 0)); x0 += p.w; }); g.restore();
  }
  function panel(g, lineas, x, y) {
    g.save(); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '600 13.5px system-ui, sans-serif'; var w = 0; lineas.forEach(function (l, i) { g.font = (i ? '' : '600 ') + (i ? 12.5 : 14) + 'px system-ui, sans-serif'; w = Math.max(w, g.measureText(l).width); });
    g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, x, y, w + 20, 12 + lineas.length * 19, 10); g.fill();
    lineas.forEach(function (l, i) { g.font = (i ? '' : '600 ') + (i ? 12.5 : 14) + 'px system-ui, sans-serif'; g.fillStyle = i ? '#4d5762' : COL.tinta; g.fillText(l, x + 10, y + 21 + i * 19); }); g.restore();
  }
  function persona(g, x, y, h, col, paso) {         /* (x, y) = pies; h = estatura en px */
    var k = h / 60, p = Math.sin(paso || 0) * 6 * k; g.save(); g.strokeStyle = col || '#2d3640'; g.fillStyle = col || '#2d3640'; g.lineCap = 'round'; g.lineWidth = 5 * k;
    g.beginPath(); g.moveTo(x, y - 28 * k); g.lineTo(x - p, y); g.moveTo(x, y - 28 * k); g.lineTo(x + p, y); g.stroke();
    g.lineWidth = 7 * k; g.beginPath(); g.moveTo(x, y - 28 * k); g.lineTo(x, y - 47 * k); g.stroke();
    g.lineWidth = 4 * k; g.beginPath(); g.moveTo(x, y - 45 * k); g.lineTo(x + p * 0.8, y - 31 * k); g.moveTo(x, y - 45 * k); g.lineTo(x - p * 0.8, y - 31 * k); g.stroke();
    g.beginPath(); g.arc(x, y - 53 * k, 6.5 * k, 0, 7); g.fill(); g.restore();
  }
  function reloj(cont, s, max, vel, txt) {            /* botón ▶ que avanza el deslizador s hasta max */
    var id = null, b = boton(cont, txt || '▶ Animar', function () { if (id) return alto(); if (s.v >= max - 1e-9) s.v = parseFloat(s.inp.min); b.textContent = '⏸ Pausa'; var t0 = performance.now(), v0 = s.v;
      (function paso(t) { if (!id) return; var v = Math.min(max, v0 + (t - t0) / 1000 * vel); s.v = v; s.inp.dispatchEvent(new Event('input')); if (v >= max) { alto(); return; } id = requestAnimationFrame(paso); })(t0); id = 1; });
    function alto() { if (id && id !== 1) cancelAnimationFrame(id); id = null; b.textContent = txt || '▶ Animar'; }
    s.inp.addEventListener('pointerdown', alto); return { para: alto };
  }
  function alLlegar(s, objetivo, tol, R, c) { var hecho = false; return function () { if (!hecho && Math.abs(s.v - objetivo) <= tol) { hecho = true; R.evalua(1); if (c.__fin) c.__fin(); } }; }
  function cielo(g, w, h, a, b) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a || '#8cc3e4'); gr.addColorStop(1, b || '#eef7f2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (!a) { var sol = g.createRadialGradient(w * 0.9, 0, 4, w * 0.9, 0, 160); sol.addColorStop(0, 'rgba(255,244,200,.9)'); sol.addColorStop(1, 'rgba(255,244,200,0)'); g.fillStyle = sol; g.fillRect(0, 0, w, h); } }
  function nube(g, x, y, k) { nubeR(g, x, y, k); }
  function suelo(g, w, y0, h, col) {                      /* terreno con pasto, manchas y tierra */
    var gr = g.createLinearGradient(0, y0, 0, h); gr.addColorStop(0, col || '#8fc27a'); gr.addColorStop(1, '#5a9445'); g.fillStyle = gr; g.fillRect(0, y0, w, h - y0);
    var r = azar(3); g.save(); g.beginPath(); g.rect(0, y0, w, h - y0); g.clip();
    for (var k = 0; k < 10; k++) { var mx = r() * w, my = y0 + r() * (h - y0), rg = g.createRadialGradient(mx, my, 2, mx, my, 30 + r() * 50); rg.addColorStop(0, r() < 0.5 ? 'rgba(50,95,30,.18)' : 'rgba(215,235,160,.2)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(mx - 90, my - 90, 180, 180); }
    for (var i = 0; i < Math.min(520, w * 0.9); i++) { var px = r() * w, py = y0 + 2 + Math.pow(r(), 0.8) * (h - y0), l = 3 + r() * 4 + (py - y0) * 0.05, c = 95 + r() * 60;
      g.strokeStyle = 'rgba(' + (35 + c * 0.25 | 0) + ',' + (c | 0) + ',' + (30 + c * 0.15 | 0) + ',.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 1, py - l * 0.6, px + (r() - 0.5) * 4, py - l); g.stroke(); }
    g.restore();
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y0, w, 2);
  }

  function sombraPiso(g, x, y, rx, ry, a) {          /* sombra suave proyectada (luz arriba a la derecha) */
    var gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgba(20,35,15,' + (a || 0.32) + ')'); gr.addColorStop(1, 'rgba(20,35,15,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill(); g.restore();
  }
  function Poblador(redibuja) {                       /* hace aparecer (y desaparecer) las cosas poco a poco */
    var nac = {}, primero = true, pend = false;
    return {
      a: function (k) { if (!(k in nac)) nac[k] = primero || sinAnim() ? -1e9 : performance.now(); return Math.min(1, (performance.now() - nac[k]) / 420); },
      cierra: function (vivos) {
        primero = false; var hay = false, t = performance.now();
        Object.keys(nac).forEach(function (k) { if (vivos.indexOf(k) < 0) delete nac[k]; else if (t - nac[k] < 420) hay = true; });
        if (hay && !pend) { pend = true; requestAnimationFrame(function () { pend = false; redibuja(); }); }
      }
    };
  }
  function sitiosRect(n, sem) {                        /* puntos repartidos en [0,1]² (rejilla con ruido), en orden aleatorio fijo */
    var r = azar(sem || 3), c = Math.ceil(Math.sqrt(n * 1.6)), f = Math.ceil(n / c) + 1, P = [];
    for (var i = 0; i < f; i++) for (var j = 0; j < c; j++) P.push([(j + 0.2 + r() * 0.6) / c, (i + 0.2 + r() * 0.6) / f]);
    for (var k = P.length - 1; k > 0; k--) { var q = Math.floor(r() * (k + 1)), t = P[k]; P[k] = P[q]; P[q] = t; }
    return P;
  }
  function oveja(g, x, y, k, dir) {
    sombraPiso(g, x - 3 * k, y + 4 * k, 9 * k, 2.2 * k, 0.3);
    g.save(); g.translate(x, y); g.scale(dir * k, k);
    g.strokeStyle = '#3b3b3b'; g.lineWidth = 1.6; g.lineCap = 'round'; [[-4, 1], [-1.5, 1], [2.5, 1], [5, 1]].forEach(function (p) { g.beginPath(); g.moveTo(p[0], 2); g.lineTo(p[0], 6); g.stroke(); });
    var gr = g.createRadialGradient(-2, -3, 1, 0, 0, 9); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d9d6cf');
    g.fillStyle = gr; [[-5, 0, 4], [-1.5, -2.5, 4.4], [2.5, -1.5, 4.2], [4.5, 1, 3.6], [-2, 2, 4], [1.5, 2, 4]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 7); g.fill(); });
    g.fillStyle = '#2f2f2f'; g.beginPath(); g.ellipse(8.2, -1.6, 2.8, 2.2, 0.3, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(9, -2.2, 0.6, 0, 7); g.fill();
    g.restore();
  }
  function flor(g, x, y, k, col) {
    g.save(); g.strokeStyle = '#3f7d45'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(x, y + 5 * k); g.lineTo(x, y); g.stroke();
    g.fillStyle = col; for (var i = 0; i < 5; i++) { var a = i * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 2.4 * k, y + Math.sin(a) * 2.4 * k, 1.8 * k, 0, 7); g.fill(); }
    g.fillStyle = '#f6c945'; g.beginPath(); g.arc(x, y, 1.4 * k, 0, 7); g.fill(); g.restore();
  }
  function barril(g, x, y, k) {
    sombraPiso(g, x, y + 7 * k, 7 * k, 2 * k, 0.3);
    var gr = g.createLinearGradient(x - 6 * k, 0, x + 6 * k, 0); gr.addColorStop(0, '#7a4a22'); gr.addColorStop(0.45, '#c48a4f'); gr.addColorStop(1, '#6a3d18');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 5 * k, y - 7 * k); g.quadraticCurveTo(x - 7 * k, y, x - 5 * k, y + 7 * k); g.lineTo(x + 5 * k, y + 7 * k); g.quadraticCurveTo(x + 7 * k, y, x + 5 * k, y - 7 * k); g.closePath(); g.fill();
    g.strokeStyle = '#3c3c3c'; g.lineWidth = 1.2 * k; [-4, 4].forEach(function (d) { g.beginPath(); g.moveTo(x - 6 * k, y + d * k); g.lineTo(x + 6 * k, y + d * k); g.stroke(); });
    g.fillStyle = '#8a5a2b'; g.beginPath(); g.ellipse(x, y - 7 * k, 5 * k, 1.6 * k, 0, 0, 7); g.fill();
  }
  function balde(g, x, y, k, lleno) {
    sombraPiso(g, x, y + 8 * k, 9 * k, 2 * k, 0.3);
    var gr = g.createLinearGradient(x - 7 * k, 0, x + 7 * k, 0); gr.addColorStop(0, '#9aa5b1'); gr.addColorStop(0.4, '#e4e9ee'); gr.addColorStop(1, '#7d8893');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 7 * k, y - 7 * k); g.lineTo(x + 7 * k, y - 7 * k); g.lineTo(x + 5 * k, y + 8 * k); g.lineTo(x - 5 * k, y + 8 * k); g.closePath(); g.fill();
    g.fillStyle = 'rgba(60,150,220,' + (0.5 + 0.4 * lleno) + ')'; g.beginPath(); g.ellipse(x, y - 7 * k + (1 - lleno) * 10 * k, 7 * k - (1 - lleno) * 1.3 * k, 1.8 * k, 0, 0, 7); g.fill();
    g.strokeStyle = '#5e6873'; g.lineWidth = 1.2 * k; g.beginPath(); g.arc(x, y - 7 * k, 7 * k, Math.PI, 0); g.stroke();
  }

  function iconos(g, P, n, dib, x0, y0, dx, dy, porFila, pref, k) {   /* n dibujitos que aparecen o se van poco a poco */
    var vivos = [];
    for (var q = 0; q < n; q++) { var key = pref + q, al = P.a(key); vivos.push(key); g.save(); g.globalAlpha = al;
      dib(g, x0 + (q % porFila) * dx, y0 + Math.floor(q / porFila) * dy - (1 - al) * 6, k || 1, q); g.restore(); }
    return vivos;
  }
  function icoPesa(g, x, y, k) {
    sombraPiso(g, x, y + 7 * k, 8 * k, 2 * k, 0.3);
    g.strokeStyle = '#3a3f46'; g.lineWidth = 2.2 * k; g.beginPath(); g.arc(x, y - 5 * k, 3.6 * k, Math.PI, 0); g.stroke();
    var gr = g.createRadialGradient(x - 2 * k, y - 1 * k, 1, x, y + 2 * k, 8 * k); gr.addColorStop(0, '#6b737c'); gr.addColorStop(1, '#22262b');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + 2 * k, 7 * k, 6 * k, 0, 0, 7); g.fill();
    g.fillStyle = '#e8eef2'; g.font = '700 ' + (5.5 * k) + 'px system-ui'; g.textAlign = 'center'; g.fillText('1kg', x, y + 4 * k);
  }
  function icoBillete(g, x, y, k) {
    g.save(); g.translate(x, y); g.rotate(-0.06); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-9 * k + 1, -5 * k + 2, 18 * k, 10 * k);
    var gr = g.createLinearGradient(-9 * k, 0, 9 * k, 0); gr.addColorStop(0, '#6fbf73'); gr.addColorStop(1, '#3e8e41'); g.fillStyle = gr; g.fillRect(-9 * k, -5 * k, 18 * k, 10 * k);
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.8; g.strokeRect(-7.5 * k, -3.5 * k, 15 * k, 7 * k);
    g.fillStyle = '#e8f5e9'; g.beginPath(); g.arc(0, 0, 2.6 * k, 0, 7); g.fill(); g.fillStyle = '#2e7d32'; g.font = '700 ' + (3.6 * k) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0.3 * k); g.restore();
  }
  function icoCamion(g, x, y, k) {
    sombraPiso(g, x, y + 7 * k, 14 * k, 2 * k, 0.3);
    var gr = g.createLinearGradient(0, y - 8 * k, 0, y + 4 * k); gr.addColorStop(0, '#f39c12'); gr.addColorStop(1, '#c87f0a'); g.fillStyle = gr; g.fillRect(x - 13 * k, y - 8 * k, 17 * k, 12 * k);
    g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(x + 4 * k, y + 4 * k); g.lineTo(x + 4 * k, y - 5 * k); g.lineTo(x + 10 * k, y - 5 * k); g.lineTo(x + 13 * k, y); g.lineTo(x + 13 * k, y + 4 * k); g.closePath(); g.fill();
    g.fillStyle = '#cfe8f7'; g.fillRect(x + 6 * k, y - 3.5 * k, 4 * k, 3 * k);
    g.fillStyle = '#222'; [x - 9 * k, x - 3 * k, x + 9 * k].forEach(function (cx) { g.beginPath(); g.arc(cx, y + 5 * k, 2.4 * k, 0, 7); g.fill(); });
  }
  function icoVaca(g, x, y, k, q) {
    sombraPiso(g, x, y + 8 * k, 12 * k, 2 * k, 0.3);
    g.save(); g.translate(x, y); g.scale((q % 2 ? -1 : 1) * k, k);
    g.strokeStyle = '#3b3b3b'; g.lineWidth = 2; [-7, -4, 4, 7].forEach(function (lx) { g.beginPath(); g.moveTo(lx, 2); g.lineTo(lx, 8); g.stroke(); });
    g.fillStyle = '#f7f4ee'; g.beginPath(); g.ellipse(0, -1, 10, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#2b2b2b'; g.beginPath(); g.ellipse(-4, -3, 3.4, 2.6, 0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(4, 1, 2.6, 2.2, -0.2, 0, 7); g.fill();
    g.fillStyle = '#f7f4ee'; g.beginPath(); g.ellipse(11, -4, 3.6, 3.2, 0, 0, 7); g.fill(); g.fillStyle = '#f2b8b0'; g.beginPath(); g.ellipse(13.5, -2.6, 2, 1.6, 0, 0, 7); g.fill();
    g.fillStyle = '#d8c9a8'; g.beginPath(); g.moveTo(9.5, -7); g.lineTo(9, -10); g.lineTo(10.6, -7.4); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(11.6, -5, 0.8, 0, 7); g.fill();
    g.restore();
  }


  /* ---------- paisaje ---------- */
  function pradera(g, w, h, sem) {
    var cielo = g.createLinearGradient(0, 0, 0, h * 0.5); cielo.addColorStop(0, '#7fb9de'); cielo.addColorStop(0.7, '#cfe8f2'); cielo.addColorStop(1, '#eef6ea');
    g.fillStyle = cielo; g.fillRect(0, 0, w, h);
    var sol = g.createRadialGradient(w * 0.86, h * 0.12, 4, w * 0.86, h * 0.12, 120); sol.addColorStop(0, 'rgba(255,246,200,1)'); sol.addColorStop(0.15, 'rgba(255,236,170,.85)'); sol.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = sol; g.fillRect(0, 0, w, h * 0.6);
    [[0.16, 0.12, 1.1], [0.5, 0.07, 0.8], [0.66, 0.2, 0.6]].forEach(function (n) { nubeR(g, w * n[0], h * n[1], n[2]); });
    function loma(y0, amp, f1, col1, col2, fase) {
      var gr = g.createLinearGradient(0, y0 - amp, 0, h); gr.addColorStop(0, col1); gr.addColorStop(1, col2); g.fillStyle = gr; g.beginPath(); g.moveTo(0, h);
      for (var x = 0; x <= w; x += 6) g.lineTo(x, y0 - amp * Math.sin(x / w * f1 + fase) - amp * 0.35 * Math.sin(x / 41 + fase)); g.lineTo(w, h); g.closePath(); g.fill();
    }
    loma(h * 0.36, 18, 2.4, '#9fc3b4', '#b9d6c0', 1.2);
    loma(h * 0.42, 20, 3.2, '#8fbf88', '#9ccc8c', 0.6);
    [[0.30, 0.40, 0.6], [0.70, 0.39, 0.65], [0.52, 0.41, 0.45]].forEach(function (t) { arbol(g, w * t[0], h * t[1], t[2], 0.55); });
    loma(h * 0.49, 8, 5, '#86bb6f', '#5f9a49', 1);
    var r = azar(sem || 7);
    for (var i = 0; i < 260; i++) { var px = r() * w, py = h * 0.5 + Math.pow(r(), 0.7) * h * 0.5, l = 3 + (py / h) * 7, c = 70 + r() * 50;
      g.strokeStyle = 'rgba(' + (40 + c * 0.3 | 0) + ',' + (100 + c | 0) + ',' + (40 + c * 0.2 | 0) + ',.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 1, py - l * 0.6, px + (r() - 0.5) * 4, py - l); g.stroke(); }
    for (i = 0; i < 14; i++) { var fx = r() * w, fy = h * 0.58 + r() * h * 0.4; g.fillStyle = ['#f6d65b', '#fff', '#f29fb5'][i % 3]; g.beginPath(); g.arc(fx, fy, 1.8, 0, 7); g.fill(); }
    arbol(g, w * 0.05, h * 0.47, 1.15, 1); arbol(g, w * 0.95, h * 0.5, 1.3, 1);
    var vin = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.75); vin.addColorStop(0, 'rgba(0,0,0,0)'); vin.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = vin; g.fillRect(0, 0, w, h);
  }
  function nubeR(g, x, y, k) {
    [[0, 0, 13], [15, -7, 16], [33, -2, 12], [24, 4, 12], [8, 5, 10]].forEach(function (b) { var gr = g.createRadialGradient(x + b[0] * k - 3 * k, y + b[1] * k - 4 * k, 1, x + b[0] * k, y + b[1] * k, b[2] * k);
      gr.addColorStop(0, 'rgba(255,255,255,.98)'); gr.addColorStop(1, 'rgba(225,235,245,.9)'); g.fillStyle = gr; g.beginPath(); g.arc(x + b[0] * k, y + b[1] * k, b[2] * k, 0, 7); g.fill(); });
  }
  function arbol(g, x, y, k, niebla) {
    sombraPiso(g, x - 14 * k, y + 19 * k, 26 * k, 5 * k, 0.3 * (niebla || 1));
    var tr = g.createLinearGradient(x - 3 * k, 0, x + 3 * k, 0); tr.addColorStop(0, '#5a3b22'); tr.addColorStop(1, '#8a5f3c'); g.fillStyle = tr; g.fillRect(x - 3 * k, y - 4 * k, 6 * k, 24 * k);
    [[0, -14, 16], [-11, -4, 11], [11, -4, 11], [-5, -22, 10], [6, -20, 11]].forEach(function (b) {
      var gr = g.createRadialGradient(x + b[0] * k + 5 * k, y + b[1] * k - 5 * k, 1, x + b[0] * k, y + b[1] * k, b[2] * k);
      gr.addColorStop(0, niebla && niebla < 1 ? '#8fbf8a' : '#6fae5e'); gr.addColorStop(1, niebla && niebla < 1 ? '#6f9f78' : '#2f6a35'); g.fillStyle = gr; g.beginPath(); g.arc(x + b[0] * k, y + b[1] * k, b[2] * k, 0, 7); g.fill(); });
  }

  /* ---------- un venado (hembra adulta o cría con manchas) ---------- */
  function venado(g, x, y, s, joven, dir, fase) {
    sombraPiso(g, x - 7 * s, y + 0.5 * s, 22 * s, 4.2 * s, 0.34);
    g.save(); g.translate(x, y); g.scale(dir * s, s);
    var luz = dir > 0 ? 1 : -1;                     /* la luz viene de la derecha de la pantalla */
    var base = joven ? [214, 150, 90] : [176, 112, 62], osc = joven ? '#8a5428' : '#6a3c1c';
    function rgb(k, a) { return 'rgba(' + Math.round(base[0] * k) + ',' + Math.round(base[1] * k) + ',' + Math.round(base[2] * k) + ',' + (a || 1) + ')'; }
    var paso = Math.sin(fase || 0) * 2.2;
    function pata(x0, dx, lejos) {
      var gr = g.createLinearGradient(x0 - 2, 0, x0 + 2, 0); gr.addColorStop(0, rgb(lejos ? 0.55 : 0.8)); gr.addColorStop(1, rgb(lejos ? 0.7 : 1));
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 2.4, -14); g.quadraticCurveTo(x0 - 2.6 + dx * 0.3, -7, x0 - 1.2 + dx * 0.5, -1.5); g.lineTo(x0 + 1.2 + dx * 0.5, -1.5); g.quadraticCurveTo(x0 + 1.8 + dx * 0.3, -7, x0 + 2.4, -14); g.closePath(); g.fill();
      g.fillStyle = '#2a1a0f'; g.beginPath(); g.ellipse(x0 + dx * 0.5, -1, 1.7, 1.2, 0, 0, 7); g.fill();
    }
    pata(-7.5, paso, true); pata(9.5, -paso, true);
    var gc = g.createLinearGradient(0, -23, 0, -8); gc.addColorStop(0, rgb(1.12)); gc.addColorStop(0.55, rgb(0.95)); gc.addColorStop(1, rgb(0.62));
    g.fillStyle = gc; g.beginPath(); g.moveTo(-15, -15); g.bezierCurveTo(-15, -22, -6, -23, 2, -21.5); g.bezierCurveTo(9, -21, 13, -22, 15, -17); g.bezierCurveTo(16.5, -12, 13, -9, 9, -9);
    g.bezierCurveTo(3, -8.3, -4, -8.6, -9, -9.5); g.bezierCurveTo(-13, -10, -15.5, -12, -15, -15); g.closePath(); g.fill();
    var gb = g.createLinearGradient(0, -12, 0, -8); gb.addColorStop(0, 'rgba(250,236,214,0)'); gb.addColorStop(1, 'rgba(250,236,214,.9)');
    g.fillStyle = gb; g.beginPath(); g.ellipse(1, -9.8, 10, 2.4, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,240,215,' + (luz > 0 ? 0.55 : 0.25) + ')'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-12, -20); g.bezierCurveTo(-4, -23, 6, -21.5, 13, -20); g.stroke();
    pata(-10.5, -paso, false); pata(7, paso, false);
    g.fillStyle = '#fbf6ee'; g.beginPath(); g.ellipse(-15.2, -17.5, 2.6, 3.8, -0.45, 0, 7); g.fill(); g.fillStyle = osc; g.beginPath(); g.ellipse(-15.6, -19.6, 1.6, 1.8, -0.45, 0, 7); g.fill();
    var gn = g.createLinearGradient(10, -32, 18, -14); gn.addColorStop(0, rgb(1.08)); gn.addColorStop(1, rgb(0.78));
    g.fillStyle = gn; g.beginPath(); g.moveTo(8, -20); g.bezierCurveTo(10, -26, 12.5, -30, 15, -33); g.lineTo(21, -30.5); g.bezierCurveTo(18.5, -26, 17.5, -20, 15.5, -13.5); g.bezierCurveTo(12, -14, 9, -16, 8, -20); g.closePath(); g.fill();
    g.fillStyle = 'rgba(250,238,220,.75)'; g.beginPath(); g.ellipse(18.2, -25, 1.8, 3.2, 0.4, 0, 7); g.fill();
    var gh = g.createRadialGradient(18, -35, 1, 20, -32, 9); gh.addColorStop(0, rgb(1.15)); gh.addColorStop(1, rgb(0.8));
    g.fillStyle = gh; g.beginPath(); g.moveTo(14, -33); g.bezierCurveTo(14.5, -37.5, 19.5, -38, 22, -35.5); g.bezierCurveTo(24.5, -33.5, 27.5, -32.5, 28.5, -30.5); g.bezierCurveTo(28.8, -28.6, 26.5, -27.8, 24, -28.2); g.bezierCurveTo(20, -28.5, 15.5, -29.2, 14, -33); g.closePath(); g.fill();
    g.fillStyle = '#1b120b'; g.beginPath(); g.ellipse(28, -30.4, 1.4, 1.2, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(250,240,225,.8)'; g.beginPath(); g.ellipse(25.5, -28.6, 2, 0.7, 0.2, 0, 7); g.fill();
    function oreja(cx, cy, rot, k) { g.save(); g.translate(cx, cy); g.rotate(rot); g.fillStyle = rgb(0.9 * k); g.beginPath(); g.ellipse(0, -4.5, 2.6, 5.4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(240,190,170,' + (0.8 * k) + ')'; g.beginPath(); g.ellipse(0.3, -4.2, 1.3, 3.8, 0, 0, 7); g.fill(); g.restore(); }
    oreja(15.5, -36.5, -0.95, 0.85); oreja(17.3, -37, -0.55, 1);
    g.fillStyle = '#140c07'; g.beginPath(); g.ellipse(21.4, -33.4, 1.5, 1.35, 0.2, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(21.9, -33.9, 0.5, 0, 7); g.fill();
    if (joven) { g.fillStyle = 'rgba(255,250,240,.88)'; [[-9, -18.5], [-5, -20.2], [-1, -19.8], [3, -20.4], [7, -19.6], [11, -18.6], [-7, -15.4], [-2.5, -16.4], [2, -16.2], [6.5, -16.4], [10, -15.2], [-4, -13.2], [4, -13]].forEach(function (m, i) { g.beginPath(); g.ellipse(m[0], m[1], 1.15 - (i % 3) * 0.12, 0.9, 0, 0, 7); g.fill(); }); }
    g.restore();
  }

  /* ---------- la gráfica pequeña de abajo ---------- */
  function mini(L, series, k, cols, etiq) {
    var g = L.g, w = L.w, h = L.h, m = { i: 40, d: 12, a: 10, b: 22 };
    g.clearRect(0, 0, w, h);
    var N = series[0].length - 1, mx = 1;
    series.forEach(function (s) { s.forEach(function (v) { if (isFinite(v)) mx = Math.max(mx, v); }); });
    var X = function (i) { return m.i + (w - m.i - m.d) * i / N; }, Y = function (v) { return h - m.b - (h - m.a - m.b) * Math.min(v, mx) / mx; };
    g.strokeStyle = '#e6e8ea'; g.lineWidth = 1; g.fillStyle = '#6b7480'; g.font = '11px system-ui, sans-serif'; g.textAlign = 'right';
    for (var j = 0; j <= 4; j++) { var v = mx * j / 4, yy = Y(v); g.beginPath(); g.moveTo(m.i, yy); g.lineTo(w - m.d, yy); g.stroke(); g.fillText(v >= 1e4 ? (v / 1000).toFixed(0) + ' mil' : Math.round(v), m.i - 4, yy + 3); }
    g.textAlign = 'center'; for (j = 0; j <= N; j += 5) g.fillText(j, X(j), h - 6);
    series.forEach(function (s, q) { g.strokeStyle = cols[q]; g.lineWidth = q ? 1.6 : 2.4; g.beginPath(); s.forEach(function (v, i) { i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)); }); g.stroke(); });
    g.strokeStyle = COL.rojo; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(k), m.a); g.lineTo(X(k), h - m.b); g.stroke(); g.setLineDash([]);
    g.textAlign = 'left'; var lx = m.i + 6;
    etiq.forEach(function (t, q) { g.fillStyle = cols[q]; g.fillRect(lx, m.a + 2, 10, 3); g.fillText(t, lx + 13, m.a + 7); lx += g.measureText(t).width + 30; });
  }

  /* =====================================================================
     Álgebra lineal · Modelo de Leslie: la manada de venados
     ===================================================================== */
  W.venados = function (c, D) {
    var K = 20, A = lienzoPx(c, 300), G = lienzoPx(c, 150);
    var c1 = fila(c), c2 = fila(c), c3 = fila(c);
    var f = U.deslizador(c1, '🍼 crías por adulta', 0, 3, 0.05, 1.6),
        sj = U.deslizador(c1, '🦌 sobreviven crías', 0, 1, 0.01, 0.3, pct),
        sa = U.deslizador(c1, '💪 sobreviven adultas', 0, 1, 0.01, 0.8, pct),
        h = U.deslizador(c2, '🎯 caza de adultas h', 0, 0.8, 0.01, 0, pct),
        j0 = U.deslizador(c2, 'crías al inicio', 0, 200, 1, 20, ent),
        a0 = U.deslizador(c2, 'adultas al inicio', 0, 200, 1, 100, ent),
        k = U.deslizador(c3, '📅 año k', 0, K, 1, 0, ent);
    var juega = boton(c3, '▶ Ver pasar los años', function () { anda(); }), atras = boton(c3, '↺ Año 0', function () { para(); k.v = 0; dib(); });
    var lec = U.lectura(c);
    var R = U.reto(c, D.caza ? 'Deja las tasas del ejemplo (1,6 · 30 % · 80 %). ¿Qué proporción h de las adultas hay que cazar cada año para que la manada ni crezca ni se extinga? (escríbela como decimal, p. ej. 0,15)'
                             : '¿Con qué supervivencia de las adultas (como decimal) la manada se mantiene estable, si las otras dos tasas quedan como en el ejemplo?', true,
      function (v) { return D.caza ? Math.abs(v - 0.28) < 0.006 : Math.abs(v - 0.52) < 0.006; },
      D.caza ? '¡Exacto! Con h = 0,28 queda λ² − 0,52λ − 0,48 = (λ − 1)(λ + 0,48): el valor propio dominante es 1 y la manada se estabiliza en la proporción del vector propio.'
             : '¡Sí! Con 52 % de supervivencia λ² − 0,52λ − 0,48 = (λ − 1)(λ + 0,48): el autovalor dominante vale 1.');
    R.el.__fin = c.__fin;
    function pct(x) { return Math.round(x * 100) + ' %'; }
    function ent(x) { return String(Math.round(x)); }
    var r = azar(11), sitios = [];
    for (var fi = 0; fi < 8; fi++) for (var co = 0; co < 20; co++) sitios.push([0.03 + (co + 0.15 + r() * 0.7) / 20 * 0.94, 0.56 + (fi + 0.2 + r() * 0.6) / 8 * 0.40, r() < 0.5 ? 1 : -1, r() * 6]);
    for (var i = sitios.length - 1; i > 0; i--) { var q0 = Math.floor(r() * (i + 1)), tmp = sitios[i]; sitios[i] = sitios[q0]; sitios[q0] = tmp; }
    var nacido = {}, prev = null, reloj = null, t0 = 0;
    function serie() {
      var M = [[0, f.v], [sj.v, Math.max(0, sa.v - h.v)]], u = [j0.v, a0.v], S = [u];
      for (var q = 0; q < K; q++) { u = [M[0][0] * u[0] + M[0][1] * u[1], M[1][0] * u[0] + M[1][1] * u[1]]; S.push(u); }
      return { M: M, S: S };
    }
    function unidad(n) { var e = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 1e7, 1e8, 1e9, 1e10]; for (var q = 0; q < e.length; q++) if (n / e[q] <= 50) return e[q]; return 1e11; }
    function dib(ahora) {
      var Z = serie(), u = Z.S[Math.round(k.v)], M = Z.M, tot = u[0] + u[1];
      var g = A.g, w = A.w, hh = A.h; g.clearRect(0, 0, w, hh); pradera(g, w, hh, 7);
      var un = unidad(Math.max(tot, 1)), nj = Math.round(u[0] / un), na = Math.round(u[1] / un);
      if (u[0] > 0 && nj === 0) nj = 1; if (u[1] > 0 && na === 0) na = 1;
      var lista = [];
      for (var q = 0; q < na; q++) lista.push([sitios[(2 * q) % 160], false, 'a' + q]);
      for (q = 0; q < nj; q++) lista.push([sitios[(2 * q + 1) % 160], true, 'j' + q]);
      lista.sort(function (p, s) { return p[0][1] - s[0][1]; });
      var now = ahora || performance.now();
      lista.forEach(function (it) {
        var S = it[0], esc = (0.62 + (S[1] - 0.54) * 1.3) * (it[1] ? 0.68 : 1) * Math.min(1.3, (w / 560 + 0.25) * 1.12);
        if (!(it[2] in nacido)) nacido[it[2]] = prev === null || sinAnim() ? -1e9 : now;
        var al = Math.min(1, (now - nacido[it[2]]) / 450);
        g.globalAlpha = al; venado(g, S[0] * w, S[1] * hh + (1 - al) * 6, esc, it[1], S[2], S[3] + (reloj ? now / 140 : 0)); g.globalAlpha = 1;
      });
      Object.keys(nacido).forEach(function (key) { var tipo = key[0], n = +key.slice(1); if ((tipo === 'a' && n >= na) || (tipo === 'j' && n >= nj)) delete nacido[key]; });
      prev = 1;
      g.fillStyle = 'rgba(255,255,255,.88)'; rr(g, 10, 10, 214, 54, 10); g.fill();
      g.fillStyle = COL.tinta; g.font = '600 14px system-ui, sans-serif'; g.textAlign = 'left';
      g.fillText('Año ' + Math.round(k.v) + ' · ' + (tot > 1e7 ? 'más de 10 millones' : miles(tot) + ' hembras'), 20, 31);
      g.font = '12px system-ui, sans-serif'; g.fillStyle = '#56606b';
      g.fillText('cada 🦌 = ' + miles(un) + (un === 1 ? ' hembra' : ' hembras') + ' · las manchadas son crías', 20, 51);
      if (tot < 0.5 && k.v > 0) { g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, w / 2 - 120, hh / 2 - 22, 240, 40, 12); g.fill(); g.fillStyle = COL.rojo; g.font = '600 15px system-ui'; g.textAlign = 'center'; g.fillText('La manada se extinguió 😢', w / 2, hh / 2 + 3); }
      if (h.v > 0) { g.font = '12px system-ui'; g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.88)'; rr(g, w - 196, hh - 30, 186, 22, 8); g.fill(); g.fillStyle = '#7a3b12'; g.fillText('🪧 caza controlada: ' + pct(h.v) + ' de adultas', w - 16, hh - 14); }
      var tr = M[0][0] + M[1][1], de = M[0][0] * M[1][1] - M[0][1] * M[1][0], disc = tr * tr - 4 * de, l1 = (tr + Math.sqrt(Math.max(disc, 0))) / 2;
      var vp = M[0][1] > 0 ? [M[0][1], l1] : [1, 0], rp = vp[1] > 0 ? vp[0] / vp[1] : Infinity;
      mini(G, [Z.S.map(function (v) { return v[0] + v[1]; }), Z.S.map(function (v) { return v[1]; }), Z.S.map(function (v) { return v[0]; })], Math.round(k.v), [COL.teal, '#7d4a26', '#d79a5c'], ['total', 'adultas', 'crías']);
      var est = Math.abs(l1 - 1) < 0.005 ? '<b style="color:' + COL.verde + '">λ₁ ≈ 1: la manada se estabiliza</b>' : l1 > 1 ? '<b style="color:' + COL.ambar + '">λ₁ &gt; 1: la manada crece ' + Math.round((l1 - 1) * 100) + ' % por año a la larga</b>' : '<b style="color:' + COL.rojo + '">λ₁ &lt; 1: la manada se va extinguiendo</b>';
      lec.innerHTML = 'A = <span class="esc-mat"><span>0</span><span>' + f2(M[0][1]) + '</span><span>' + f2(M[1][0]) + '</span><span>' + f2(M[1][1]) + '</span></span> &nbsp; u<sub>' + Math.round(k.v) + '</sub> = A<sup>' + Math.round(k.v) + '</sup>u<sub>0</sub> = (' + miles(u[0]) + ', ' + miles(u[1]) + ')<br>'
        + 'valor propio dominante <b>λ₁ = ' + U.f4(l1) + '</b> · ' + est + '<br>'
        + '<span style="color:#56606b">a la larga hay ' + (isFinite(rp) ? f2(rp) : '—') + ' crías por cada adulta (proporción del vector propio de λ₁)' + (u[1] > 0 ? '; en el año ' + Math.round(k.v) + ' hay ' + f2(u[0] / u[1]) : '') + '</span>';
    }
    function anim(t) { dib(t); var fin = false; for (var key in nacido) if (t - nacido[key] < 450) { fin = true; break; } if (reloj || fin) requestAnimationFrame(anim); else animando = false; }
    var animando = false;
    function despierta() { if (!animando && !sinAnim()) { animando = true; requestAnimationFrame(anim); } else if (sinAnim()) dib(); }
    function anda() {
      if (reloj) { para(); return; }
      if (k.v >= K) k.v = 0;
      juega.textContent = '⏸ Pausa'; reloj = setInterval(function () { if (k.v >= K) { para(); return; } k.v = k.v + 1; despierta(); }, 900); despierta();
    }
    function para() { clearInterval(reloj); reloj = null; juega.textContent = '▶ Ver pasar los años'; despierta(); }
    [f, sj, sa, h, j0, a0, k].forEach(function (s) { s.inp.addEventListener('input', function () { if (s !== k) para(); despierta(); }); });
    A.redibuja = function () { dib(); }; G.redibuja = A.redibuja; dib();
  };

  /* =====================================================================
     Kit de texturas: piezas con luz, sombra y textura para todas las escenas
     ===================================================================== */
  function moteado(g, x, y, w, h, n, cols, tam, sem) {          /* puntitos de textura (concreto, arena, asfalto) */
    var r = azar(sem || 13); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; var s = (tam || 1.4) * (0.5 + r()); g.fillRect(x + r() * w, y + r() * h, s, s); }
    g.restore();
  }
  function concreto(g, x, y, w, h, c1, c2, sem) {
    var gr = g.createLinearGradient(x, y, x + w * 0.3, y + h); gr.addColorStop(0, c1 || '#c9c6bf'); gr.addColorStop(1, c2 || '#a7a39b'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    moteado(g, x, y, w, h, Math.min(900, w * h / 40), ['rgba(0,0,0,.08)', 'rgba(255,255,255,.12)', 'rgba(60,50,40,.06)'], 1.6, sem);
    var r = azar((sem || 3) + 5); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var k = 0; k < 4; k++) { var mx = x + r() * w, my = y + r() * h, rg = g.createRadialGradient(mx, my, 2, mx, my, 30 + r() * 40); rg.addColorStop(0, 'rgba(70,60,50,.10)'); rg.addColorStop(1, 'rgba(70,60,50,0)'); g.fillStyle = rg; g.fillRect(mx - 80, my - 80, 160, 160); }
    g.restore();
  }
  function pasto(g, x, y, w, h, sem, claro) {                    /* césped visto desde arriba */
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, claro ? '#a9d48c' : '#93c47a'); gr.addColorStop(1, claro ? '#86bd6a' : '#74ad5c'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    var r = azar(sem || 21); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var k = 0; k < 14; k++) { var mx = x + r() * w, my = y + r() * h, rg = g.createRadialGradient(mx, my, 3, mx, my, 40 + r() * 60); rg.addColorStop(0, r() < 0.5 ? 'rgba(60,110,40,.16)' : 'rgba(200,230,150,.18)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(mx - 100, my - 100, 200, 200); }
    var n = Math.min(1400, w * h / 22);
    for (var i = 0; i < n; i++) { var px = x + r() * w, py = y + r() * h, c = 90 + r() * 70, a = r() * 6.28, l = 2 + r() * 3;
      g.strokeStyle = 'rgba(' + (40 + c * 0.25 | 0) + ',' + (c | 0) + ',' + (30 + c * 0.15 | 0) + ',.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); }
    g.restore();
  }
  function asfalto(g, x, y, w, h, sem) {
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#4d535b'); gr.addColorStop(1, '#41464d'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    moteado(g, x, y, w, h, Math.min(1600, w * h / 14), ['rgba(255,255,255,.10)', 'rgba(0,0,0,.18)', 'rgba(180,170,150,.10)'], 1.3, sem);
  }
  function arena(g, x, y, w, h, sem) {
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#f0dfb0'); gr.addColorStop(1, '#d9c08a'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    moteado(g, x, y, w, h, Math.min(800, w * h / 10), ['rgba(150,110,60,.25)', 'rgba(255,255,255,.4)'], 1.2, sem);
  }
  function aguaArriba(g, x, y, w, h, sem, c1, c2) {               /* agua vista desde arriba o de frente */
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c1 || '#4fa6d6'); gr.addColorStop(1, c2 || '#1f6a9e'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    var r = azar(sem || 31); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineCap = 'round';
    for (var i = 0; i < Math.min(160, w * h / 260); i++) { var px = x + r() * w, py = y + r() * h, l = 5 + r() * 14, a = 0.12 + r() * 0.3;
      g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px - l, py); g.quadraticCurveTo(px, py - 3, px + l, py); g.stroke();
      g.strokeStyle = 'rgba(0,30,60,' + a * 0.7 + ')'; g.beginPath(); g.moveTo(px - l * 0.7, py + 2.5); g.quadraticCurveTo(px, py + 4.5, px + l * 0.7, py + 2.5); g.stroke(); }
    g.restore();
  }
  function edificioReal(g, x, yb, w, hp, sem, tono) {             /* fachada con ventanas que reflejan el cielo */
    var r = azar(sem || 41), t = tono || ['#cfc3b0', '#a89a85'];
    g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 14; g.shadowOffsetX = 6; g.fillStyle = t[1]; g.fillRect(x, yb - hp, w, hp); g.restore();
    var gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, t[0]); gr.addColorStop(0.75, t[1]); gr.addColorStop(1, '#7f7362'); g.fillStyle = gr; g.fillRect(x, yb - hp, w, hp);
    moteado(g, x, yb - hp, w, hp, w * hp / 30, ['rgba(0,0,0,.07)', 'rgba(255,255,255,.1)'], 1.4, sem);
    var pisos = Math.max(2, Math.round(hp / 34)), fh = hp / pisos, cols = Math.max(2, Math.round(w / 30)), cw = w / cols;
    for (var p = 0; p < pisos; p++) {
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, yb - hp + p * fh + fh - 3, w, 3); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, yb - hp + p * fh + fh, w, 1);
      for (var q = 0; q < cols; q++) { var vx = x + q * cw + cw * 0.22, vy = yb - hp + p * fh + fh * 0.2, vw = cw * 0.56, vh = fh * 0.52;
        if (p === pisos - 1 && q === Math.floor(cols / 2)) { var pg = g.createLinearGradient(0, vy, 0, yb); pg.addColorStop(0, '#5b3a22'); pg.addColorStop(1, '#3a2414'); g.fillStyle = pg; g.fillRect(vx, vy, vw, yb - vy); g.fillStyle = '#e1b84d'; g.fillRect(vx + vw - 4, vy + (yb - vy) * 0.5, 2, 2); continue; }
        g.fillStyle = '#e8e2d6'; g.fillRect(vx - 2, vy - 2, vw + 4, vh + 4);
        var vg = g.createLinearGradient(vx, vy, vx + vw, vy + vh), luz = r() < 0.18; vg.addColorStop(0, luz ? '#ffe9a8' : '#cfe6f6'); vg.addColorStop(0.45, luz ? '#f6c766' : '#7fa9c9'); vg.addColorStop(1, luz ? '#d99a3a' : '#3f6584'); g.fillStyle = vg; g.fillRect(vx, vy, vw, vh);
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(vx + vw * 0.2, vy + vh); g.lineTo(vx + vw * 0.75, vy); g.stroke();
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(vx - 2, vy + vh + 2, vw + 4, 2); }
    }
    g.fillStyle = '#6f6455'; g.fillRect(x - 3, yb - hp - 6, w + 6, 7); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 3, yb - hp - 6, w + 6, 1.5);
  }
  function mesaMadera(g, w, y0, h) {                              /* mesa de trabajo vista de frente */
    madera(g, 0, y0, w, h - y0, '#9a6a3c', '#c2925c', 17, false);
    g.fillStyle = 'rgba(255,235,200,.35)'; g.fillRect(0, y0, w, 2); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y0 + 2, w, 2);
  }
  function paredEstuco(g, w, h, c1, c2, sem) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1 || '#f4efe6'); gr.addColorStop(1, c2 || '#e4dccd'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    moteado(g, 0, 0, w, h, w * h / 45, ['rgba(120,100,70,.06)', 'rgba(255,255,255,.35)'], 2, sem);
    var lz = g.createRadialGradient(w * 0.3, -h * 0.2, 10, w * 0.3, 0, w * 0.9); lz.addColorStop(0, 'rgba(255,248,230,.5)'); lz.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = lz; g.fillRect(0, 0, w, h);
  }
  function metalH(g, x, y, w, h, base) {                         /* barra metálica con brillo horizontal */
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3a4048'); gr.addColorStop(0.3, base || '#c3cad2'); gr.addColorStop(0.5, '#f4f6f8'); gr.addColorStop(0.75, base || '#9aa3ad'); gr.addColorStop(1, '#3a4048'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  function metalV(g, x, y, w, h, base) {
    var gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#3a4048'); gr.addColorStop(0.3, base || '#c3cad2'); gr.addColorStop(0.5, '#f4f6f8'); gr.addColorStop(0.75, base || '#9aa3ad'); gr.addColorStop(1, '#3a4048'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  function vineta(g, w, h, a) { var v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,' + (a || 0.14) + ')'); g.fillStyle = v; g.fillRect(0, 0, w, h); }

  /* =====================================================================
     Cálculo diferencial · razones de cambio relacionadas
     ===================================================================== */
  W.escalera7 = function (c, D) {
    var Lg = 7, L = lienzoPx(c, 320), ct = fila(c), x = U.deslizador(ct, 'base a x =', 0.5, 6.9, 0.01, 5, function (v) { return f2(v) + ' m'; });
    reloj(ct, { get v() { return 6.9 - x.v + 0.5; }, set v(t) { x.v = 6.9 - t + 0.5; }, inp: x.inp }, 6.9, 1.5, '▶ Empujar la base (1,5 m/s)');
    var lec = U.lectura(c), R = U.reto(c, '¿Con qué rapidez sube la parte alta cuando la base está a 2 m del muro? (m/s, 3 decimales)', true, function (v) { return Math.abs(v - 0.447) < 0.003; },
      '¡Eso! y = √45 ≈ 6,708 y y′ = x·1,5/y ≈ 0,447 m/s: la escalera sube despacito.');
    R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -1.2, 8.6, -0.6, 7.6, 10), xx = x.v, y = Math.sqrt(Lg * Lg - xx * xx), yp = xx * 1.5 / y;
      cielo(g, w, h); nube(g, w * 0.7, 40, 1); suelo(g, w, V.Y(0), h);
      g.fillStyle = '#b5654a'; g.fillRect(V.X(-1.2), V.Y(7.6), V.X(0) - V.X(-1.2), V.Y(0) - V.Y(7.6));
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
      for (var f = 0, yy = V.Y(0); yy > V.Y(7.6); yy -= 12, f++) { g.beginPath(); g.moveTo(V.X(-1.2), yy); g.lineTo(V.X(0), yy); g.stroke(); for (var bx = V.X(-1.2) + (f % 2) * 14; bx < V.X(0); bx += 28) { g.beginPath(); g.moveTo(bx, yy); g.lineTo(bx, yy - 12); g.stroke(); } }
      var mur = g.createLinearGradient(V.X(-1.2), 0, V.X(0), 0); mur.addColorStop(0, 'rgba(0,0,0,.18)'); mur.addColorStop(1, 'rgba(255,255,255,.08)'); g.fillStyle = mur; g.fillRect(V.X(-1.2), V.Y(7.6), V.X(0) - V.X(-1.2), V.Y(0) - V.Y(7.6));
      g.fillStyle = 'rgba(30,40,20,.22)'; g.beginPath(); g.moveTo(V.X(xx), V.Y(0)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(0) + 0.18 * y * V.s * 0.25, V.Y(0) + 6); g.lineTo(V.X(xx) + 4, V.Y(0) + 6); g.closePath(); g.fill();
      var ax = V.X(xx), ay = V.Y(0), bx2 = V.X(0), by = V.Y(y), nx = -(by - ay), ny = bx2 - ax, n = Math.hypot(nx, ny) / 9; nx /= n; ny /= n;
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6; g.shadowOffsetX = -4; g.shadowOffsetY = 3;
      g.lineCap = 'round'; [[0, 0, '#7a4a20'], [nx, ny, '#a8743f']].forEach(function (d) { g.strokeStyle = d[2]; g.lineWidth = 6; g.beginPath(); g.moveTo(ax + d[0], ay + d[1]); g.lineTo(bx2 + d[0], by + d[1]); g.stroke(); }); g.restore();
      g.strokeStyle = 'rgba(255,225,180,.45)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax + nx - 1, ay + ny - 1); g.lineTo(bx2 + nx - 1, by + ny - 1); g.stroke();
      g.strokeStyle = '#8b5a2b'; g.lineWidth = 3; for (var t = 0.07; t < 1; t += 0.085) { var px = ax + (bx2 - ax) * t, py = ay + (by - ay) * t; g.beginPath(); g.moveTo(px, py); g.lineTo(px + nx, py + ny); g.stroke(); }
      flecha(g, ax + 40, ay - 14, ax + 8, ay - 14, COL.teal, 3); rotulo(g, '1,5 m/s', ax + 46, ay - 30, COL.teal, 'left');
      flecha(g, bx2 + 14, by + 2, bx2 + 14, by - 8 - Math.min(80, yp * 70), COL.rojo, 3); rotulo(g, '↑ ' + f2(Math.round(yp * 1000) / 1000) + ' m/s', bx2 + 24, by - 20, COL.rojo, 'left');
      g.setLineDash([5, 4]); g.strokeStyle = COL.gris; g.lineWidth = 1.2; g.beginPath(); g.moveTo(V.X(0), V.Y(0) + 14); g.lineTo(ax, V.Y(0) + 14); g.stroke(); g.setLineDash([]);
      rotulo(g, 'x = ' + f2(xx) + ' m', (V.X(0) + ax) / 2, V.Y(0) + 15, COL.teal); rotulo(g, '7 m', (ax + bx2) / 2 + 22, (ay + by) / 2, '#8b5a2b');
      lec.innerHTML = 'x² + y² = 49 ⇒ y = ' + f2(Math.round(y * 1000) / 1000) + ' m ⇒ 2x·x′ + 2y·y′ = 0 ⇒ <b>y′ = −x·x′/y = ' + f2(Math.round(yp * 1000) / 1000) + ' m/s</b> (con x′ = −1,5)';
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  W.tanque = function (c, D) {
    var Pt = Poblador(function () { dib(); }), rP = azar(4), PZ = []; for (var iP = 0; iP < 40; iP++) PZ.push([0.1 + rP() * 0.8, 0.25 + rP() * 0.7, rP() < 0.5 ? 1 : -1]);
    var H = 12, Rr = 6, Q = 8, L = lienzoPx(c, 340), ct = fila(c), hs = U.deslizador(ct, 'profundidad h =', 0.3, 11.5, 0.01, 2, function (v) { return f2(v) + ' m'; });
    reloj(ct, hs, 11.5, 0.9, '▶ Abrir la llave');
    var lec = U.lectura(c), R = U.reto(c, '¿Qué tan rápido sube el nivel cuando h = 4 m? (m/min, 3 decimales)', true, function (v) { return Math.abs(v - 2 / Math.PI) < 0.003; },
      '¡Bien! r = h/2, V = πh³/12 y h′ = 4·8/(πh²) = 2/π ≈ 0,637 m/min.'); R.el.__fin = c.__fin;
    var gotas = [];
    function dib(t) {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -9, 9, -1, 14.8, 8), hh = hs.v, r = hh / 2, vol = Math.PI * r * r * hh / 3, hp = 4 * Q / (Math.PI * hh * hh);
      paredEstuco(g, w, h, '#e9edf0', '#d3d9de', 6); concreto(g, 0, V.Y(-0.2), w, h - V.Y(-0.2), '#bdbab2', '#97938b', 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, V.Y(-0.2), w, 2);
      [-0.55, 0.55].forEach(function (f) { var px = V.X(Rr * f * 1.25), py = V.Y(H * 0.69); metalV(g, px - 4, py, 8, V.Y(-0.2) - py, '#8f99a3'); g.fillStyle = '#5c646d'; g.fillRect(px - 9, V.Y(-0.2) - 4, 18, 4); });
      g.fillStyle = 'rgba(120,140,160,.15)'; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.closePath(); g.fill();
      var gr = g.createLinearGradient(0, V.Y(hh), 0, V.Y(0)); gr.addColorStop(0, '#5fb3e6'); gr.addColorStop(1, '#1f6fae');
      g.fillStyle = gr; g.beginPath(); g.moveTo(V.X(-r), V.Y(hh)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(r), V.Y(hh)); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(V.X(0), V.Y(hh), Math.max(1, r * V.s), Math.max(1, r * V.s * 0.12), 0, 0, 7); g.fill();
      var nP = Math.floor(vol / 12), vivosP = [];
      for (var q = 0; q < nP && q < PZ.length; q++) { var pz = PZ[q], yy = pz[1] * hh * 0.85 + 0.15 * hh * 0.5, half = yy / 2 * 0.8, xx0 = (pz[0] * 2 - 1) * half, al = Pt.a('p' + q); vivosP.push('p' + q);
        if (yy > 0.6) { g.globalAlpha = al; pez(g, V.X(xx0), V.Y(yy), Math.min(0.75, 0.3 + V.s / 60), ['#f39c12', '#e74c3c', '#f1c40f', '#e67e22'][q % 4], pz[2]); g.globalAlpha = 1; } }
      Pt.cierra(vivosP);
      var brillo = g.createLinearGradient(V.X(-Rr), 0, V.X(Rr), 0); brillo.addColorStop(0, 'rgba(255,255,255,0)'); brillo.addColorStop(0.28, 'rgba(255,255,255,.35)'); brillo.addColorStop(0.36, 'rgba(255,255,255,0)'); brillo.addColorStop(0.85, 'rgba(0,0,0,.12)');
      g.fillStyle = brillo; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.closePath(); g.fill();
      sombraPiso(g, V.X(-1.5), V.Y(-0.2) + 2, 60, 6, 0.3);
      g.strokeStyle = '#56616d'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.stroke();
      g.fillStyle = '#3d454e'; for (var rv = 0.12; rv < 1; rv += 0.11) { [[-1, 1], [1, 1]].forEach(function (sg) { g.beginPath(); g.arc(V.X(sg[0] * Rr * rv) - sg[0] * 2, V.Y(H * rv), 1.4, 0, 7); g.fill(); }); }
      g.lineWidth = 5; var rim = g.createLinearGradient(V.X(-Rr), 0, V.X(Rr), 0); rim.addColorStop(0, '#4a5159'); rim.addColorStop(0.3, '#d9dee3'); rim.addColorStop(1, '#4a5159'); g.strokeStyle = rim; g.beginPath(); g.ellipse(V.X(0), V.Y(H), Rr * V.s, Rr * V.s * 0.12, 0, 0, 7); g.stroke();
      g.strokeStyle = '#7b8794'; g.lineWidth = 4; g.beginPath(); g.moveTo(V.X(0), V.Y(0)); g.lineTo(V.X(0), V.Y(-0.2)); g.stroke();
      metalH(g, V.X(-8.5), V.Y(14.6), V.X(-0.6) - V.X(-8.5), 9, '#9aa4ae'); metalV(g, V.X(-1.2), V.Y(14.6), V.X(0.4) - V.X(-1.2), 16, '#9aa4ae'); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(V.X(-0.4), V.Y(14.6) - 4, 5, 0, 7); g.fill();
      g.strokeStyle = 'rgba(70,160,225,.85)'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(V.X(-0.4), V.Y(14.6) + 16); g.lineTo(V.X(-0.4), V.Y(hh)); g.stroke();
      rotulo(g, '8 m³/min', V.X(-0.4) - 8, V.Y(13.4), '#1f6fae', 'right');
      g.setLineDash([5, 4]); g.strokeStyle = COL.gris; g.lineWidth = 1.2; g.beginPath(); g.moveTo(V.X(Rr) + 12, V.Y(0)); g.lineTo(V.X(Rr) + 12, V.Y(H)); g.stroke(); g.beginPath(); g.moveTo(V.X(r), V.Y(hh)); g.lineTo(V.X(Rr) + 30, V.Y(hh)); g.stroke(); g.setLineDash([]);
      rotulo(g, '12 m', V.X(Rr) + 12, V.Y(H / 2), '#56616d'); rotulo(g, 'h = ' + f2(hh), V.X(Rr) + 34, V.Y(hh), COL.teal, 'left');
      rotulo(g, 'r = ' + f2(Math.round(r * 100) / 100), V.X(r) + 30, V.Y(hh) - 16, '#1f6fae', 'left'); rotulo(g, 'radio 6 m', V.X(Rr) + 8, V.Y(H) - 14, '#56616d', 'left');
      panel(g, ['V = πh³/12 = ' + f2(Math.round(vol * 10) / 10) + ' m³ · 🐟 cada 12 m³', 'el nivel sube a ' + f2(Math.round(hp * 1000) / 1000) + ' m/min'], 10, 10);
      lec.innerHTML = 'Por semejanza r/h = 6/12 ⇒ r = h/2 ⇒ V = πh³/12 ⇒ V′ = (πh²/4)·h′ ⇒ <b>h′ = 32/(πh²) = ' + f2(Math.round(hp * 1000) / 1000) + ' m/min</b>';
    }
    hs.inp.addEventListener('input', function () { dib(); }); L.redibuja = dib; dib();
  };

  W.avion = function (c, D) {
    var L = lienzoPx(c, 300), ct = fila(c), x = U.deslizador(ct, 'distancia horizontal x =', 0, 4, 0.005, 1, function (v) { return f2(v) + ' mi'; });
    reloj(ct, x, 4, 0.6, '▶ Hacer volar');
    var lec = U.lectura(c), R = U.reto(c, 'Cuando el avión está a s = 2 millas de la estación, ¿a qué razón crece s? (mi/h)', true, function (v) { return Math.abs(v - 250 * Math.sqrt(3)) < 1; },
      '¡Exacto! x = √3 y s′ = x·500/s = 250√3 ≈ 433 mi/h; además θ′ = −125 rad/h.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -0.6, 4.4, -0.25, 1.55, 6), xx = x.v, s = Math.hypot(1, xx), sp = xx * 500 / s, th = Math.atan2(1, xx), thp = -500 / (1 + xx * xx);
      cielo(g, w, h, '#9fd0ef', '#e7f4fb'); nube(g, w * 0.25, 40, 0.9); nube(g, w * 0.62, 70, 0.7); suelo(g, w, V.Y(0), h, '#9ccc86');
      var ex = V.X(0), ey = V.Y(0);
      g.fillStyle = 'rgba(120,150,130,.5)'; g.beginPath(); g.moveTo(0, ey); for (var hx = 0; hx <= w; hx += 10) g.lineTo(hx, ey - 14 - 10 * Math.sin(hx / 70) - 6 * Math.sin(hx / 23)); g.lineTo(w, ey); g.fill(); suelo(g, w, ey, h, '#9ccc86');
      concreto(g, ex - 18, ey - 22, 36, 22, '#e2ded6', '#a9a49b', 8); g.fillStyle = '#4f6f8f'; g.fillRect(ex - 12, ey - 16, 8, 6); g.fillRect(ex + 4, ey - 16, 8, 6); metalV(g, ex - 2, ey - 32, 4, 10, '#8f99a3');
      var dg = g.createLinearGradient(ex - 18, ey - 40, ex + 18, ey - 20); dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#8895a3'); g.fillStyle = dg; g.beginPath(); g.ellipse(ex, ey - 30, 18, 9, -0.5, 0, 7); g.fill(); g.strokeStyle = '#5f6b78'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(ex + 6, ey - 34, 2, 0, 7); g.fill();
      g.strokeStyle = 'rgba(60,180,90,.35)'; g.lineWidth = 2; for (var k = 1; k <= 3; k++) { g.beginPath(); g.arc(ex, ey - 30, 14 + k * 9, -2.2, -0.9); g.stroke(); }
      var px = V.X(xx), py = V.Y(1);
      g.setLineDash([6, 5]); g.strokeStyle = COL.ambar; g.lineWidth = 2; g.beginPath(); g.moveTo(ex, ey - 30); g.lineTo(px, py); g.stroke(); g.setLineDash([3, 4]); g.strokeStyle = COL.gris; g.beginPath(); g.moveTo(px, py); g.lineTo(px, ey); g.stroke(); g.setLineDash([]);
      g.strokeStyle = COL.teal; g.lineWidth = 2; g.beginPath(); g.arc(ex, ey - 30, 34, -th, 0); g.stroke(); rotulo(g, 'θ', ex + 42, ey - 38, COL.teal, 'left', 13, false);
      sombraPiso(g, px - 20, ey + 6, 30, 4, 0.22);
      g.save(); g.translate(px, py); var fu = g.createLinearGradient(0, -7, 0, 7); fu.addColorStop(0, '#ffffff'); fu.addColorStop(0.5, '#dfe6ec'); fu.addColorStop(1, '#a9b6c2'); g.fillStyle = fu; g.strokeStyle = '#47525e'; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(0, 0, 28, 6.5, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-24, -3); g.lineTo(-32, -17); g.lineTo(-20, -4); g.fill();
      g.fillStyle = '#b7c2cc'; g.beginPath(); g.moveTo(-4, 1); g.lineTo(-14, 13); g.lineTo(4, 2); g.fill(); g.fillStyle = '#3d7fb0'; for (var q = -12; q < 18; q += 6) { g.beginPath(); g.arc(q, -1.5, 1.6, 0, 7); g.fill(); } g.restore();
      flecha(g, px + 32, py, px + 74, py, COL.teal, 2.5); rotulo(g, '500 mi/h', px + 52, py - 18, COL.teal);
      rotulo(g, 's = ' + f2(Math.round(s * 1000) / 1000), (ex + px) / 2 - 12, (ey - 30 + py) / 2 - 12, COL.ambar); rotulo(g, '1 mi', px + 22, (py + ey) / 2, '#56616d', 'left');
      rotulo(g, 'x = ' + f2(xx), (ex + px) / 2, ey + 14, COL.tinta);
      lec.innerHTML = 's² = x² + 1 ⇒ <b>s′ = x·x′/s = ' + f2(Math.round(sp * 10) / 10) + ' mi/h</b> · tan θ = 1/x ⇒ <b>θ′ = −x′/(1 + x²) = ' + f2(Math.round(thp * 10) / 10) + ' rad/h</b>';
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  W.sombra = function (c, D) {
    var L = lienzoPx(c, 300), ct = fila(c), p = U.deslizador(ct, 'distancia a la lámpara =', 1.2, 11.4, 0.01, 4, function (v) { return f2(v) + ' m'; });
    reloj(ct, p, 11.4, 1.6, '▶ Caminar (1,6 m/s)');
    var lec = U.lectura(c), R = U.reto(c, 'Cuando el hombre está a 4 m del edificio, ¿a qué rapidez disminuye su sombra en la pared? (m/s)', true, function (v) { return Math.abs(Math.abs(v) - 0.6) < 0.005; },
      '¡Sí! Está a 8 m de la lámpara: S = 24/x ⇒ S′ = −24·1,6/64 = −0,6 m/s.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -0.8, 13.2, -0.6, 7.2, 6), xx = p.v, S = 24 / xx, Sp = -24 * 1.6 / (xx * xx);
      cielo(g, w, h, '#18233a', '#2c3b5a'); g.fillStyle = '#f4f1d0'; for (var i = 0; i < 26; i++) { g.globalAlpha = 0.5 + (i % 3) * 0.2; g.fillRect((i * 97) % w, (i * 53) % (h * 0.45), 1.6, 1.6); } g.globalAlpha = 1;
      asfalto(g, 0, V.Y(0), w, h - V.Y(0), 5); g.fillStyle = 'rgba(10,14,25,.45)'; g.fillRect(0, V.Y(0), w, h - V.Y(0)); g.fillStyle = '#5d6675'; g.fillRect(0, V.Y(0), w, 3);
      edificioReal(g, V.X(12), V.Y(0), w - V.X(12) + 30, V.Y(0) - V.Y(7.2) + 10, 12, ['#bfae93', '#8f806a']); g.fillStyle = 'rgba(15,20,40,.55)'; g.fillRect(V.X(12), 0, w, V.Y(0));
      var lx = V.X(0), ly = V.Y(0) - 4, top = Math.min(S, 7.2);
      var gl = g.createRadialGradient(lx, ly, 2, lx, ly, w * 0.9); gl.addColorStop(0, 'rgba(255,236,150,.55)'); gl.addColorStop(1, 'rgba(255,236,150,0)');
      g.fillStyle = gl; g.beginPath(); g.moveTo(lx, ly); g.lineTo(V.X(12), V.Y(7.2)); g.lineTo(V.X(12), V.Y(0)); g.closePath(); g.fill();
      g.fillStyle = 'rgba(20,24,35,.78)'; g.fillRect(V.X(12), V.Y(top), 10, V.Y(0) - V.Y(top));
      g.strokeStyle = 'rgba(255,236,150,.7)'; g.setLineDash([5, 5]); g.lineWidth = 1.3; g.beginPath(); g.moveTo(lx, ly); g.lineTo(V.X(12), V.Y(S)); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,230,140,.25)'; g.beginPath(); g.ellipse(lx, V.Y(0) + 4, 40, 6, 0, 0, 7); g.fill(); g.fillStyle = '#ffe58a'; g.beginPath(); g.moveTo(lx - 12, ly + 4); g.lineTo(lx + 12, ly + 4); g.lineTo(lx + 6, ly - 10); g.lineTo(lx - 6, ly - 10); g.fill(); g.fillStyle = '#fff6c9'; g.beginPath(); g.arc(lx, ly - 3, 5, 0, 7); g.fill();
      persona(g, V.X(xx), V.Y(0), 2 * V.s, '#11151d', xx * 4);
      rotulo(g, 'sombra S = ' + f2(Math.round(S * 100) / 100) + ' m', V.X(12) - 6, V.Y(Math.min(S, 6.6)) - 12, '#fff', 'right', 13, 'rgba(20,24,35,.75)');
      rotulo(g, 'x = ' + f2(xx), (lx + V.X(xx)) / 2, V.Y(0) + 14, '#e9eef5', 'center', 13, 'rgba(20,24,35,.6)'); rotulo(g, '12 m', V.X(6), h - 12, '#e9eef5', 'center', 12, false);
      lec.innerHTML = 'Triángulos semejantes: S/12 = 2/x ⇒ S = 24/x ⇒ <b>S′ = −24x′/x² = ' + f2(Math.round(Sp * 1000) / 1000) + ' m/s</b> (a ' + f2(Math.round((12 - xx) * 100) / 100) + ' m del edificio)';
    }
    p.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  function carro(g, x, y, ang, col, largo, ancho, camion) {
    g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = 'rgba(0,0,0,.18)'; rr(g, -largo / 2 + 2, -ancho / 2 + 3, largo, ancho, 5); g.fill();
    g.fillStyle = col; rr(g, -largo / 2, -ancho / 2, largo, ancho, 5); g.fill();
    var lu = g.createLinearGradient(0, -ancho / 2, 0, ancho / 2); lu.addColorStop(0, 'rgba(255,255,255,.35)'); lu.addColorStop(0.5, 'rgba(255,255,255,0)'); lu.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = lu; rr(g, -largo / 2, -ancho / 2, largo, ancho, 5); g.fill();
    g.fillStyle = 'rgba(200,230,250,.9)'; if (camion) { rr(g, largo / 2 - 12, -ancho / 2 + 3, 8, ancho - 6, 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-largo / 2 + 3, -ancho / 2 + 3, largo - 20, ancho - 6); }
    else { rr(g, largo * 0.12, -ancho / 2 + 3, largo * 0.18, ancho - 6, 2); g.fill(); rr(g, -largo * 0.32, -ancho / 2 + 3, largo * 0.14, ancho - 6, 2); g.fill(); }
    g.fillStyle = '#ffe9a8'; g.fillRect(largo / 2 - 3, -ancho / 2 + 2, 3, 4); g.fillRect(largo / 2 - 3, ancho / 2 - 6, 3, 4); g.restore();
  }
  W.cruce = function (c, D) {
    var L = lienzoPx(c, 340), ct = fila(c), t = U.deslizador(ct, 'tiempo t =', 0, 4, 0.01, 0.5, function (v) { return f2(v) + ' s'; });
    reloj(ct, t, 4, 1, '▶ Arrancar');
    var lec = U.lectura(c), R = U.reto(c, '¿Con qué rapidez se alejan 2 s después de que el camión cruza? (pies/s)', true, function (v) { return Math.abs(v - 14) < 0.05; },
      '¡Correcto! x = 60, y = 80, D = 100 y D′ = (60·(−30) + 80·40)/100 = 14 pies/s.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -140, 200, -40, 200, 6), tt = t.v, xx = 120 - 30 * tt, yy = 40 * tt, Dd = Math.hypot(xx, yy), Dp = (xx * -30 + yy * 40) / (Dd || 1);
      pasto(g, 0, 0, w, h, 21, true);
      var an = 26 * V.s; g.fillStyle = '#c9c4ba'; g.fillRect(0, V.Y(0) - an / 2 - 7, w, an + 14); g.fillRect(V.X(0) - an / 2 - 7, 0, an + 14, h); moteado(g, 0, 0, w, h, 400, ['rgba(0,0,0,.05)'], 1.5, 2);
      asfalto(g, 0, V.Y(0) - an / 2, w, an, 7); asfalto(g, V.X(0) - an / 2, 0, an, h, 8); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, V.Y(0) - an / 2, w, 1.5); g.fillRect(0, V.Y(0) + an / 2 - 1.5, w, 1.5);
      g.fillStyle = 'rgba(255,255,255,.85)'; for (var zb = -an / 2 + 3; zb < an / 2 - 3; zb += 6) { g.fillRect(V.X(0) - an / 2 - 16, V.Y(0) + zb, 12, 3); g.fillRect(V.X(0) + an / 2 + 4, V.Y(0) + zb, 12, 3); g.fillRect(V.X(0) + zb, V.Y(0) - an / 2 - 16, 3, 12); }
      g.strokeStyle = '#f2d15a'; g.lineWidth = 2; g.setLineDash([10, 9]); g.beginPath(); g.moveTo(0, V.Y(0)); g.lineTo(w, V.Y(0)); g.moveTo(V.X(0), 0); g.lineTo(V.X(0), h); g.stroke(); g.setLineDash([]);
            [[-90, 170], [150, 170], [-110, -20], [170, -25]].forEach(function (a) { arbol(g, V.X(a[0]), V.Y(a[1]), 0.8); });
      g.setLineDash([6, 5]); g.strokeStyle = COL.rojo; g.lineWidth = 2.2; g.beginPath(); g.moveTo(V.X(-xx), V.Y(0)); g.lineTo(V.X(0), V.Y(yy)); g.stroke(); g.setLineDash([]);
      carro(g, V.X(-xx), V.Y(0) + an / 4, 0, '#c0392b', 34, 16, false); carro(g, V.X(0) + an / 4, V.Y(yy), -Math.PI / 2, '#2f6fa3', 44, 18, true);
      rotulo(g, 'x = ' + f2(Math.round(xx * 10) / 10) + ' pies', V.X(-xx / 2), V.Y(0) + an / 2 + 14, COL.tinta); rotulo(g, 'y = ' + f2(Math.round(yy * 10) / 10) + ' pies', V.X(0) + an / 2 + 6, V.Y(yy / 2), COL.tinta, 'left');
      rotulo(g, 'D = ' + f2(Math.round(Dd * 10) / 10), V.X(-xx / 2) - 12, V.Y(yy / 2) - 6, COL.rojo, 'right');
      panel(g, ['t = ' + f2(Math.round(tt * 100) / 100) + ' s', 'auto → 30 pies/s · camión ↑ 40 pies/s'], 10, 10);
      lec.innerHTML = 'D² = x² + y² ⇒ D′ = (x·x′ + y·y′)/D = (' + f2(Math.round(xx * 10) / 10) + '·(−30) + ' + f2(Math.round(yy * 10) / 10) + '·40)/' + f2(Math.round(Dd * 10) / 10) + ' = <b>' + f2(Math.round(Dp * 100) / 100) + ' pies/s</b> ' + (Dp < 0 ? '(se acercan)' : '(se alejan)');
    }
    t.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Cálculo diferencial · optimización
     ===================================================================== */
  function grafOpt(c, f, a, b, ymax, pasoX, pasoY) { var G = U.Lienzo(c, 170, [a, b, 0, ymax]); return { G: G, dib: function (x0) { G.limpia(); G.ejes(pasoX, pasoY); G.curva(f, COL.teal, 2.2, a, b); G.punto(x0, f(x0), COL.rojo, 5); } }; }

  W.rio = function (c, D) {
    var P = 2400, L = lienzoPx(c, 300), Ar = function (x) { return x * (P - 2 * x); };
    var Gf = grafOpt(c, function (x) { return Ar(x) / 1000; }, 0, 1200, 760, 200, 200);
    var ct = fila(c), x = U.deslizador(ct, 'lados perpendiculares x =', 20, 1180, 1, 300, function (v) { return Math.round(v) + ' m'; });
    var lec = U.lectura(c), R = U.reto(c, 'Mueve x hasta encerrar el área más grande posible.', false, function () { return true; }, '¡Máximo! x = 600 m y el lado paralelo al río mide 1200 m: área de 720 000 m².'); R.el.__fin = c.__fin;
    var chk = alLlegar(x, 600, 2, R, c), r = azar(5), ovejas = sitiosRect(40, 5).map(function (p) { return [p[0], p[1], r() < 0.5 ? 1 : -1]; }), Pb = Poblador(function () { dib(); });
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, y = P - 2 * xx, V = vista(L, -40, 2440, -1250, 160, 8);
      pasto(g, 0, 0, w, h, 23);
      g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, V.Y(0) + 6); for (var px = w; px >= 0; px -= 8) g.lineTo(px, V.Y(0) + 6 + 3 * Math.sin(px / 18)); g.closePath(); g.clip(); arena(g, 0, 0, w, V.Y(0) + 12, 3); g.restore();
      g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, V.Y(0)); for (var px2 = w; px2 >= 0; px2 -= 8) g.lineTo(px2, V.Y(0) + 3 * Math.sin(px2 / 18)); g.closePath(); g.clip(); aguaArriba(g, 0, 0, w, V.Y(0) + 4, 9, '#2f87c4', '#5fb3e6'); g.restore();
            var x0 = 1200 - y / 2, X0 = V.X(x0), X1 = V.X(x0 + y), Y0 = V.Y(0), Y1 = V.Y(-xx);
      g.save(); g.beginPath(); g.rect(X0, Y0, X1 - X0, Y1 - Y0); g.clip(); pasto(g, X0, Y0, X1 - X0, Y1 - Y0, 25, true); g.restore();
      g.strokeStyle = '#8b5a2b'; g.lineWidth = 3; g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0, Y1); g.lineTo(X1, Y1); g.lineTo(X1, Y0); g.stroke();
      g.fillStyle = '#6d4520'; var per = [[X0, Y0, X0, Y1], [X0, Y1, X1, Y1], [X1, Y1, X1, Y0]];
      per.forEach(function (s) { var n = Math.max(2, Math.round(Math.hypot(s[2] - s[0], s[3] - s[1]) / 18)); for (var q = 0; q <= n; q++) g.fillRect(s[0] + (s[2] - s[0]) * q / n - 2, s[1] + (s[3] - s[1]) * q / n - 2, 4, 4); });
      var nOv = Math.max(0, Math.round(Ar(xx) / 20000)), vivos = [];
      for (var q = 0; q < nOv; q++) { var o = ovejas[q], ox = X0 + 9 + o[0] * Math.max(0, X1 - X0 - 22), oy = Y0 + 8 + o[1] * Math.max(0, Y1 - Y0 - 18), al = Pb.a('o' + q); vivos.push('o' + q);
        g.globalAlpha = al; oveja(g, ox, oy + (1 - al) * 4, Math.min(1, 0.55 + w / 1400), o[2]); g.globalAlpha = 1; }
      Pb.cierra(vivos);
      rotulo(g, '🐑 ' + nOv + (nOv === 1 ? ' oveja' : ' ovejas') + ' (cada una necesita 20 000 m²)', w - 10, h - 16, '#2f5d1f', 'right', 12);
      rotulo(g, 'río (no se cerca)', w / 2, V.Y(0) / 2, '#fff', 'center', 13, 'rgba(0,60,110,.35)');
      rotulo(g, 'x = ' + Math.round(xx), X0 - 6, (Y0 + Y1) / 2, '#6d4520', 'right'); rotulo(g, 'y = 2400 − 2x = ' + Math.round(y), (X0 + X1) / 2, Y1 + 14, '#6d4520');
      Gf.dib(xx); lec.innerHTML = 'Área A(x) = x(2400 − 2x) = <b>' + miles(Ar(xx)) + ' m²</b> · A′(x) = 2400 − 4x = ' + Math.round(2400 - 4 * xx) + ' <span style="color:#56606b">(gráfica en miles de m²)</span>';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.alambre = function (c, D) {
    var L = lienzoPx(c, 260), Ar = function (x) { return x * x / 16 + (10 - x) * (10 - x) / (4 * Math.PI); }, Pf = Poblador(function () { dib(); });
    var SQ = sitiosRect(30, 8), rq = azar(9), CI = []; while (CI.length < 40) { var px = rq() * 2 - 1, py = rq() * 2 - 1; if (px * px + py * py < 1) CI.push([px, py]); }
    var Gf = grafOpt(c, Ar, 0, 10, 8.5, 1, 2);
    var ct = fila(c), x = U.deslizador(ct, 'alambre para el cuadrado x =', 0, 10, 0.01, 4, function (v) { return f2(v) + ' m'; });
    var lec = U.lectura(c), R = U.reto(c, '¿Cuántos metros hay que usar en el cuadrado para que el área total sea MÁXIMA?', true, function (v) { return Math.abs(v) < 0.005; },
      '¡Ojo al truco! El máximo está en un extremo: x = 0, todo el alambre al círculo (A ≈ 7,96 m²). El punto crítico x = 40/(4 + π) ≈ 5,60 es un mínimo.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, lado = xx / 4, rad = (10 - xx) / (2 * Math.PI), V = vista(L, -0.3, 10.3, -3.6, 1.2, 8);
      paredEstuco(g, w, h, '#f5f0e6', '#e8e0d0', 7); mesaMadera(g, w, V.Y(0.6) + 14, h);
      g.lineCap = 'round'; g.lineWidth = 6; g.strokeStyle = '#6e3f12'; g.beginPath(); g.moveTo(V.X(0), V.Y(0.6)); g.lineTo(V.X(xx), V.Y(0.6)); g.stroke(); g.lineWidth = 4; g.strokeStyle = '#d08a45'; g.beginPath(); g.moveTo(V.X(0), V.Y(0.6)); g.lineTo(V.X(xx), V.Y(0.6)); g.stroke();
      g.strokeStyle = '#4a5159'; g.lineWidth = 6; g.beginPath(); g.moveTo(V.X(xx), V.Y(0.6)); g.lineTo(V.X(10), V.Y(0.6)); g.stroke(); g.strokeStyle = '#c3cad2'; g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(V.X(xx), V.Y(0.6) - 1); g.lineTo(V.X(10), V.Y(0.6) - 1); g.stroke(); g.strokeStyle = 'rgba(255,220,170,.7)'; g.beginPath(); g.moveTo(V.X(0), V.Y(0.6) - 1); g.lineTo(V.X(xx), V.Y(0.6) - 1); g.stroke();
      g.save(); g.translate(V.X(xx), V.Y(0.6)); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-7, -16); g.lineTo(0, -4); g.lineTo(7, -16); g.lineWidth = 2; g.strokeStyle = '#c0392b'; g.stroke(); g.beginPath(); g.arc(-8, -20, 4, 0, 7); g.arc(8, -20, 4, 0, 7); g.stroke(); g.restore();
      rotulo(g, f2(Math.round(xx * 100) / 100) + ' m', V.X(xx / 2), V.Y(0.6) + 16, '#b06d2b'); rotulo(g, f2(Math.round((10 - xx) * 100) / 100) + ' m', V.X((10 + xx) / 2), V.Y(0.6) + 16, '#56616d');
      var cy = V.Y(-1.9);
      if (lado > 0.005) { g.fillStyle = 'rgba(176,109,43,.18)'; g.strokeStyle = '#b06d2b'; g.lineWidth = 3.5; g.fillRect(V.X(2.6) - lado * V.s / 2, cy - lado * V.s / 2, lado * V.s, lado * V.s); g.strokeRect(V.X(2.6) - lado * V.s / 2, cy - lado * V.s / 2, lado * V.s, lado * V.s); }
      if (rad > 0.005) { g.fillStyle = 'rgba(125,138,150,.18)'; g.strokeStyle = '#7d8a96'; g.lineWidth = 3.5; g.beginPath(); g.arc(V.X(7.3), cy, rad * V.s, 0, 7); g.fill(); g.stroke(); }
      var vivosF = [], colF = ['#f29fb5', '#ffffff', '#c39bd3', '#f5b041'];
      var nq = Math.round(lado * lado * 4), nc = Math.round(Math.PI * rad * rad * 4);
      for (var q = 0; q < nq; q++) { var p = SQ[q]; var al = Pf.a('q' + q); vivosF.push('q' + q); g.globalAlpha = al; flor(g, V.X(2.6) + (p[0] - 0.5) * lado * V.s * 0.82, cy + (p[1] - 0.5) * lado * V.s * 0.82, Math.min(1.2, 0.55 + V.s / 60), colF[q % 4]); g.globalAlpha = 1; }
      for (q = 0; q < nc; q++) { var d = CI[q]; var al2 = Pf.a('c' + q); vivosF.push('c' + q); g.globalAlpha = al2; flor(g, V.X(7.3) + d[0] * rad * V.s * 0.84, cy + d[1] * rad * V.s * 0.84, Math.min(1.2, 0.55 + V.s / 60), colF[(q + 1) % 4]); g.globalAlpha = 1; }
      Pf.cierra(vivosF);
      rotulo(g, '□ ' + f2(Math.round(lado * lado * 100) / 100) + ' m²', V.X(2.6), V.Y(-3.4), '#b06d2b'); rotulo(g, '○ ' + f2(Math.round(Math.PI * rad * rad * 100) / 100) + ' m²', V.X(7.3), V.Y(-3.4), '#56616d');
      Gf.dib(xx); lec.innerHTML = '🌸 Cada flor ocupa ¼ m² · A(x) = x²/16 + (10 − x)²/(4π) = <b>' + f2(Math.round(Ar(xx) * 1000) / 1000) + ' m²</b> · compara los extremos A(0) ≈ 7,958 y A(10) = 6,25 con el punto crítico';
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.cajaabierta = function (c, D) {
    var Vol = 32000, L = lienzoPx(c, 280), M = function (x) { return x * x + 4 * Vol / x; }, Pc = Poblador(function () { dib(); });
    var Gf = grafOpt(c, function (x) { return M(x) / 1000; }, 10, 90, 14, 10, 2);
    var ct = fila(c), x = U.deslizador(ct, 'lado de la base x =', 12, 88, 0.1, 25, function (v) { return f2(v) + ' cm'; });
    var lec = U.lectura(c), R = U.reto(c, 'Encuentra la base que usa menos material.', false, function () { return true; }, '¡Mínimo! Base de 40 × 40 cm y altura 20 cm: 4800 cm² de material.'); R.el.__fin = c.__fin;
    var chk = alLlegar(x, 40, 0.25, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, hh = Vol / (xx * xx); paredEstuco(g, w, h, '#f4efe5', '#e3dacb', 9); mesaMadera(g, w, h - 30, h);
      var k = Math.min(2.3, 200 / Math.max(xx * 1.45, hh + xx * 0.45)), bw = xx * k, bh = hh * k, dx = xx * k * 0.45, dy = xx * k * 0.28, ox = w / 2 - (bw + dx) / 2, oy = h - 26;
      g.fillStyle = 'rgba(80,60,30,.25)'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox - bh * 0.35, oy + 6); g.lineTo(ox + bw - bh * 0.35 + dx * 0.2, oy + 6); g.lineTo(ox + bw + dx, oy - dy); g.lineTo(ox + bw, oy); g.closePath(); g.fill();
      g.lineJoin = 'round'; g.strokeStyle = '#8a5a2b'; g.lineWidth = 2;
      g.fillStyle = '#c99a62'; g.beginPath(); g.moveTo(ox + dx, oy - dy - bh); g.lineTo(ox + dx + bw, oy - dy - bh); g.lineTo(ox + dx + bw, oy - dy); g.lineTo(ox + dx, oy - dy); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#b5844c'; g.beginPath(); g.moveTo(ox, oy - bh); g.lineTo(ox + dx, oy - dy - bh); g.lineTo(ox + dx, oy - dy); g.lineTo(ox, oy); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#dcb57f'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + bw, oy); g.lineTo(ox + bw, oy - bh); g.lineTo(ox, oy - bh); g.closePath(); g.fill(); g.stroke(); moteado(g, ox, oy - bh, bw, bh, bw * bh / 12, ['rgba(120,80,30,.12)', 'rgba(255,255,255,.15)'], 1.2, 4); g.strokeStyle = 'rgba(120,80,30,.25)'; g.lineWidth = 1; for (var fl = ox + 4; fl < ox + bw; fl += 4) { g.beginPath(); g.moveTo(fl, oy - bh + 2); g.lineTo(fl, oy - 2); g.stroke(); } var cl = g.createLinearGradient(ox, 0, ox + bw, 0); cl.addColorStop(0, 'rgba(255,255,255,.12)'); cl.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = cl; g.fillRect(ox, oy - bh, bw, bh); g.strokeStyle = '#8a5a2b'; g.lineWidth = 2;
      g.fillStyle = '#c99a62'; g.beginPath(); g.moveTo(ox + bw, oy); g.lineTo(ox + bw + dx, oy - dy); g.lineTo(ox + bw + dx, oy - dy - bh); g.lineTo(ox + bw, oy - bh); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(138,90,43,.6)'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(ox, oy - bh); g.lineTo(ox + bw, oy - bh); g.stroke(); g.setLineDash([]);
      rotulo(g, 'x = ' + f2(Math.round(xx * 10) / 10), ox + bw / 2, oy + 13, '#6d4520'); rotulo(g, 'h = ' + f2(Math.round(hh * 10) / 10), ox + bw + dx + 8, oy - dy - bh / 2, '#6d4520', 'left');
      var nL = Math.round(M(xx) / 400), vivosL = [], bx0 = w - 70, by0 = h - 24;
      for (var q = 0; q < nL; q++) { var al = Pc.a('l' + q); vivosL.push('l' + q); g.globalAlpha = al; var yq = by0 - q * 5 - (1 - al) * 8;
        g.fillStyle = q % 2 ? '#d9b27c' : '#cfa56c'; g.beginPath(); g.moveTo(bx0 - 26, yq); g.lineTo(bx0 + 26, yq); g.lineTo(bx0 + 34, yq - 7); g.lineTo(bx0 - 18, yq - 7); g.closePath(); g.fill(); g.strokeStyle = '#8a5a2b'; g.lineWidth = 0.8; g.stroke(); g.globalAlpha = 1; }
      Pc.cierra(vivosL); rotulo(g, nL + ' láminas de 400 cm²', bx0 + 4, by0 + 12, '#6d4520', 'center', 11);
      panel(g, ['sin tapa · V = 32 000 cm³', 'material = ' + miles(M(xx)) + ' cm²'], 10, 10);
      Gf.dib(xx); lec.innerHTML = 'h = 32 000/x² ⇒ M(x) = x² + 4xh = x² + 128 000/x = <b>' + miles(M(xx)) + ' cm²</b> · M′(x) = 2x − 128 000/x² = ' + f2(Math.round((2 * xx - 128000 / (xx * xx)) * 10) / 10) + ' <span style="color:#56606b">(gráfica en miles de cm²)</span>';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.tuberia = function (c, D) {
    var L = lienzoPx(c, 280), C = function (x) { return 2 * Math.sqrt(4 + x * x) + (4 - x); }, Pu = Poblador(function () { dib(); });
    var Gf = grafOpt(c, C, 0, 4, 9, 1, 1);
    var ct = fila(c), x = U.deslizador(ct, 'sale a la costa a x =', 0, 4, 0.005, 3, function (v) { return f2(v) + ' km'; });
    var lec = U.lectura(c), R = U.reto(c, 'Mueve el punto P hasta que el costo sea mínimo (en unidades de k).', false, function () { return true; }, '¡Mínimo! x = 2/√3 ≈ 1,155 km y C = 4 + 2√3 ≈ 7,46k.'); R.el.__fin = c.__fin;
    var chk = alLlegar(x, 2 / Math.sqrt(3), 0.012, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, V = vista(L, -0.7, 4.8, -2.5, 1.7, 8), costa = V.Y(0);
      aguaArriba(g, 0, costa, w, h - costa, 17, '#62b6e3', '#1f6a9e'); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(0, costa + 2); for (var sx = 0; sx <= w; sx += 8) g.lineTo(sx, costa + 3 + 2 * Math.sin(sx / 11)); g.lineTo(w, costa); g.lineTo(0, costa); g.fill();
      arena(g, 0, costa - 12, w, 12, 5); pasto(g, 0, 0, w, costa - 12, 27);
            var px0 = V.X(0), py0 = V.Y(-2);
      g.strokeStyle = '#3a3f46'; g.lineWidth = 3; g.beginPath(); g.moveTo(px0 - 14, py0 + 10); g.lineTo(px0 - 6, py0 - 18); g.moveTo(px0 + 14, py0 + 10); g.lineTo(px0 + 6, py0 - 18); g.stroke();
      g.fillStyle = '#e0a030'; g.fillRect(px0 - 18, py0 - 22, 36, 8); g.strokeStyle = '#3a3f46'; g.lineWidth = 2; g.beginPath(); g.moveTo(px0, py0 - 22); g.lineTo(px0, py0 - 44); g.lineTo(px0 + 10, py0 - 30); g.stroke();
      var rx = V.X(4); concreto(g, rx - 8, costa - 46, 26, 36, '#c9ced4', '#8f98a1', 3); metalV(g, rx - 28, costa - 40, 22, 28, '#c3cad1'); g.fillStyle = '#8f98a1'; g.beginPath(); g.ellipse(rx - 17, costa - 40, 11, 3, 0, 0, 7); g.fill(); metalV(g, rx + 8, costa - 64, 6, 24, '#8f98a1'); g.fillStyle = '#c0392b'; g.fillRect(rx + 8, costa - 64, 6, 3);
      g.fillStyle = 'rgba(200,200,200,.6)'; g.beginPath(); g.arc(rx + 11, costa - 68, 5, 0, 7); g.arc(rx + 16, costa - 76, 6, 0, 7); g.fill();
      rotulo(g, 'pozo', px0, py0 + 22, '#fff', 'center', 12, 'rgba(0,50,90,.4)'); rotulo(g, 'refinería', rx, costa - 84, '#3a3f46', 'center', 12);
      var Px = V.X(xx);
      g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = '#1d2b36'; g.beginPath(); g.moveTo(px0, py0 - 14); g.lineTo(Px, costa - 5); g.stroke();
      g.strokeStyle = '#d17a22'; g.beginPath(); g.moveTo(Px, costa - 5); g.lineTo(rx - 6, costa - 5); g.stroke();
      g.fillStyle = COL.rojo; g.beginPath(); g.arc(Px, costa - 5, 6, 0, 7); g.fill(); rotulo(g, 'P', Px, costa - 22, COL.rojo, 'center', 13);
      rotulo(g, 'mar: 2k por km', (px0 + Px) / 2 + 28, (py0 + costa) / 2 + 6, '#fff', 'left', 12, 'rgba(0,40,70,.45)'); rotulo(g, 'tierra: k por km', (Px + rx) / 2, costa - 24, '#8a4f12', 'center', 12);
      var nBi = Math.round(C(xx) * 3); var pfB = Math.max(5, Math.floor(w * 0.3 / 21)); Pu.cierra(iconos(g, Pu, nBi, icoBillete, w - 16, h - 14, -21, -13, pfB, 'b', 1));
      rotulo(g, 'costo: ' + nBi + ' billetes (cada uno ⅓ k)', w - 12, h - 32 - Math.floor((nBi - 1) / pfB) * 13, '#fff', 'right', 11, 'rgba(0,40,70,.55)');
      Gf.dib(xx); lec.innerHTML = 'C(x) = 2k√(4 + x²) + k(4 − x) = <b>' + f2(Math.round(C(xx) * 1000) / 1000) + 'k</b> · C′(x) = k(2x/√(4 + x²) − 1) = ' + f2(Math.round((2 * xx / Math.sqrt(4 + xx * xx) - 1) * 1000) / 1000) + 'k';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.canoa = function (c, D) {
    var L = lienzoPx(c, 260), Vf = function (t) { return 160 * Math.sin(t * Math.PI / 180); }, Pn = Poblador(function () { dib(); });
    var Gf = grafOpt(c, Vf, 0, 180, 175, 30, 40);
    var ct = fila(c), th = U.deslizador(ct, 'ángulo entre los lados θ =', 5, 175, 0.5, 40, function (v) { return f2(v) + '°'; });
    var lec = U.lectura(c), R = U.reto(c, 'Abre la canoa hasta que le quepa la mayor cantidad posible.', false, function () { return true; }, '¡Máximo! θ = 90°: el extremo es un triángulo rectángulo isósceles y V = 160 m³.'); R.el.__fin = c.__fin;
    var chk = alLlegar(th, 90, 0.6, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, t = th.v * Math.PI / 180, V = vista(L, -6.2, 13.5, -4.4, 3.4, 6);
      cielo(g, w, h * 0.56, '#9fd0ef', '#eef6f2'); nube(g, w * 0.15, 26, 0.7); nube(g, w * 0.8, 40, 0.6); g.fillStyle = 'rgba(110,150,120,.6)'; g.beginPath(); g.moveTo(0, h * 0.56); for (var hx = 0; hx <= w; hx += 10) g.lineTo(hx, h * 0.56 - 8 - 7 * Math.sin(hx / 50)); g.lineTo(w, h * 0.56); g.fill(); marOlas(g, w, h * 0.56, h, 8);
      var bx = 4 * Math.sin(t / 2), dep = 4 * Math.cos(t / 2), lx = 6.5, ly = 2.6, O = [0, 0];
      function P(x, y, z) { return [V.X(x + z * lx / 20), V.Y(y + z * ly / 20)]; }
      var a1 = P(-bx, 0, 0), a2 = P(bx, 0, 0), a3 = P(0, -dep, 0), b1 = P(-bx, 0, 20), b2 = P(bx, 0, 20), b3 = P(0, -dep, 20);
      function pol(p, col) { g.save(); g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); g.fillStyle = col; g.fill(); g.clip(); var bx0 = Math.min.apply(null, p.map(function (q) { return q[0]; })), by0 = Math.min.apply(null, p.map(function (q) { return q[1]; })), bx1 = Math.max.apply(null, p.map(function (q) { return q[0]; })), by1 = Math.max.apply(null, p.map(function (q) { return q[1]; })); g.globalAlpha = 0.55; madera(g, bx0, by0, bx1 - bx0, by1 - by0, col, '#c98b52', 33, false); g.globalAlpha = 1; g.restore(); g.strokeStyle = '#6b3d16'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var j = 1; j < p.length; j++) g.lineTo(p[j][0], p[j][1]); g.closePath(); g.stroke(); }
      pol([a1, b1, b3, a3], '#a66a35'); pol([a2, b2, b3, a3], '#8e5527');
      g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 1; for (var q0 = 1; q0 < 5; q0++) { var u0 = q0 / 5; [[a1, a3, b1, b3], [a2, a3, b2, b3]].forEach(function (f) { g.beginPath(); g.moveTo(f[0][0] + (f[1][0] - f[0][0]) * u0, f[0][1] + (f[1][1] - f[0][1]) * u0); g.lineTo(f[2][0] + (f[3][0] - f[2][0]) * u0, f[2][1] + (f[3][1] - f[2][1]) * u0); g.stroke(); }); } pol([a1, a2, b2, b1], 'rgba(255,230,190,.35)'); pol([a1, a2, a3], '#c98a4f');
      g.strokeStyle = '#6b3d16'; g.lineWidth = 1; for (var q = 1; q < 6; q++) { var u = q / 6, p1 = [a1[0] + (a3[0] - a1[0]) * u, a1[1] + (a3[1] - a1[1]) * u], p2 = [a2[0] + (a3[0] - a2[0]) * u, a2[1] + (a3[1] - a2[1]) * u]; g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); }
      g.strokeStyle = COL.rojo; g.lineWidth = 2; g.beginPath(); var an = Math.atan2(a1[1] - a3[1], a1[0] - a3[0]), an2 = Math.atan2(a2[1] - a3[1], a2[0] - a3[0]); g.arc(a3[0], a3[1], 18, Math.min(an, an2), Math.max(an, an2)); g.stroke();
      rotulo(g, 'θ', a3[0], a3[1] - 28, COL.rojo, 'center', 13, false); rotulo(g, '4 m', (a1[0] + a3[0]) / 2 - 18, (a1[1] + a3[1]) / 2, '#6b3d16', 'right'); rotulo(g, '20 m de largo', (a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2 - 14, '#6b3d16');
      var nB = Math.round(Vf(th.v) / 16), vivosB = [];
      for (var q = 0; q < nB; q++) { var u = (q + 0.5) / 10, al = Pn.a('b' + q); vivosB.push('b' + q); var P0 = P(0, 0, u * 20); g.globalAlpha = al; barril(g, P0[0], P0[1] - 6 - (1 - al) * 10, Math.min(1.5, Math.max(0.9, V.s / 22))); g.globalAlpha = 1; }
      Pn.cierra(vivosB); rotulo(g, '🛢️ ' + nB + ' barriles de 16 m³', w - 12, h - 16, '#3d2412', 'right', 12);
      Gf.dib(th.v); lec.innerHTML = 'Área del extremo = ½·4·4·sen θ = 8 sen θ ⇒ <b>V(θ) = 160 sen θ = ' + f2(Math.round(Vf(th.v) * 10) / 10) + ' m³</b>';
      chk();
    }
    th.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  /* =====================================================================
     Cálculo integral · aplicaciones físicas
     ===================================================================== */
  W.caida = function (c, D) {
    var h0 = 20, v0 = 15, g9 = 9.8, T = (v0 + Math.sqrt(v0 * v0 + 2 * g9 * h0)) / g9, H = function (t) { return h0 + v0 * t - g9 / 2 * t * t; };
    var L = lienzoPx(c, 330), ct = fila(c), t = U.deslizador(ct, 'tiempo t =', 0, Math.floor(T * 100) / 100, 0.01, 0.8, function (v) { return f2(v) + ' s'; });
    reloj(ct, t, Math.floor(T * 100) / 100, 1, '▶ Lanzar la piedra');
    var lec = U.lectura(c), R = U.reto(c, '¿En qué instante llega la piedra al suelo? (s, 2 decimales)', true, function (v) { return Math.abs(v - T) < 0.01; },
      '¡Exacto! −4,9t² + 15t + 20 = 0 da t = (15 + √617)/9,8 ≈ 4,07 s.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -14, 26, -1.5, 34, 6), tt = t.v, y = H(tt), v = v0 - g9 * tt;
      cielo(g, w, h); nube(g, w * 0.42, 40, 0.9); suelo(g, w, V.Y(0), h);
      g.fillStyle = 'rgba(130,160,175,.45)'; [[-13, 9, 3.5], [3, 13, 3], [9, 7, 4]].forEach(function (b) { g.fillRect(V.X(b[0]), V.Y(b[1]), b[2] * V.s, V.Y(0) - V.Y(b[1])); }); suelo(g, w, V.Y(0), h);
      edificioReal(g, V.X(-8), V.Y(0), V.X(0) - V.X(-8), V.Y(0) - V.Y(20), 14);
      persona(g, V.X(-1.6), V.Y(20) - 3, 1.8 * V.s, '#34495e', 0.4);
      var px = V.X(1.2);
      for (var k = 0; k <= 40; k++) { var tk = T * k / 40; if (tk > tt) break; g.fillStyle = 'rgba(120,120,120,' + (0.12 + 0.25 * k / 40) + ')'; g.beginPath(); g.arc(px + (tk < (v0 / g9) ? -5 : 5), V.Y(H(tk)), 2.4, 0, 7); g.fill(); }
      g.fillStyle = '#6d6f73'; g.beginPath(); g.ellipse(px, V.Y(y) - 5, 7, 5.5, 0.4, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(px - 2, V.Y(y) - 7, 2, 0, 7); g.fill();
      flecha(g, px + 16, V.Y(y) - 5, px + 16, V.Y(y) - 5 - v * 2.4, v > 0 ? COL.teal : COL.rojo, 2.5);
      g.setLineDash([4, 4]); g.strokeStyle = COL.gris; g.lineWidth = 1; g.beginPath(); g.moveTo(V.X(-8), V.Y(H(v0 / g9))); g.lineTo(V.X(14), V.Y(H(v0 / g9))); g.stroke(); g.setLineDash([]);
      rotulo(g, 'altura máxima ≈ ' + f2(Math.round(H(v0 / g9) * 100) / 100) + ' m', V.X(14), V.Y(H(v0 / g9)), '#56616d', 'left', 12);
      rotulo(g, '20 m', V.X(-8) - 6, V.Y(10), '#6d5a45', 'right'); rotulo(g, 'v = ' + f2(Math.round(v * 100) / 100) + ' m/s', px + 26, V.Y(y) - 5, v > 0 ? COL.teal : COL.rojo, 'left');
      panel(g, ['t = ' + f2(Math.round(tt * 100) / 100) + ' s', 'altura h = ' + f2(Math.round(y * 100) / 100) + ' m'], w - 170, 10);
      lec.innerHTML = 'a = −9,8 ⇒ v(t) = −9,8t + 15 ⇒ <b>h(t) = −4,9t² + 15t + 20</b> (las constantes son la velocidad y la altura iniciales)';
    }
    t.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  function resorteDib(g, x1, x2, y, vueltas, amp, col) {
    g.save(); g.strokeStyle = col; g.lineWidth = 2.4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x1, y); var n = vueltas * 2, a = x1 + 10, b = x2 - 10; g.lineTo(a, y);
    for (var i = 1; i < n; i++) g.lineTo(a + (b - a) * i / n, y + (i % 2 ? -amp : amp)); g.lineTo(b, y); g.lineTo(x2, y); g.stroke(); g.restore();
  }
  W.resorte = function (c, D) {
    var Pr = Poblador(function () { dib(); }), k = 800, L = lienzoPx(c, 170), G = U.Lienzo(c, 200, [0, 0.105, 0, 90]);
    var ct = fila(c), Ls = U.deslizador(ct, 'longitud del resorte =', 10, 20, 0.1, 15, function (v) { return f2(v) + ' cm'; });
    var lec = U.lectura(c), R = U.reto(c, '¿Cuánto trabajo cuesta estirarlo de 15 a 18 cm? (J)', true, function (v) { return Math.abs(v - 1.56) < 0.005; },
      '¡Bien! k = 40/0,05 = 800 N/m y W = ∫ de 0,05 a 0,08 de 800x dx = 400(0,08² − 0,05²) = 1,56 J.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, l = Ls.v, x = (l - 10) / 100, F = k * x, esc = (w - 120) / 22, y = h / 2 + 6;
      paredEstuco(g, w, h, '#f2eee6', '#e2dacb', 11); mesaMadera(g, w, y + 24, h); concreto(g, 0, 0, 26, h, '#9aa3ad', '#6f7881', 2); g.fillStyle = '#3a4048'; for (var q = 8; q < h; q += 22) { g.beginPath(); g.arc(13, q, 2.5, 0, 7); g.fill(); }
      metalH(g, 26, y + 20, w - 26, 5, '#b9c0c8');
      var bx = 26 + l * esc; resorteDib(g, 26, bx, y, 14, 12 - (l - 10) * 0.4, '#4f5b66');
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6; g.shadowOffsetY = 3; var bl = g.createLinearGradient(0, y - 20, 0, y + 20); bl.addColorStop(0, '#f0a020'); bl.addColorStop(1, '#a35f00'); g.fillStyle = bl; rr(g, bx, y - 20, 42, 40, 6); g.fill(); g.restore(); g.fillStyle = 'rgba(255,255,255,.3)'; rr(g, bx + 4, y - 16, 34, 8, 4); g.fill(); g.fillStyle = '#3a4048'; g.beginPath(); g.arc(bx + 21, y + 4, 3, 0, 7); g.fill();
      flecha(g, bx + 46, y, bx + 46 + Math.min(70, F / 1.4), y, COL.rojo, 3); rotulo(g, 'F = ' + f2(Math.round(F * 10) / 10) + ' N', bx + 56, y - 26, COL.rojo, 'left');
      var nPe = Math.round(F / 10), pfP = Math.max(3, Math.floor((w - bx - 80) / 20)); Pr.cierra(iconos(g, Pr, nPe, icoPesa, w - 16, 22, -20, 18, pfP, 'p', 1)); rotulo(g, '≈ ' + nPe + ' pesas de 1 kg (10 N c/u)', w - 12, h - 10, '#8a5300', 'right', 11);
      for (var cm = 0; cm <= 20; cm += 1) { var tx = 26 + cm * esc; g.fillStyle = '#56616d'; g.fillRect(tx, y + 26, 1, cm % 5 ? 4 : 9); if (cm % 5 === 0) { g.font = '11px system-ui'; g.textAlign = 'center'; g.fillText(cm + ' cm', tx, y + 46); } }
      g.fillStyle = 'rgba(0,110,120,.25)'; g.fillRect(26 + 10 * esc, y + 22, Math.max(0, l - 10) * esc, 4);
      G.limpia(); G.ejes(0.01, 10); var gg = G.ctx;
      if (x > 0.05) { gg.save(); gg.fillStyle = 'rgba(196,120,0,.28)'; gg.beginPath(); gg.moveTo(G.X(0.05), G.Y(0)); gg.lineTo(G.X(0.05), G.Y(40)); gg.lineTo(G.X(x), G.Y(F)); gg.lineTo(G.X(x), G.Y(0)); gg.closePath(); gg.fill(); gg.restore(); }
      G.curva(function (s) { return k * s; }, COL.teal, 2.2, 0, 0.105); G.punto(x, F, COL.rojo, 5); G.punto(0.05, 40, COL.tinta, 4);
      G.texto('F(x) = 800x', 0.072, 80, COL.teal); G.texto('x = estiramiento (m)', 0.002, 4, '#6b7480');
      var W15 = x > 0.05 ? 400 * (x * x - 0.0025) : 0;
      lec.innerHTML = 'Estiramiento x = ' + f2(Math.round(x * 1000) / 1000) + ' m · F = 800x = ' + f2(Math.round(F * 10) / 10) + ' N · trabajo desde 15 cm (área ámbar) = <b>' + f2(Math.round(W15 * 1000) / 1000) + ' J</b>';
    }
    Ls.inp.addEventListener('input', dib); L.redibuja = dib; G.redibuja = dib; dib();
  };

  W.bombear = function (c, D) {
    var Pb2 = Poblador(function () { dib(); }), L = lienzoPx(c, 330), ct = fila(c), a = U.deslizador(ct, 'nivel del agua =', 0, 4, 0.01, 4, function (v) { return f2(v) + ' m'; });
    var rel = reloj(ct, { get v() { return 4 - a.v; }, set v(t) { a.v = 4 - t; }, inp: a.inp }, 4, 0.5, '▶ Encender la bomba');
    a.inp.min = 0;
    var Wp = function (s) { return 2450 * Math.PI * (64 / 3 - (4 * s * s * s / 3 - s * s * s * s / 4)); };
    var lec = U.lectura(c), R = U.reto(c, '¿Cuánto trabajo hace falta para vaciar todo el tanque? (en kJ, 1 decimal)', true, function (v) { return Math.abs(v - Wp(0) / 1000) < 0.15; },
      '¡Correcto! W = ∫₀⁴ 9800·π(y/2)²·(4 − y) dy = 156 800π/3 ≈ 164,2 kJ.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -4.4, 4.4, -0.4, 5.6, 8), lv = a.v;
      paredEstuco(g, w, h, '#e9edf0', '#d3d9de', 6); concreto(g, 0, V.Y(-0.1), w, h - V.Y(-0.1), '#bdbab2', '#97938b', 5); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, V.Y(-0.1), w, 2);
      g.save(); g.beginPath(); g.moveTo(V.X(-2), V.Y(4)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(2), V.Y(4)); g.closePath(); var tk = g.createLinearGradient(V.X(-2), 0, V.X(2), 0); tk.addColorStop(0, 'rgba(90,100,110,.35)'); tk.addColorStop(0.3, 'rgba(255,255,255,.4)'); tk.addColorStop(1, 'rgba(60,70,80,.3)'); g.fillStyle = tk; g.fill(); g.restore();
      if (lv > 0.01) {
        var gr = g.createLinearGradient(0, V.Y(lv), 0, V.Y(0)); gr.addColorStop(0, '#5fb3e6'); gr.addColorStop(1, '#1f6fae'); g.fillStyle = gr;
        g.beginPath(); g.moveTo(V.X(-lv / 2), V.Y(lv)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(lv / 2), V.Y(lv)); g.closePath(); g.fill();
        var dy = 0.18, ys = Math.max(0, lv - dy); g.fillStyle = 'rgba(255,200,60,.85)'; g.beginPath(); g.moveTo(V.X(-lv / 2), V.Y(lv)); g.lineTo(V.X(lv / 2), V.Y(lv)); g.lineTo(V.X(ys / 2), V.Y(ys)); g.lineTo(V.X(-ys / 2), V.Y(ys)); g.closePath(); g.fill();
        flecha(g, V.X(lv / 2) + 26, V.Y(lv), V.X(lv / 2) + 26, V.Y(4) - 2, COL.ambar, 2.2); rotulo(g, 'esta capa sube ' + f2(Math.round((4 - lv) * 100) / 100) + ' m', V.X(lv / 2) + 34, V.Y((lv + 4) / 2), '#8a5300', 'left', 12);
      }
      g.strokeStyle = '#56616d'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-2), V.Y(4)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(2), V.Y(4)); g.stroke();
      g.beginPath(); g.ellipse(V.X(0), V.Y(4), 2 * V.s, 2 * V.s * 0.12, 0, 0, 7); g.stroke();
      g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 6; g.shadowOffsetY = 3; var bm = g.createLinearGradient(0, V.Y(5.4), 0, V.Y(4.6)); bm.addColorStop(0, '#f07a2a'); bm.addColorStop(1, '#a8400a'); g.fillStyle = bm; rr(g, V.X(-3.9), V.Y(5.4), 2.2 * V.s, 0.8 * V.s, 6); g.fill(); g.restore(); g.fillStyle = 'rgba(255,255,255,.25)'; rr(g, V.X(-3.8), V.Y(5.35), 2 * V.s, 0.15 * V.s, 3); g.fill(); g.fillStyle = '#fff'; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('BOMBA', V.X(-2.8), V.Y(5.0) + 4);
      g.strokeStyle = '#3a3f46'; g.lineWidth = 4; g.beginPath(); g.moveTo(V.X(-1.7), V.Y(5.0)); g.lineTo(V.X(0), V.Y(5.0)); g.lineTo(V.X(0), V.Y(Math.max(lv, 0.15))); g.stroke();
      if (lv < 3.99) { g.strokeStyle = 'rgba(70,160,225,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-3.9), V.Y(5.0)); g.quadraticCurveTo(V.X(-4.3), V.Y(4.8), V.X(-4.25), V.Y(0)); g.stroke(); }
      rotulo(g, 'radio 2 m', V.X(2) + 8, V.Y(4) - 12, '#56616d', 'left', 12); rotulo(g, '4 m', V.X(2.4), V.Y(2), '#56616d', 'left', 12);
      var vS = Math.PI * (64 - lv * lv * lv) / 12, nb = Math.floor(vS), vivosB = [], porF = Math.max(4, Math.min(9, Math.floor((w * 0.4) / 24)));
      for (var q = 0; q < Math.ceil(vS - 1e-9) && q < 18; q++) { var al = Pb2.a('b' + q); vivosB.push('b' + q); var lleno = q < nb ? 1 : (vS - nb);
        g.globalAlpha = al; balde(g, w - 22 - (q % porF) * 24, V.Y(-0.1) - 12 - Math.floor(q / porF) * 24, 0.95, lleno); g.globalAlpha = 1; }
      Pb2.cierra(vivosB); rotulo(g, 'agua sacada: ' + f2(Math.round(vS * 100) / 100) + ' m³ (cada balde: 1 m³)', w - 12, V.Y(-0.1) + 14, '#1f5a8a', 'right', 11);
      panel(g, ['trabajo hecho: ' + f2(Math.round((Wp(lv)) / 100) / 10) + ' kJ', 'de ' + f2(Math.round(Wp(0) / 100) / 10) + ' kJ en total'], 10, 10);
      lec.innerHTML = 'Capa a altura y: radio y/2, volumen π(y/2)²dy, sube 4 − y ⇒ dW = 9800·π(y/2)²(4 − y) dy · W(hasta nivel ' + f2(lv) + ') = ∫<sub>' + f2(lv) + '</sub><sup>4</sup> … = <b>' + miles(Wp(lv)) + ' J</b>';
    }
    a.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  W.represa = function (c, D) {
    var Pd = Poblador(function () { dib(); }), L = lienzoPx(c, 330), ct = fila(c), p = U.deslizador(ct, 'profundidad de la franja h =', 0, 8, 0.05, 3, function (v) { return f2(v) + ' m'; });
    var Fh = function (s) { return 9800 * (10 * s * s - 5 * s * s * s / 12); };
    var lec = U.lectura(c), R = U.reto(c, '¿Cuál es la fuerza total sobre la compuerta? (en millones de N, 2 decimales)', true, function (v) { return Math.abs(v - Fh(8) / 1e6) < 0.006; },
      '¡Eso es! F = 9800∫₀⁸ h(20 − 5h/4) dh ≈ 4,18 × 10⁶ N.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -15, 15, -9.6, 2.2, 8), s = p.v, wd = function (z) { return 20 - 10 / 8 * z; };
      cielo(g, w, h); nube(g, w * 0.2, 16, 0.6); g.fillStyle = 'rgba(110,145,120,.6)'; g.beginPath(); g.moveTo(0, V.Y(0.4)); for (var hx = 0; hx <= w; hx += 10) g.lineTo(hx, V.Y(0.4) - 10 - 8 * Math.sin(hx / 45)); g.lineTo(w, V.Y(0.4)); g.fill();
      var agua = g.createLinearGradient(0, V.Y(0), 0, V.Y(-8)); agua.addColorStop(0, 'rgba(95,179,230,.55)'); agua.addColorStop(1, 'rgba(25,90,150,.75)');
      concreto(g, 0, V.Y(0.4), w, h - V.Y(0.4), '#c2c0b8', '#8d8a82', 7); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; for (var jy = V.Y(0.4) + 24; jy < h; jy += 24) { g.beginPath(); g.moveTo(0, jy); g.lineTo(w, jy); g.stroke(); } for (var jx = 0; jx < w; jx += 60) { g.beginPath(); g.moveTo(jx, V.Y(0.4)); g.lineTo(jx, h); g.stroke(); } metalH(g, 0, V.Y(0.4) - 4, w, 5, '#9aa3ad');
      g.save(); g.beginPath(); g.moveTo(V.X(-10), V.Y(0)); g.lineTo(V.X(10), V.Y(0)); g.lineTo(V.X(5), V.Y(-8)); g.lineTo(V.X(-5), V.Y(-8)); g.closePath(); g.clip(); var cg = g.createLinearGradient(0, V.Y(0), 0, V.Y(-8)); cg.addColorStop(0, '#7a8692'); cg.addColorStop(1, '#4b5560'); g.fillStyle = cg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.12)'; for (var rx = V.X(-10); rx < V.X(10); rx += 12) { g.beginPath(); g.moveTo(rx, V.Y(0)); g.lineTo(rx, V.Y(-8)); g.stroke(); } g.fillStyle = agua; g.fillRect(0, 0, w, h); g.restore();
      g.beginPath(); g.moveTo(V.X(-10), V.Y(0)); g.lineTo(V.X(10), V.Y(0)); g.lineTo(V.X(5), V.Y(-8)); g.lineTo(V.X(-5), V.Y(-8)); g.closePath(); g.strokeStyle = '#2f3740'; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#9aa3ad'; g.lineWidth = 2; g.stroke();
      var y1 = -s, hw = wd(s) / 2, dz = 0.35; g.fillStyle = 'rgba(255,200,60,.8)'; g.fillRect(V.X(-hw), V.Y(y1 + dz / 2), hw * 2 * V.s, dz * V.s);
      for (var z = 0.5; z <= 8; z += 1) { var len = z * 4; flecha(g, V.X(-wd(z) / 2) - 8 - len, V.Y(-z), V.X(-wd(z) / 2) - 6, V.Y(-z), 'rgba(25,90,150,.7)', 1.8, 7); }
      rotulo(g, 'la presión crece con la profundidad', V.X(-13.5), V.Y(-8.9), '#1f5a8a', 'left', 12);
      rotulo(g, '20 m', V.X(0), V.Y(0) - 12, '#4f5b66'); rotulo(g, '10 m', V.X(0), V.Y(-8) + 14, '#4f5b66'); rotulo(g, 'ancho ' + f2(Math.round(wd(s) * 100) / 100) + ' m', V.X(hw) + 8, V.Y(y1), '#8a5300', 'left');
      var nC = Math.round(Fh(s) / 9.8 / 15000), abajo = h - 24 - V.Y(-8.6) > 70;
      if (abajo) { var pfA = Math.floor((w - 24) / 30); Pd.cierra(iconos(g, Pd, nC, icoCamion, 26, V.Y(-8.6) + 24, 30, 18, pfA, 'c', 0.95)); }
      else { var kC = Math.min(1, w / 700), pfC = Math.max(3, Math.floor((w - 14 - V.X(8.4)) / (28 * kC))); Pd.cierra(iconos(g, Pd, nC, icoCamion, w - 18 * kC, V.Y(-8.6) - 12, -28 * kC, -17 * kC, pfC, 'c', kC)); }
      rotulo(g, 'la fuerza equivale al peso de ' + nC + ' camiones de 15 t', w - 12, h - 10, '#3a3f46', 'right', 11);
      panel(g, ['fuerza hasta h = ' + f2(s) + ' m:', f2(Math.round(Fh(s) / 1e4) / 100) + ' millones de N'], w - 200, 10);
      lec.innerHTML = 'Franja a profundidad h: presión 9800h, área (20 − 5h/4)dh ⇒ <b>dF = 9800·h·(20 − 5h/4) dh</b>';
    }
    p.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  W.cadena = function (c, D) {
    var L = lienzoPx(c, 330), ct = fila(c), s = U.deslizador(ct, 'metros ya subidos =', 0, 10, 0.05, 3, function (v) { return f2(v) + ' m'; });
    reloj(ct, s, 10, 1.5, '▶ Girar la manivela');
    var Wc = function (x) { return 80 * x - 4 * x * x; };
    var lec = U.lectura(c), R = U.reto(c, '¿Cuánto trabajo cuesta subir toda la cadena? (J)', true, function (v) { return Math.abs(v - 400) < 0.5; },
      '¡Bien! Al haber subido x metros cuelgan 10 − x, que pesan 8(10 − x): W = ∫₀¹⁰ 8(10 − x) dx = 400 J.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -8, 10, -1, 13.5, 6), x = s.v, cuelga = 10 - x;
      cielo(g, w, h); nube(g, w * 0.72, 42, 1); suelo(g, w, V.Y(0), h);
      edificioReal(g, V.X(-6), V.Y(0), V.X(0) - V.X(-6), V.Y(0) - V.Y(12), 15, ['#b9c2cb', '#8a949e']);
      var cx = V.X(-0.6), cy = V.Y(12) - 14; g.strokeStyle = '#4a3a2a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.stroke();
      g.save(); g.translate(cx, cy); g.rotate(x * 1.3); g.beginPath(); g.moveTo(0, 0); g.lineTo(14, 0); g.lineTo(14, -8); g.stroke(); g.restore();
      var bx = V.X(0.15); g.strokeStyle = '#4a4d52'; g.lineWidth = 2.4;
      for (var q = 0; q < cuelga; q += 0.32) { var yy = V.Y(12 - q), ver = Math.round(q / 0.32) % 2; g.beginPath(); if (ver) g.ellipse(bx, yy + 0.16 * V.s, 1.6, 0.17 * V.s, 0, 0, 7); else g.ellipse(bx, yy + 0.16 * V.s, 3.4, 0.2 * V.s, 0, 0, 7); g.stroke(); }
      g.fillStyle = '#6d6f73'; g.beginPath(); g.arc(cx, cy, 5 + x * 0.5, 0, 7); g.fill();
      g.setLineDash([4, 4]); g.strokeStyle = COL.gris; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + 16, V.Y(12)); g.lineTo(bx + 16, V.Y(12 - cuelga)); g.stroke(); g.setLineDash([]);
      if (cuelga > 0.3) rotulo(g, 'cuelgan ' + f2(Math.round(cuelga * 100) / 100) + ' m → pesan ' + f2(Math.round(8 * cuelga * 10) / 10) + ' N', bx + 24, V.Y(12 - cuelga / 2), '#3a3f46', 'left', 12);
      panel(g, ['trabajo hecho: ' + f2(Math.round(Wc(x) * 10) / 10) + ' J', 'de 400 J en total'], w - 170, 10);
      lec.innerHTML = 'Peso que cuelga después de subir x metros: 8(10 − x) N ⇒ <b>W(x) = ∫₀ˣ 8(10 − u) du = 80x − 4x² = ' + f2(Math.round(Wc(x) * 10) / 10) + ' J</b>';
    }
    s.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  function pez(g, x, y, k, col, dir) {
    g.save(); g.translate(x, y); g.scale(dir * k, k); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 12, 6.5, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-10, 0); g.lineTo(-19, -7); g.lineTo(-19, 7); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-2, -5); g.lineTo(3, -10); g.lineTo(6, -5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(1, -2, 7, 2, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(6.5, -1.5, 2.3, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(7, -1.5, 1.2, 0, 7); g.fill(); g.restore();
  }
  W.ventana = function (c, D) {
    var Pv = Poblador(function () { dib(); }), L = lienzoPx(c, 330), ct = fila(c), d = U.deslizador(ct, 'profundidad del centro =', 1, 6, 0.05, 3, function (v) { return f2(v) + ' m'; }), r = U.deslizador(ct, 'radio =', 0.3, 1, 0.01, 1, function (v) { return f2(v) + ' m'; });
    var lec = U.lectura(c), R = U.reto(c, 'Con radio 1 m y centro a 3 m de profundidad, ¿cuál es la fuerza sobre la ventana? (kN, 1 decimal)', true, function (v) { return Math.abs(v - 29.4 * Math.PI) < 0.1; },
      '¡Sí! F = 9800∫ de −1 a 1 de (3 − y)·2√(1 − y²) dy = 9800·3·π ≈ 92,4 kN: es la presión en el centro por el área.'); R.el.__fin = c.__fin;
    var rnd = azar(3), peces = []; for (var i = 0; i < 6; i++) peces.push([rnd(), rnd(), ['#f39c12', '#e74c3c', '#f1c40f', '#9b59b6', '#16a085', '#e67e22'][i], rnd() < 0.5 ? 1 : -1]);
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -6, 6, -7.6, 0.8, 6), dd = d.v, rr0 = r.v, F = 9800 * dd * Math.PI * rr0 * rr0;
      cielo(g, w, h, '#dff1fa', '#eef8fc');
      var agua = g.createLinearGradient(0, V.Y(0), 0, V.Y(-7.6)); agua.addColorStop(0, '#79c6ea'); agua.addColorStop(1, '#14507e'); g.fillStyle = agua; g.fillRect(0, V.Y(0), w, h);
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); for (var x = 0; x <= w; x += 8) g.lineTo(x, V.Y(0) + 2 * Math.sin(x / 14)); g.stroke();
      peces.forEach(function (p) { pez(g, w * (0.08 + p[0] * 0.84), V.Y(-0.8 - p[1] * 6.2), 0.9, p[2], p[3]); });
      g.fillStyle = 'rgba(40,90,60,.75)'; for (var k = 0; k < 7; k++) { var px = w * (0.05 + k * 0.15); g.beginPath(); g.moveTo(px, h); g.quadraticCurveTo(px - 8, h - 30, px + 4, h - 50 - (k % 3) * 12); g.quadraticCurveTo(px + 6, h - 28, px + 6, h); g.fill(); }
      var cx = V.X(0), cy = V.Y(-dd), R0 = rr0 * V.s;
      g.fillStyle = 'rgba(230,245,255,.35)'; g.strokeStyle = '#2f3e4c'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R0 * 0.72, -2.4, -1.6); g.stroke();
      for (var yy = -rr0 * 0.9; yy <= rr0 * 0.9; yy += rr0 * 0.3) { var prof = dd - yy, len = prof * 9; flecha(g, cx + R0 + 10 + len, V.Y(-dd + yy), cx + R0 + 8, V.Y(-dd + yy), '#ffd166', 2, 7); }
      g.setLineDash([4, 4]); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - R0 - 30, V.Y(0)); g.lineTo(cx - R0 - 30, cy); g.stroke(); g.setLineDash([]);
      rotulo(g, f2(dd) + ' m', cx - R0 - 34, (V.Y(0) + cy) / 2, '#fff', 'right', 13, 'rgba(10,50,80,.5)');
      var nV = Math.round(F / 9.8 / 600), pfV = Math.max(4, Math.floor(w * 0.32 / 30)); Pv.cierra(iconos(g, Pv, nV, icoVaca, w - 22, h - 16, -30, -20, pfV, 'v', 1));
      rotulo(g, 'empuja como ' + nV + (nV === 1 ? ' vaca' : ' vacas') + ' de 600 kg encima', w - 12, h - 34 - Math.floor((nV - 1) / pfV) * 20, '#fff', 'right', 11, 'rgba(10,50,80,.55)');
      panel(g, ['F ≈ ' + f2(Math.round(F / 100) / 10) + ' kN', '= 9800 · ' + f2(dd) + ' · π · ' + f2(rr0) + '²'], 10, 10);
      lec.innerHTML = 'Franja a altura y respecto del centro: profundidad ' + f2(dd) + ' − y, ancho 2√(r² − y²) ⇒ <b>dF = 9800(' + f2(dd) + ' − y)·2√(r² − y²) dy</b>';
    }
    [d, r].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Álgebra lineal · Fibonacci con conejos
     ===================================================================== */
  function conejo(g, x, y, s, bebe, dir, col) {
    sombraPiso(g, x - 4 * s, y + 0.5 * s, 14 * s, 3 * s, 0.3);
    g.save(); g.translate(x, y); g.scale(dir * s * (bebe ? 0.62 : 1), s * (bebe ? 0.62 : 1));
    var c0 = col || [196, 170, 140], cl = function (k) { return 'rgb(' + Math.round(c0[0] * k) + ',' + Math.round(c0[1] * k) + ',' + Math.round(c0[2] * k) + ')'; };
    var gb = g.createRadialGradient(-2, -12, 2, 0, -8, 13); gb.addColorStop(0, cl(1.15)); gb.addColorStop(1, cl(0.78));
    g.fillStyle = gb; g.beginPath(); g.ellipse(-1, -8, 11, 8, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-11, -9, 3.4, 0, 7); g.fill();
    g.fillStyle = cl(0.85); g.beginPath(); g.ellipse(2, -1.5, 5, 2.2, 0, 0, 7); g.fill();
    var gh = g.createRadialGradient(9, -17, 1, 10, -14, 8); gh.addColorStop(0, cl(1.18)); gh.addColorStop(1, cl(0.82));
    g.fillStyle = gh; g.beginPath(); g.ellipse(10, -14, 6.5, 5.6, 0, 0, 7); g.fill();
    [[6.5, -0.35, 0.9], [9.2, 0.05, 1]].forEach(function (o) { g.save(); g.translate(o[0], -18); g.rotate(o[1] - 0.25); g.fillStyle = cl(0.95 * o[2]); g.beginPath(); g.ellipse(0, -7, 2.4, 7.5, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(240,180,180,' + (0.8 * o[2]) + ')'; g.beginPath(); g.ellipse(0.2, -7, 1.1, 5.6, 0, 0, 7); g.fill(); g.restore(); });
    g.fillStyle = '#1a1210'; g.beginPath(); g.arc(12.2, -15.2, 1.3, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(12.6, -15.6, 0.45, 0, 7); g.fill();
    g.fillStyle = '#e48a9a'; g.beginPath(); g.arc(16.2, -13.4, 1, 0, 7); g.fill();
    g.restore();
  }
  W.conejos = function (c, D) {
    var L = lienzoPx(c, 290), ct = fila(c), m = U.deslizador(ct, '📅 mes n =', 1, 14, 1, 5, function (v) { return String(Math.round(v)); });
    var lec = U.lectura(c), R = U.reto(c, '¿A qué número se acerca x<sub>n+1</sub>/x<sub>n</sub>? (3 decimales)', true, function (v) { return Math.abs(v - 1.618) < 0.0015; },
      '¡El número áureo! φ = (1 + √5)/2 ≈ 1,618, el valor propio dominante de la matriz.'); R.el.__fin = c.__fin;
    var r = azar(21), sit = []; for (var f = 0; f < 6; f++) for (var q = 0; q < 14; q++) sit.push([0.04 + (q + 0.2 + r() * 0.6) / 14 * 0.92, 0.5 + (f + 0.25 + r() * 0.5) / 6 * 0.46, r() < 0.5 ? 1 : -1, r()]);
    for (var i = sit.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = sit[i]; sit[i] = sit[j]; sit[j] = t; }
    var cols = [[196, 170, 140], [230, 226, 220], [150, 120, 95], [215, 190, 160]];
    function fib(n) { var a = 0, b = 1; for (var k = 0; k < n; k++) { var t = a + b; a = b; b = t; } return a; }
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = Math.round(m.v), tot = fib(n), adultos = fib(n - 1), crias = tot - adultos;
      pradera(g, w, h, 4);
      var un = tot > 40 ? Math.ceil(tot / 40) : 1, na = Math.round(adultos / un), nb = Math.round(crias / un), lista = [];
      for (var q = 0; q < na; q++) lista.push([sit[q % sit.length], false, q]); for (q = 0; q < nb; q++) lista.push([sit[(na + q) % sit.length], true, na + q]);
      lista.sort(function (a, b) { return a[0][1] - b[0][1]; });
      var k0 = Math.min(1.25, w / 600 + 0.2);
      lista.forEach(function (it) { var S = it[0], e = (0.95 + (S[1] - 0.5) * 1.4) * k0 * (un > 1 ? 0.85 : 1); conejo(g, S[0] * w - 9 * e, S[1] * h, e, it[1], S[2], cols[it[2] % 4]); conejo(g, S[0] * w + 9 * e, S[1] * h + 3, e, it[1], -S[2], cols[(it[2] + 1) % 4]); });
      panel(g, ['Mes ' + n + ' · ' + tot + (tot === 1 ? ' pareja' : ' parejas'), adultos + ' adultas (procrean) · ' + crias + ' recién nacidas' + (un > 1 ? ' · cada 🐇 = ' + un : '')], 10, 10);
      var ra = fib(n + 1) / tot;
      lec.innerHTML = '(x<sub>n+1</sub>, x<sub>n</sub>) = A·(x<sub>n</sub>, x<sub>n−1</sub>) con A = <span class="esc-mat"><span>1</span><span>1</span><span>1</span><span>0</span></span> · x<sub>' + n + '</sub> = <b>' + tot + '</b> · x<sub>' + (n + 1) + '</sub>/x<sub>' + n + '</sub> = <b>' + U.f4(ra) + '</b> &nbsp; (φ = 1,6180…)';
    }
    m.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Cadenas de Markov · personas que cambian de celular
     ===================================================================== */
  function personita(g, x, y, k, col, cel) {
    sombraPiso(g, x - 2 * k, y + 0.5, 6 * k, 1.6 * k, 0.25);
    var gr = g.createLinearGradient(x - 4 * k, 0, x + 4 * k, 0); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 4.2 * k, y); g.quadraticCurveTo(x - 4.6 * k, y - 10 * k, x, y - 10.5 * k); g.quadraticCurveTo(x + 4.6 * k, y - 10 * k, x + 4.2 * k, y); g.closePath(); g.fill();
    var gc = g.createRadialGradient(x - 1 * k, y - 15 * k, 0.5, x, y - 14 * k, 4 * k); gc.addColorStop(0, '#f6d7bd'); gc.addColorStop(1, '#c99a78'); g.fillStyle = gc; g.beginPath(); g.arc(x, y - 14 * k, 3.4 * k, 0, 7); g.fill();
    g.fillStyle = cel; rr(g, x + 2.2 * k, y - 9.5 * k, 2.6 * k, 4.4 * k, 0.8 * k); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 2.6 * k, y - 9 * k, 1.8 * k, 3 * k);
  }
  W.celulares = function (c, D) {
    var P = [[0.7, 0.2], [0.3, 0.8]], L = lienzoPx(c, 300), ct = fila(c);
    var k = U.deslizador(ct, '📅 mes k =', 0, 12, 1, 0, function (v) { return String(Math.round(v)); });
    var pS = U.deslizador(ct, 'siguen con Samsung', 0.05, 0.95, 0.01, 0.7, function (v) { return Math.round(v * 100) + ' %'; }), pI = U.deslizador(ct, 'siguen con iPhone', 0.05, 0.95, 0.01, 0.8, function (v) { return Math.round(v * 100) + ' %'; });
    var ct2 = fila(c), jug = reloj(ct2, k, 12, 1.2, '▶ Ver pasar los meses');
    var lec = U.lectura(c), R = U.reto(c, 'Con las probabilidades del ejemplo, ¿cuántas personas usarán Samsung a largo plazo?', true, function (v) { return Math.abs(v - 80) < 0.5; },
      '¡Así es! El vector de estado estacionario es (0,4; 0,6): 80 con Samsung y 120 con iPhone, sin importar con cuántas se empezó.'); R.el.__fin = c.__fin;
    var orden = []; var rr2 = azar(9); for (var i = 0; i < 200; i++) orden.push(rr2());
    function estado(n) { var a = pS.v, b = pI.v, x = [120, 80]; for (var q = 0; q < n; q++) x = [a * x[0] + (1 - b) * x[1], (1 - a) * x[0] + b * x[1]]; return x; }
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = Math.round(k.v), x = estado(n), nS = Math.round(x[0]), a = pS.v, b = pI.v, est = (1 - b) / (2 - a - b);
      var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#dfe9fb'); gr.addColorStop(0.5, '#f4f5f7'); gr.addColorStop(1, '#ececef'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, h - 40, w, 40);
      rotulo(g, 'Samsung · ' + nS, w * 0.25, 22, '#1d4fa3', 'center', 15); rotulo(g, 'iPhone · ' + (200 - nS), w * 0.75, 22, '#2d3036', 'center', 15);
      var colS = ['#3f7be0', '#1d4fa3'], colI = ['#8a8f99', '#3d4048'], cols = 20, kk = Math.min(1.5, w / 500);
      for (var q = 0; q < 200; q++) {
        var enS = q < nS, idx = enS ? q : q - nS, colsLado = 10, fx = idx % colsLado, fy = Math.floor(idx / colsLado);
        var x0 = (enS ? w * 0.04 : w * 0.54) + (fx + 0.5) * (w * 0.42 / colsLado) + (fy % 2) * 3, y0 = 56 + fy * ((h - 70) / (enS ? Math.max(8, Math.ceil(nS / colsLado)) : Math.max(8, Math.ceil((200 - nS) / colsLado)))) * 0.92 + 14;
        personita(g, x0, y0, kk, enS ? colS : colI, enS ? '#1b3e80' : '#111');
      }
      flecha(g, w * 0.46, h * 0.42, w * 0.54, h * 0.42, '#c47800', 3); rotulo(g, Math.round((1 - a) * 100) + ' % se pasan', w * 0.5, h * 0.42 - 16, '#8a5300', 'center', 12);
      flecha(g, w * 0.54, h * 0.6, w * 0.46, h * 0.6, '#c47800', 3); rotulo(g, Math.round((1 - b) * 100) + ' % se pasan', w * 0.5, h * 0.6 + 16, '#8a5300', 'center', 12);
      lec.innerHTML = 'P = <span class="esc-mat"><span>' + f2(a) + '</span><span>' + f2(Math.round((1 - b) * 100) / 100) + '</span><span>' + f2(Math.round((1 - a) * 100) / 100) + '</span><span>' + f2(b) + '</span></span> · x<sub>' + n + '</sub> = P<sup>' + n + '</sup>x<sub>0</sub> = (' + f2(Math.round(x[0] * 10) / 10) + '; ' + f2(Math.round(x[1] * 10) / 10) + ')<br>'
        + 'estado estacionario: <b>' + f2(Math.round(est * 2000) / 10) + ' con Samsung y ' + f2(Math.round((1 - est) * 2000) / 10) + ' con iPhone</b> (vector propio de λ = 1)';
    }
    [k, pS, pI].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Cadenas de Markov · el clima (2 o 3 estados)
     ===================================================================== */
  function icoClima(g, x, y, s, e) {
    g.save(); g.translate(x, y); g.scale(s, s);
    if (e === 0 || e === 3) { var gs = g.createRadialGradient(-2, -2, 1, 0, 0, 10); gs.addColorStop(0, '#fff3b0'); gs.addColorStop(1, '#f5b82e'); g.strokeStyle = '#f5b82e'; g.lineWidth = 2; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); g.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); g.stroke(); } g.fillStyle = gs; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); }
    if (e === 1 || e === 2 || e === 3) { var off = e === 3 ? 6 : 0; var gn = g.createLinearGradient(0, -10, 0, 8); gn.addColorStop(0, e === 2 ? '#c5ccd4' : '#ffffff'); gn.addColorStop(1, e === 2 ? '#8893a0' : '#cfd8e2'); g.fillStyle = gn; g.beginPath(); g.arc(-7 + off, 2, 7, 0, 7); g.arc(1 + off, -3, 9, 0, 7); g.arc(9 + off, 2, 6.5, 0, 7); g.rect(-7 + off, 2, 16, 6.5); g.fill(); }
    if (e === 2) { g.strokeStyle = '#3d8fd1'; g.lineWidth = 2; g.lineCap = 'round'; [[-6, 12], [0, 14], [6, 12]].forEach(function (p) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - 2, p[1] + 5); g.stroke(); }); }
    g.restore();
  }
  W.clima = function (c, D) {
    var Pm = D.P, n = Pm.length, nom = D.nombres, ico = D.iconos, L = lienzoPx(c, 230), ct = fila(c);
    var k = U.deslizador(ct, '📅 días después k =', 0, 15, 1, 0, function (v) { return String(Math.round(v)); });
    var cal = [], sem = 1;
    boton(ct, '🎲 Simular un mes', function () { sem++; simula(); dib(); });
    var lec = U.lectura(c), R = U.reto(c, D.reto, true, function (v) { return Math.abs(v - D.resp) < (D.tol || 0.002); }, D.bien); R.el.__fin = c.__fin;
    function paso(x) { var y = []; for (var i = 0; i < n; i++) { y[i] = 0; for (var j = 0; j < n; j++) y[i] += Pm[i][j] * x[j]; } return y; }
    function simula() { var r = azar(sem * 7919), e = 0; cal = [e]; for (var d = 1; d < 30; d++) { var u = r(), acc = 0; for (var i = 0; i < n; i++) { acc += Pm[i][e]; if (u < acc) { e = i; break; } } cal.push(e); } }
    simula();
    function dib() {
      var g = L.g, w = L.w, h = L.h, kk = Math.round(k.v), x = [1].concat(new Array(n - 1).fill(0)); for (var q = 0; q < kk; q++) x = paso(x);
      var est = x.slice(); for (q = 0; q < 300; q++) est = paso(est);
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a9d4ef'); gr.addColorStop(1, '#eef6fb'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.font = '600 13px system-ui'; g.fillStyle = COL.tinta; g.textAlign = 'left'; g.fillText('Un mes simulado (empieza ' + nom[0].toLowerCase() + '):', 12, 20);
      var cw = (w - 24) / 15; for (var d = 0; d < 30; d++) { var cx = 12 + (d % 15) * cw, cy = 30 + Math.floor(d / 15) * 46;
        g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, cx + 2, cy, cw - 4, 42, 7); g.fill(); g.fillStyle = '#6b7480'; g.font = '10px system-ui'; g.textAlign = 'left'; g.fillText(d + 1, cx + 6, cy + 11); icoClima(g, cx + cw / 2, cy + 26, Math.min(0.85, cw / 34), ico[cal[d]]); }
      var cuenta = new Array(n).fill(0); cal.forEach(function (e) { cuenta[e]++; });
      var by = 136, bw = (w - 40) / n;
      for (var i = 0; i < n; i++) { var bx = 20 + i * bw, alto = 70;
        g.fillStyle = 'rgba(255,255,255,.6)'; rr(g, bx + 6, by, bw - 12, alto + 14, 8); g.fill();
        icoClima(g, bx + 26, by + 24, 0.9, ico[i]); g.fillStyle = COL.tinta; g.font = '600 13px system-ui'; g.textAlign = 'left'; g.fillText(nom[i], bx + 48, by + 20);
        g.fillStyle = '#d6dde4'; rr(g, bx + 48, by + 30, bw - 66, 10, 5); g.fill(); g.fillStyle = COL.teal; rr(g, bx + 48, by + 30, Math.max(2, (bw - 66) * x[i]), 10, 5); g.fill();
        g.fillStyle = '#c47800'; g.fillRect(bx + 48 + (bw - 66) * est[i] - 1, by + 26, 2.5, 18);
        g.fillStyle = '#4d5762'; g.font = '12px system-ui'; g.fillText('P(día ' + kk + ') = ' + f2(Math.round(x[i] * 1000) / 1000) + ' · en el mes: ' + cuenta[i] + '/30', bx + 48, by + 60); }
      lec.innerHTML = 'x<sub>' + kk + '</sub> = P<sup>' + kk + '</sup>x<sub>0</sub> = (' + x.map(function (v) { return f2(Math.round(v * 1000) / 1000); }).join('; ') + ') · <span style="color:#8a5300">la marca ámbar es el estado estacionario (' + est.map(function (v) { return f2(Math.round(v * 1000) / 1000); }).join('; ') + ')</span>';
    }
    k.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Análisis numérico · PageRank
     ===================================================================== */
  W.pagerank = function (c, D) {
    var N = 5, nom = ['A', 'B', 'C', 'D', 'E'], lk = { 0: [1, 2], 1: [2], 2: [0], 3: [0, 2, 4], 4: [2] }, pos = [[0.2, 0.3], [0.5, 0.15], [0.48, 0.62], [0.82, 0.35], [0.8, 0.8]];
    var L = lienzoPx(c, 320), ct = fila(c), al = U.deslizador(ct, 'α (sigue un enlace)', 0, 1, 0.01, 0.85, function (v) { return f2(v); });
    var x = [0.2, 0.2, 0.2, 0.2, 0.2], it = 0, nav = 0, navT = 0, anim = null;
    boton(ct, '➜ Un paso del método de la potencia', function () { x = paso(x); it++; dib(); });
    boton(ct, '↺ Empezar', function () { x = [0.2, 0.2, 0.2, 0.2, 0.2]; it = 0; dib(); });
    var bn = boton(ct, '🧭 Soltar un navegante', function () { if (anim) { cancelAnimationFrame(anim); anim = null; bn.textContent = '🧭 Soltar un navegante'; return; } bn.textContent = '⏸ Detener'; var t0 = performance.now(), rr0 = azar(Date.now() % 1000 + 1), vis = [0, 0, 0, 0, 0], tot = 0, sig = 0, ini = 0;
      (function f(t) { var u = Math.min(1, (t - t0) / 380); if (u >= 1) { ini = sig; vis[ini]++; tot++; sig = rr0() < al.v ? lk[ini][Math.floor(rr0() * lk[ini].length)] : Math.floor(rr0() * N); t0 = t; u = 0; c.__vis = vis.map(function (v) { return v / tot; }); }
        nav = [ini, sig, u]; dib(); anim = requestAnimationFrame(f); })(t0); });
    var lec = U.lectura(c), R = U.reto(c, 'Con α = 0,85, ¿qué porcentaje del PageRank se lleva la página C? (1 decimal)', true, function (v) { return Math.abs(v - 38.3) < 0.15; },
      '¡Exacto! C ≈ 38,3 %: recibe enlaces de A, B, D y E. Fíjate en que A también queda alta: su único voto viene de C, pero vale mucho.'); R.el.__fin = c.__fin;
    function paso(v) { var a = al.v, y = new Array(N).fill((1 - a) / N); for (var j = 0; j < N; j++) lk[j].forEach(function (i) { y[i] += a * v[j] / lk[j].length; }); return y; }
    function dib() {
      var g = L.g, w = L.w, h = L.h, P = pos.map(function (p) { return [p[0] * w, 24 + p[1] * (h - 70)]; });
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(1, '#e8eef5'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var j = 0; j < N; j++) lk[j].forEach(function (i) { var a = P[j], b = P[i], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), ri = 20 + 70 * x[i], rj = 20 + 70 * x[j];
        var bend = lk[i].indexOf(j) >= 0 ? 0.18 : 0, mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
        g.strokeStyle = 'rgba(80,95,110,.55)'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(a[0] + Math.cos(ang) * rj * 0.5, a[1] + Math.sin(ang) * rj * 0.5); g.quadraticCurveTo(mx, my, b[0] - Math.cos(ang) * (ri * 0.5 + 18), b[1] - Math.sin(ang) * (ri * 0.5 + 18)); g.stroke();
        var e = [b[0] - Math.cos(ang) * (ri * 0.5 + 18), b[1] - Math.sin(ang) * (ri * 0.5 + 18)], a2 = Math.atan2(e[1] - my, e[0] - mx); flecha(g, e[0] - Math.cos(a2) * 2, e[1] - Math.sin(a2) * 2, e[0] + Math.cos(a2) * 6, e[1] + Math.sin(a2) * 6, 'rgba(80,95,110,.8)', 1.8, 9); });
      for (var i = 0; i < N; i++) { var s = 26 + 80 * x[i], px = P[i][0], py = P[i][1];
        g.save(); g.shadowColor = 'rgba(0,0,0,.22)'; g.shadowBlur = 10; g.shadowOffsetY = 4; g.fillStyle = '#fff'; rr(g, px - s / 2, py - s * 0.4, s, s * 0.8, 6); g.fill(); g.restore();
        g.fillStyle = ['#e74c3c', '#f1c40f', '#2ecc71'][0]; g.fillStyle = '#dfe5ec'; g.fillRect(px - s / 2, py - s * 0.4, s, 9); [['#ff6159', 0], ['#ffbd2e', 1], ['#28c941', 2]].forEach(function (b) { g.fillStyle = b[0]; g.beginPath(); g.arc(px - s / 2 + 6 + b[1] * 7, py - s * 0.4 + 4.5, 2.2, 0, 7); g.fill(); });
        g.fillStyle = 'hsl(' + (200 - 160 * Math.min(1, x[i] / 0.4)) + ',70%,50%)'; g.fillRect(px - s / 2 + 5, py - s * 0.4 + 14, s * 0.6, 4); g.fillStyle = '#cfd6de'; for (var l = 0; l < 3; l++) g.fillRect(px - s / 2 + 5, py - s * 0.4 + 22 + l * 6, s - 10 - l * 6, 2.5);
        rotulo(g, nom[i] + ' · ' + f2(Math.round(x[i] * 1000) / 10) + ' %', px, py + s * 0.4 + 12, COL.tinta, 'center', 13);
      }
      if (anim && nav) { var a = P[nav[0]], b = P[nav[1]], u = nav[2], qx = a[0] + (b[0] - a[0]) * u, qy = a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * 30; g.font = '22px system-ui'; g.textAlign = 'center'; g.fillText('🏄', qx, qy); }
      panel(g, ['iteración ' + it, c.__vis && anim ? 'el navegante pasa: ' + c.__vis.map(function (v, i) { return nom[i] + ' ' + Math.round(v * 100) + '%'; }).join(' · ') : 'tamaño de cada página = su PageRank'], 10, h - 52);
      lec.innerHTML = 'G = αP + (1 − α)/5 · 𝟙𝟙ᵗ · x<sup>(' + it + ')</sup> = (' + x.map(function (v) { return f2(Math.round(v * 1000) / 1000); }).join('; ') + ')';
    }
    al.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Geometría vectorial · equilibrio de fuerzas
     ===================================================================== */
  function trianguloFuerzas(g, x, y, F, esc, cols, noms, sinFondo) {     /* F: lista de vectores [fx, fy] que suman 0 */
    g.save(); if (!sinFondo) { g.fillStyle = 'rgba(255,255,255,.88)'; rr(g, x - 8, y - 8, 150, 150, 10); g.fill(); }
    g.font = '600 11px system-ui'; g.fillStyle = '#4d5762'; g.textAlign = 'left'; g.fillText('las fuerzas se cierran', x, y + 6);
    var mx = 0; F.forEach(function (f) { mx = Math.max(mx, Math.hypot(f[0], f[1])); }); var k = 95 / (mx || 1), px = x + 70, py = y + 75, pts = [[0, 0]], sx = 0, sy = 0;
    F.forEach(function (f) { sx += f[0] * k; sy -= f[1] * k; pts.push([sx, sy]); });
    var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    F.forEach(function (f, i) { flecha(g, px + pts[i][0] - cx, py + pts[i][1] - cy, px + pts[i + 1][0] - cx, py + pts[i + 1][1] - cy, cols[i], 2.4, 8); });
    g.restore();
  }

  /* ---------- piezas «realistas» para las escenas de equilibrio ---------- */
  function madera(g, x, y, w, h, c1, c2, sem, vertical) {         /* tablones con veta */
    var r = azar(sem || 7), tw = vertical ? 22 : 16; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var p = 0; p * tw < (vertical ? w : h) + tw; p++) {
      var t = r(), gr = vertical ? g.createLinearGradient(x + p * tw, 0, x + p * tw + tw, 0) : g.createLinearGradient(0, y + p * tw, 0, y + p * tw + tw);
      gr.addColorStop(0, c1); gr.addColorStop(0.5 + 0.3 * (t - 0.5), c2); gr.addColorStop(1, c1); g.fillStyle = gr;
      if (vertical) g.fillRect(x + p * tw, y, tw, h); else g.fillRect(x, y + p * tw, w, tw);
      g.strokeStyle = 'rgba(70,40,15,.18)'; g.lineWidth = 0.8;
      for (var v = 0; v < 4; v++) { var o = (r() * 0.8 + 0.1) * tw; g.beginPath();
        if (vertical) { g.moveTo(x + p * tw + o, y); for (var q = 0; q <= h; q += 12) g.lineTo(x + p * tw + o + Math.sin(q * 0.05 + v + t * 6) * 1.6, y + q); }
        else { g.moveTo(x, y + p * tw + o); for (var q2 = 0; q2 <= w; q2 += 12) g.lineTo(x + q2, y + p * tw + o + Math.sin(q2 * 0.05 + v + t * 6) * 1.6); }
        g.stroke(); }
      if (r() < 0.5) { var kx = vertical ? x + p * tw + tw / 2 : x + r() * w, ky = vertical ? y + r() * h : y + p * tw + tw / 2; g.fillStyle = 'rgba(80,45,15,.35)'; g.beginPath(); g.ellipse(kx, ky, 2.5, 4, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(40,20,5,.35)'; if (vertical) g.fillRect(x + p * tw, y, 1.2, h); else g.fillRect(x, y + p * tw, w, 1.2);
    }
    g.restore();
  }
  function cableAcero(g, x1, y1, x2, y2, grosor, tinte) {          /* cable trenzado con brillo */
    var L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; grosor = grosor || 3;
    g.save(); g.lineCap = 'round';
    if (tinte) { g.strokeStyle = tinte; g.globalAlpha = 0.35; g.lineWidth = grosor + 6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.globalAlpha = 1; }
    g.strokeStyle = '#2a2f36'; g.lineWidth = grosor + 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = '#8b939c'; g.lineWidth = grosor - 0.6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = 'rgba(30,34,40,.75)'; g.lineWidth = 1; g.beginPath();
    for (var d = 0; d < L; d += 4) { var cx = x1 + ux * d, cy = y1 + uy * d; g.moveTo(cx - uy * grosor * 0.5, cy + ux * grosor * 0.5); g.lineTo(cx + ux * 2.4 + uy * grosor * 0.5, cy + uy * 2.4 - ux * grosor * 0.5); }
    g.stroke(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x1 - uy * 0.8, y1 + ux * 0.8); g.lineTo(x2 - uy * 0.8, y2 + ux * 0.8); g.stroke(); g.restore();
  }
  function cuerda(g, x1, y1, x2, y2, col, osc) {                  /* soga de fibra torcida */
    var L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; g.save(); g.lineCap = 'round';
    g.strokeStyle = osc || '#7a3b16'; g.lineWidth = 5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = col || '#c87a3a'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = 'rgba(90,40,10,.8)'; g.lineWidth = 1.1; g.beginPath();
    for (var d = 0; d < L; d += 5) { var cx = x1 + ux * d, cy = y1 + uy * d; g.moveTo(cx - uy * 2.3, cy + ux * 2.3); g.lineTo(cx + ux * 3.5 + uy * 2.3, cy + uy * 3.5 - ux * 2.3); }
    g.stroke(); g.restore();
  }
  function celosia(g, x1, y1, x2, y2, ancho) {                     /* pluma de grúa en celosía */
    var L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, n = Math.max(4, Math.round(L / 18));
    function P(t, s) { var a = ancho * (1 - 0.45 * t) / 2 * s; return [x1 + ux * L * t + nx * a, y1 + uy * L * t + ny * a]; }
    g.save(); g.lineCap = 'round';
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x1 + 4, y1 + 6); g.lineTo(x2 + 4, y2 + 6); g.stroke();
    g.strokeStyle = '#b8860b'; g.lineWidth = 1.6; g.beginPath();
    for (var i = 0; i < n; i++) { var a = P(i / n, 1), b = P((i + 1) / n, -1), c = P((i + 1) / n, 1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); }
    g.stroke();
    [1, -1].forEach(function (sg) { var a = P(0, sg), b = P(1, sg); g.strokeStyle = '#8a6508'; g.lineWidth = 3.6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = '#f2c33b'; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    g.restore();
  }
  function marOlas(g, w, y0, h, sem) {
    var gr = g.createLinearGradient(0, y0, 0, h); gr.addColorStop(0, '#5aa6cf'); gr.addColorStop(0.35, '#2f7fae'); gr.addColorStop(1, '#14466e'); g.fillStyle = gr; g.fillRect(0, y0, w, h - y0);
    var r = azar(sem || 3); g.save(); g.lineCap = 'round';
    for (var k = 0; k < 70; k++) { var yy = y0 + 4 + Math.pow(r(), 1.4) * (h - y0 - 6), xx = r() * w, ll = 6 + (yy - y0) * 0.18 + r() * 10, a = 0.15 + 0.25 * r();
      g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.lineWidth = 1 + (yy - y0) / (h - y0) * 1.2; g.beginPath(); g.moveTo(xx - ll, yy); g.quadraticCurveTo(xx, yy - 2.5, xx + ll, yy); g.stroke();
      g.strokeStyle = 'rgba(5,30,60,' + a * 0.8 + ')'; g.beginPath(); g.moveTo(xx - ll * 0.8, yy + 2); g.quadraticCurveTo(xx, yy + 4, xx + ll * 0.8, yy + 2); g.stroke(); }
    var br = g.createLinearGradient(0, y0, 0, y0 + 14); br.addColorStop(0, 'rgba(255,255,255,.45)'); br.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = br; g.fillRect(0, y0, w, 14); g.restore();
  }
  function obrero(g, x, y, h, mx, my) {                            /* (x, y) = pies; (mx, my) = donde agarra la soga */
    var k = h / 60; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    sombraPiso(g, x + 4 * k, y + 1, 16 * k, 3.5 * k, 0.3);
    var hx = x - 4 * k, hy = y - 30 * k, sx = x - 1 * k, sy = y - 48 * k;
    g.strokeStyle = '#2b3a55'; g.lineWidth = 6.5 * k; g.beginPath(); g.moveTo(hx, hy); g.lineTo(x - 13 * k, y - 1); g.moveTo(hx, hy); g.lineTo(x + 8 * k, y - 1); g.stroke();
    g.fillStyle = '#1c1c1c'; [[x - 13 * k, y], [x + 8 * k, y]].forEach(function (p) { rr(g, p[0] - 3 * k, p[1] - 3.5 * k, 9 * k, 4.5 * k, 2 * k); g.fill(); });
    var cu = g.createLinearGradient(sx - 8 * k, 0, sx + 8 * k, 0); cu.addColorStop(0, '#d9580f'); cu.addColorStop(1, '#ff8a2a'); g.strokeStyle = cu; g.lineWidth = 11 * k; g.beginPath(); g.moveTo(hx, hy); g.lineTo(sx, sy); g.stroke();
    g.strokeStyle = 'rgba(235,240,120,.95)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(hx - 4.5 * k, hy - 6 * k); g.lineTo(sx - 4 * k, sy + 5 * k); g.moveTo(hx + 4 * k, hy - 5 * k); g.lineTo(sx + 4.5 * k, sy + 6 * k); g.stroke();
    g.strokeStyle = '#e07a2a'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(sx, sy + 2 * k); g.lineTo((sx + mx) / 2 + 2 * k, (sy + my) / 2 + 5 * k); g.lineTo(mx, my); g.moveTo(sx, sy + 3 * k); g.lineTo((sx + mx) / 2 - 3 * k, (sy + my) / 2 + 9 * k); g.lineTo(mx + 3 * k, my + 2 * k); g.stroke();
    g.fillStyle = '#c98e64'; g.beginPath(); g.arc(mx + 1.5 * k, my + 1 * k, 3 * k, 0, 7); g.fill();
    var cab = g.createRadialGradient(sx - 2 * k, sy - 9 * k, 1, sx, sy - 7 * k, 7 * k); cab.addColorStop(0, '#e8b48c'); cab.addColorStop(1, '#a86c45'); g.fillStyle = cab; g.beginPath(); g.arc(sx, sy - 7 * k, 6 * k, 0, 7); g.fill();
    var cs = g.createLinearGradient(0, sy - 16 * k, 0, sy - 9 * k); cs.addColorStop(0, '#fff176'); cs.addColorStop(1, '#f2b705'); g.fillStyle = cs; g.beginPath(); g.ellipse(sx, sy - 10.5 * k, 7 * k, 5.5 * k, 0, Math.PI, 0); g.fill(); g.fillRect(sx - 8.5 * k, sy - 11 * k, 17 * k, 2 * k);
    g.restore();
  }
  function carroLado(g, cx, cy) {                                    /* (cx, cy): centro de la base de la carrocería */
    g.save();
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 6;
    var cg = g.createLinearGradient(0, cy - 24, 0, cy + 8); cg.addColorStop(0, '#7fb8ee'); cg.addColorStop(0.45, '#2f77c0'); cg.addColorStop(1, '#174a80'); g.fillStyle = cg;
    g.beginPath(); g.moveTo(cx - 40, cy + 6); g.quadraticCurveTo(cx - 42, cy - 6, cx - 34, cy - 7); g.lineTo(cx - 20, cy - 9); g.quadraticCurveTo(cx - 12, cy - 23, cx - 2, cy - 23); g.lineTo(cx + 12, cy - 23);
    g.quadraticCurveTo(cx + 20, cy - 22, cx + 27, cy - 9); g.lineTo(cx + 37, cy - 6); g.quadraticCurveTo(cx + 43, cy - 3, cx + 41, cy + 6); g.closePath(); g.fill(); g.restore();
    var vg = g.createLinearGradient(cx - 14, cy - 21, cx + 22, cy - 9); vg.addColorStop(0, '#dff1ff'); vg.addColorStop(0.5, '#8fb8d8'); vg.addColorStop(1, '#4d7392'); g.fillStyle = vg;
    g.beginPath(); g.moveTo(cx - 16, cy - 10); g.quadraticCurveTo(cx - 10, cy - 20, cx - 2, cy - 20); g.lineTo(cx + 3, cy - 20); g.lineTo(cx + 3, cy - 10); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx + 6, cy - 20); g.lineTo(cx + 12, cy - 20); g.quadraticCurveTo(cx + 18, cy - 19, cx + 23, cy - 10); g.lineTo(cx + 6, cy - 10); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - 36, cy - 4); g.lineTo(cx + 36, cy - 3); g.stroke();
    g.fillStyle = '#fff6c2'; g.beginPath(); g.ellipse(cx + 38, cy - 1, 2.5, 2, 0, 0, 7); g.fill(); g.fillStyle = '#d83a2e'; g.fillRect(cx - 41, cy - 3, 3, 4);
    [-23, 23].forEach(function (dx) { g.fillStyle = '#121417'; g.beginPath(); g.arc(cx + dx, cy + 7, 7.5, 0, 7); g.fill();
      var rg = g.createRadialGradient(cx + dx - 1, cy + 6, 0.5, cx + dx, cy + 7, 4.2); rg.addColorStop(0, '#f4f6f8'); rg.addColorStop(1, '#7c858f'); g.fillStyle = rg; g.beginPath(); g.arc(cx + dx, cy + 7, 4.2, 0, 7); g.fill(); });
  }
  function gancho(g, x, y) {                                        /* polea con gancho colgando en (x, y) */
    g.save(); var gr = g.createLinearGradient(x - 7, 0, x + 7, 0); gr.addColorStop(0, '#5a6068'); gr.addColorStop(0.5, '#c9cfd6'); gr.addColorStop(1, '#4a5058'); g.fillStyle = gr;
    rr(g, x - 7, y - 4, 14, 14, 3); g.fill(); g.strokeStyle = '#2a2f36'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x, y + 15); g.arc(x - 4, y + 15, 4, 0, Math.PI); g.stroke(); g.restore();
  }
  function tarjetaFuerzas(g, x, y, F, cols) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 12; g.shadowOffsetY = 4; g.fillStyle = 'rgba(255,255,255,.93)'; rr(g, x - 8, y - 8, 150, 150, 12); g.fill(); g.restore();
    g.save(); g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = 1; for (var q = 0; q < 140; q += 14) { g.beginPath(); g.moveTo(x - 4 + q, y + 14); g.lineTo(x - 4 + q, y + 138); g.stroke(); g.beginPath(); g.moveTo(x - 4, y + 14 + q * 0.9); g.lineTo(x + 138, y + 14 + q * 0.9); g.stroke(); } g.restore();
    trianguloFuerzas(g, x, y, F, 1, cols, null, true);
  }

  W.barco = function (c, D) {
    var Wt = 3500, L = lienzoPx(c, 340), ct = fila(c), a = U.deslizador(ct, 'cable con la vertical', 0.5, 12, 0.1, 2, function (v) { return f2(v) + '°'; }), b = U.deslizador(ct, 'cuerda bajo la horizontal', 0, 45, 0.5, 30, function (v) { return f2(v) + '°'; });
    var lec = U.lectura(c), R = U.reto(c, 'Con 2° y 30°, ¿cuál es la tensión en la cuerda? (lb, 1 decimal)', true, function (v) { return Math.abs(v - 144.0) < 0.15; },
      '¡Bien! T<sub>AC</sub> = 3500·sen 2°/cos 32° ≈ 144,0 lb, y el cable soporta T<sub>AB</sub> ≈ 3574 lb.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, ar = a.v * Math.PI / 180, br = b.v * Math.PI / 180, TAC = Wt * Math.sin(ar) / Math.cos(ar + br), TAB = TAC * Math.cos(br) / Math.sin(ar);
      var mar0 = h * 0.7, mov = w < 560;
      cielo(g, w, h, '#7fb6dd', '#f6efe2');
      var sol = g.createRadialGradient(w * 0.86, h * 0.12, 4, w * 0.86, h * 0.12, 120); sol.addColorStop(0, 'rgba(255,244,200,.95)'); sol.addColorStop(0.15, 'rgba(255,236,170,.6)'); sol.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = sol; g.fillRect(0, 0, w, h);
      nube(g, w * 0.62, 40, 0.7); nube(g, w * 0.2, 26, 0.55);
      g.fillStyle = 'rgba(95,125,150,.55)'; g.beginPath(); g.moveTo(w * 0.35, mar0); for (var q = 0; q <= 16; q++) { var xq = w * 0.35 + q * w * 0.04; g.lineTo(xq, mar0 - 10 - 14 * Math.abs(Math.sin(q * 1.7)) - (q % 3 === 0 ? 10 : 0)); } g.lineTo(w, mar0); g.closePath(); g.fill();
      marOlas(g, w, mar0, h, 5);
      /* barco */
      var bx1 = w * (mov ? 0.4 : 0.36), dk = h * 0.6;
      g.save(); var hg = g.createLinearGradient(0, dk, 0, h * 0.84); hg.addColorStop(0, '#9c3a32'); hg.addColorStop(0.6, '#6e2621'); hg.addColorStop(1, '#3b1411'); g.fillStyle = hg;
      g.beginPath(); g.moveTo(-5, dk); g.lineTo(bx1, dk); g.quadraticCurveTo(bx1 + 6, dk + 30, bx1 - 28, h * 0.84); g.lineTo(-5, h * 0.84); g.closePath(); g.fill();
      g.fillStyle = '#1d2430'; g.fillRect(-5, mar0 - 4, bx1 - 12, 7); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(-5, dk + 2, bx1, 3);
      g.fillStyle = 'rgba(0,0,0,.25)'; for (var rv = 8; rv < bx1 - 10; rv += 14) { g.beginPath(); g.arc(rv, dk + 10, 1.3, 0, 7); g.fill(); }
      [0.1, 0.2, 0.3].forEach(function (f) { var xx = bx1 * f * 2.4; if (xx > bx1 - 30) return; g.fillStyle = '#d9d2c4'; g.beginPath(); g.arc(xx, dk + 22, 4.5, 0, 7); g.fill(); g.fillStyle = '#21384f'; g.beginPath(); g.arc(xx, dk + 22, 3, 0, 7); g.fill(); });
      g.restore();
      g.strokeStyle = '#e8e4dc'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, dk - 8); g.lineTo(bx1 - 4, dk - 8); g.stroke(); for (var rl = 4; rl < bx1; rl += 12) { g.beginPath(); g.moveTo(rl, dk - 8); g.lineTo(rl, dk); g.stroke(); }
      var cabx = w * 0.03, caby = h * 0.4, cabw = w * 0.14, cabh = dk - caby;
      var cbg = g.createLinearGradient(cabx, 0, cabx + cabw, 0); cbg.addColorStop(0, '#f0ebe2'); cbg.addColorStop(1, '#bdb4a5'); g.fillStyle = cbg; g.fillRect(cabx, caby, cabw, cabh);
      g.fillStyle = '#8f8574'; g.fillRect(cabx - 4, caby - 5, cabw + 8, 6);
      for (var wv = 0; wv < 3; wv++) { var vx = cabx + 6 + wv * (cabw - 12) / 3, vw = (cabw - 12) / 3 - 5; var vg = g.createLinearGradient(vx, caby + 10, vx + vw, caby + 24); vg.addColorStop(0, '#cfe6f7'); vg.addColorStop(1, '#4f7c9e'); g.fillStyle = vg; g.fillRect(vx, caby + 10, vw, 13); }
      g.fillStyle = '#c2b8a6'; g.fillRect(cabx + cabw * 0.35, caby - 26, 8, 22); g.fillStyle = '#d24b3a'; g.fillRect(cabx + cabw * 0.35, caby - 30, 8, 5);
      /* grúa */
      var Bx = w * 0.3, By = 22, Ax = w * 0.48, Ay = h * 0.42, piex = w * 0.11, piey = h * 0.42;
      var tg = g.createLinearGradient(piex - 9, 0, piex + 9, 0); tg.addColorStop(0, '#a77a08'); tg.addColorStop(0.5, '#f2c33b'); tg.addColorStop(1, '#8a6508'); g.fillStyle = tg; g.fillRect(piex - 9, piey, 18, dk - piey);
      g.fillStyle = '#5c636c'; g.beginPath(); g.arc(piex, piey, 8, 0, 7); g.fill();
      celosia(g, piex, piey, Bx, By, 16);
      g.fillStyle = '#4b5058'; g.beginPath(); g.arc(Bx, By, 6, 0, 7); g.fill(); g.fillStyle = '#b9c0c8'; g.beginPath(); g.arc(Bx, By, 2.5, 0, 7); g.fill();
      var len = (Ay - By) / Math.cos(ar); Ax = Bx + len * Math.sin(ar);
      cableAcero(g, Bx, By, Ax, Ay - 6, 3.2);
      var my0 = h * 0.68, Cy = my0 - 9, Cx = br > 1e-3 ? Ax + (Cy - Ay) / Math.tan(br) : 1e9, fuera = Cx > w - 30;
      if (fuera) { Cx = w + 6; Cy = Ay + (Cx - Ax) * Math.tan(br); }
      var mx0 = fuera ? w * 0.62 : Math.max(w * 0.4, Math.min(w * 0.72, Cx - 40));
      /* muelle */
      
      for (var pl = 0; pl < 5; pl++) { var px = mx0 + 14 + pl * (w - mx0 - 20) / 4.2; var pg = g.createLinearGradient(px, 0, px + 12, 0); pg.addColorStop(0, '#4a3220'); pg.addColorStop(0.5, '#7a5634'); pg.addColorStop(1, '#3d2919'); g.fillStyle = pg; g.fillRect(px, my0 + 12, 12, h - my0); g.fillStyle = 'rgba(20,60,90,.35)'; g.fillRect(px, mar0 + 6, 12, h); }
      madera(g, mx0, my0, w - mx0, 14, '#8c6a46', '#b48e62', 11, true);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(mx0, my0 + 14, w - mx0, 3);
      cuerda(g, Ax, Ay, Cx, Cy);
      if (!fuera) {
        var bg = g.createLinearGradient(Cx - 7, 0, Cx + 7, 0); bg.addColorStop(0, '#22262b'); bg.addColorStop(0.5, '#6b737c'); bg.addColorStop(1, '#1c2024'); g.fillStyle = bg; rr(g, Cx - 6, my0 - 13, 12, 14, 3); g.fill(); g.fillRect(Cx - 9, my0 - 15, 18, 4);
        var hx = Cx + 26, hy = my0 - 34; cuerda(g, Cx + 2, Cy + 1, hx, hy); obrero(g, hx + 10, my0, 56, hx, hy);
        g.strokeStyle = '#a0612c'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx + 2, hy + 2); g.quadraticCurveTo(hx + 30, hy + 30, hx + 34, my0 - 2); g.stroke();
      }
      gancho(g, Ax, Ay - 6);
      var cx0 = Ax, cy0 = Ay + 56;
      g.strokeStyle = '#2a2f36'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(Ax, Ay + 9); g.lineTo(cx0 - 28, cy0 - 8); g.moveTo(Ax, Ay + 9); g.lineTo(cx0 + 24, cy0 - 8); g.moveTo(Ax, Ay + 9); g.lineTo(cx0 - 2, cy0 - 22); g.stroke();
      carroLado(g, cx0, cy0);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx0 + 6, dk + 2, 36 * (1 - (dk - cy0) / h), 4, 0, 0, 7); g.fill();
      g.fillStyle = COL.ambar; g.beginPath(); g.arc(Ax, Ay, 5, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); rotulo(g, 'A', Ax - 14, Ay - 2, COL.tinta, 'center', 13);
      tarjetaFuerzas(g, w - 160, 14, [[-TAB * Math.sin(ar), TAB * Math.cos(ar)], [TAC * Math.cos(br), -TAC * Math.sin(br)], [0, -Wt]], ['#2f3640', '#b5531c', '#1f5f9e']);
      rotulo(g, 'T_AB = ' + miles(TAB) + ' lb', (Bx + Ax) / 2 + 14, (By + Ay) / 2 + 10, '#2f3640', 'left'); var lx = Math.min((Ax + Math.min(Cx, w)) / 2, w - 130), ly = Ay + (lx - Ax) * Math.tan(br); if (lx + 140 > w - 168 && ly - 16 < 172) ly += 22; else { lx += 14; ly -= 16; } rotulo(g, 'T_AC = ' + f2(Math.round(TAC * 10) / 10) + ' lb', lx, ly, '#b5531c', 'left'); rotulo(g, '3500 lb', cx0, cy0 + 26, '#1f5f9e');
      lec.innerHTML = 'ΣF<sub>x</sub>: −T<sub>AB</sub> sen ' + f2(a.v) + '° + T<sub>AC</sub> cos ' + f2(b.v) + '° = 0 · ΣF<sub>y</sub>: T<sub>AB</sub> cos ' + f2(a.v) + '° − T<sub>AC</sub> sen ' + f2(b.v) + '° − 3500 = 0 ⇒ <b>T<sub>AC</sub> = ' + f2(Math.round(TAC * 10) / 10) + ' lb</b>';
    }
    [a, b].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  function ladrillos(g, w, h, sem) {                                 /* pared de bodega */
    var r = azar(sem || 9), bw = 34, bh = 15; g.fillStyle = '#c9b9a6'; g.fillRect(0, 0, w, h);
    for (var y = 0, f = 0; y < h; y += bh, f++) for (var x = (f % 2) * -bw / 2; x < w; x += bw) {
      var t = r(), cR = 168 + t * 30, cG = 112 + t * 22, cB = 92 + t * 18; g.fillStyle = 'rgb(' + (cR | 0) + ',' + (cG | 0) + ',' + (cB | 0) + ')'; g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 1.5, y + 1.5, bw - 3, 2); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x + 1.5, y + bh - 3.5, bw - 3, 2); }
    var v = g.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.75); v.addColorStop(0, 'rgba(255,240,215,.35)'); v.addColorStop(1, 'rgba(30,20,10,.38)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
  }
  function vigaI(g, w, y0, alto) {                                   /* viga de acero en el techo */
    var gr = g.createLinearGradient(0, y0, 0, y0 + alto); gr.addColorStop(0, '#3d454e'); gr.addColorStop(0.3, '#8c96a1'); gr.addColorStop(0.55, '#5c6670'); gr.addColorStop(1, '#2c333a'); g.fillStyle = gr; g.fillRect(0, y0, w, alto);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, y0 + alto * 0.28, w, 1); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y0 + alto, w, 4);
    g.fillStyle = '#2a3038'; for (var x = 14; x < w; x += 46) { g.beginPath(); g.arc(x, y0 + alto * 0.7, 2.2, 0, 7); g.fill(); }
  }
  function argolla(g, x, y, r) {
    g.save(); g.lineWidth = 3.2; var gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, '#e2e6ea'); gr.addColorStop(1, '#4d555e'); g.strokeStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.restore();
  }
  function placaAnclaje(g, x, y) {
    var gr = g.createLinearGradient(x - 14, 0, x + 14, 0); gr.addColorStop(0, '#59616a'); gr.addColorStop(0.5, '#b4bcc5'); gr.addColorStop(1, '#4a5159'); g.fillStyle = gr; rr(g, x - 15, y, 30, 9, 2); g.fill();
    g.fillStyle = '#2a3038'; [-9, 9].forEach(function (d) { g.beginPath(); g.arc(x + d, y + 4.5, 1.8, 0, 7); g.fill(); });
    g.fillStyle = '#6b737c'; g.fillRect(x - 3, y + 9, 6, 7); argolla(g, x, y + 19, 4);
  }
  function cajaMadera(g, x, y, w, h) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 6; g.fillStyle = '#a0703f'; g.fillRect(x, y, w, h); g.restore();
    madera(g, x, y, w, h, '#a87443', '#d6a56b', 21, false);
    g.strokeStyle = '#6e4622'; g.lineWidth = 5; g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5); g.lineWidth = 4.5; g.beginPath(); g.moveTo(x + 5, y + 5); g.lineTo(x + w - 5, y + h - 5); g.stroke();
    g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.fillStyle = '#3a3f46'; [[x + 3, y + 3], [x + w - 3, y + 3], [x + 3, y + h - 3], [x + w - 3, y + h - 3]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 1.6, 0, 7); g.fill(); });
  }

  W.cables = function (c, D) {
    var max = D.modo === 'max', L = lienzoPx(c, function (w) { return w < 560 ? 450 : 340; }), ct = fila(c);
    var al = U.deslizador(ct, 'α =', max ? 0 : 5, max ? 90 : 80, 0.5, max ? 45 : 20, function (v) { return f2(v) + '°'; });
    var Ps = max ? U.deslizador(ct, 'fuerza P =', 0, 1600, 1, 800, function (v) { return Math.round(v) + ' N'; }) : null;
    var lec = U.lectura(c), R = max ? U.reto(c, '¿Cuál es la mayor P que se puede aplicar sin romper ningún cable? (N)', true, function (v) { return Math.abs(v - 1294) < 3; },
      '¡Eso! P² = 1200² + 600² − 2·1200·600·cos 85° ⇒ P ≈ 1294 N, con α ≈ 62,5°: los dos cables llegan a su límite a la vez.')
      : U.reto(c, 'Con α = 20°, ¿cuál es la tensión en el cable AC? (N)', true, function (v) { return Math.abs(v - 2128.9) < 1.5; }, '¡Correcto! T<sub>AC</sub> ≈ 2129 N y T<sub>BC</sub> ≈ 1735 N.');
    R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, A = max ? 35 : 40, Bg = max ? 50 : al.v, ar = A * Math.PI / 180, brr = Bg * Math.PI / 180, TAC, TBC, P, Fext;
      if (max) { P = Ps.v; var t = al.v * Math.PI / 180, px = P * Math.cos(t), py = -P * Math.sin(t), det = Math.cos(ar) * Math.sin(brr) + Math.sin(ar) * Math.cos(brr);
        TBC = (-py * Math.cos(ar) - px * Math.sin(ar)) / det; TAC = (TBC * Math.cos(brr) + px) / Math.cos(ar); Fext = [px, py]; }
      else { P = 1962; TAC = P * Math.cos(brr) / Math.sin(ar + brr); TBC = P * Math.cos(ar) / Math.sin(ar + brr); Fext = [0, -P]; }
      ladrillos(g, w, h, 4); vigaI(g, w, 0, 18);
      var piso = h - 26, pg = g.createLinearGradient(0, piso, 0, h); pg.addColorStop(0, '#8d8a84'); pg.addColorStop(1, '#5f5c57'); g.fillStyle = pg; g.fillRect(0, piso, w, h - piso); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, piso, w, 2);
      var cotA = Math.cos(ar) / Math.sin(ar), cotB = Math.cos(brr) / Math.sin(brr), mov = w < 560, hMax = max ? h * (mov ? 0.36 : 0.55) - 18 : (mov ? h - 290 : h - 150), dAB = max ? Math.min(w - (mov ? 60 : 220), hMax * (cotA + cotB)) : Math.min(w - (mov ? 60 : 220), hMax * (cotA + 1 / Math.tan(80 * Math.PI / 180))),
        Ax = max ? 30 : Math.max(30, (w - (mov ? 0 : 170) - dAB) / 2), Cy = 18 + dAB / (cotA + cotB), Cx = Ax + (Cy - 18) * cotA, Bx = Ax + dAB;   /* A y B quedan fijos en el techo: al cambiar α se mueve el nudo C */
      function cable(x1, y1, T, lim) { var u = lim ? Math.min(1, Math.max(0, T) / lim) : 0.4, col = lim && T > lim + 0.5 ? '#c0392b' : 'hsl(' + (130 - 110 * u) + ',60%,38%)'; cableAcero(g, x1, y1 + 19, Cx, Cy, 3.4, lim ? col : null); return lim ? col : '#3d454e'; }
      var cA = cable(Ax, 18, TAC, max ? 1200 : 0), cB = cable(Bx, 18, TBC, max ? 600 : 0);
      [[Ax, 'A'], [Bx, 'B']].forEach(function (p) { placaAnclaje(g, p[0], 18); rotulo(g, p[1], p[0] + 16, 38, COL.tinta, 'left', 13); });
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.setLineDash([4, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(Cx - 90, Cy); g.lineTo(Cx + 90, Cy); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#fff'; g.lineWidth = 1.8; g.beginPath(); g.arc(Cx, Cy, 34, Math.PI, Math.PI + ar); g.stroke(); g.beginPath(); g.arc(Cx, Cy, 40, -brr, 0); g.stroke();
      rotulo(g, A + '°', Cx - 56, Cy - 12, '#2f3640', 'center', 12); rotulo(g, (max ? '50' : f2(al.v)) + '°', Cx + 60, Cy - 12, '#2f3640', 'center', 12);
      if (max) { var t2 = al.v * Math.PI / 180, ex = Cx + 110 * Math.cos(t2), ey = Cy + 110 * Math.sin(t2); g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 6; g.shadowOffsetY = 3; flecha(g, Cx, Cy, ex, ey, '#1f5f9e', 5, 13); g.restore(); rotulo(g, 'P = ' + Math.round(P) + ' N', ex + 6, ey + 10, '#1f5f9e', 'left'); g.strokeStyle = '#1f5f9e'; g.lineWidth = 1.3; g.beginPath(); g.arc(Cx, Cy, 28, 0, t2); g.stroke(); rotulo(g, 'α', Cx + 38 * Math.cos(t2 / 2), Cy + 38 * Math.sin(t2 / 2), '#1f5f9e', 'center', 12, false); }
      else { cableAcero(g, Cx, Cy + 5, Cx - 22, Cy + 40, 2.4); cableAcero(g, Cx, Cy + 5, Cx + 22, Cy + 40, 2.4);
        var cy2 = Cy + 40, sh = Math.max(0.15, 1 - (piso - cy2 - 50) / h); sombraPiso(g, Cx + 4, piso + 4, 40 * sh, 6 * sh, 0.35 * sh);
        cajaMadera(g, Cx - 34, cy2, 68, 50); rotulo(g, '200 kg', Cx, cy2 + 25, '#4a2c12', 'center', 13); }
      argolla(g, Cx, Cy, 6); rotulo(g, 'C', Cx - 14, Cy + 14, COL.tinta, 'center', 13);
      tarjetaFuerzas(g, w - 160, h - 182, [[-TAC * Math.cos(ar), TAC * Math.sin(ar)], [TBC * Math.cos(brr), TBC * Math.sin(brr)], Fext], [cA, cB, '#1f5f9e']);
      rotulo(g, 'T_AC = ' + Math.round(TAC) + ' N' + (max ? ' / 1200' : ''), (Ax + Cx) / 2 - 8, (18 + Cy) / 2, cA, 'right'); rotulo(g, 'T_BC = ' + Math.round(TBC) + ' N' + (max ? ' / 600' : ''), (Bx + Cx) / 2 + 8, (18 + Cy) / 2, cB, 'left');
      if (max) { var ok = TAC <= 1200.5 && TBC <= 600.5 && TAC >= 0 && TBC >= 0; lec.innerHTML = (ok ? '✅ Los dos cables aguantan.' : '❌ ' + (TAC > 1200.5 ? 'AC se revienta. ' : '') + (TBC > 600.5 ? 'BC se revienta. ' : '') + (TBC < 0 || TAC < 0 ? 'Un cable quedaría empujando: imposible.' : '')) + ' T<sub>AC</sub> = ' + Math.round(TAC) + ' N (máx. 1200) · T<sub>BC</sub> = ' + Math.round(TBC) + ' N (máx. 600)'; }
      else lec.innerHTML = 'Lami / equilibrio: T<sub>AC</sub> = 1962·cos α / sen(40° + α) = <b>' + f2(Math.round(TAC * 10) / 10) + ' N</b> · T<sub>BC</sub> = 1962·cos 40° / sen(40° + α) = <b>' + f2(Math.round(TBC * 10) / 10) + ' N</b>';
    }
    [al, Ps].forEach(function (s) { if (s) s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Geometría vectorial · temperatura en la tubería (sistema lineal)
     ===================================================================== */
  W.temperatura = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? Math.min(w - 70, 280) + 290 : 360; }), ct = fila(c), N = U.deslizador(ct, 'norte', 0, 150, 1, 100, function (v) { return v + '°'; }), A = U.deslizador(ct, 'lados de arriba', 0, 150, 1, 60, function (v) { return v + '°'; }),
      B = U.deslizador(ct, 'lados de abajo', 0, 150, 1, 40, function (v) { return v + '°'; }), S = U.deslizador(ct, 'sur', 0, 150, 1, 0, function (v) { return v + '°'; });
    var ct2 = fila(c), T = [0, 0, 0, 0], it = 0;
    boton(ct2, '➜ Un paso: cada punto toma el promedio de sus vecinos', function () { T = paso(T); it++; dib(); });
    boton(ct2, '✔ Resolver el sistema', function () { for (var q = 0; q < 200; q++) T = paso(T); it = '∞'; dib(); });
    boton(ct2, '↺ Desde 0°', function () { T = [0, 0, 0, 0]; it = 0; dib(); });
    var lec = U.lectura(c), R = U.reto(c, 'Con los datos del problema (100°, 60°, 40°, 0°), ¿cuánto vale T₁?', true, function (v) { return Math.abs(v - 65) < 0.05; },
      '¡Así es! Por simetría T₁ = T₂ y T₃ = T₄; queda 3T₁ = 160 + T₃ y 3T₃ = T₁ + 40, así que T₁ = T₂ = 65° y T₃ = T₄ = 35°.'); R.el.__fin = c.__fin;
    function paso(t) { var n = N.v, a = A.v, b = B.v, s = S.v; return [(n + a + t[1] + t[2]) / 4, (n + a + t[0] + t[3]) / 4, (t[0] + b + t[3] + s) / 4, (t[1] + b + t[2] + s) / 4]; }
    function color(v) { var u = Math.max(0, Math.min(1, v / 150)); var st = [[0, [40, 70, 160]], [0.35, [60, 170, 200]], [0.6, [250, 210, 80]], [0.8, [240, 120, 40]], [1, [190, 30, 30]]];
      for (var i = 1; i < st.length; i++) if (u <= st[i][0]) { var f = (u - st[i - 1][0]) / (st[i][0] - st[i - 1][0]), a = st[i - 1][1], b = st[i][1]; return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')'; } return 'rgb(190,30,30)'; }
    function tubo(g, x1, y1, x2, y2, t, grosor) {          /* tubería de borde con su temperatura */
      var vert = x1 === x2, gr = vert ? g.createLinearGradient(x1 - grosor / 2, 0, x1 + grosor / 2, 0) : g.createLinearGradient(0, y1 - grosor / 2, 0, y1 + grosor / 2), c0 = color(t);
      gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.35, c0); gr.addColorStop(0.5, 'rgba(255,255,255,.75)'); gr.addColorStop(0.65, c0); gr.addColorStop(1, 'rgba(0,0,0,.6)');
      g.save(); if (t > 70) { g.shadowColor = c0; g.shadowBlur = 6 + (t - 70) / 8; } g.strokeStyle = gr; g.lineWidth = grosor; g.lineCap = 'butt'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
      g.fillStyle = '#3d454e'; [[x1, y1], [x2, y2]].forEach(function (p) { g.fillRect(p[0] - (vert ? grosor / 2 + 2 : 3), p[1] - (vert ? 3 : grosor / 2 + 2), vert ? grosor + 4 : 6, vert ? 6 : grosor + 4); });
    }
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = N.v, a = A.v, b = B.v, s = S.v, mov = w < 560, sz = mov ? Math.min(w - 70, 280) : Math.min(h - 60, w * 0.46), ox = mov ? (w - sz) / 2 : 44, oy = 30, cel = sz / 3;
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b3138'); gr.addColorStop(1, '#171b20'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 1; for (var q = -h; q < w; q += 7) { g.beginPath(); g.moveTo(q, 0); g.lineTo(q + h, h); g.stroke(); }
      var M = [[null, n, n, null], [a, T[0], T[1], a], [b, T[2], T[3], b], [null, s, s, null]];
      M[0][0] = (n + a) / 2; M[0][3] = M[0][0]; M[3][0] = (s + b) / 2; M[3][3] = M[3][0];
      function val(u, v) { var i0 = Math.min(2, Math.floor(v)), j0 = Math.min(2, Math.floor(u)), fu = u - j0, fv = v - i0; fu = fu * fu * (3 - 2 * fu); fv = fv * fv * (3 - 2 * fv);
        return M[i0][j0] * (1 - fu) * (1 - fv) + M[i0][j0 + 1] * fu * (1 - fv) + M[i0 + 1][j0] * (1 - fu) * fv + M[i0 + 1][j0 + 1] * fu * fv; }
      g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18; g.shadowOffsetY = 8; g.fillStyle = '#222'; g.fillRect(ox, oy, sz, sz); g.restore();
      var res = 72, px = sz / res;
      for (var i = 0; i < res; i++) for (var j = 0; j < res; j++) { g.fillStyle = color(val((j + 0.5) / res * 3, (i + 0.5) / res * 3)); g.fillRect(ox + j * px, oy + i * px, px + 0.7, px + 0.7); }
      g.save(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.1; var mr = 48, d = sz / mr, V = [];      /* isotermas cada 10° (cuadrados de marcha) */
      for (var ii = 0; ii <= mr; ii++) { V.push([]); for (var jj = 0; jj <= mr; jj++) V[ii].push(val(jj / mr * 3, ii / mr * 3)); }
      g.beginPath();
      for (var lev = 10; lev < 150; lev += 10) for (ii = 0; ii < mr; ii++) for (jj = 0; jj < mr; jj++) {
        var c4 = [V[ii][jj], V[ii][jj + 1], V[ii + 1][jj + 1], V[ii + 1][jj]], P = [[0, 0], [1, 0], [1, 1], [0, 1]], cr = [];
        for (var e = 0; e < 4; e++) { var v1 = c4[e], v2 = c4[(e + 1) % 4]; if ((v1 < lev) !== (v2 < lev)) { var f = (lev - v1) / (v2 - v1), p1 = P[e], p2 = P[(e + 1) % 4]; cr.push([ox + (jj + p1[0] + (p2[0] - p1[0]) * f) * d, oy + (ii + p1[1] + (p2[1] - p1[1]) * f) * d]); } }
        for (var k = 0; k + 1 < cr.length; k += 2) { g.moveTo(cr[k][0], cr[k][1]); g.lineTo(cr[k + 1][0], cr[k + 1][1]); } }
      g.stroke(); g.restore();
      var sh = g.createLinearGradient(ox, oy, ox + sz, oy + sz); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(0.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = sh; g.fillRect(ox, oy, sz, sz);
      g.fillStyle = 'rgba(255,255,255,.5)'; [[ox + 6, oy + 6], [ox + sz - 6, oy + 6], [ox + 6, oy + sz - 6], [ox + sz - 6, oy + sz - 6]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 2.4, 0, 7); g.fill(); });
      var tg = 11; tubo(g, ox - 2, oy - 8, ox + sz + 2, oy - 8, n, tg); tubo(g, ox - 2, oy + sz + 8, ox + sz + 2, oy + sz + 8, s, tg);
      tubo(g, ox - 8, oy + 2, ox - 8, oy + sz / 2, a, tg); tubo(g, ox - 8, oy + sz / 2, ox - 8, oy + sz - 2, b, tg); tubo(g, ox + sz + 8, oy + 2, ox + sz + 8, oy + sz / 2, a, tg); tubo(g, ox + sz + 8, oy + sz / 2, ox + sz + 8, oy + sz - 2, b, tg);
      [[1, 1, 'T₁', T[0]], [1, 2, 'T₂', T[1]], [2, 1, 'T₃', T[2]], [2, 2, 'T₄', T[3]]].forEach(function (p) { var x = ox + p[1] * cel, y = oy + p[0] * cel;
        g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 5; var sg = g.createRadialGradient(x - 2, y - 2, 1, x, y, 7); sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, '#9aa3ad'); g.fillStyle = sg; g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fill(); g.restore();
        g.fillStyle = color(p[3]); g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
        rotulo(g, p[2] + ' = ' + f2(Math.round(p[3] * 100) / 100) + '°', x, y + 20, COL.tinta, 'center', 13, 'rgba(255,255,255,.9)'); });
      rotulo(g, n + '°', ox + sz / 2, oy - 22, '#7a1e1e', 'center', 12); rotulo(g, s + '°', ox + sz / 2, oy + sz + 23, '#1e3a7a', 'center', 12);
      rotulo(g, a + '°', ox - 26, oy + cel, '#7a4a1e', 'center', 12); rotulo(g, b + '°', ox - 26, oy + 2 * cel, '#1e5a7a', 'center', 12); rotulo(g, a + '°', ox + sz + 26, oy + cel, '#7a4a1e', 'center', 12); rotulo(g, b + '°', ox + sz + 26, oy + 2 * cel, '#1e5a7a', 'center', 12);
      var lx = mov ? 16 : ox + sz + 64, ly = mov ? oy + sz + 48 : oy + 4, pw = mov ? w - 32 : Math.min(250, w - lx - 14);
      g.fillStyle = 'rgba(255,255,255,.08)'; rr(g, lx - 10, ly - 6, pw + 20, 196, 12); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.stroke();
      g.fillStyle = '#f2f4f6'; g.font = '600 14px system-ui'; g.textAlign = 'left'; g.fillText('Iteración ' + it, lx, ly + 16);
      g.font = '12.5px system-ui'; g.fillStyle = '#cdd3da'; ['T₁ = (' + n + ' + ' + a + ' + T₂ + T₃)/4', 'T₂ = (' + n + ' + ' + a + ' + T₁ + T₄)/4', 'T₃ = (T₁ + ' + b + ' + T₄ + ' + s + ')/4', 'T₄ = (T₂ + ' + b + ' + T₃ + ' + s + ')/4'].forEach(function (t, i) { g.fillText(t, lx, ly + 42 + i * 20); });
      var bw = Math.min(160, pw); for (var q2 = 0; q2 < 60; q2++) { g.fillStyle = color(q2 * 2.5); g.fillRect(lx + q2 * bw / 60, ly + 136, bw / 60 + 0.6, 12); } g.strokeStyle = 'rgba(255,255,255,.4)'; g.strokeRect(lx, ly + 136, bw, 12);
      g.fillStyle = '#cdd3da'; g.fillText('0°', lx, ly + 166); g.textAlign = 'right'; g.fillText('150°', lx + bw, ly + 166); g.textAlign = 'left'; g.fillText('líneas: cada 10°', lx, ly + 184);
      lec.innerHTML = 'Cada temperatura interior es el promedio de sus cuatro vecinos: un sistema lineal 4 × 4. Los pasos de promedios (método de Jacobi) van acercándose a su solución.';
    }
    [N, A, B, S].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Matemáticas discretas · recurrencias
     ===================================================================== */
  function moneda(g, x, y, r) { var gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, 1, x, y, r); gr.addColorStop(0, '#fff3b8'); gr.addColorStop(0.6, '#e9b93b'); gr.addColorStop(1, '#b07f12'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.38, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,80,10,.6)'; g.lineWidth = 1; g.stroke(); }
  W.ahorro = function (c, D) {
    var L = lienzoPx(c, 300), ct = fila(c), m = U.deslizador(ct, '📅 mes n =', 1, 25, 1, 13, function (v) { return String(Math.round(v)); }),
      i = U.deslizador(ct, 'interés mensual', 0, 3, 0.05, 1, function (v) { return f2(v) + ' %'; }), ab = U.deslizador(ct, 'abono', 0, 500000, 10000, 200000, function (v) { return '$' + miles(v); });
    var lec = U.lectura(c), R = U.reto(c, 'Con los datos del ejemplo, ¿cuánto hay al comenzar el mes 13? (en pesos, sin decimales)', true, function (v) { return Math.abs(v - 3099913) < 2; },
      '¡Bien! a₁₃ = 1,01¹²·500 000 + 200 000·(1,01¹² − 1)/0,01 ≈ $3 099 913.'); R.el.__fin = c.__fin;
    function serie(n) { var a = [500000]; for (var q = 1; q < n; q++) a.push(a[q - 1] * (1 + i.v / 100) + ab.v); return a; }
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = Math.round(m.v), a = serie(25), an = a[n - 1], aportes = 500000 + ab.v * (n - 1), interes = an - aportes;
      paredEstuco(g, w, h, '#f5efe2', '#e6d9c0', 23); mesaMadera(g, w, h - 26, h);
      var mx = a[24], bw = (w - 60) / 25;
      for (var q = 0; q < 25; q++) { var v = a[q], x = 40 + q * bw + bw / 2, alto = (h - 70) * v / mx, mon = Math.max(1, Math.round(alto / 5)), sel = q === n - 1;
        g.globalAlpha = q < n ? 1 : 0.22; for (var k = 0; k < mon; k++) moneda(g, x, h - 30 - k * 5, Math.min(13, bw * 0.42));
        g.globalAlpha = 1; if (sel) { flecha(g, x, h - 44 - mon * 5 - 26, x, h - 36 - mon * 5, COL.rojo, 2.5); }
        if (q % 4 === 0) { g.fillStyle = '#6b5a40'; g.font = '11px system-ui'; g.textAlign = 'center'; g.fillText(q + 1, x, h - 9); } }
      panel(g, ['Mes ' + n + ': $' + miles(an), 'tus abonos: $' + miles(aportes) + ' · intereses: $' + miles(interes)], 10, 10);
      lec.innerHTML = 'a<sub>n+1</sub> = ' + f2(1 + i.v / 100) + '·a<sub>n</sub> + ' + miles(ab.v) + ', a<sub>1</sub> = 500.000 ⇒ <b>a<sub>' + n + '</sub> = $' + miles(an) + '</b>';
    }
    [m, i, ab].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  W.peces = function (c, D) {
    var L = lienzoPx(c, 300), G = U.Lienzo(c, 150, [0.5, 20.5, 0, 2600]), ct = fila(c);
    var n = U.deslizador(ct, '📅 año n =', 1, 20, 1, 1, function (v) { return String(Math.round(v)); }), mu = U.deslizador(ct, 'mueren', 0.05, 0.6, 0.01, 0.2, function (v) { return Math.round(v * 100) + ' %'; }),
      si = U.deslizador(ct, 'se siembran', 0, 600, 10, 300, function (v) { return String(v); }), p0 = U.deslizador(ct, 'peces al inicio', 0, 2500, 50, 1000, function (v) { return String(v); });
    var ct2 = fila(c); reloj(ct2, n, 20, 2, '▶ Ver pasar los años');
    var lec = U.lectura(c), R = U.reto(c, 'Con los datos del ejemplo, ¿a qué número se acerca la población a largo plazo?', true, function (v) { return Math.abs(v - 1500) < 0.5; },
      '¡Exacto! El punto de equilibrio cumple P = 0,8P + 300, es decir, P = 1500. Y P<sub>n</sub> = 1500 − 500·0,8<sup>n−1</sup>.'); R.el.__fin = c.__fin;
    var rnd = azar(13), pos = []; for (var q = 0; q < 70; q++) pos.push([rnd(), rnd(), rnd() * 6.28, 0.6 + rnd() * 0.5, ['#f39c12', '#e67e22', '#d35400', '#f1c40f', '#7f8c8d'][q % 5]]);
    var t0 = performance.now(), vivo = false;
    function serie() { var P = [p0.v]; for (var q = 1; q < 20; q++) P.push((1 - mu.v) * P[q - 1] + si.v); return P; }
    function dib(t) {
      t = t || performance.now(); var g = L.g, w = L.w, h = L.h, P = serie(), k = Math.round(n.v), val = P[k - 1], un = 25, np = Math.min(70, Math.round(val / un));
      if (!L.fondo || L.fondo.w !== w) { var oc = document.createElement('canvas'), dpr = window.devicePixelRatio || 1; oc.width = w * dpr; oc.height = h * dpr; var og = oc.getContext('2d'); og.setTransform(dpr, 0, 0, dpr, 0, 0);
        cielo(og, w, h * 0.3, '#9fd0ef', '#e8f3ea'); pasto(og, 0, h * 0.2, w, h * 0.8, 33); og.save(); og.beginPath(); og.ellipse(w / 2, h * 0.68, w * 0.5, h * 0.42, 0, 0, 7); og.clip(); arena(og, 0, 0, w, h, 6); og.restore();
        og.save(); og.beginPath(); og.ellipse(w / 2, h * 0.68, w * 0.48, h * 0.4, 0, 0, 7); og.clip(); aguaArriba(og, 0, h * 0.28, w, h * 0.8, 12, '#5bb0c9', '#164f68'); var sh = og.createRadialGradient(w / 2, h * 0.7, 10, w / 2, h * 0.7, w * 0.5); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,30,40,.35)'); og.fillStyle = sh; og.fillRect(0, 0, w, h); og.restore();
        L.fondo = { w: w, c: oc }; }
      g.drawImage(L.fondo.c, 0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(w / 2, h * 0.68, w * 0.48, h * 0.4, 0, 3.5, 5.9); g.stroke();
      [[0.08, 0.35], [0.9, 0.38], [0.14, 0.95], [0.86, 0.92]].forEach(function (p) { g.fillStyle = '#3f7d45'; for (var j = 0; j < 5; j++) { g.beginPath(); g.ellipse(w * p[0] + j * 4 - 8, h * p[1], 2, 14, (j - 2) * 0.2, 0, 7); g.fill(); } });
      for (var q = 0; q < np; q++) { var p = pos[q], tt = (t - t0) / 1000, ang = p[2] + tt * 0.25 * p[3], cx = w / 2 + Math.cos(ang) * w * 0.38 * p[0], cy = h * 0.68 + Math.sin(ang * 1.3) * h * 0.28 * p[1], dir = -Math.sin(ang) >= 0 ? 1 : -1; pez(g, cx, cy, 0.62 * p[3] + 0.2, p[4], dir); }
      panel(g, ['Año ' + k + ' · ' + miles(val) + ' peces', 'cada 🐟 = ' + un + ' peces'], 10, 10);
      G.limpia(); G.ejes(1, 500); var eq = si.v / mu.v; G.linea(0.5, eq, 20.5, eq, COL.ambar, 1.5, [6, 5]); P.forEach(function (v, i) { G.punto(i + 1, v, i + 1 === k ? COL.rojo : COL.teal, i + 1 === k ? 5 : 3); }); G.texto('equilibrio ' + Math.round(eq), 14, eq + 120, COL.ambar);
      lec.innerHTML = 'P<sub>n+1</sub> = ' + f2(Math.round((1 - mu.v) * 100) / 100) + '·P<sub>n</sub> + ' + si.v + ' · P<sub>' + k + '</sub> = <b>' + miles(val) + '</b> · equilibrio P* = siembra/mortalidad = <b>' + miles(eq) + '</b>';
    }
    function loop(t) { if (!vivo) return; dib(t); requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window && !sinAnim()) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !vivo) { vivo = true; requestAnimationFrame(loop); } else if (!v) vivo = false; }).observe(L.c);
    [n, mu, si, p0].forEach(function (s) { s.inp.addEventListener('input', function () { dib(); }); }); L.redibuja = function () { dib(); }; G.redibuja = L.redibuja; dib();
  };

  W.hanoi = function (c, D) {
    var L = lienzoPx(c, 260), ct = fila(c), nd = U.deslizador(ct, 'discos n =', 1, 8, 1, 3, function (v) { return String(Math.round(v)); });
    var pilas, mov, sel, auto = null, hecho = {};
    boton(ct, '↺ Reiniciar', function () { ini(); }); var ba = boton(ct, '🤖 Que lo resuelva solo', function () { resolver(); });
    var lec = U.lectura(c), R = U.reto(c, 'Pásala completa con 4 discos usando el mínimo de movimientos (pista: h<sub>4</sub> = 2·h<sub>3</sub> + 1).', false, function () { return true; }, '¡Torre armada en 15 movimientos! Es justo h₄ = 2⁴ − 1.'); R.el.__fin = c.__fin;
    function ini() { if (auto) { clearInterval(auto); auto = null; ba.textContent = '🤖 Que lo resuelva solo'; } var n = Math.round(nd.v); pilas = [[], [], []]; for (var q = n; q >= 1; q--) pilas[0].push(q); mov = 0; sel = -1; dib(); }
    function mueve(a, b) { if (!pilas[a].length) return false; var d = pilas[a][pilas[a].length - 1], t = pilas[b][pilas[b].length - 1]; if (t && t < d) return false; pilas[b].push(pilas[a].pop()); mov++; return true; }
    function resolver() { ini(); var lista = [], n = Math.round(nd.v); (function h(k, a, b, x) { if (!k) return; h(k - 1, a, x, b); lista.push([a, b]); h(k - 1, x, b, a); })(n, 0, 2, 1); var q = 0; ba.textContent = '⏸ Detener';
      auto = setInterval(function () { if (q >= lista.length) { clearInterval(auto); auto = null; ba.textContent = '🤖 Que lo resuelva solo'; return; } mueve(lista[q][0], lista[q][1]); q++; dib(); }, Math.max(60, 1600 / lista.length * 2)); }
    function varilla(px) { return Math.max(0, Math.min(2, Math.floor(px / (L.w / 3)))); }
    L.c.style.cursor = 'pointer';
    L.c.addEventListener('click', function (e) { if (auto) return; var r = L.c.getBoundingClientRect(), v = varilla(e.clientX - r.left); if (sel < 0) { if (pilas[v].length) sel = v; } else { if (v !== sel && !mueve(sel, v)) { lec.innerHTML = '❌ Nuuu, un disco grande no va sobre uno pequeño.'; sel = -1; return; } sel = -1; } dib(); });
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = Math.round(nd.v), base = h - 30, cw = w / 3, maxW = cw * 0.86, dh = Math.min(22, (h - 80) / Math.max(n, 3));
      paredEstuco(g, w, h, '#f5efe4', '#e6dac6', 19); mesaMadera(g, w, base + 16, h); g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.shadowOffsetY = 4; g.fillStyle = '#6e4524'; g.fillRect(10, base, w - 20, 16); g.restore(); madera(g, 10, base, w - 20, 16, '#7a4c26', '#b07a45', 5, false); g.fillStyle = 'rgba(255,230,200,.4)'; g.fillRect(10, base, w - 20, 1.5);
      for (var v = 0; v < 3; v++) { var x = cw * v + cw / 2; if (v === sel) { g.fillStyle = 'rgba(255,200,60,.25)'; rr(g, x - cw / 2 + 6, 10, cw - 12, base - 6, 10); g.fill(); }
        var vg = g.createLinearGradient(x - 4, 0, x + 4, 0); vg.addColorStop(0, '#6e4524'); vg.addColorStop(0.5, '#c28b55'); vg.addColorStop(1, '#6e4524'); g.fillStyle = vg; rr(g, x - 4, base - (n + 1.5) * dh, 8, (n + 1.5) * dh, 4); g.fill();
        pilas[v].forEach(function (d, i) { var dw = 30 + (maxW - 30) * (d - 1) / Math.max(1, n - 1), y = base - (i + 1) * dh, hue = 200 + d * 22;
          g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 4; g.shadowOffsetY = 2; var dg = g.createLinearGradient(0, y, 0, y + dh); dg.addColorStop(0, 'hsl(' + hue + ',70%,66%)'); dg.addColorStop(1, 'hsl(' + hue + ',65%,40%)');
          g.fillStyle = dg; rr(g, x - dw / 2, y + 1, dw, dh - 2, Math.min(9, dh / 2)); g.fill(); g.restore(); if (v === sel && i === pilas[v].length - 1) { g.strokeStyle = '#f5b82e'; g.lineWidth = 3; rr(g, x - dw / 2, y + 1, dw, dh - 2, Math.min(9, dh / 2)); g.stroke(); } }); }
      var min = Math.pow(2, n) - 1, listo = pilas[2].length === n || pilas[1].length === n;
      panel(g, ['Movimientos: ' + mov, 'mínimo posible: 2' + String(n).replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }) + ' − 1 = ' + min], 10, 10);
      if (listo && mov) { lec.innerHTML = mov === min ? '✅ ¡Torre pasada en el mínimo de movimientos!' : '✅ Torre pasada, pero en ' + mov + ' movimientos: se puede en ' + min + '.'; if (n === 4 && mov === 15 && !auto && !hecho.r) { hecho.r = 1; R.evalua(1); if (c.__fin) c.__fin(); } }
      else lec.innerHTML = 'Toca una varilla para tomar el disco de arriba y otra para dejarlo. h<sub>n</sub> = 2h<sub>n−1</sub> + 1 ⇒ <b>h<sub>' + n + '</sub> = ' + min + '</b>' + (n < 8 ? '' : ' (¡y con 10 discos serían 1023!)');
    }
    nd.inp.addEventListener('input', ini); L.redibuja = dib; ini();
  };

  /* =====================================================================
     Matemáticas discretas · el sobre de Euler
     ===================================================================== */
  W.euler = function (c, D) {
    var V = { 1: [0.32, 0.86], 2: [0.68, 0.86], 3: [0.68, 0.42], 4: [0.32, 0.42], 5: [0.5, 0.08] }, E = [[1, 2], [2, 3], [3, 4], [4, 1], [1, 3], [2, 4], [3, 5], [5, 4]];
    var L = lienzoPx(c, 320), ct = fila(c), camino = [], usadas = [];
    boton(ct, '↺ Borrar y empezar de nuevo', function () { camino = []; usadas = []; dib(); }); boton(ct, '↶ Deshacer', function () { camino.pop(); usadas.pop(); dib(); });
    var lec = U.lectura(c), R = U.reto(c, 'Dibuja el sobre sin levantar el lápiz ni repetir trazos: toca los vértices en orden.', false, function () { return true; }, '¡Lo lograste! Fíjate en que empezaste y terminaste en los dos vértices de grado impar (1 y 2).'); R.el.__fin = c.__fin;
    function P(v) { var s = Math.min(L.w, 520), ox = (L.w - s) / 2; return [ox + V[v][0] * s, 20 + V[v][1] * (L.h - 50)]; }
    function arista(a, b) { for (var i = 0; i < E.length; i++) if ((E[i][0] === a && E[i][1] === b) || (E[i][0] === b && E[i][1] === a)) return i; return -1; }
    L.c.style.cursor = 'pointer';
    L.c.addEventListener('click', function (e) { var r = L.c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, v = 0;
      Object.keys(V).forEach(function (k) { var p = P(+k); if (Math.hypot(p[0] - x, p[1] - y) < 26) v = +k; }); if (!v) return;
      if (!camino.length) { camino.push(v); dib(); return; }
      var u = camino[camino.length - 1], i = arista(u, v);
      if (i < 0) { lec.innerHTML = '❌ Nuuu, de ' + u + ' a ' + v + ' no hay arista.'; return; } if (usadas.indexOf(i) >= 0) { lec.innerHTML = '❌ Ese trazo ya lo hiciste: no se vale repetir.'; return; }
      camino.push(v); usadas.push(i); dib(); });
    function dib() {
      var g = L.g, w = L.w, h = L.h; madera(g, 0, 0, w, h, '#8a5a32', '#b8834f', 27, false);
      g.save(); g.translate(w / 2, h / 2); g.rotate(-0.012); g.translate(-w / 2, -h / 2); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 5; var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#fffdf7'); gr.addColorStop(1, '#f1eadb'); g.fillStyle = gr; g.fillRect(12, 8, w - 24, h - 16); g.restore();
      moteado(g, 12, 8, w - 24, h - 16, (w * h) / 60, ['rgba(140,120,90,.05)'], 1.5, 3);
      g.strokeStyle = 'rgba(90,130,190,.28)'; g.lineWidth = 1; for (var y = 30; y < h - 10; y += 18) { g.beginPath(); g.moveTo(12, y); g.lineTo(w - 12, y); g.stroke(); }
      g.strokeStyle = 'rgba(220,70,70,.45)'; g.beginPath(); g.moveTo(52, 8); g.lineTo(52, h - 8); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.18)'; for (var hy = 40; hy < h - 20; hy += Math.max(60, (h - 60) / 3)) { g.beginPath(); g.arc(28, hy, 5, 0, 7); g.fill(); }
      E.forEach(function (e, i) { var a = P(e[0]), b = P(e[1]), u = usadas.indexOf(i); g.lineCap = 'round';
        if (u < 0) { g.strokeStyle = '#c9ced6'; g.lineWidth = 4; g.setLineDash([2, 7]); } else { g.strokeStyle = 'hsl(' + (200 + u * 18) + ',60%,42%)'; g.lineWidth = 5; g.setLineDash([]); }
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]); if (u >= 0) rotulo(g, String(u + 1), (a[0] + b[0]) / 2 + (e[0] + e[1] === 4 || e[0] + e[1] === 6 ? 12 : 0), (a[1] + b[1]) / 2, '#fff', 'center', 12, 'hsl(' + (200 + u * 18) + ',60%,42%)'); });
      Object.keys(V).forEach(function (k) { var p = P(+k), gr2 = E.filter(function (e) { return e[0] === +k || e[1] === +k; }).length, act = camino[camino.length - 1] === +k;
        g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 6; g.shadowOffsetY = 2; g.fillStyle = act ? '#f5b82e' : gr2 % 2 ? '#3d7fd1' : '#fff'; g.beginPath(); g.arc(p[0], p[1], 14, 0, 7); g.fill(); g.restore();
        g.strokeStyle = '#3a3f46'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 14, 0, 7); g.stroke(); g.fillStyle = gr2 % 2 && !act ? '#fff' : COL.tinta; g.font = '600 13px system-ui'; g.textAlign = 'center'; g.fillText(k, p[0], p[1] + 4.5); });
      if (camino.length) { var p = P(camino[camino.length - 1]); g.font = '22px system-ui'; g.fillText('✏️', p[0] + 20, p[1] - 12); }
      panel(g, ['Trazos: ' + usadas.length + ' de 8', camino.length ? 'camino: ' + camino.join('-') : 'azules = grado impar'], 10, 10);
      if (usadas.length === 8) { lec.innerHTML = '✅ ¡Camino de Euler: ' + camino.join('-') + '!'; if (!c.__ok) { c.__ok = 1; R.evalua(1); if (c.__fin) c.__fin(); } }
      else if (camino.length > 1) { var u2 = camino[camino.length - 1], libres = E.filter(function (e, i) { return usadas.indexOf(i) < 0 && (e[0] === u2 || e[1] === u2); }).length; lec.innerHTML = libres ? 'Vas bien: desde ' + u2 + ' te quedan ' + libres + ' trazos posibles.' : '😬 Te quedaste sin salida en ' + u2 + '. Deshaz o empieza de nuevo (pista: arranca en un vértice azul).'; }
      else lec.innerHTML = 'Toca un vértice para empezar y luego los siguientes, uno a uno.';
    }
    L.redibuja = dib; dib();
  };

  /* =====================================================================
     Matemáticas discretas · el detector de igualdad
     ===================================================================== */
  W.detector = function (c, D) {
    var L = lienzoPx(c, 300), x = 0, y = 0, vistos = {};
    var lec = U.lectura(c), R = U.reto(c, 'Prueba las cuatro combinaciones de x e y tocando los interruptores.', false, function () { return true; }, '¡Tabla completa! f = xy + x′y′ vale 1 exactamente cuando x = y.'); R.el.__fin = c.__fin;
    L.c.style.cursor = 'pointer';
    L.c.addEventListener('click', function (e) { var r = L.c.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; if (px < 110) { if (py < L.h / 2) x = 1 - x; else y = 1 - y; dib(); } });
    function dib() {
      var g = L.g, w = L.w, h = L.h, nx = 1 - x, ny = 1 - y, a1 = x & y, a2 = nx & ny, f = a1 | a2; vistos[x + '' + y] = 1;
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1f3b2c'); gr.addColorStop(1, '#16291f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,.05)'; for (var q = 0; q < w; q += 16) { g.beginPath(); g.moveTo(q, 0); g.lineTo(q, h); g.stroke(); }
      var ON = '#ffd54a', OFF = '#5d7a68';
      function cable(pts, v) { g.strokeStyle = v ? ON : OFF; g.lineWidth = 3.5; g.lineJoin = 'round'; if (v) { g.shadowColor = 'rgba(255,213,74,.8)'; g.shadowBlur = 8; } g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.shadowBlur = 0; }
      var X = w / 720, yx = h * 0.25, yy = h * 0.75;
      function swtch(cy, v, nom) { g.fillStyle = '#2b3a33'; rr(g, 18, cy - 26, 80, 52, 10); g.fill(); g.fillStyle = v ? '#3ddc84' : '#c0392b'; rr(g, 26 + (v ? 30 : 0), cy - 16, 34, 32, 8); g.fill(); g.fillStyle = '#fff'; g.font = '600 14px system-ui'; g.textAlign = 'center'; g.fillText(nom + ' = ' + v, 58, cy + 44); }
      cable([[100, yx], [200 * X, yx], [200 * X, h * 0.2], [360 * X, h * 0.2]], x); cable([[200 * X, yx], [200 * X, h * 0.52], [235 * X, h * 0.52]], x);
      cable([[100, yy], [170 * X, yy], [170 * X, h * 0.32], [360 * X, h * 0.32]], y); cable([[170 * X, yy], [170 * X, h * 0.8], [235 * X, h * 0.8]], y);
      function NOT(cx, cy, vin) { g.fillStyle = '#e8eef0'; g.beginPath(); g.moveTo(cx, cy - 13); g.lineTo(cx + 26, cy); g.lineTo(cx, cy + 13); g.closePath(); g.fill(); g.beginPath(); g.arc(cx + 30, cy, 4, 0, 7); g.fill(); }
      cable([[269 * X, h * 0.52], [300 * X, h * 0.52], [300 * X, h * 0.66], [360 * X, h * 0.66]], nx); cable([[269 * X, h * 0.8], [360 * X, h * 0.8]], ny);
      NOT(235 * X, h * 0.52); NOT(235 * X, h * 0.8);
      function AND(cx, cy) { g.fillStyle = '#e8eef0'; g.beginPath(); g.moveTo(cx, cy - 24); g.lineTo(cx + 22, cy - 24); g.arc(cx + 22, cy, 24, -Math.PI / 2, Math.PI / 2); g.lineTo(cx, cy + 24); g.closePath(); g.fill(); g.fillStyle = '#2b3a33'; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('Y', cx + 20, cy + 4); }
      cable([[406 * X, h * 0.26], [460 * X, h * 0.26], [460 * X, h * 0.42], [500 * X, h * 0.42]], a1); cable([[406 * X, h * 0.73], [460 * X, h * 0.73], [460 * X, h * 0.58], [500 * X, h * 0.58]], a2);
      AND(360 * X, h * 0.26); AND(360 * X, h * 0.73);
      g.fillStyle = '#e8eef0'; g.beginPath(); g.moveTo(495 * X, h * 0.5 - 26); g.quadraticCurveTo(540 * X, h * 0.5 - 26, 560 * X, h * 0.5); g.quadraticCurveTo(540 * X, h * 0.5 + 26, 495 * X, h * 0.5 + 26); g.quadraticCurveTo(512 * X, h * 0.5, 495 * X, h * 0.5 - 26); g.fill();
      g.fillStyle = '#2b3a33'; g.font = '600 11px system-ui'; g.fillText('O', 525 * X, h * 0.5 + 4);
      cable([[560 * X, h * 0.5], [620 * X, h * 0.5]], f);
      var bx = 650 * X, by = h * 0.45; if (f) { var gl = g.createRadialGradient(bx, by, 4, bx, by, 70); gl.addColorStop(0, 'rgba(255,230,120,.9)'); gl.addColorStop(1, 'rgba(255,230,120,0)'); g.fillStyle = gl; g.beginPath(); g.arc(bx, by, 70, 0, 7); g.fill(); }
      var bg = g.createRadialGradient(bx - 6, by - 8, 2, bx, by, 24); bg.addColorStop(0, f ? '#fffbe0' : '#9aa5a0'); bg.addColorStop(1, f ? '#ffd54a' : '#56625d'); g.fillStyle = bg; g.beginPath(); g.arc(bx, by, 22, 0, 7); g.fill();
      g.fillStyle = '#8c949a'; g.fillRect(bx - 10, by + 18, 20, 14); g.strokeStyle = '#6b7378'; g.lineWidth = 1; for (q = 0; q < 3; q++) { g.beginPath(); g.moveTo(bx - 10, by + 22 + q * 4); g.lineTo(bx + 10, by + 22 + q * 4); g.stroke(); }
      swtch(yx, x, 'x'); swtch(yy, y, 'y');
      rotulo(g, 'xy = ' + a1, 360 * X + 22, h * 0.26 - 36, a1 ? ON : '#cfe0d6', 'center', 12, 'rgba(0,0,0,.35)'); rotulo(g, 'x′y′ = ' + a2, 360 * X + 22, h * 0.73 + 38, a2 ? ON : '#cfe0d6', 'center', 12, 'rgba(0,0,0,.35)');
      rotulo(g, 'f = ' + f, bx, by + 50, f ? ON : '#cfe0d6', 'center', 14, 'rgba(0,0,0,.35)');
      var n = Object.keys(vistos).length; lec.innerHTML = 'Toca los interruptores. f = xy + x′y′ · combinaciones probadas: <b>' + n + ' de 4</b> (' + Object.keys(vistos).sort().join(', ') + ')';
      if (n === 4 && !c.__ok) { c.__ok = 1; R.evalua(1); if (c.__fin) c.__fin(); }
    }
    L.redibuja = dib; dib();
  };

  /* =====================================================================
     Cónicas en 3D: el plano que corta el cono y la antena parabólica
     ===================================================================== */
  function camara3(L, cfg) {                           /* cámara orbital: arrastra para girar */
    var C = { yaw: cfg.yaw || -0.6, pitch: cfg.pitch || 0.32, esc: 1, cx: 0, cy: 0, arrastrando: false };
    var x0 = 0, y0 = 0, y00 = 0, p00 = 0;
    var gesto = null;                                  /* en el celular: arrastre horizontal gira; vertical deja bajar la página */
    function ini(e) { var p = e.touches ? e.touches[0] : e; C.arrastrando = true; gesto = e.touches ? null : 'girar'; x0 = p.clientX; y0 = p.clientY; y00 = C.yaw; p00 = C.pitch; }
    function mov(e) { if (!C.arrastrando) return; var p = e.touches ? e.touches[0] : e, dx = p.clientX - x0, dy = p.clientY - y0;
      if (!gesto) { if (Math.abs(dx) + Math.abs(dy) < 8) return; gesto = Math.abs(dx) > Math.abs(dy) ? 'girar' : 'pagina'; }
      if (gesto !== 'girar') return;
      C.yaw = y00 + dx * 0.01; if (!e.touches) C.pitch = Math.max(-0.2, Math.min(1.2, p00 + dy * 0.006)); if (e.cancelable) e.preventDefault(); if (L.redibuja) L.redibuja(); }
    function fin() { C.arrastrando = false; gesto = null; }
    L.c.style.cursor = 'grab'; L.c.style.touchAction = 'pan-y';
    L.c.addEventListener('mousedown', ini); window.addEventListener('mousemove', mov); window.addEventListener('mouseup', fin);
    L.c.addEventListener('touchstart', ini, { passive: true }); L.c.addEventListener('touchmove', mov, { passive: false }); L.c.addEventListener('touchend', fin);
    C.P = function (x, y, z) {                          /* z hacia arriba */
      var cy = Math.cos(C.yaw), sy = Math.sin(C.yaw), X = x * cy - y * sy, Y = x * sy + y * cy;
      var cp = Math.cos(C.pitch), sp = Math.sin(C.pitch), Z = z * cp - Y * sp, D = Y * cp + z * sp;
      return [C.cx + X * C.esc, C.cy - Z * C.esc, D];   /* D grande = más lejos */
    };
    C.vista = function () { var cy = Math.cos(C.yaw), sy = Math.sin(C.yaw), cp = Math.cos(C.pitch), sp = Math.sin(C.pitch); return [sy * cp, cy * cp, sp]; };  /* dirección hacia el fondo, en coordenadas del mundo */
    return C;
  }
  function poli3(g, pts, fill, stroke, lw) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } }
  function fondoEstudio(g, w, h) {
    var gr = g.createRadialGradient(w * 0.45, h * 0.35, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.8); gr.addColorStop(0, '#2c3e57'); gr.addColorStop(1, '#0d1522'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var r = azar(77); g.fillStyle = 'rgba(255,255,255,.5)'; for (var i = 0; i < 60; i++) { var s = r() * 1.3; g.globalAlpha = 0.2 + r() * 0.5; g.fillRect(r() * w, r() * h, s, s); } g.globalAlpha = 1;
  }

  W.conicas = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 520 : 400; }), ct = fila(c), C = camara3(L, { yaw: -0.7, pitch: 0.3 });
    var be = U.deslizador(ct, 'inclinación del plano', 0, 85, 0.5, 0, function (v) { return f2(v) + '°'; }), z0 = U.deslizador(ct, 'altura del corte', -0.8, 1.2, 0.01, 0.35, function (v) { return f2(v); });
    var ct2 = fila(c), anim = null;
    function para() { if (anim) cancelAnimationFrame(anim); anim = null; bA.textContent = '▶ Ver cómo nacen las cuatro'; }
    var bA = boton(ct2, '▶ Ver cómo nacen las cuatro', function () {
      if (anim) { para(); return; }
      bA.textContent = '⏸ Pausa'; var t0 = performance.now(), b0 = be.v >= 84 ? 0 : be.v;
      function paso(t) { var v = Math.min(85, b0 + (t - t0) / 1000 * 9); be.v = v; dib(); if (v < 85) anim = requestAnimationFrame(paso); else para(); }
      anim = requestAnimationFrame(paso); });
    [['○ circunferencia', 0], ['⬭ elipse', 35], ['∪ parábola', 60], [')( hipérbola', 78]].forEach(function (p) { boton(ct2, p[0], function () { para(); var a = be.v, t0 = performance.now(); (function paso(t) { var u = Math.min(1, (t - t0) / 600); u = u * u * (3 - 2 * u); be.v = a + (p[1] - a) * u; dib(); if (u < 1) requestAnimationFrame(paso); })(t0); }); });
    var lec = U.lectura(c), R = U.reto(c, 'El cono tiene generatrices a 60° de la horizontal. ¿Con qué inclinación del plano (en grados) aparece la parábola?', true, function (v) { return Math.abs(v - 60) < 0.6; },
      '¡Exacto! Con 60° el plano queda paralelo a una generatriz: nunca alcanza a cerrar la curva en ese manto, pero tampoco corta el otro. Por debajo sale elipse; por encima, hipérbola.'); R.el.__fin = c.__fin;
    var AL = 30 * Math.PI / 180, TA = Math.tan(AL), H = 1.7;
    function dib() {
      var g = L.g, w = L.w, h = L.h, mov = w < 560, beta = be.v * Math.PI / 180, zc = z0.v, sb = Math.sin(beta), cb = Math.cos(beta);
      fondoEstudio(g, w, h);
      var area = mov ? { x: 0, y: 0, w: w, h: h - 170 } : { x: 0, y: 0, w: w * 0.64, h: h };
      C.cx = area.x + area.w / 2; C.cy = area.y + area.h / 2 + 18; C.esc = Math.min(area.w, area.h) * 0.24;
      var V = C.vista(), luz = [0.4, -0.5, 0.75], nl = Math.hypot(luz[0], luz[1], luz[2]); luz = luz.map(function (q) { return q / nl; });
      /* caras del cono doble */
      var caras = [], NF = 40, NZ = 8;
      for (var s = -1; s <= 1; s += 2) for (var k = 0; k < NZ; k++) for (var i = 0; i < NF; i++) {
        var z1 = s * H * k / NZ, z2 = s * H * (k + 1) / NZ, f1 = i / NF * 6.2832, f2a = (i + 1) / NF * 6.2832, fm = (f1 + f2a) / 2;
        var pts = [[z1, f1], [z1, f2a], [z2, f2a], [z2, f1]].map(function (q) { var r = Math.abs(q[0]) * TA; return [r * Math.cos(q[1]), r * Math.sin(q[1]), q[0]]; });
        var n = [Math.cos(fm) * Math.cos(AL), Math.sin(fm) * Math.cos(AL), -s * Math.sin(AL)];   /* normal hacia afuera */
        var dz = (z1 + z2) / 2, rm = Math.abs(dz) * TA, cen = [rm * Math.cos(fm), rm * Math.sin(fm), dz];
        var pr = pts.map(function (q) { return C.P(q[0], q[1], q[2]); }), prof = C.P(cen[0], cen[1], cen[2])[2];
        var frente = (n[0] * V[0] + n[1] * V[1] + n[2] * V[2]) < 0, li = Math.max(0, n[0] * luz[0] + n[1] * luz[1] + n[2] * luz[2]);
        var lado = (cen[1] * sb + cen[2] * cb) - zc * cb;      /* de qué lado del plano está la cara */
        caras.push({ pr: pr, prof: prof, frente: frente, li: li, lado: lado, s: s });
      }
      caras.sort(function (a, b) { return b.prof - a.prof; });
      function pintaCara(cf, alfa) { var t = 0.35 + 0.65 * cf.li, base = cf.s > 0 ? [120, 170, 230] : [235, 160, 90];
        poli3(g, cf.pr, 'rgba(' + (base[0] * t | 0) + ',' + (base[1] * t | 0) + ',' + (base[2] * t | 0) + ',' + alfa + ')', 'rgba(255,255,255,' + alfa * 0.18 + ')', 0.6); }
      caras.forEach(function (cf) { if (!cf.frente) pintaCara(cf, 0.55); });
      /* plano de corte */
      var u = [1, 0, 0], v2 = [0, cb, -sb], P0 = [0, 0, zc], S = 2;
      var esq = [[-S, -S], [S, -S], [S, S], [-S, S]].map(function (q) { return C.P(P0[0] + u[0] * q[0] + v2[0] * q[1], P0[1] + u[1] * q[0] + v2[1] * q[1], P0[2] + u[2] * q[0] + v2[2] * q[1]); });
      var pg = g.createLinearGradient(esq[0][0], esq[0][1], esq[2][0], esq[2][1]); pg.addColorStop(0, 'rgba(255,230,140,.2)'); pg.addColorStop(1, 'rgba(255,200,90,.09)');
      poli3(g, esq, pg, 'rgba(255,225,150,.75)', 1.4);
      g.strokeStyle = 'rgba(255,225,150,.18)'; g.lineWidth = 1; for (var q = -S; q <= S; q += S / 5) { var a1 = C.P(u[0] * q, v2[1] * -S, zc + v2[2] * -S), a2 = C.P(u[0] * q, v2[1] * S, zc + v2[2] * S); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke(); }
      /* la curva de corte: t·(tanα·senφ·senβ + cosβ) = z0·cosβ */
      var tramos = [], act = [], N = 720;
      for (var j = 0; j <= N; j++) { var ph = j / N * 6.2832, den = TA * Math.sin(ph) * sb + cb, t = Math.abs(den) < 1e-9 ? 1e9 : zc * cb / den;
        if (Math.abs(t) <= H) { var r = Math.abs(t) * TA, p3 = [r * Math.cos(ph), r * Math.sin(ph), t]; act.push({ p3: p3, s: t >= 0 ? 1 : -1 }); } else if (act.length) { tramos.push(act); act = []; } }
      if (act.length) tramos.push(act);
      if (tramos.length > 1 && tramos[0][0].s === tramos[tramos.length - 1][0].s && Math.abs(tramos[0][0].p3[0] - tramos[tramos.length - 1][tramos[tramos.length - 1].length - 1].p3[0]) < 0.05) { tramos[0] = tramos.pop().concat(tramos[0]); }
      var tipo = Math.abs(zc) < 0.02 ? 'degenerada' : be.v < 0.6 ? 'circunferencia' : be.v < 59.4 ? 'elipse' : be.v <= 60.6 ? 'parábola' : 'hipérbola';
      var colC = { circunferencia: '#3ee0b0', elipse: '#6fb6ff', 'parábola': '#ffb347', 'hipérbola': '#ff6f91', degenerada: '#ffffff' }[tipo];
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = colC; g.shadowBlur = 14;
      tramos.forEach(function (tr) { g.strokeStyle = colC; g.lineWidth = 4; g.beginPath(); tr.forEach(function (o, k) { var pp = C.P(o.p3[0], o.p3[1], o.p3[2]); if (k) g.lineTo(pp[0], pp[1]); else g.moveTo(pp[0], pp[1]); }); g.stroke(); });
      g.restore();
      caras.forEach(function (cf) { if (cf.frente) pintaCara(cf, cf.lado > 0 ? 0.22 : 0.42); });
      var vt = C.P(0, 0, 0); g.fillStyle = '#fff'; g.beginPath(); g.arc(vt[0], vt[1], 3, 0, 7); g.fill();
      var ej1 = C.P(0, 0, -H - 0.15), ej2 = C.P(0, 0, H + 0.15); g.setLineDash([4, 5]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ej1[0], ej1[1]); g.lineTo(ej2[0], ej2[1]); g.stroke(); g.setLineDash([]);
      /* la curva vista de frente, en su propio plano */
      var bx = mov ? 14 : w * 0.66, by = mov ? h - 160 : 64, bw = mov ? w - 28 : w * 0.32, bh = mov ? 150 : h - 128;
      g.fillStyle = 'rgba(255,255,255,.07)'; rr(g, bx, by, bw, bh, 14); g.fill(); g.strokeStyle = 'rgba(255,255,255,.15)'; g.stroke();
      g.fillStyle = '#cfd8e3'; g.font = '600 12px system-ui'; g.textAlign = 'left'; g.fillText('así se ve el corte de frente', bx + 12, by + 20);
      var mxA = 0.4; tramos.forEach(function (tr) { tr.forEach(function (o) { var d = [o.p3[0] - P0[0], o.p3[1] - P0[1], o.p3[2] - P0[2]]; mxA = Math.max(mxA, Math.abs(d[0]), Math.abs(d[1] * v2[1] + d[2] * v2[2])); }); }); var kk = Math.min(bw - 30, bh - 60) / 2 / mxA, ox = bx + bw / 2, oy = by + 20 + (bh - 20) / 2;
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(bx + 8, oy); g.lineTo(bx + bw - 8, oy); g.moveTo(ox, by + 28); g.lineTo(ox, by + bh - 8); g.stroke();
      g.save(); g.beginPath(); g.rect(bx, by + 26, bw, bh - 28); g.clip(); g.shadowColor = colC; g.shadowBlur = 10; g.strokeStyle = colC; g.lineWidth = 3; g.lineCap = 'round';
      tramos.forEach(function (tr) { g.beginPath(); tr.forEach(function (o, k) { var d = [o.p3[0] - P0[0], o.p3[1] - P0[1], o.p3[2] - P0[2]], a = d[0], b2 = d[1] * v2[1] + d[2] * v2[2], X = ox + a * kk, Y = oy + b2 * kk; if (k) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); });
      g.restore();
      var nom = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      g.font = '700 ' + (mov ? 20 : 24) + 'px system-ui'; g.fillStyle = colC; g.textAlign = 'center'; g.save(); g.shadowColor = colC; g.shadowBlur = 12; g.fillText(nom, mov ? w / 2 : area.w / 2, 34); g.restore();
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('arrastra para girar el cono', mov ? w / 2 : area.w / 2, mov ? area.h - 6 : h - 14);
      var expl = { circunferencia: 'El plano es perpendicular al eje: todos los puntos quedan a la misma distancia del eje.', elipse: 'El plano se inclina menos que las generatrices (menos de 60°): corta un solo manto y la curva se cierra.', 'parábola': 'El plano es paralelo a una generatriz (60°): la curva se abre y nunca se cierra.', 'hipérbola': 'El plano se inclina más que las generatrices: corta los dos mantos y salen dos ramas.', degenerada: 'El plano pasa por el vértice: sale un punto, una recta o dos rectas (cónica degenerada).' }[tipo];
      lec.innerHTML = '<b>' + nom + '</b> · inclinación ' + f2(Math.round(be.v * 10) / 10) + '° (las generatrices están a 60°). ' + expl;
    }
    [be, z0].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  W.parabolica = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 430 : 400; }), ct = fila(c), C = camara3(L, { yaw: -0.9, pitch: 0.22 });
    var modo = D.modo || 'antena', rad = 0.3;               /* metros */
    var pr = U.deslizador(ct, 'profundidad del plato', 0.04, 0.18, 0.005, 0.1, function (v) { return Math.round(v * 100) + ' cm'; });
    var ct2 = fila(c), bts = {};
    [['antena', '📡 Antena'], ['faro', '🚗 Faro de carro'], ['telescopio', '🔭 Telescopio']].forEach(function (m) { bts[m[0]] = boton(ct2, m[1], function () { modo = m[0]; marca(); fotones = []; }); });
    function marca() { Object.keys(bts).forEach(function (k) { bts[k].style.outline = k === modo ? '2px solid #f5b82e' : ''; }); }
    var lec = U.lectura(c), R = U.reto(c, 'El plato mide 60 cm de diámetro y 10 cm de profundidad. ¿A cuántos cm del fondo va el receptor? (pista: x² = 4py)', true, function (v) { return Math.abs(v - 22.5) < 0.1; },
      '¡Perfecto! En el borde x = 30 y y = 10: 900 = 4p·10, así que p = 22,5 cm. Ahí, en el foco, se juntan todas las señales.'); R.el.__fin = c.__fin;
    var fotones = [], rnd = azar(5), ult = performance.now(), vivo = false;
    function nuevo(p) {
      var a = rnd() * 6.2832, r0 = Math.sqrt(0.15 + rnd() * 0.85) * rad * 0.93, x = r0 * Math.cos(a), y = r0 * Math.sin(a), zb = (x * x + y * y) / (4 * p);
      return { x: x, y: y, zb: zb, t: 0, v: 0.55 + rnd() * 0.25 };
    }
    function dib(now) {
      now = now || performance.now(); var dt = Math.min(0.05, (now - ult) / 1000); ult = now;
      var g = L.g, w = L.w, h = L.h, d = pr.v, p = rad * rad / (4 * d), F = [0, 0, p];
      fondoEstudio(g, w, h); if (modo === 'faro') { var fg = g.createLinearGradient(0, 0, w, 0); fg.addColorStop(0, 'rgba(255,240,190,0)'); fg.addColorStop(1, 'rgba(255,240,190,.08)'); g.fillStyle = fg; g.fillRect(0, 0, w, h); }
      C.cx = w * 0.5; C.cy = h * 0.62; C.esc = Math.min(w, h) * 1.45;
      if (modo === 'antena') { var sx = w * 0.16, sy = 46; g.save(); g.translate(sx, sy); g.rotate(-0.4); var pn = g.createLinearGradient(-40, 0, 40, 0); pn.addColorStop(0, '#1d3f7a'); pn.addColorStop(1, '#3d6fc4'); g.fillStyle = pn; g.fillRect(-46, -7, 30, 14); g.fillRect(16, -7, 30, 14); g.strokeStyle = 'rgba(255,255,255,.3)'; for (var pq = -42; pq < 46; pq += 6) { if (pq > -16 && pq < 16) continue; g.beginPath(); g.moveTo(pq, -7); g.lineTo(pq, 7); g.stroke(); }
        metalH(g, -12, -9, 24, 18, '#d4af37'); g.fillStyle = '#ddd'; g.beginPath(); g.arc(0, 12, 5, 0, Math.PI); g.fill(); g.restore(); rotulo(g, 'satélite', sx, sy + 26, '#cfe6ff', 'center', 11, false); }
      if (modo === 'telescopio') { var st = g.createRadialGradient(w * 0.2, 40, 1, w * 0.2, 40, 22); st.addColorStop(0, 'rgba(255,255,255,1)'); st.addColorStop(0.2, 'rgba(200,220,255,.8)'); st.addColorStop(1, 'rgba(200,220,255,0)'); g.fillStyle = st; g.beginPath(); g.arc(w * 0.2, 40, 22, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.moveTo(w * 0.2 - 16, 40); g.lineTo(w * 0.2 + 16, 40); g.moveTo(w * 0.2, 24); g.lineTo(w * 0.2, 56); g.stroke(); rotulo(g, 'estrella lejana', w * 0.2, 72, '#dfe8ff', 'center', 11, false); }
      var V = C.vista(), luz = [0.35, -0.55, 0.76];
      /* el plato (paraboloide z = (x²+y²)/(4p)) como malla */
      var caras = [], NR = 10, NF = 44;
      for (var i = 0; i < NR; i++) for (var k = 0; k < NF; k++) {
        var r1 = rad * i / NR, r2 = rad * (i + 1) / NR, f1 = k / NF * 6.2832, f2a = (k + 1) / NF * 6.2832, rm = (r1 + r2) / 2, fm = (f1 + f2a) / 2;
        var pts = [[r1, f1], [r1, f2a], [r2, f2a], [r2, f1]].map(function (q) { return [q[0] * Math.cos(q[1]), q[0] * Math.sin(q[1]), q[0] * q[0] / (4 * p)]; });
        var n = [-rm / (2 * p) * Math.cos(fm), -rm / (2 * p) * Math.sin(fm), 1], nn = Math.hypot(n[0], n[1], n[2]); n = n.map(function (q) { return q / nn; });
        var cen = [rm * Math.cos(fm), rm * Math.sin(fm), rm * rm / (4 * p)], vis = n[0] * V[0] + n[1] * V[1] + n[2] * V[2] < 0;
        var li = Math.abs(n[0] * luz[0] + n[1] * luz[1] + n[2] * luz[2]), esp = Math.pow(Math.max(0, li), 18);
        caras.push({ pr: pts.map(function (q) { return C.P(q[0], q[1], q[2]); }), prof: C.P(cen[0], cen[1], cen[2])[2], li: li, esp: esp, dentro: vis });
      }
      caras.sort(function (a, b) { return b.prof - a.prof; });
      var tono = modo === 'faro' ? [235, 238, 245] : modo === 'telescopio' ? [205, 215, 230] : [200, 205, 212];
      var ped = C.P(0, 0, -0.02), suelo = C.P(0, 0, -0.42);
      if (modo === 'antena') { g.strokeStyle = '#5b636c'; g.lineWidth = 7; g.beginPath(); g.moveTo(ped[0], ped[1]); g.lineTo(suelo[0], suelo[1]); g.stroke(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(suelo[0], suelo[1] + 2, 40, 9, 0, 0, 7); g.fill(); }
      caras.forEach(function (cf) { var t = 0.32 + 0.68 * cf.li + (cf.dentro ? 0.08 : -0.1), c0 = tono.map(function (q) { return Math.min(255, q * t + 255 * cf.esp * 0.8) | 0; });
        poli3(g, cf.pr, 'rgb(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ')', 'rgba(0,0,0,.12)', 0.6); });
      var bo = []; for (var k2 = 0; k2 <= 60; k2++) { var a = k2 / 60 * 6.2832; bo.push(C.P(rad * Math.cos(a), rad * Math.sin(a), d)); } g.strokeStyle = '#3d454e'; g.lineWidth = 2.5; g.beginPath(); bo.forEach(function (q, k) { if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
      /* brazo y receptor o bombilla en el foco */
      var Fp = C.P(F[0], F[1], F[2]);
      if (modo !== 'faro') { [0, 2.094, 4.189].forEach(function (a) { var b = C.P(rad * 0.98 * Math.cos(a), rad * 0.98 * Math.sin(a), d); g.strokeStyle = '#4a5159'; g.lineWidth = 2; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(Fp[0], Fp[1]); g.stroke(); }); }
      fotones.forEach(function (o) { o.t += dt * o.v; });
      while (fotones.length < 80) { var nf = nuevo(p); nf.t = fotones.length > 0 && rnd() < 0.5 ? rnd() * 1.6 : 0; fotones.push(nf); }
      fotones = fotones.filter(function (o) { return o.t < 1.75; });
      var top = Math.max(d, p) + 0.35;
      g.save(); g.globalCompositeOperation = 'lighter';
      fotones.forEach(function (o) {
        var B = [o.x, o.y, o.zb], dF = Math.hypot(B[0] - F[0], B[1] - F[1], B[2] - F[2]), L1 = top - o.zb, s = o.t * (L1 + dF), pos, cola;
        var col = modo === 'faro' ? '255,236,160' : modo === 'telescopio' ? '190,210,255' : '120,255,190';
        if (modo === 'faro') {                                  /* sale del foco, rebota y sale paralelo */
          if (s < dF) { var u = s / dF; pos = [F[0] + (B[0] - F[0]) * u, F[1] + (B[1] - F[1]) * u, F[2] + (B[2] - F[2]) * u]; }
          else pos = [B[0], B[1], B[2] + (s - dF)];
        } else {                                                 /* llega paralelo, rebota y va al foco */
          if (s < L1) pos = [B[0], B[1], top - s];
          else { var u2 = Math.min(1, (s - L1) / dF); pos = [B[0] + (F[0] - B[0]) * u2, B[1] + (F[1] - B[1]) * u2, B[2] + (F[2] - B[2]) * u2]; }
        }
        var s2 = Math.max(0, s - 0.13), pos2;
        if (modo === 'faro') pos2 = s2 < dF ? [F[0] + (B[0] - F[0]) * s2 / dF, F[1] + (B[1] - F[1]) * s2 / dF, F[2] + (B[2] - F[2]) * s2 / dF] : [B[0], B[1], B[2] + (s2 - dF)];
        else pos2 = s2 < L1 ? [B[0], B[1], top - s2] : [B[0] + (F[0] - B[0]) * Math.min(1, (s2 - L1) / dF), B[1] + (F[1] - B[1]) * Math.min(1, (s2 - L1) / dF), B[2] + (F[2] - B[2]) * Math.min(1, (s2 - L1) / dF)];
        var a = C.P(pos[0], pos[1], pos[2]), b = C.P(pos2[0], pos2[1], pos2[2]), fade = Math.min(1, o.t * 5) * Math.min(1, (1.75 - o.t) * 4);
        var gr = g.createLinearGradient(b[0], b[1], a[0], a[1]); gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(1, 'rgba(' + col + ',' + 0.9 * fade + ')');
        g.strokeStyle = gr; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(a[0], a[1]); g.stroke();
        g.fillStyle = 'rgba(' + col + ',' + fade + ')'; g.beginPath(); g.arc(a[0], a[1], 2.2, 0, 7); g.fill();
      });
      g.restore();
      var brillo = modo === 'faro' ? 1 : 0.55 + 0.45 * Math.sin(now / 180);
      var hal = g.createRadialGradient(Fp[0], Fp[1], 1, Fp[0], Fp[1], modo === 'faro' ? 46 : 26); var cf = modo === 'faro' ? '255,240,180' : modo === 'telescopio' ? '190,210,255' : '120,255,190';
      hal.addColorStop(0, 'rgba(' + cf + ',' + 0.95 * brillo + ')'); hal.addColorStop(1, 'rgba(' + cf + ',0)'); g.fillStyle = hal; g.beginPath(); g.arc(Fp[0], Fp[1], 46, 0, 7); g.fill();
      if (modo === 'antena') { g.fillStyle = '#2d333a'; rr(g, Fp[0] - 7, Fp[1] - 6, 14, 12, 3); g.fill(); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(Fp[0], Fp[1] + 1, 2.3, 0, 7); g.fill(); }
      else if (modo === 'telescopio') { g.fillStyle = '#d6dbe1'; g.beginPath(); g.ellipse(Fp[0], Fp[1], 8, 4, 0.5, 0, 7); g.fill(); }
      else { g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(Fp[0], Fp[1], 5, 0, 7); g.fill(); }
      rotulo(g, 'F (foco) a ' + f2(Math.round(p * 1000) / 10) + ' cm del fondo', Fp[0] + 16, Fp[1] - 16, '#1f2a36', 'left', 12);
      var txt = { antena: 'La señal del satélite llega en rayos paralelos y todos rebotan hacia el receptor del foco.', faro: 'La bombilla está en el foco: la luz rebota y sale en un haz paralelo que alumbra lejos.', telescopio: 'La luz de una estrella llega paralela y el espejo la junta en el foco, donde se forma la imagen.' }[modo];
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.6)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      lec.innerHTML = txt + ' Con x² = 4py y el borde en (30, ' + Math.round(d * 100) + '): <b>p = 30²/(4·' + Math.round(d * 100) + ') = ' + f2(Math.round(p * 1000) / 10) + ' cm</b>.';
    }
    function loop(t) { if (!vivo) return; dib(t); requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window && !sinAnim()) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !vivo) { vivo = true; ult = performance.now(); requestAnimationFrame(loop); } else if (!v) vivo = false; }).observe(L.c);
    pr.inp.addEventListener('input', function () { fotones = []; dib(); }); L.redibuja = function () { dib(); }; marca(); dib();
  };

  /* =====================================================================
     Elipse e hipérbola en 3D, con aparatos y lugares de la vida real
     ===================================================================== */
  function animador(L, dib) {                           /* bucle que solo corre cuando el lienzo se ve */
    var vivo = false, ult = performance.now();
    function loop(t) { if (!vivo) return; var dt = Math.min(0.05, (t - ult) / 1000); ult = t; dib(dt, t); requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window && !sinAnim()) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !vivo) { vivo = true; ult = performance.now(); requestAnimationFrame(loop); } else if (!v) vivo = false; }).observe(L.c);
    L.redibuja = function () { dib(0, performance.now()); };
  }
  function linea3(g, C, a, b, col, lw) { var p = C.P(a[0], a[1], a[2]), q = C.P(b[0], b[1], b[2]); g.strokeStyle = col; g.lineWidth = lw || 1; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  function brillo3(g, C, p, r, col, a) { var q = C.P(p[0], p[1], p[2]), gr = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); gr.addColorStop(0, 'rgba(' + col + ',' + (a == null ? 1 : a) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fill(); return q; }
  function botonesModo(c, lista, ini, fn) {
    var ct = fila(c), bts = {}, actual = ini;
    function marca() { Object.keys(bts).forEach(function (k) { bts[k].style.outline = k === actual ? '2px solid #f5b82e' : ''; }); }
    lista.forEach(function (m) { bts[m[0]] = boton(ct, m[1], function () { actual = m[0]; marca(); fn(m[0]); }); }); marca(); return ct;
  }

  /* ---------------------------------------------------------------------
     La elipse: sala de los susurros, litotricia y órbita de un planeta
     --------------------------------------------------------------------- */
  W.elipse3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 440 : 420; }), C = camara3(L, { yaw: -0.5, pitch: 0.42 }), modo = 'susurros';
    botonesModo(c, [['susurros', '🗣️ Sala de los susurros'], ['lito', '💎 Romper cálculos (litotricia)'], ['planeta', '🪐 Órbita de un planeta']], modo, function (m) { modo = m; part = []; frag = 0; tiempo = 0; rastro = []; });
    var ct = fila(c), ex = U.deslizador(ct, 'excentricidad e', 0.2, 0.9, 0.01, 0.6, function (v) { return f2(v); });
    var lec = U.lectura(c), R = U.reto(c, 'Una sala elíptica mide 30 m de largo y 18 m de ancho. ¿A cuántos metros del centro deben pararse los dos amigos para oírse en secreto?', true, function (v) { return Math.abs(v - 12) < 0.05; },
      '¡Así es! a = 15, b = 9 y c = √(15² − 9²) = 12 m: cada uno en un foco, y todo lo que uno susurre rebota en la pared y llega al otro.'); R.el.__fin = c.__fin;
    var part = [], rnd = azar(9), frag = 0, tiempo = 0, rastro = [], llega = 0;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, e = ex.v, a = 1, b = Math.sqrt(1 - e * e), cc = e, F1 = [-cc, 0, 0], F2 = [cc, 0, 0];
      fondoEstudio(g, w, h); tiempo += dt;
      C.cx = w / 2; C.cy = h * (modo === 'planeta' ? 0.52 : modo === 'lito' ? 0.42 : 0.6); C.esc = Math.min(w * (w < 560 ? 0.46 : 0.38), h * 0.62);
      var V = C.vista(), luz = [0.3, -0.5, 0.8];
      if (modo === 'planeta') { planeta(g, w, h, a, b, cc, e, dt, now); return; }
      var arriba = modo === 'susurros';                                  /* sala: cúpula arriba · litotricia: tazón abajo */
      var sg = arriba ? 1 : -1, caras = [], NU = 26, NV = 12, v0 = arriba ? -0.62 : 0, v1x = arriba ? Math.PI + 0.62 : Math.PI;
      for (var i = 0; i < NU; i++) for (var j = 0; j < NV; j++) {
        var u1 = i / NU * Math.PI, u2 = (i + 1) / NU * Math.PI, v1 = v0 + j / NV * (v1x - v0), v2 = v0 + (j + 1) / NV * (v1x - v0), um = (u1 + u2) / 2, vm = (v1 + v2) / 2;
        var S = function (u, v) { return [a * Math.cos(u), b * Math.sin(u) * Math.cos(v), sg * b * Math.sin(u) * Math.sin(v)]; };
        var pts = [S(u1, v1), S(u2, v1), S(u2, v2), S(u1, v2)], cen = S(um, vm), n = [cen[0] / (a * a), cen[1] / (b * b), cen[2] / (b * b)], nn = Math.hypot(n[0], n[1], n[2]); n = n.map(function (q) { return q / nn; });
        caras.push({ pr: pts.map(function (q) { return C.P(q[0], q[1], q[2]); }), prof: C.P(cen[0], cen[1], cen[2])[2], li: Math.abs(n[0] * luz[0] + n[1] * luz[1] + n[2] * luz[2]), frente: n[0] * V[0] + n[1] * V[1] + n[2] * V[2] < 0 });
      }
      caras.sort(function (p, q) { return q.prof - p.prof; });
      /* piso de la sala (o colchón de agua de la litotricia) */
      var piso = [], sv = Math.sin(-0.62), cv = Math.cos(-0.62); for (var k = 0; k <= 64; k++) { var t = k / 64 * 6.2832; piso.push(arriba ? C.P(a * Math.cos(t), b * Math.sin(t) * cv, b * Math.abs(Math.sin(t)) * sv) : C.P(a * Math.cos(t), b * Math.sin(t), 0)); }
      var pg = g.createLinearGradient(piso[16][0], piso[16][1], piso[48][0], piso[48][1]);
      if (arriba) { pg.addColorStop(0, '#8a6a4a'); pg.addColorStop(1, '#c9a477'); } else { pg.addColorStop(0, 'rgba(90,170,220,.45)'); pg.addColorStop(1, 'rgba(160,215,245,.35)'); }
      poli3(g, piso, pg, arriba ? '#5d4630' : 'rgba(200,235,255,.6)', 1.5);
      if (arriba) { g.save(); g.beginPath(); piso.forEach(function (q, k) { if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.clip(); g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 1; for (var x = -1; x <= 1; x += 0.1) linea3(g, C, [x, -1, 0], [x, 1, 0], 'rgba(60,40,20,.22)', 1); g.restore(); }
      var tono = arriba ? [230, 222, 205] : [205, 212, 222], al = arriba ? 0.35 : 0.9;
      function pinta(cf) { var t = 0.45 + 0.55 * cf.li; poli3(g, cf.pr, 'rgba(' + (tono[0] * t | 0) + ',' + (tono[1] * t | 0) + ',' + (tono[2] * t | 0) + ',' + (cf.frente ? al * 0.55 : al) + ')', 'rgba(120,100,80,' + (arriba ? 0.25 : 0.15) + ')', 0.6); }
      caras.forEach(function (cf) { if (!cf.frente) pinta(cf); });
      /* las ondas: de F1 rebotan en la pared y llegan a F2 */
      if (part.length < 90 && rnd() < 0.9) { for (var q = 0; q < 3; q++) {
        var th = rnd() * 6.2832, ph = Math.acos(rnd()) , d = [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), sg * Math.cos(ph)];
        var A2 = d[0] * d[0] / (a * a) + (d[1] * d[1] + d[2] * d[2]) / (b * b), B2 = 2 * F1[0] * d[0] / (a * a), C2 = F1[0] * F1[0] / (a * a) - 1, tt = (-B2 + Math.sqrt(B2 * B2 - 4 * A2 * C2)) / (2 * A2);
        var P = [F1[0] + d[0] * tt, d[1] * tt, d[2] * tt]; part.push({ P: P, l1: tt, l2: Math.hypot(F2[0] - P[0], P[1], P[2]), s: 0 }); } }
      g.save(); g.globalCompositeOperation = 'lighter'; var col = arriba ? '255,220,120' : '120,220,255';
      part.forEach(function (o) { o.s += dt * 1.3; var s = o.s, pos, tot = o.l1 + o.l2;
        function en(s) { return s < o.l1 ? [F1[0] + (o.P[0] - F1[0]) * s / o.l1, o.P[1] * s / o.l1, o.P[2] * s / o.l1] : [o.P[0] + (F2[0] - o.P[0]) * Math.min(1, (s - o.l1) / o.l2), o.P[1] * (1 - Math.min(1, (s - o.l1) / o.l2)), o.P[2] * (1 - Math.min(1, (s - o.l1) / o.l2))]; }
        pos = en(s); var pos2 = en(Math.max(0, s - 0.16)), p1 = C.P(pos[0], pos[1], pos[2]), p2 = C.P(pos2[0], pos2[1], pos2[2]), fa = Math.min(1, s * 6) * (s > tot ? 0 : 1);
        var gr = g.createLinearGradient(p2[0], p2[1], p1[0], p1[1]); gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(1, 'rgba(' + col + ',' + 0.85 * fa + ')'); g.strokeStyle = gr; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(p2[0], p2[1]); g.lineTo(p1[0], p1[1]); g.stroke();
        if (s >= tot && !o.cuenta) { o.cuenta = 1; llega++; } });
      part = part.filter(function (o) { return o.s < o.l1 + o.l2 + 0.05; });
      g.restore();
      caras.forEach(function (cf) { if (cf.frente) pinta(cf); });
      var pul = 0.6 + 0.4 * Math.sin(now / 160);
      if (arriba) {
        [[F1, '#c0392b', 'habla'], [F2, '#2f6fa3', 'oye']].forEach(function (f, k) { var p = C.P(f[0][0], 0, 0), pie = C.P(f[0][0], 0, -0.58 * b * Math.sin(Math.acos(Math.min(1, Math.abs(f[0][0]) / a)))), alto = Math.max(20, (pie[1] - p[1]) * 1.08); persona(g, pie[0], pie[1], alto, f[1], 0.3); brillo3(g, C, f[0], 22 * (k ? pul : 1), k ? '120,200,255' : '255,190,90', 0.8); rotulo(g, (k ? 'F₂ · ' : 'F₁ · ') + f[2], pie[0], pie[1] + 14, '#1f2a36', 'center', 12); });
        var tx = 'El susurro sale de F₁ en todas las direcciones, rebota en la cúpula y llega completo a F₂. Los de la mitad no oyen nada.';
      } else {
        var e1 = C.P(F1[0], 0, 0); g.fillStyle = '#3a4048'; rr(g, e1[0] - 9, e1[1] - 6, 18, 12, 3); g.fill(); brillo3(g, C, F1, 26 * pul, '160,230,255', 0.95);
        frag = Math.min(1, frag + dt * 0.04); var p2 = C.P(F2[0], 0, 0), rr0 = 9 * (1 - frag * 0.6), rk = azar(3);
        brillo3(g, C, F2, 30 * pul, '255,255,255', 0.5);
        if (frag < 0.98) { g.fillStyle = '#d9b44a'; g.beginPath(); for (var q2 = 0; q2 < 9; q2++) { var an = q2 / 9 * 6.2832, rq = rr0 * (0.75 + rk() * 0.4); g.lineTo(p2[0] + Math.cos(an) * rq, p2[1] + Math.sin(an) * rq); } g.closePath(); g.fill(); g.strokeStyle = '#8a6a1a'; g.lineWidth = 1; g.stroke(); }
        g.fillStyle = '#e8c75a'; for (var q3 = 0; q3 < Math.round(frag * 30); q3++) { var an2 = rk() * 6.2832, dd = (6 + rk() * 22) * frag; g.beginPath(); g.arc(p2[0] + Math.cos(an2) * dd, p2[1] + Math.sin(an2) * dd, 1.2 + rk() * 1.5, 0, 7); g.fill(); }
        rotulo(g, 'F₁ · emisor de ondas', e1[0], e1[1] + 20, '#1f2a36', 'center', 12); rotulo(g, 'F₂ · cálculo renal ' + (frag < 0.98 ? '(' + Math.round(frag * 100) + ' % roto)' : '¡pulverizado!'), p2[0], p2[1] - 22, '#1f2a36', 'center', 12);
        if (frag >= 1) frag = 0;
        var tx = 'El aparato tiene forma de media elipsoide: las ondas de choque nacen en F₁, rebotan y se concentran en F₂, justo donde está el cálculo. Así se rompe sin cirugía.';
      }
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      lec.innerHTML = tx + ' Aquí a = 1, b = √(1 − e²) = ' + f2(Math.round(b * 1000) / 1000) + ' y los focos están en ±c = ±' + f2(Math.round(cc * 1000) / 1000) + ' (c = a·e).';
    }
    function planeta(g, w, h, a, b, cc, e, dt, now) {
      var T = 9, Pf = [cc, 0, 0];                                   /* el Sol en el foco derecho */
      tiempo = tiempo % T; var M = 6.2832 * tiempo / T, E = M; for (var k = 0; k < 8; k++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      var pos = function (EE) { return [a * Math.cos(EE), b * Math.sin(EE), 0]; }, p = pos(E);
      var orb = []; for (var q = 0; q <= 120; q++) orb.push(pos(q / 120 * 6.2832));
      /* barridos de áreas iguales en tiempos iguales */
      var nS = 6; for (var s2 = 0; s2 < nS; s2++) { var M1 = 6.2832 * s2 / nS, M2 = 6.2832 * (s2 + 0.5) / nS, E1 = M1, E2 = M2; for (var k2 = 0; k2 < 8; k2++) { E1 = E1 - (E1 - e * Math.sin(E1) - M1) / (1 - e * Math.cos(E1)); E2 = E2 - (E2 - e * Math.sin(E2) - M2) / (1 - e * Math.cos(E2)); }
        var sec = [C.P(Pf[0], 0, 0)]; for (var q2 = 0; q2 <= 16; q2++) { var pp = pos(E1 + (E2 - E1) * q2 / 16); sec.push(C.P(pp[0], pp[1], 0)); } poli3(g, sec, 'rgba(120,180,255,.13)', 'rgba(120,180,255,.25)', 0.8); }
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.4; g.setLineDash([5, 5]); g.beginPath(); orb.forEach(function (o, k) { var q3 = C.P(o[0], o[1], 0); if (k) g.lineTo(q3[0], q3[1]); else g.moveTo(q3[0], q3[1]); }); g.stroke(); g.setLineDash([]);
      var F1p = C.P(-cc, 0, 0); g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(F1p[0], F1p[1], 3, 0, 7); g.stroke(); rotulo(g, 'otro foco (vacío)', F1p[0], F1p[1] + 16, '#cfd8e3', 'center', 11, false);
      rastro.push(p); if (rastro.length > 40) rastro.shift();
      rastro.forEach(function (r, k) { var q4 = C.P(r[0], r[1], 0); g.fillStyle = 'rgba(140,200,255,' + (k / 40 * 0.5) + ')'; g.beginPath(); g.arc(q4[0], q4[1], 2.2, 0, 7); g.fill(); });
      var sp = brillo3(g, C, Pf, 60, '255,200,80', 0.9); var sg = g.createRadialGradient(sp[0] - 4, sp[1] - 4, 2, sp[0], sp[1], 16); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(1, '#ffb020'); g.fillStyle = sg; g.beginPath(); g.arc(sp[0], sp[1], 14, 0, 7); g.fill();
      var pl = C.P(p[0], p[1], 0); var lg = g.createRadialGradient(pl[0] - (pl[0] - sp[0]) * 0.03 - 3, pl[1] - 3, 1, pl[0], pl[1], 10); lg.addColorStop(0, '#bfe3ff'); lg.addColorStop(0.6, '#2f7fd0'); lg.addColorStop(1, '#0b2a50'); g.fillStyle = lg; g.beginPath(); g.arc(pl[0], pl[1], 9, 0, 7); g.fill();
      var r = Math.hypot(p[0] - cc, p[1]), v = Math.sqrt(2 / r - 1 / a), vmin = Math.sqrt(2 / (a + cc) - 1 / a);
      rotulo(g, 'velocidad × ' + f2(Math.round(v / vmin * 100) / 100), pl[0] + 14, pl[1] - 14, '#1f2a36', 'left', 12); rotulo(g, 'Sol (foco)', sp[0], sp[1] + 26, '#1f2a36', 'center', 12);
      tiempo += 0;
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText(w < 560 ? 'cada gajo azul: mismo tiempo' : 'arrastra para girar · cada gajo azul se barre en el mismo tiempo', w / 2, h - 10);
      lec.innerHTML = 'Kepler: los planetas giran en elipses con el Sol en un foco. Cerca del Sol (perihelio) van más rápido y lejos más despacio: los gajos azules tienen la misma área porque se barren en el mismo tiempo. La Tierra tiene e ≈ 0,017 (casi un círculo); el cometa Halley, e ≈ 0,97.';
    }
    ex.inp.addEventListener('input', function () { part = []; L.redibuja(); }); animador(L, dib); L.redibuja();
  };

  /* ---------------------------------------------------------------------
     La hipérbola: torres de enfriamiento y ubicar un celular con dos antenas
     --------------------------------------------------------------------- */
  W.hiperbola3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 460 : 420; }), C = camara3(L, { yaw: -0.4, pitch: 0.25 }), modo = 'torre';
    var ctTorre, ctGps;
    botonesModo(c, [['torre', '🏭 Torre de enfriamiento'], ['gps', '📱 Ubicar un celular']], modo, function (m) { modo = m; C.pitch = m === 'gps' ? 0.75 : 0.25; ctTorre.style.display = m === 'torre' ? '' : 'none'; ctGps.style.display = m === 'gps' ? '' : 'none'; puntos = []; ondaT = 0; });
    ctTorre = fila(c); var gi = U.deslizador(ctTorre, 'giro de las varillas', 0, 160, 1, 110, function (v) { return Math.round(v) + '°'; });
    var bConstr = boton(ctTorre, '▶ Construirla varilla por varilla', function () { cuantas = 0; construyendo = true; });
    ctGps = fila(c); ctGps.style.display = 'none'; var dd = U.deslizador(ctGps, 'la señal llega antes a A por', -8, 8, 0.1, 6, function (v) { return f2(v) + ' km'; });
    var lec = U.lectura(c), R = U.reto(c, 'Las antenas A y B están a 10 km. La señal del celular llega a A 6 km «antes» que a B (|PB − PA| = 6). En x²/a² − y²/b² = 1, ¿cuánto vale b?', true, function (v) { return Math.abs(v - 4) < 0.01; },
      '¡Perfecto! 2a = 6 y 2c = 10, así que a = 3, c = 5 y b = √(25 − 9) = 4. El celular está sobre la hipérbola x²/9 − y²/16 = 1; con una tercera antena se cruzan dos hipérbolas y queda ubicado.'); R.el.__fin = c.__fin;
    var cuantas = 60, construyendo = false, vapor = [], rnd = azar(4), puntos = [], ondaT = 0;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h; fondoEstudio(g, w, h);
      if (modo === 'gps') return gps(g, w, h, dt, now);
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#6fa8d6'); cie.addColorStop(0.7, '#dbe9f0'); cie.addColorStop(1, '#e9e2cf'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.56; C.esc = Math.min(w * 0.42, h * 0.38);
      var Rb = 1, Hh = 1.15, phi = gi.v * Math.PI / 180, r0 = Rb * Math.cos(phi / 2), N = 60;
      var suelo = []; for (var k = 0; k <= 48; k++) { var t = k / 48 * 6.2832; suelo.push(C.P(2.4 * Math.cos(t), 2.4 * Math.sin(t), -Hh)); } var sgd = g.createRadialGradient(C.cx, C.cy + C.esc * 0.8, 10, C.cx, C.cy + C.esc * 0.8, C.esc * 2.2); sgd.addColorStop(0, '#9bbf7d'); sgd.addColorStop(1, '#6f9a58'); poli3(g, suelo, sgd);
      var sh = C.P(0.25, 0.25, -Hh); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sh[0], sh[1], C.esc * 1.05, C.esc * 0.3, 0, 0, 7); g.fill();
      if (construyendo) { cuantas = Math.min(N, cuantas + dt * 14); if (cuantas >= N) construyendo = false; }
      var V = C.vista(), luz = [0.5, -0.6, 0.6];
      /* superficie (concreto) cuando ya está construida */
      var lleno = Math.max(0, Math.min(1, (cuantas - N * 0.8) / (N * 0.2)));
      var caras = [], NZ = 14, NF = 40;
      for (var i = 0; i < NZ; i++) for (var j = 0; j < NF; j++) {
        var z1 = -Hh + 2 * Hh * i / NZ, z2 = -Hh + 2 * Hh * (i + 1) / NZ, f1 = j / NF * 6.2832, f2a = (j + 1) / NF * 6.2832, rad = function (z) { return r0 * Math.sqrt(1 + z * z * Math.tan(phi / 2) * Math.tan(phi / 2) / (Hh * Hh)); };
        var pts = [[z1, f1], [z1, f2a], [z2, f2a], [z2, f1]].map(function (q) { var r = rad(q[0]); return [r * Math.cos(q[1]), r * Math.sin(q[1]), q[0]]; }), zm = (z1 + z2) / 2, fm = (f1 + f2a) / 2, rm = rad(zm);
        var n = [Math.cos(fm), Math.sin(fm), -zm * Math.tan(phi / 2) * Math.tan(phi / 2) * r0 * r0 / (Hh * Hh * rm)], nn = Math.hypot(n[0], n[1], n[2]); n = n.map(function (q) { return q / nn; });
        caras.push({ pr: pts.map(function (q) { return C.P(q[0], q[1], q[2]); }), prof: C.P(rm * Math.cos(fm), rm * Math.sin(fm), zm)[2], li: Math.max(0, n[0] * luz[0] + n[1] * luz[1] + n[2] * luz[2]), frente: n[0] * V[0] + n[1] * V[1] + n[2] * V[2] < 0 });
      }
      caras.sort(function (p, q) { return q.prof - p.prof; });
      function cara(cf) { var t = 0.42 + 0.58 * cf.li + (cf.frente ? 0 : -0.15); poli3(g, cf.pr, 'rgba(' + (205 * t | 0) + ',' + (200 * t | 0) + ',' + (190 * t | 0) + ',' + (cf.frente ? 0.92 : 0.6) * lleno + ')', 'rgba(0,0,0,' + 0.08 * lleno + ')', 0.5); }
      if (lleno > 0) caras.forEach(function (cf) { if (!cf.frente) cara(cf); });
      /* las varillas: rectas que unen la base con el borde de arriba girado phi */
      var vars = []; for (var k2 = 0; k2 < Math.floor(cuantas); k2++) { var th = k2 / N * 6.2832, A = [Rb * Math.cos(th - phi / 2), Rb * Math.sin(th - phi / 2), -Hh], B = [Rb * Math.cos(th + phi / 2), Rb * Math.sin(th + phi / 2), Hh];
        vars.push({ A: A, B: B, prof: C.P((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0)[2] }); }
      vars.sort(function (p, q) { return q.prof - p.prof; });
      vars.forEach(function (v) { linea3(g, C, v.A, v.B, 'rgba(90,60,30,' + (0.85 - 0.6 * lleno) + ')', 1.6); });
      if (lleno > 0) caras.forEach(function (cf) { if (cf.frente) cara(cf); });
      [[-Hh, '#6b6a66'], [Hh, '#8d8a84']].forEach(function (z) { var anillo = []; for (var k3 = 0; k3 <= 60; k3++) { var t3 = k3 / 60 * 6.2832; anillo.push(C.P(Rb * Math.cos(t3), Rb * Math.sin(t3), z[0])); } g.strokeStyle = z[1]; g.lineWidth = 3; g.beginPath(); anillo.forEach(function (q, k) { if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); });
      var cint = []; for (var k4 = 0; k4 <= 60; k4++) { var t4 = k4 / 60 * 6.2832; cint.push(C.P(r0 * Math.cos(t4), r0 * Math.sin(t4), 0)); } g.strokeStyle = '#e67e22'; g.lineWidth = 2.5; g.setLineDash([6, 4]); g.beginPath(); cint.forEach(function (q, k) { if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); g.setLineDash([]);
      /* vapor que sale por arriba */
      if (lleno > 0.5 && vapor.length < 40) vapor.push({ x: (rnd() - 0.5) * Rb, y: (rnd() - 0.5) * Rb, z: Hh, s: 0.15 + rnd() * 0.1, v: 0.3 + rnd() * 0.3 });
      vapor.forEach(function (o) { o.z += o.v * dt; o.s += dt * 0.25; o.x += dt * 0.12; }); vapor = vapor.filter(function (o) { return o.z < Hh + 1.6; });
      vapor.forEach(function (o) { var q = C.P(o.x, o.y, o.z), al = Math.max(0, 0.55 - (o.z - Hh) / 3); var vg = g.createRadialGradient(q[0], q[1], 1, q[0], q[1], o.s * C.esc); vg.addColorStop(0, 'rgba(255,255,255,' + al + ')'); vg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = vg; g.beginPath(); g.arc(q[0], q[1], o.s * C.esc, 0, 7); g.fill(); });
      var cp = C.P(r0, 0, 0); rotulo(g, 'cintura: ' + f2(Math.round(r0 * 100) / 100) + ' (radio de la base 1)', cp[0] + 10, cp[1], '#8a4a10', 'left', 12);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(30,40,50,.6)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      lec.innerHTML = '¡La torre curva está hecha solo de varillas rectas! Cada varilla une la base con el borde de arriba girado ' + Math.round(gi.v) + '°. Al cortarla con un plano vertical por el eje sale una <b>hipérbola</b>: es un hiperboloide de una hoja. Así se construyen las torres de las plantas de energía: fuertes, con poco material y el aire caliente sube solo. Cintura = cos(giro/2) = <b>' + f2(Math.round(r0 * 1000) / 1000) + '</b>.';
    }
    function gps(g, w, h, dt, now) {
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#16263a'); cie.addColorStop(1, '#22384f'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.52; C.esc = Math.min(w, h * 1.4) / 26;
      var cc = 5, d = dd.v, A = [-cc, 0, 0], B = [cc, 0, 0], a = Math.abs(d) / 2, bb = Math.sqrt(Math.max(0, cc * cc - a * a));
      var mapa = [[-11, -8], [11, -8], [11, 8], [-11, 8]].map(function (q) { return C.P(q[0], q[1], 0); }); var mg = g.createLinearGradient(mapa[0][0], mapa[0][1], mapa[2][0], mapa[2][1]); mg.addColorStop(0, '#3c6e4a'); mg.addColorStop(1, '#5b8c5a'); poli3(g, mapa, mg);
      g.strokeStyle = 'rgba(255,255,255,.08)'; for (var x = -11; x <= 11; x++) linea3(g, C, [x, -8, 0], [x, 8, 0], 'rgba(255,255,255,.08)', 1); for (var y = -8; y <= 8; y++) linea3(g, C, [-11, y, 0], [11, y, 0], 'rgba(255,255,255,.08)', 1);
      [[-8, 4, 2.2], [3, -5, 1.6], [7, 5, 2.6], [-4, -6, 1.2]].forEach(function (b) { var cs = [[0, 0], [1.4, 0], [1.4, 1.2], [0, 1.2]].map(function (q) { return C.P(b[0] + q[0], b[1] + q[1], 0); }), ct = [[0, 0], [1.4, 0], [1.4, 1.2], [0, 1.2]].map(function (q) { return C.P(b[0] + q[0], b[1] + q[1], b[2] * 0.5); }); poli3(g, cs.slice(0, 2).concat([ct[1], ct[0]]), '#8f98a3'); poli3(g, ct, '#c9ced4'); });
      ondaT += dt * 3.2; var Rmax = 16; if (ondaT > Rmax + Math.abs(d)) ondaT = 0;
      /* las ondas: la de A con radio r y la de B con radio r + d (o r − d) */
      var rA = ondaT, rB = ondaT + d;
      [[A, rA, '120,220,255'], [B, rB, '255,190,110']].forEach(function (o) { if (o[1] <= 0) return; for (var k = 0; k < 3; k++) { var rr2 = o[1] - k * 0.5; if (rr2 <= 0) continue; var cir = []; for (var q = 0; q <= 80; q++) { var t = q / 80 * 6.2832; cir.push(C.P(o[0][0] + rr2 * Math.cos(t), rr2 * Math.sin(t), 0)); } g.strokeStyle = 'rgba(' + o[2] + ',' + (0.7 - k * 0.22) + ')'; g.lineWidth = 2 - k * 0.5; g.beginPath(); cir.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); } });
      if (rA > 0 && rB > 0) { var xx = (rA * rA - rB * rB) / (4 * cc), yy2 = rA * rA - (xx + cc) * (xx + cc); if (yy2 >= 0) { var yy = Math.sqrt(yy2); puntos.push([xx, yy], [xx, -yy]); } }
      if (puntos.length > 800) puntos.splice(0, puntos.length - 800);
      g.save(); g.globalCompositeOperation = 'lighter'; puntos.forEach(function (p) { var q = C.P(p[0], p[1], 0); g.fillStyle = 'rgba(255,240,150,.9)'; g.beginPath(); g.arc(q[0], q[1], 1.8, 0, 7); g.fill(); }); g.restore();
      if (a > 0.05 && a < cc) { g.strokeStyle = 'rgba(255,240,150,.35)'; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.beginPath(); for (var t2 = -2.2; t2 <= 2.2; t2 += 0.05) { var X = (d > 0 ? -1 : 1) * a * Math.cosh(t2), Y = bb * Math.sinh(t2); if (Math.abs(Y) > 8) continue; var q2 = C.P(X, Y, 0); g.lineTo(q2[0], q2[1]); } g.stroke(); g.setLineDash([]); }
      [[A, 'A', '120,220,255'], [B, 'B', '255,190,110']].forEach(function (o) { var b0 = C.P(o[0][0], 0, 0), b1 = C.P(o[0][0], 0, 2.6); g.strokeStyle = '#d6dbe1'; g.lineWidth = 3; g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.stroke(); for (var k = 0.5; k < 2.6; k += 0.5) { var p1 = C.P(o[0][0] - 0.3, 0, k), p2 = C.P(o[0][0] + 0.3, 0, k); g.lineWidth = 1; g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); }
        brillo3(g, C, [o[0][0], 0, 2.6], 14 + 4 * Math.sin(now / 150), o[2], 0.95); rotulo(g, 'antena ' + o[1], b0[0], b0[1] + 16, '#1f2a36', 'center', 12); });
      var Pv = a > 0.05 && a < cc ? [(d > 0 ? -1 : 1) * a * Math.cosh(0.9), bb * Math.sinh(0.9), 0] : null;
      if (Pv) { var pp = C.P(Pv[0], Pv[1], 0); g.fillStyle = '#111'; rr(g, pp[0] - 6, pp[1] - 11, 12, 20, 3); g.fill(); g.fillStyle = '#7fd3ff'; g.fillRect(pp[0] - 4.5, pp[1] - 8.5, 9, 13); rotulo(g, '📱 posible lugar', pp[0] + 12, pp[1] - 12, '#1f2a36', 'left', 11); }
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.6)'; g.textAlign = 'center'; g.fillText(w < 560 ? 'los puntos amarillos dibujan la hipérbola' : 'los puntos amarillos son donde se cruzan dos ondas con la misma diferencia: ¡dibujan la hipérbola!', w / 2, h - 10);
      lec.innerHTML = 'Las antenas están a 2c = 10 km. Si la señal tarda en llegar a una lo equivalente a ' + f2(Math.abs(d)) + ' km más que a la otra, el celular cumple |PA − PB| = ' + f2(Math.abs(d)) + ' = 2a: está sobre una <b>hipérbola</b> con focos en las antenas (a = ' + f2(Math.round(a * 100) / 100) + ', b = ' + f2(Math.round(bb * 100) / 100) + '). Con una tercera antena sale otra hipérbola y el cruce dice dónde está. Así funcionaban el LORAN y así ubica la red a un celular.';
    }
    gi.inp.addEventListener('input', function () { L.redibuja(); }); dd.inp.addEventListener('input', function () { puntos = []; ondaT = 0; L.redibuja(); }); animador(L, dib); L.redibuja();
  };

  /* ---------------------------------------------------------------------
     La circunferencia: ondas en el agua, ubicar un celular con tres antenas y la rueda de Chicago
     --------------------------------------------------------------------- */
  W.circulo3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 440 : 420; }), C = camara3(L, { yaw: -0.5, pitch: 0.55 }), modo = 'ondas';
    var ctO;
    botonesModo(c, [['ondas', '💧 Ondas en el agua'], ['gps', '📡 Tres antenas'], ['noria', '🎡 Rueda de Chicago']], modo, function (m) { modo = m; C.pitch = m === 'noria' ? 0.12 : m === 'gps' ? 0.8 : 0.55; C.yaw = m === 'noria' ? -0.35 : -0.5; ctO.style.display = m === 'ondas' ? '' : 'none'; t = 0; fuentes = [{ x: -0.3, y: 0.2, t0: -0.5 }]; });
    ctO = fila(c); boton(ctO, '💧 Tirar otra piedra', function () { fuentes.push({ x: (rnd() - 0.5) * 2.4, y: (rnd() - 0.5) * 2.4, t0: t }); if (fuentes.length > 3) fuentes.shift(); });
    var lec = U.lectura(c), R = U.reto(c, 'La antena está en (2, −1) y el celular en (5, 3), en km. ¿Cuál es el radio r de la circunferencia de la antena que pasa por el celular?', true, function (v) { return Math.abs(v - 5) < 0.01; },
      '¡Eso! r = √((5 − 2)² + (3 + 1)²) = √25 = 5 km, y la circunferencia es (x − 2)² + (y + 1)² = 25.'); R.el.__fin = c.__fin;
    var t = 0, rnd = azar(12), fuentes = [{ x: -0.3, y: 0.2, t0: -0.5 }];
    function dib(dt, now) {
      t += dt; var g = L.g, w = L.w, h = L.h; fondoEstudio(g, w, h);
      if (modo === 'ondas') return ondas(g, w, h);
      if (modo === 'gps') return antenas(g, w, h, now);
      return noria(g, w, h, now);
    }
    function ondas(g, w, h) {
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#9cc9e6'); cie.addColorStop(1, '#e6f0e8'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.55; C.esc = Math.min(w * 0.3, h * 0.42);
      var N = 50, S = 1.66, vel = 0.55, V = C.vista(), luz = [0.4, -0.5, 0.75];
      function alt(x, y) { var z = 0; fuentes.forEach(function (f) { var r = Math.hypot(x - f.x, y - f.y), fr = (t - f.t0) * vel; var u = fr - r; if (u > 0 && u < 2) z += 0.11 * Math.exp(-0.3 * r) * Math.sin(10 * (r - fr)) * Math.min(1, u * 6) * Math.max(0, 1 - u / 2) * Math.max(0, 1 - u / 2); }); return z; }
      var Z = []; for (var i = 0; i <= N; i++) { Z.push([]); for (var j = 0; j <= N; j++) Z[i].push(alt(-S + 2 * S * j / N, -S + 2 * S * i / N)); }
      var orilla = []; for (var k = 0; k <= 48; k++) { var a2 = k / 48 * 6.2832; orilla.push(C.P(1.78 * Math.cos(a2), 1.78 * Math.sin(a2), -0.03)); } var pasto3 = []; for (var k5 = 0; k5 <= 48; k5++) { var a7 = k5 / 48 * 6.2832; pasto3.push(C.P(3 * Math.cos(a7), 3 * Math.sin(a7), -0.03)); } poli3(g, pasto3, '#86b56a'); poli3(g, orilla, '#e3d2a2', '#c9b27a', 2);
      var caras = [];
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
        var x0 = -S + 2 * S * j / N, y0 = -S + 2 * S * i / N, d = 2 * S / N, z00 = Z[i][j], z10 = Z[i][j + 1], z01 = Z[i + 1][j], z11 = Z[i + 1][j + 1];
        var nx = -(z10 - z00 + z11 - z01) / (2 * d), ny = -(z01 - z00 + z11 - z10) / (2 * d), nn = Math.hypot(nx, ny, 1), li = (nx * luz[0] + ny * luz[1] + luz[2]) / nn, es = Math.pow(Math.max(0, li), 30);
        caras.push({ pr: [C.P(x0, y0, z00), C.P(x0 + d, y0, z10), C.P(x0 + d, y0 + d, z11), C.P(x0, y0 + d, z01)], prof: C.P(x0 + d / 2, y0 + d / 2, 0)[2], li: li, es: es, r2: Math.hypot(x0, y0) });
      }
      caras.sort(function (p, q) { return q.prof - p.prof; });
      var borde = []; for (var k6 = 0; k6 <= 64; k6++) { var a8 = k6 / 64 * 6.2832; borde.push(C.P(1.62 * Math.cos(a8), 1.62 * Math.sin(a8), 0)); } g.save(); g.beginPath(); borde.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.clip();
      caras.forEach(function (cf) { var tt = 0.25 + 0.95 * Math.max(-0.1, cf.li), col = [50 * tt + 255 * cf.es * 0.8, 150 * tt + 255 * cf.es * 0.8, 205 * tt + 255 * cf.es * 0.8].map(function (v) { return Math.min(255, v) | 0; }); poli3(g, cf.pr, 'rgb(' + col + ')', 'rgba(' + col + ',.9)', 0.6); }); g.restore();
      fuentes.forEach(function (f, k) { var fr = (t - f.t0) * vel; if (fr > 0 && fr < 2.2) { g.strokeStyle = 'rgba(255,240,150,.9)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); for (var q = 0; q <= 72; q++) { var an = q / 72 * 6.2832, X = f.x + fr * Math.cos(an), Y = f.y + fr * Math.sin(an); if (Math.hypot(X, Y) > 1.6) { g.stroke(); g.beginPath(); continue; } var p = C.P(X, Y, 0.02); g.lineTo(p[0], p[1]); } g.stroke(); g.setLineDash([]); }
        var pc = C.P(f.x, f.y, 0.05); if (t - f.t0 < 0.4) { g.fillStyle = '#6b6f73'; g.beginPath(); g.arc(pc[0], pc[1] - (0.4 - (t - f.t0)) * 160, 6, 0, 7); g.fill(); } });
      var ult = fuentes[fuentes.length - 1], rr1 = Math.max(0, (t - ult.t0) * vel);
      if (rr1 > 1.5) { fuentes.push({ x: (rnd() - 0.5) * 2.2, y: (rnd() - 0.5) * 2.2, t0: t }); if (fuentes.length > 3) fuentes.shift(); }
      var h0 = Math.round(ult.x * 100) / 100, k0 = Math.round(ult.y * 100) / 100, sg = function (v) { return v < 0 ? ' + ' + f2(-v) : ' − ' + f2(v); };
      panel(g, ['(x' + sg(h0) + ')² + (y' + sg(k0) + ')² = ' + f2(Math.round(rr1 * 100) / 100) + '²', 'el borde de la onda crece: r = ' + vel + '·t'], 10, 10);
      lec.innerHTML = 'Al caer la piedra, todos los puntos del borde de la onda están a la misma distancia del lugar donde cayó: forman una <b>circunferencia</b> de centro (h, k) y radio r = v·t, que crece con el tiempo. Tira otra piedra y mira cómo se cruzan las ondas.';
    }
    function antenas(g, w, h, now) {
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#16263a'); cie.addColorStop(1, '#22384f'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.53; C.esc = Math.min(w, h * 1.4) / 24;
      var mapa = [[-10, -8], [10, -8], [10, 8], [-10, 8]].map(function (q) { return C.P(q[0], q[1], 0); }); var mg = g.createLinearGradient(mapa[0][0], mapa[0][1], mapa[2][0], mapa[2][1]); mg.addColorStop(0, '#3c6e4a'); mg.addColorStop(1, '#5b8c5a'); poli3(g, mapa, mg);
      for (var x = -10; x <= 10; x++) linea3(g, C, [x, -8, 0], [x, 8, 0], 'rgba(255,255,255,.07)', 1); for (var y = -8; y <= 8; y++) linea3(g, C, [-10, y, 0], [10, y, 0], 'rgba(255,255,255,.07)', 1);
      g.strokeStyle = 'rgba(230,220,200,.5)'; g.lineWidth = 4; g.beginPath(); for (var s = -10; s <= 10; s += 0.5) { var p0 = C.P(s, 2 * Math.sin(s / 3) - 1, 0); g.lineTo(p0[0], p0[1]); } g.stroke();
      var ang = t * 0.35, P = [3.2 * Math.cos(ang), 2.4 * Math.sin(ang * 1.3), 0], T = [[-6, -4, '120,220,255', 'A'], [6, -3, '255,190,110', 'B'], [1, 6, '200,150,255', 'C']];
      T.forEach(function (o) { var r = Math.hypot(P[0] - o[0], P[1] - o[1]), pul = (now / 900) % 1; var cir = []; for (var q = 0; q <= 90; q++) { var an = q / 90 * 6.2832; cir.push(C.P(o[0] + r * Math.cos(an), o[1] + r * Math.sin(an), 0)); }
        g.strokeStyle = 'rgba(' + o[2] + ',.85)'; g.lineWidth = 2; g.beginPath(); cir.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
        var rp = r * pul; g.strokeStyle = 'rgba(' + o[2] + ',' + (0.5 * (1 - pul)) + ')'; g.lineWidth = 1.2; g.beginPath(); for (var q2 = 0; q2 <= 60; q2++) { var an2 = q2 / 60 * 6.2832, p2 = C.P(o[0] + rp * Math.cos(an2), o[1] + rp * Math.sin(an2), 0); if (q2) g.lineTo(p2[0], p2[1]); else g.moveTo(p2[0], p2[1]); } g.stroke();
        var b0 = C.P(o[0], o[1], 0), b1 = C.P(o[0], o[1], 2.4); g.strokeStyle = '#d6dbe1'; g.lineWidth = 3; g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.stroke(); brillo3(g, C, [o[0], o[1], 2.4], 14, o[2], 0.95);
        linea3(g, C, [o[0], o[1], 0.02], [P[0], P[1], 0.02], 'rgba(' + o[2] + ',.5)', 1); rotulo(g, o[3] + ' · r = ' + f2(Math.round(r * 10) / 10), b0[0], b0[1] + 16, '#1f2a36', 'center', 11); });
      var pp = C.P(P[0], P[1], 0); brillo3(g, C, P, 26, '255,250,200', 0.8); g.fillStyle = '#111'; rr(g, pp[0] - 6, pp[1] - 11, 12, 20, 3); g.fill(); g.fillStyle = '#7fd3ff'; g.fillRect(pp[0] - 4.5, pp[1] - 8.5, 9, 13);
      rotulo(g, '📱 (' + f2(Math.round(P[0] * 10) / 10) + ', ' + f2(Math.round(P[1] * 10) / 10) + ')', pp[0] + 12, pp[1] - 14, '#1f2a36', 'left', 12);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.6)'; g.textAlign = 'center'; g.fillText(w < 560 ? 'las tres circunferencias se cruzan en el celular' : 'cada antena sabe solo la distancia: el celular está en el único punto donde se cruzan las tres circunferencias', w / 2, h - 10);
      var rA = Math.hypot(P[0] + 6, P[1] + 4);
      lec.innerHTML = 'Cada antena mide cuánto tarda la señal y así sabe a qué distancia r está el celular, pero no hacia dónde: el celular puede estar en cualquier punto de la <b>circunferencia</b> (x − h)² + (y − k)² = r². Con dos antenas quedan dos puntos posibles; con la tercera, uno solo. Antena A: (x + 6)² + (y + 4)² = ' + f2(Math.round(rA * 10) / 10) + '². El GPS hace lo mismo con esferas y satélites.';
    }
    function noria(g, w, h, now) {
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#f6b26b'); cie.addColorStop(0.5, '#f8d9a0'); cie.addColorStop(1, '#a7c8de'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      var so = g.createRadialGradient(w * 0.78, h * 0.3, 4, w * 0.78, h * 0.3, 90); so.addColorStop(0, 'rgba(255,250,220,1)'); so.addColorStop(0.2, 'rgba(255,220,150,.8)'); so.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = so; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.8; C.esc = Math.min(w * 0.26, h * 0.32);
      var Rr = 1, K = 1.15, ang = t * 0.25, N = 12, gnd = -0.15;
      var suelo = [[-3, -2, gnd], [3, -2, gnd], [3, 2, gnd], [-3, 2, gnd]].map(function (q) { return C.P(q[0], q[1], q[2]); }); poli3(g, suelo, '#7fa860');
      [[-0.18], [0.18]].forEach(function (yy) { linea3(g, C, [-0.7, yy[0] * 2, gnd], [0, yy[0], K], '#5d6670', 4); linea3(g, C, [0.7, yy[0] * 2, gnd], [0, yy[0], K], '#5d6670', 4); });
      [-0.12, 0.12].forEach(function (yy) { var aro = []; for (var q = 0; q <= 80; q++) { var a3 = q / 80 * 6.2832; aro.push(C.P(Rr * Math.cos(a3), yy, K + Rr * Math.sin(a3))); } g.strokeStyle = '#e8edf2'; g.lineWidth = 3; g.beginPath(); aro.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
        for (var k = 0; k < N; k++) { var a4 = ang + k / N * 6.2832; linea3(g, C, [0, yy, K], [Rr * Math.cos(a4), yy, K + Rr * Math.sin(a4)], 'rgba(230,236,242,.8)', 1.2); } });
      for (var k2 = 0; k2 < 40; k2++) { var a5 = k2 / 40 * 6.2832 + ang, lp = C.P(Rr * 1.01 * Math.cos(a5), -0.12, K + Rr * 1.01 * Math.sin(a5)); g.fillStyle = 'hsl(' + ((k2 * 30 + now / 20) % 360) + ',90%,65%)'; g.beginPath(); g.arc(lp[0], lp[1], 1.8, 0, 7); g.fill(); }
      var cabs = []; for (var k3 = 0; k3 < N; k3++) { var a6 = ang + k3 / N * 6.2832; cabs.push({ k: k3, x: Rr * Math.cos(a6), z: K + Rr * Math.sin(a6), prof: C.P(Rr * Math.cos(a6), 0, K + Rr * Math.sin(a6))[2] }); }
      cabs.sort(function (p, q) { return q.prof - p.prof; });
      cabs.forEach(function (cb) { var top = C.P(cb.x, 0, cb.z), bot = C.P(cb.x, 0, cb.z - 0.16); g.strokeStyle = '#3d454e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(bot[0], bot[1]); g.stroke();
        var sz = C.esc * 0.11, cg = g.createLinearGradient(bot[0] - sz, 0, bot[0] + sz, 0), col = cb.k === 0 ? ['#ff6b6b', '#b02a2a'] : ['hsl(' + (cb.k * 30) + ',70%,62%)', 'hsl(' + (cb.k * 30) + ',60%,38%)']; cg.addColorStop(0, col[0]); cg.addColorStop(1, col[1]); g.fillStyle = cg; rr(g, bot[0] - sz, bot[1], sz * 2, sz * 1.4, 4); g.fill();
        g.fillStyle = 'rgba(220,240,255,.8)'; g.fillRect(bot[0] - sz * 0.7, bot[1] + sz * 0.25, sz * 1.4, sz * 0.45); });
      var cr = cabs.filter(function (q) { return q.k === 0; })[0], cc0 = C.P(0, 0, K), pr = C.P(cr.x, 0, cr.z);
      g.strokeStyle = '#c0392b'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(cc0[0], cc0[1]); g.lineTo(pr[0], pr[1]); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#3d454e'; g.beginPath(); g.arc(cc0[0], cc0[1], 5, 0, 7); g.fill();
      var X = cr.x * 20, Y = cr.z * 20;
      panel(g, ['cabina roja: (' + f2(Math.round(X * 10) / 10) + ', ' + f2(Math.round(Y * 10) / 10) + ') m', 'x² + (y − 23)² = ' + f2(Math.round((X * X + (Y - 23) * (Y - 23)) * 10) / 10) + ' = 20²  ✓'], 10, 10);
      lec.innerHTML = 'La rueda mide 40 m de diámetro y su centro está a 23 m de altura: cada cabina recorre la <b>circunferencia</b> x² + (y − 23)² = 400. Mira cómo, aunque la cabina roja suba y baje, sus coordenadas siempre cumplen la ecuación.';
    }
    animador(L, dib); L.redibuja();
  };

  /* =====================================================================
     El espacio en 3D: la recta (un dron), el plano (un panel solar),
     el producto cruz (la llave y el tornillo) y los sólidos de revolución (el torno)
     ===================================================================== */
  function flecha3(g, C, a, b, col, lw) {
    var p = C.P(a[0], a[1], a[2]), q = C.P(b[0], b[1], b[2]), an = Math.atan2(q[1] - p[1], q[0] - p[0]), L = Math.hypot(q[0] - p[0], q[1] - p[1]), cab = Math.min(13, L * 0.35);
    g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw || 3; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 4;
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0] - Math.cos(an) * cab * 0.6, q[1] - Math.sin(an) * cab * 0.6); g.stroke();
    g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] - cab * Math.cos(an - 0.4), q[1] - cab * Math.sin(an - 0.4)); g.lineTo(q[0] - cab * Math.cos(an + 0.4), q[1] - cab * Math.sin(an + 0.4)); g.closePath(); g.fill(); g.restore();
  }
  function ejes3(g, C, n, conPiso) {                   /* piso cuadriculado y ejes x, y, z */
    if (conPiso) { var pz = [[-n, -n], [n, -n], [n, n], [-n, n]].map(function (q) { return C.P(q[0], q[1], 0); }); poli3(g, pz, 'rgba(255,255,255,.05)');
      for (var i = -n; i <= n; i++) { linea3(g, C, [i, -n, 0], [i, n, 0], 'rgba(255,255,255,' + (i ? 0.08 : 0.0) + ')', 1); linea3(g, C, [-n, i, 0], [n, i, 0], 'rgba(255,255,255,' + (i ? 0.08 : 0.0) + ')', 1); } }
    [[[n + 0.6, 0, 0], '#ff7b7b', 'x'], [[0, n + 0.6, 0], '#7bff9b', 'y'], [[0, 0, n + 0.3], '#7bb8ff', 'z']].forEach(function (e) { flecha3(g, C, [0, 0, 0], e[0], e[1], 2); var p = C.P(e[0][0] * 1.06, e[0][1] * 1.06, e[0][2] * 1.06); g.fillStyle = e[1]; g.font = '600 13px system-ui'; g.textAlign = 'center'; g.fillText(e[2], p[0], p[1]); });
  }
  function fmtV(v) { return '(' + v.map(function (q) { return f2(Math.round(q * 100) / 100); }).join(', ') + ')'; }

  /* ---------- La recta en el espacio: la ruta de un dron ---------- */
  W.recta3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 420 : 400; }), C = camara3(L, { yaw: -0.75, pitch: 0.38 });
    var ct = fila(c), ts = U.deslizador(ct, 'tiempo t', -2, 3, 0.01, 0, function (v) { return f2(v); });
    var ct2 = fila(c), vx = U.deslizador(ct2, 'v₁', -3, 3, 0.5, 2, function (v) { return f2(v); }), vy = U.deslizador(ct2, 'v₂', -3, 3, 0.5, -1, function (v) { return f2(v); }), vz = U.deslizador(ct2, 'v₃', -2, 3, 0.5, 1, function (v) { return f2(v); });
    reloj(ct, ts, 3, 0.8, '▶ Que vuele');
    var lec = U.lectura(c), R = U.reto(c, 'El dron sale de P₀ = (1, 2, 0) con velocidad v = (2, −1, 3). ¿A qué altura z va en t = 2?', true, function (v) { return Math.abs(v - 6) < 0.01; },
      '¡Eso! z = 0 + 3·2 = 6. En t = 2 el dron está en (5, 0, 6): cada coordenada es la de P₀ más t veces la de v.'); R.el.__fin = c.__fin;
    var P0 = [1, 2, 0], rnd = azar(3), helice = 0;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, t = ts.v, v = [vx.v, vy.v, vz.v], P = [P0[0] + t * v[0], P0[1] + t * v[1], P0[2] + t * v[2]]; helice += dt * 40;
      fondoEstudio(g, w, h); C.cx = w / 2; C.cy = h * 0.6; C.esc = Math.min(w, h) / 9;
      ejes3(g, C, 4, true);
      var A = [P0[0] - 2 * v[0], P0[1] - 2 * v[1], P0[2] - 2 * v[2]], B = [P0[0] + 3 * v[0], P0[1] + 3 * v[1], P0[2] + 3 * v[2]];
      g.setLineDash([6, 6]); linea3(g, C, A, B, 'rgba(255,230,140,.75)', 2); g.setLineDash([]);
      linea3(g, C, [A[0], A[1], 0], [B[0], B[1], 0], 'rgba(0,0,0,.35)', 3);
      linea3(g, C, P, [P[0], P[1], 0], 'rgba(255,255,255,.25)', 1);
      var sh = C.P(P[0], P[1], 0); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(sh[0], sh[1], 14, 5, 0, 0, 7); g.fill();
      var p0 = C.P(P0[0], P0[1], P0[2]); g.fillStyle = '#ffd166'; g.beginPath(); g.arc(p0[0], p0[1], 5, 0, 7); g.fill(); rotulo(g, 'P₀ = (1, 2, 0)', p0[0] - 10, p0[1] + 16, '#1f2a36', 'right', 12);
      flecha3(g, C, P0, [P0[0] + v[0], P0[1] + v[1], P0[2] + v[2]], '#ff9f43', 3.5); var pv = C.P(P0[0] + v[0], P0[1] + v[1], P0[2] + v[2]); rotulo(g, 'v = ' + fmtV(v), pv[0] + 8, pv[1] - 10, '#8a4a10', 'left', 12);
      /* el dron */
      var d = C.P(P[0], P[1], P[2]), k = Math.max(0.8, C.esc / 24);
      g.save(); g.translate(d[0], d[1]); g.scale(k, k);
      g.strokeStyle = '#2b2f36'; g.lineWidth = 3; g.beginPath(); g.moveTo(-18, -6); g.lineTo(18, 6); g.moveTo(-18, 6); g.lineTo(18, -6); g.stroke();
      [[-18, -6], [18, 6], [-18, 6], [18, -6]].forEach(function (q, i) { g.fillStyle = 'rgba(200,220,240,.35)'; g.beginPath(); g.ellipse(q[0], q[1] - 3, 10, 3, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2; g.beginPath(); var a = helice + i; g.moveTo(q[0] - 9 * Math.cos(a), q[1] - 3 - 2 * Math.sin(a)); g.lineTo(q[0] + 9 * Math.cos(a), q[1] - 3 + 2 * Math.sin(a)); g.stroke(); });
      var cg = g.createLinearGradient(0, -8, 0, 8); cg.addColorStop(0, '#f5f7fa'); cg.addColorStop(1, '#8792a0'); g.fillStyle = cg; rr(g, -9, -6, 18, 12, 4); g.fill(); g.fillStyle = '#1b2733'; g.beginPath(); g.arc(0, 2, 3, 0, 7); g.fill(); g.fillStyle = '#4ec9ff'; g.beginPath(); g.arc(0, 2, 1.5, 0, 7); g.fill();
      g.fillStyle = (Math.floor(now / 300) % 2) ? '#ff4d4d' : '#55ff7a'; g.beginPath(); g.arc(-8, -5, 1.5, 0, 7); g.arc(8, -5, 1.5, 0, 7); g.fill(); g.restore();
      rotulo(g, 'P(t) = ' + fmtV(P), d[0] + 26, d[1] - 18, '#1f2a36', 'left', 12);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      lec.innerHTML = 'Ruta del dron: <b>(x, y, z) = (1, 2, 0) + t' + fmtV(v) + '</b> · paramétricas: x = 1 + ' + f2(v[0]) + 't, y = 2 + ' + f2(v[1]) + 't, z = ' + f2(v[2]) + 't. Con t = ' + f2(t) + ' está en <b>' + fmtV(P) + '</b>. Cambiar v cambia la dirección del vuelo; la sombra en el piso es la proyección de la recta.';
    }
    [ts, vx, vy, vz].forEach(function (s) { s.inp.addEventListener('input', function () { L.redibuja(); }); }); animador(L, dib); L.redibuja();
  };

  /* ---------- El plano en el espacio: un panel solar y su vector normal ---------- */
  W.plano3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 430 : 400; }), C = camara3(L, { yaw: 0.9, pitch: 0.42 });
    var ct = fila(c), inc = U.deslizador(ct, 'inclinación del panel', 0, 80, 1, 30, function (v) { return Math.round(v) + '°'; }), rum = U.deslizador(ct, 'hacia dónde mira', -180, 180, 1, 0, function (v) { return Math.round(v) + '°'; });
    var ct2 = fila(c), hora = U.deslizador(ct2, '🕑 hora del día', 6, 18, 0.05, 12, function (v) { var hh = Math.floor(v), mm = Math.round((v - hh) * 60); return hh + ':' + (mm < 10 ? '0' : '') + mm; });
    reloj(ct2, hora, 18, 2, '▶ Pasar el día');
    var lec = U.lectura(c), R = U.reto(c, 'El panel está en el plano que pasa por (1, 1, 1) con vector normal n = (2, −1, 2). En su ecuación 2x − y + 2z = d, ¿cuánto vale d?', true, function (v) { return Math.abs(v - 3) < 0.01; },
      '¡Correcto! d = n·P₀ = 2·1 − 1·1 + 2·1 = 3, así que el plano es 2x − y + 2z = 3.'); R.el.__fin = c.__fin;
    var rayos = [], rnd = azar(8), energia = 0;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, a = inc.v * Math.PI / 180, b = rum.v * Math.PI / 180, n = [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)];
      var hs = (hora.v - 6) / 12 * Math.PI, sol = [Math.cos(hs), 0.35, Math.sin(hs)], ns = Math.hypot(sol[0], sol[1], sol[2]); sol = sol.map(function (q) { return q / ns; });
      var cosT = Math.max(0, n[0] * sol[0] + n[1] * sol[1] + n[2] * sol[2]), alt = Math.max(0, sol[2]);
      var cie = g.createLinearGradient(0, 0, 0, h), dia = Math.min(1, alt * 3); cie.addColorStop(0, 'rgb(' + (40 + 80 * dia | 0) + ',' + (60 + 120 * dia | 0) + ',' + (110 + 120 * dia | 0) + ')'); cie.addColorStop(1, 'rgb(' + (230 - 40 * (1 - dia) | 0) + ',' + (200 + 30 * dia | 0) + ',' + (160 + 60 * dia | 0) + ')'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.62; C.esc = Math.min(w, h) / 5;
      var suelo = []; for (var k = 0; k <= 40; k++) { var t = k / 40 * 6.2832; suelo.push(C.P(3.2 * Math.cos(t), 3.2 * Math.sin(t), -0.6)); } poli3(g, suelo, '#7fa860');
      /* techo de una casa */
      var casa = [[-1.4, -1.0], [1.4, -1.0], [1.4, 1.0], [-1.4, 1.0]];
      poli3(g, casa.map(function (q) { return C.P(q[0], q[1], -0.6); }), '#c9b9a0');
      [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e) { var A = casa[e[0]], B = casa[e[1]]; var cara = [C.P(A[0], A[1], -0.6), C.P(B[0], B[1], -0.6), C.P(B[0], B[1], 0), C.P(A[0], A[1], 0)]; poli3(g, cara, 'rgba(220,205,180,.95)', '#8f806a', 1); });
      poli3(g, casa.map(function (q) { return C.P(q[0], q[1], 0); }), '#9b4a32', '#6e3221', 1.2);
      var ps = C.P(sol[0] * 4, sol[1] * 4, Math.max(-0.3, sol[2] * 4)); if (sol[2] > -0.05) { var sg = g.createRadialGradient(ps[0], ps[1], 2, ps[0], ps[1], 50); sg.addColorStop(0, 'rgba(255,250,210,1)'); sg.addColorStop(0.25, 'rgba(255,220,120,.8)'); sg.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = sg; g.beginPath(); g.arc(ps[0], ps[1], 50, 0, 7); g.fill(); }
      /* el panel: plano por (0,0,0.25) con normal n */
      var o = [0, 0, 0.25], u = [Math.cos(b + Math.PI / 2), Math.sin(b + Math.PI / 2), 0], v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      var W2 = 1.1, H2 = 0.75, esq = [[-W2, -H2], [W2, -H2], [W2, H2], [-W2, H2]].map(function (q) { return [o[0] + u[0] * q[0] + v[0] * q[1], o[1] + u[1] * q[0] + v[1] * q[1], o[2] + u[2] * q[0] + v[2] * q[1]]; });
      [[0, 3]].forEach(function () { linea3(g, C, [0, 0, 0], o, '#5c636c', 4); });
      var pe = esq.map(function (q) { return C.P(q[0], q[1], q[2]); }), luzP = 0.35 + 0.65 * cosT;
      var pg = g.createLinearGradient(pe[0][0], pe[0][1], pe[2][0], pe[2][1]); pg.addColorStop(0, 'rgb(' + (20 + 40 * luzP | 0) + ',' + (40 + 70 * luzP | 0) + ',' + (90 + 120 * luzP | 0) + ')'); pg.addColorStop(1, 'rgb(' + (10 + 20 * luzP | 0) + ',' + (25 + 40 * luzP | 0) + ',' + (70 + 70 * luzP | 0) + ')');
      poli3(g, pe, pg, '#c9ced4', 2.5);
      for (var i = 1; i < 6; i++) { var f = -W2 + 2 * W2 * i / 6; linea3(g, C, [o[0] + u[0] * f - v[0] * H2, o[1] + u[1] * f - v[1] * H2, o[2] + u[2] * f - v[2] * H2], [o[0] + u[0] * f + v[0] * H2, o[1] + u[1] * f + v[1] * H2, o[2] + u[2] * f + v[2] * H2], 'rgba(200,220,255,.35)', 1); }
      for (var j = 1; j < 4; j++) { var f2b = -H2 + 2 * H2 * j / 4; linea3(g, C, [o[0] - u[0] * W2 + v[0] * f2b, o[1] - u[1] * W2 + v[1] * f2b, o[2] - u[2] * W2 + v[2] * f2b], [o[0] + u[0] * W2 + v[0] * f2b, o[1] + u[1] * W2 + v[1] * f2b, o[2] + u[2] * W2 + v[2] * f2b], 'rgba(200,220,255,.35)', 1); }
      var brillo = Math.pow(cosT, 30); if (brillo > 0.05) { var cpp = C.P(o[0], o[1], o[2]), bg = g.createRadialGradient(cpp[0], cpp[1], 2, cpp[0], cpp[1], 60); bg.addColorStop(0, 'rgba(255,255,255,' + 0.6 * brillo + ')'); bg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = bg; g.beginPath(); g.arc(cpp[0], cpp[1], 60, 0, 7); g.fill(); }
      flecha3(g, C, o, [o[0] + n[0] * 1.3, o[1] + n[1] * 1.3, o[2] + n[2] * 1.3], '#ffd166', 4); var pn = C.P(o[0] + n[0] * 1.35, o[1] + n[1] * 1.35, o[2] + n[2] * 1.35); rotulo(g, 'n (normal)', pn[0] + 8, pn[1] - 6, '#7a5a00', 'left', 12);
      /* rayos de sol que llegan al panel */
      if (sol[2] > 0.02 && rayos.length < 26) rayos.push({ s: rnd() * 2 - 1, q: rnd() * 2 - 1, t: 0 });
      rayos.forEach(function (r) { r.t += dt * 1.4; }); rayos = rayos.filter(function (r) { return r.t < 1.2; });
      g.save(); g.globalCompositeOperation = 'lighter'; rayos.forEach(function (r) { var Pp = [o[0] + u[0] * W2 * r.s + v[0] * H2 * r.q, o[1] + u[1] * W2 * r.s + v[1] * H2 * r.q, o[2] + u[2] * W2 * r.s + v[2] * H2 * r.q], d = Math.max(0, 1 - r.t), A = [Pp[0] + sol[0] * 2.5 * d, Pp[1] + sol[1] * 2.5 * d, Pp[2] + sol[2] * 2.5 * d], B = [Pp[0] + sol[0] * 2.5 * (d + 0.25), Pp[1] + sol[1] * 2.5 * (d + 0.25), Pp[2] + sol[2] * 2.5 * (d + 0.25)]; linea3(g, C, B, A, 'rgba(255,225,120,' + (0.7 * Math.min(1, r.t * 4)) + ')', 2); }); g.restore();
      energia = energia * 0.9 + cosT * 0.1 * (sol[2] > 0 ? 1 : 0);
      var bx = w - 150, by = 14; g.fillStyle = 'rgba(255,255,255,.85)'; rr(g, bx, by, 136, 58, 10); g.fill(); g.fillStyle = '#1f2a36'; g.font = '600 12px system-ui'; g.textAlign = 'left'; g.fillText('⚡ el panel produce', bx + 10, by + 18);
      g.fillStyle = '#dfe5ea'; rr(g, bx + 10, by + 28, 116, 12, 6); g.fill(); var eg = g.createLinearGradient(bx + 10, 0, bx + 126, 0); eg.addColorStop(0, '#f6c445'); eg.addColorStop(1, '#3ec46d'); g.fillStyle = eg; rr(g, bx + 10, by + 28, Math.max(2, 116 * energia), 12, 6); g.fill(); g.fillStyle = '#1f2a36'; g.font = '11px system-ui'; g.fillText(Math.round(energia * 100) + ' % del máximo', bx + 10, by + 52);
      var d0 = n[0] * o[0] + n[1] * o[1] + n[2] * o[2];
      g.font = '12px system-ui'; g.fillStyle = 'rgba(30,40,50,.6)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      lec.innerHTML = 'El panel es un pedazo del plano <b>' + f2(Math.round(n[0] * 100) / 100) + 'x + ' + f2(Math.round(n[1] * 100) / 100) + 'y + ' + f2(Math.round(n[2] * 100) / 100) + 'z = ' + f2(Math.round(d0 * 100) / 100) + '</b>: sus coeficientes son el vector normal n. La energía es proporcional a cos θ, el ángulo entre n y la dirección del Sol (n · s = ' + f2(Math.round(cosT * 100) / 100) + '). Gana el que apunta su normal hacia el Sol.';
    }
    [inc, rum, hora].forEach(function (s) { s.inp.addEventListener('input', function () { L.redibuja(); }); }); animador(L, dib); L.redibuja();
  };

  /* ---------- El producto cruz: la llave, el tornillo y el torque ---------- */
  W.cruz3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 420 : 400; }), C = camara3(L, { yaw: 0.35, pitch: 0.55 });
    var ct = fila(c), lr = U.deslizador(ct, 'largo de la llave |r|', 0.1, 0.4, 0.01, 0.3, function (v) { return f2(v) + ' m'; }), Fm = U.deslizador(ct, 'fuerza |F|', 0, 80, 1, 50, function (v) { return Math.round(v) + ' N'; }), ang = U.deslizador(ct, 'ángulo entre r y F', 0, 180, 1, 90, function (v) { return Math.round(v) + '°'; });
    var lec = U.lectura(c), R = U.reto(c, 'Con una llave de 0,3 m y una fuerza de 50 N perpendicular a la llave, ¿cuánto vale |r × F| (en N·m)?', true, function (v) { return Math.abs(v - 15) < 0.01; },
      '¡Perfecto! |r × F| = |r||F| sen 90° = 0,3·50 = 15 N·m. Si empujas en la dirección de la llave (0°), el tornillo no gira nada.'); R.el.__fin = c.__fin;
    var giro = 0, rot = 0;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, r = lr.v, th = ang.v * Math.PI / 180, F = Fm.v, tau = r * F * Math.sin(th);
      fondoEstudio(g, w, h); C.cx = w / 2; C.cy = h * 0.62; C.esc = Math.min(w * (w < 560 ? 1.05 : 1.6), h * 1.5);
      giro += dt * tau * 0.12; rot = giro;
      madera3(g);
      function madera3(g) { var tab = [[-0.55, -0.4], [0.55, -0.4], [0.55, 0.4], [-0.55, 0.4]].map(function (q) { return C.P(q[0], q[1], -0.02); }); var tg = g.createLinearGradient(tab[0][0], tab[0][1], tab[2][0], tab[2][1]); tg.addColorStop(0, '#8a5a32'); tg.addColorStop(1, '#c48e55'); poli3(g, tab, tg, '#5d3a1c', 1.5); for (var k = -0.5; k < 0.55; k += 0.06) linea3(g, C, [k, -0.4, -0.02], [k + 0.02, 0.4, -0.02], 'rgba(70,40,15,.25)', 1); }
      /* el tornillo (sube o baja girando) */
      var hz = 0.02 + ((giro * 0.004) % 0.06 + 0.06) % 0.06, hx = []; for (var k2 = 0; k2 < 6; k2++) { var a2 = rot + k2 / 6 * 6.2832; hx.push(C.P(0.035 * Math.cos(a2), 0.035 * Math.sin(a2), hz)); }
      var hx2 = []; for (var k3 = 0; k3 < 6; k3++) { var a3 = rot + k3 / 6 * 6.2832; hx2.push(C.P(0.035 * Math.cos(a3), 0.035 * Math.sin(a3), hz + 0.025)); }
      for (var k4 = 0; k4 < 6; k4++) poli3(g, [hx[k4], hx[(k4 + 1) % 6], hx2[(k4 + 1) % 6], hx2[k4]], 'rgb(' + (140 + 60 * Math.cos(rot + k4) | 0) + ',' + (145 + 60 * Math.cos(rot + k4) | 0) + ',' + (155 + 60 * Math.cos(rot + k4) | 0) + ')', '#3d454e', 0.8);
      poli3(g, hx2, '#c9ced4', '#3d454e', 1);
      /* la llave: de el tornillo hacia la dirección rot */
      var ux = [Math.cos(rot), Math.sin(rot), 0], pe = [0, 0, hz + 0.0125], fin = [ux[0] * r, ux[1] * r, hz + 0.0125], nperp = [-ux[1], ux[0], 0];
      var ancho = 0.018, cuerpo = [[pe[0] + nperp[0] * ancho, pe[1] + nperp[1] * ancho], [fin[0] + nperp[0] * ancho, fin[1] + nperp[1] * ancho], [fin[0] - nperp[0] * ancho, fin[1] - nperp[1] * ancho], [pe[0] - nperp[0] * ancho, pe[1] - nperp[1] * ancho]].map(function (q) { return C.P(q[0], q[1], pe[2]); });
      var lg = g.createLinearGradient(cuerpo[0][0], cuerpo[0][1], cuerpo[3][0], cuerpo[3][1]); lg.addColorStop(0, '#eef1f4'); lg.addColorStop(0.5, '#9aa3ad'); lg.addColorStop(1, '#5a636c'); poli3(g, cuerpo, lg, '#3d454e', 1);
      var cab = []; for (var k5 = 0; k5 <= 20; k5++) { var a5 = k5 / 20 * 6.2832; cab.push(C.P(0.05 * Math.cos(a5), 0.05 * Math.sin(a5), pe[2])); } poli3(g, cab, '#b9c0c8', '#3d454e', 1.2);
      /* r, F y r × F */
      var Fd = [Math.cos(rot + th), Math.sin(rot + th), 0], Fs = 0.004 * F, Fend = [fin[0] + Fd[0] * Fs, fin[1] + Fd[1] * Fs, fin[2]];
      flecha3(g, C, [0, 0, fin[2] + 0.005], [fin[0], fin[1], fin[2] + 0.005], '#4ea8ff', 3); flecha3(g, C, fin, Fend, '#ff6b6b', 4);
      var par = [C.P(0, 0, fin[2]), C.P(fin[0], fin[1], fin[2]), C.P(Fend[0], Fend[1], fin[2]), C.P(Fd[0] * Fs, Fd[1] * Fs, fin[2])]; poli3(g, par, 'rgba(255,209,102,.18)', 'rgba(255,209,102,.5)', 1);
      var tz = Math.max(-0.35, Math.min(0.35, tau * 0.02)); flecha3(g, C, [0, 0, hz + 0.03], [0, 0, hz + 0.03 + tz], '#ffd166', 5);
      var pr = C.P(fin[0] / 2, fin[1] / 2, fin[2]), pf = C.P(Fend[0], Fend[1], Fend[2]), pt = C.P(0, 0, hz + 0.03 + tz);
      rotulo(g, 'r', pr[0], pr[1] + 14, '#1f5f9e', 'center', 13); rotulo(g, 'F = ' + Math.round(F) + ' N', pf[0] + 8, pf[1], '#b02a2a', 'left', 12); rotulo(g, 'r × F = ' + f2(Math.round(tau * 100) / 100) + ' N·m', pt[0] + 10, pt[1], '#7a5a00', 'left', 12);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText(w < 560 ? 'arrastra para girar' : 'arrastra para girar · el área amarilla es |r × F|', w / 2, h - 10);
      lec.innerHTML = 'El <b>torque</b> τ = r × F es perpendicular a la llave y a la fuerza: apunta a lo largo del tornillo (regla de la mano derecha) y por eso el tornillo ' + (tau > 0.01 ? 'sube girando a la izquierda' : tau < -0.01 ? 'baja' : 'no se mueve') + '. Su tamaño es |r||F| sen θ = ' + f2(r) + '·' + Math.round(F) + '·sen ' + Math.round(ang.v) + '° = <b>' + f2(Math.round(tau * 100) / 100) + ' N·m</b>, el área del paralelogramo amarillo. Por eso se empuja lejos del tornillo y perpendicular a la llave.';
    }
    [lr, Fm, ang].forEach(function (s) { s.inp.addEventListener('input', function () { L.redibuja(); }); }); animador(L, dib); L.redibuja();
  };

  /* ---------- Sólidos de revolución: el torno del alfarero ---------- */
  W.revolucion3d = function (c, D) {
    var L = lienzoPx(c, function (w) { return w < 560 ? 440 : 420; }), C = camara3(L, { yaw: -0.5, pitch: 0.32 }), metodo = D.metodo || 'discos';
    var formas = { raiz: { n: 'y = √x (copa)', f: function (x) { return Math.sqrt(x); }, a: 0, b: 4, V: 8 * Math.PI }, jarron: { n: 'jarrón y = 1 + 0,5 sen x', f: function (x) { return 1 + 0.5 * Math.sin(x); }, a: 0, b: 6, V: Math.PI * (6 + 0.25 * 3 + (1 - Math.cos(6)) - 0.25 * Math.sin(12) / 4 * 2) }, cono: { n: 'cono y = x/2', f: function (x) { return x / 2; }, a: 0, b: 4, V: 16 * Math.PI / 3 }, cuenco: { n: 'cuenco y = x²/4', f: function (x) { return x * x / 4; }, a: 0, b: 3, V: Math.PI * 243 / 80 } };
    var fsel = 'raiz', giro = 6.2832, auto = false, rodaja = 0;
    var ct = botonesModo(c, Object.keys(formas).map(function (k) { return [k, { raiz: '🍷 Copa', jarron: '🏺 Jarrón', cono: '🍦 Cono', cuenco: '🥣 Cuenco' }[k]]; }), fsel, function (k) { fsel = k; giro = 0; auto = true; });
    var ct2 = fila(c), nd = U.deslizador(ct2, metodo === 'discos' ? 'número de discos' : 'número de cascarones', 2, 30, 1, 8, function (v) { return String(Math.round(v)); });
    boton(ct2, '▶ Girar el torno', function () { giro = 0; auto = true; });
    var lec = U.lectura(c), R = metodo === 'discos'
      ? U.reto(c, 'Al girar y = √x, 0 ≤ x ≤ 4, alrededor del eje x, ¿cuál es el volumen? (2 decimales)', true, function (v) { return Math.abs(v - 8 * Math.PI) < 0.01; }, '¡Eso! V = π∫₀⁴ (√x)² dx = π∫₀⁴ x dx = 8π ≈ 25,13. Los discos se acercan a ese valor cuando son muchos.')
      : U.reto(c, 'Con cascarones: al girar y = x/2, 0 ≤ x ≤ 4, alrededor del eje y, el volumen es 2π∫₀⁴ x·(x/2) dx. ¿Cuánto da? (2 decimales)', true, function (v) { return Math.abs(v - 64 * Math.PI / 3) < 0.01; }, '¡Muy bien! 2π∫₀⁴ x²/2 dx = π·64/3 ≈ 67,02.');
    R.el.__fin = c.__fin;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, F = formas[fsel], n = Math.round(nd.v), a = F.a, b = F.b, ymax = 0; for (var q = 0; q <= 40; q++) ymax = Math.max(ymax, F.f(a + (b - a) * q / 40));
      if (auto) { giro = Math.min(6.2832, giro + dt * 2.4); if (giro >= 6.2832) auto = false; }
      var cas = metodo === 'cascarones';
      paredEstuco(g, w, h, '#f3ede2', '#e2d6c2', 5); mesaMadera(g, w, h * 0.8, h);
      C.cx = w / 2; C.cy = h * (cas ? 0.62 : 0.5); C.esc = Math.min(w / (b - a + 2.6), h / (2 * ymax + 2.4)) * (cas ? 0.8 : 1);
      var x0 = -(a + b) / 2;
      /* el torno: plato giratorio */
      var plato = []; for (var k = 0; k <= 40; k++) { var t = k / 40 * 6.2832; plato.push(cas ? C.P(1.2 * b * Math.cos(t) * 0.9, 1.2 * b * Math.sin(t) * 0.9, -0.15) : C.P(x0 + a - 0.3, 1.25 * ymax * Math.cos(t), 1.25 * ymax * Math.sin(t))); }
      if (cas) { var pg = g.createRadialGradient(C.cx, C.cy, 4, C.cx, C.cy, C.esc * b); pg.addColorStop(0, '#a3a8ae'); pg.addColorStop(1, '#5c636c'); poli3(g, plato, pg, '#3d454e', 2); }
      /* la superficie de revolución (barro o vidrio) */
      var NX = 36, NT = 40, tmax = giro, caras = [], V = C.vista(), luz = [0.4, -0.6, 0.7];
      function S(x, t) { var y = F.f(x); return cas ? [x * Math.cos(t), x * Math.sin(t), y] : [x0 + x, y * Math.cos(t), y * Math.sin(t)]; }
      for (var i = 0; i < NX; i++) for (var j = 0; j < NT; j++) {
        var xa = a + (b - a) * i / NX, xb = a + (b - a) * (i + 1) / NX, ta = tmax * j / NT, tb = tmax * (j + 1) / NT;
        var p4 = [S(xa, ta), S(xb, ta), S(xb, tb), S(xa, tb)], cx = (p4[0][0] + p4[2][0]) / 2, cy = (p4[0][1] + p4[2][1]) / 2, cz = (p4[0][2] + p4[2][2]) / 2;
        var e1 = [p4[1][0] - p4[0][0], p4[1][1] - p4[0][1], p4[1][2] - p4[0][2]], e2 = [p4[3][0] - p4[0][0], p4[3][1] - p4[0][1], p4[3][2] - p4[0][2]], nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], ln = Math.hypot(nn[0], nn[1], nn[2]) || 1;
        nn = nn.map(function (q) { return q / ln; });
        caras.push({ pr: p4.map(function (q) { return C.P(q[0], q[1], q[2]); }), prof: C.P(cx, cy, cz)[2], li: Math.abs(nn[0] * luz[0] + nn[1] * luz[1] + nn[2] * luz[2]), fr: nn[0] * V[0] + nn[1] * V[1] + nn[2] * V[2] });
      }
      caras.sort(function (p, q) { return q.prof - p.prof; });
      caras.forEach(function (cf) { var t = 0.35 + 0.65 * cf.li; poli3(g, cf.pr, 'rgba(' + (205 * t | 0) + ',' + (120 * t | 0) + ',' + (75 * t | 0) + ',.42)', 'rgba(120,60,30,.12)', 0.5); });
      /* el perfil (la región que gira) */
      g.save(); g.strokeStyle = '#7a3b16'; g.lineWidth = 3; g.beginPath(); for (var q2 = 0; q2 <= 60; q2++) { var xx = a + (b - a) * q2 / 60, pp = cas ? C.P(xx, 0, F.f(xx)) : C.P(x0 + xx, 0, F.f(xx)); if (q2) g.lineTo(pp[0], pp[1]); else g.moveTo(pp[0], pp[1]); } g.stroke(); g.restore();
      /* discos o cascarones que aproximan */
      var dx = (b - a) / n, suma = 0, cols = ['#4ea8ff', '#3ec46d', '#f6c445', '#ff8c42'];
      var piezas = []; for (var p = 0; p < n; p++) { var xm = a + dx * (p + 0.5), y = F.f(xm); suma += cas ? 2 * Math.PI * xm * y * dx : Math.PI * y * y * dx; piezas.push({ xm: xm, y: y, prof: cas ? C.P(xm, 0, y / 2)[2] : C.P(x0 + xm, 0, 0)[2] }); }
      piezas.forEach(function (pz, p) {
        var col = cols[p % 4], NN = 30;
        if (!cas) { var xl = x0 + pz.xm - dx / 2, xr = x0 + pz.xm + dx / 2, aro1 = [], aro2 = [];
          for (var k6 = 0; k6 <= NN; k6++) { var t6 = k6 / NN * 6.2832; aro1.push(C.P(xl, pz.y * Math.cos(t6), pz.y * Math.sin(t6))); aro2.push(C.P(xr, pz.y * Math.cos(t6), pz.y * Math.sin(t6))); }
          g.globalAlpha = 0.75; for (var k7 = 0; k7 < NN; k7++) poli3(g, [aro1[k7], aro1[k7 + 1], aro2[k7 + 1], aro2[k7]], col); poli3(g, aro2, col, 'rgba(0,0,0,.25)', 1); g.globalAlpha = 1; }
        else { var r1 = pz.xm - dx / 2, r2 = pz.xm + dx / 2, ab = [], ar = [];
          for (var k8 = 0; k8 <= NN; k8++) { var t8 = k8 / NN * 6.2832; ab.push(C.P(r2 * Math.cos(t8), r2 * Math.sin(t8), 0)); ar.push(C.P(r2 * Math.cos(t8), r2 * Math.sin(t8), pz.y)); }
          g.globalAlpha = 0.5; for (var k9 = 0; k9 < NN; k9++) poli3(g, [ab[k9], ab[k9 + 1], ar[k9 + 1], ar[k9]], col); g.strokeStyle = col; g.lineWidth = 1.5; g.beginPath(); ar.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); g.globalAlpha = 1; }
      });
      var ej1 = cas ? C.P(0, 0, -0.3) : C.P(x0 + a - 0.6, 0, 0), ej2 = cas ? C.P(0, 0, ymax + 0.8) : C.P(x0 + b + 0.6, 0, 0); g.setLineDash([6, 5]); g.strokeStyle = '#2f3640'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ej1[0], ej1[1]); g.lineTo(ej2[0], ej2[1]); g.stroke(); g.setLineDash([]); rotulo(g, cas ? 'eje y' : 'eje x', ej2[0] + 6, ej2[1], '#2f3640', 'left', 12);
      var V0 = 0, M = 400; for (var q3 = 0; q3 < M; q3++) { var xq = a + (b - a) * (q3 + 0.5) / M, yq = F.f(xq); V0 += (cas ? 2 * Math.PI * xq * yq : Math.PI * yq * yq) * (b - a) / M; }
      panel(g, [F.n, (cas ? n + ' cascarones: ' : n + ' discos: ') + f2(Math.round(suma * 100) / 100) + (V0 ? '  ·  exacto: ' + f2(Math.round(V0 * 100) / 100) : '')], 10, 10);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(30,40,50,.55)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 8);
      lec.innerHTML = cas
        ? 'Cada <b>cascarón</b> es un tubo de radio x, altura f(x) y grosor Δx: su volumen es ≈ 2π·x·f(x)·Δx. Sumando y haciendo Δx → 0: <b>V = 2π∫ x f(x) dx</b>. Sube el número de cascarones y mira cómo la suma se acerca al volumen exacto.'
        : 'El alfarero gira el perfil y sale el sólido. Cada <b>disco</b> es un cilindro de radio f(x) y grosor Δx: su volumen es π f(x)² Δx. Sumando y haciendo Δx → 0: <b>V = π∫ f(x)² dx</b>. Sube el número de discos y mira cómo la suma se acerca al volumen exacto.';
    }
    nd.inp.addEventListener('input', function () { L.redibuja(); }); animador(L, dib); L.redibuja();
  };

  /* ---------------------------------------------------------------------
     La proyección ortogonal como una sombra: una linterna alumbra el vector
     --------------------------------------------------------------------- */
  W.sombra3d = function (c, D) {
    var plano = D.modo === 'plano';
    var L = lienzoPx(c, function (w) { return w < 560 ? 440 : 420; }), C = camara3(L, { yaw: plano ? -0.75 : -0.35, pitch: 0.42 });
    var ct = fila(c), th = U.deslizador(ct, plano ? 'inclinación de v sobre el piso' : 'ángulo entre u y v', plano ? 5 : 0, plano ? 90 : 180, 1, plano ? 40 : 50, function (v) { return Math.round(v) + '°'; }),
      lv = U.deslizador(ct, '|v|', 1, 3.5, 0.05, 3, function (v) { return f2(v); });
    var ph = plano ? U.deslizador(ct, 'hacia dónde apunta v', -180, 180, 1, 35, function (v) { return Math.round(v) + '°'; }) : null;
    var lu = plano ? null : U.deslizador(ct, '|u| (largo de la regla)', 1, 4, 0.05, 2.5, function (v) { return f2(v); });
    var ct2 = fila(c), luz = 1, encendiendo = false;
    boton(ct2, '🔦 Apagar y encender la linterna', function () { luz = 0; encendiendo = true; });
    var bGira = boton(ct2, '▶ Mover el vector', function () { auto = !auto; bGira.textContent = auto ? '⏸ Pausa' : '▶ Mover el vector'; }), auto = false, fase = 0;
    var lec = U.lectura(c), R = plano
      ? U.reto(c, 'El sol cae vertical sobre el piso (el plano z = 0) y el vector es v = (2, 3, 4). ¿Cuánto mide su sombra? (2 decimales)', true, function (v) { return Math.abs(v - Math.sqrt(13)) < 0.01; }, '¡Bien! La sombra es (2, 3, 0): se borra la componente perpendicular al piso. Mide √(4 + 9) = √13 ≈ 3,61.')
      : U.reto(c, 'Con u = (1, 2, 2) y v = (3, 0, 3), ¿cuánto mide la sombra de v sobre u, es decir |proy_u v|?', true, function (v) { return Math.abs(v - 3) < 0.01; }, '¡Exacto! u·v = 9 y |u|² = 9, así que proy_u v = (9/9)(1, 2, 2) = (1, 2, 2), que mide 3.');
    R.el.__fin = c.__fin;
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h;
      if (encendiendo) { luz = Math.min(1, luz + dt * 0.9); if (luz >= 1) encendiendo = false; }
      if (auto) { fase += dt * 0.6; if (plano) { ph.v = ((fase * 40) % 360) - 180; th.v = 40 + 30 * Math.sin(fase * 0.8); } else th.v = 90 + 80 * Math.sin(fase); }
      var a = th.v * Math.PI / 180, b = plano ? ph.v * Math.PI / 180 : 0, m = lv.v, ulen = plano ? 0 : lu.v;
      var v = plano ? [m * Math.cos(a) * Math.cos(b), m * Math.cos(a) * Math.sin(b), m * Math.sin(a)] : [m * Math.cos(a), 0, m * Math.sin(a)];
      if (!plano && v[2] < 0) v[2] = -v[2];
      var s = plano ? [v[0], v[1], 0] : [v[0], 0, 0], perp = [v[0] - s[0], v[1] - s[1], v[2] - s[2]];
      /* fondo: cuarto oscuro con piso de madera */
      var cie = g.createLinearGradient(0, 0, 0, h); cie.addColorStop(0, '#141b26'); cie.addColorStop(1, '#2a3340'); g.fillStyle = cie; g.fillRect(0, 0, w, h);
      C.cx = w / 2; C.cy = h * 0.74; C.esc = Math.min(w / 9, h / 6.6);
      var P = 4.2, piso = [[-P, -P * 0.75], [P, -P * 0.75], [P, P * 0.75], [-P, P * 0.75]].map(function (q) { return C.P(q[0], q[1], 0); });
      var pg = g.createLinearGradient(piso[0][0], piso[0][1], piso[2][0], piso[2][1]); pg.addColorStop(0, '#5b3c22'); pg.addColorStop(1, '#8a5f38'); poli3(g, piso, pg);
      for (var k = -P; k <= P; k += 0.5) linea3(g, C, [k, -P * 0.75, 0], [k, P * 0.75, 0], 'rgba(30,15,5,.35)', 1);
      /* charco de luz de la linterna sobre el piso */
      var Lx = s[0] * 0.5, Ly = s[1] * 0.5, H = 3.9, rr0 = 2.3, charco = [];
      for (var q = 0; q <= 48; q++) { var t = q / 48 * 6.2832; charco.push(C.P(Lx + rr0 * Math.cos(t), Ly + rr0 * 0.85 * Math.sin(t), 0.002)); }
      var cc = C.P(Lx, Ly, 0), rg = g.createRadialGradient(cc[0], cc[1], 4, cc[0], cc[1], rr0 * C.esc * 1.1); rg.addColorStop(0, 'rgba(255,236,170,' + 0.55 * luz + ')'); rg.addColorStop(1, 'rgba(255,236,170,' + 0.05 * luz + ')'); poli3(g, charco, rg);
      /* la regla u (sobre la recta) o el piso como plano */
      if (!plano) {
        linea3(g, C, [-P, 0, 0.003], [P, 0, 0.003], 'rgba(255,255,255,.25)', 1.5);
        var rA = [0, -0.12, 0.004], rB = [ulen, -0.12, 0.004], rC = [ulen, 0.12, 0.004], rD = [0, 0.12, 0.004];
        poli3(g, [rA, rB, rC, rD].map(function (p) { return C.P(p[0], p[1], p[2]); }), '#e8d28a', '#8a6a1a', 1);
        for (var mk = 0; mk <= ulen + 1e-6; mk += 0.25) linea3(g, C, [mk, -0.12, 0.005], [mk, mk % 1 < 0.01 ? 0.05 : -0.04, 0.005], 'rgba(60,40,10,.8)', 1);
        flecha3(g, C, [0, 0, 0.01], [ulen, 0, 0.01], '#22c3a6', 4); var pu = C.P(ulen, 0, 0); rotulo(g, 'u', pu[0] + 10, pu[1] + 10, '#0f6e5e', 'left', 14);
      }
      /* la sombra (proyección) en el piso */
      var sh1 = C.P(0, 0, 0.006), sh2 = C.P(s[0], s[1], 0.006);
      g.save(); g.globalAlpha = luz; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 11; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 8; g.beginPath(); g.moveTo(sh1[0], sh1[1]); g.lineTo(sh2[0], sh2[1]); g.stroke(); g.restore();
      if (luz > 0.3) flecha3(g, C, [0, 0, 0.012], [s[0], s[1], 0.012], '#ff9f43', 4.5);
      /* rayos de luz: bajan perpendiculares desde el vector hasta su sombra */
      g.save(); g.globalCompositeOperation = 'lighter';
      for (var r = 1; r <= 9; r++) { var f = r / 9, Pv = [v[0] * f, v[1] * f, v[2] * f], Ps = [s[0] * f, s[1] * f, 0], tope = [Pv[0], Pv[1], H];
        linea3(g, C, tope, Pv, 'rgba(255,236,170,' + 0.12 * luz + ')', 2); var baja = Math.min(1, luz * 1.3 - f * 0.2); if (baja > 0) linea3(g, C, Pv, [Pv[0] + (Ps[0] - Pv[0]) * baja, Pv[1] + (Ps[1] - Pv[1]) * baja, Pv[2] * (1 - baja)], 'rgba(255,236,170,' + 0.45 * luz + ')', 1.6); }
      g.restore();
      /* la componente perpendicular y el ángulo recto */
      g.setLineDash([5, 5]); linea3(g, C, s, v, '#c792ff', 2); g.setLineDash([]);
      var nperp = Math.hypot(perp[0], perp[1], perp[2]), ns = Math.hypot(s[0], s[1]);
      if (nperp > 0.05 && ns > 0.05) { var e = 0.22, us = [s[0] / ns, s[1] / ns, 0], up = [perp[0] / nperp, perp[1] / nperp, perp[2] / nperp], A1 = [s[0] - us[0] * e * Math.sign(s[0] * 1 + s[1] * 0 || 1), s[1] - us[1] * e, 0];
        var q1 = [s[0] - us[0] * e, s[1] - us[1] * e, 0], q2 = [q1[0] + up[0] * e, q1[1] + up[1] * e, up[2] * e], q3 = [s[0] + up[0] * e, s[1] + up[1] * e, up[2] * e]; g.strokeStyle = '#fff'; g.lineWidth = 1.4; var a1 = C.P(q1[0], q1[1], q1[2]), a2 = C.P(q2[0], q2[1], q2[2]), a3 = C.P(q3[0], q3[1], q3[2]); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.lineTo(a3[0], a3[1]); g.stroke(); }
      /* el vector v (una varilla iluminada) */
      flecha3(g, C, [0, 0, 0.015], v, '#4ea8ff', 5); var pv = C.P(v[0], v[1], v[2]); rotulo(g, 'v', pv[0] + 10, pv[1] - 8, '#1f5f9e', 'left', 14);
      /* la linterna */
      var Lp = [Lx, Ly, H], lp = C.P(Lp[0], Lp[1], Lp[2]), sz = Math.max(10, C.esc * 0.32);
      var cono = g.createLinearGradient(lp[0], lp[1], lp[0], cc[1]); cono.addColorStop(0, 'rgba(255,240,190,' + 0.35 * luz + ')'); cono.addColorStop(1, 'rgba(255,240,190,0)');
      g.fillStyle = cono; g.beginPath(); g.moveTo(lp[0] - sz * 0.6, lp[1] + sz * 0.4); g.lineTo(charco[24][0], charco[24][1]); g.lineTo(charco[0][0], charco[0][1]); g.closePath(); g.fill();
      var bg = g.createLinearGradient(lp[0] - sz * 0.5, 0, lp[0] + sz * 0.5, 0); bg.addColorStop(0, '#2b2f36'); bg.addColorStop(0.45, '#8f99a3'); bg.addColorStop(1, '#22262b'); g.fillStyle = bg; rr(g, lp[0] - sz * 0.42, lp[1] - sz * 2.1, sz * 0.84, sz * 1.9, 4); g.fill();
      g.fillStyle = '#c0392b'; g.fillRect(lp[0] - sz * 0.15, lp[1] - sz * 1.5, sz * 0.3, sz * 0.35);
      var cab = g.createLinearGradient(lp[0] - sz * 0.6, 0, lp[0] + sz * 0.6, 0); cab.addColorStop(0, '#3d454e'); cab.addColorStop(0.5, '#c9ced4'); cab.addColorStop(1, '#3d454e'); g.fillStyle = cab; g.beginPath(); g.moveTo(lp[0] - sz * 0.42, lp[1] - sz * 0.25); g.lineTo(lp[0] + sz * 0.42, lp[1] - sz * 0.25); g.lineTo(lp[0] + sz * 0.62, lp[1] + sz * 0.35); g.lineTo(lp[0] - sz * 0.62, lp[1] + sz * 0.35); g.closePath(); g.fill();
      brillo3(g, C, Lp, sz * 1.6 * luz + 1, '255,245,200', 0.9 * luz);
      /* textos */
      var ps = C.P(s[0] / 2, s[1] / 2, 0); rotulo(g, plano ? 'sombra = proyección sobre el piso' : 'sombra = proy_u v', ps[0], ps[1] + 22, '#8a4a10', 'center', 12);
      var pm = C.P((s[0] + v[0]) / 2, (s[1] + v[1]) / 2, v[2] / 2); rotulo(g, 'v − sombra (⊥)', pm[0] + 10, pm[1], '#6b3fa0', 'left', 11);
      g.font = '12px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText('arrastra para girar', w / 2, h - 10);
      var r2 = function (x) { return f2(Math.round(x * 100) / 100); };
      if (plano) lec.innerHTML = 'La luz cae <b>perpendicular al piso</b>, así que la sombra de v = (' + r2(v[0]) + ', ' + r2(v[1]) + ', ' + r2(v[2]) + ') es <b>(' + r2(s[0]) + ', ' + r2(s[1]) + ', 0)</b>: se borra justo la parte de v que es perpendicular al plano (la morada). Sombra + parte perpendicular = v. Mientras más parado esté v, más corta es su sombra.';
      else { var cmp = m * Math.cos(a); lec.innerHTML = 'La linterna alumbra <b>perpendicular a la regla u</b>: la sombra de v es <b>proy_u v = (u·v/|u|²) u</b>, de largo |v| cos θ = ' + r2(m) + '·cos ' + Math.round(th.v) + '° = <b>' + r2(cmp) + '</b>. ' + (th.v > 90.5 ? 'Con θ > 90° la sombra cae <b>al otro lado</b>: la proyección apunta contra u (el coeficiente es negativo).' : Math.abs(th.v - 90) < 0.6 ? 'Con θ = 90° la sombra es un punto: v ⊥ u y la proyección es 0.' : 'Fíjate: si cambias el largo de la regla |u|, la sombra no cambia; solo importa la dirección de u.') + ' La parte morada, v − proy_u v, siempre es perpendicular a u.'; }
    }
    [th, lv, ph, lu].forEach(function (s) { if (s) s.inp.addEventListener('input', function () { auto = false; bGira.textContent = '▶ Mover el vector'; L.redibuja(); }); }); animador(L, dib); L.redibuja();
  };

  /* ---------------------------------------------------------------------
     La proyección en la vida real: la maleta del aeropuerto y el patinador en la rampa
     --------------------------------------------------------------------- */
  function flecha2(g, x1, y1, x2, y2, col, w, et, al) {
    if (Math.hypot(x2 - x1, y2 - y1) < 3) return; g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 3; flecha(g, x1, y1, x2, y2, col, w || 4, 12); g.restore();
    if (et) rotulo(g, et, x2 + (al === 'right' ? -8 : 8), y2 - 12, col, al || 'left', 12);
  }
  W.fuerzautil = function (c, D) {
    var modo = D.modo || 'maleta', L = lienzoPx(c, function (w) { return w < 560 ? 360 : 330; });
    var ct = fila(c), an = U.deslizador(ct, modo === 'maleta' ? 'ángulo de la manija' : 'inclinación de la rampa', modo === 'maleta' ? 0 : 5, modo === 'maleta' ? 90 : 60, 1, modo === 'maleta' ? 45 : 25, function (v) { return Math.round(v) + '°'; });
    var Fs = U.deslizador(ct, modo === 'maleta' ? 'fuerza con que jalas' : 'peso del patinador', modo === 'maleta' ? 20 : 300, modo === 'maleta' ? 100 : 900, modo === 'maleta' ? 1 : 10, modo === 'maleta' ? 60 : 600, function (v) { return Math.round(v) + ' N'; });
    var ct2 = fila(c), corre = true, pos = 0, vel = 0; var bP = boton(ct2, '⏸ Pausa', function () { corre = !corre; bP.textContent = corre ? '⏸ Pausa' : '▶ Seguir'; }); boton(ct2, '↺ Empezar de nuevo', function () { pos = 0; vel = 0; });
    var lec = U.lectura(c), R = modo === 'maleta'
      ? U.reto(c, 'Jalas la maleta con 60 N y la manija forma 60° con el piso. ¿Cuántos newtons sirven de verdad para avanzar?', true, function (v) { return Math.abs(v - 30) < 0.05; }, '¡Eso! La parte útil es la proyección de la fuerza sobre el piso: 60·cos 60° = 30 N. Los otros 60·sen 60° ≈ 52 N solo levantan la maleta.')
      : U.reto(c, 'Un patinador de 600 N está en una rampa de 30°. ¿Cuántos newtons de su peso lo empujan rampa abajo?', true, function (v) { return Math.abs(v - 300) < 0.5; }, '¡Correcto! Es la proyección del peso sobre la rampa: 600·sen 30° = 300 N. La otra parte, 600·cos 30° ≈ 520 N, lo aprieta contra la rampa.');
    R.el.__fin = c.__fin;
    var rnd = azar(6), viajeros = []; for (var i = 0; i < 5; i++) viajeros.push([rnd(), 0.5 + rnd() * 0.5, ['#5d6d7e', '#a04000', '#1f618d', '#7d3c98', '#117a65'][i]]);
    function dib(dt, now) {
      var g = L.g, w = L.w, h = L.h, a = an.v * Math.PI / 180, F = Fs.v;
      if (modo === 'maleta') {
        var util = F * Math.cos(a), sube = F * Math.sin(a);
        if (corre) { vel += (util / 40 - vel * 0.9) * dt; pos += vel * dt * 60; }
        /* aeropuerto: ventanal, avión, piso de baldosas que se mueve */
        var piso = h * 0.78, cie = g.createLinearGradient(0, 0, 0, piso); cie.addColorStop(0, '#9fd0ef'); cie.addColorStop(1, '#e3f1f8'); g.fillStyle = cie; g.fillRect(0, 0, w, piso);
        var desp = -(pos * 0.25) % 160; for (var x = desp - 160; x < w + 160; x += 160) { metalV(g, x, 0, 10, piso, '#9aa4ae'); }
        g.save(); var ax = ((w * 0.7 - pos * 0.12) % (w + 300) + w + 300) % (w + 300) - 150, ay = piso * 0.5; g.translate(ax, ay);
        var fu = g.createLinearGradient(0, -12, 0, 12); fu.addColorStop(0, '#ffffff'); fu.addColorStop(1, '#b9c4cf'); g.fillStyle = fu; g.beginPath(); g.ellipse(0, 0, 90, 13, 0, 0, 7); g.fill(); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-80, -5); g.lineTo(-96, -40); g.lineTo(-66, -8); g.fill();
        g.fillStyle = '#d6dde4'; g.beginPath(); g.moveTo(-10, 4); g.lineTo(-40, 30); g.lineTo(10, 6); g.fill(); g.fillStyle = '#3d6f9a'; for (var v2 = -60; v2 < 70; v2 += 10) { g.beginPath(); g.arc(v2, -3, 2.2, 0, 7); g.fill(); } g.restore();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, piso - 40, w, 4);
        var dsp = -(pos % 60); for (var bx = dsp - 60; bx < w + 60; bx += 60) { var tg = g.createLinearGradient(bx, piso, bx + 60, h); tg.addColorStop(0, '#d9d4cb'); tg.addColorStop(1, '#bdb5a8'); g.fillStyle = tg; g.fillRect(bx, piso, 59, h - piso); }
        g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, piso, w, 2);
        viajeros.forEach(function (vj, k) { var vx = ((vj[0] * w * 1.4 - pos * 0.5 * vj[1]) % (w * 1.4) + w * 1.4) % (w * 1.4) - w * 0.2; g.globalAlpha = 0.35; persona(g, vx, piso - 2, 52, vj[2], now / 300 + k); g.globalAlpha = 1; });
        /* la persona y la maleta */
        var mov = w < 560, mx = mov ? w * 0.05 : w * 0.3, my = piso, mw = 40, mh = 52, ex = mx + mw - 6, ey = my - mh - 4, Lm = mov ? 66 : 96, hx = ex + Lm * Math.cos(a), hy = ey - Lm * Math.sin(a);
        var pie = piso, ph = Math.max(112, (piso - hy) / 0.68), px = hx + 30, sho = pie - ph * 0.74;
        persona(g, px, pie, ph, '#2d3640', now / 250 * Math.min(1, vel * 3));
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(mx + mw / 2, my + 2, 32, 5, 0, 0, 7); g.fill();
        var sg = g.createLinearGradient(mx, 0, mx + mw, 0); sg.addColorStop(0, '#2f6fa3'); sg.addColorStop(0.5, '#5aa0e0'); sg.addColorStop(1, '#1f4f7a'); g.fillStyle = sg; rr(g, mx, my - mh - 6, mw, mh, 8); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; for (var q = 1; q < 4; q++) { g.beginPath(); g.moveTo(mx + q * mw / 4, my - mh - 2); g.lineTo(mx + q * mw / 4, my - 10); g.stroke(); }
        [mx + 8, mx + mw - 8].forEach(function (rx) { g.fillStyle = '#222'; g.beginPath(); g.arc(rx, my - 4, 5, 0, 7); g.fill(); g.fillStyle = '#888'; g.beginPath(); g.arc(rx, my - 4, 2, 0, 7); g.fill(); });
        g.strokeStyle = '#3d454e'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex, ey + 4); g.lineTo(hx, hy); g.stroke();
        g.strokeStyle = '#2d3640'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(px, sho); g.lineTo(hx + 3, hy); g.stroke(); g.fillStyle = '#c98e64'; g.beginPath(); g.arc(hx + 2, hy, 3.5, 0, 7); g.fill();
        /* los vectores: F, su sombra sobre el piso (parte útil) y la parte que levanta */
        var k = 1.3, Fx = F * Math.cos(a) * k, Fy = F * Math.sin(a) * k, ox = mov ? w - 150 : w * 0.62, oy = mov ? 218 : piso - 40;
        g.fillStyle = 'rgba(255,255,255,.72)'; rr(g, ox - 20, oy - 145, mov ? 166 : 240, 165, 12); g.fill(); rotulo(g, 'diagrama de fuerzas', ox - 8, oy - 130, '#2c3e50', 'left', 11, false);
        g.setLineDash([3, 4]); g.strokeStyle = 'rgba(44,62,80,.35)'; g.beginPath(); g.moveTo((ex + hx) / 2, (ey + hy) / 2); g.lineTo(ox, oy); g.stroke(); g.setLineDash([]);
        g.setLineDash([4, 4]); g.strokeStyle = 'rgba(80,60,140,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox + Fx, oy - Fy); g.lineTo(ox + Fx, oy); g.stroke(); g.setLineDash([]);
        flecha2(g, ox, oy, ox + Fx, oy, '#e67e22', 5, 'avanza: ' + Math.round(util) + ' N'); flecha2(g, ox + Fx, oy, ox + Fx, oy - Fy, '#7d3c98', 3, sube > 1 ? 'levanta: ' + Math.round(sube) + ' N' : '');
        flecha2(g, ox, oy, ox + Fx, oy - Fy, '#c0392b', 4.5); rotulo(g, 'F = ' + Math.round(F) + ' N', ox + Fx * 0.45 - 12, oy - Fy * 0.45 - 14, '#c0392b', 'right', 12);
        g.strokeStyle = '#c0392b'; g.lineWidth = 1.5; g.beginPath(); g.arc(ox, oy, 26, -a, 0); g.stroke(); rotulo(g, Math.round(an.v) + '°', ox + 34, oy - 12, '#c0392b', 'left', 11, false);
        panel(g, ['velocidad: ' + f2(Math.round(vel * 3.6 * 10) / 10) + ' km/h', 'parte útil = F cos θ = ' + Math.round(util) + ' N'], 10, 10);
        lec.innerHTML = 'Jalas con F = ' + Math.round(F) + ' N, pero la maleta solo puede moverse por el piso: lo que la hace avanzar es la <b>proyección de F sobre el piso</b>, F cos θ = <b>' + Math.round(util) + ' N</b> (la «sombra» de F). Lo demás, F sen θ = ' + Math.round(sube) + ' N, la levanta y no la adelanta. Por eso cansa más jalar con la manija muy parada. En 10 m haces un trabajo útil de ' + Math.round(util * 10) + ' J.';
      } else {
        var bajaF = F * Math.sin(a), aprieta = F * Math.cos(a);
        if (corre) { vel += (bajaF / F * 9.8 * 0.35) * dt; pos += vel * dt * 40; if (pos > 1) { pos = 0; vel = 0; } }
        var cie2 = g.createLinearGradient(0, 0, 0, h); cie2.addColorStop(0, '#f6b26b'); cie2.addColorStop(1, '#fde3c0'); g.fillStyle = cie2; g.fillRect(0, 0, w, h);
        nube(g, w * 0.7, 40, 0.8); nube(g, w * 0.2, 60, 0.6);
        var base = h - 30, x0 = w * 0.08, x1 = w * 0.92, alto = Math.min(base - 110, (x1 - x0) * Math.tan(a)), xr = x0 + alto / Math.tan(a); if (xr > x1) xr = x1;
        concreto(g, 0, base, w, h - base, '#b9b4aa', '#8d887e', 3);
        g.save(); g.beginPath(); g.moveTo(x0, base); g.lineTo(xr, base); g.lineTo(x0, base - alto); g.closePath(); g.clip(); concreto(g, 0, 0, w, h, '#cfc9be', '#9c968b', 9); g.restore();
        g.strokeStyle = '#6b665d'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, base - alto); g.lineTo(xr, base); g.stroke();
        metalH(g, x0 - 4, base - alto - 6, 6, 6, '#9aa4ae');
        g.fillStyle = '#c94f3b'; g.font = '600 13px system-ui'; g.textAlign = 'center';
        var s = 0.12 + 0.8 * pos, sx = x0 + (xr - x0) * s, sy = base - alto * (1 - s), ux = Math.cos(a), uy = Math.sin(a);
        g.save(); g.translate(sx, sy); g.rotate(a);
        g.fillStyle = '#3d2a1a'; rr(g, -28, -10, 56, 6, 3); g.fill(); g.fillStyle = '#e74c3c'; g.fillRect(-26, -10, 52, 2);
        [-18, 18].forEach(function (rx) { g.fillStyle = '#f5f5f5'; g.beginPath(); g.arc(rx, -2, 4, 0, 7); g.fill(); });
        persona(g, 0, -10, 70, '#1f3a5f', 0.6); g.restore();
        var cx = x0 + (xr - x0) * 0.72, cy = base - alto * 0.28 - (w < 560 ? 150 : 120), kk = 0.13, Wl = F * kk; g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, cx - 70, cy - 22, 190, Wl + 40, 12); g.fill(); rotulo(g, 'diagrama de fuerzas', cx + 25, cy - 10, '#2c3e50', 'center', 11, false); g.setLineDash([3, 4]); g.strokeStyle = 'rgba(44,62,80,.35)'; g.beginPath(); g.moveTo(sx - Math.sin(a) * 40, sy - Math.cos(a) * 40); g.lineTo(cx, cy); g.stroke(); g.setLineDash([]);
        flecha2(g, cx, cy, cx, cy + Wl, '#2c3e50', 4); rotulo(g, 'peso ' + Math.round(F) + ' N', cx - 8, cy + Wl * 0.6, '#2c3e50', 'right', 12);
        var bx2 = cx + ux * bajaF * kk, by2 = cy + uy * bajaF * kk; flecha2(g, cx, cy, bx2, by2, '#e67e22', 5, 'rampa abajo: ' + Math.round(bajaF) + ' N');
        g.setLineDash([4, 4]); g.strokeStyle = 'rgba(80,60,140,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx2, by2); g.lineTo(cx, cy + Wl); g.stroke(); g.setLineDash([]);
        flecha2(g, bx2, by2, cx, cy + Wl, '#7d3c98', 3, 'aprieta: ' + Math.round(aprieta) + ' N');
        g.strokeStyle = '#2c3e50'; g.lineWidth = 1.5; g.beginPath(); g.arc(xr, base, 34, Math.PI, Math.PI + a); g.stroke(); rotulo(g, Math.round(an.v) + '°', xr - 44, base - 12, '#2c3e50', 'right', 11, false);
        panel(g, ['velocidad: ' + f2(Math.round(vel * 3.6 * 10) / 10) + ' km/h', 'parte que baja = P sen β = ' + Math.round(bajaF) + ' N'], Math.max(10, w - 250), 10);
        lec.innerHTML = 'El peso apunta hacia abajo, pero el patinador solo puede moverse a lo largo de la rampa: lo que lo acelera es la <b>proyección del peso sobre la rampa</b>, P sen β = <b>' + Math.round(bajaF) + ' N</b>. La otra parte, P cos β = ' + Math.round(aprieta) + ' N, es perpendicular a la rampa y solo lo aprieta contra ella. Más inclinada la rampa, más larga la «sombra» del peso sobre ella y más rápido baja.';
      }
    }
    [an, Fs].forEach(function (s) { s.inp.addEventListener('input', function () { L.redibuja(); }); }); animador(L, dib); L.redibuja();
  };
})();

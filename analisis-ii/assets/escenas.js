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
      c.style.width = w + 'px'; c.style.height = alto + 'px'; c.width = w * dpr; c.height = alto * dpr;
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
  function rotulo(g, t, x, y, col, al, tam, fondo) {
    g.save(); g.font = (tam && tam > 13 ? '600 ' : '') + (tam || 13) + 'px system-ui, sans-serif'; g.textAlign = al || 'center'; g.textBaseline = 'middle';
    if (fondo !== false) { var w = g.measureText(t).width + 10, x0 = al === 'left' ? x - 5 : al === 'right' ? x - w + 5 : x - w / 2; g.fillStyle = fondo || 'rgba(255,255,255,.85)'; rr(g, x0, y - 10, w, 20, 7); g.fill(); }
    g.fillStyle = col || COL.tinta; g.fillText(t, x, y + 0.5); g.restore();
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
  function suelo(g, w, y0, h, col) {
    var gr = g.createLinearGradient(0, y0, 0, h); gr.addColorStop(0, col || '#8fc27a'); gr.addColorStop(1, '#5f9a49'); g.fillStyle = gr; g.fillRect(0, y0, w, h - y0);
    var r = azar(3); for (var i = 0; i < Math.min(160, w / 4); i++) { var px = r() * w, py = y0 + 3 + r() * (h - y0), l = 3 + r() * 4; g.strokeStyle = 'rgba(40,' + (110 + r() * 50 | 0) + ',40,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 3, py - l); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y0, w, 2);
  }

  function sombraPiso(g, x, y, rx, ry, a) {          /* sombra suave proyectada (luz arriba a la derecha) */
    var gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgba(20,35,15,' + (a || 0.32) + ')'); gr.addColorStop(1, 'rgba(20,35,15,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill(); g.restore();
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
    var H = 12, Rr = 6, Q = 8, L = lienzoPx(c, 340), ct = fila(c), hs = U.deslizador(ct, 'profundidad h =', 0.3, 11.5, 0.01, 2, function (v) { return f2(v) + ' m'; });
    reloj(ct, hs, 11.5, 0.9, '▶ Abrir la llave');
    var lec = U.lectura(c), R = U.reto(c, '¿Qué tan rápido sube el nivel cuando h = 4 m? (m/min, 3 decimales)', true, function (v) { return Math.abs(v - 2 / Math.PI) < 0.003; },
      '¡Bien! r = h/2, V = πh³/12 y h′ = 4·8/(πh²) = 2/π ≈ 0,637 m/min.'); R.el.__fin = c.__fin;
    var gotas = [];
    function dib(t) {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -9, 9, -1, 14.8, 8), hh = hs.v, r = hh / 2, vol = Math.PI * r * r * hh / 3, hp = 4 * Q / (Math.PI * hh * hh);
      cielo(g, w, h, '#eef3f7', '#f8fafb'); g.fillStyle = '#d9dee3'; g.fillRect(0, V.Y(-0.2), w, h);
      g.fillStyle = 'rgba(120,140,160,.15)'; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.closePath(); g.fill();
      var gr = g.createLinearGradient(0, V.Y(hh), 0, V.Y(0)); gr.addColorStop(0, '#5fb3e6'); gr.addColorStop(1, '#1f6fae');
      g.fillStyle = gr; g.beginPath(); g.moveTo(V.X(-r), V.Y(hh)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(r), V.Y(hh)); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(V.X(0), V.Y(hh), Math.max(1, r * V.s), Math.max(1, r * V.s * 0.12), 0, 0, 7); g.fill();
      var brillo = g.createLinearGradient(V.X(-Rr), 0, V.X(Rr), 0); brillo.addColorStop(0, 'rgba(255,255,255,0)'); brillo.addColorStop(0.28, 'rgba(255,255,255,.35)'); brillo.addColorStop(0.36, 'rgba(255,255,255,0)'); brillo.addColorStop(0.85, 'rgba(0,0,0,.12)');
      g.fillStyle = brillo; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.closePath(); g.fill();
      sombraPiso(g, V.X(-1.5), V.Y(-0.2) + 2, 60, 6, 0.3);
      g.strokeStyle = '#56616d'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-Rr), V.Y(H)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(Rr), V.Y(H)); g.stroke();
      g.beginPath(); g.ellipse(V.X(0), V.Y(H), Rr * V.s, Rr * V.s * 0.12, 0, 0, 7); g.stroke();
      g.strokeStyle = '#7b8794'; g.lineWidth = 4; g.beginPath(); g.moveTo(V.X(0), V.Y(0)); g.lineTo(V.X(0), V.Y(-0.2)); g.stroke();
      g.fillStyle = '#8a96a3'; rr(g, V.X(-8.5), V.Y(14.6), V.X(-0.6) - V.X(-8.5), 9, 4); g.fill(); rr(g, V.X(-1.2), V.Y(14.6), V.X(0.4) - V.X(-1.2), 16, 4); g.fill();
      g.strokeStyle = 'rgba(70,160,225,.85)'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(V.X(-0.4), V.Y(14.6) + 16); g.lineTo(V.X(-0.4), V.Y(hh)); g.stroke();
      rotulo(g, '8 m³/min', V.X(-0.4) - 8, V.Y(13.4), '#1f6fae', 'right');
      g.setLineDash([5, 4]); g.strokeStyle = COL.gris; g.lineWidth = 1.2; g.beginPath(); g.moveTo(V.X(Rr) + 12, V.Y(0)); g.lineTo(V.X(Rr) + 12, V.Y(H)); g.stroke(); g.beginPath(); g.moveTo(V.X(r), V.Y(hh)); g.lineTo(V.X(Rr) + 30, V.Y(hh)); g.stroke(); g.setLineDash([]);
      rotulo(g, '12 m', V.X(Rr) + 12, V.Y(H / 2), '#56616d'); rotulo(g, 'h = ' + f2(hh), V.X(Rr) + 34, V.Y(hh), COL.teal, 'left');
      rotulo(g, 'r = ' + f2(Math.round(r * 100) / 100), V.X(r) + 30, V.Y(hh) - 16, '#1f6fae', 'left'); rotulo(g, 'radio 6 m', V.X(Rr) + 8, V.Y(H) - 14, '#56616d', 'left');
      panel(g, ['V = πh³/12 = ' + f2(Math.round(vol * 10) / 10) + ' m³', 'el nivel sube a ' + f2(Math.round(hp * 1000) / 1000) + ' m/min'], 10, 10);
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
      g.fillStyle = '#5f6b78'; g.fillRect(ex - 16, ey - 20, 32, 20); g.fillStyle = '#8895a3'; g.beginPath(); g.ellipse(ex, ey - 30, 18, 9, -0.5, 0, 7); g.fill(); g.strokeStyle = '#5f6b78'; g.lineWidth = 3; g.beginPath(); g.moveTo(ex, ey - 20); g.lineTo(ex, ey - 28); g.stroke();
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
      g.fillStyle = '#39465c'; g.fillRect(0, V.Y(0), w, h);
      g.fillStyle = '#c9b9a0'; g.fillRect(V.X(12), V.Y(7.2), w - V.X(12), V.Y(0) - V.Y(7.2));
      var lx = V.X(0), ly = V.Y(0) - 4, top = Math.min(S, 7.2);
      var gl = g.createRadialGradient(lx, ly, 2, lx, ly, w * 0.9); gl.addColorStop(0, 'rgba(255,236,150,.55)'); gl.addColorStop(1, 'rgba(255,236,150,0)');
      g.fillStyle = gl; g.beginPath(); g.moveTo(lx, ly); g.lineTo(V.X(12), V.Y(7.2)); g.lineTo(V.X(12), V.Y(0)); g.closePath(); g.fill();
      g.fillStyle = 'rgba(20,24,35,.78)'; g.fillRect(V.X(12), V.Y(top), 10, V.Y(0) - V.Y(top));
      g.strokeStyle = 'rgba(255,236,150,.7)'; g.setLineDash([5, 5]); g.lineWidth = 1.3; g.beginPath(); g.moveTo(lx, ly); g.lineTo(V.X(12), V.Y(S)); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#ffe58a'; g.beginPath(); g.moveTo(lx - 12, ly + 4); g.lineTo(lx + 12, ly + 4); g.lineTo(lx + 6, ly - 10); g.lineTo(lx - 6, ly - 10); g.fill(); g.fillStyle = '#fff6c9'; g.beginPath(); g.arc(lx, ly - 3, 5, 0, 7); g.fill();
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
      g.fillStyle = '#9ccc86'; g.fillRect(0, 0, w, h);
      var an = 26 * V.s; g.fillStyle = '#5b6470'; g.fillRect(0, V.Y(0) - an / 2, w, an); g.fillRect(V.X(0) - an / 2, 0, an, h);
      g.strokeStyle = '#f2d15a'; g.lineWidth = 2; g.setLineDash([10, 9]); g.beginPath(); g.moveTo(0, V.Y(0)); g.lineTo(w, V.Y(0)); g.moveTo(V.X(0), 0); g.lineTo(V.X(0), h); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#fff'; for (var k = -3; k <= 3; k++) { g.fillRect(V.X(0) - an / 2 - 10, V.Y(0) + k * 4 - 1, 6, 2); }
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
    var chk = alLlegar(x, 600, 2, R, c), r = azar(5), ovejas = []; for (var i = 0; i < 14; i++) ovejas.push([r(), r(), r() < 0.5 ? 1 : -1]);
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, y = P - 2 * xx, V = vista(L, -40, 2440, -1250, 160, 8);
      g.fillStyle = '#a3cf8c'; g.fillRect(0, 0, w, h);
      var gr = g.createLinearGradient(0, 0, 0, V.Y(0)); gr.addColorStop(0, '#2f87c4'); gr.addColorStop(1, '#5fb3e6'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, V.Y(0)); for (var px = w; px >= 0; px -= 8) g.lineTo(px, V.Y(0) + 3 * Math.sin(px / 18)); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; for (var k = 0; k < 6; k++) { var yy = V.Y(0) * (0.2 + k * 0.13); g.beginPath(); g.moveTo(w * 0.1 + k * 40, yy); g.quadraticCurveTo(w * 0.1 + k * 40 + 14, yy - 4, w * 0.1 + k * 40 + 28, yy); g.stroke(); }
      var x0 = 1200 - y / 2, X0 = V.X(x0), X1 = V.X(x0 + y), Y0 = V.Y(0), Y1 = V.Y(-xx);
      g.fillStyle = '#c6e3a6'; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
      g.strokeStyle = '#8b5a2b'; g.lineWidth = 3; g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0, Y1); g.lineTo(X1, Y1); g.lineTo(X1, Y0); g.stroke();
      g.fillStyle = '#6d4520'; var per = [[X0, Y0, X0, Y1], [X0, Y1, X1, Y1], [X1, Y1, X1, Y0]];
      per.forEach(function (s) { var n = Math.max(2, Math.round(Math.hypot(s[2] - s[0], s[3] - s[1]) / 18)); for (var q = 0; q <= n; q++) g.fillRect(s[0] + (s[2] - s[0]) * q / n - 2, s[1] + (s[3] - s[1]) * q / n - 2, 4, 4); });
      ovejas.forEach(function (o) { var ox = X0 + 10 + o[0] * (X1 - X0 - 20), oy = Y0 + 10 + o[1] * (Y1 - Y0 - 16); if (X1 - X0 < 26 || Y1 - Y0 < 24) return; g.fillStyle = '#fff'; g.beginPath(); g.arc(ox, oy, 4.2, 0, 7); g.arc(ox + 3 * o[2], oy - 1, 3.4, 0, 7); g.arc(ox - 3 * o[2], oy, 3.6, 0, 7); g.fill(); g.fillStyle = '#333'; g.beginPath(); g.arc(ox + 6.5 * o[2], oy - 1.5, 2, 0, 7); g.fill(); });
      rotulo(g, 'río (no se cerca)', w / 2, V.Y(0) / 2, '#fff', 'center', 13, 'rgba(0,60,110,.35)');
      rotulo(g, 'x = ' + Math.round(xx), X0 - 6, (Y0 + Y1) / 2, '#6d4520', 'right'); rotulo(g, 'y = 2400 − 2x = ' + Math.round(y), (X0 + X1) / 2, Y1 + 14, '#6d4520');
      Gf.dib(xx); lec.innerHTML = 'Área A(x) = x(2400 − 2x) = <b>' + miles(Ar(xx)) + ' m²</b> · A′(x) = 2400 − 4x = ' + Math.round(2400 - 4 * xx) + ' <span style="color:#56606b">(gráfica en miles de m²)</span>';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.alambre = function (c, D) {
    var L = lienzoPx(c, 260), Ar = function (x) { return x * x / 16 + (10 - x) * (10 - x) / (4 * Math.PI); };
    var Gf = grafOpt(c, Ar, 0, 10, 8.5, 1, 2);
    var ct = fila(c), x = U.deslizador(ct, 'alambre para el cuadrado x =', 0, 10, 0.01, 4, function (v) { return f2(v) + ' m'; });
    var lec = U.lectura(c), R = U.reto(c, '¿Cuántos metros hay que usar en el cuadrado para que el área total sea MÁXIMA?', true, function (v) { return Math.abs(v) < 0.005; },
      '¡Ojo al truco! El máximo está en un extremo: x = 0, todo el alambre al círculo (A ≈ 7,96 m²). El punto crítico x = 40/(4 + π) ≈ 5,60 es un mínimo.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, lado = xx / 4, rad = (10 - xx) / (2 * Math.PI), V = vista(L, -0.3, 10.3, -3.6, 1.2, 8);
      cielo(g, w, h, '#fbf7ef', '#f3eee2');
      g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = '#b06d2b'; g.beginPath(); g.moveTo(V.X(0), V.Y(0.6)); g.lineTo(V.X(xx), V.Y(0.6)); g.stroke();
      g.strokeStyle = '#7d8a96'; g.beginPath(); g.moveTo(V.X(xx), V.Y(0.6)); g.lineTo(V.X(10), V.Y(0.6)); g.stroke();
      g.save(); g.translate(V.X(xx), V.Y(0.6)); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-7, -16); g.lineTo(0, -4); g.lineTo(7, -16); g.lineWidth = 2; g.strokeStyle = '#c0392b'; g.stroke(); g.beginPath(); g.arc(-8, -20, 4, 0, 7); g.arc(8, -20, 4, 0, 7); g.stroke(); g.restore();
      rotulo(g, f2(Math.round(xx * 100) / 100) + ' m', V.X(xx / 2), V.Y(0.6) + 16, '#b06d2b'); rotulo(g, f2(Math.round((10 - xx) * 100) / 100) + ' m', V.X((10 + xx) / 2), V.Y(0.6) + 16, '#56616d');
      var cy = V.Y(-1.9);
      if (lado > 0.005) { g.fillStyle = 'rgba(176,109,43,.18)'; g.strokeStyle = '#b06d2b'; g.lineWidth = 3.5; g.fillRect(V.X(2.6) - lado * V.s / 2, cy - lado * V.s / 2, lado * V.s, lado * V.s); g.strokeRect(V.X(2.6) - lado * V.s / 2, cy - lado * V.s / 2, lado * V.s, lado * V.s); }
      if (rad > 0.005) { g.fillStyle = 'rgba(125,138,150,.18)'; g.strokeStyle = '#7d8a96'; g.lineWidth = 3.5; g.beginPath(); g.arc(V.X(7.3), cy, rad * V.s, 0, 7); g.fill(); g.stroke(); }
      rotulo(g, '□ ' + f2(Math.round(lado * lado * 100) / 100) + ' m²', V.X(2.6), V.Y(-3.4), '#b06d2b'); rotulo(g, '○ ' + f2(Math.round(Math.PI * rad * rad * 100) / 100) + ' m²', V.X(7.3), V.Y(-3.4), '#56616d');
      Gf.dib(xx); lec.innerHTML = 'A(x) = x²/16 + (10 − x)²/(4π) = <b>' + f2(Math.round(Ar(xx) * 1000) / 1000) + ' m²</b> · compara los extremos A(0) ≈ 7,958 y A(10) = 6,25 con el punto crítico';
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.cajaabierta = function (c, D) {
    var Vol = 32000, L = lienzoPx(c, 280), M = function (x) { return x * x + 4 * Vol / x; };
    var Gf = grafOpt(c, function (x) { return M(x) / 1000; }, 10, 90, 14, 10, 2);
    var ct = fila(c), x = U.deslizador(ct, 'lado de la base x =', 12, 88, 0.1, 25, function (v) { return f2(v) + ' cm'; });
    var lec = U.lectura(c), R = U.reto(c, 'Encuentra la base que usa menos material.', false, function () { return true; }, '¡Mínimo! Base de 40 × 40 cm y altura 20 cm: 4800 cm² de material.'); R.el.__fin = c.__fin;
    var chk = alLlegar(x, 40, 0.25, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, hh = Vol / (xx * xx); cielo(g, w, h, '#fbf7ef', '#f1ebde');
      var k = Math.min(2.3, 200 / Math.max(xx * 1.45, hh + xx * 0.45)), bw = xx * k, bh = hh * k, dx = xx * k * 0.45, dy = xx * k * 0.28, ox = w / 2 - (bw + dx) / 2, oy = h - 26;
      g.fillStyle = 'rgba(80,60,30,.25)'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox - bh * 0.35, oy + 6); g.lineTo(ox + bw - bh * 0.35 + dx * 0.2, oy + 6); g.lineTo(ox + bw + dx, oy - dy); g.lineTo(ox + bw, oy); g.closePath(); g.fill();
      g.lineJoin = 'round'; g.strokeStyle = '#8a5a2b'; g.lineWidth = 2;
      g.fillStyle = '#c99a62'; g.beginPath(); g.moveTo(ox + dx, oy - dy - bh); g.lineTo(ox + dx + bw, oy - dy - bh); g.lineTo(ox + dx + bw, oy - dy); g.lineTo(ox + dx, oy - dy); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#b5844c'; g.beginPath(); g.moveTo(ox, oy - bh); g.lineTo(ox + dx, oy - dy - bh); g.lineTo(ox + dx, oy - dy); g.lineTo(ox, oy); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#dcb57f'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + bw, oy); g.lineTo(ox + bw, oy - bh); g.lineTo(ox, oy - bh); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#c99a62'; g.beginPath(); g.moveTo(ox + bw, oy); g.lineTo(ox + bw + dx, oy - dy); g.lineTo(ox + bw + dx, oy - dy - bh); g.lineTo(ox + bw, oy - bh); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(138,90,43,.6)'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(ox, oy - bh); g.lineTo(ox + bw, oy - bh); g.stroke(); g.setLineDash([]);
      rotulo(g, 'x = ' + f2(Math.round(xx * 10) / 10), ox + bw / 2, oy + 13, '#6d4520'); rotulo(g, 'h = ' + f2(Math.round(hh * 10) / 10), ox + bw + dx + 8, oy - dy - bh / 2, '#6d4520', 'left');
      panel(g, ['sin tapa · V = 32 000 cm³', 'material = ' + miles(M(xx)) + ' cm²'], 10, 10);
      Gf.dib(xx); lec.innerHTML = 'h = 32 000/x² ⇒ M(x) = x² + 4xh = x² + 128 000/x = <b>' + miles(M(xx)) + ' cm²</b> · M′(x) = 2x − 128 000/x² = ' + f2(Math.round((2 * xx - 128000 / (xx * xx)) * 10) / 10) + ' <span style="color:#56606b">(gráfica en miles de cm²)</span>';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.tuberia = function (c, D) {
    var L = lienzoPx(c, 280), C = function (x) { return 2 * Math.sqrt(4 + x * x) + (4 - x); };
    var Gf = grafOpt(c, C, 0, 4, 9, 1, 1);
    var ct = fila(c), x = U.deslizador(ct, 'sale a la costa a x =', 0, 4, 0.005, 3, function (v) { return f2(v) + ' km'; });
    var lec = U.lectura(c), R = U.reto(c, 'Mueve el punto P hasta que el costo sea mínimo (en unidades de k).', false, function () { return true; }, '¡Mínimo! x = 2/√3 ≈ 1,155 km y C = 4 + 2√3 ≈ 7,46k.'); R.el.__fin = c.__fin;
    var chk = alLlegar(x, 2 / Math.sqrt(3), 0.012, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, xx = x.v, V = vista(L, -0.7, 4.8, -2.5, 1.7, 8), costa = V.Y(0);
      var mar = g.createLinearGradient(0, costa, 0, h); mar.addColorStop(0, '#62b6e3'); mar.addColorStop(1, '#2a7db8'); g.fillStyle = mar; g.fillRect(0, costa, w, h);
      g.fillStyle = '#ead7a6'; g.fillRect(0, costa - 10, w, 10); g.fillStyle = '#a3cf8c'; g.fillRect(0, 0, w, costa - 10);
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.5; for (var k = 0; k < 9; k++) { var yy = costa + 20 + (k % 3) * 26, xx0 = (k * 83) % w; g.beginPath(); g.moveTo(xx0, yy); g.quadraticCurveTo(xx0 + 10, yy - 5, xx0 + 20, yy); g.stroke(); }
      var px0 = V.X(0), py0 = V.Y(-2);
      g.strokeStyle = '#3a3f46'; g.lineWidth = 3; g.beginPath(); g.moveTo(px0 - 14, py0 + 10); g.lineTo(px0 - 6, py0 - 18); g.moveTo(px0 + 14, py0 + 10); g.lineTo(px0 + 6, py0 - 18); g.stroke();
      g.fillStyle = '#e0a030'; g.fillRect(px0 - 18, py0 - 22, 36, 8); g.strokeStyle = '#3a3f46'; g.lineWidth = 2; g.beginPath(); g.moveTo(px0, py0 - 22); g.lineTo(px0, py0 - 44); g.lineTo(px0 + 10, py0 - 30); g.stroke();
      var rx = V.X(4); g.fillStyle = '#9aa4ae'; g.fillRect(rx - 6, costa - 44, 22, 34); g.fillStyle = '#c3cad1'; g.beginPath(); g.ellipse(rx - 16, costa - 24, 10, 14, 0, 0, 7); g.fill(); g.fillStyle = '#7d8790'; g.fillRect(rx + 8, costa - 62, 5, 22);
      g.fillStyle = 'rgba(200,200,200,.6)'; g.beginPath(); g.arc(rx + 11, costa - 68, 5, 0, 7); g.arc(rx + 16, costa - 76, 6, 0, 7); g.fill();
      rotulo(g, 'pozo', px0, py0 + 22, '#fff', 'center', 12, 'rgba(0,50,90,.4)'); rotulo(g, 'refinería', rx, costa - 84, '#3a3f46', 'center', 12);
      var Px = V.X(xx);
      g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = '#1d2b36'; g.beginPath(); g.moveTo(px0, py0 - 14); g.lineTo(Px, costa - 5); g.stroke();
      g.strokeStyle = '#d17a22'; g.beginPath(); g.moveTo(Px, costa - 5); g.lineTo(rx - 6, costa - 5); g.stroke();
      g.fillStyle = COL.rojo; g.beginPath(); g.arc(Px, costa - 5, 6, 0, 7); g.fill(); rotulo(g, 'P', Px, costa - 22, COL.rojo, 'center', 13);
      rotulo(g, 'mar: 2k por km', (px0 + Px) / 2 + 28, (py0 + costa) / 2 + 6, '#fff', 'left', 12, 'rgba(0,40,70,.45)'); rotulo(g, 'tierra: k por km', (Px + rx) / 2, costa - 24, '#8a4f12', 'center', 12);
      Gf.dib(xx); lec.innerHTML = 'C(x) = 2k√(4 + x²) + k(4 − x) = <b>' + f2(Math.round(C(xx) * 1000) / 1000) + 'k</b> · C′(x) = k(2x/√(4 + x²) − 1) = ' + f2(Math.round((2 * xx / Math.sqrt(4 + xx * xx) - 1) * 1000) / 1000) + 'k';
      chk();
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; Gf.G.redibuja = dib; dib();
  };

  W.canoa = function (c, D) {
    var L = lienzoPx(c, 260), Vf = function (t) { return 160 * Math.sin(t * Math.PI / 180); };
    var Gf = grafOpt(c, Vf, 0, 180, 175, 30, 40);
    var ct = fila(c), th = U.deslizador(ct, 'ángulo entre los lados θ =', 5, 175, 0.5, 40, function (v) { return f2(v) + '°'; });
    var lec = U.lectura(c), R = U.reto(c, 'Abre la canoa hasta que le quepa la mayor cantidad posible.', false, function () { return true; }, '¡Máximo! θ = 90°: el extremo es un triángulo rectángulo isósceles y V = 160 m³.'); R.el.__fin = c.__fin;
    var chk = alLlegar(th, 90, 0.6, R, c);
    function dib() {
      var g = L.g, w = L.w, h = L.h, t = th.v * Math.PI / 180, V = vista(L, -6.2, 13.5, -4.4, 3.4, 6);
      var mar = g.createLinearGradient(0, 0, 0, h); mar.addColorStop(0, '#d8eef8'); mar.addColorStop(0.55, '#d8eef8'); mar.addColorStop(0.56, '#7cc3e6'); mar.addColorStop(1, '#3d93c4'); g.fillStyle = mar; g.fillRect(0, 0, w, h);
      var bx = 4 * Math.sin(t / 2), dep = 4 * Math.cos(t / 2), lx = 6.5, ly = 2.6, O = [0, 0];
      function P(x, y, z) { return [V.X(x + z * lx / 20), V.Y(y + z * ly / 20)]; }
      var a1 = P(-bx, 0, 0), a2 = P(bx, 0, 0), a3 = P(0, -dep, 0), b1 = P(-bx, 0, 20), b2 = P(bx, 0, 20), b3 = P(0, -dep, 20);
      function pol(p, col) { g.fillStyle = col; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); g.fill(); g.strokeStyle = '#6b3d16'; g.lineWidth = 1.6; g.stroke(); }
      pol([a1, b1, b3, a3], '#a66a35'); pol([a2, b2, b3, a3], '#8e5527');
      g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 1; for (var q0 = 1; q0 < 5; q0++) { var u0 = q0 / 5; [[a1, a3, b1, b3], [a2, a3, b2, b3]].forEach(function (f) { g.beginPath(); g.moveTo(f[0][0] + (f[1][0] - f[0][0]) * u0, f[0][1] + (f[1][1] - f[0][1]) * u0); g.lineTo(f[2][0] + (f[3][0] - f[2][0]) * u0, f[2][1] + (f[3][1] - f[2][1]) * u0); g.stroke(); }); } pol([a1, a2, b2, b1], 'rgba(255,230,190,.35)'); pol([a1, a2, a3], '#c98a4f');
      g.strokeStyle = '#6b3d16'; g.lineWidth = 1; for (var q = 1; q < 6; q++) { var u = q / 6, p1 = [a1[0] + (a3[0] - a1[0]) * u, a1[1] + (a3[1] - a1[1]) * u], p2 = [a2[0] + (a3[0] - a2[0]) * u, a2[1] + (a3[1] - a2[1]) * u]; g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); }
      g.strokeStyle = COL.rojo; g.lineWidth = 2; g.beginPath(); var an = Math.atan2(a1[1] - a3[1], a1[0] - a3[0]), an2 = Math.atan2(a2[1] - a3[1], a2[0] - a3[0]); g.arc(a3[0], a3[1], 18, Math.min(an, an2), Math.max(an, an2)); g.stroke();
      rotulo(g, 'θ', a3[0], a3[1] - 28, COL.rojo, 'center', 13, false); rotulo(g, '4 m', (a1[0] + a3[0]) / 2 - 18, (a1[1] + a3[1]) / 2, '#6b3d16', 'right'); rotulo(g, '20 m de largo', (a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2 - 14, '#6b3d16');
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
      g.fillStyle = '#c7b299'; g.fillRect(V.X(-8), V.Y(20), V.X(0) - V.X(-8), V.Y(0) - V.Y(20)); g.fillStyle = '#b29b80';
      for (var fy = 18; fy > 0; fy -= 3.2) for (var fx = -7; fx < -0.5; fx += 2.4) g.fillRect(V.X(fx), V.Y(fy), 1.2 * V.s, 1.6 * V.s);
      g.fillStyle = '#8a7560'; g.fillRect(V.X(-8.4), V.Y(20) - 4, V.X(0.4) - V.X(-8.4), 5);
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
    var k = 800, L = lienzoPx(c, 170), G = U.Lienzo(c, 200, [0, 0.105, 0, 90]);
    var ct = fila(c), Ls = U.deslizador(ct, 'longitud del resorte =', 10, 20, 0.1, 15, function (v) { return f2(v) + ' cm'; });
    var lec = U.lectura(c), R = U.reto(c, '¿Cuánto trabajo cuesta estirarlo de 15 a 18 cm? (J)', true, function (v) { return Math.abs(v - 1.56) < 0.005; },
      '¡Bien! k = 40/0,05 = 800 N/m y W = ∫ de 0,05 a 0,08 de 800x dx = 400(0,08² − 0,05²) = 1,56 J.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, l = Ls.v, x = (l - 10) / 100, F = k * x, esc = (w - 120) / 22, y = h / 2 + 6;
      cielo(g, w, h, '#f6f3ec', '#efe9dc'); g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, 26, h); g.fillStyle = '#7f8892'; for (var q = 0; q < h; q += 14) g.fillRect(0, q, 26, 2);
      g.fillStyle = '#d6d0c4'; g.fillRect(26, y + 22, w, 4);
      var bx = 26 + l * esc; resorteDib(g, 26, bx, y, 14, 12 - (l - 10) * 0.4, '#4f5b66');
      g.fillStyle = '#c47800'; rr(g, bx, y - 20, 42, 40, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; rr(g, bx + 4, y - 16, 34, 10, 4); g.fill();
      flecha(g, bx + 46, y, bx + 46 + Math.min(70, F / 1.4), y, COL.rojo, 3); rotulo(g, 'F = ' + f2(Math.round(F * 10) / 10) + ' N', bx + 56, y - 26, COL.rojo, 'left');
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
    var L = lienzoPx(c, 330), ct = fila(c), a = U.deslizador(ct, 'nivel del agua =', 0, 4, 0.01, 4, function (v) { return f2(v) + ' m'; });
    var rel = reloj(ct, { get v() { return 4 - a.v; }, set v(t) { a.v = 4 - t; }, inp: a.inp }, 4, 0.5, '▶ Encender la bomba');
    a.inp.min = 0;
    var Wp = function (s) { return 2450 * Math.PI * (64 / 3 - (4 * s * s * s / 3 - s * s * s * s / 4)); };
    var lec = U.lectura(c), R = U.reto(c, '¿Cuánto trabajo hace falta para vaciar todo el tanque? (en kJ, 1 decimal)', true, function (v) { return Math.abs(v - Wp(0) / 1000) < 0.15; },
      '¡Correcto! W = ∫₀⁴ 9800·π(y/2)²·(4 − y) dy = 156 800π/3 ≈ 164,2 kJ.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -4.4, 4.4, -0.4, 5.6, 8), lv = a.v;
      cielo(g, w, h, '#eef3f7', '#f8fafb'); g.fillStyle = '#d9dee3'; g.fillRect(0, V.Y(-0.1), w, h);
      if (lv > 0.01) {
        var gr = g.createLinearGradient(0, V.Y(lv), 0, V.Y(0)); gr.addColorStop(0, '#5fb3e6'); gr.addColorStop(1, '#1f6fae'); g.fillStyle = gr;
        g.beginPath(); g.moveTo(V.X(-lv / 2), V.Y(lv)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(lv / 2), V.Y(lv)); g.closePath(); g.fill();
        var dy = 0.18, ys = Math.max(0, lv - dy); g.fillStyle = 'rgba(255,200,60,.85)'; g.beginPath(); g.moveTo(V.X(-lv / 2), V.Y(lv)); g.lineTo(V.X(lv / 2), V.Y(lv)); g.lineTo(V.X(ys / 2), V.Y(ys)); g.lineTo(V.X(-ys / 2), V.Y(ys)); g.closePath(); g.fill();
        flecha(g, V.X(lv / 2) + 26, V.Y(lv), V.X(lv / 2) + 26, V.Y(4) - 2, COL.ambar, 2.2); rotulo(g, 'esta capa sube ' + f2(Math.round((4 - lv) * 100) / 100) + ' m', V.X(lv / 2) + 34, V.Y((lv + 4) / 2), '#8a5300', 'left', 12);
      }
      g.strokeStyle = '#56616d'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-2), V.Y(4)); g.lineTo(V.X(0), V.Y(0)); g.lineTo(V.X(2), V.Y(4)); g.stroke();
      g.beginPath(); g.ellipse(V.X(0), V.Y(4), 2 * V.s, 2 * V.s * 0.12, 0, 0, 7); g.stroke();
      g.fillStyle = '#d35400'; rr(g, V.X(-3.9), V.Y(5.4), 2.2 * V.s, 0.8 * V.s, 6); g.fill(); g.fillStyle = '#fff'; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('BOMBA', V.X(-2.8), V.Y(5.0) + 4);
      g.strokeStyle = '#3a3f46'; g.lineWidth = 4; g.beginPath(); g.moveTo(V.X(-1.7), V.Y(5.0)); g.lineTo(V.X(0), V.Y(5.0)); g.lineTo(V.X(0), V.Y(Math.max(lv, 0.15))); g.stroke();
      if (lv < 3.99) { g.strokeStyle = 'rgba(70,160,225,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(-3.9), V.Y(5.0)); g.quadraticCurveTo(V.X(-4.3), V.Y(4.8), V.X(-4.25), V.Y(0)); g.stroke(); }
      rotulo(g, 'radio 2 m', V.X(2) + 8, V.Y(4) - 12, '#56616d', 'left', 12); rotulo(g, '4 m', V.X(2.4), V.Y(2), '#56616d', 'left', 12);
      panel(g, ['trabajo hecho: ' + f2(Math.round((Wp(lv)) / 100) / 10) + ' kJ', 'de ' + f2(Math.round(Wp(0) / 100) / 10) + ' kJ en total'], 10, 10);
      lec.innerHTML = 'Capa a altura y: radio y/2, volumen π(y/2)²dy, sube 4 − y ⇒ dW = 9800·π(y/2)²(4 − y) dy · W(hasta nivel ' + f2(lv) + ') = ∫<sub>' + f2(lv) + '</sub><sup>4</sup> … = <b>' + miles(Wp(lv)) + ' J</b>';
    }
    a.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  W.represa = function (c, D) {
    var L = lienzoPx(c, 330), ct = fila(c), p = U.deslizador(ct, 'profundidad de la franja h =', 0, 8, 0.05, 3, function (v) { return f2(v) + ' m'; });
    var Fh = function (s) { return 9800 * (10 * s * s - 5 * s * s * s / 12); };
    var lec = U.lectura(c), R = U.reto(c, '¿Cuál es la fuerza total sobre la compuerta? (en millones de N, 2 decimales)', true, function (v) { return Math.abs(v - Fh(8) / 1e6) < 0.006; },
      '¡Eso es! F = 9800∫₀⁸ h(20 − 5h/4) dh ≈ 4,18 × 10⁶ N.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, V = vista(L, -15, 15, -9.6, 2.2, 8), s = p.v, wd = function (z) { return 20 - 10 / 8 * z; };
      cielo(g, w, h); g.fillStyle = '#9aa3ad'; g.fillRect(0, V.Y(0.4), w, h);
      var agua = g.createLinearGradient(0, V.Y(0), 0, V.Y(-8)); agua.addColorStop(0, 'rgba(95,179,230,.55)'); agua.addColorStop(1, 'rgba(25,90,150,.75)');
      g.fillStyle = '#b0b8c0'; g.fillRect(V.X(-15), V.Y(0.4), V.X(15) - V.X(-15), V.Y(-8.6) - V.Y(0.4));
      g.fillStyle = agua; g.beginPath(); g.moveTo(V.X(-10), V.Y(0)); g.lineTo(V.X(10), V.Y(0)); g.lineTo(V.X(5), V.Y(-8)); g.lineTo(V.X(-5), V.Y(-8)); g.closePath(); g.fill();
      g.strokeStyle = '#4f5b66'; g.lineWidth = 3; g.stroke();
      var y1 = -s, hw = wd(s) / 2, dz = 0.35; g.fillStyle = 'rgba(255,200,60,.8)'; g.fillRect(V.X(-hw), V.Y(y1 + dz / 2), hw * 2 * V.s, dz * V.s);
      for (var z = 0.5; z <= 8; z += 1) { var len = z * 4; flecha(g, V.X(-wd(z) / 2) - 8 - len, V.Y(-z), V.X(-wd(z) / 2) - 6, V.Y(-z), 'rgba(25,90,150,.7)', 1.8, 7); }
      rotulo(g, 'la presión crece con la profundidad', V.X(-13.5), V.Y(-8.9), '#1f5a8a', 'left', 12);
      rotulo(g, '20 m', V.X(0), V.Y(0) - 12, '#4f5b66'); rotulo(g, '10 m', V.X(0), V.Y(-8) + 14, '#4f5b66'); rotulo(g, 'ancho ' + f2(Math.round(wd(s) * 100) / 100) + ' m', V.X(hw) + 8, V.Y(y1), '#8a5300', 'left');
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
      g.fillStyle = '#7f8c99'; g.fillRect(V.X(-6), V.Y(12), V.X(0) - V.X(-6), V.Y(0) - V.Y(12)); g.fillStyle = '#cfe6f5';
      for (var fy = 11; fy > 1; fy -= 2) for (var fx = -5.3; fx < -0.6; fx += 1.6) g.fillRect(V.X(fx), V.Y(fy), 0.9 * V.s, 1.1 * V.s);
      g.fillStyle = '#5f6b78'; g.fillRect(V.X(-6.3), V.Y(12) - 5, V.X(0.4) - V.X(-6.3), 6);
      var cx = V.X(-0.6), cy = V.Y(12) - 14; g.strokeStyle = '#4a3a2a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.stroke();
      g.save(); g.translate(cx, cy); g.rotate(x * 1.3); g.beginPath(); g.moveTo(0, 0); g.lineTo(14, 0); g.lineTo(14, -8); g.stroke(); g.restore();
      var bx = V.X(0.15); g.strokeStyle = '#6d6f73'; g.lineWidth = 2.2;
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
    var L = lienzoPx(c, 330), ct = fila(c), d = U.deslizador(ct, 'profundidad del centro =', 1, 6, 0.05, 3, function (v) { return f2(v) + ' m'; }), r = U.deslizador(ct, 'radio =', 0.3, 1, 0.01, 1, function (v) { return f2(v) + ' m'; });
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
  function trianguloFuerzas(g, x, y, F, esc, cols, noms) {     /* F: lista de vectores [fx, fy] que suman 0 */
    g.save(); g.fillStyle = 'rgba(255,255,255,.88)'; rr(g, x - 8, y - 8, 150, 150, 10); g.fill();
    g.font = '600 11px system-ui'; g.fillStyle = '#4d5762'; g.textAlign = 'left'; g.fillText('las fuerzas se cierran', x, y + 6);
    var mx = 0; F.forEach(function (f) { mx = Math.max(mx, Math.hypot(f[0], f[1])); }); var k = 95 / (mx || 1), px = x + 70, py = y + 75, pts = [[0, 0]], sx = 0, sy = 0;
    F.forEach(function (f) { sx += f[0] * k; sy -= f[1] * k; pts.push([sx, sy]); });
    var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    F.forEach(function (f, i) { flecha(g, px + pts[i][0] - cx, py + pts[i][1] - cy, px + pts[i + 1][0] - cx, py + pts[i + 1][1] - cy, cols[i], 2.4, 8); });
    g.restore();
  }
  W.barco = function (c, D) {
    var Wt = 3500, L = lienzoPx(c, 330), ct = fila(c), a = U.deslizador(ct, 'cable con la vertical', 0.5, 12, 0.1, 2, function (v) { return f2(v) + '°'; }), b = U.deslizador(ct, 'cuerda bajo la horizontal', 0, 60, 0.5, 30, function (v) { return f2(v) + '°'; });
    var lec = U.lectura(c), R = U.reto(c, 'Con 2° y 30°, ¿cuál es la tensión en la cuerda? (lb, 1 decimal)', true, function (v) { return Math.abs(v - 144.0) < 0.15; },
      '¡Bien! T<sub>AC</sub> = 3500·sen 2°/cos 32° ≈ 144,0 lb, y el cable soporta T<sub>AB</sub> ≈ 3574 lb.'); R.el.__fin = c.__fin;
    function dib() {
      var g = L.g, w = L.w, h = L.h, ar = a.v * Math.PI / 180, br = b.v * Math.PI / 180, TAC = Wt * Math.sin(ar) / Math.cos(ar + br), TAB = TAC * Math.cos(br) / Math.sin(ar);
      cielo(g, w, h); nube(g, w * 0.3, 34, 0.8);
      var mar = g.createLinearGradient(0, h * 0.72, 0, h); mar.addColorStop(0, '#3f8fc4'); mar.addColorStop(1, '#1d5f8e'); g.fillStyle = mar; g.fillRect(0, h * 0.72, w, h);
      g.fillStyle = '#b9a184'; g.fillRect(w * 0.55, h * 0.68, w * 0.45, h * 0.32); g.fillStyle = '#8f7a60'; for (var q = w * 0.55; q < w; q += 22) g.fillRect(q, h * 0.68, 2, h * 0.32); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(w * 0.55, h * 0.68, w * 0.45, 4);
      g.fillStyle = '#7a2e2e'; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w * 0.36, h * 0.62); g.lineTo(w * 0.32, h * 0.82); g.lineTo(0, h * 0.82); g.closePath(); g.fill(); g.fillStyle = '#e8e2d6'; g.fillRect(0, h * 0.62, w * 0.36, 6);
      g.fillStyle = '#d9d2c4'; g.fillRect(w * 0.04, h * 0.44, w * 0.14, h * 0.18); g.fillStyle = '#6aa2c9'; for (var wv = 0; wv < 3; wv++) g.fillRect(w * 0.055 + wv * w * 0.04, h * 0.49, w * 0.025, h * 0.04);
      var Bx = w * 0.3, By = 18, Ax = w * 0.48, Ay = h * 0.42;
      g.strokeStyle = '#d4a017'; g.lineWidth = 7; g.beginPath(); g.moveTo(w * 0.1, h * 0.44); g.lineTo(Bx, By); g.stroke(); g.lineWidth = 2; g.strokeStyle = '#8a6a0f'; g.beginPath(); g.moveTo(w * 0.1, h * 0.44); g.lineTo(Bx, By); g.stroke();
      var len = (Ay - By) / Math.cos(ar); Ax = Bx + len * Math.sin(ar);
      g.strokeStyle = '#2f3640'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(Bx, By); g.lineTo(Ax, Ay); g.stroke();
      var Cx = Ax + 140 * Math.cos(br), Cy = Ay + 140 * Math.sin(br); g.strokeStyle = '#c0392b'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(Ax, Ay); g.lineTo(Cx, Cy); g.stroke();
      persona(g, Cx + 10, Math.min(h * 0.68 + 2, Cy + 34), 50, '#2c3e50', 1.2);
      g.strokeStyle = '#2f3640'; g.lineWidth = 2; g.beginPath(); g.moveTo(Ax, Ay); g.lineTo(Ax, Ay + 26); g.stroke();
      var cx0 = Ax, cy0 = Ay + 50; g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 5;
      var cg = g.createLinearGradient(0, cy0 - 20, 0, cy0 + 14); cg.addColorStop(0, '#5aa0e0'); cg.addColorStop(1, '#1f5f9e'); g.fillStyle = cg;
      g.beginPath(); g.moveTo(cx0 - 38, cy0 + 8); g.lineTo(cx0 - 38, cy0 - 4); g.lineTo(cx0 - 20, cy0 - 6); g.lineTo(cx0 - 12, cy0 - 20); g.lineTo(cx0 + 16, cy0 - 20); g.lineTo(cx0 + 26, cy0 - 6); g.lineTo(cx0 + 38, cy0 - 3); g.lineTo(cx0 + 38, cy0 + 8); g.closePath(); g.fill(); g.restore();
      g.fillStyle = 'rgba(210,235,250,.9)'; g.fillRect(cx0 - 9, cy0 - 17, 10, 10); g.fillRect(cx0 + 3, cy0 - 17, 11, 10);
      g.fillStyle = '#222'; [[-22, 9], [22, 9]].forEach(function (p) { g.beginPath(); g.arc(cx0 + p[0], cy0 + p[1], 7, 0, 7); g.fill(); }); g.fillStyle = '#999'; [[-22, 9], [22, 9]].forEach(function (p) { g.beginPath(); g.arc(cx0 + p[0], cy0 + p[1], 3, 0, 7); g.fill(); });
      g.strokeStyle = '#2f3640'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(Ax, Ay + 26); g.lineTo(cx0 - 26, cy0 - 6); g.moveTo(Ax, Ay + 26); g.lineTo(cx0 + 26, cy0 - 6); g.stroke();
      g.fillStyle = COL.ambar; g.beginPath(); g.arc(Ax, Ay, 5, 0, 7); g.fill(); rotulo(g, 'A', Ax - 12, Ay - 8, COL.tinta, 'center', 13, false);
      rotulo(g, 'T_AB = ' + miles(TAB) + ' lb', (Bx + Ax) / 2 + 12, (By + Ay) / 2, '#2f3640', 'left'); rotulo(g, 'T_AC = ' + f2(Math.round(TAC * 10) / 10) + ' lb', (Ax + Cx) / 2 + 10, (Ay + Cy) / 2 - 14, '#c0392b', 'left'); rotulo(g, '3500 lb', cx0, cy0 + 26, '#1f5f9e');
      trianguloFuerzas(g, w - 160, 12, [[-TAB * Math.sin(ar), TAB * Math.cos(ar)], [TAC * Math.cos(br), -TAC * Math.sin(br)], [0, -Wt]], 1, ['#2f3640', '#c0392b', '#1f5f9e']);
      lec.innerHTML = 'ΣF<sub>x</sub>: −T<sub>AB</sub> sen ' + f2(a.v) + '° + T<sub>AC</sub> cos ' + f2(b.v) + '° = 0 · ΣF<sub>y</sub>: T<sub>AB</sub> cos ' + f2(a.v) + '° − T<sub>AC</sub> sen ' + f2(b.v) + '° − 3500 = 0 ⇒ <b>T<sub>AC</sub> = ' + f2(Math.round(TAC * 10) / 10) + ' lb</b>';
    }
    [a, b].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  W.cables = function (c, D) {
    var max = D.modo === 'max', L = lienzoPx(c, 320), ct = fila(c);
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
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f1ede6'); gr.addColorStop(1, '#e3ddd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#8d96a0'; g.fillRect(0, 0, w, 18); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 18, w, 3);
      var cotA = Math.cos(ar) / Math.sin(ar), cotB = Math.cos(brr) / Math.sin(brr), Cy = 18 + Math.min(h * 0.55 - 18, (w - 220) / (cotA + cotB)), Cx = 30 + (Cy - 18) * cotA, Ax = 30, Bx = Cx + (Cy - 18) * cotB;
      function cable(x1, y1, T, lim) { var u = lim ? Math.min(1, Math.max(0, T) / lim) : 0.4, col = lim && T > lim + 0.5 ? '#c0392b' : 'hsl(' + (130 - 110 * u) + ',55%,35%)'; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x1, y1); g.lineTo(Cx, Cy); g.stroke(); return col; }
      var cA = cable(Ax, 18, TAC, max ? 1200 : 0), cB = cable(Bx, 18, TBC, max ? 600 : 0);
      [[Ax, 'A'], [Bx, 'B']].forEach(function (p) { g.fillStyle = '#4d5762'; g.fillRect(p[0] - 9, 14, 18, 8); g.beginPath(); g.arc(p[0], 22, 4, 0, 7); g.fill(); rotulo(g, p[1], p[0], 34, COL.tinta, 'center', 13, false); });
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.setLineDash([4, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(Cx - 90, Cy); g.lineTo(Cx + 90, Cy); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#4d5762'; g.lineWidth = 1.5; g.beginPath(); g.arc(Cx, Cy, 34, Math.PI, Math.PI + ar); g.stroke(); g.beginPath(); g.arc(Cx, Cy, 40, -brr, 0); g.stroke();
      rotulo(g, A + '°', Cx - 54, Cy - 12, '#4d5762', 'center', 12, false); rotulo(g, (max ? '50' : f2(al.v)) + '°', Cx + 58, Cy - 12, '#4d5762', 'center', 12, false);
      if (max) { var t2 = al.v * Math.PI / 180, ex = Cx + 110 * Math.cos(t2), ey = Cy + 110 * Math.sin(t2); flecha(g, Cx, Cy, ex, ey, '#1f5f9e', 3.5); rotulo(g, 'P = ' + Math.round(P) + ' N', ex + 6, ey + 10, '#1f5f9e', 'left'); g.strokeStyle = '#1f5f9e'; g.lineWidth = 1.3; g.beginPath(); g.arc(Cx, Cy, 28, 0, t2); g.stroke(); rotulo(g, 'α', Cx + 38 * Math.cos(t2 / 2), Cy + 38 * Math.sin(t2 / 2), '#1f5f9e', 'center', 12, false); }
      else { g.strokeStyle = '#3a3f46'; g.lineWidth = 2; g.beginPath(); g.moveTo(Cx, Cy); g.lineTo(Cx, Cy + 36); g.stroke(); g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 4;
        var cg = g.createLinearGradient(Cx - 30, 0, Cx + 30, 0); cg.addColorStop(0, '#b07a45'); cg.addColorStop(1, '#d8a56a'); g.fillStyle = cg; g.fillRect(Cx - 30, Cy + 36, 60, 46); g.restore();
        g.strokeStyle = '#8a5a2b'; g.lineWidth = 1.5; g.strokeRect(Cx - 30, Cy + 36, 60, 46); g.beginPath(); g.moveTo(Cx - 30, Cy + 36); g.lineTo(Cx + 30, Cy + 82); g.moveTo(Cx + 30, Cy + 36); g.lineTo(Cx - 30, Cy + 82); g.stroke(); rotulo(g, '200 kg', Cx, Cy + 59, '#5a3a1a'); }
      g.fillStyle = COL.ambar; g.beginPath(); g.arc(Cx, Cy, 6, 0, 7); g.fill(); rotulo(g, 'C', Cx + 12, Cy + 12, COL.tinta, 'left', 13, false);
      rotulo(g, 'T_AC = ' + Math.round(TAC) + ' N' + (max ? ' / 1200' : ''), (Ax + Cx) / 2 - 8, (18 + Cy) / 2, cA, 'right'); rotulo(g, 'T_BC = ' + Math.round(TBC) + ' N' + (max ? ' / 600' : ''), (Bx + Cx) / 2 + 8, (18 + Cy) / 2, cB, 'left');
      trianguloFuerzas(g, w - 160, h - 152, [[-TAC * Math.cos(ar), TAC * Math.sin(ar)], [TBC * Math.cos(brr), TBC * Math.sin(brr)], Fext], 1, [cA, cB, '#1f5f9e']);
      if (max) { var ok = TAC <= 1200.5 && TBC <= 600.5 && TAC >= 0 && TBC >= 0; lec.innerHTML = (ok ? '✅ Los dos cables aguantan.' : '❌ ' + (TAC > 1200.5 ? 'AC se revienta. ' : '') + (TBC > 600.5 ? 'BC se revienta. ' : '') + (TBC < 0 || TAC < 0 ? 'Un cable quedaría empujando: imposible.' : '')) + ' T<sub>AC</sub> = ' + Math.round(TAC) + ' N (máx. 1200) · T<sub>BC</sub> = ' + Math.round(TBC) + ' N (máx. 600)'; }
      else lec.innerHTML = 'Lami / equilibrio: T<sub>AC</sub> = 1962·cos α / sen(40° + α) = <b>' + f2(Math.round(TAC * 10) / 10) + ' N</b> · T<sub>BC</sub> = 1962·cos 40° / sen(40° + α) = <b>' + f2(Math.round(TBC * 10) / 10) + ' N</b>';
    }
    [al, Ps].forEach(function (s) { if (s) s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* =====================================================================
     Geometría vectorial · temperatura en la tubería (sistema lineal)
     ===================================================================== */
  W.temperatura = function (c, D) {
    var L = lienzoPx(c, 330), ct = fila(c), N = U.deslizador(ct, 'norte', 0, 150, 1, 100, function (v) { return v + '°'; }), A = U.deslizador(ct, 'lados de arriba', 0, 150, 1, 60, function (v) { return v + '°'; }),
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
    function dib() {
      var g = L.g, w = L.w, h = L.h, n = N.v, a = A.v, b = B.v, s = S.v, sz = Math.min(h - 40, w * 0.5), ox = 30, oy = 20, cel = sz / 3;
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4f2ee'); gr.addColorStop(1, '#e6e1d8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var M = [[null, n, n, null], [a, T[0], T[1], a], [b, T[2], T[3], b], [null, s, s, null]];
      M[0][0] = (n + a) / 2; M[0][3] = M[0][0]; M[3][0] = (s + b) / 2; M[3][3] = M[3][0];
      var res = 34, px = sz / res;
      for (var i = 0; i < res; i++) for (var j = 0; j < res; j++) { var u = j / (res - 1) * 3, v = i / (res - 1) * 3, i0 = Math.min(2, Math.floor(v)), j0 = Math.min(2, Math.floor(u)), fu = u - j0, fv = v - i0;
        var val = M[i0][j0] * (1 - fu) * (1 - fv) + M[i0][j0 + 1] * fu * (1 - fv) + M[i0 + 1][j0] * (1 - fu) * fv + M[i0 + 1][j0 + 1] * fu * fv; g.fillStyle = color(val); g.fillRect(ox + j * px, oy + i * px, px + 0.6, px + 0.6); }
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 12; g.strokeStyle = '#5b6470'; g.lineWidth = 10; g.strokeRect(ox - 5, oy - 5, sz + 10, sz + 10); g.restore();
      var gl = g.createLinearGradient(ox, oy, ox + sz, oy + sz); gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(ox, oy, sz, sz);
      [[1, 1, 'T₁', T[0]], [1, 2, 'T₂', T[1]], [2, 1, 'T₃', T[2]], [2, 2, 'T₄', T[3]]].forEach(function (p) { var x = ox + p[1] * cel, y = oy + p[0] * cel; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); rotulo(g, p[2] + ' = ' + f2(Math.round(p[3] * 100) / 100) + '°', x, y + 18, COL.tinta, 'center', 13); });
      rotulo(g, n + '°', ox + sz / 2, oy - 12, '#7a1e1e', 'center', 12); rotulo(g, s + '°', ox + sz / 2, oy + sz + 13, '#1e3a7a', 'center', 12);
      rotulo(g, a + '°', ox - 14, oy + cel, '#7a4a1e', 'center', 12); rotulo(g, b + '°', ox - 14, oy + 2 * cel, '#1e5a7a', 'center', 12); rotulo(g, a + '°', ox + sz + 14, oy + cel, '#7a4a1e', 'center', 12); rotulo(g, b + '°', ox + sz + 14, oy + 2 * cel, '#1e5a7a', 'center', 12);
      var lx = ox + sz + 50; g.fillStyle = COL.tinta; g.font = '600 13px system-ui'; g.textAlign = 'left'; g.fillText('Iteración ' + it, lx, oy + 14);
      g.font = '12.5px system-ui'; g.fillStyle = '#4d5762'; ['T₁ = (' + n + ' + ' + a + ' + T₂ + T₃)/4', 'T₂ = (' + n + ' + ' + a + ' + T₁ + T₄)/4', 'T₃ = (T₁ + ' + b + ' + T₄ + ' + s + ')/4', 'T₄ = (T₂ + ' + b + ' + T₃ + ' + s + ')/4'].forEach(function (t, i) { g.fillText(t, lx, oy + 40 + i * 20); });
      for (var q = 0; q <= 30; q++) { g.fillStyle = color(q * 5); g.fillRect(lx + q * 5, oy + 140, 5.2, 12); } g.fillStyle = '#4d5762'; g.fillText('0°', lx, oy + 168); g.fillText('150°', lx + 128, oy + 168);
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
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f5f0e4'); gr.addColorStop(1, '#e7dcc4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(90,60,20,.12)'; g.fillRect(0, h - 26, w, 26);
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
      var cie = g.createLinearGradient(0, 0, 0, h * 0.3); cie.addColorStop(0, '#9fd0ef'); cie.addColorStop(1, '#dff0e6'); g.fillStyle = cie; g.fillRect(0, 0, w, h * 0.3);
      g.fillStyle = '#7bb062'; g.fillRect(0, h * 0.22, w, h * 0.12);
      var ag = g.createLinearGradient(0, h * 0.28, 0, h); ag.addColorStop(0, '#5bb0c9'); ag.addColorStop(1, '#1d5a74'); g.fillStyle = ag; g.beginPath(); g.ellipse(w / 2, h * 0.68, w * 0.48, h * 0.4, 0, 0, 7); g.fill();
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
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f7f1e6'); gr.addColorStop(1, '#e9dcc4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var mesa = g.createLinearGradient(0, base, 0, h); mesa.addColorStop(0, '#9b6a3c'); mesa.addColorStop(1, '#6e4524'); g.fillStyle = mesa; g.fillRect(10, base, w - 20, 16);
      for (var v = 0; v < 3; v++) { var x = cw * v + cw / 2; if (v === sel) { g.fillStyle = 'rgba(255,200,60,.25)'; rr(g, x - cw / 2 + 6, 10, cw - 12, base - 6, 10); g.fill(); }
        var vg = g.createLinearGradient(x - 4, 0, x + 4, 0); vg.addColorStop(0, '#6e4524'); vg.addColorStop(0.5, '#c28b55'); vg.addColorStop(1, '#6e4524'); g.fillStyle = vg; rr(g, x - 4, base - (n + 1.5) * dh, 8, (n + 1.5) * dh, 4); g.fill();
        pilas[v].forEach(function (d, i) { var dw = 30 + (maxW - 30) * (d - 1) / Math.max(1, n - 1), y = base - (i + 1) * dh, hue = 200 + d * 22;
          g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 4; g.shadowOffsetY = 2; var dg = g.createLinearGradient(0, y, 0, y + dh); dg.addColorStop(0, 'hsl(' + hue + ',70%,66%)'); dg.addColorStop(1, 'hsl(' + hue + ',65%,40%)');
          g.fillStyle = dg; rr(g, x - dw / 2, y + 1, dw, dh - 2, Math.min(9, dh / 2)); g.fill(); g.restore(); if (v === sel && i === pilas[v].length - 1) { g.strokeStyle = '#f5b82e'; g.lineWidth = 3; rr(g, x - dw / 2, y + 1, dw, dh - 2, Math.min(9, dh / 2)); g.stroke(); } }); }
      var min = Math.pow(2, n) - 1, listo = pilas[2].length === n || pilas[1].length === n;
      panel(g, ['Movimientos: ' + mov, 'mínimo posible: 2^' + n + ' − 1 = ' + min], 10, 10);
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
      var g = L.g, w = L.w, h = L.h; var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbf8f1'); gr.addColorStop(1, '#f0e9da'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(120,140,170,.18)'; g.lineWidth = 1; for (var y = 18; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
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
})();

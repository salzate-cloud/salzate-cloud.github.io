/* Cálculo Vectorial — laboratorios interactivos: figuras 3D (three.js, se descarga al verlas) y 2D en canvas.
   © 2026 Santiago Alzate Suárez. Todos los derechos reservados. */
(function () {
  'use strict';
  var A = {};
  var K = { c1: '#23317a', c2: '#c2563a', c3: '#a86a12', c4: '#1f7a6b', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233', oro: '#c9932e', azul: '#2f6fb0', rojo: '#b4381f', verde: '#2e7d5b' };
  function el(t, a, h) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h !== undefined) e.innerHTML = h; return e; }
  function f2(x, d) { if (!isFinite(x)) return x > 0 ? '∞' : (x < 0 ? '−∞' : '—'); d = d === undefined ? 3 : d; var s = (+x.toFixed(d)).toString(); if (s === '-0') s = '0'; return s.replace('-', '−').replace('.', ','); }
  function lect(c, partes) { var l = c.querySelector('.lect'); if (l) l.innerHTML = partes.map(function (p) { return '<span>' + p + '</span>'; }).join(''); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + (a[2] || 0) * (b[2] || 0); };
  var cruz = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
  var norma = function (a) { return Math.hypot(a[0], a[1], a[2] || 0); };
  var suma = function (a, b) { return [a[0] + b[0], a[1] + b[1], (a[2] || 0) + (b[2] || 0)]; };
  var resta = function (a, b) { return [a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0)]; };
  var esc = function (k, a) { return [k * a[0], k * a[1], k * (a[2] || 0)]; };
  var unit = function (a) { var n = norma(a) || 1; return esc(1 / n, a); };
  function vtx(v) { return '⟨' + v.map(function (x) { return f2(x, 2); }).join(', ') + '⟩'; }
  function ptx(v) { return '(' + v.map(function (x) { return f2(x, 2); }).join(', ') + ')'; }

  /* controles: ['r', clave, etiqueta, min, max, valor, paso] | ['s', clave, etiqueta, [opciones]] | ['c', clave, etiqueta, marcado] | ['b', clave, etiqueta] */
  function controles(cu, defs, cb) {
    var d = el('div', { class: 'ctl2d' }), st = {};
    defs.forEach(function (x) {
      var t = x[0], k = x[1];
      if (t === 's') {
        var l = el('label', { class: 'sel' }, '<span>' + x[2] + '</span><select>' + x[3].map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('') + '</select>');
        var s = l.querySelector('select'); st[k] = x[4] || 0; s.value = st[k]; s.addEventListener('change', function () { st[k] = +s.value; cb(st, k); }); d.appendChild(l); st['_' + k] = s; return;
      }
      if (t === 'c') {
        var l3 = el('label', { class: 'chk' }, '<input type="checkbox"' + (x[3] ? ' checked' : '') + '><span>' + x[2] + '</span>');
        var c = l3.querySelector('input'); st[k] = !!x[3]; c.addEventListener('change', function () { st[k] = c.checked; cb(st, k); }); d.appendChild(l3); return;
      }
      if (t === 'b') {
        var b = el('button', { type: 'button', class: 'btn-ap' }, x[2]); b.addEventListener('click', function () { cb(st, k); }); d.appendChild(b); st['_' + k] = b; return;
      }
      var l2 = el('label', null, '<span>' + x[2] + '</span><input type="range" min="' + x[3] + '" max="' + x[4] + '" step="' + (x[6] || 0.01) + '" value="' + x[5] + '"><b></b>');
      var i = l2.querySelector('input'), bb = l2.querySelector('b'); st[k] = +x[5]; bb.textContent = f2(+x[5], 2);
      i.addEventListener('input', function () { st[k] = +i.value; bb.textContent = f2(+i.value, 2); cb(st, k); }); d.appendChild(l2);
      st['_' + k] = { pon: function (v) { i.value = v; st[k] = +i.value; bb.textContent = f2(+i.value, 2); } };
    });
    cu.appendChild(d); return st;
  }

  /* ---------- 3D: se carga el motor la primera vez que una figura 3D se acerca a la pantalla ---------- */
  var base = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^/]*$/, '') : 'assets/'; })();
  var cola = [], pedido = false;
  function con3d(cb) {
    if (window.V3D && window.V3D.listo) return cb();
    cola.push(cb);
    if (pedido) return; pedido = true;
    window.V3D_LISTO = cola;
    var s = document.createElement('script'); s.src = base + 'vectorial3d.min.js?v=1'; s.async = true;
    s.onerror = function () { cola.forEach(function () {}); };
    document.head.appendChild(s);
  }
  function lienzo3d(cu, op, cb) {
    var cont = el('div', { class: 'v3d' }); cu.appendChild(cont);
    var cargando = el('div', { class: 'v3d-carga' }, 'Cargando la figura 3D…'); cont.appendChild(cargando);
    var ayuda = el('div', { class: 'ayuda3d' }, 'Arrastre para girar · rueda o pellizco para acercar · Mayús + arrastre para desplazar · doble clic para volver');
    cu.appendChild(ayuda);
    var hecho = false;
    function arranca() { if (hecho) return; hecho = true; con3d(function () { cargando.remove(); var S = window.V3D.escena(cont, op || {}); cb(S); }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); arranca(); } }, { rootMargin: '400px' });
      io.observe(cont);
    } else arranca();
  }

  /* ---------- 2D en canvas ---------- */
  function Lienzo(cu, v, op) {
    op = op || {};
    var cv = el('canvas', { class: 'c2d' }); cu.appendChild(cv);
    var ctx = cv.getContext('2d'), P = { cv: cv, ctx: ctx, v: v.slice(), W: 0, H: 0 };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function tam() {
      var w = cu.clientWidth || 640, h = op.alto || Math.round(w * (op.proporcion || ((v[3] - v[2]) / (v[1] - v[0]))));
      if (op.altoMax) h = Math.min(h, op.altoMax);
      if (op.igual !== false) { var cx = (v[0] + v[1]) / 2, sy = (v[3] - v[2]), sx = sy * w / h; if (sx < v[1] - v[0]) { var cy = (v[2] + v[3]) / 2; sy = (v[1] - v[0]) * h / w; P.v = [v[0], v[1], cy - sy / 2, cy + sy / 2]; } else P.v = [cx - sx / 2, cx + sx / 2, v[2], v[3]]; }
      P.W = w; P.H = h; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (P.dibuja) P.dibuja();
    }
    P.X = function (x) { return (x - P.v[0]) / (P.v[1] - P.v[0]) * P.W; };
    P.Y = function (y) { return P.H - (y - P.v[2]) / (P.v[3] - P.v[2]) * P.H; };
    P.x = function (X) { return P.v[0] + X / P.W * (P.v[1] - P.v[0]); };
    P.y = function (Y) { return P.v[2] + (P.H - Y) / P.H * (P.v[3] - P.v[2]); };
    P.limpia = function () { ctx.clearRect(0, 0, P.W, P.H); };
    P.ejes = function (o) {
      o = o || {};
      ctx.save(); ctx.strokeStyle = '#e6e8ef'; ctx.lineWidth = 1;
      if (o.rejilla !== false) {
        var p = o.paso || 1;
        for (var x = Math.ceil(P.v[0] / p) * p; x <= P.v[1]; x += p) { ctx.beginPath(); ctx.moveTo(P.X(x), 0); ctx.lineTo(P.X(x), P.H); ctx.stroke(); }
        for (var y = Math.ceil(P.v[2] / p) * p; y <= P.v[3]; y += p) { ctx.beginPath(); ctx.moveTo(0, P.Y(y)); ctx.lineTo(P.W, P.Y(y)); ctx.stroke(); }
      }
      ctx.strokeStyle = '#8b93a5'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(0, P.Y(0)); ctx.lineTo(P.W, P.Y(0)); ctx.moveTo(P.X(0), 0); ctx.lineTo(P.X(0), P.H); ctx.stroke();
      ctx.fillStyle = '#6b7385'; ctx.font = 'italic 15px Palatino Linotype,Palatino,Georgia,serif';
      ctx.fillText(o.nx || 'x', P.W - 14, P.Y(0) - 7); ctx.fillText(o.ny || 'y', P.X(0) + 7, 15);
      ctx.restore();
    };
    P.linea = function (pts, o) {
      o = o || {}; ctx.save(); ctx.beginPath(); var pen = false;
      pts.forEach(function (q) { if (!q || !isFinite(q[0]) || !isFinite(q[1])) { pen = false; return; } if (pen) ctx.lineTo(P.X(q[0]), P.Y(q[1])); else ctx.moveTo(P.X(q[0]), P.Y(q[1])); pen = true; });
      if (o.cerrada) ctx.closePath();
      if (o.relleno) { ctx.fillStyle = o.relleno; ctx.globalAlpha = o.alfa === undefined ? 0.2 : o.alfa; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = o.c || K.tinta; ctx.lineWidth = o.w || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.lineJoin = 'round'; if (o.w !== 0) ctx.stroke(); ctx.restore();
    };
    P.flecha = function (p, d, o) {
      o = o || {};
      var x0 = P.X(p[0]), y0 = P.Y(p[1]), x1 = P.X(p[0] + d[0]), y1 = P.Y(p[1] + d[1]), L = Math.hypot(x1 - x0, y1 - y0);
      if (L < 0.5) return;
      var a = Math.atan2(y1 - y0, x1 - x0), h = Math.min(o.punta || 10, L * 0.45);
      ctx.save(); ctx.strokeStyle = ctx.fillStyle = o.c || K.c1; ctx.lineWidth = o.w || 2; ctx.globalAlpha = o.alfa || 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.7 * Math.cos(a), y1 - h * 0.7 * Math.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.38), y1 - h * Math.sin(a - 0.38)); ctx.lineTo(x1 - h * Math.cos(a + 0.38), y1 - h * Math.sin(a + 0.38)); ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    P.punto = function (p, o) { o = o || {}; ctx.save(); ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), o.r || 6, 0, 7); ctx.fillStyle = o.c || K.rojo; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); };
    P.texto = function (p, s, o) { o = o || {}; ctx.save(); ctx.font = (o.it === false ? '' : 'italic ') + (o.s || 15) + 'px Palatino Linotype,Palatino,Georgia,serif'; ctx.textAlign = o.a || 'left'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.strokeText(s, P.X(p[0]) + (o.dx || 0), P.Y(p[1]) + (o.dy || 0)); ctx.fillStyle = o.c || K.tinta; ctx.fillText(s, P.X(p[0]) + (o.dx || 0), P.Y(p[1]) + (o.dy || 0)); ctx.restore(); };
    /* mapa de colores de f */
    P.mapa = function (f, pal, rango, alfa) {
      var n = 3, img = ctx.createImageData(Math.ceil(P.W / n), Math.ceil(P.H / n)), d = img.data, vals = [], lo = Infinity, hi = -Infinity;
      for (var j = 0; j < img.height; j++) for (var i = 0; i < img.width; i++) { var z = f(P.x(i * n + n / 2), P.y(j * n + n / 2)); vals.push(z); if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); } }
      if (rango) { lo = rango[0]; hi = rango[1]; }
      vals.forEach(function (z, k) { var c = paleta2(pal, (z - lo) / ((hi - lo) || 1)); d[4 * k] = c[0]; d[4 * k + 1] = c[1]; d[4 * k + 2] = c[2]; d[4 * k + 3] = isFinite(z) ? (alfa || 150) : 0; });
      var tmp = el('canvas'); tmp.width = img.width; tmp.height = img.height; tmp.getContext('2d').putImageData(img, 0, 0);
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, P.W, P.H); ctx.restore();
      return [lo, hi];
    };
    /* curvas de nivel por cuadrados que marchan */
    P.niveles = function (f, niveles, o) {
      o = o || {}; var N = o.n || 90, M = Math.round(N * P.H / P.W) || N, G = [];
      for (var j = 0; j <= M; j++) { G.push([]); for (var i = 0; i <= N; i++) G[j].push(f(P.v[0] + (P.v[1] - P.v[0]) * i / N, P.v[2] + (P.v[3] - P.v[2]) * j / M)); }
      niveles.forEach(function (c, ci) {
        ctx.save(); ctx.strokeStyle = typeof o.c === 'function' ? o.c(c, ci) : (o.c || K.c1); ctx.lineWidth = o.w || 1.4; if (o.dash) ctx.setLineDash(o.dash); ctx.beginPath();
        for (var j = 0; j < M; j++) for (var i = 0; i < N; i++) {
          var a = G[j][i] - c, b = G[j][i + 1] - c, cc = G[j + 1][i + 1] - c, dd = G[j + 1][i] - c;
          if (!isFinite(a + b + cc + dd)) continue;
          var x0 = P.v[0] + (P.v[1] - P.v[0]) * i / N, x1 = P.v[0] + (P.v[1] - P.v[0]) * (i + 1) / N, y0 = P.v[2] + (P.v[3] - P.v[2]) * j / M, y1 = P.v[2] + (P.v[3] - P.v[2]) * (j + 1) / M;
          var pts = [];
          if ((a > 0) !== (b > 0)) pts.push([x0 + (x1 - x0) * a / (a - b), y0]);
          if ((b > 0) !== (cc > 0)) pts.push([x1, y0 + (y1 - y0) * b / (b - cc)]);
          if ((cc > 0) !== (dd > 0)) pts.push([x1 + (x0 - x1) * cc / (cc - dd), y1]);
          if ((dd > 0) !== (a > 0)) pts.push([x0, y1 + (y0 - y1) * dd / (dd - a)]);
          for (var k = 0; k + 1 < pts.length; k += 2) { ctx.moveTo(P.X(pts[k][0]), P.Y(pts[k][1])); ctx.lineTo(P.X(pts[k + 1][0]), P.Y(pts[k + 1][1])); }
        }
        ctx.stroke(); ctx.restore();
      });
    };
    /* arrastre de puntos */
    P.arrastrables = [];
    var tom = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [P.x(e.clientX - r.left), P.y(e.clientY - r.top), e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) {
      var q = pos(e), mejor = null, dm = 22;
      P.arrastrables.forEach(function (a) { var p = a.get(); var d = Math.hypot(P.X(p[0]) - q[2], P.Y(p[1]) - q[3]); if (d < dm) { dm = d; mejor = a; } });
      if (!mejor && P.alClic) { P.alClic(q); return; }
      if (mejor) { tom = mejor; try { cv.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); }
    });
    cv.addEventListener('pointermove', function (e) {
      var q = pos(e);
      if (tom) { tom.set([q[0], q[1]]); if (P.dibuja) P.dibuja(); return; }
      var cerca = P.arrastrables.some(function (a) { var p = a.get(); return Math.hypot(P.X(p[0]) - q[2], P.Y(p[1]) - q[3]) < 22; });
      cv.style.cursor = cerca ? 'grab' : (P.cursor || 'default');
      if (P.alMover) P.alMover(q);
    });
    cv.addEventListener('pointerup', function () { tom = null; });
    cv.addEventListener('pointercancel', function () { tom = null; });
    if (window.ResizeObserver) new ResizeObserver(tam).observe(cu); else window.addEventListener('resize', tam);
    tam();
    P.visible = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { P.visible = es[0].isIntersecting; }).observe(cv);
    return P;
  }
  function paleta2(n, t) {
    var P = { altura: [[33, 51, 125], [26, 115, 153], [46, 158, 133], [199, 179, 77], [224, 115, 64]], divergente: [[44, 89, 184], [238, 238, 238], [204, 64, 51]] }[n || 'altura'];
    t = clamp(isFinite(t) ? t : 0, 0, 1); var x = t * (P.length - 1), i = Math.min(P.length - 2, Math.floor(x)), f = x - i;
    return [0, 1, 2].map(function (k) { return Math.round(P[i][k] + (P[i + 1][k] - P[i][k]) * f); });
  }
  function anima(P, f) {
    var t0 = performance.now(), ta = t0, vivo = true;
    function c(t) { if (!vivo) return; requestAnimationFrame(c); if (!P.visible) { ta = t; return; } var dt = Math.min(0.05, (t - ta) / 1000); ta = t; f((t - t0) / 1000, dt); }
    requestAnimationFrame(c); return { para: function () { vivo = false; } };
  }
  /* derivadas numéricas */
  function dx(f, x, y) { var h = 1e-4; return (f(x + h, y) - f(x - h, y)) / (2 * h); }
  function dy(f, x, y) { var h = 1e-4; return (f(x, y + h) - f(x, y - h)) / (2 * h); }
  function grad(f, x, y) { return [dx(f, x, y), dy(f, x, y)]; }
  function hess(f, x, y) { var h = 1e-3; return [(f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h), (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h), (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h)]; }
  function simpson2(f, a, b, c, d, n) { n = n || 60; var hx = (b - a) / n, hy = (d - c) / n, s = 0; for (var i = 0; i <= n; i++) for (var j = 0; j <= n; j++) { var w = (i === 0 || i === n ? 1 : (i % 2 ? 4 : 2)) * (j === 0 || j === n ? 1 : (j % 2 ? 4 : 2)); s += w * f(a + i * hx, c + j * hy); } return s * hx * hy / 9; }

  /* ===================== Parcial 1: el espacio, vectores, rectas, planos, cuádricas y curvas ===================== */

  /* Un punto en el espacio: caja de coordenadas, proyecciones y distancia al origen */
  A['espacio'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    lienzo3d(cu, { distancia: 15, az: -0.9, el: 0.42, objetivo: [1, 1.3, 0.9] }, function (S) {
      var capa = S.capa();
      S.ejes([4.3, 4.3, 3.8], { marcas: true });
      var st = controles(cu, [['r', 'a', 'x', -3, 4, 2, 0.1], ['r', 'b', 'y', -3, 4, 3, 0.1], ['r', 'c', 'z', -2.5, 3.5, 2, 0.1], ['c', 'esf', 'esfera centrada en el origen', false]], dibuja);
      function dibuja() {
        S.limpia(capa);
        var a = st.a, b = st.b, z = st.c, P = [a, b, z], g = '#8b93a5';
        S.segmentos([[[a, 0, 0], [a, b, 0]], [[0, b, 0], [a, b, 0]], [[a, b, 0], [a, b, z]], [[0, 0, z], [a, 0, z]], [[0, 0, z], [0, b, z]], [[a, 0, 0], [a, 0, z]], [[0, b, 0], [0, b, z]], [[a, 0, z], [a, b, z]], [[0, b, z], [a, b, z]]], { color: g, opacidad: 0.8, en: capa });
        S.punto([a, b, 0], { color: '#7b8394', radio: 0.06, en: capa }); S.punto([a, 0, z], { color: '#7b8394', radio: 0.06, en: capa }); S.punto([0, b, z], { color: '#7b8394', radio: 0.06, en: capa });
        S.punto(P, { color: K.rojo, radio: 0.11, en: capa });
        S.flecha([0, 0, 0], P, { color: K.c1, grosor: 0.03, en: capa });
        S.texto([a + 0.3, b + 0.3, z + 0.3], 'P' + ptx(P), { color: K.rojo, en: capa, tam: 0.85, peso: '' });
        var r = norma(P);
        if (st.esf) S.parametrica(function (u, v) { return [r * Math.sin(u) * Math.cos(v), r * Math.sin(u) * Math.sin(v), r * Math.cos(u)]; }, [0, Math.PI, 0, 2 * Math.PI], { n: 40, color: '#3d6fb0', opacidad: 0.16, alambre: 5, en: capa });
        lect(c, ['P = ' + ptx(P), '|OP| = √(' + f2(a * a + b * b + z * z, 2) + ') ≈ ' + f2(r, 3), 'proyección en el plano xy: (' + f2(a, 1) + ', ' + f2(b, 1) + ', 0)']);
      }
      dibuja();
    });
  };

  /* Operaciones con vectores: suma, producto escalar (proyección) y producto vectorial */
  A['vectores'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    lienzo3d(cu, { distancia: 15, az: -0.75, el: 0.4 }, function (S) {
      var capa = S.capa();
      S.ejes([4, 4, 3.6], {});
      var st = controles(cu, [['s', 'modo', 'operación', ['suma u + v', 'producto escalar y proyección', 'producto vectorial u × v']],
        ['r', 'u1', 'u₁', -3, 3, 2.5, 0.1], ['r', 'u2', 'u₂', -3, 3, 0.5, 0.1], ['r', 'u3', 'u₃', -3, 3, 0.4, 0.1],
        ['r', 'v1', 'v₁', -3, 3, 0.6, 0.1], ['r', 'v2', 'v₂', -3, 3, 2.4, 0.1], ['r', 'v3', 'v₃', -3, 3, 0.8, 0.1]], dibuja);
      function dibuja() {
        S.limpia(capa);
        var u = [st.u1, st.u2, st.u3], v = [st.v1, st.v2, st.v3], O = [0, 0, 0];
        S.flecha(O, u, { color: K.c1, en: capa }); S.texto(esc(1.08, u), 'u', { color: K.c1, en: capa });
        S.flecha(O, v, { color: K.c2, en: capa }); S.texto(esc(1.08, v), 'v', { color: K.c2, en: capa });
        if (st.modo === 0) {
          var w = suma(u, v);
          S.flecha(u, v, { color: K.c2, opacidad: 0.35, en: capa }); S.flecha(v, u, { color: K.c1, opacidad: 0.35, en: capa });
          S.flecha(O, w, { color: K.c4, grosor: 0.045, en: capa }); S.texto(esc(1.06, w), 'u + v', { color: K.c4, en: capa });
          S.parametrica(function (s, t) { return suma(esc(s, u), esc(t, v)); }, [0, 1, 0, 1], { n: 2, color: '#1f7a6b', opacidad: 0.12, alambre: false, en: capa });
          lect(c, ['u + v = ' + vtx(w), '|u + v| = ' + f2(norma(w), 3) + ' ≤ |u| + |v| = ' + f2(norma(u) + norma(v), 3)]);
        } else if (st.modo === 1) {
          var d = dot(u, v), pr = esc(d / (dot(v, v) || 1), v), th = Math.acos(clamp(d / ((norma(u) * norma(v)) || 1), -1, 1));
          S.flecha(O, pr, { color: K.mor, grosor: 0.05, en: capa });
          S.segmentos([[u, pr]], { color: K.mor, en: capa });
          S.texto(esc(0.5, pr), 'proy', { color: K.mor, en: capa, tam: 0.8 });
          lect(c, ['u·v = ' + f2(d, 3), 'θ = ' + f2(th * 180 / Math.PI, 1) + '°', 'proy_v u = ' + vtx(pr), d === 0 ? 'ortogonales' : (d > 0 ? 'ángulo agudo' : 'ángulo obtuso')]);
        } else {
          var x = cruz(u, v), A2 = norma(x);
          S.parametrica(function (s, t) { return suma(esc(s, u), esc(t, v)); }, [0, 1, 0, 1], { n: 2, color: '#a86a12', opacidad: 0.3, alambre: false, en: capa });
          S.flecha(O, x, { color: K.c4, grosor: 0.045, en: capa }); S.texto(esc(1.08, x), 'u × v', { color: K.c4, en: capa });
          lect(c, ['u × v = ' + vtx(x), 'área del paralelogramo = |u × v| = ' + f2(A2, 3), '(u × v)·u = ' + f2(dot(x, u), 2) + ',  (u × v)·v = ' + f2(dot(x, v), 2)]);
        }
      }
      dibuja();
    });
  };

  /* Rectas y planos: el plano por P0 con normal n y una recta que lo corta */
  A['recta-plano'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    lienzo3d(cu, { distancia: 17, az: -0.7, el: 0.38 }, function (S) {
      var capa = S.capa();
      S.ejes([4, 4, 3.5], {});
      var st = controles(cu, [['r', 'a', 'n = ⟨a, ·, ·⟩', -2, 2, 1, 0.1], ['r', 'b', 'n = ⟨·, b, ·⟩', -2, 2, 1, 0.1], ['r', 'cc', 'n = ⟨·, ·, c⟩', -2, 2, 2, 0.1], ['r', 'd', 'd (ax + by + cz = d)', -4, 6, 4, 0.1],
        ['r', 'd1', 'dirección de la recta: d₁', -2, 2, 1, 0.1], ['r', 'd2', 'd₂', -2, 2, -0.5, 0.1], ['r', 'd3', 'd₃', -2, 2, -1, 0.1]], dibuja);
      function dibuja() {
        S.limpia(capa);
        var n = [st.a, st.b, st.cc], nn = dot(n, n);
        if (nn < 1e-6) { lect(c, ['el vector normal no puede ser cero']); return; }
        var P0 = esc(st.d / nn, n);
        S.plano(P0, n, 5.5, { color: '#3d6fb0', opacidad: 0.28, en: capa });
        S.flecha(P0, esc(1.4 / Math.sqrt(nn), n), { color: K.c1, en: capa }); S.texto(suma(P0, esc(1.65 / Math.sqrt(nn), n)), 'n', { color: K.c1, en: capa });
        var Q = [-1.5, 2, 2.4], d = [st.d1, st.d2, st.d3], den = dot(n, d);
        S.punto(Q, { color: K.c2, en: capa }); S.texto(suma(Q, [0.3, 0.3, 0.3]), 'Q', { color: K.c2, en: capa });
        S.curva(function (t) { return suma(Q, esc(t, d)); }, [-3, 4.5], { color: K.c2, grosor: 0.03, en: capa });
        var lec = ['plano: ' + f2(st.a, 1) + 'x + ' + f2(st.b, 1) + 'y + ' + f2(st.cc, 1) + 'z = ' + f2(st.d, 1)];
        if (Math.abs(den) < 1e-6) lec.push(Math.abs(dot(n, Q) - st.d) < 1e-6 ? 'la recta está contenida en el plano' : 'la recta es paralela al plano (n·d = 0)');
        else { var t = (st.d - dot(n, Q)) / den, I = suma(Q, esc(t, d)); S.punto(I, { color: K.verde, radio: 0.12, en: capa }); lec.push('corte en t = ' + f2(t, 3) + ': ' + ptx(I)); lec.push('ángulo recta–plano = ' + f2(Math.asin(Math.abs(den) / Math.sqrt(nn * dot(d, d))) * 180 / Math.PI, 1) + '°'); }
        lec.push('distancia de Q al plano = ' + f2(Math.abs(dot(n, Q) - st.d) / Math.sqrt(nn), 3));
        lect(c, lec);
      }
      dibuja();
    });
  };

  /* Superficies cuádricas con su traza en un plano z = k */
  A['cuadricas'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var T = [
      ['elipsoide  x²/a² + y²/b² + z²/c² = 1', function (a, b, cc) { return [function (u, v) { return [a * Math.sin(u) * Math.cos(v), b * Math.sin(u) * Math.sin(v), cc * Math.cos(u)]; }, [0, Math.PI, 0, 2 * Math.PI]]; }, function (a, b, cc, k) { var s = 1 - k * k / (cc * cc); return s > 0 ? [a * Math.sqrt(s), b * Math.sqrt(s)] : null; }],
      ['hiperboloide de una hoja  x²/a² + y²/b² − z²/c² = 1', function (a, b, cc) { return [function (u, v) { return [a * Math.cosh(u) * Math.cos(v), b * Math.cosh(u) * Math.sin(v), cc * Math.sinh(u)]; }, [-1.3, 1.3, 0, 2 * Math.PI]]; }, function (a, b, cc, k) { var s = 1 + k * k / (cc * cc); return [a * Math.sqrt(s), b * Math.sqrt(s)]; }],
      ['hiperboloide de dos hojas  z²/c² − x²/a² − y²/b² = 1', function (a, b, cc) { return [function (u, v) { var s = u < 0 ? -1 : 1, w = Math.abs(u); return [a * Math.sinh(w) * Math.cos(v), b * Math.sinh(w) * Math.sin(v), s * cc * Math.cosh(w)]; }, [-1.4, 1.4, 0, 2 * Math.PI]]; }, function (a, b, cc, k) { var s = k * k / (cc * cc) - 1; return s > 0 ? [a * Math.sqrt(s), b * Math.sqrt(s)] : null; }],
      ['cono  z²/c² = x²/a² + y²/b²', function (a, b, cc) { return [function (u, v) { return [a * u * Math.cos(v), b * u * Math.sin(v), cc * u]; }, [-1.6, 1.6, 0, 2 * Math.PI]]; }, function (a, b, cc, k) { var s = Math.abs(k / cc); return s > 1e-6 ? [a * s, b * s] : null; }],
      ['paraboloide elíptico  z/c = x²/a² + y²/b²', function (a, b, cc) { return [function (u, v) { return [a * u * Math.cos(v), b * u * Math.sin(v), cc * u * u]; }, [0, 1.6, 0, 2 * Math.PI]]; }, function (a, b, cc, k) { var s = k / cc; return s > 0 ? [a * Math.sqrt(s), b * Math.sqrt(s)] : null; }],
      ['paraboloide hiperbólico (silla)  z/c = x²/a² − y²/b²', function (a, b, cc) { return [function (x, y) { return [x, y, cc * (x * x / (a * a) - y * y / (b * b))]; }, [-2.2, 2.2, -2.2, 2.2]]; }, 'silla'],
      ['cilindro elíptico  x²/a² + y²/b² = 1', function (a, b, cc) { return [function (u, v) { return [a * Math.cos(v), b * Math.sin(v), u]; }, [-2.2, 2.2, 0, 2 * Math.PI]]; }, function (a, b) { return [a, b]; }]
    ];
    lienzo3d(cu, { distancia: 17, az: -0.8, el: 0.35 }, function (S) {
      var capa = S.capa();
      S.ejes([3.3, 3.3, 3.1], {});
      var st = controles(cu, [['s', 't', 'superficie', T.map(function (x) { return x[0]; })], ['r', 'a', 'a', 0.5, 2, 1.2, 0.05], ['r', 'b', 'b', 0.5, 2, 1, 0.05], ['r', 'cc', 'c', 0.5, 2, 1, 0.05], ['r', 'k', 'traza en z = k', -2.5, 2.5, 0.6, 0.05], ['c', 'pl', 'mostrar el plano z = k', true]], dibuja);
      function dibuja() {
        S.limpia(capa);
        var X = T[st.t], R = X[1](st.a, st.b, st.cc);
        S.parametrica(R[0], R[1], { n: 64, opacidad: 0.88, alambre: 8, zr: [-2.6, 2.6], recorta: function (q) { return Math.abs(q[2]) < 2.7 && Math.abs(q[0]) < 3.2 && Math.abs(q[1]) < 3.2; }, en: capa });
        if (st.pl) S.plano([0, 0, st.k], [0, 0, 1], 5.6, { color: '#a86a12', opacidad: 0.16, en: capa });
        var txt;
        if (X[2] === 'silla') {
          var a = st.a, b = st.b, k = st.k / st.cc;
          S.curva(function (t) { var x, y; if (Math.abs(k) < 1e-3) { x = t; y = b * t / a; } else if (k > 0) { x = a * Math.sqrt(k) * Math.cosh(t); y = b * Math.sqrt(k) * Math.sinh(t); } else { x = a * Math.sqrt(-k) * Math.sinh(t); y = b * Math.sqrt(-k) * Math.cosh(t); } return [x, y, st.k]; }, [-1.6, 1.6], { color: K.rojo, grosor: 0.04, en: capa });
          S.curva(function (t) { var x, y; if (Math.abs(k) < 1e-3) { x = t; y = -b * t / a; } else if (k > 0) { x = -a * Math.sqrt(k) * Math.cosh(t); y = b * Math.sqrt(k) * Math.sinh(t); } else { x = a * Math.sqrt(-k) * Math.sinh(t); y = -b * Math.sqrt(-k) * Math.cosh(t); } return [x, y, st.k]; }, [-1.6, 1.6], { color: K.rojo, grosor: 0.04, en: capa });
          txt = Math.abs(k) < 1e-3 ? 'traza: dos rectas que se cortan' : 'traza: hipérbola (abre en la dirección de ' + (k > 0 ? 'x' : 'y') + ')';
        } else {
          var e = X[2](st.a, st.b, st.cc, st.k);
          if (e) { S.curva(function (t) { return [e[0] * Math.cos(t), e[1] * Math.sin(t), st.k]; }, [0, 2 * Math.PI], { color: K.rojo, grosor: 0.045, cerrada: true, en: capa }); txt = 'traza: elipse de semiejes ' + f2(e[0], 2) + ' y ' + f2(e[1], 2); }
          else txt = st.t === 3 ? 'traza: el vértice (un punto)' : 'el plano z = ' + f2(st.k, 2) + ' no corta la superficie';
        }
        lect(c, [txt]);
      }
      dibuja();
    });
  };

  /* Curvas en el espacio: triedro de Frenet, círculo osculador, velocidad y aceleración */
  A['curva'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var C = [
      ['hélice r(t) = ⟨2 cos t, 2 sen t, t/3⟩', function (t) { return [2 * Math.cos(t), 2 * Math.sin(t), t / 3]; }, [0, 4 * Math.PI], [0, 0, 2]],
      ['nudo de trébol', function (t) { return [(2 + Math.cos(3 * t)) * Math.cos(2 * t) * 0.8, (2 + Math.cos(3 * t)) * Math.sin(2 * t) * 0.8, Math.sin(3 * t) * 0.8]; }, [0, 2 * Math.PI], [0, 0, 0]],
      ['curva de Viviani (esfera ∩ cilindro)', function (t) { return [1 + Math.cos(t), Math.sin(t), 2 * Math.sin(t / 2)]; }, [0, 4 * Math.PI], [1, 0, 0]],
      ['espiral cónica ⟨t cos 3t, t sen 3t, t⟩/2', function (t) { return [t * Math.cos(3 * t) / 2, t * Math.sin(3 * t) / 2, t / 2]; }, [0.05, 5], [0, 0, 1.2]],
      ['tiro parabólico ⟨2t, t, 4t − 4.9t²/2⟩', function (t) { return [2 * t - 2, t - 1, 4 * t - 2.45 * t * t]; }, [0, 1.63], [0, 0, 0.8]]
    ];
    lienzo3d(cu, { distancia: 16, az: -0.8, el: 0.35 }, function (S) {
      var fija = S.capa(), mov = S.capa(), st, an = null, tt = 0.3;
      S.ejes([3.4, 3.4, 3.4], {});
      st = controles(cu, [['s', 'k', 'curva', C.map(function (x) { return x[0]; })], ['r', 't', 'posición s ∈ [0, 1] del recorrido', 0, 1, 0.3, 0.002],
        ['c', 'tnb', 'triedro T, N, B', true], ['c', 'osc', 'círculo osculador', true], ['c', 'va', 'velocidad y aceleración', false], ['b', 'play', '▶ recorrer']], function (s, k) {
          if (k === 'k') { S.objetivo(C[s.k][3]); fija.parent && dibujaCurva(); }
          if (k === 'play') { if (an) { S.quita(an); an = null; s._play.textContent = '▶ recorrer'; } else { s._play.textContent = '❚❚ pausa'; an = S.cada(function (T, dt) { tt = (tt + dt * 0.06) % 1; s._t.pon(tt); dibujaMov(); }); } return; }
          if (k === 't') tt = s.t;
          dibujaMov();
        });
      function D(f, t) { var h = 1e-4; return esc(1 / (2 * h), resta(f(t + h), f(t - h))); }
      function D2(f, t) { var h = 1e-3; return esc(1 / (h * h), suma(resta(f(t + h), esc(2, f(t))), f(t - h))); }
      function dibujaCurva() { S.limpia(fija); var X = C[st.k]; S.curva(X[1], X[2], { color: K.c1, grosor: 0.045, n: 400, en: fija }); }
      function dibujaMov() {
        S.limpia(mov);
        var X = C[st.k], f = X[1], t = X[2][0] + (X[2][1] - X[2][0]) * tt, P = f(t), v = D(f, t), a = D2(f, t), sp = norma(v);
        var T = unit(v), B = unit(cruz(v, a)), N = cruz(B, T), kap = norma(cruz(v, a)) / Math.pow(sp, 3);
        S.punto(P, { color: K.rojo, radio: 0.1, en: mov });
        if (st.tnb) { S.flecha(P, T, { color: '#c2563a', en: mov }); S.flecha(P, N, { color: '#1f7a6b', en: mov }); S.flecha(P, B, { color: '#6d28d9', en: mov }); S.texto(suma(P, esc(1.18, T)), 'T', { color: '#c2563a', en: mov }); S.texto(suma(P, esc(1.18, N)), 'N', { color: '#1f7a6b', en: mov }); S.texto(suma(P, esc(1.18, B)), 'B', { color: '#6d28d9', en: mov }); }
        if (st.osc && kap > 1e-3 && kap < 50) { var R = 1 / kap, Ce = suma(P, esc(R, N)); S.curva(function (s) { return suma(Ce, suma(esc(-R * Math.cos(s), N), esc(R * Math.sin(s), T))); }, [0, 2 * Math.PI], { color: '#a86a12', grosor: 0.02, cerrada: true, en: mov }); S.punto(Ce, { color: '#a86a12', radio: 0.06, en: mov }); }
        if (st.va) { S.flecha(P, esc(0.5, v), { color: K.azul, grosor: 0.03, en: mov }); S.flecha(P, esc(0.25, a), { color: '#b4381f', grosor: 0.03, en: mov }); }
        var aT = dot(a, T), aN = norma(cruz(v, a)) / sp;
        lect(c, ['t = ' + f2(t, 2), '|r′(t)| = ' + f2(sp, 3), 'κ = |r′ × r″| / |r′|³ = ' + f2(kap, 3) + (kap > 1e-3 ? ' (radio ' + f2(1 / kap, 2) + ')' : ''), 'a_T = ' + f2(aT, 2) + ',  a_N = ' + f2(aN, 2)]);
      }
      S.objetivo(C[0][3]); dibujaCurva(); dibujaMov();
    });
  };

  /* ===================== Parcial 2: funciones de varias variables ===================== */
  var FUN = [
    ['z = (x² + y²)/2', function (x, y) { return (x * x + y * y) / 2; }, 'paraboloide (dividido por 2)'],
    ['z = (x² − y²)/2', function (x, y) { return (x * x - y * y) / 2; }, 'silla'],
    ['z = sen x · cos y', function (x, y) { return Math.sin(x) * Math.cos(y); }, 'cartón de huevos'],
    ['z = 2e^(−2(x² + y²)/3)', function (x, y) { return 2 * Math.exp(-(x * x + y * y) / 1.5); }, 'campana'],
    ['z = (x³ − 3xy²)/4  (silla de mono)', function (x, y) { return (x * x * x - 3 * x * y * y) / 4; }, 'silla de mono'],
    ['z = 1.6 cos(1.6r)·e^(−r/4), r = √(x² + y²)', function (x, y) { var r = Math.hypot(x, y); return 1.6 * Math.cos(r * 1.6) * Math.exp(-r * 0.25); }, 'ondas'],
    ['z = 2.4xy·e^(−(x² + y²)/2)', function (x, y) { return 2.4 * x * y * Math.exp(-(x * x + y * y) / 2); }, 'cuatro lomas']
  ];

  /* Superficie, curvas de nivel y el plano z = c que la corta */
  A['superficie'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    lienzo3d(cu, { distancia: 19, az: -0.9, el: 0.48 }, function (S) {
      var capa = S.capa(), corte = S.capa();
      S.ejes([3.4, 3.4, 2.6], {});
      var st = controles(cu, [['s', 'f', 'función', FUN.map(function (x) { return x[0]; })], ['r', 'z', 'altura c del plano', -2, 2, 0.5, 0.02], ['c', 'piso', 'mapa de contorno en el piso', true], ['c', 'pl', 'plano z = c', true]], function (s, k) { if (k === 'f') base(); cortar(); });
      var Lv = [];
      function niveles(f) {
        /* segmentos de las curvas f = c en una rejilla */
        var N = 70, a = -3, b = 3, G = [], h = (b - a) / N;
        for (var j = 0; j <= N; j++) { G.push([]); for (var i = 0; i <= N; i++) G[j].push(f(a + i * h, a + j * h)); }
        return function (cc) {
          var out = [];
          for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
            var p = G[j][i] - cc, q = G[j][i + 1] - cc, r = G[j + 1][i + 1] - cc, s = G[j + 1][i] - cc, x0 = a + i * h, y0 = a + j * h, x1 = x0 + h, y1 = y0 + h, P = [];
            if ((p > 0) !== (q > 0)) P.push([x0 + h * p / (p - q), y0]);
            if ((q > 0) !== (r > 0)) P.push([x1, y0 + h * q / (q - r)]);
            if ((r > 0) !== (s > 0)) P.push([x1 - h * r / (r - s), y1]);
            if ((s > 0) !== (p > 0)) P.push([x0, y1 - h * s / (s - p)]);
            for (var k = 0; k + 1 < P.length; k += 2) out.push([P[k], P[k + 1]]);
          }
          return out;
        };
      }
      function base() {
        S.limpia(capa);
        var f = FUN[st.f][1];
        S.grafica(f, [-3, 3, -3, 3], { n: 90, opacidad: 0.92, alambre: 8, zc: [-2.6, 2.6], en: capa });
        Lv = niveles(f);
        if (st.piso) {
          for (var k = -8; k <= 8; k++) { var cc = k * 0.25, sg = Lv(cc); if (!sg.length) continue; var col = S.paleta('altura', (cc + 2) / 4); S.segmentos(sg.map(function (s) { return [[s[0][0], s[0][1], -2.4], [s[1][0], s[1][1], -2.4]]; }), { color: new S.Color(col[0], col[1], col[2]).getStyle(), en: capa }); }
        }
      }
      function cortar() {
        S.limpia(corte);
        var sg = Lv(st.z);
        if (st.pl) S.plano([0, 0, st.z], [0, 0, 1], 6, { color: '#a86a12', opacidad: 0.14, en: corte });
        S.segmentos(sg.map(function (s) { return [[s[0][0], s[0][1], st.z + 0.01], [s[1][0], s[1][1], st.z + 0.01]]; }), { color: '#b4381f', en: corte });
        S.segmentos(sg.map(function (s) { return [[s[0][0], s[0][1], -2.39], [s[1][0], s[1][1], -2.39]]; }), { color: '#b4381f', en: corte });
        lect(c, [FUN[st.f][0], 'curva de nivel f(x, y) = ' + f2(st.z, 2) + (sg.length ? ' (en rojo, arriba y en el piso)' : ': vacía, el plano no toca la superficie')]);
      }
      base(); cortar();
    });
  };

  /* Un límite que depende del camino: f = 2xy/(x² + y²) */
  A['limite-caminos'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var F = [['f = 2xy/(x² + y²)', function (x, y) { return 2 * x * y / (x * x + y * y); }, function (m) { return 2 * m / (1 + m * m); }, 'recta'],
             ['f = 2x²y/(x⁴ + y²)', function (x, y) { return 2 * x * x * y / (x * x * x * x + y * y); }, function (m) { return 0; }, 'parábola'],
             ['f = 3x²y/(x² + y²)', function (x, y) { return 3 * x * x * y / (x * x + y * y); }, function () { return 0; }, 'recta']];
    lienzo3d(cu, { distancia: 15, az: -1.1, el: 0.5 }, function (S) {
      var capa = S.capa(), cam = S.capa();
      S.ejes([2.6, 2.6, 1.8], {});
      var st = controles(cu, [['s', 'f', 'función', F.map(function (x) { return x[0]; })], ['r', 'm', 'pendiente m del camino', -3, 3, 1, 0.05], ['s', 'tipo', 'camino', ['recta y = mx', 'parábola y = mx²']]], function (s, k) { if (k === 'f') sup(); cam1(); });
      function sup() { S.limpia(capa); S.grafica(F[st.f][1], [-2, 2, -2, 2], { n: 90, opacidad: 0.85, alambre: 9, zr: [-1.2, 1.2], en: capa }); }
      function cam1() {
        S.limpia(cam);
        var f = F[st.f][1], m = st.m, r = st.tipo === 0 ? function (t) { return [t, m * t]; } : function (t) { return [t, m * t * t]; };
        [[-1.9, -0.004], [0.004, 1.9]].forEach(function (I) {
          S.curva(function (t) { var p = r(t); return [p[0], p[1], f(p[0], p[1]) + 0.02]; }, I, { color: K.rojo, grosor: 0.035, en: cam });
          S.curva(function (t) { var p = r(t); return [p[0], p[1], 0]; }, I, { color: '#7b8394', grosor: 0.015, en: cam });
        });
        var L = f(1e-5, (st.tipo === 0 ? m * 1e-5 : m * 1e-10));
        S.punto([0, 0, L], { color: '#a86a12', radio: 0.08, en: cam });
        lect(c, ['a lo largo de ' + (st.tipo === 0 ? 'y = ' + f2(m, 2) + 'x' : 'y = ' + f2(m, 2) + 'x²') + ' el límite vale ' + f2(L, 3), 'si dos caminos dan valores distintos, el límite en (0, 0) no existe']);
      }
      sup(); cam1();
    });
  };

  /* Plano tangente y las dos derivadas parciales como pendientes */
  A['plano-tangente'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var F = FUN.filter(function (x, i) { return i !== 5; });
    lienzo3d(cu, { distancia: 18, az: -0.9, el: 0.4 }, function (S) {
      var capa = S.capa(), tg = S.capa();
      S.ejes([3.3, 3.3, 2.4], {});
      var st = controles(cu, [['s', 'f', 'función', F.map(function (x) { return x[0]; })], ['r', 'x0', 'x₀', -2, 2, 0.8, 0.02], ['r', 'y0', 'y₀', -2, 2, 0.5, 0.02], ['c', 'tr', 'trazas x = x₀ y y = y₀', true], ['c', 'pl', 'plano tangente', true]], function (s, k) { if (k === 'f') sup(); tan(); });
      function sup() { S.limpia(capa); S.grafica(F[st.f][1], [-3, 3, -3, 3], { n: 80, opacidad: 0.8, alambre: 10, zc: [-2.6, 2.6], en: capa }); }
      function tan() {
        S.limpia(tg);
        var f = F[st.f][1], x0 = st.x0, y0 = st.y0, z0 = f(x0, y0), fx = dx(f, x0, y0), fy = dy(f, x0, y0);
        S.punto([x0, y0, z0], { color: K.rojo, radio: 0.09, en: tg });
        if (st.pl) S.parametrica(function (s, t) { return [x0 + s, y0 + t, z0 + fx * s + fy * t]; }, [-1.3, 1.3, -1.3, 1.3], { n: 2, color: '#a86a12', opacidad: 0.45, alambre: false, en: tg });
        if (st.tr) {
          S.curva(function (t) { return [t, y0, f(t, y0) + 0.01]; }, [-3, 3], { color: '#c2563a', grosor: 0.03, en: tg });
          S.curva(function (t) { return [x0, t, f(x0, t) + 0.01]; }, [-3, 3], { color: '#1f7a6b', grosor: 0.03, en: tg });
          S.flecha([x0, y0, z0], esc(1.3 / Math.hypot(1, fx), [1, 0, fx]), { color: '#c2563a', en: tg });
          S.flecha([x0, y0, z0], esc(1.3 / Math.hypot(1, fy), [0, 1, fy]), { color: '#1f7a6b', en: tg });
        }
        lect(c, ['f(x₀, y₀) = ' + f2(z0, 3), 'f_x = ' + f2(fx, 3) + ' (pendiente naranja)', 'f_y = ' + f2(fy, 3) + ' (pendiente verde)', 'z = ' + f2(z0, 2) + ' + ' + f2(fx, 2) + '(x − ' + f2(x0, 2) + ') + ' + f2(fy, 2) + '(y − ' + f2(y0, 2) + ')']);
      }
      sup(); tan();
    });
  };

  /* Gradiente y derivada direccional sobre el mapa de contorno */
  A['gradiente'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var F = [FUN[3], FUN[0], FUN[1], FUN[2], FUN[6], ['z = (x² + 3y²)/3  (valle alargado)', function (x, y) { return (x * x + 3 * y * y) / 3; }]];
    var P = Lienzo(cu, [-3, 3, -2.2, 2.2], { altoMax: 430 });
    var p = [1, 0.6];
    P.arrastrables.push({ get: function () { return p; }, set: function (q) { p = [clamp(q[0], -2.9, 2.9), clamp(q[1], -2.1, 2.1)]; } });
    var st = controles(cu, [['s', 'f', 'función', F.map(function (x) { return x[0]; })], ['r', 'th', 'dirección u (ángulo en grados)', 0, 360, 30, 1], ['c', 'campo', 'campo de gradientes', true]], function () { P.dibuja(); });
    P.dibuja = function () {
      var f = F[st.f][1]; P.limpia();
      P.mapa(f, 'altura', null, 70);
      var lo = Infinity, hi = -Infinity; for (var i = -30; i <= 30; i++) for (var j = -22; j <= 22; j++) { var z = f(i / 10, j / 10); lo = Math.min(lo, z); hi = Math.max(hi, z); }
      var L = []; for (var k = 1; k < 14; k++) L.push(lo + (hi - lo) * k / 14);
      P.niveles(f, L, { c: 'rgba(29,34,51,.55)', w: 1.1 });
      P.ejes({ rejilla: false });
      if (st.campo) for (var x = -2.75; x <= 2.8; x += 0.5) for (var y = -2; y <= 2.05; y += 0.5) { var g = grad(f, x, y), n = Math.hypot(g[0], g[1]); if (n > 1e-6) P.flecha([x, y], esc(0.32 * Math.min(1, n) / n, g), { c: '#5b6478', w: 1.2, punta: 6, alfa: 0.75 }); }
      var g0 = grad(f, p[0], p[1]), ng = Math.hypot(g0[0], g0[1]), th = st.th * Math.PI / 180, u = [Math.cos(th), Math.sin(th)], Du = g0[0] * u[0] + g0[1] * u[1];
      P.flecha(p, esc(Math.min(ng, 2.2) * 0.6 / (ng || 1), g0).slice(0, 2), { c: K.rojo, w: 3, punta: 12 });
      P.flecha(p, [u[0] * 0.9, u[1] * 0.9], { c: K.c1, w: 3, punta: 12 });
      P.punto(p, { c: K.tinta, r: 6 });
      P.texto([p[0] + g0[0] * Math.min(ng, 2.2) * 0.62 / (ng || 1), p[1] + g0[1] * Math.min(ng, 2.2) * 0.62 / (ng || 1)], '∇f', { c: K.rojo, dx: 8 }); P.texto([p[0] + u[0] * 0.95, p[1] + u[1] * 0.95], 'u', { c: K.c1, dx: 6 });
      lect(c, ['∇f(' + f2(p[0], 2) + ', ' + f2(p[1], 2) + ') = ' + vtx(g0), '|∇f| = ' + f2(ng, 3) + ' (máxima derivada direccional)', 'D_u f = ∇f·u = ' + f2(Du, 3), '∇f es perpendicular a la curva de nivel']);
    };
    P.dibuja();
  };

  /* Puntos críticos: clasificación con el hessiano y canicas que ruedan hacia los mínimos */
  A['criticos'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var F = [
      ['f = (x³ − 3x + y²)/2', function (x, y) { return (x * x * x - 3 * x + y * y) / 2; }, [[1, 0], [-1, 0]]],
      ['f = (x⁴ + y⁴ − 4xy + 1)/3', function (x, y) { return (x * x * x * x + y * y * y * y - 4 * x * y + 1) / 3; }, [[0, 0], [1, 1], [-1, -1]]],
      ['f = sen x · cos y', function (x, y) { return Math.sin(x) * Math.cos(y); }, [[Math.PI / 2, 0], [-Math.PI / 2, 0], [0, Math.PI / 2], [0, -Math.PI / 2], [Math.PI / 2, Math.PI], [-Math.PI / 2, Math.PI], [Math.PI / 2, -Math.PI], [-Math.PI / 2, -Math.PI]]],
      ['f = 2.4xy·e^(−(x² + y²)/2)', function (x, y) { return 2.4 * x * y * Math.exp(-(x * x + y * y) / 2); }, [[0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]],
      ['f = (x³ − 3xy²)/4 (silla de mono)', function (x, y) { return (x * x * x - 3 * x * y * y) / 4; }, [[0, 0]]]
    ];
    lienzo3d(cu, { distancia: 19, az: -0.9, el: 0.55 }, function (S) {
      var capa = S.capa(), bolas = null, pos = [], vel = [], an = null;
      S.ejes([3.4, 3.4, 2.3], {});
      var st = controles(cu, [['s', 'f', 'función', F.map(function (x) { return x[0]; })], ['b', 'soltar', '● soltar canicas']], function (s, k) {
        if (k === 'f') { if (an) { S.quita(an); an = null; } dibuja(); }
        if (k === 'soltar') soltar();
      });
      function dibuja() {
        S.limpia(capa); bolas = null;
        var f = F[st.f][1];
        S.grafica(f, [-3.2, 3.2, -3.2, 3.2], { n: 110, opacidad: 0.95, alambre: 10, zr: [-2.2, 2.2], zc: [-2.4, 2.4], en: capa });
        var lec = [];
        F[st.f][2].forEach(function (p) {
          var H = hess(f, p[0], p[1]), D = H[0] * H[2] - H[1] * H[1], tipo, col;
          if (D > 1e-6 && H[0] > 0) { tipo = 'mínimo local'; col = '#1f7a6b'; } else if (D > 1e-6) { tipo = 'máximo local'; col = '#b4381f'; } else if (D < -1e-6) { tipo = 'punto de silla'; col = '#a86a12'; } else { tipo = 'D = 0: el criterio no decide'; col = '#6d28d9'; }
          S.punto([p[0], p[1], f(p[0], p[1])], { color: col, radio: 0.11, en: capa });
          if (lec.length < 4) lec.push('(' + f2(p[0], 2) + ', ' + f2(p[1], 2) + '): D = ' + f2(D, 2) + ' → ' + tipo);
        });
        lect(c, lec);
      }
      function soltar() {
        var f = F[st.f][1];
        if (!bolas) bolas = S.particulas(40, { radio: 0.07, color: '#23317a', en: capa });
        pos = []; vel = [];
        for (var i = 0; i < 40; i++) { pos.push([-3 + 6 * Math.random(), -3 + 6 * Math.random()]); vel.push([0, 0]); }
        if (an) S.quita(an);
        an = S.cada(function (t, dt) {
          var P = pos.map(function (p, i) {
            var g = grad(f, p[0], p[1]); vel[i][0] = vel[i][0] * 0.96 - g[0] * dt * 3.5; vel[i][1] = vel[i][1] * 0.96 - g[1] * dt * 3.5;
            p[0] = clamp(p[0] + vel[i][0] * dt * 2, -3.2, 3.2); p[1] = clamp(p[1] + vel[i][1] * dt * 2, -3.2, 3.2);
            return [p[0], p[1], f(p[0], p[1]) + 0.07];
          });
          bolas.mover(P);
        });
      }
      dibuja();
    });
  };

  /* Multiplicadores de Lagrange: curvas de nivel de f y la restricción g = k */
  A['lagrange'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var R = [
      ['f = xy sobre x² + y² = 4', function (x, y) { return x * y; }, function (t) { return [2 * Math.cos(t), 2 * Math.sin(t)]; }, function (x, y) { return [2 * x, 2 * y]; }],
      ['f = x + 2y sobre x²/4 + y² = 1', function (x, y) { return x + 2 * y; }, function (t) { return [2 * Math.cos(t), Math.sin(t)]; }, function (x, y) { return [x / 2, 2 * y]; }],
      ['f = x² + y² sobre x + y = 2', function (x, y) { return x * x + y * y; }, function (t) { return [1 + 2.2 * Math.cos(t), 1 - 2.2 * Math.cos(t)]; }, function () { return [1, 1]; }],
      ['f = x²y sobre x² + y² = 3', function (x, y) { return x * x * y; }, function (t) { return [Math.sqrt(3) * Math.cos(t), Math.sqrt(3) * Math.sin(t)]; }, function (x, y) { return [2 * x, 2 * y]; }]
    ];
    var P = Lienzo(cu, [-3.2, 3.2, -2.4, 2.4], { altoMax: 430 });
    var st = controles(cu, [['s', 'k', 'problema', R.map(function (x) { return x[0]; })], ['r', 't', 'posición sobre la restricción', 0, 6.283, 0.5, 0.005]], function () { P.dibuja(); });
    P.dibuja = function () {
      var X = R[st.k], f = X[1], r = X[2], gg = X[3]; P.limpia();
      var lo = Infinity, hi = -Infinity; for (var i = -32; i <= 32; i++) for (var j = -24; j <= 24; j++) { var z = f(i / 10, j / 10); lo = Math.min(lo, z); hi = Math.max(hi, z); }
      P.mapa(f, 'divergente', [lo, hi], 55);
      var L = []; for (var k = 1; k < 18; k++) L.push(lo + (hi - lo) * k / 18);
      P.niveles(f, L, { c: 'rgba(29,34,51,.4)', w: 1 });
      P.ejes({ rejilla: false });
      var pts = []; for (var s = 0; s <= 400; s++) pts.push(r(s / 400 * 2 * Math.PI)); P.linea(pts, { c: K.c3, w: 3.2 });
      var q = r(st.t), fv = f(q[0], q[1]);
      P.niveles(f, [fv], { c: K.rojo, w: 2.2, dash: [6, 4] });
      var gf = grad(f, q[0], q[1]), g = gg(q[0], q[1]), ng = Math.hypot(g[0], g[1]), nf = Math.hypot(gf[0], gf[1]);
      var ang = Math.abs(gf[0] * g[1] - gf[1] * g[0]) / ((nf * ng) || 1);
      P.flecha(q, esc(0.9 / (nf || 1), gf).slice(0, 2), { c: K.rojo, w: 3 }); P.flecha(q, esc(0.9 / (ng || 1), g).slice(0, 2), { c: K.c1, w: 3 });
      P.punto(q, { c: ang < 0.03 ? '#1f7a6b' : K.tinta, r: ang < 0.03 ? 8 : 6 });
      var lam = Math.abs(ng) > 1e-9 ? (gf[0] * g[0] + gf[1] * g[1]) / (ng * ng) : NaN;
      lect(c, ['f = ' + f2(fv, 3) + ' en ' + ptx(q), '∇f (rojo) y ∇g (azul) ' + (ang < 0.03 ? 'paralelos: ∇f = λ∇g con λ ≈ ' + f2(lam, 3) + ' (candidato a extremo)' : 'no son paralelos: moviéndose sobre la curva, f aún cambia'), 'la curva de nivel punteada es tangente a la restricción en los extremos']);
    };
    P.dibuja();
  };

  /* ===================== Parcial 3: integrales múltiples ===================== */

  /* Sumas de Riemann dobles: cajas bajo la superficie */
  A['riemann-doble'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var F = [
      ['f = 16 − x² − 2y² en [0, 2] × [0, 2]', function (x, y) { return (16 - x * x - 2 * y * y) / 6; }, [0, 2, 0, 2], 6, 48],
      ['f = x + y + 1 en [0, 2] × [0, 1]', function (x, y) { return (x + y + 1) / 2; }, [0, 2, 0, 1], 2, 5],
      ['f = sen x · sen y en [0, π] × [0, π]', function (x, y) { return 1.5 * Math.sin(x) * Math.sin(y); }, [0, Math.PI, 0, Math.PI], 1 / 1.5, 4],
      ['f = e^(−(x²+y²)) en [−2, 2]²', function (x, y) { return 2 * Math.exp(-(x * x + y * y)); }, [-2, 2, -2, 2], 0.5, null]
    ];
    lienzo3d(cu, { distancia: 15, az: -0.95, el: 0.45, objetivo: [1, 1, 0.8] }, function (S) {
      var capa = S.capa();
      S.ejes([3.6, 3.6, 3.2], {});
      var st = controles(cu, [['s', 'f', 'función', F.map(function (x) { return x[0]; })], ['r', 'm', 'subdivisiones en x', 1, 14, 3, 1], ['r', 'n', 'subdivisiones en y', 1, 14, 3, 1], ['s', 'pm', 'punto de muestra', ['esquina superior derecha', 'punto medio', 'esquina inferior izquierda']], ['c', 'sup', 'mostrar la superficie', true]], function (s, k) {
        if (k === 'f') { var D = F[s.f][2]; S.objetivo([(D[0] + D[1]) / 2, (D[2] + D[3]) / 2, 0.8]); }
        dibuja();
      });
      function dibuja() {
        S.limpia(capa);
        var X = F[st.f], f = X[1], D = X[2], m = st.m, n = st.n, hx = (D[1] - D[0]) / m, hy = (D[3] - D[2]) / n, suma2 = 0, s0 = [1, 0.5, 0][st.pm];
        for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) {
          var x0 = D[0] + i * hx, y0 = D[2] + j * hy, z = f(x0 + s0 * hx, y0 + s0 * hy);
          suma2 += z * hx * hy;
          var col = S.paleta('altura', 0.15 + 0.7 * (i + j) / (m + n)), cc = new S.Color(col[0], col[1], col[2]).getStyle();
          caja(x0, x0 + hx, y0, y0 + hy, z, cc);
        }
        if (st.sup) S.grafica(f, D, { n: 50, color: '#c2563a', opacidad: 0.45, alambre: 10, en: capa });
        var exacto = simpson2(f, D[0], D[1], D[2], D[3], 80);
        lect(c, ['suma de Riemann (' + m + '×' + n + ' cajas) = ' + f2(suma2 * X[3], 4), 'integral doble = ' + f2(exacto * X[3], 4), 'error = ' + f2(Math.abs(suma2 - exacto) * X[3], 4)]);
      }
      function caja(a, b, cc, d, h, col) {
        S.parametrica(function (s, t) { return [a + (b - a) * s, cc + (d - cc) * t, h]; }, [0, 1, 0, 1], { n: 1, color: col, alambre: false, en: capa });
        [[function (s, t) { return [a + (b - a) * s, cc, h * t]; }], [function (s, t) { return [a + (b - a) * s, d, h * t]; }], [function (s, t) { return [a, cc + (d - cc) * s, h * t]; }], [function (s, t) { return [b, cc + (d - cc) * s, h * t]; }]].forEach(function (q) {
          S.parametrica(q[0], [0, 1, 0, 1], { n: 1, color: col, alambre: false, en: capa });
        });
        S.segmentos([[[a, cc, h], [b, cc, h]], [[b, cc, h], [b, d, h]], [[b, d, h], [a, d, h]], [[a, d, h], [a, cc, h]], [[a, cc, 0], [a, cc, h]], [[b, cc, 0], [b, cc, h]], [[b, d, 0], [b, d, h]], [[a, d, 0], [a, d, h]]], { color: '#1d2233', opacidad: 0.35, en: capa });
      }
      dibuja();
    });
  };

  /* Regiones de tipo I y tipo II: la rebanada que define los límites de integración */
  A['region'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var R = [
      ['entre y = x² y y = 2x', [0, 2], function (x) { return x * x; }, function (x) { return 2 * x; }, [0, 4], function (y) { return y / 2; }, function (y) { return Math.sqrt(y); }, '∫₀² ∫_{x²}^{2x} f dy dx', '∫₀⁴ ∫_{y/2}^{√y} f dx dy'],
      ['bajo y = √x, sobre y = 0, x ≤ 4', [0, 4], function () { return 0; }, function (x) { return Math.sqrt(x); }, [0, 2], function (y) { return y * y; }, function () { return 4; }, '∫₀⁴ ∫₀^{√x} f dy dx', '∫₀² ∫_{y²}^{4} f dx dy'],
      ['triángulo de vértices (0,0), (1,0), (1,1)', [0, 1], function () { return 0; }, function (x) { return x; }, [0, 1], function (y) { return y; }, function () { return 1; }, '∫₀¹ ∫₀^{x} f dy dx', '∫₀¹ ∫_{y}^{1} f dx dy'],
      ['entre y = x y y = x³ (x ≥ 0)', [0, 1], function (x) { return x * x * x; }, function (x) { return x; }, [0, 1], function (y) { return y; }, function (y) { return Math.cbrt(y); }, '∫₀¹ ∫_{x³}^{x} f dy dx', '∫₀¹ ∫_{y}^{∛y} f dx dy']
    ];
    var P = Lienzo(cu, [-0.6, 4.6, -0.5, 4.4], { altoMax: 420 });
    var st = controles(cu, [['s', 'k', 'región', R.map(function (x) { return x[0]; })], ['s', 'o', 'rebanada', ['vertical (tipo I: primero y)', 'horizontal (tipo II: primero x)']], ['r', 's', 'posición de la rebanada', 0.02, 0.98, 0.45, 0.01]], function () { P.dibuja(); });
    P.dibuja = function () {
      var X = R[st.k]; P.limpia(); P.ejes({ paso: 1 });
      var pts = [], a = X[1][0], b = X[1][1], N = 200, i;
      for (i = 0; i <= N; i++) { var x = a + (b - a) * i / N; pts.push([x, X[3](x)]); }
      for (i = N; i >= 0; i--) { x = a + (b - a) * i / N; pts.push([x, X[2](x)]); }
      P.linea(pts, { c: K.c1, w: 2, relleno: K.c1, alfa: 0.16, cerrada: true });
      if (st.o === 0) {
        var x0 = a + (b - a) * st.s, y1 = X[2](x0), y2 = X[3](x0);
        P.linea([[x0, y1], [x0, y2]], { c: K.rojo, w: 4 }); P.punto([x0, y1], { c: K.rojo, r: 5 }); P.punto([x0, y2], { c: K.rojo, r: 5 });
        P.texto([x0, y1], 'y = ' + f2(y1, 2), { dx: 8, dy: 16, c: K.rojo, s: 13 }); P.texto([x0, y2], 'y = ' + f2(y2, 2), { dx: 8, dy: -8, c: K.rojo, s: 13 });
        lect(c, ['tipo I: para cada x en [' + f2(a, 0) + ', ' + f2(b, 0) + '], y va de la curva de abajo a la de arriba', X[7]]);
      } else {
        var c0 = X[4][0], c1 = X[4][1], y0 = c0 + (c1 - c0) * st.s, x1 = X[5](y0), x2 = X[6](y0);
        P.linea([[x1, y0], [x2, y0]], { c: K.c4, w: 4 }); P.punto([x1, y0], { c: K.c4, r: 5 }); P.punto([x2, y0], { c: K.c4, r: 5 });
        P.texto([x1, y0], 'x = ' + f2(x1, 2), { dx: -8, dy: -10, a: 'right', c: K.c4, s: 13 }); P.texto([x2, y0], 'x = ' + f2(x2, 2), { dx: 8, dy: -10, c: K.c4, s: 13 });
        lect(c, ['tipo II: para cada y en [' + f2(c0, 0) + ', ' + f2(c1, 0) + '], x va de la curva de la izquierda a la de la derecha', X[8]]);
      }
    };
    P.dibuja();
  };

  /* Coordenadas cilíndricas y esféricas: la cuña que barren los parámetros */
  A['esfericas'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    lienzo3d(cu, { distancia: 14, az: -0.6, el: 0.45 }, function (S) {
      var capa = S.capa();
      S.ejes([2.8, 2.8, 2.8], {});
      var st = controles(cu, [['s', 'sis', 'coordenadas', ['esféricas (ρ, θ, φ)', 'cilíndricas (r, θ, z)']], ['r', 'R', 'ρ máx (o r máx)', 0.3, 2.2, 1.8, 0.01], ['r', 'T', 'θ máx (grados)', 10, 360, 270, 1], ['r', 'F', 'φ máx (o altura z)', 0.1, 3.1416, 1.2, 0.01], ['c', 'el', 'un elemento de volumen', true]], dibuja);
      function dibuja() {
        S.limpia(capa);
        var R = st.R, T = st.T * Math.PI / 180, F = st.F, vol;
        if (st.sis === 0) {
          var sph = function (r, t, p) { return [r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)]; };
          S.parametrica(function (t, p) { return sph(R, t, p); }, [0, T, 0, F], { n: 40, color: '#3d6fb0', opacidad: 0.6, alambre: 5, en: capa });
          if (F < Math.PI - 0.01) S.parametrica(function (r, t) { return sph(r, t, F); }, [0, R, 0, T], { n: 30, color: '#c2563a', opacidad: 0.45, alambre: false, en: capa });
          if (T < 2 * Math.PI - 0.01) [0, T].forEach(function (t0) { S.parametrica(function (r, p) { return sph(r, t0, p); }, [0, R, 0, F], { n: 26, color: '#a86a12', opacidad: 0.5, alambre: false, en: capa }); });
          if (st.el) { var r0 = R * 0.7, t0 = T * 0.5, p0 = F * 0.5, dr = 0.2, dt = 0.18, dp = 0.18; cuña(function (a, b, cc) { return sph(a, b, cc); }, r0, r0 + dr, t0, t0 + dt, p0, p0 + dp); }
          vol = (2 / 3) * Math.pow(R, 3) * T * (1 - Math.cos(F)) / 2;
          lect(c, ['V = ∫∫∫ ρ² sen φ dρ dθ dφ = ' + f2(vol, 4), 'dV = ρ² sen φ dρ dθ dφ: la cajita es más grande lejos del origen y lejos del eje z']);
        } else {
          var cyl = function (r, t, z) { return [r * Math.cos(t), r * Math.sin(t), z]; }, H = F;
          S.parametrica(function (t, z) { return cyl(R, t, z); }, [0, T, 0, H], { n: 40, color: '#3d6fb0', opacidad: 0.6, alambre: 5, en: capa });
          [0, H].forEach(function (z0) { S.parametrica(function (r, t) { return cyl(r, t, z0); }, [0, R, 0, T], { n: 26, color: '#c2563a', opacidad: 0.45, alambre: false, en: capa }); });
          if (T < 2 * Math.PI - 0.01) [0, T].forEach(function (t0) { S.parametrica(function (r, z) { return cyl(r, t0, z); }, [0, R, 0, H], { n: 10, color: '#a86a12', opacidad: 0.5, alambre: false, en: capa }); });
          if (st.el) cuña(function (a, b, cc) { return cyl(a, b, cc); }, R * 0.65, R * 0.65 + 0.22, T * 0.5, T * 0.5 + 0.2, H * 0.4, H * 0.4 + 0.25);
          vol = R * R / 2 * T * H;
          lect(c, ['V = ∫∫∫ r dz dr dθ = ' + f2(vol, 4), 'dV = r dz dr dθ']);
        }
      }
      function cuña(g, a0, a1, b0, b1, c0, c1) {
        var col = '#6d28d9', o = { n: 6, color: col, opacidad: 0.95, alambre: false, en: capa };
        S.parametrica(function (b, cc) { return g(a0, b, cc); }, [b0, b1, c0, c1], o); S.parametrica(function (b, cc) { return g(a1, b, cc); }, [b0, b1, c0, c1], o);
        S.parametrica(function (a, cc) { return g(a, b0, cc); }, [a0, a1, c0, c1], o); S.parametrica(function (a, cc) { return g(a, b1, cc); }, [a0, a1, c0, c1], o);
        S.parametrica(function (a, b) { return g(a, b, c0); }, [a0, a1, b0, b1], o); S.parametrica(function (a, b) { return g(a, b, c1); }, [a0, a1, b0, b1], o);
      }
      dibuja();
    });
  };

  /* Cambio de variables: la transformación deforma la rejilla; el jacobiano mide el factor de área */
  A['jacobiano'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var T = [
      ['polares x = u cos v, y = u sen v', function (u, v) { return [u * Math.cos(v), u * Math.sin(v)]; }, function (u) { return u; }, [0.2, 2.2, 0, Math.PI], 'J = u'],
      ['lineal x = 2u + v, y = u + v', function (u, v) { return [2 * u + v, u + v]; }, function () { return 1; }, [-1, 1, -1, 1], 'J = 2·1 − 1·1 = 1'],
      ['x = u² − v², y = 2uv', function (u, v) { return [u * u - v * v, 2 * u * v]; }, function (u, v) { return 4 * (u * u + v * v); }, [0.2, 1.4, 0.1, 1.4], 'J = 4(u² + v²)'],
      ['x = u, y = v(1 + u²)/2', function (u, v) { return [u, v * (1 + u * u) / 2]; }, function (u) { return (1 + u * u) / 2; }, [-1.6, 1.6, 0, 1.5], 'J = (1 + u²)/2']
    ];
    var P = Lienzo(cu, [-3, 3, -1, 3.3], { altoMax: 420 });
    var q = [0.5, 0.5];
    var st = controles(cu, [['s', 'k', 'transformación (u, v) → (x, y)', T.map(function (x) { return x[0]; })], ['r', 'u', 'u del cuadradito', 0, 1, 0.55, 0.01], ['r', 'v', 'v del cuadradito', 0, 1, 0.55, 0.01], ['r', 'h', 'tamaño Δu = Δv', 0.02, 0.3, 0.12, 0.01]], function () { P.dibuja(); });
    P.dibuja = function () {
      var X = T[st.k], f = X[1], D = X[3]; P.limpia(); P.ejes({ paso: 1 });
      var N = 12, i, j, k;
      for (i = 0; i <= N; i++) {
        var a = [], b = [];
        for (k = 0; k <= 60; k++) { a.push(f(D[0] + (D[1] - D[0]) * i / N, D[2] + (D[3] - D[2]) * k / 60)); b.push(f(D[0] + (D[1] - D[0]) * k / 60, D[2] + (D[3] - D[2]) * i / N)); }
        P.linea(a, { c: 'rgba(35,49,122,.55)', w: 1.2 }); P.linea(b, { c: 'rgba(194,86,58,.55)', w: 1.2 });
      }
      var u0 = D[0] + (D[1] - D[0]) * st.u, v0 = D[2] + (D[3] - D[2]) * st.v, h = st.h * (D[1] - D[0]) / 2, hv = st.h * (D[3] - D[2]) / 2, pts = [];
      for (k = 0; k <= 20; k++) pts.push(f(u0 + h * k / 20, v0));
      for (k = 0; k <= 20; k++) pts.push(f(u0 + h, v0 + hv * k / 20));
      for (k = 20; k >= 0; k--) pts.push(f(u0 + h * k / 20, v0 + hv));
      for (k = 20; k >= 0; k--) pts.push(f(u0, v0 + hv * k / 20));
      P.linea(pts, { c: K.mor, w: 2.5, relleno: K.mor, alfa: 0.35, cerrada: true });
      var area = 0; for (k = 0; k < pts.length - 1; k++) area += pts[k][0] * pts[k + 1][1] - pts[k + 1][0] * pts[k][1]; area = Math.abs(area) / 2;
      lect(c, [X[4], 'área de la imagen ≈ ' + f2(area, 4), '|J| · Δu Δv = ' + f2(Math.abs(X[2](u0 + h / 2, v0 + hv / 2)) * h * hv, 4), 'por eso dA = |∂(x, y)/∂(u, v)| du dv']);
    };
    P.dibuja();
  };

  /* Centro de masa de una lámina: cambia la densidad y el punto de equilibrio se mueve */
  A['centro-masa'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var R = [['semidisco x² + y² ≤ 4, y ≥ 0', function (x, y) { return x * x + y * y <= 4 && y >= 0; }, [-2.2, 2.2, -0.4, 2.4]],
             ['triángulo (0,0), (3,0), (0,2)', function (x, y) { return x >= 0 && y >= 0 && x / 3 + y / 2 <= 1; }, [-0.4, 3.4, -0.4, 2.4]],
             ['cuarto de disco de radio 2', function (x, y) { return x >= 0 && y >= 0 && x * x + y * y <= 4; }, [-0.4, 2.4, -0.4, 2.4]],
             ['anillo 1 ≤ r ≤ 2, y ≥ 0', function (x, y) { var r = x * x + y * y; return r >= 1 && r <= 4 && y >= 0; }, [-2.2, 2.2, -0.4, 2.4]]];
    var D = [['constante ρ = 1', function () { return 1; }], ['ρ = y (más pesada arriba)', function (x, y) { return y; }], ['ρ = distancia al origen', function (x, y) { return Math.hypot(x, y); }], ['ρ = x + 1', function (x) { return x + 1; }], ['ρ = 1/(1 + y) (más pesada abajo)', function (x, y) { return 1 / (1 + y); }]];
    var P = Lienzo(cu, [-2.4, 3.6, -0.6, 2.6], { altoMax: 400 });
    var st = controles(cu, [['s', 'r', 'lámina', R.map(function (x) { return x[0]; })], ['s', 'd', 'densidad', D.map(function (x) { return x[0]; })]], function () { P.dibuja(); });
    function cm(dentro, rho, V) {
      var n = 160, m = 0, mx = 0, my = 0, hx = (V[1] - V[0]) / n, hy = (V[3] - V[2]) / n;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var x = V[0] + (i + 0.5) * hx, y = V[2] + (j + 0.5) * hy; if (!dentro(x, y)) continue; var r = rho(x, y) * hx * hy; m += r; mx += x * r; my += y * r; }
      return [mx / m, my / m, m];
    }
    P.dibuja = function () {
      var X = R[st.r], rho = D[st.d][1]; P.limpia(); P.ejes({ paso: 1 });
      var ctx = P.ctx, V = X[2], n = 90, hx = (V[1] - V[0]) / n, hy = (V[3] - V[2]) / n, mx = 0;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var x = V[0] + (i + 0.5) * hx, y = V[2] + (j + 0.5) * hy; if (X[1](x, y)) mx = Math.max(mx, rho(x, y)); }
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
        x = V[0] + (i + 0.5) * hx; y = V[2] + (j + 0.5) * hy; if (!X[1](x, y)) continue;
        var t = rho(x, y) / (mx || 1), col = paleta2('altura', 0.15 + 0.8 * t);
        ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.85)'; ctx.fillRect(P.X(x - hx / 2), P.Y(y + hy / 2), P.X(x + hx / 2) - P.X(x - hx / 2) + 0.6, P.Y(y - hy / 2) - P.Y(y + hy / 2) + 0.6);
      }
      var g = cm(X[1], rho, V), g0 = cm(X[1], function () { return 1; }, V);
      P.punto([g0[0], g0[1]], { c: '#ffffff', r: 6 }); P.texto([g0[0], g0[1]], 'centroide', { dx: 9, dy: 14, s: 13, c: '#1d2233' });
      P.punto([g[0], g[1]], { c: K.rojo, r: 8 }); P.texto([g[0], g[1]], '(x̄, ȳ)', { dx: 10, dy: -8, c: K.rojo });
      lect(c, ['masa m = ' + f2(g[2], 3), 'centro de masa (x̄, ȳ) = ' + ptx([g[0], g[1]]), 'centroide (densidad constante) = ' + ptx([g0[0], g0[1]]), 'el centro de masa se corre hacia donde la lámina es más pesada']);
    };
    P.dibuja();
  };

  /* ===================== Parcial 4: cálculo vectorial ===================== */
  var CAMPOS = [
    ['remolino F = ⟨−y, x⟩', function (x, y) { return [-y, x]; }, 0, 2],
    ['fuente F = ⟨x, y⟩', function (x, y) { return [x, y]; }, 2, 0],
    ['silla F = ⟨x, −y⟩', function (x, y) { return [x, -y]; }, 0, 0],
    ['cizalla F = ⟨y, 0⟩', function (x, y) { return [y, 0]; }, 0, -1],
    ['vórtice F = ⟨−y, x⟩/(x² + y²)', function (x, y) { var r = x * x + y * y + 1e-9; return [-y / r, x / r]; }, 0, 0],
    ['gradiente de f = x² − y² + xy/2 + x', function (x, y) { return [2 * x + y / 2 + 1, -2 * y + x / 2]; }, 0, 0],
    ['F = ⟨sen y, sen x⟩', function (x, y) { return [Math.sin(y), Math.sin(x)]; }, 0, null],
    ['F = ⟨y, −sen x⟩ (péndulo)', function (x, y) { return [y, -Math.sin(x)]; }, 0, null]
  ];
  function divR(F, x, y) { var h = 1e-4; return (F(x + h, y)[0] - F(x - h, y)[0] + F(x, y + h)[1] - F(x, y - h)[1]) / (2 * h); }
  function rotR(F, x, y) { var h = 1e-4; return (F(x + h, y)[1] - F(x - h, y)[1] - F(x, y + h)[0] + F(x, y - h)[0]) / (2 * h); }

  /* Campos vectoriales con partículas que fluyen; divergencia y rotacional a la vista */
  A['campo'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var P = Lienzo(cu, [-3.2, 3.2, -2.2, 2.2], { altoMax: 440 });
    var st = controles(cu, [['s', 'k', 'campo', CAMPOS.map(function (x) { return x[0]; })], ['s', 'fondo', 'color de fondo', ['ninguno', 'divergencia (rojo: fuente, azul: sumidero)', 'rotacional (rojo: antihorario)']], ['c', 'fl', 'flechas', true], ['c', 'mol', 'molinete en el cursor', true]], function (s, k) { if (k === 'k') siembra(); });
    var part = [], mol = [0.8, 0.6], giro = 0;
    function siembra() { part = []; for (var i = 0; i < 420; i++) part.push([P.v[0] + Math.random() * (P.v[1] - P.v[0]), P.v[2] + Math.random() * (P.v[3] - P.v[2]), Math.random() * 3]); }
    P.alMover = function (q) { mol = [q[0], q[1]]; };
    P.cursor = 'crosshair';
    P.dibuja = function () {
      var F = CAMPOS[st.k][1];
      P.limpia();
      if (st.fondo) P.mapa(st.fondo === 1 ? function (x, y) { return clamp(divR(F, x, y), -3, 3); } : function (x, y) { return clamp(rotR(F, x, y), -3, 3); }, 'divergente', [-3, 3], 95);
      P.ejes({ rejilla: false });
      if (st.fl) for (var x = -3; x <= 3.01; x += 0.4) for (var y = -2; y <= 2.01; y += 0.4) { var v = F(x, y), n = Math.hypot(v[0], v[1]); if (n > 1e-9) P.flecha([x, y], esc(0.3 * Math.min(1, n) / n, v), { c: '#6b7385', w: 1.1, punta: 5, alfa: 0.7 }); }
      var ctx = P.ctx; ctx.save(); ctx.fillStyle = '#23317a';
      part.forEach(function (p) { ctx.globalAlpha = Math.min(1, p[2]) * 0.85; ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), 2.1, 0, 7); ctx.fill(); });
      ctx.restore();
      if (st.mol) {
        var r = 0.32, w = rotR(F, mol[0], mol[1]), dv = divR(F, mol[0], mol[1]);
        ctx.save(); ctx.translate(P.X(mol[0]), P.Y(mol[1])); ctx.rotate(-giro); ctx.strokeStyle = '#a86a12'; ctx.lineWidth = 3;
        for (var a = 0; a < 4; a++) { ctx.beginPath(); ctx.moveTo(0, 0); var R = r / (P.v[1] - P.v[0]) * P.W; ctx.lineTo(R * Math.cos(a * Math.PI / 2), R * Math.sin(a * Math.PI / 2)); ctx.stroke(); ctx.beginPath(); ctx.arc(R * Math.cos(a * Math.PI / 2), R * Math.sin(a * Math.PI / 2), 4, 0, 7); ctx.fillStyle = '#a86a12'; ctx.fill(); }
        ctx.restore();
        lect(c, [CAMPOS[st.k][0], 'en ' + ptx(mol) + ': div F = ' + f2(dv, 2) + ',  rot F = ' + f2(w, 2), 'el molinete gira con velocidad angular rot F / 2; las partículas se separan donde div F > 0']);
      }
    };
    siembra();
    anima(P, function (t, dt) {
      var F = CAMPOS[st.k][1];
      part.forEach(function (p) {
        var v = F(p[0], p[1]), n = Math.hypot(v[0], v[1]), s = n > 3 ? 3 / n : 1;
        p[0] += v[0] * s * dt * 0.6; p[1] += v[1] * s * dt * 0.6; p[2] -= dt * 0.35;
        if (p[2] <= 0 || p[0] < P.v[0] || p[0] > P.v[1] || p[1] < P.v[2] || p[1] > P.v[3] || !isFinite(p[0])) { p[0] = P.v[0] + Math.random() * (P.v[1] - P.v[0]); p[1] = P.v[2] + Math.random() * (P.v[3] - P.v[2]); p[2] = 1 + Math.random() * 2; }
      });
      giro += dt * rotR(F, mol[0], mol[1]) / 2 * 1.5;
      P.dibuja();
    });
  };

  /* Trabajo a lo largo de una curva: ∫ F · dr y la independencia del camino */
  A['trabajo'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var C = [
      ['segmento de (−2, −1) a (2, 1)', function (t) { return [-2 + 4 * t, -1 + 2 * t]; }],
      ['arco por arriba de (−2, −1) a (2, 1)', function (t) { var a = Math.PI * (1 - t); return [2.236 * Math.cos(a + 0.4636) * 1, 2.236 * Math.sin(a + 0.4636)]; }],
      ['zigzag de (−2, −1) a (2, 1)', function (t) { return t < 0.5 ? [-2, -1 + 4 * t * 2] : [-2 + 4 * (t - 0.5) * 2, 3 - 4 * (t - 0.5) * 2]; }],
      ['circunferencia de radio 1.5 (cerrada)', function (t) { return [1.5 * Math.cos(2 * Math.PI * t), 1.5 * Math.sin(2 * Math.PI * t)]; }]
    ];
    var Fs = [CAMPOS[5], CAMPOS[0], CAMPOS[3], CAMPOS[1]];
    var P = Lienzo(cu, [-3.2, 3.2, -2.2, 3.2], { altoMax: 440 });
    var st = controles(cu, [['s', 'f', 'campo', Fs.map(function (x) { return x[0]; })], ['s', 'k', 'camino', C.map(function (x) { return x[0]; })], ['r', 's', 'recorrido', 0, 1, 1, 0.005]], function () { P.dibuja(); });
    P.dibuja = function () {
      var F = Fs[st.f][1], r = C[st.k][1]; P.limpia(); P.ejes({ rejilla: false });
      for (var x = -3; x <= 3.01; x += 0.5) for (var y = -2; y <= 3.01; y += 0.5) { var v = F(x, y), n = Math.hypot(v[0], v[1]); if (n > 1e-9) P.flecha([x, y], esc(0.35 * Math.min(1, n) / n, v), { c: '#8b93a5', w: 1.1, punta: 5 }); }
      var N = 400, W = 0, pts = [];
      for (var i = 0; i < N; i++) {
        var t = i / N, p = r(t), q = r((i + 1) / N), m = r((i + 0.5) / N), Fv = F(m[0], m[1]), d = [q[0] - p[0], q[1] - p[1]], dw = Fv[0] * d[0] + Fv[1] * d[1];
        if (t <= st.s) { W += dw; P.linea([p, q], { c: dw >= 0 ? '#1f7a6b' : '#b4381f', w: 4 }); } else P.linea([p, q], { c: '#c8ccd6', w: 2 });
      }
      var e = r(st.s), Fe = F(e[0], e[1]); P.punto(e, { c: K.c1, r: 7 }); P.flecha(e, esc(0.5, Fe), { c: K.c1, w: 2.5 });
      var cons = st.f === 0 || st.f === 3;
      lect(c, ['∫ F · dr hasta aquí = ' + f2(W, 3), 'verde: F empuja a favor del movimiento; rojo: en contra', cons ? 'F es conservativo: el trabajo total solo depende de los extremos (en una curva cerrada da 0)' : 'F no es conservativo: el trabajo depende del camino']);
    };
    P.dibuja();
  };

  /* Teorema de Green: la circulación por el borde es la suma de las circulaciones microscópicas */
  A['green'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var Fs = [['F = ⟨−y, x⟩', function (x, y) { return [-y, x]; }], ['F = ⟨−y³, x³⟩', function (x, y) { return [-y * y * y / 2, x * x * x / 2]; }], ['F = ⟨y, 0⟩ (cizalla)', function (x, y) { return [y, 0]; }], ['F = ⟨x, y⟩ (sin rotación)', function (x, y) { return [x, y]; }], ['F = ⟨−y + x², x − y³⟩', function (x, y) { return [-y + x * x / 2, x - y * y * y / 3]; }]];
    var Rg = [['disco de radio 1.6', function (x, y) { return x * x + y * y <= 2.56; }, function (t) { return [1.6 * Math.cos(t), 1.6 * Math.sin(t)]; }],
              ['cuadrado [−1.5, 1.5]²', function (x, y) { return Math.abs(x) <= 1.5 && Math.abs(y) <= 1.5; }, function (t) { var s = t / (2 * Math.PI) * 4, k = Math.floor(s) % 4, f = s - Math.floor(s); return [[1.5, -1.5 + 3 * f], [1.5 - 3 * f, 1.5], [-1.5, 1.5 - 3 * f], [-1.5 + 3 * f, -1.5]][k]; }],
              ['cardioide', function (x, y) { var r = Math.hypot(x - 0.4, y), t = Math.atan2(y, x - 0.4); return r <= 1.1 * (1 - Math.cos(t)) * 0.95 + 1e-9; }, function (t) { var r = 1.1 * (1 - Math.cos(t)) * 0.95; return [0.4 + r * Math.cos(t), r * Math.sin(t)]; }]];
    var P = Lienzo(cu, [-2.6, 2.6, -2, 2], { altoMax: 440 });
    var st = controles(cu, [['s', 'f', 'campo', Fs.map(function (x) { return x[0]; })], ['s', 'r', 'región', Rg.map(function (x) { return x[0]; })], ['r', 'n', 'celdas por lado', 2, 22, 8, 1], ['c', 'mic', 'circulaciones microscópicas', true]], function () { });
    var fase = 0;
    P.dibuja = function () {
      var F = Fs[st.f][1], R = Rg[st.r], dentro = R[1], b = R[2]; P.limpia(); P.ejes({ rejilla: false });
      var n = st.n, h = 4 / n, suma2 = 0, x, y;
      for (var i = 0; i < n * 1.3; i++) for (var j = 0; j < n; j++) {
        x = -2.6 + (i + 0.5) * h; y = -2 + (j + 0.5) * h;
        if (!dentro(x, y)) continue;
        var w = rotR(F, x, y); suma2 += w * h * h;
        P.ctx.save(); P.ctx.fillStyle = w > 0 ? 'rgba(204,64,51,' + Math.min(0.35, Math.abs(w) / 6) + ')' : 'rgba(44,89,184,' + Math.min(0.35, Math.abs(w) / 6) + ')';
        P.ctx.fillRect(P.X(x - h / 2), P.Y(y + h / 2), P.X(x + h / 2) - P.X(x - h / 2), P.Y(y - h / 2) - P.Y(y + h / 2)); P.ctx.strokeStyle = 'rgba(29,34,51,.15)'; P.ctx.strokeRect(P.X(x - h / 2), P.Y(y + h / 2), P.X(x + h / 2) - P.X(x - h / 2), P.Y(y - h / 2) - P.Y(y + h / 2)); P.ctx.restore();
        if (st.mic && Math.abs(w) > 1e-3) {
          var rr = h * 0.3, a0 = fase * Math.sign(w), ctx = P.ctx; ctx.save(); ctx.strokeStyle = w > 0 ? '#b4381f' : '#2c59b8'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), (P.X(rr) - P.X(0)), -a0, -a0 + 4.7, w < 0); ctx.stroke();
          var ea = -a0 + (w < 0 ? -4.7 : 4.7), ex = P.X(x) + (P.X(rr) - P.X(0)) * Math.cos(ea), ey = P.Y(y) + (P.X(rr) - P.X(0)) * Math.sin(ea);
          ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); ctx.restore();
        }
      }
      var pts = [], circ = 0, N = 800;
      for (var k = 0; k <= N; k++) pts.push(b(2 * Math.PI * k / N));
      for (k = 0; k < N; k++) { var p = pts[k], q = pts[k + 1], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], Fv = F(m[0], m[1]); circ += Fv[0] * (q[0] - p[0]) + Fv[1] * (q[1] - p[1]); }
      P.linea(pts, { c: K.c3, w: 3.2 });
      var e = b(fase % (2 * Math.PI)); P.punto(e, { c: K.c3, r: 6 });
      var exacto = simpson2(function (x, y) { return dentro(x, y) ? rotR(F, x, y) : 0; }, -2.6, 2.6, -2, 2, 160);
      lect(c, ['circulación ∮ F · dr = ' + f2(circ, 3), 'suma de ∂Q/∂x − ∂P/∂y en ' + 'las celdas ≈ ' + f2(suma2, 3), '∬ (∂Q/∂x − ∂P/∂y) dA ≈ ' + f2(exacto, 3), 'en las aristas compartidas las circulaciones de celdas vecinas se cancelan']);
    };
    anima(P, function (t, dt) { fase += dt * 1.2; P.dibuja(); });
  };

  /* Superficies paramétricas con su rejilla (u, v) y el vector normal */
  A['parametrica'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var Sp = [
      ['toro', function (u, v) { return [(2 + 0.7 * Math.cos(v)) * Math.cos(u), (2 + 0.7 * Math.cos(v)) * Math.sin(u), 0.7 * Math.sin(v)]; }, [0, 2 * Math.PI, 0, 2 * Math.PI]],
      ['esfera', function (u, v) { return [1.8 * Math.sin(v) * Math.cos(u), 1.8 * Math.sin(v) * Math.sin(u), 1.8 * Math.cos(v)]; }, [0, 2 * Math.PI, 0.001, Math.PI - 0.001]],
      ['helicoide', function (u, v) { return [v * Math.cos(u), v * Math.sin(u), u / 3 - 1.6]; }, [0, 3 * Math.PI, -1.8, 1.8]],
      ['banda de Möbius', function (u, v) { return [(2 + v * Math.cos(u / 2)) * Math.cos(u), (2 + v * Math.cos(u / 2)) * Math.sin(u), v * Math.sin(u / 2)]; }, [0, 2 * Math.PI, -0.7, 0.7]],
      ['superficie de revolución de y = 1 + sen z', function (u, v) { var r = 1 + 0.6 * Math.sin(2 * v); return [r * Math.cos(u), r * Math.sin(u), v - 1.5]; }, [0, 2 * Math.PI, 0, 3]],
      ['cono', function (u, v) { return [v * Math.cos(u), v * Math.sin(u), 1.4 * v - 1.2]; }, [0, 2 * Math.PI, 0, 1.8]]
    ];
    lienzo3d(cu, { distancia: 16, az: -0.8, el: 0.5 }, function (S) {
      var capa = S.capa(), nrm = S.capa();
      S.ejes([3, 3, 2.5], {});
      var st = controles(cu, [['s', 'k', 'superficie', Sp.map(function (x) { return x[0]; })], ['r', 'u', 'u', 0, 1, 0.15, 0.002], ['r', 'v', 'v', 0, 1, 0.55, 0.002], ['c', 'rc', 'curvas u = cte y v = cte', true]], function (s, k) { if (k === 'k') sup(); nor(); });
      function sup() { S.limpia(capa); var X = Sp[st.k]; S.parametrica(X[1], X[2], { n: 80, color: function (q, u, v) { return S.paleta('altura', (v - X[2][2]) / (X[2][3] - X[2][2]) * 0.8 + 0.1); }, opacidad: 0.92, alambre: 8, en: capa }); }
      function nor() {
        S.limpia(nrm); var X = Sp[st.k], r = X[1], D = X[2], u = D[0] + (D[1] - D[0]) * st.u, v = D[2] + (D[3] - D[2]) * st.v, h = 1e-4;
        var p = r(u, v), ru = esc(1 / (2 * h), resta(r(u + h, v), r(u - h, v))), rv = esc(1 / (2 * h), resta(r(u, v + h), r(u, v - h))), n = cruz(ru, rv);
        S.punto(p, { color: K.rojo, radio: 0.08, en: nrm });
        if (st.rc) { S.curva(function (s) { return r(s, v); }, [D[0], D[1]], { color: '#c2563a', grosor: 0.025, en: nrm }); S.curva(function (s) { return r(u, s); }, [D[2], D[3]], { color: '#1f7a6b', grosor: 0.025, en: nrm }); }
        S.flecha(p, esc(0.8, unit(ru)), { color: '#c2563a', grosor: 0.025, en: nrm }); S.flecha(p, esc(0.8, unit(rv)), { color: '#1f7a6b', grosor: 0.025, en: nrm });
        S.flecha(p, esc(1.1, unit(n)), { color: '#6d28d9', grosor: 0.035, en: nrm }); S.texto(suma(p, esc(1.3, unit(n))), 'n', { color: '#6d28d9', en: nrm });
        lect(c, ['r_u (naranja) y r_v (verde) son tangentes; n = r_u × r_v', '|r_u × r_v| = ' + f2(norma(n), 3) + ' (factor de área dS = |r_u × r_v| du dv)', st.k === 3 ? 'Möbius: al dar la vuelta (u de 0 a 1) la normal regresa invertida: la banda no es orientable' : '']);
      }
      sup(); nor();
    });
  };

  /* Flujo a través de una superficie: F · n en cada punto */
  A['flujo'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var Fs = [['F = ⟨0, 0, 1⟩ (lluvia vertical)', function () { return [0, 0, 1]; }], ['F = ⟨x, y, z⟩', function (x, y, z) { return [x, y, z]; }], ['F = ⟨−y, x, 0⟩', function (x, y) { return [-y, x, 0]; }], ['F = ⟨0, 0, x² + y²⟩', function (x, y) { return [0, 0, (x * x + y * y)]; }], ['F = ⟨y, 0, 1 − x⟩', function (x, y) { return [y, 0, 1 - x]; }]];
    var Ss = [['hemisferio superior, radio 1.5', function (u, v) { return [1.5 * Math.sin(v) * Math.cos(u), 1.5 * Math.sin(v) * Math.sin(u), 1.5 * Math.cos(v)]; }, [0, 2 * Math.PI, 0.001, Math.PI / 2]],
              ['disco z = 0, radio 1.5', function (u, v) { return [v * Math.cos(u), v * Math.sin(u), 0]; }, [0, 2 * Math.PI, 0.001, 1.5]],
              ['paraboloide z = 2 − x² − y²', function (u, v) { return [v * Math.cos(u), v * Math.sin(u), 2 - v * v]; }, [0, 2 * Math.PI, 0.001, 1.414]],
              ['cilindro lateral r = 1.2, 0 ≤ z ≤ 2', function (u, v) { return [1.2 * Math.cos(u), 1.2 * Math.sin(u), v]; }, [0, 2 * Math.PI, 0, 2]]];
    lienzo3d(cu, { distancia: 15, az: -0.8, el: 0.4, objetivo: [0, 0, 0.6] }, function (S) {
      var capa = S.capa();
      S.ejes([2.6, 2.6, 2.8], {});
      var st = controles(cu, [['s', 'f', 'campo', Fs.map(function (x) { return x[0]; })], ['s', 's', 'superficie', Ss.map(function (x) { return x[0]; })]], dibuja);
      function nrm(r, u, v) { var h = 1e-4, ru = esc(1 / (2 * h), resta(r(u + h, v), r(u - h, v))), rv = esc(1 / (2 * h), resta(r(u, v + h), r(u, v - h))); return cruz(ru, rv); }
      function dibuja() {
        S.limpia(capa);
        var F = Fs[st.f][1], X = Ss[st.s], r = X[1], D = X[2], sg = st.s === 3 ? 1 : -1;
        if (st.s === 1 || st.s === 0 || st.s === 2) sg = st.s === 1 ? 1 : -1;
        var nn = function (u, v) { var n = nrm(r, u, v); if (st.s === 1) n = [0, 0, Math.abs(n[2])]; else if (st.s !== 3) n = esc(-1, n); else n = n; return n; };
        var mx = 1e-9; for (var a0 = 0; a0 < 20; a0++) for (var b0 = 0; b0 < 20; b0++) { var u0 = D[0] + (D[1] - D[0]) * (a0 + 0.5) / 20, w0 = D[2] + (D[3] - D[2]) * (b0 + 0.5) / 20, q0 = r(u0, w0); mx = Math.max(mx, Math.abs(dot(F(q0[0], q0[1], q0[2]), unit(nn(u0, w0))))); }
        S.parametrica(r, D, { n: 50, color: function (q, u, v) { var n = unit(nn(u, v)), Fv = F(q[0], q[1], q[2]), d = dot(Fv, n); return S.paleta('divergente', 0.5 + 0.5 * clamp(d / mx, -1, 1)); }, opacidad: 0.92, alambre: 10, en: capa });
        var L = [];
        for (var x = -2; x <= 2.01; x += 0.67) for (var y = -2; y <= 2.01; y += 0.67) for (var z = -0.4; z <= 2.5; z += 0.7) { var v = F(x, y, z), m = norma(v); if (m > 1e-6) L.push([[x, y, z], esc(0.4 * Math.min(1, m) / m, v)]); }
        S.flechas(L, { color: '#7b8394', opacidad: 0.55, grosor: 0.012, en: capa });
        var Fl = 0, n2 = 80, hu = (D[1] - D[0]) / n2, hv = (D[3] - D[2]) / n2;
        for (var i = 0; i < n2; i++) for (var j = 0; j < n2; j++) { var u = D[0] + (i + 0.5) * hu, w = D[2] + (j + 0.5) * hv, q = r(u, w); Fl += dot(F(q[0], q[1], q[2]), nn(u, w)) * hu * hv; }
        lect(c, ['flujo ∬ F · n dS ≈ ' + f2(Fl, 3) + ' (normal hacia afuera / hacia arriba)', 'rojo: F atraviesa en el sentido de n; azul: en contra; blanco: F tangente a la superficie']);
      }
      dibuja();
    });
  };

  /* Teorema de Stokes: la misma circulación por el borde y el mismo flujo del rotacional por cualquier superficie con ese borde */
  A['stokes'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var Fs = [['F = ⟨−y, x, z⟩', function (x, y, z) { return [-y, x, z]; }, function () { return [0, 0, 2]; }], ['F = ⟨z − y, x, x + y⟩', function (x, y, z) { return [z - y, x, x + y]; }, function () { return [1, 0, 2]; }], ['F = ⟨−y³, x³, 0⟩', function (x, y) { return [-y * y * y, x * x * x, 0]; }, function (x, y) { return [0, 0, 3 * x * x + 3 * y * y]; }]];
    lienzo3d(cu, { distancia: 15, az: -0.9, el: 0.45, objetivo: [0, 0, 0.6] }, function (S) {
      var capa = S.capa();
      S.ejes([2.6, 2.6, 2.6], {});
      var st = controles(cu, [['s', 'f', 'campo', Fs.map(function (x) { return x[0]; })], ['r', 'h', 'forma de la superficie (altura del domo)', -1.5, 2.5, 1.2, 0.05], ['b', 'an', '▶ deformar']], function (s, k) {
        if (k === 'an') { if (an) { S.quita(an); an = null; s._an.textContent = '▶ deformar'; } else { s._an.textContent = '❚❚ pausa'; an = S.cada(function (t) { s._h.pon(0.5 + 2 * Math.sin(t * 0.8)); dibuja(); }); } return; }
        dibuja();
      });
      var an = null, R = 1.3;
      function r(u, v, h) { var s = v / R; return [v * Math.cos(u), v * Math.sin(u), h * (1 - s * s) * (1 + 0.25 * Math.sin(3 * u) * s)]; }
      function dibuja() {
        S.limpia(capa);
        var X = Fs[st.f], F = X[1], G = X[2], h = st.h;
        S.parametrica(function (u, v) { return r(u, v, h); }, [0, 2 * Math.PI, 0, R], { n: 48, color: function (q) { var g = G(q[0], q[1], q[2]); return S.paleta('altura', 0.2 + 0.6 * clamp(norma(g) / 6, 0, 1)); }, opacidad: 0.85, alambre: 8, en: capa });
        S.curva(function (t) { return [R * Math.cos(t), R * Math.sin(t), 0]; }, [0, 2 * Math.PI], { color: '#b4381f', grosor: 0.05, cerrada: true, en: capa });
        for (var k = 0; k < 8; k++) { var t = k * Math.PI / 4, p = [R * Math.cos(t), R * Math.sin(t), 0]; S.flecha(p, esc(0.35, [-Math.sin(t), Math.cos(t), 0]), { color: '#b4381f', grosor: 0.025, en: capa }); }
        /* flujo del rotacional por la superficie */
        var Fl = 0, n2 = 90, hu = 2 * Math.PI / n2, hv = R / n2, e = 1e-4;
        for (var i = 0; i < n2; i++) for (var j = 0; j < n2; j++) {
          var u = (i + 0.5) * hu, v = (j + 0.5) * hv, q = r(u, v, h), ru = esc(1 / (2 * e), resta(r(u + e, v, h), r(u - e, v, h))), rv = esc(1 / (2 * e), resta(r(u, v + e, h), r(u, v - e, h))), n = cruz(rv, ru);
          if (n[2] < 0) n = esc(-1, n);
          Fl += dot(G(q[0], q[1], q[2]), cruz(ru, rv)[2] >= 0 ? cruz(ru, rv) : esc(-1, cruz(ru, rv))) * hu * hv;
        }
        var Ci = 0, N = 600; for (k = 0; k < N; k++) { var t0 = 2 * Math.PI * k / N, t1 = 2 * Math.PI * (k + 1) / N, a = [R * Math.cos(t0), R * Math.sin(t0), 0], b = [R * Math.cos(t1), R * Math.sin(t1), 0], m = esc(0.5, suma(a, b)); Ci += dot(F(m[0], m[1], m[2]), resta(b, a)); }
        lect(c, ['∮_C F · dr = ' + f2(Ci, 3), '∬_S (rot F) · n dS ≈ ' + f2(Fl, 3) + ' para esta superficie', 'cambie la forma: mientras el borde sea la circunferencia roja, el flujo del rotacional no cambia']);
      }
      dibuja();
    });
  };

  /* Teorema de la divergencia: lo que sale por la frontera es lo que se produce adentro */
  A['divergencia'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var Fs = [['F = ⟨x, y, z⟩ (div = 3)', function (x, y, z) { return [x, y, z]; }, function () { return 3; }], ['F = ⟨x³, y³, z³⟩', function (x, y, z) { return [x * x * x, y * y * y, z * z * z]; }, function (x, y, z) { return 3 * (x * x + y * y + z * z); }], ['F = ⟨−y, x, 0⟩ (div = 0)', function (x, y) { return [-y, x, 0]; }, function () { return 0; }], ['F = ⟨x, 0, −z/2⟩ (div = 1/2)', function (x, y, z) { return [x, 0, -z / 2]; }, function () { return 0.5; }]];
    lienzo3d(cu, { distancia: 14, az: -0.8, el: 0.4 }, function (S) {
      var capa = S.capa(), part = null, P = [], an = null;
      S.ejes([2.4, 2.4, 2.4], {});
      var st = controles(cu, [['s', 'f', 'campo', Fs.map(function (x) { return x[0]; })], ['s', 'g', 'sólido', ['esfera de radio 1.3', 'cubo [−1, 1]³']]], function () { dibuja(); });
      function dibuja() {
        S.limpia(capa); part = null;
        var X = Fs[st.f], F = X[1], dv = X[2];
        if (st.g === 0) S.parametrica(function (u, v) { return [1.3 * Math.sin(v) * Math.cos(u), 1.3 * Math.sin(v) * Math.sin(u), 1.3 * Math.cos(v)]; }, [0, 2 * Math.PI, 0, Math.PI], { n: 40, color: '#3d6fb0', opacidad: 0.25, alambre: 5, en: capa });
        else [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]].forEach(function (n) { S.plano(n, n, 2, { color: '#3d6fb0', opacidad: 0.18, en: capa }); });
        var L = [];
        for (var i = 0; i < 160; i++) { var u = Math.random() * 2 * Math.PI, v = Math.acos(2 * Math.random() - 1), p = st.g === 0 ? [1.3 * Math.sin(v) * Math.cos(u), 1.3 * Math.sin(v) * Math.sin(u), 1.3 * Math.cos(v)] : (function () { var q = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], k = Math.floor(Math.random() * 3); q[k] = Math.random() < 0.5 ? -1 : 1; return q; })(); var w = F(p[0], p[1], p[2]), m = norma(w); if (m > 1e-6) L.push([p, esc(0.45 * Math.min(1, m) / m, w)]); }
        S.flechas(L, { paleta: 'altura', grosor: 0.014, en: capa });
        part = S.particulas(200, { radio: 0.035, color: '#c2563a', en: capa });
        P = []; for (i = 0; i < 200; i++) P.push(semilla());
        if (an) S.quita(an);
        an = S.cada(function (t, dt) {
          part.mover(P.map(function (p) { var w = F(p[0], p[1], p[2]); p[0] += w[0] * dt * 0.4; p[1] += w[1] * dt * 0.4; p[2] += w[2] * dt * 0.4; p[3] -= dt; if (p[3] < 0 || norma(p) > 2.6) { var q = semilla(); p[0] = q[0]; p[1] = q[1]; p[2] = q[2]; p[3] = q[3]; } return p; }));
        });
        var vol, flu;
        if (st.g === 0) { vol = 0; var n = 24, R = 1.3; for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) for (var cc = 0; cc < n; cc++) { var rr = R * (a + 0.5) / n, th = 2 * Math.PI * (b + 0.5) / n, ph = Math.PI * (cc + 0.5) / n; vol += dv(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph)) * rr * rr * Math.sin(ph) * (R / n) * (2 * Math.PI / n) * (Math.PI / n); } }
        else { vol = 0; n = 20; for (a = 0; a < n; a++) for (b = 0; b < n; b++) for (cc = 0; cc < n; cc++) vol += dv(-1 + 2 * (a + 0.5) / n, -1 + 2 * (b + 0.5) / n, -1 + 2 * (cc + 0.5) / n) * 8 / (n * n * n); }
        lect(c, ['∭ div F dV ≈ ' + f2(vol, 3), '= flujo hacia afuera ∯ F · n dS', vol > 1e-3 ? 'adentro hay fuentes: sale más de lo que entra' : (vol < -1e-3 ? 'adentro hay sumideros' : 'entra lo mismo que sale')]);
      }
      function semilla() { var r = Math.cbrt(Math.random()) * 1.1, u = Math.random() * 2 * Math.PI, v = Math.acos(2 * Math.random() - 1); return [r * Math.sin(v) * Math.cos(u), r * Math.sin(v) * Math.sin(u), r * Math.cos(v), 2 + Math.random() * 2]; }
      dibuja();
    });
  };

  /* ---------- portada: un campo vectorial que fluye ---------- */
  function portada() {
    var cv = document.querySelector('.cvec-hero canvas.portada-flujo'); if (!cv) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var focos = [{ x: 0.62, y: 0.45, g: 1.0, f: 0 }, { x: 0.86, y: 0.7, g: -0.8, f: 0 }, { x: 0.78, y: 0.2, g: 0, f: 0.5 }];
    var P = [], N = 1400, quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tam() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#061428'; ctx.fillRect(0, 0, W, H); }
    function campo(x, y) {
      var u = 0.35, v = 0.05 * Math.sin(y * 6);
      focos.forEach(function (F) { var dx = x - F.x, dy = (y - F.y) * H / W, r2 = dx * dx + dy * dy + 0.004; u += (-F.g * dy + F.f * dx) / r2 * 0.05; v += (F.g * dx + F.f * dy) / r2 * 0.05; });
      return [u, v];
    }
    function nueva() { return [Math.random(), Math.random(), 40 + Math.random() * 160]; }
    for (var i = 0; i < N; i++) P.push(nueva());
    tam(); window.addEventListener('resize', tam);
    cv.addEventListener('click', function (e) {
      var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / W, y = (e.clientY - r.top) / H;
      focos.push(e.shiftKey ? { x: x, y: y, g: 0, f: 0.6 } : { x: x, y: y, g: Math.random() < 0.5 ? 1 : -1, f: 0 });
      if (focos.length > 7) focos.splice(0, 1);
    });
    var visible = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    function paso() {
      ctx.fillStyle = 'rgba(6,20,40,0.055)'; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1.35;
      P.forEach(function (p, k) {
        var v = campo(p[0], p[1]), n = Math.hypot(v[0], v[1]), s = 0.0022 / Math.max(0.3, Math.min(n, 3)) * Math.min(n, 3);
        var x0 = p[0] * W, y0 = p[1] * H;
        p[0] += v[0] * s; p[1] += v[1] * s * W / H; p[2]--;
        var t = Math.min(1, n / 2.5);
        ctx.strokeStyle = 'rgba(' + Math.round(120 + 120 * t) + ',' + Math.round(180 + 20 * t - 60 * t * t) + ',' + Math.round(255 - 180 * t) + ',0.8)';
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(p[0] * W, p[1] * H); ctx.stroke();
        if (p[2] < 0 || p[0] < -0.02 || p[0] > 1.02 || p[1] < -0.02 || p[1] > 1.02) P[k] = nueva();
      });
    }
    if (quieto) { for (var k = 0; k < 220; k++) paso(); return; }
    (function bucle() { requestAnimationFrame(bucle); if (visible) paso(); })();
  }

  /* ---------- arranque ---------- */
  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
  }
  window.CVEC = { A: A, inicia: inicia };
  portada();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

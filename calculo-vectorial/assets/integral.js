/* Cálculo Integral — laboratorios interactivos: 2D en SVG y sólidos 3D en canvas */
(function () {
  'use strict';
  var K = { c1: '#0f5257', c2: '#c2563a', c3: '#a86a12', c4: '#2e7d5b', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233', oro: '#c9932e' };
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, h) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h !== undefined) e.innerHTML = h; return e; }
  function f2(x, d) { if (!isFinite(x)) return '∞'; d = d === undefined ? 3 : d; var s = (+x.toFixed(d)).toString(); return s.replace('-', '−').replace('.', ','); }
  function svgEn(cu, W, H) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + (W || 640) + ' ' + (H || 380)); cu.appendChild(s); return s; }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 15) + '" fill="' + (o.c || K.tinta) + '" text-anchor="' + (o.a || 'middle') + '" dominant-baseline="middle" font-family="Palatino Linotype,Palatino,Georgia,serif"' + (o.b ? ' font-weight="700"' : '') + (o.it ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3.5">' + s + '</text>'; }
  function Plano(v, W, H, ox, oy) {
    W = W || 640; H = H || 380; ox = ox || 0; oy = oy || 0;
    var P = { v: v, X: function (x) { return ox + (x - v[0]) / (v[1] - v[0]) * W; }, Y: function (y) { return oy + H - (y - v[2]) / (v[3] - v[2]) * H; }, buf: [] };
    P.put = function (s) { this.buf.push(s); };
    P.ejes = function (o) {
      o = o || {}; var px = o.px || 1, py = o.py || 1;
      var y0 = Math.min(Math.max(0, v[2]), v[3]), x0 = Math.min(Math.max(0, v[0]), v[1]);
      this.put('<line x1="' + this.X(v[0]) + '" y1="' + this.Y(y0) + '" x2="' + this.X(v[1]) + '" y2="' + this.Y(y0) + '" stroke="#8b93a5" stroke-width="1.3"/><line x1="' + this.X(x0) + '" y1="' + this.Y(v[2]) + '" x2="' + this.X(x0) + '" y2="' + this.Y(v[3]) + '" stroke="#8b93a5" stroke-width="1.3"/>');
      if (o.ticks !== false) {
        for (var x = Math.ceil(v[0] / px) * px; x <= v[1] + 1e-9; x += px) if (Math.abs(x) > 1e-9) this.put(tx(this.X(x), this.Y(y0) + 13, o.fx ? o.fx(x) : f2(x, 2), { s: 10.5, c: '#8b93a5' }));
        for (var y = Math.ceil(v[2] / py) * py; y <= v[3] + 1e-9; y += py) if (Math.abs(y) > 1e-9) this.put(tx(this.X(x0) - 8, this.Y(y), f2(y, 2), { s: 10.5, c: '#8b93a5', a: 'end' }));
      }
    };
    P.curva = function (f, a, b, o) {
      o = o || {}; var n = o.n || 400, d = [], pen = false;
      for (var i = 0; i <= n; i++) {
        var x = a + (b - a) * i / n, y = f(x);
        if (!isFinite(y) || y > v[3] + (v[3] - v[2]) * 2 || y < v[2] - (v[3] - v[2]) * 2) { pen = false; continue; }
        d.push((pen ? 'L' : 'M') + this.X(x).toFixed(1) + ',' + this.Y(Math.max(Math.min(y, v[3] + (v[3] - v[2])), v[2] - (v[3] - v[2]))).toFixed(1)); pen = true;
      }
      this.put('<path d="' + d.join('') + '" fill="none" stroke="' + (o.c || K.tinta) + '" stroke-width="' + (o.w || 2.2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + ' stroke-linejoin="round"/>');
    };
    P.area = function (f, a, b, o) {
      o = o || {}; var n = o.n || 200, y0 = this.Y(Math.min(Math.max(0, v[2]), v[3])), d = 'M' + this.X(a) + ',' + y0;
      for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n, y = f(x); y = Math.max(Math.min(y, v[3]), v[2]); d += 'L' + this.X(x).toFixed(1) + ',' + this.Y(y).toFixed(1); }
      d += 'L' + this.X(b) + ',' + y0 + 'Z';
      this.put('<path d="' + d + '" fill="' + (o.f || K.c1) + '" fill-opacity="' + (o.fo || .18) + '" stroke="none"/>');
    };
    P.rect = function (a, b, c, d, o) { o = o || {}; var x = Math.min(this.X(a), this.X(b)), y = Math.min(this.Y(c), this.Y(d)); this.put('<rect x="' + x + '" y="' + y + '" width="' + Math.abs(this.X(b) - this.X(a)) + '" height="' + Math.abs(this.Y(d) - this.Y(c)) + '" fill="' + (o.f || 'none') + '" fill-opacity="' + (o.fo || 1) + '" stroke="' + (o.c || 'none') + '" stroke-width="' + (o.w || 1) + '"/>'); };
    P.seg = function (a, b, c, d, o) { o = o || {}; this.put('<line x1="' + this.X(a) + '" y1="' + this.Y(b) + '" x2="' + this.X(c) + '" y2="' + this.Y(d) + '" stroke="' + (o.c || K.tinta) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + ' stroke-linecap="round"/>'); };
    P.punto = function (x, y, o) { o = o || {}; this.put('<circle cx="' + this.X(x) + '" cy="' + this.Y(y) + '" r="' + (o.r || 4.5) + '" fill="' + (o.c || K.tinta) + '" stroke="#fff" stroke-width="1.5"/>'); };
    P.texto = function (x, y, s, o) { o = o || {}; this.put(tx(this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), s, o)); };
    P.html = function () { var h = this.buf.join(''); this.buf = []; return h; };
    return P;
  }
  function controles(cu, defs, cb) {
    var d = el('div', { class: 'ctl2d' }), st = {};
    defs.forEach(function (x) {
      if (x[0] === 'sel') {
        var l = el('label', { class: 'sel' }, '<span>' + x[2] + '</span><select>' + x[3].map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('') + '</select>');
        var s = l.querySelector('select'); st[x[1]] = 0; s.addEventListener('change', function () { st[x[1]] = +s.value; cb(st); }); d.appendChild(l); return;
      }
      var l2 = el('label', null, '<span>' + x[1] + '</span><input type="range" min="' + x[2] + '" max="' + x[3] + '" step="' + (x[5] || 1) + '" value="' + x[4] + '"><b></b>');
      var i = l2.querySelector('input'), b = l2.querySelector('b'); st[x[0]] = +x[4]; b.textContent = f2(+x[4], 2);
      i.addEventListener('input', function () { st[x[0]] = +i.value; b.textContent = f2(+i.value, 2); cb(st); }); d.appendChild(l2);
    });
    cu.appendChild(d); return st;
  }
  function lect(c, partes) { c.querySelector('.lect').innerHTML = partes.map(function (p) { return '<span>' + p + '</span>'; }).join(''); }
  function col(c, s) { return '<b style="color:' + c + '">' + s + '</b>'; }
  var A = {};


  /* =========================================================
     Motor 3D en canvas: polígonos con sombreado, orden por
     profundidad, giro con arrastre, zoom con la rueda o pellizco.
     ========================================================= */
  function hexrgb(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function Escena(cv, o) {
    o = o || {};
    var E = { yaw: o.yaw === undefined ? -0.6 : o.yaw, pitch: o.pitch === undefined ? 0.35 : o.pitch, zoom: o.zoom || 1, esc: o.esc || 60, centro: o.centro || [0, 0, 0], polys: [], lineas: [], textos: [], fondo: o.fondo || null, auto: !!o.auto, luz: [0.35, 0.75, 0.55], oscuro: !!o.oscuro };
    var dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = cv.getContext('2d'), W = 0, H = 0;
    function tam() { var r = cv.getBoundingClientRect(); W = r.width || +cv.getAttribute('width'); H = W * (+cv.getAttribute('height') / +cv.getAttribute('width')); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    tam();
    window.addEventListener('resize', function () { tam(); E.pinta(); });
    function rot(p) {
      var x = p[0] - E.centro[0], y = p[1] - E.centro[1], z = p[2] - E.centro[2];
      var cy = Math.cos(E.yaw), sy = Math.sin(E.yaw), cp = Math.cos(E.pitch), sp = Math.sin(E.pitch);
      var x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
      var y2 = cp * y - sp * z1, z2 = sp * y + cp * z1;
      return [x1, y2, z2];
    }
    function proy(q) { var d = 14, k = d / (d - q[2]); var s = E.esc * E.zoom * k; return [W / 2 + q[0] * s, H / 2 - q[1] * s, q[2]]; }
    E.poly = function (pts, col, op, linea) { E.polys.push({ p: pts, c: col, o: op === undefined ? 1 : op, l: linea }); };
    E.linea = function (pts, col, w, dash) { E.lineas.push({ p: pts, c: col, w: w || 1.5, d: dash }); };
    E.texto = function (p, s, col) { E.textos.push({ p: p, s: s, c: col }); };
    E.limpia = function () { E.polys = []; E.lineas = []; E.textos = []; };
    E.pinta = function () {
      ctx.clearRect(0, 0, W, H);
      if (E.fondo) E.fondo(ctx, W, H);
      var L = E.luz, items = [];
      E.polys.forEach(function (P) {
        var q = P.p.map(rot), z = 0; q.forEach(function (v) { z += v[2]; }); z /= q.length;
        var a = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], b = [q[q.length - 1][0] - q[0][0], q[q.length - 1][1] - q[0][1], q[q.length - 1][2] - q[0][2]];
        if (q.length > 2) b = [q[2][0] - q[0][0], q[2][1] - q[0][1], q[2][2] - q[0][2]];
        var n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nn = Math.hypot(n[0], n[1], n[2]) || 1;
        var lam = Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nn);
        var esp = Math.pow(Math.abs(n[2] / nn), 12) * 0.25;
        items.push({ t: 0, z: z, q: q, P: P, k: 0.45 + 0.55 * lam, e: esp });
      });
      E.lineas.forEach(function (Li) { var q = Li.p.map(rot), z = 0; q.forEach(function (v) { z += v[2]; }); items.push({ t: 1, z: z / q.length + 0.01, q: q, L: Li }); });
      items.sort(function (u, v) { return u.z - v.z; });
      items.forEach(function (it) {
        var pr = it.q.map(proy);
        ctx.beginPath(); pr.forEach(function (v, i) { if (i) ctx.lineTo(v[0], v[1]); else ctx.moveTo(v[0], v[1]); });
        if (it.t === 0) {
          var c = hexrgb(it.P.c), k = it.k, e = it.e * 255;
          ctx.closePath();
          ctx.fillStyle = 'rgba(' + Math.min(255, Math.round(c[0] * k + e)) + ',' + Math.min(255, Math.round(c[1] * k + e)) + ',' + Math.min(255, Math.round(c[2] * k + e)) + ',' + it.P.o + ')';
          ctx.fill();
          ctx.strokeStyle = it.P.l || ctx.fillStyle; ctx.lineWidth = it.P.l ? 0.6 : 0.5; ctx.stroke();
        } else {
          ctx.strokeStyle = it.L.c; ctx.lineWidth = it.L.w; ctx.setLineDash(it.L.d || []); ctx.stroke(); ctx.setLineDash([]);
        }
      });
      E.textos.forEach(function (T) { var v = proy(rot(T.p)); ctx.font = 'italic 15px Palatino Linotype,Palatino,Georgia,serif'; ctx.fillStyle = T.c || (E.oscuro ? '#fff' : '#1d2233'); ctx.textAlign = 'center'; ctx.fillText(T.s, v[0], v[1]); });
    };
    // interacción
    var arr = null, toques = {}, d0 = 0, z0 = 1;
    cv.addEventListener('pointerdown', function (e) { toques[e.pointerId] = [e.clientX, e.clientY]; arr = [e.clientX, e.clientY]; E.auto = false; try { cv.setPointerCapture(e.pointerId); } catch (x) {} var ks = Object.keys(toques); if (ks.length === 2) { var a = toques[ks[0]], b = toques[ks[1]]; d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = E.zoom; } });
    cv.addEventListener('pointermove', function (e) {
      if (!arr || !toques[e.pointerId]) return;
      toques[e.pointerId] = [e.clientX, e.clientY]; var ks = Object.keys(toques);
      if (ks.length === 2) { var a = toques[ks[0]], b = toques[ks[1]]; E.zoom = Math.max(0.4, Math.min(3, z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / (d0 || 1))); E.pinta(); return; }
      E.yaw += (e.clientX - arr[0]) * 0.01; E.pitch = Math.max(-1.45, Math.min(1.45, E.pitch + (e.clientY - arr[1]) * 0.01)); arr = [e.clientX, e.clientY]; E.pinta();
    });
    function suelta(e) { delete toques[e.pointerId]; if (!Object.keys(toques).length) arr = null; }
    cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); E.zoom = Math.max(0.4, Math.min(3, E.zoom * Math.exp(-e.deltaY * 0.001))); E.pinta(); }, { passive: false });
    cv.addEventListener('dblclick', function () { E.yaw = o.yaw === undefined ? -0.6 : o.yaw; E.pitch = o.pitch === undefined ? 0.35 : o.pitch; E.zoom = 1; E.pinta(); });
    return E;
  }
  function lienzo(cu, W, H) { var cv = el('canvas', { class: 'c3d', width: W || 640, height: H || 400 }); cu.appendChild(cv); var a = el('div', { class: 'ayuda3d' }, 'Arrastra para girar · rueda o pellizco para acercar · doble clic para volver a la vista inicial'); cu.appendChild(a); return cv; }
  function ejes3(E, L, o) {
    o = o || {};
    var c = o.c || '#7b8394';
    E.linea([[-(o.xn || 0.3), 0, 0], [L[0], 0, 0]], c, 1.2); E.texto([L[0] + 0.25, 0, 0], 'x');
    E.linea([[0, -(o.yn === undefined ? 0.3 : o.yn), 0], [0, L[1], 0]], c, 1.2); E.texto([0, L[1] + 0.25, 0], 'y');
    if (L[2]) { E.linea([[0, 0, -(o.zn === undefined ? 0.3 : o.zn)], [0, 0, L[2]]], c, 1.2); E.texto([0, 0, L[2] + 0.3], 'z'); }
  }
  /* Superficie de revolución alrededor del eje x: radio r(x), x en [a,b], ángulo de barrido [0, phi] */
  function revX(E, r, a, b, phi, col, op, nx, nt) {
    nx = nx || 40; nt = nt || 36;
    for (var i = 0; i < nx; i++) {
      var x0 = a + (b - a) * i / nx, x1 = a + (b - a) * (i + 1) / nx, r0 = r(x0), r1 = r(x1);
      for (var j = 0; j < nt; j++) {
        var t0 = phi * j / nt, t1 = phi * (j + 1) / nt;
        E.poly([[x0, r0 * Math.cos(t0), r0 * Math.sin(t0)], [x1, r1 * Math.cos(t0), r1 * Math.sin(t0)], [x1, r1 * Math.cos(t1), r1 * Math.sin(t1)], [x0, r0 * Math.cos(t1), r0 * Math.sin(t1)]], col, op);
      }
    }
  }
  /* Disco (o arandela) perpendicular al eje x, en x, entre radios ri y ro, barrido phi */
  function anilloX(E, x, ri, ro, phi, col, op, nt) {
    nt = nt || 36;
    for (var j = 0; j < nt; j++) {
      var t0 = phi * j / nt, t1 = phi * (j + 1) / nt, c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      E.poly([[x, ri * c0, ri * s0], [x, ro * c0, ro * s0], [x, ro * c1, ro * s1], [x, ri * c1, ri * s1]], col, op);
    }
  }
  /* Región plana (en el plano xy) entre g(x) y f(x), girada un ángulo t alrededor del eje x */
  function regionX(E, f, g, a, b, t, col, op) {
    var n = 40, c = Math.cos(t), s = Math.sin(t);
    for (var i = 0; i < n; i++) {
      var x0 = a + (b - a) * i / n, x1 = a + (b - a) * (i + 1) / n;
      E.poly([[x0, g(x0) * c, g(x0) * s], [x1, g(x1) * c, g(x1) * s], [x1, f(x1) * c, f(x1) * s], [x0, f(x0) * c, f(x0) * s]], col, op);
    }
  }
  function curvaX(E, f, a, b, t, col, w) { var p = [], c = Math.cos(t), s = Math.sin(t); for (var i = 0; i <= 60; i++) { var x = a + (b - a) * i / 60; p.push([x, f(x) * c, f(x) * s]); } E.linea(p, col, w || 2.4); }
  function animador(boton, paso) {
    var on = false; boton.addEventListener('click', function () { on = !on; boton.textContent = on ? '❚❚ Pausa' : '▶ Animar'; if (on) (function bucle() { if (!on) return; if (paso() === false) { on = false; boton.textContent = '▶ Animar'; return; } requestAnimationFrame(bucle); })(); });
  }
  function botonAnim(cu) { var b = el('button', { type: 'button', class: 'btn-anim' }, '▶ Animar'); b.style.cssText = 'margin:6px 0 0;padding:5px 14px;border-radius:999px;border:1px solid #0f5257;background:#e8f4f3;color:#0f5257;font:14px system-ui,sans-serif;cursor:pointer'; cu.appendChild(b); return b; }
  function fijaSlider(cu, nombre, v) { var i = cu.querySelectorAll('.ctl2d input'); i.forEach(function (x) { if (x.parentNode.querySelector('span').textContent === nombre) { x.value = v; x.dispatchEvent(new Event('input')); } }); }

  /* ---------------- PERFILES ---------------- */
  var PERF = [
    { n: 'y = √x, 0 ≤ x ≤ 4', f: function (x) { return Math.sqrt(x); }, a: 0, b: 4, V: 8 * Math.PI, Vt: '8π' },
    { n: 'y = x², 0 ≤ x ≤ 1.5', f: function (x) { return x * x; }, a: 0, b: 1.5, V: Math.PI * Math.pow(1.5, 5) / 5, Vt: 'π(1,5)⁵/5' },
    { n: 'y = sen x, 0 ≤ x ≤ π', f: function (x) { return Math.sin(x); }, a: 0, b: Math.PI, V: Math.PI * Math.PI / 2, Vt: 'π²/2' },
    { n: 'esfera: y = √(4 − x²)', f: function (x) { return Math.sqrt(Math.max(0, 4 - x * x)); }, a: -2, b: 2, V: 32 * Math.PI / 3, Vt: '32π/3' },
    { n: 'cono: y = x/2, 0 ≤ x ≤ 3', f: function (x) { return x / 2; }, a: 0, b: 3, V: Math.PI * 9 / 4, Vt: 'π·(3/2)²·3/3' }];

  /* 1. Discos */
  A['discos'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu);
    var st = controles(cu, [['sel', 'p', 'región', PERF.map(function (p) { return p.n; })], ['n', 'número de discos', 1, 40, 6], ['phi', 'giro (grados)', 0, 360, 360, 5], ['sel', 'modo', 'mostrar', ['discos', 'sólido liso', 'ambos']]], pinta);
    var E = Escena(cv, { esc: 62, centro: [1.5, 0, 0], yaw: -.38, pitch: .32 }), b = botonAnim(cu);
    animador(b, function () { st.phi = (st.phi + 3) % 363; fijaSlider(cu, 'giro (grados)', Math.min(360, st.phi)); return true; });
    function pinta() {
      var P = PERF[st.p], f = P.f, n = st.n, phi = st.phi * Math.PI / 180, dx = (P.b - P.a) / n, S = 0;
      E.esc = 300 / (P.b - P.a + 1.5); E.centro = [(P.a + P.b) / 2, 0, 0]; E.limpia(); ejes3(E, [P.b + 0.6, 2.4, 0], { xn: -P.a + 0.4 });
      regionX(E, f, function () { return 0; }, P.a, P.b, 0, '#c9932e', 0.55); curvaX(E, f, P.a, P.b, 0, '#a86a12', 2.6);
      if (st.modo !== 0) revX(E, f, P.a, P.b, phi, '#0f5257', st.modo === 2 ? 0.25 : 0.92, 40, 40);
      for (var i = 0; i < n; i++) {
        var x0 = P.a + i * dx, x1 = x0 + dx, r = f(x1); S += Math.PI * r * r * dx;
        if (st.modo !== 1) { revX(E, function () { return r; }, x0, x1, phi, '#c2563a', 0.95, 1, 30); anilloX(E, x0, 0, r, phi, '#c2563a', 0.95, 30); anilloX(E, x1, 0, r, phi, '#c2563a', 0.95, 30); }
      }
      E.pinta();
      lect(c, ['suma de ' + n + ' discos (radio en el extremo derecho) Σ π f(xₖ)² Δx = ' + col(K.c2, f2(S)), 'volumen exacto ' + P.Vt + ' = ' + col(K.c1, f2(P.V)), 'error ' + f2(Math.abs(S - P.V), 4)]);
    }
    pinta();
  };

  /* 2. Arandelas */
  var PAR = [
    { n: 'entre y = x y y = x²', f: function (x) { return x; }, g: function (x) { return x * x; }, a: 0, b: 1, V: 2 * Math.PI / 15, Vt: '2π/15' },
    { n: 'entre y = √x y y = x', f: function (x) { return Math.sqrt(x); }, g: function (x) { return x; }, a: 0, b: 1, V: Math.PI / 6, Vt: 'π/6' },
    { n: 'toro: círculo de radio 0,6 con centro a 1,5', f: function (x) { return 1.5 + Math.sqrt(Math.max(0, .36 - x * x)); }, g: function (x) { return 1.5 - Math.sqrt(Math.max(0, .36 - x * x)); }, a: -.6, b: .6, V: 2 * Math.PI * Math.PI * .36 * 1.5, Vt: '2π²a²b' }];
  A['arandelas'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu);
    var st = controles(cu, [['sel', 'p', 'región', PAR.map(function (p) { return p.n; })], ['n', 'número de arandelas', 1, 30, 5], ['phi', 'giro (grados)', 0, 360, 300, 5]], pinta);
    var E = Escena(cv, { esc: 120, centro: [.5, 0, 0], yaw: -.45, pitch: .3 }), b = botonAnim(cu);
    animador(b, function () { st.phi = (st.phi + 3) % 363; fijaSlider(cu, 'giro (grados)', Math.min(360, st.phi)); return true; });
    function pinta() {
      var P = PAR[st.p], n = st.n, phi = st.phi * Math.PI / 180, dx = (P.b - P.a) / n, S = 0;
      E.esc = st.p === 2 ? 70 : 120; E.centro = [(P.a + P.b) / 2, 0, 0]; E.limpia(); ejes3(E, [P.b + .5, st.p === 2 ? 2.6 : 1.3, 0], { xn: -P.a + .3 });
      regionX(E, P.f, P.g, P.a, P.b, 0, '#c9932e', 0.6); curvaX(E, P.f, P.a, P.b, 0, '#a86a12'); curvaX(E, P.g, P.a, P.b, 0, '#a86a12');
      revX(E, P.f, P.a, P.b, phi, '#0f5257', 0.22, 30, 40); revX(E, P.g, P.a, P.b, phi, '#0f5257', 0.22, 30, 40);
      for (var i = 0; i < n; i++) {
        var x0 = P.a + i * dx, x1 = x0 + dx, xm = (x0 + x1) / 2, R = P.f(xm), r = P.g(xm); S += Math.PI * (R * R - r * r) * dx;
        revX(E, function () { return R; }, x0, x1, phi, '#c2563a', 0.95, 1, 30); revX(E, function () { return r; }, x0, x1, phi, '#e7a48c', 0.95, 1, 30);
        anilloX(E, x0, r, R, phi, '#c2563a', 0.95, 30); anilloX(E, x1, r, R, phi, '#c2563a', 0.95, 30);
      }
      E.pinta();
      lect(c, ['Σ π(R² − r²) Δx = ' + col(K.c2, f2(S)), 'volumen exacto ' + P.Vt + ' = ' + col(K.c1, f2(P.V))]);
    }
    pinta();
  };

  /* 3. Cascarones, con desenrollado */
  A['cascarones'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu);
    var f = function (x) { return 2 * x * x - x * x * x; };
    var st = controles(cu, [['n', 'número de cascarones', 1, 24, 6], ['k', 'cascarón destacado', 1, 24, 4], ['u', 'desenrollar', 0, 1, 0, .01], ['phi', 'giro (grados)', 0, 360, 360, 5]], pinta);
    var E = Escena(cv, { esc: 100, centro: [0, .5, 0], pitch: .45 }), b = botonAnim(cu), dir = 1;
    animador(b, function () { st.u += dir * 0.01; if (st.u >= 1) { st.u = 1; dir = -1; } if (st.u <= 0) { st.u = 0; dir = 1; } fijaSlider(cu, 'desenrollar', st.u); return true; });
    // punto de un cascarón de radio r al ángulo t, desenrollado una fracción u (rueda sobre la recta tangente x = r)
    function P(r, t, y, u) {
      if (u < 1e-3) return [r * Math.cos(t), y, r * Math.sin(t)];
      var R = r / (1 - u * 0.999), tt = t * r / R, cx = r - R; return [cx + R * Math.cos(tt), y, R * Math.sin(tt)];
    }
    function pinta() {
      var n = st.n, k = Math.min(st.k, n), dx = 2 / n, phi = st.phi * Math.PI / 180, S = 0, nt = 40;
      E.limpia(); ejes3(E, [2.6, 1.8, 0], { xn: 2.4 });
      // región generadora en el plano xy
      var reg = []; for (var i = 0; i <= 40; i++) { var x = 2 * i / 40; reg.push([x, f(x), 0]); } reg.push([2, 0, 0], [0, 0, 0]);
      for (var i2 = 0; i2 < 40; i2++) { var a = 2 * i2 / 40, bb = 2 * (i2 + 1) / 40; E.poly([[a, 0, 0], [bb, 0, 0], [bb, f(bb), 0], [a, f(a), 0]], '#c9932e', .55); }
      for (var j = 0; j < n; j++) {
        var r = (j + .5) * dx, h = f(r), r0 = j * dx, r1 = r0 + dx; S += 2 * Math.PI * r * h * dx;
        var u = (j + 1 === k) ? st.u : 0, colr = (j + 1 === k) ? '#c2563a' : '#0f5257', op = (j + 1 === k) ? .95 : .35;
        var T0 = u > 0 ? -Math.PI : 0, T1 = u > 0 ? Math.PI : phi, m = nt;
        for (var q = 0; q < m; q++) {
          var t0 = T0 + (T1 - T0) * q / m, t1 = T0 + (T1 - T0) * (q + 1) / m;
          E.poly([P(r1, t0, 0, u), P(r1, t1, 0, u), P(r1, t1, h, u), P(r1, t0, h, u)], colr, op);
          if (j + 1 === k) { E.poly([P(r0, t0, 0, u), P(r0, t1, 0, u), P(r0, t1, h, u), P(r0, t0, h, u)], '#e7a48c', op); E.poly([P(r0, t0, h, u), P(r0, t1, h, u), P(r1, t1, h, u), P(r1, t0, h, u)], colr, op); }
        }
      }
      var rk = (k - .5) * dx;
      E.pinta();
      lect(c, ['Σ 2π r h Δr = ' + col(K.c2, f2(S)), 'exacto ∫₀² 2πx(2x² − x³)dx = 16π/5 = ' + col(K.c1, f2(16 * Math.PI / 5)), 'cascarón ' + k + ': 2π·' + f2(rk, 2) + '·' + f2(f(rk), 2) + '·' + f2(dx, 2) + ' = ' + f2(2 * Math.PI * rk * f(rk) * dx)]);
    }
    pinta();
  };

  /* 4. Secciones transversales */
  A['secciones'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu);
    var st = controles(cu, [['sel', 'tipo', 'sección', ['cuadrados', 'triángulos equiláteros', 'semicírculos']], ['sel', 'base', 'base', ['disco x² + y² ≤ 4', 'entre y = 0 y y = 2 − x²/2']], ['n', 'número de rebanadas', 2, 40, 10], ['x', 'rebanada destacada en x', -2, 2, .5, .05]], pinta);
    var E = Escena(cv, { esc: 40, centro: [0, 1.2, 0], pitch: .5, yaw: -.75 });
    function pinta() {
      var lado, a = -2, b = 2;
      if (st.base === 0) lado = function (x) { return 2 * Math.sqrt(Math.max(0, 4 - x * x)); }; else lado = function (x) { return Math.max(0, 2 - x * x / 2); };
      var area = [function (s) { return s * s; }, function (s) { return Math.sqrt(3) / 4 * s * s; }, function (s) { return Math.PI * s * s / 8; }][st.tipo];
      var y0 = st.base === 0 ? function (x) { return -lado(x) / 2; } : function () { return 0; };
      E.limpia(); ejes3(E, [2.6, 0, 2.8], { xn: 2.6, zn: 2.6 });
      // base en el plano xz (y = 0 es "piso")
      for (var i = 0; i < 40; i++) { var x0 = a + 4 * i / 40, x1 = a + 4 * (i + 1) / 40; E.poly([[x0, 0, y0(x0)], [x1, 0, y0(x1)], [x1, 0, y0(x1) + lado(x1)], [x0, 0, y0(x0) + lado(x0)]], '#c9932e', .5); }
      var n = st.n, dx = 4 / n, S = 0;
      function seccion(x, w, colr, op) {
        var s = lado(x), z0 = y0(x); if (s < 1e-6) return;
        var pts;
        if (st.tipo === 0) pts = [[0, z0], [0, z0 + s], [s, z0 + s], [s, z0]];
        else if (st.tipo === 1) pts = [[0, z0], [0, z0 + s], [s * Math.sqrt(3) / 2, z0 + s / 2]];
        else { pts = []; for (var q = 0; q <= 24; q++) { var t = Math.PI * q / 24; pts.push([s / 2 * Math.sin(t), z0 + s / 2 - s / 2 * Math.cos(t)]); } }
        var xa = x - w / 2, xb = x + w / 2;
        E.poly(pts.map(function (p) { return [xa, p[0], p[1]]; }), colr, op); E.poly(pts.map(function (p) { return [xb, p[0], p[1]]; }), colr, op);
        for (var k = 0; k < pts.length; k++) { var p = pts[k], qn = pts[(k + 1) % pts.length]; if (st.tipo === 2 && k === pts.length - 1) { qn = pts[0]; } E.poly([[xa, p[0], p[1]], [xb, p[0], p[1]], [xb, qn[0], qn[1]], [xa, qn[0], qn[1]]], colr, op); }
      }
      for (var j = 0; j < n; j++) { var xm = a + (j + .5) * dx; S += area(lado(xm)) * dx; seccion(xm, dx * .92, '#0f5257', .55); }
      seccion(st.x, .06, '#c2563a', 1);
      var ex = 0; for (var m = 0; m < 4000; m++) { var xx = a + (m + .5) * 4 / 4000; ex += area(lado(xx)) * 4 / 4000; }
      E.pinta();
      lect(c, ['área de la sección en x = ' + f2(st.x, 2) + ': ' + col(K.c2, f2(area(lado(st.x)))), 'Σ A(xₖ) Δx = ' + col(K.c2, f2(S)), 'V = ∫ A(x) dx = ' + col(K.c1, f2(ex))]);
    }
    pinta();
  };

  /* 5. La trompeta de Torricelli */
  A['torricelli'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu, 640, 360);
    var st = controles(cu, [['L', 'longitud L', 1.5, 60, 6, .5]], pinta);
    var E = Escena(cv, { esc: 62, centro: [3.9, 0, 0], yaw: -.35, pitch: .3 });
    function pinta() {
      var L = st.L, vis = Math.min(L, 7.5), f = function (x) { return 1 / x; };
      E.limpia(); ejes3(E, [8, 1.4, 0], { xn: .4 });
      revX(E, f, 1, vis, 2 * Math.PI, '#0f5257', .9, 50, 36);
      anilloX(E, 1, 0, 1, 2 * Math.PI, '#c9932e', .8, 36);
      E.pinta();
      var V = Math.PI * (1 - 1 / L), Sinf = 2 * Math.PI * Math.log(L), S = 0, n = 2000;
      for (var i = 0; i < n; i++) { var x = 1 + (L - 1) * (i + .5) / n; S += 2 * Math.PI / x * Math.sqrt(1 + 1 / Math.pow(x, 4)) * (L - 1) / n; }
      lect(c, ['volumen π(1 − 1/L) = ' + col(K.c1, f2(V)) + ' → π', 'área ' + col(K.c2, f2(S)) + ' ≥ 2π ln L = ' + f2(Sinf) + ' → ∞', L > 7.5 ? '(se dibuja hasta x = 7,5)' : 'se puede llenar de pintura, pero no pintar']);
    }
    pinta();
  };

  /* 6. Pappus: el toro */
  A['pappus'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu, 640, 380);
    var st = controles(cu, [['a', 'radio del disco a', .2, 1.2, .6, .05], ['b', 'distancia al eje b', .5, 2.5, 1.6, .05], ['phi', 'giro (grados)', 0, 360, 270, 5]], pinta);
    var E = Escena(cv, { esc: 62, centro: [0, 0, 0], pitch: .5, yaw: -.5 }), bt = botonAnim(cu);
    animador(bt, function () { st.phi = (st.phi + 3) % 363; fijaSlider(cu, 'giro (grados)', Math.min(360, st.phi)); return true; });
    function pinta() {
      var a = st.a, b = Math.max(st.b, a + .05), phi = st.phi * Math.PI / 180, nt = 48, nu = 24;
      E.limpia(); E.linea([[0, -2, 0], [0, 2.2, 0]], '#7b8394', 1.4, [5, 4]); E.texto([0, 2.45, 0], 'eje');
      // toro alrededor del eje y: punto (b + a cos v) (cos t, ·, sin t), y = a sin v
      for (var i = 0; i < nt; i++) {
        var t0 = phi * i / nt, t1 = phi * (i + 1) / nt;
        for (var j = 0; j < nu; j++) {
          var v0 = 2 * Math.PI * j / nu, v1 = 2 * Math.PI * (j + 1) / nu;
          var p = function (t, v) { var R = b + a * Math.cos(v); return [R * Math.cos(t), a * Math.sin(v), R * Math.sin(t)]; };
          E.poly([p(t0, v0), p(t1, v0), p(t1, v1), p(t0, v1)], '#0f5257', .9);
        }
      }
      // disco generador en t = 0 y en t = phi
      [0, phi].forEach(function (t, k) { var pts = []; for (var j = 0; j < 36; j++) { var v = 2 * Math.PI * j / 36, R = b + a * Math.cos(v); pts.push([R * Math.cos(t), a * Math.sin(v), R * Math.sin(t)]); } E.poly(pts, k ? '#c2563a' : '#c9932e', .95); });
      // trayectoria del centroide
      var tr = []; for (var q = 0; q <= 60; q++) { var t = phi * q / 60; tr.push([b * Math.cos(t), 0, b * Math.sin(t)]); } E.linea(tr, '#a86a12', 2.4, [6, 4]);
      E.pinta();
      lect(c, ['A = πa² = ' + f2(Math.PI * a * a), 'el centroide recorre 2πb·(giro/360) = ' + f2(phi * b), 'V = A · recorrido = ' + col(K.c2, f2(Math.PI * a * a * phi * b)) + (st.phi === 360 ? ' = 2π²a²b' : '')]);
    }
    pinta();
  };

  /* ---------------- 2D ---------------- */
  var FUN = [
    { n: 'x²', f: function (x) { return x * x; }, F: function (x) { return x * x * x / 3; }, v: [-.2, 2.2, -.4, 4.6] },
    { n: 'sen x + 1', f: function (x) { return Math.sin(3 * x) + 1.2; }, F: function (x) { return -Math.cos(3 * x) / 3 + 1.2 * x; }, v: [-.2, 2.2, -.4, 2.6] },
    { n: 'eˣ', f: Math.exp, F: Math.exp, v: [-.2, 2.2, -.5, 8] },
    { n: '1/(1+x²)', f: function (x) { return 1 / (1 + x * x); }, F: Math.atan, v: [-.2, 2.2, -.15, 1.2] }];
  A['riemann'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'fi', 'función', ['f(x) = x²', 'f(x) = sen 3x + 1,2', 'f(x) = eˣ', 'f(x) = 1/(1 + x²)']], ['sel', 'r', 'regla', ['extremo izquierdo', 'extremo derecho', 'punto medio', 'trapecios']], ['n', 'n (subintervalos)', 1, 100, 5]], pinta);
    function pinta() {
      var F = FUN[st.fi], f = F.f, n = st.n, a = 0, b = 2, dx = (b - a) / n, S = 0, P = Plano(F.v); P.ejes({ py: F.v[3] > 5 ? 2 : 1 });
      for (var i = 0; i < n; i++) {
        var x0 = a + i * dx, x1 = x0 + dx;
        if (st.r === 3) { var y0 = f(x0), y1 = f(x1); S += (y0 + y1) / 2 * dx; P.put('<path d="M' + P.X(x0) + ',' + P.Y(0) + 'L' + P.X(x0) + ',' + P.Y(y0) + 'L' + P.X(x1) + ',' + P.Y(y1) + 'L' + P.X(x1) + ',' + P.Y(0) + 'Z" fill="' + K.c2 + '" fill-opacity=".25" stroke="' + K.c2 + '" stroke-width=".8"/>'); continue; }
        var xs = [x0, x1, (x0 + x1) / 2][st.r], y = f(xs); S += y * dx;
        P.rect(x0, x1, 0, y, { f: K.c2, fo: .25, c: K.c2, w: n > 60 ? .3 : .8 }); if (n <= 30) P.punto(xs, y, { r: 3, c: K.c2 });
      }
      P.curva(f, a - .1, b + .1, { c: K.c1, w: 2.6 });
      s.innerHTML = P.html(); var ex = F.F(b) - F.F(a);
      lect(c, ['suma = ' + col(K.c2, f2(S, 5)), '∫₀² f = ' + col(K.c1, f2(ex, 5)), 'error = ' + f2(Math.abs(S - ex), 6)]);
    }
    pinta();
  };
  A['acumulacion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 440);
    var f = function (t) { return Math.sin(1.6 * t) + .25 * t - .2; };
    var st = controles(cu, [['x', 'x', 0, 4, 1.5, .02]], pinta), b = botonAnim(cu);
    animador(b, function () { st.x += .02; if (st.x > 4) st.x = 0; fijaSlider(cu, 'x', st.x); return true; });
    function A_(x) { var n = 300, S = 0; for (var i = 0; i < n; i++) S += f(x * (i + .5) / n) * x / n; return S; }
    function pinta() {
      var x = st.x, P = Plano([-.2, 4.2, -1.3, 1.9], 640, 200, 0, 0), Q = Plano([-.2, 4.2, -.6, 1.6], 640, 200, 0, 230);
      P.ejes({ py: 1 }); P.area(function (t) { return Math.max(0, f(t)); }, 0, x, { f: K.c1, fo: .3 }); P.area(function (t) { return Math.min(0, f(t)); }, 0, x, { f: K.c2, fo: .3 });
      P.curva(f, 0, 4, { c: K.tinta, w: 2.4 }); P.seg(x, 0, x, f(x), { c: K.c3, dash: '4 3' }); P.punto(x, f(x), { c: K.c3 }); P.texto(3.9, 1.6, 'y = f(t)', { a: 'end', it: true });
      Q.ejes({ py: 1 }); Q.curva(A_, 0, 4, { c: '#b8c4c9', w: 2, n: 120 }); Q.curva(A_, 0, x, { c: K.c1, w: 3, n: 120 });
      var Ax = A_(x), m = f(x); Q.seg(x - .5, Ax - .5 * m, x + .5, Ax + .5 * m, { c: K.c3, w: 2 }); Q.punto(x, Ax, { c: K.c1 }); Q.texto(3.9, 1.4, 'y = A(x) = ∫₀ˣ f(t) dt', { a: 'end', it: true });
      s.innerHTML = P.html() + Q.html();
      lect(c, ['A(x) = ' + col(K.c1, f2(Ax)), 'pendiente de A en x = ' + col(K.c3, f2(m)), 'f(x) = ' + f2(m) + '  ⇒  A′(x) = f(x)']);
    }
    pinta();
  };
  A['entre'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var PR = [{ n: 'y = x + 2 y y = x²', f: function (x) { return x + 2; }, g: function (x) { return x * x; }, a: -1, b: 2, v: [-1.6, 2.6, -.6, 4.6] },
              { n: 'y = sen x y y = cos x', f: function (x) { return Math.sin(x); }, g: function (x) { return Math.cos(x); }, a: Math.PI / 4, b: 5 * Math.PI / 4, v: [0, 4.4, -1.3, 1.3] },
              { n: 'y = x³ − x y y = 0 (con signo)', f: function (x) { return x * x * x - x; }, g: function () { return 0; }, a: -1, b: 1, v: [-1.4, 1.4, -.6, .6] }];
    var st = controles(cu, [['sel', 'p', 'región', PR.map(function (p) { return p.n; })], ['n', 'rectángulos', 1, 60, 8], ['sel', 'm', 'integrar', ['|f − g| (área)', 'f − g (con signo)']]], pinta);
    function pinta() {
      var R = PR[st.p], n = st.n, dx = (R.b - R.a) / n, S = 0, P = Plano(R.v); P.ejes({ py: R.v[3] > 2 ? 1 : .5 });
      for (var i = 0; i < n; i++) { var x0 = R.a + i * dx, xm = x0 + dx / 2, yf = R.f(xm), yg = R.g(xm), d = st.m === 0 ? Math.abs(yf - yg) : yf - yg; S += d * dx; P.rect(x0, x0 + dx, Math.min(yf, yg), Math.max(yf, yg), { f: yf >= yg ? K.c1 : K.c2, fo: .3, c: yf >= yg ? K.c1 : K.c2, w: .6 }); }
      P.curva(R.f, R.v[0], R.v[1], { c: K.c1, w: 2.4 }); P.curva(R.g, R.v[0], R.v[1], { c: K.c2, w: 2.4 });
      var ex = 0; for (var k = 0; k < 3000; k++) { var x = R.a + (k + .5) * (R.b - R.a) / 3000, d2 = R.f(x) - R.g(x); ex += (st.m === 0 ? Math.abs(d2) : d2) * (R.b - R.a) / 3000; }
      s.innerHTML = P.html();
      lect(c, ['Σ = ' + col(K.c2, f2(S)), 'integral = ' + col(K.c1, f2(ex)), st.m === 1 ? 'las partes donde g > f restan' : 'el área siempre es positiva']);
    }
    pinta();
  };
  var SER = [
    { n: 'geométrica Σ (1/2)ⁿ', a: function (n) { return Math.pow(.5, n); }, L: 1, Lt: '1' },
    { n: 'armónica Σ 1/n', a: function (n) { return 1 / n; }, L: Infinity, Lt: '∞ (crece como ln N)' },
    { n: 'Basilea Σ 1/n²', a: function (n) { return 1 / (n * n); }, L: Math.PI * Math.PI / 6, Lt: 'π²/6' },
    { n: 'alternante Σ (−1)ⁿ⁺¹/n', a: function (n) { return (n % 2 ? 1 : -1) / n; }, L: Math.LN2, Lt: 'ln 2' },
    { n: 'Leibniz Σ (−1)ⁿ/(2n+1)', a: function (n) { return ((n - 1) % 2 ? -1 : 1) / (2 * n - 1); }, L: Math.PI / 4, Lt: 'π/4' },
    { n: 'telescópica Σ 1/(n(n+1))', a: function (n) { return 1 / (n * (n + 1)); }, L: 1, Lt: '1' }];
  A['sumas-parciales'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'serie', SER.map(function (x) { return x.n; })], ['N', 'N (términos)', 1, 200, 20]], pinta);
    function pinta() {
      var S = SER[st.k], N = st.N, sp = [], t = 0; for (var n = 1; n <= N; n++) { t += S.a(n); sp.push(t); }
      var mx = Math.max(1.8, isFinite(S.L) ? S.L * 1.3 : Math.max.apply(null, sp) * 1.15), P = Plano([-N * .03, N * 1.04, -.15 * mx, mx]); P.ejes({ px: Math.max(1, Math.pow(10, Math.floor(Math.log10(N))) * (N > 50 ? 2 : 1)), py: mx > 4 ? 1 : .5 });
      for (var i = 0; i < N; i++) { var an = S.a(i + 1); P.rect(i + .6, i + 1.4, 0, an, { f: K.c3, fo: .55 }); }
      if (isFinite(S.L)) P.seg(0, S.L, N, S.L, { c: K.c1, dash: '6 4', w: 1.6 });
      var d = sp.map(function (v, i) { return (i ? 'L' : 'M') + P.X(i + 1) + ',' + P.Y(v); }).join(''); P.put('<path d="' + d + '" fill="none" stroke="' + K.c2 + '" stroke-width="2"/>');
      if (N <= 60) sp.forEach(function (v, i) { P.punto(i + 1, v, { r: 3, c: K.c2 }); });
      s.innerHTML = P.html();
      lect(c, ['S_N = ' + col(K.c2, f2(t, 6)), 'suma de la serie: ' + col(K.c1, S.Lt + (isFinite(S.L) ? ' ≈ ' + f2(S.L, 6) : '')), isFinite(S.L) ? 'error ' + f2(Math.abs(S.L - t), 6) : 'ln N + γ ≈ ' + f2(Math.log(N) + .5772, 4)]);
    }
    pinta();
  };
  A['reordena'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['L', 'objetivo L', -1, 2.5, 1.5, .05], ['N', 'términos usados', 10, 600, 120, 10]], pinta);
    function pinta() {
      var L = st.L, N = st.N, p = 1, q = 2, t = 0, sp = [], usados = [];
      for (var i = 0; i < N; i++) { if (t <= L) { t += 1 / p; usados.push(1); p += 2; } else { t -= 1 / q; usados.push(-1); q += 2; } sp.push(t); }
      var P = Plano([-N * .03, N * 1.03, Math.min(-1.3, L - .6), Math.max(2.7, L + .6)]); P.ejes({ px: N > 200 ? 100 : 20, py: .5 });
      P.seg(0, L, N, L, { c: K.c1, dash: '6 4', w: 1.6 }); P.seg(0, Math.LN2, N, Math.LN2, { c: K.gris, dash: '2 3', w: 1.2 });
      P.texto(N, Math.LN2 - .12, 'ln 2 (orden usual)', { a: 'end', s: 12, c: K.gris });
      P.put('<path d="' + sp.map(function (v, i) { return (i ? 'L' : 'M') + P.X(i + 1) + ',' + P.Y(v); }).join('') + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.8"/>');
      s.innerHTML = P.html();
      lect(c, ['positivos usados: ' + (p - 1) / 2 + ', negativos: ' + (q - 2) / 2, 'suma parcial = ' + col(K.c2, f2(t, 5)), 'objetivo = ' + col(K.c1, f2(L, 2))]);
    }
    pinta();
  };
  var TAY = [
    { n: 'eˣ', f: Math.exp, c: function (k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return 1 / f; }, v: [-4, 4, -2, 12], R: Infinity },
    { n: 'sen x', f: Math.sin, c: function (k) { if (k % 2 === 0) return 0; var f = 1; for (var i = 2; i <= k; i++) f *= i; return ((k - 1) / 2 % 2 ? -1 : 1) / f; }, v: [-9, 9, -3, 3], R: Infinity },
    { n: 'ln(1 + x)', f: function (x) { return x > -1 ? Math.log(1 + x) : NaN; }, c: function (k) { return k === 0 ? 0 : (k % 2 ? 1 : -1) / k; }, v: [-1.5, 2.5, -3, 2], R: 1 },
    { n: '1/(1 + x²)', f: function (x) { return 1 / (1 + x * x); }, c: function (k) { return k % 2 ? 0 : ((k / 2) % 2 ? -1 : 1); }, v: [-2.5, 2.5, -1, 2], R: 1 }];
  A['taylor'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'función', TAY.map(function (t) { return t.n; })], ['N', 'grado N', 0, 40, 3]], pinta);
    function pinta() {
      var T = TAY[st.k], P = Plano(T.v); P.ejes({ px: T.v[1] > 5 ? 2 : 1, py: T.v[3] > 5 ? 2 : 1 });
      if (isFinite(T.R)) P.rect(-T.R, T.R, T.v[2], T.v[3], { f: K.c1, fo: .07 });
      P.curva(T.f, T.v[0], T.v[1], { c: K.tinta, w: 3 });
      var p = function (x) { var s2 = 0, xp = 1; for (var k = 0; k <= st.N; k++) { s2 += T.c(k) * xp; xp *= x; } return s2; };
      P.curva(p, T.v[0], T.v[1], { c: K.c2, w: 2.2, n: 600 });
      s.innerHTML = P.html();
      lect(c, ['T_' + st.N + '(1) = ' + col(K.c2, f2(p(1), 6)), 'f(1) = ' + col(K.c1, f2(T.f(1), 6)), isFinite(T.R) ? 'radio de convergencia ' + T.R + ' (franja)' : 'converge en todo ℝ']);
    }
    pinta();
  };

  /* ---------- portada: un sólido de revolución que se arma girando ---------- */
  function portada(cv) {
    var hero = cv.parentNode, ctl = document.createElement('div'); ctl.className = 'portada-ctl';
    var FORMAS = [
      { n: 'jarrón', f: function (x) { return .55 + .35 * Math.sin(1.7 * x + .6) + .12 * x; }, a: -1.7, b: 1.9 },
      { n: 'trompeta', f: function (x) { return 1 / (x + 2.25); }, a: -1.8, b: 2.8, tor: 1 },
      { n: 'toro', toro: 1 },
      { n: 'esfera', f: function (x) { return Math.sqrt(Math.max(0, 1.6 * 1.6 - x * x)); }, a: -1.6, b: 1.6 }];
    ctl.innerHTML = '<div class="pc-fila">' + FORMAS.map(function (o, i) { return '<button type="button" data-f="' + i + '"' + (i ? '' : ' class="on"') + '>' + o.n + '</button>'; }).join('') + '</div>' +
      '<div class="pc-fila"><button type="button" data-m="1">discos</button><button type="button" data-p="1" class="pc-pausa">❚❚</button></div><div class="pc-ayuda">Arrastra para girar el sólido · rueda para acercar</div>';
    hero.appendChild(ctl);
    var E = Escena(cv, { esc: 80, yaw: -.5, pitch: .38, oscuro: true }), fi = 0, discos = false, pausa = false, phi = 0, quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto) phi = 2 * Math.PI;
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.f) { fi = +b.dataset.f; phi = quieto ? 2 * Math.PI : 0; ctl.querySelectorAll('[data-f]').forEach(function (x) { x.classList.toggle('on', +x.dataset.f === fi); }); }
      if (b.dataset.m) { discos = !discos; b.classList.toggle('on', discos); }
      if (b.dataset.p) { pausa = !pausa; b.textContent = pausa ? '▶' : '❚❚'; }
      arma();
    });
    function arma() {
      var F = FORMAS[fi], p = Math.min(phi, 2 * Math.PI); E.limpia();
      E.linea([[-2.6, 0, 0], [2.9, 0, 0]], 'rgba(255,255,255,.45)', 1.2, [5, 4]);
      if (F.toro) {
        var a = .55, b = 1.25, nt = 44, nu = 22, P = function (t, v) { var R = b + a * Math.cos(v); return [a * Math.sin(v), R * Math.cos(t), R * Math.sin(t)]; };
        for (var i = 0; i < nt; i++) { var t0 = p * i / nt, t1 = p * (i + 1) / nt; for (var j = 0; j < nu; j++) { var v0 = 2 * Math.PI * j / nu, v1 = 2 * Math.PI * (j + 1) / nu; E.poly([P(t0, v0), P(t1, v0), P(t1, v1), P(t0, v1)], '#1d8a80', .95); } }
        var d = []; for (var k = 0; k < 36; k++) { var v = 2 * Math.PI * k / 36; d.push([a * Math.sin(v), b + a * Math.cos(v), 0]); } E.poly(d, '#f3c56b', .9);
      } else {
        if (discos) { var n = 14, dx = (F.b - F.a) / n; for (var q = 0; q < n; q++) { var x0 = F.a + q * dx, r = F.f(x0 + dx / 2); revX(E, function () { return r; }, x0, x0 + dx * .9, p, '#e07a5f', .95, 1, 30); anilloX(E, x0, 0, r, p, '#e07a5f', .95, 30); anilloX(E, x0 + dx * .9, 0, r, p, '#e07a5f', .95, 30); } }
        else revX(E, F.f, F.a, F.b, p, '#1d8a80', .95, 36, 44);
        regionX(E, F.f, function () { return 0; }, F.a, F.b, 0, '#f3c56b', .75); curvaX(E, F.f, F.a, F.b, 0, '#ffe2a6', 2.4); curvaX(E, F.f, F.a, F.b, p, '#ffe2a6', 1.6);
      }
      E.texto([0, -1.9, 0], fi === 2 ? 'V = 2π²a²b' : fi === 1 ? 'V = π ∫ dx/x² < ∞' : 'V = ∫ π f(x)² dx', '#f3c56b');
      E.pinta();
    }
    (function anim() {
      if (!pausa) { if (phi < 2 * Math.PI) phi += .035; else E.yaw += .004; }
      arma(); if (!quieto) requestAnimationFrame(anim);
    })();
  }

  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('canvas.portada3d'); if (p) portada(p);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

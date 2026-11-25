/* Geometría Básica — figuras interactivas (SVG puro, sin dependencias) */
(function () {
  'use strict';
  var C = { verde: '#006633', verdeO: '#00482a', teal: '#006e78', ambar: '#c47800', morado: '#664896',
    azul: '#1955a0', rojo: '#b22222', gris: '#7a7a7a' };

  /* ---------- álgebra mínima ---------- */
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1]]; }
  function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; }
  function mul(p, t) { return [p[0] * t, p[1] * t]; }
  function dot(p, q) { return p[0] * q[0] + p[1] * q[1]; }
  function cross(p, q) { return p[0] * q[1] - p[1] * q[0]; }
  function norm(p) { return Math.hypot(p[0], p[1]); }
  function dist(p, q) { return norm(sub(p, q)); }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  function ang(v) { return Math.atan2(v[1], v[0]); }
  function angEn(A, B, Cc) { // ángulo ABC en grados (0..180)
    var u = sub(A, B), v = sub(Cc, B);
    return Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (norm(u) * norm(v))))) * 180 / Math.PI;
  }
  function fmt(x, d) { d = d === undefined ? 1 : d; var s = x.toFixed(d); if (s === '-0' || /^-0\.0+$/.test(s)) s = s.slice(1); return s.replace('.', ','); }
  var G = { sub: sub, add: add, mul: mul, dot: dot, cross: cross, norm: norm, dist: dist, mid: mid, lerp: lerp, ang: ang, angEn: angEn, fmt: fmt, C: C };

  /* ---------- lienzo ---------- */
  function Lienzo(svg, vista) {
    // vista: [xmin, xmax, ymin, ymax]; el svg usa viewBox en píxeles
    var W = vista.W || 640, H = vista.H || 380;
    var sx = W / (vista[1] - vista[0]), sy = H / (vista[3] - vista[2]), s = Math.min(sx, sy);
    var ox = (W - s * (vista[1] - vista[0])) / 2, oy = (H - s * (vista[3] - vista[2])) / 2;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var L = {
      W: W, H: H, s: s,
      X: function (p) { return [ox + (p[0] - vista[0]) * s, H - oy - (p[1] - vista[2]) * s]; },
      inv: function (x, y) { return [vista[0] + (x - ox) / s, vista[2] + (H - oy - y) / s]; },
      buf: [],
      put: function (t) { this.buf.push(t); },
      seg: function (p, q, o) {
        o = o || {}; var a = this.X(p), b = this.X(q);
        this.put('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (o.c || '#222') +
          '" stroke-width="' + (o.w || 2) + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') +
          (o.op ? ' opacity="' + o.op + '"' : '') + '/>');
      },
      recta: function (p, q, o) { // recta completa por p y q
        var d = sub(q, p), n = norm(d); if (n < 1e-9) return; d = mul(d, 1 / n);
        var R = 4 * Math.max(vista[1] - vista[0], vista[3] - vista[2]);
        this.seg(add(p, mul(d, -R)), add(p, mul(d, R)), o);
      },
      flecha: function (p, q, o) {
        o = o || {}; var c = o.c || C.verde, w = o.w || 2.6;
        var a = this.X(p), b = this.X(q), d = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(d[0], d[1]);
        if (n < 2) return;
        var u = [d[0] / n, d[1] / n], h = Math.min(14, n * 0.45), e = [b[0] - u[0] * h, b[1] - u[1] * h];
        this.put('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>');
        var l = [e[0] - u[1] * h * 0.42, e[1] + u[0] * h * 0.42], r = [e[0] + u[1] * h * 0.42, e[1] - u[0] * h * 0.42];
        this.put('<path d="M' + b + 'L' + l + 'L' + r + 'Z" fill="' + c + '"/>');
      },
      poli: function (ps, o) {
        o = o || {}; var self = this;
        this.put('<path d="M' + ps.map(function (p) { return self.X(p).join(','); }).join('L') + 'Z" fill="' + (o.f || 'none') +
          '" fill-opacity="' + (o.fo === undefined ? 1 : o.fo) + '" stroke="' + (o.c || 'none') + '" stroke-width="' + (o.w || 1.5) +
          '" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>');
      },
      circ: function (c, r, o) {
        o = o || {}; var a = this.X(c);
        this.put('<circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + r * s + '" fill="' + (o.f || 'none') + '" fill-opacity="' + (o.fo || 1) +
          '" stroke="' + (o.c || '#222') + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>');
      },
      // marca del ángulo AVB (el menor), radio en px
      angulo: function (A, V, B, o) {
        o = o || {}; var r = o.r || 26, c = o.c || C.verde;
        var v = this.X(V), a = this.X(A), b = this.X(B);
        var t1 = Math.atan2(a[1] - v[1], a[0] - v[0]), t2 = Math.atan2(b[1] - v[1], b[0] - v[0]);
        var d = t2 - t1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        var p1 = [v[0] + r * Math.cos(t1), v[1] + r * Math.sin(t1)], p2 = [v[0] + r * Math.cos(t1 + d), v[1] + r * Math.sin(t1 + d)];
        var sw = d > 0 ? 1 : 0;
        this.put('<path d="M' + v + 'L' + p1 + 'A' + r + ',' + r + ' 0 0 ' + sw + ' ' + p2 + 'Z" fill="' + c + '" fill-opacity="' + (o.fo || 0.22) + '" stroke="none"/>');
        this.put('<path d="M' + p1 + 'A' + r + ',' + r + ' 0 0 ' + sw + ' ' + p2 + '" fill="none" stroke="' + c + '" stroke-width="1.6"/>');
        if (o.txt) {
          var tm = t1 + d / 2, rr = r + (o.dr || 14);
          this.texto([v[0] + rr * Math.cos(tm), v[1] + rr * Math.sin(tm)], o.txt, { c: c, px: true, size: o.size || 14, bold: true });
        }
      },
      recto: function (A, V, B, o) {
        o = o || {}; var k = (o.r || 12) / s;
        var u = sub(A, V), w = sub(B, V); u = mul(u, k / norm(u)); w = mul(w, k / norm(w));
        var p = add(V, u), q = add(add(V, u), w), r = add(V, w), self = this;
        this.put('<path d="M' + [p, q, r].map(function (z) { return self.X(z).join(','); }).join('L') + '" fill="none" stroke="' + (o.c || '#444') + '" stroke-width="1.3"/>');
      },
      texto: function (p, t, o) {
        o = o || {}; var a = o.px ? p : this.X(p);
        var dx = o.dx || 0, dy = o.dy || 0;
        this.put('<text x="' + (a[0] + dx) + '" y="' + (a[1] + dy) + '" fill="' + (o.c || '#222') + '" font-size="' + (o.size || 16) +
          '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="middle" font-family="Palatino Linotype,Book Antiqua,Palatino,Georgia,serif"' +
          (o.bold ? ' font-weight="700"' : '') + (o.it === false ? '' : ' font-style="italic"') +
          ' paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">' + t + '</text>');
      },
      etiqueta: function (P, t, centro, o) { // etiqueta alejada del punto 'centro'
        o = o || {}; var a = this.X(P), c = this.X(centro), d = [a[0] - c[0], a[1] - c[1]], n = Math.hypot(d[0], d[1]) || 1, k = o.k || 17;
        this.texto([a[0] + d[0] / n * k, a[1] + d[1] / n * k], t, { px: true, c: o.c, size: o.size || 17 });
      },
      punto: function (p, o) {
        o = o || {}; var a = this.X(p);
        this.put('<circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + (o.r || 4) + '" fill="' + (o.c || '#222') + '"/>');
      },
      ejes: function (o) {
        o = o || {};
        var self = this;
        for (var x = Math.ceil(vista[0]); x <= vista[1]; x++) { if (x) { self.seg([x, vista[2]], [x, vista[3]], { c: '#e2ebe5', w: 1 }); } }
        for (var y = Math.ceil(vista[2]); y <= vista[3]; y++) { if (y) { self.seg([vista[0], y], [vista[1], y], { c: '#e2ebe5', w: 1 }); } }
        this.flecha([vista[0], 0], [vista[1], 0], { c: '#8a958f', w: 1.3 });
        this.flecha([0, vista[2]], [0, vista[3]], { c: '#8a958f', w: 1.3 });
        if (o.num) {
          for (x = Math.ceil(vista[0]); x < vista[1]; x++) if (x) this.texto([x, 0], x, { dy: 13, size: 11, c: '#8a958f', it: false });
          for (y = Math.ceil(vista[2]); y < vista[3]; y++) if (y) this.texto([0, y], y, { dx: -10, size: 11, c: '#8a958f', it: false });
        }
        this.texto([vista[1], 0], 'x', { dx: -8, dy: -12, c: '#6a756f' });
        this.texto([0, vista[3]], 'y', { dx: 12, dy: 10, c: '#6a756f' });
      }
    };
    return L;
  }

  /* ---------- applet genérico con puntos arrastrables ---------- */
  function Applet(cont, def) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var cuerpo = cont.querySelector('.acuerpo');
    cuerpo.appendChild(svg);
    var lect = cont.querySelector('.lect');
    var vista = def.vista; vista.W = def.W || 640; vista.H = def.H || 380;
    var L = Lienzo(svg, vista);
    var P = {};
    Object.keys(def.puntos).forEach(function (k) { P[k] = def.puntos[k].slice(); });
    if (def.init) def.init(P, G);
    var arrastrando = null;
    function dibuja() {
      L.buf = [];
      var info = def.dibuja(L, P, G) || '';
      // puntos arrastrables
      Object.keys(def.puntos).forEach(function (k) {
        if (def.ocultos && def.ocultos.indexOf(k) >= 0) return;
        var a = L.X(P[k]);
        var col = (def.colorPunto && def.colorPunto[k]) || C.ambar;
        L.put('<g class="pt" data-k="' + k + '"><circle cx="' + a[0] + '" cy="' + a[1] + '" r="16" fill="' + col + '" fill-opacity="0.13"/>' +
          '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="6.5" fill="' + col + '" stroke="#fff" stroke-width="2"/></g>');
      });
      svg.innerHTML = L.buf.join('');
      if (lect) lect.innerHTML = info;
    }
    function pos(e) {
      var r = svg.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
      var x = (t.clientX - r.left) * L.W / r.width, y = (t.clientY - r.top) * L.H / r.height;
      return L.inv(x, y);
    }
    svg.addEventListener('pointerdown', function (e) {
      var g = e.target.closest('.pt'); if (!g) return;
      arrastrando = g.getAttribute('data-k'); svg.setPointerCapture(e.pointerId); e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) {
      if (!arrastrando) return;
      var p = pos(e);
      p[0] = Math.max(vista[0], Math.min(vista[1], p[0])); p[1] = Math.max(vista[2], Math.min(vista[3], p[1]));
      if (def.ajusta) p = def.ajusta(arrastrando, p, P, G) || p;
      if (def.rejilla) p = [Math.round(p[0] / def.rejilla) * def.rejilla, Math.round(p[1] / def.rejilla) * def.rejilla];
      var viejo = P[arrastrando]; P[arrastrando] = p;
      if (def.valido && !def.valido(P, G)) P[arrastrando] = viejo;
      dibuja();
    });
    svg.addEventListener('pointerup', function () { arrastrando = null; });
    svg.addEventListener('pointercancel', function () { arrastrando = null; });
    if (def.deslizadores) {
      var cd = document.createElement('div'); cd.className = 'ctl2d';
      def.deslizadores.forEach(function (d) {
        var l = document.createElement('label');
        l.innerHTML = '<span>' + d.etiqueta + '</span><input type="range" name="' + d.nombre + '" min="' + d.min + '" max="' + d.max + '" step="' + (d.paso || 1) + '" value="' + d.valor + '"><b></b>';
        var i = l.querySelector('input'), o = l.querySelector('b');
        var m = function () { o.textContent = d.formato ? d.formato(+i.value) : i.value; };
        i.addEventListener('input', m); m();
        cd.appendChild(l);
      });
      cuerpo.appendChild(cd);
    }
    cont.querySelectorAll('input[type=range]').forEach(function (r) {
      r.addEventListener('input', function () { P['_' + r.name] = +r.value; dibuja(); });
      P['_' + r.name] = +r.value;
    });
    dibuja();
  }

  function noDegenerado(A, B, Cc) { return Math.abs(cross(sub(B, A), sub(Cc, A))) > 0.4 && dist(A, B) > 0.5 && dist(B, Cc) > 0.5 && dist(A, Cc) > 0.5; }
  function sobreCirculo(O, r) { return function (k, p) { if (k === 'O') return p; var d = sub(p, O), n = norm(d) || 1; return add(O, mul(d, r / n)); }; }

  /* ================================================================
     Catálogo de figuras interactivas
     ================================================================ */
  var A = {};

  /* --- Suma de los ángulos de un triángulo --- */
  A['suma-angulos'] = {
    vista: [-1, 9, -0.8, 5.2],
    puntos: { A: [0.6, 0.3], B: [7.6, 0.6], C: [3.0, 4.2] },
    valido: function (P) { return noDegenerado(P.A, P.B, P.C); },
    dibuja: function (L, P, G) {
      var a = G.angEn(P.B, P.A, P.C), b = G.angEn(P.A, P.B, P.C), c = G.angEn(P.A, P.C, P.B);
      // paralela a AB por C
      var d = G.sub(P.B, P.A);
      L.recta(P.C, G.add(P.C, d), { c: C.gris, w: 1.4, dash: '6 5' });
      L.poli([P.A, P.B, P.C], { f: C.verde, fo: 0.07, c: '#1d2420', w: 2.2 });
      var izq = G.add(P.C, G.mul(d, -1)), der = G.add(P.C, d);
      L.angulo(P.B, P.A, P.C, { c: C.verde, txt: 'α' });
      L.angulo(P.A, P.B, P.C, { c: C.ambar, txt: 'β' });
      L.angulo(P.A, P.C, P.B, { c: C.morado, txt: 'γ', r: 24 });
      L.angulo(izq, P.C, P.A, { c: C.verde, r: 34, txt: 'α' });
      L.angulo(P.B, P.C, der, { c: C.ambar, r: 34, txt: 'β' });
      var G0 = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, G0, { k: 22 }); });
      return '<span><b style="color:' + C.verde + '">α</b> = ' + G.fmt(a) + '°</span><span><b style="color:' + C.ambar + '">β</b> = ' + G.fmt(b) +
        '°</span><span><b style="color:' + C.morado + '">γ</b> = ' + G.fmt(c) + '°</span><span>α + β + γ = <b>' + G.fmt(a + b + c) + '°</b></span>';
    }
  };

  /* --- Ángulo exterior --- */
  A['angulo-exterior'] = {
    vista: [-1, 10, -0.8, 5],
    puntos: { A: [0.3, 0.3], B: [5.6, 0.3], C: [2.4, 3.9] },
    valido: function (P) { return noDegenerado(P.A, P.B, P.C) && P.B[0] > P.A[0] + 0.5; },
    ajusta: function (k, p, P) { if (k === 'B') return [p[0], P.A[1]]; if (k === 'A') return [p[0], P.B[1]]; return p; },
    dibuja: function (L, P, G) {
      var X = G.add(P.B, G.mul(G.sub(P.B, P.A), 2.5 / G.dist(P.A, P.B)));
      L.seg(P.B, X, { c: C.gris, w: 1.6, dash: '6 5' });
      L.poli([P.A, P.B, P.C], { f: C.verde, fo: 0.07, c: '#1d2420', w: 2.2 });
      L.angulo(P.B, P.A, P.C, { c: C.verde, txt: 'α' });
      L.angulo(P.A, P.C, P.B, { c: C.morado, txt: 'γ' });
      L.angulo(X, P.B, P.C, { c: C.ambar, txt: 'δ', r: 30 });
      var G0 = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, G0, { k: 22 }); });
      var a = G.angEn(P.B, P.A, P.C), c = G.angEn(P.A, P.C, P.B), d = G.angEn(X, P.B, P.C);
      return '<span>exterior angle <b style="color:' + C.ambar + '">δ</b> = ' + G.fmt(d) + '°</span><span><b style="color:' + C.verde + '">α</b> + <b style="color:' + C.morado + '">γ</b> = ' + G.fmt(a) + '° + ' + G.fmt(c) + '° = <b>' + G.fmt(a + c) + '°</b></span>';
    }
  };

  /* --- Lado mayor frente a ángulo mayor --- */
  A['lado-angulo'] = {
    vista: [-1, 9, -0.8, 5],
    puntos: { A: [0.5, 0.4], B: [7.5, 0.8], C: [2.2, 4.1] },
    valido: function (P) { return noDegenerado(P.A, P.B, P.C); },
    dibuja: function (L, P, G) {
      var lados = { a: G.dist(P.B, P.C), b: G.dist(P.A, P.C), c: G.dist(P.A, P.B) };
      var angs = { A: G.angEn(P.B, P.A, P.C), B: G.angEn(P.A, P.B, P.C), C: G.angEn(P.A, P.C, P.B) };
      var orden = ['A', 'B', 'C'].sort(function (x, y) { return angs[y] - angs[x]; });
      var col = {}; col[orden[0]] = C.rojo; col[orden[1]] = C.ambar; col[orden[2]] = C.teal;
      L.poli([P.A, P.B, P.C], { f: C.verde, fo: 0.06 });
      L.seg(P.B, P.C, { c: col.A, w: 4 }); L.seg(P.A, P.C, { c: col.B, w: 4 }); L.seg(P.A, P.B, { c: col.C, w: 4 });
      L.angulo(P.B, P.A, P.C, { c: col.A }); L.angulo(P.A, P.B, P.C, { c: col.B }); L.angulo(P.A, P.C, P.B, { c: col.C });
      var G0 = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, G0, { k: 22 }); });
      L.etiqueta(G.mid(P.B, P.C), 'a', G0, { c: col.A, k: 14 }); L.etiqueta(G.mid(P.A, P.C), 'b', G0, { c: col.B, k: 14 }); L.etiqueta(G.mid(P.A, P.B), 'c', G0, { c: col.C, k: 14 });
      var nom = { A: 'a', B: 'b', C: 'c' };
      return orden.map(function (k) { return '<span style="color:' + col[k] + '"><b>∠' + k + '</b> = ' + G.fmt(angs[k]) + '° &nbsp;↔&nbsp; <b>' + nom[k] + '</b> = ' + G.fmt(lados[nom[k]], 2) + '</span>'; }).join('') +
        (function () { var l = [lados.a, lados.b, lados.c].sort(function (x, y) { return y - x; });
          return '<span>Triangle inequality: longest side ' + G.fmt(l[0], 2) + ' &lt; ' + G.fmt(l[1], 2) + ' + ' + G.fmt(l[2], 2) + ' = ' + G.fmt(l[1] + l[2], 2) + '</span>'; })();
    }
  };

  /* --- Base media --- */
  A['base-media'] = {
    vista: [-1, 9, -0.6, 5],
    puntos: { A: [0.4, 0.3], B: [7.6, 0.6], C: [2.8, 4.4] },
    valido: function (P) { return noDegenerado(P.A, P.B, P.C); },
    dibuja: function (L, P, G) {
      var M = G.mid(P.A, P.C), N = G.mid(P.B, P.C);
      L.poli([P.A, P.B, P.C], { f: C.verde, fo: 0.07, c: '#1d2420', w: 2.2 });
      L.poli([M, N, P.C], { f: C.ambar, fo: 0.12 });
      L.seg(P.A, P.B, { c: C.teal, w: 4 });
      L.seg(M, N, { c: C.ambar, w: 4 });
      L.punto(M, { c: C.ambar }); L.punto(N, { c: C.ambar });
      var G0 = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, G0, { k: 22 }); });
      L.etiqueta(M, 'M', G0, { k: 18, c: C.ambar }); L.etiqueta(N, 'N', G0, { k: 18, c: C.ambar });
      var ab = G.dist(P.A, P.B), mn = G.dist(M, N);
      var paral = Math.abs(G.cross(G.sub(P.B, P.A), G.sub(N, M))) < 1e-9 ? 'sí' : 'sí';
      return '<span><b style="color:' + C.ambar + '">MN</b> = ' + G.fmt(mn, 2) + '</span><span><b style="color:' + C.teal + '">AB</b> = ' + G.fmt(ab, 2) + '</span><span>MN / AB = <b>' + G.fmt(mn / ab, 3) + '</b></span><span>¿MN ∥ AB? <b>' + paral + '</b></span>';
    }
  };

  /* --- Teorema de Pitágoras --- */
  A['pitagoras'] = {
    vista: [-4.2, 8.2, -4.6, 7], H: 420,
    puntos: { B: [3, 0], A: [0, 2.2] },
    colorPunto: {},
    ajusta: function (k, p) { if (k === 'B') return [Math.min(4.2, Math.max(0.6, p[0])), 0]; return [0, Math.min(3.8, Math.max(0.6, p[1]))]; },
    dibuja: function (L, P, G) {
      var O = [0, 0], a = P.B[0], b = P.A[1];
      L.poli([O, P.B, [a, -a], [0, -a]], { f: C.teal, fo: 0.22, c: C.teal, w: 1.6 });
      L.poli([O, [-b, 0], [-b, b], P.A], { f: C.ambar, fo: 0.22, c: C.ambar, w: 1.6 });
      var d = G.sub(P.B, P.A), n = [d[1], -d[0]];  // normal exterior
      n = [-d[1], d[0]];
      if (G.dot(n, G.sub(O, P.A)) > 0) n = G.mul(n, -1);
      L.poli([P.A, P.B, G.add(P.B, n), G.add(P.A, n)], { f: C.morado, fo: 0.2, c: C.morado, w: 1.6 });
      L.poli([O, P.B, P.A], { f: '#fff', c: '#1d2420', w: 2.4 });
      L.recto(P.B, O, P.A);
      L.texto([a / 2, -a / 2], 'a² = ' + G.fmt(a * a, 2), { c: C.teal, it: false, bold: true, size: 15 });
      L.texto([-b / 2, b / 2], 'b² = ' + G.fmt(b * b, 2), { c: C.ambar, it: false, bold: true, size: 15 });
      var cc = G.add(G.mid(P.A, P.B), G.mul(n, 0.5));
      L.texto(cc, 'c² = ' + G.fmt(a * a + b * b, 2), { c: C.morado, it: false, bold: true, size: 15 });
      L.texto(G.mid(O, P.B), 'a', { dy: -12, c: C.teal }); L.texto(G.mid(O, P.A), 'b', { dx: 12, c: C.ambar });
      return '<span><b style="color:' + C.teal + '">a²</b> + <b style="color:' + C.ambar + '">b²</b> = ' + G.fmt(a * a, 2) + ' + ' + G.fmt(b * b, 2) + ' = <b>' + G.fmt(a * a + b * b, 2) + '</b></span><span><b style="color:' + C.morado + '">c²</b> = ' + G.fmt(G.dist(P.A, P.B) ** 2, 2) + '</span>';
    }
  };

  /* --- Teorema de Thales --- */
  A['thales'] = {
    vista: [-0.5, 10, -0.5, 6],
    puntos: { O: [0.6, 3.0], P: [9.3, 5.6], Q: [9.2, 0.4], T1: [3.4, 3], T2: [6.3, 3] },
    ocultos: [],
    ajusta: function (k, p, P) { if (k === 'T1' || k === 'T2') return [p[0], P.T1[1]]; return p; },
    valido: function (P) { return P.T1[0] > P.O[0] + 0.4 && P.T2[0] > P.T1[0] + 0.4 && P.P[0] > P.T2[0] + 0.3 && P.Q[0] > P.T2[0] + 0.3; },
    dibuja: function (L, P, G) {
      // dos rectas desde O; paralelas verticales por T1 y T2 con dirección fija
      var dir = [0.25, 1];
      function corte(R, T) { // intersección de recta O->R con recta por T de dirección dir
        var u = G.sub(R, P.O), w = G.sub(T, P.O), den = G.cross(u, dir);
        var t = G.cross(w, dir) / den; return G.add(P.O, G.mul(u, t));
      }
      var A1 = corte(P.P, P.T1), A2 = corte(P.P, P.T2), B1 = corte(P.Q, P.T1), B2 = corte(P.Q, P.T2);
      L.seg(P.O, P.P, { c: '#1d2420', w: 2 }); L.seg(P.O, P.Q, { c: '#1d2420', w: 2 });
      [P.T1, P.T2].forEach(function (T, i) { L.recta(T, G.add(T, dir), { c: i ? C.morado : C.teal, w: 2, dash: '' }); });
      L.seg(P.O, A1, { c: C.ambar, w: 5, op: 0.8 }); L.seg(A1, A2, { c: C.verde, w: 5, op: 0.8 });
      L.seg(P.O, B1, { c: C.ambar, w: 5, op: 0.45 }); L.seg(B1, B2, { c: C.verde, w: 5, op: 0.45 });
      [A1, A2, B1, B2].forEach(function (z) { L.punto(z); });
      L.texto(A1, 'A₁', { dy: -14, dx: -10 }); L.texto(A2, 'A₂', { dy: -14, dx: -10 });
      L.texto(B1, 'B₁', { dy: 14, dx: -10 }); L.texto(B2, 'B₂', { dy: 14, dx: -10 });
      L.texto(P.O, 'O', { dx: -14 });
      var r1 = G.dist(P.O, A1) / G.dist(A1, A2), r2 = G.dist(P.O, B1) / G.dist(B1, B2);
      return '<span>OA₁ / A₁A₂ = <b>' + G.fmt(r1, 3) + '</b></span><span>OB₁ / B₁B₂ = <b>' + G.fmt(r2, 3) + '</b></span>';
    },
    colorPunto: { T1: C.teal, T2: C.morado }
  };

  /* --- Ángulo inscrito y ángulo central --- */
  A['angulo-inscrito'] = {
    vista: [-4.2, 4.2, -3.3, 3.3],
    puntos: { O: [0, 0], A: [-2.1, -2.03], B: [2.6, -1.4], P: [-0.8, 2.8] },
    ocultos: ['O'],
    init: function (P) { var r = 2.92, t = { A: 224, B: 332, P: 104 }; Object.keys(t).forEach(function (k) { var a = t[k] * Math.PI / 180; P[k] = [r * Math.cos(a), r * Math.sin(a)]; }); },
    ajusta: sobreCirculo([0, 0], 2.92),
    dibuja: function (L, P, G) {
      var O = [0, 0];
      L.circ(O, 2.92, { c: '#1d2420', w: 2, f: C.verde, fo: 0.04 });
      L.seg(P.P, P.A, { c: C.verde, w: 2.4 }); L.seg(P.P, P.B, { c: C.verde, w: 2.4 });
      L.seg(O, P.A, { c: C.ambar, w: 2.4 }); L.seg(O, P.B, { c: C.ambar, w: 2.4 });
      L.angulo(P.A, P.P, P.B, { c: C.verde, r: 30, txt: 'θ' });
      // ángulo central que subtiende el arco AB que no contiene a P
      var aA = G.ang(P.A), aB = G.ang(P.B), aP = G.ang(P.P);
      function entre(x, a, b) { var d1 = ((x - a) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), d2 = ((b - a) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); return d1 < d2; }
      var ini = entre(aP, aA, aB) ? aB : aA, fin = entre(aP, aA, aB) ? aA : aB;
      var barr = ((fin - ini) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      var r = 22, o = L.X(O), p1 = [o[0] + r * Math.cos(-ini), o[1] + r * Math.sin(-ini)], p2 = [o[0] + r * Math.cos(-fin), o[1] + r * Math.sin(-fin)];
      L.put('<path d="M' + o + 'L' + p1 + 'A' + r + ',' + r + ' 0 ' + (barr > Math.PI ? 1 : 0) + ' 0 ' + p2 + 'Z" fill="' + C.ambar + '" fill-opacity="0.25" stroke="' + C.ambar + '" stroke-width="1.5"/>');
      // arco resaltado
      var R = 2.92 * L.s, q1 = [o[0] + R * Math.cos(-ini), o[1] + R * Math.sin(-ini)], q2 = [o[0] + R * Math.cos(-fin), o[1] + R * Math.sin(-fin)];
      L.put('<path d="M' + q1 + 'A' + R + ',' + R + ' 0 ' + (barr > Math.PI ? 1 : 0) + ' 0 ' + q2 + '" fill="none" stroke="' + C.ambar + '" stroke-width="5" opacity="0.6"/>');
      L.punto(O); L.texto(O, 'O', { dy: 16, dx: 10 });
      ['A', 'B', 'P'].forEach(function (k) { L.etiqueta(P[k], k, O, { k: 20 }); });
      var th = G.angEn(P.A, P.P, P.B), cen = barr * 180 / Math.PI;
      return '<span>inscrito <b style="color:' + C.verde + '">∠APB</b> = ' + G.fmt(th) + '°</span><span>central (arco AB) = <b style="color:' + C.ambar + '">' + G.fmt(cen) + '°</b></span><span>central ÷ 2 = <b>' + G.fmt(cen / 2) + '°</b></span>';
    }
  };

  /* --- Pendiente y ecuación de la recta --- */
  A['recta'] = {
    vista: [-6, 6, -4, 4], rejilla: 0.5,
    puntos: { P: [-3, -1], Q: [2, 2] },
    valido: function (P) { return G.dist(P.P, P.Q) > 0.4; },
    dibuja: function (L, P, G) {
      L.ejes({ num: true });
      L.recta(P.P, P.Q, { c: C.verde, w: 2.6 });
      var R = [P.Q[0], P.P[1]];
      if (Math.abs(P.Q[0] - P.P[0]) > 1e-9 && Math.abs(P.Q[1] - P.P[1]) > 1e-9) {
        L.seg(P.P, R, { c: C.ambar, w: 2, dash: '5 4' }); L.seg(R, P.Q, { c: C.morado, w: 2, dash: '5 4' });
        L.texto(G.mid(P.P, R), 'Δx = ' + G.fmt(P.Q[0] - P.P[0]), { dy: P.Q[1] > P.P[1] ? 14 : -14, c: C.ambar, it: false, size: 13 });
        L.texto(G.mid(R, P.Q), 'Δy = ' + G.fmt(P.Q[1] - P.P[1]), { dx: (P.Q[0] > P.P[0] ? 1 : -1) * 38, c: C.morado, it: false, size: 13 });
      }
      L.texto(P.P, 'P', { dx: -12, dy: -12 }); L.texto(P.Q, 'Q', { dx: -12, dy: -12 });
      var dx = P.Q[0] - P.P[0], dy = P.Q[1] - P.P[1], ec;
      if (Math.abs(dx) < 1e-9) ec = 'x = ' + G.fmt(P.P[0]);
      else {
        var m = dy / dx, b = P.P[1] - m * P.P[0];
        ec = 'y = ' + G.fmt(m, 2) + 'x ' + (b < 0 ? '− ' : '+ ') + G.fmt(Math.abs(b), 2);
      }
      var A0 = dy, B0 = -dx, C0 = -(A0 * P.P[0] + B0 * P.P[1]);
      return '<span>P = (' + G.fmt(P.P[0]) + ', ' + G.fmt(P.P[1]) + ')</span><span>Q = (' + G.fmt(P.Q[0]) + ', ' + G.fmt(P.Q[1]) + ')</span>' +
        '<span>pendiente m = ' + (Math.abs(dx) < 1e-9 ? 'undefined' : G.fmt(dy / dx, 2)) + '</span><span><b>' + ec + '</b></span>' +
        '<span>forma general: ' + G.fmt(A0) + 'x ' + (B0 < 0 ? '− ' : '+ ') + G.fmt(Math.abs(B0)) + 'y ' + (C0 < 0 ? '− ' : '+ ') + G.fmt(Math.abs(C0), 2) + ' = 0</span>';
    }
  };

  /* --- Suma de vectores --- */
  A['suma-vectores'] = {
    vista: [-2, 8, -1.5, 5.5], rejilla: 0.5,
    puntos: { U: [4, 1], V: [1.5, 3] },
    colorPunto: { U: C.verde, V: C.azul },
    dibuja: function (L, P, G) {
      L.ejes({ num: true });
      var O = [0, 0], S = G.add(P.U, P.V);
      L.poli([O, P.U, S, P.V], { f: C.ambar, fo: 0.08 });
      L.flecha(P.U, S, { c: C.azul, w: 1.6, dash: '6 4' }); L.flecha(P.V, S, { c: C.verde, w: 1.6, dash: '6 4' });
      L.flecha(O, S, { c: C.ambar, w: 3.2 });
      L.flecha(O, P.U, { c: C.verde, w: 3 }); L.flecha(O, P.V, { c: C.azul, w: 3 });
      L.texto(G.mul(P.U, 0.55), 'u', { dy: 14, c: C.verde, bold: true, size: 18 });
      L.texto(G.mul(P.V, 0.55), 'v', { dx: -14, c: C.azul, bold: true, size: 18 });
      L.texto(G.mul(S, 0.6), 'u + v', { dx: 22, dy: -8, c: C.ambar, bold: true, size: 17 });
      return '<span><b style="color:' + C.verde + '">u</b> = (' + G.fmt(P.U[0]) + ', ' + G.fmt(P.U[1]) + ')</span><span><b style="color:' + C.azul + '">v</b> = (' + G.fmt(P.V[0]) + ', ' + G.fmt(P.V[1]) + ')</span><span><b style="color:' + C.ambar + '">u + v</b> = (' + G.fmt(S[0]) + ', ' + G.fmt(S[1]) + ')</span>';
    }
  };

  /* --- Producto interno y proyección --- */
  A['producto-interno'] = {
    vista: [-5, 6, -3, 4.5], rejilla: 0.25,
    puntos: { U: [4, 1], V: [1.5, 3] },
    colorPunto: { U: C.verde, V: C.azul },
    valido: function (P) { return G.norm(P.U) > 0.3 && G.norm(P.V) > 0.3; },
    dibuja: function (L, P, G) {
      L.ejes();
      var O = [0, 0], u = P.U, v = P.V, d = G.dot(u, v), pr = G.mul(u, d / G.dot(u, u));
      L.recta(O, u, { c: '#bcd9c7', w: 1.2 });
      L.seg(v, pr, { c: C.morado, w: 1.6, dash: '5 4' });
      if (G.norm(pr) > 0.05 && G.dist(v, pr) > 0.05) L.recto(v, pr, O);
      L.flecha(O, u, { c: C.verde, w: 3 }); L.flecha(O, v, { c: C.azul, w: 3 });
      L.flecha(O, pr, { c: C.ambar, w: 5 });
      L.angulo(u, O, v, { c: C.gris, r: 30, txt: 'θ', fo: 0.12 });
      L.texto(G.mul(u, 1.08), 'u', { c: C.verde, bold: true, size: 18, dy: 12 });
      L.texto(G.mul(v, 1.08), 'v', { c: C.azul, bold: true, size: 18, dx: -10 });
      var th = Math.acos(Math.max(-1, Math.min(1, d / (G.norm(u) * G.norm(v))))) * 180 / Math.PI;
      var tipo = Math.abs(d) < 1e-9 ? 'right' : (d > 0 ? 'acute' : 'obtuse');
      return '<span>u · v = ' + G.fmt(u[0], 2) + '·' + G.fmt(v[0], 2) + ' + ' + G.fmt(u[1], 2) + '·' + G.fmt(v[1], 2) + ' = <b>' + G.fmt(d, 2) + '</b></span><span>θ = ' + G.fmt(th) + '° (' + tipo + ')</span>' +
        '<span><b style="color:' + C.ambar + '">proyᵤ v</b> = (' + G.fmt(pr[0], 2) + ', ' + G.fmt(pr[1], 2) + ')</span>';
    }
  };

  /* --- Mediatrices y circuncentro --- */
  A['circuncentro'] = {
    vista: [-1, 9, -1.5, 5.5],
    puntos: { A: [0.8, 0.4], B: [7.2, 0.8], C: [3.0, 4.4] },
    valido: function (P) { return noDegenerado(P.A, P.B, P.C); },
    dibuja: function (L, P, G) {
      var a = P.A, b = P.B, c = P.C;
      var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
      var ux = ((a[0] * a[0] + a[1] * a[1]) * (b[1] - c[1]) + (b[0] * b[0] + b[1] * b[1]) * (c[1] - a[1]) + (c[0] * c[0] + c[1] * c[1]) * (a[1] - b[1])) / d;
      var uy = ((a[0] * a[0] + a[1] * a[1]) * (c[0] - b[0]) + (b[0] * b[0] + b[1] * b[1]) * (a[0] - c[0]) + (c[0] * c[0] + c[1] * c[1]) * (b[0] - a[0])) / d;
      var O = [ux, uy], R = G.dist(O, a);
      L.circ(O, R, { c: C.teal, w: 1.6, f: C.teal, fo: 0.05 });
      [[a, b], [b, c], [c, a]].forEach(function (s) { var m = G.mid(s[0], s[1]), dd = G.sub(s[1], s[0]); L.recta(m, G.add(m, [-dd[1], dd[0]]), { c: C.ambar, w: 1.4, dash: '6 4' }); L.recto(s[1], m, O, { r: 9 }); });
      L.poli([a, b, c], { f: C.verde, fo: 0.08, c: '#1d2420', w: 2.2 });
      L.punto(O, { c: C.teal, r: 5 }); L.texto(O, 'O', { dx: 14, dy: -10, c: C.teal });
      var G0 = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, G0, { k: 22 }); });
      var angs = [G.angEn(b, a, c), G.angEn(a, b, c), G.angEn(a, c, b)], mx = Math.max.apply(null, angs);
      var donde = Math.abs(mx - 90) < 0.5 ? 'on the hypotenuse' : (mx > 90 ? 'outside the triangle' : 'inside the triangle');
      return '<span>OA = ' + G.fmt(G.dist(O, a), 2) + '</span><span>OB = ' + G.fmt(G.dist(O, b), 2) + '</span><span>OC = ' + G.fmt(G.dist(O, c), 2) + '</span><span>the circumcenter is <b>' + donde + '</b></span>';
    }
  };

  /* ---------- arranque ---------- */
  function inicia() {
    document.querySelectorAll('.applet[data-applet]').forEach(function (el) {
      var def = A[el.getAttribute('data-applet')];
      if (def && !el._ok) { el._ok = 1; Applet(el, def); }
    });
  }
  window.GBgeo = { applets: A, G: G };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

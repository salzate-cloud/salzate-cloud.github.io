/* Geometría Básica — más figuras interactivas en el plano */
(function () {
  'use strict';
  var A = window.GBgeo.applets, G = window.GBgeo.G, C = G.C;
  function nd(P, Q, R) { return Math.abs(G.cross(G.sub(Q, P), G.sub(R, P))) > 0.4 && G.dist(P, Q) > 0.5 && G.dist(Q, R) > 0.5 && G.dist(P, R) > 0.5; }
  function bar(ps) { var x = 0, y = 0; ps.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / ps.length, y / ps.length]; }
  function areaT(P, Q, R) { return Math.abs(G.cross(G.sub(Q, P), G.sub(R, P))) / 2; }
  function sobre(O, r) { return function (k, p) { var d = G.sub(p, O), n = G.norm(d) || 1; return G.add(O, G.mul(d, r / n)); }; }
  function enCirculo(r, angs) { return function (P) { Object.keys(angs).forEach(function (k) { var a = angs[k] * Math.PI / 180; P[k] = [r * Math.cos(a), r * Math.sin(a)]; }); }; }
  function pie(P, A1, B1) { var d = G.sub(B1, A1), t = G.dot(G.sub(P, A1), d) / G.dot(d, d); return G.add(A1, G.mul(d, t)); }
  function refl(P, A1, B1) { var F = pie(P, A1, B1); return G.sub(G.mul(F, 2), P); }
  function rot(P, O, t) { var d = G.sub(P, O), c = Math.cos(t), s = Math.sin(t); return G.add(O, [d[0] * c - d[1] * s, d[0] * s + d[1] * c]); }
  var deg = Math.PI / 180;

  /* --- ángulos opuestos por el vértice --- */
  A['opuestos-vertice'] = {
    vista: [-5, 5, -3, 3], H: 340,
    puntos: { P: [3.4, 1.4], Q: [-2.6, 2.4] },
    valido: function (P) { return G.norm(P.P) > 0.6 && G.norm(P.Q) > 0.6 && Math.abs(G.cross(P.P, P.Q)) > 0.3; },
    dibuja: function (L, P) {
      var O = [0, 0], P2 = G.mul(P.P, -1), Q2 = G.mul(P.Q, -1);
      L.recta(O, P.P, { c: '#1d2420', w: 2.2 }); L.recta(O, P.Q, { c: '#1d2420', w: 2.2 });
      L.angulo(P.P, O, P.Q, { c: C.verde, r: 34, txt: 'α' }); L.angulo(P2, O, Q2, { c: C.verde, r: 34, txt: 'α′' });
      L.angulo(P.Q, O, P2, { c: C.ambar, r: 26, txt: 'β' }); L.angulo(Q2, O, P.P, { c: C.ambar, r: 26, txt: 'β′' });
      L.punto(O); L.texto(O, 'O', { dx: 10, dy: 16 });
      var a = G.angEn(P.P, O, P.Q), b = 180 - a;
      return '<span><b style="color:' + C.verde + '">α</b> = <b style="color:' + C.verde + '">α′</b> = ' + G.fmt(a) + '°</span><span><b style="color:' + C.ambar + '">β</b> = <b style="color:' + C.ambar + '">β′</b> = ' + G.fmt(b) + '°</span><span>α + β = 180° (par lineal)</span>';
    }
  };

  /* --- misma base, vértice sobre una paralela --- */
  A['misma-base'] = {
    vista: [-1, 10, -0.8, 4.6], H: 340,
    puntos: { A: [1, 0.3], B: [5, 0.3], C: [2.4, 3.4] },
    ajusta: function (k, p, P) { if (k === 'C') return [p[0], P.C[1]]; if (k === 'A') return [Math.min(p[0], P.B[0] - 0.8), P.A[1]]; if (k === 'B') return [Math.max(p[0], P.A[0] + 0.8), P.B[1]]; return p; },
    dibuja: function (L, P) {
      L.recta(P.C, G.add(P.C, [1, 0]), { c: C.gris, w: 1.3, dash: '6 5' });
      L.recta(P.A, P.B, { c: '#c9d6ce', w: 1.2 });
      var H = [P.C[0], P.A[1]];
      L.poli([P.A, P.B, P.C], { f: C.ambar, fo: 0.22, c: '#1d2420', w: 2.2 });
      L.seg(P.C, H, { c: C.rojo, w: 1.6, dash: '5 4' }); L.recto(P.C, H, P.B);
      L.seg(P.A, P.B, { c: C.teal, w: 4 });
      L.etiqueta(P.A, 'A', bar([P.A, P.B, P.C])); L.etiqueta(P.B, 'B', bar([P.A, P.B, P.C])); L.etiqueta(P.C, 'C', bar([P.A, P.B, P.C]));
      L.texto(G.mid(P.C, H), 'h', { dx: 12, c: C.rojo });
      var b = G.dist(P.A, P.B), h = P.C[1] - P.A[1];
      return '<span>base AB = ' + G.fmt(b, 2) + '</span><span>altura h = ' + G.fmt(h, 2) + '</span><span>área = ½·b·h = <b>' + G.fmt(areaT(P.A, P.B, P.C), 2) + '</b></span><span class="instr">Deslice C sobre la paralela: el área no cambia.</span>';
    }
  };

  /* --- paralelogramo y rectángulo --- */
  A['paralelogramo-area'] = {
    vista: [-1, 11, -0.8, 4.4], H: 330,
    puntos: { D: [2.6, 3.2] },
    deslizadores: [{ nombre: 'b', etiqueta: 'Base', min: 2, max: 6, paso: 0.1, valor: 4.5 }],
    ajusta: function (k, p) { return [p[0], Math.max(0.8, Math.min(4, p[1]))]; },
    dibuja: function (L, P) {
      var b = P._b || 4.5, A0 = [0.5, 0.3], B0 = [0.5 + b, 0.3], D = P.D, Cc = G.add(D, [b, 0]);
      var H1 = [D[0], A0[1]];
      L.poli([[A0[0], A0[1]], [A0[0], D[1]], [D[0], D[1]], H1], { f: C.teal, fo: 0.0 });
      L.poli([A0, B0, Cc, D], { f: C.verde, fo: 0.15, c: '#1d2420', w: 2.2 });
      // rectángulo equivalente
      var R0 = [A0[0], A0[1]];
      L.poli([R0, [R0[0] + b, R0[1]], [R0[0] + b, D[1]], [R0[0], D[1]]], { c: C.ambar, w: 2, dash: '7 5' });
      L.seg(D, H1, { c: C.rojo, w: 1.6, dash: '5 4' }); L.recto(D, H1, B0);
      L.texto(G.mid(A0, B0), 'b', { dy: 14, c: C.teal }); L.texto(G.mid(D, H1), 'h', { dx: 12, c: C.rojo });
      var h = D[1] - A0[1];
      return '<span>b = ' + G.fmt(b, 2) + '</span><span>h = ' + G.fmt(h, 2) + '</span><span>área = b·h = <b>' + G.fmt(b * h, 2) + '</b></span><span class="nota">El rectángulo punteado tiene la misma base y altura: el triángulo que sobra de un lado falta del otro.</span>';
    }
  };

  /* --- los seis triángulos de las medianas --- */
  A['seis-triangulos'] = {
    vista: [-1, 9, -0.7, 5.2], H: 360,
    puntos: { A: [0.4, 0.3], B: [7.6, 0.8], C: [3.0, 4.6] },
    valido: function (P) { return nd(P.A, P.B, P.C); },
    dibuja: function (L, P) {
      var a = P.A, b = P.B, c = P.C, Gc = bar([a, b, c]), Ma = G.mid(b, c), Mb = G.mid(a, c), Mc = G.mid(a, b);
      var cols = ['#2e8b57', '#4f9bb0', '#9b7ccc', '#e0a640', '#d0705a', '#7fb069'];
      var tri = [[a, Mc, Gc], [Mc, b, Gc], [b, Ma, Gc], [Ma, c, Gc], [c, Mb, Gc], [Mb, a, Gc]];
      tri.forEach(function (t, i) { L.poli(t, { f: cols[i], fo: 0.45, c: '#fff', w: 1.5 }); });
      L.poli([a, b, c], { c: '#1d2420', w: 2.2 });
      [[a, Ma], [b, Mb], [c, Mc]].forEach(function (s) { L.seg(s[0], s[1], { c: '#1d2420', w: 1.4 }); });
      L.punto(Gc, { c: '#1d2420', r: 5 }); L.texto(Gc, 'G', { dx: 12, dy: -12 });
      ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, Gc, { k: 20 }); });
      var ar = tri.map(function (t) { return areaT(t[0], t[1], t[2]); });
      return ar.map(function (x, i) { return '<span style="color:' + cols[i] + '"><b>■</b> ' + G.fmt(x, 2) + '</span>'; }).join('') + '<span>Las seis áreas son iguales.</span>';
    }
  };

  /* --- semejanza por homotecia --- */
  A['homotecia'] = {
    vista: [-1, 11, -1, 6], H: 360,
    puntos: { O: [0.5, 0.6], A: [2.4, 1.0], B: [3.8, 1.6], C: [2.6, 2.8] },
    deslizadores: [{ nombre: 'k', etiqueta: 'Razón k', min: -1.5, max: 2.5, paso: 0.05, valor: 2, formato: function (v) { return G.fmt(v, 2); } }],
    colorPunto: { O: C.rojo },
    dibuja: function (L, P) {
      var k = P._k === undefined ? 2 : P._k, O = P.O;
      function h(X) { return G.add(O, G.mul(G.sub(X, O), k)); }
      var A2 = h(P.A), B2 = h(P.B), C2 = h(P.C);
      [P.A, P.B, P.C].forEach(function (X, i) { L.seg(O, [A2, B2, C2][i], { c: '#b9c7bf', w: 1.1, dash: '4 4' }); L.seg(O, X, { c: '#b9c7bf', w: 1.1, dash: '4 4' }); });
      L.poli([A2, B2, C2], { f: C.ambar, fo: 0.2, c: C.ambar, w: 2.2 });
      L.poli([P.A, P.B, P.C], { f: C.verde, fo: 0.2, c: C.verde, w: 2.2 });
      L.texto(O, 'O', { dx: -12, dy: 12, c: C.rojo });
      L.texto(A2, 'A′', { dy: 16, c: C.ambar }); L.texto(B2, 'B′', { dx: 14, c: C.ambar }); L.texto(C2, 'C′', { dy: -14, c: C.ambar });
      var r = G.dist(A2, B2) / G.dist(P.A, P.B), ra = areaT(A2, B2, C2) / areaT(P.A, P.B, P.C);
      return '<span>A′B′ / AB = <b>' + G.fmt(r, 2) + '</b></span><span>área′ / área = <b>' + G.fmt(ra, 2) + '</b> = ' + G.fmt(r, 2) + '²</span><span>los ángulos no cambian</span>' + (k < 0 ? '<span class="nota">Con k negativo la figura queda «al otro lado» de O.</span>' : '');
    }
  };

  /* --- segmentos tangentes --- */
  A['tangentes'] = {
    vista: [-4, 6.5, -3.2, 3.2], H: 360,
    puntos: { P: [4.8, 0.8] },
    valido: function (P) { return G.norm(P.P) > 2.25; },
    dibuja: function (L, P) {
      var O = [0, 0], r = 2, d = G.norm(P.P), t = Math.sqrt(d * d - r * r);
      var a = Math.atan2(P.P[1], P.P[0]), b = Math.acos(r / d);
      var T1 = [r * Math.cos(a + b), r * Math.sin(a + b)], T2 = [r * Math.cos(a - b), r * Math.sin(a - b)];
      L.circ(O, r, { c: '#1d2420', w: 2, f: C.teal, fo: 0.06 });
      L.poli([O, T1, P.P, T2], { f: C.ambar, fo: 0.1 });
      L.seg(O, P.P, { c: C.gris, w: 1.2, dash: '5 4' });
      L.seg(P.P, T1, { c: C.verde, w: 3 }); L.seg(P.P, T2, { c: C.verde, w: 3 });
      L.recta(P.P, T1, { c: C.verde, w: 1, op: 0.35 }); L.recta(P.P, T2, { c: C.verde, w: 1, op: 0.35 });
      L.seg(O, T1, { c: C.morado, w: 2 }); L.seg(O, T2, { c: C.morado, w: 2 });
      L.recto(O, T1, P.P); L.recto(O, T2, P.P);
      L.punto(O); L.punto(T1); L.punto(T2);
      L.texto(O, 'O', { dx: -12, dy: 12 }); L.etiqueta(T1, 'T₁', O, { k: 16 }); L.etiqueta(T2, 'T₂', O, { k: 16 }); L.texto(P.P, 'P', { dx: 14, dy: -10 });
      return '<span>PT₁ = <b>' + G.fmt(t, 3) + '</b></span><span>PT₂ = <b>' + G.fmt(t, 3) + '</b></span><span>radio ⟂ tangente en el punto de tangencia</span>';
    }
  };

  /* --- cuadrilátero cíclico y Ptolomeo --- */
  A['ciclico'] = {
    vista: [-3.6, 3.6, -3.1, 3.1], H: 380,
    puntos: { A: [0, 0], B: [0, 0], C: [0, 0], D: [0, 0] },
    init: enCirculo(2.7, { A: 200, B: 290, C: 15, D: 120 }),
    ajusta: sobre([0, 0], 2.7),
    dibuja: function (L, P) {
      var O = [0, 0], ks = ['A', 'B', 'C', 'D'];
      // ordenar por ángulo para mantener convexo
      var ord = ks.slice().sort(function (x, y) { return G.ang(P[x]) - G.ang(P[y]); });
      var Q = ord.map(function (k) { return P[k]; });
      L.circ(O, 2.7, { c: '#1d2420', w: 2, f: C.teal, fo: 0.05 });
      L.poli(Q, { f: C.verde, fo: 0.12, c: '#1d2420', w: 2.2 });
      L.seg(Q[0], Q[2], { c: C.ambar, w: 1.8, dash: '6 4' }); L.seg(Q[1], Q[3], { c: C.ambar, w: 1.8, dash: '6 4' });
      var cols = [C.verde, C.morado, C.verde, C.morado], ang = [];
      for (var i = 0; i < 4; i++) {
        var a = Q[(i + 3) % 4], v = Q[i], b = Q[(i + 1) % 4];
        L.angulo(a, v, b, { c: cols[i], r: 22 });
        ang.push(G.angEn(a, v, b));
      }
      ord.forEach(function (k) { L.etiqueta(P[k], k, O, { k: 18 }); });
      var lado = function (i, j) { return G.dist(Q[i], Q[j]); };
      var izq = lado(0, 2) * lado(1, 3), der = lado(0, 1) * lado(2, 3) + lado(1, 2) * lado(3, 0);
      return '<span><b style="color:' + C.verde + '">' + ord[0] + ' + ' + ord[2] + '</b> = ' + G.fmt(ang[0] + ang[2]) + '°</span><span><b style="color:' + C.morado + '">' + ord[1] + ' + ' + ord[3] + '</b> = ' + G.fmt(ang[1] + ang[3]) + '°</span>' +
        '<span>Ptolomeo: producto de diagonales = <b>' + G.fmt(izq, 2) + '</b>, suma de productos de lados opuestos = <b>' + G.fmt(der, 2) + '</b></span>';
    }
  };

  /* --- polígonos inscritos y el número π --- */
  A['pi-poligonos'] = {
    vista: [-3.3, 3.3, -3, 3], H: 360,
    puntos: {}, deslizadores: [{ nombre: 'n', etiqueta: 'Lados del polígono', min: 3, max: 96, paso: 1, valor: 6 }],
    dibuja: function (L, P) {
      var n = P._n || 6, r = 2.7, O = [0, 0], ins = [], cir = [], R = r / Math.cos(Math.PI / n);
      for (var i = 0; i < n; i++) { var a = 2 * Math.PI * i / n + Math.PI / 2; ins.push([r * Math.cos(a), r * Math.sin(a)]); var b = a + Math.PI / n; cir.push([R * Math.cos(b), R * Math.sin(b)]); }
      L.poli(cir, { f: C.ambar, fo: 0.12, c: C.ambar, w: 1.6 });
      L.circ(O, r, { c: '#1d2420', w: 2.2, f: '#fff', fo: 0.6 });
      L.poli(ins, { f: C.teal, fo: 0.22, c: C.teal, w: 1.8 });
      L.punto(O);
      var pin = n * Math.sin(Math.PI / n), pcir = n * Math.tan(Math.PI / n);
      return '<span style="color:' + C.teal + '">inscrito: semiperímetro / r = <b>' + pin.toFixed(5).replace('.', ',') + '</b></span><span style="color:' + C.ambar + '">circunscrito: <b>' + pcir.toFixed(5).replace('.', ',') + '</b></span><span>π = 3,14159…</span><span class="nota">Arquímedes llegó a 96 lados: 3 10⁄71 &lt; π &lt; 3 1⁄7.</span>';
    }
  };

  /* --- distancia de un punto a una recta --- */
  A['distancia-recta'] = {
    vista: [-6, 6, -4, 4], rejilla: 0.5,
    puntos: { A: [-4, -2], B: [4, 1], P: [-1, 2.5] },
    colorPunto: { P: C.rojo },
    valido: function (P) { return G.dist(P.A, P.B) > 0.5; },
    dibuja: function (L, P) {
      L.ejes({ num: true });
      L.recta(P.A, P.B, { c: C.verde, w: 2.6 });
      var F = pie(P.P, P.A, P.B);
      L.seg(P.P, F, { c: C.rojo, w: 2.4, dash: '6 4' });
      if (G.dist(P.P, F) > 0.1) L.recto(P.P, F, P.B);
      L.punto(F, { c: C.rojo });
      L.texto(P.P, 'P', { dx: 12, dy: -12, c: C.rojo }); L.texto(F, 'H', { dx: 12, dy: 12, c: C.rojo });
      var a = P.B[1] - P.A[1], b = P.A[0] - P.B[0], c = -(a * P.A[0] + b * P.A[1]);
      var d = Math.abs(a * P.P[0] + b * P.P[1] + c) / Math.hypot(a, b);
      function t(x) { return (x < 0 ? '− ' : '+ ') + G.fmt(Math.abs(x), 2); }
      return '<span>recta: ' + G.fmt(a, 2) + 'x ' + t(b) + 'y ' + t(c) + ' = 0</span><span>P = (' + G.fmt(P.P[0]) + ', ' + G.fmt(P.P[1]) + ')</span><span>d = |ax₀ + by₀ + c| / √(a² + b²) = <b>' + G.fmt(d, 3) + '</b></span>';
    }
  };

  /* --- coordenadas en una base --- */
  A['base-plano'] = {
    vista: [-5, 7, -3, 5], rejilla: 0.25,
    puntos: { U: [2, 0.5], V: [0.5, 1.5], W: [3.5, 3] },
    colorPunto: { U: C.verde, V: C.azul, W: C.ambar },
    valido: function (P) { return Math.abs(G.cross(P.U, P.V)) > 0.2; },
    dibuja: function (L, P) {
      var u = P.U, v = P.V, w = P.W, det = G.cross(u, v);
      var s = G.cross(w, v) / det, t = G.cross(u, w) / det, O = [0, 0];
      for (var i = -8; i <= 8; i++) {
        L.seg(G.add(G.mul(u, i), G.mul(v, -10)), G.add(G.mul(u, i), G.mul(v, 10)), { c: '#d5e6dc', w: 1 });
        L.seg(G.add(G.mul(v, i), G.mul(u, -10)), G.add(G.mul(v, i), G.mul(u, 10)), { c: '#d9e1f0', w: 1 });
      }
      var su = G.mul(u, s);
      L.flecha(O, su, { c: C.verde, w: 2, dash: '6 4' }); L.flecha(su, w, { c: C.azul, w: 2, dash: '6 4' });
      L.flecha(O, w, { c: C.ambar, w: 3.4 });
      L.flecha(O, u, { c: C.verde, w: 3.2 }); L.flecha(O, v, { c: C.azul, w: 3.2 });
      L.texto(G.mul(u, 0.5), 'u', { dy: 14, c: C.verde, bold: true, size: 18 }); L.texto(G.mul(v, 0.5), 'v', { dx: -12, c: C.azul, bold: true, size: 18 });
      L.texto(w, 'w', { dx: 12, dy: -12, c: C.ambar, bold: true, size: 18 });
      return '<span><b style="color:' + C.ambar + '">w</b> = <b>' + G.fmt(s, 2) + '</b>·<b style="color:' + C.verde + '">u</b> + <b>' + G.fmt(t, 2) + '</b>·<b style="color:' + C.azul + '">v</b></span><span>coordenadas de w en la base {u, v}: (' + G.fmt(s, 2) + ', ' + G.fmt(t, 2) + ')</span><span class="instr">Mueva u, v y w. Si u y v se vuelven colineales, dejan de ser base.</span>';
    }
  };

  /* --- rotación de un punto --- */
  A['rotacion'] = {
    vista: [-5, 5, -3.6, 3.6], rejilla: 0.25,
    puntos: { P: [3, 1] },
    deslizadores: [{ nombre: 't', etiqueta: 'Ángulo θ', min: -180, max: 180, paso: 1, valor: 60, formato: function (v) { return v + '°'; } }],
    dibuja: function (L, P) {
      L.ejes({ num: true });
      var t = (P._t === undefined ? 60 : P._t) * deg, O = [0, 0], Q = rot(P.P, O, t), r = G.norm(P.P);
      L.circ(O, r, { c: '#b9c7bf', w: 1.2, dash: '4 4' });
      L.seg(O, P.P, { c: C.verde, w: 2.2 }); L.seg(O, Q, { c: C.ambar, w: 2.2 });
      if (Math.abs(t) > 0.01) L.angulo(t > 0 ? P.P : Q, O, t > 0 ? Q : P.P, { c: C.morado, r: 30, txt: 'θ' });
      L.punto(Q, { c: C.ambar, r: 5.5 });
      L.texto(P.P, 'P', { dx: 12, dy: -12, c: C.verde }); L.texto(Q, 'P′', { dx: 12, dy: -12, c: C.ambar });
      var c = Math.cos(t), s = Math.sin(t);
      return '<span>P = (' + G.fmt(P.P[0], 2) + ', ' + G.fmt(P.P[1], 2) + ')</span><span>P′ = (x cos θ − y sen θ, x sen θ + y cos θ) = <b>(' + G.fmt(Q[0], 2) + ', ' + G.fmt(Q[1], 2) + ')</b></span><span>OP = OP′ = ' + G.fmt(r, 2) + '</span>';
    }
  };

  /* --- composición de dos reflexiones --- */
  A['dos-reflexiones'] = {
    vista: [-5, 5, -3.6, 3.6],
    puntos: { M: [3.5, 0.6], N: [2.2, 2.8], A: [2.2, -1.6], B: [3.4, -1.2], C: [2.6, -0.5] },
    colorPunto: { M: C.teal, N: C.morado },
    valido: function (P) { return G.norm(P.M) > 0.5 && G.norm(P.N) > 0.5; },
    dibuja: function (L, P) {
      var O = [0, 0];
      L.recta(O, P.M, { c: C.teal, w: 2 }); L.recta(O, P.N, { c: C.morado, w: 2 });
      var T = [P.A, P.B, P.C], T1 = T.map(function (X) { return refl(X, O, P.M); }), T2 = T1.map(function (X) { return refl(X, O, P.N); });
      L.poli(T, { f: C.verde, fo: 0.35, c: C.verde, w: 2 });
      L.poli(T1, { f: C.teal, fo: 0.18, c: C.teal, w: 1.5, dash: '5 4' });
      L.poli(T2, { f: C.ambar, fo: 0.35, c: C.ambar, w: 2 });
      var a = G.angEn(P.M, O, P.N), giro = G.angEn(P.A, O, T2[0]);
      L.angulo(P.M, O, P.N, { c: C.morado, r: 28, txt: 'α' });
      L.texto(P.M, 'r', { dx: 10, dy: 12, c: C.teal }); L.texto(P.N, 's', { dx: 10, dy: -10, c: C.morado });
      L.punto(O); L.texto(O, 'O', { dx: -12, dy: 12 });
      return '<span>ángulo entre r y s: α = ' + G.fmt(a) + '°</span><span>giro del triángulo verde al ámbar: <b>' + G.fmt(giro) + '°</b> = 2α</span><span class="nota">Reflejar en r y luego en s es una rotación de centro O y ángulo 2α.</span>';
    }
  };

  /* --- cónicas --- */
  A['elipse'] = {
    vista: [-5.2, 5.2, -3.4, 3.4], H: 360,
    puntos: {},
    deslizadores: [{ nombre: 'c', etiqueta: 'Distancia focal c', min: 0, max: 4.4, paso: 0.05, valor: 3, formato: function (v) { return G.fmt(v, 2); } },
      { nombre: 't', etiqueta: 'Punto P', min: 0, max: 360, paso: 1, valor: 60, formato: function (v) { return v + '°'; } }],
    dibuja: function (L, P) {
      var a = 4.6, c = P._c === undefined ? 3 : P._c, b = Math.sqrt(a * a - c * c), t = (P._t === undefined ? 60 : P._t) * deg;
      var pts = []; for (var i = 0; i < 120; i++) { var s = 2 * Math.PI * i / 120; pts.push([a * Math.cos(s), b * Math.sin(s)]); }
      L.ejes();
      L.poli(pts, { f: C.teal, fo: 0.07, c: C.teal, w: 2.4 });
      var F1 = [-c, 0], F2 = [c, 0], Q = [a * Math.cos(t), b * Math.sin(t)];
      L.seg(F1, Q, { c: C.verde, w: 2.6 }); L.seg(F2, Q, { c: C.ambar, w: 2.6 });
      L.punto(F1, { c: C.rojo }); L.punto(F2, { c: C.rojo }); L.punto(Q, { r: 5.5 });
      L.texto(F1, 'F₁', { dy: 16, c: C.rojo }); L.texto(F2, 'F₂', { dy: 16, c: C.rojo }); L.texto(Q, 'P', { dx: 12, dy: -12 });
      var d1 = G.dist(F1, Q), d2 = G.dist(F2, Q);
      return '<span><b style="color:' + C.verde + '">PF₁</b> + <b style="color:' + C.ambar + '">PF₂</b> = ' + G.fmt(d1, 2) + ' + ' + G.fmt(d2, 2) + ' = <b>' + G.fmt(d1 + d2, 2) + '</b> = 2a</span><span>excentricidad e = c/a = ' + G.fmt(c / a, 2) + '</span>' + (c < 0.05 ? '<span class="nota">Con c = 0 la elipse es una circunferencia.</span>' : '');
    }
  };
  A['parabola'] = {
    vista: [-5.5, 5.5, -2.2, 4.6], H: 340,
    puntos: {},
    deslizadores: [{ nombre: 'p', etiqueta: 'Parámetro p', min: 0.3, max: 2.5, paso: 0.05, valor: 1, formato: function (v) { return G.fmt(v, 2); } },
      { nombre: 'x', etiqueta: 'Punto P (x)', min: -4.5, max: 4.5, paso: 0.05, valor: 2.4, formato: function (v) { return G.fmt(v, 2); } }],
    dibuja: function (L, P) {
      var p = P._p || 1, x = P._x === undefined ? 2.4 : P._x;
      L.ejes();
      var pts = []; for (var i = -60; i <= 60; i++) { var X = i * 0.1; pts.push([X, X * X / (4 * p)]); }
      for (i = 0; i < pts.length - 1; i++) if (pts[i + 1][1] < 4.8) L.seg(pts[i], pts[i + 1], { c: C.teal, w: 2.4 });
      var F = [0, p], Q = [x, x * x / (4 * p)], D = [x, -p];
      L.recta([-1, -p], [1, -p], { c: C.morado, w: 2, dash: '7 5' });
      L.seg(F, Q, { c: C.verde, w: 2.6 }); L.seg(Q, D, { c: C.ambar, w: 2.6 });
      L.punto(F, { c: C.rojo }); L.punto(Q, { r: 5.5 }); L.punto(D, { c: C.ambar });
      L.texto(F, 'F', { dx: -12, c: C.rojo }); L.texto(Q, 'P', { dx: 12, dy: -12 }); L.texto([4.6, -p], 'directriz', { dy: -12, c: C.morado, it: false, size: 13, anchor: 'end' });
      return '<span><b style="color:' + C.verde + '">PF</b> = ' + G.fmt(G.dist(F, Q), 2) + '</span><span><b style="color:' + C.ambar + '">d(P, directriz)</b> = ' + G.fmt(Q[1] + p, 2) + '</span><span>ecuación: x² = 4py = ' + G.fmt(4 * p, 2) + 'y</span>';
    }
  };
  A['hiperbola'] = {
    vista: [-6, 6, -3.6, 3.6], H: 360,
    puntos: {},
    deslizadores: [{ nombre: 't', etiqueta: 'Punto P', min: -1.6, max: 1.6, paso: 0.01, valor: 0.8, formato: function (v) { return G.fmt(v, 2); } }],
    dibuja: function (L, P) {
      var a = 2, b = 1.5, c = Math.sqrt(a * a + b * b), t = P._t === undefined ? 0.8 : P._t;
      L.ejes();
      L.recta([0, 0], [a, b], { c: '#c9b9e0', w: 1.2, dash: '5 5' }); L.recta([0, 0], [a, -b], { c: '#c9b9e0', w: 1.2, dash: '5 5' });
      [1, -1].forEach(function (sg) {
        var prev = null; for (var i = -40; i <= 40; i++) { var s = i * 0.05, q = [sg * a * Math.cosh(s), b * Math.sinh(s)]; if (prev) L.seg(prev, q, { c: C.teal, w: 2.4 }); prev = q; }
      });
      var F1 = [-c, 0], F2 = [c, 0], Q = [a * Math.cosh(t), b * Math.sinh(t)];
      L.seg(F1, Q, { c: C.verde, w: 2.4 }); L.seg(F2, Q, { c: C.ambar, w: 2.4 });
      L.punto(F1, { c: C.rojo }); L.punto(F2, { c: C.rojo }); L.punto(Q, { r: 5.5 });
      L.texto(F1, 'F₁', { dy: 16, c: C.rojo }); L.texto(F2, 'F₂', { dy: 16, c: C.rojo }); L.texto(Q, 'P', { dx: 12, dy: -12 });
      var d1 = G.dist(F1, Q), d2 = G.dist(F2, Q);
      return '<span>|PF₁ − PF₂| = |' + G.fmt(d1, 2) + ' − ' + G.fmt(d2, 2) + '| = <b>' + G.fmt(Math.abs(d1 - d2), 2) + '</b> = 2a</span><span>asíntotas: y = ±(b/a)x</span>';
    }
  };
})();

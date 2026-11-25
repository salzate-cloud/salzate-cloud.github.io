/* Figuras interactivas adicionales para las presentaciones de clase.
   Se registran en los motores del libro (geo.js y geo3d.js) antes de que arranquen,
   y agregan unos widgets propios para la lógica y los conjuntos. */
(function () {
  'use strict';
  var A = window.GBgeo && window.GBgeo.applets, A3 = window.GBgeo3d;
  var C = { verde: '#006633', verdeO: '#00482a', teal: '#006e78', ambar: '#c47800', morado: '#664896', azul: '#1955a0', rojo: '#b22222', gris: '#7a7a7a' };
  function f1(x, d) { var s = (+x).toFixed(d === undefined ? 1 : d); if (/^-0[.,]?0*$/.test(s)) s = s.slice(1); return s.replace('.', ','); }

  if (A) {
    /* --- la regla: coordenadas, distancia y punto medio --- */
    A['recta-real'] = {
      vista: [-1, 11, -2.2, 2.2],
      puntos: { A: [2, 0], B: [8, 0] },
      ajusta: function (k, p) { return [Math.round(p[0] * 4) / 4, 0]; },
      dibuja: function (L, P, G) {
        L.flecha([-0.8, 0], [10.8, 0], { c: '#5d6a63', w: 2 });
        for (var x = 0; x <= 10; x++) { L.seg([x, -0.12], [x, 0.12], { c: '#5d6a63', w: 1.5 }); L.texto([x, -0.55], x, { it: false, size: 15, c: '#5d6a63' }); }
        var a = P.A[0], b = P.B[0], m = (a + b) / 2;
        L.seg([a, 0], [b, 0], { c: C.verde, w: 7, op: 0.45 });
        L.punto([m, 0], { c: C.morado, r: 6 }); L.texto([m, 0.65], 'M', { c: C.morado, bold: true });
        L.texto([a, 0.65], 'A', { bold: true }); L.texto([b, 0.65], 'B', { bold: true });
        L.texto([(a + b) / 2, 1.45], 'AB = |' + f1(b, 2) + ' − ' + f1(a, 2) + '| = ' + f1(Math.abs(b - a), 2), { c: C.verdeO, size: 20, it: false });
        return '<span>coordenada de A = <b>' + f1(a, 2) + '</b></span><span>coordenada de B = <b>' + f1(b, 2) + '</b></span><span>punto medio: (a + b)/2 = <b style="color:' + C.morado + '">' + f1(m, 2) + '</b></span>';
      }
    };
    /* --- par lineal y opuestos por el vértice --- */
    A['par-lineal'] = {
      vista: [-4, 4, -2.6, 3],
      puntos: { P: [1.2, 2.2] },
      ajusta: function (k, p) { var a = Math.atan2(p[1], p[0]); a = Math.max(0.12, Math.min(Math.PI - 0.12, a)); return [2.6 * Math.cos(a), 2.6 * Math.sin(a)]; },
      dibuja: function (L, P, G) {
        var O = [0, 0], D = [3.5, 0], I = [-3.5, 0];
        L.seg(I, D, { c: '#1d2420', w: 2.6 }); L.seg(O, P.P, { c: C.azul, w: 2.6 });
        L.angulo(D, O, P.P, { c: C.verde, r: 46, txt: 'α' }); L.angulo(P.P, O, I, { c: C.ambar, r: 36, txt: 'β' });
        L.punto(O); L.texto(O, 'O', { dy: 18 });
        var a = G.angEn(D, O, P.P);
        return '<span><b style="color:' + C.verde + '">α</b> = ' + f1(a) + '°</span><span><b style="color:' + C.ambar + '">β</b> = ' + f1(180 - a) + '°</span><span>α + β = <b>180°</b> (par lineal)</span>';
      }
    };
    /* --- desigualdad triangular con tres longitudes --- */
    A['desigualdad'] = {
      vista: [-1, 11, -1.2, 6],
      puntos: {},
      deslizadores: [{ nombre: 'a', etiqueta: 'a', min: 1, max: 9, paso: 0.5, valor: 6 }, { nombre: 'b', etiqueta: 'b', min: 1, max: 9, paso: 0.5, valor: 4 }, { nombre: 'c', etiqueta: 'c', min: 1, max: 9, paso: 0.5, valor: 3 }],
      dibuja: function (L, P, G) {
        var a = P._a, b = P._b, c = P._c, B = [1, 0], Cc = [1 + a, 0];
        L.seg(B, Cc, { c: C.verde, w: 4 }); L.texto([1 + a / 2, -0.55], 'a = ' + f1(a), { c: C.verde, it: false });
        var ok = b + c > a && a + b > c && a + c > b;
        if (ok) {
          var x = (c * c - b * b + a * a) / (2 * a), y = Math.sqrt(Math.max(0, c * c - x * x)), Aa = [1 + x, y];
          L.poli([B, Cc, Aa], { f: C.verde, fo: 0.08 }); L.seg(B, Aa, { c: C.ambar, w: 4 }); L.seg(Cc, Aa, { c: C.azul, w: 4 });
          L.texto(G.mid(B, Aa), 'c', { c: C.ambar, dx: -14, bold: true }); L.texto(G.mid(Cc, Aa), 'b', { c: C.azul, dx: 14, bold: true });
        } else {
          L.circ(B, c, { c: C.ambar, w: 1.4, dash: '5 5' }); L.circ(Cc, b, { c: C.azul, w: 1.4, dash: '5 5' });
          L.seg(B, [1 + c, 0.06], { c: C.ambar, w: 4 }); L.seg(Cc, [1 + a - b, 0.12], { c: C.azul, w: 4 });
        }
        return ok ? '<span>Sí se forma un triángulo: cada lado es <b>menor</b> que la suma de los otros dos.</span>'
          : '<span style="color:' + C.rojo + '"><b>No se cierra:</b> ' + (b + c <= a ? 'b + c = ' + f1(b + c) + ' ≤ a = ' + f1(a) : a + b <= c ? 'a + b ≤ c' : 'a + c ≤ b') + '. Los arcos no se cortan.</span>';
      }
    };
    /* --- paralelas cortadas por una transversal --- */
    A['transversal'] = {
      vista: [-5, 5, -2.8, 2.8],
      puntos: { P: [-0.6, 1.2], Q: [0.8, -1.2] },
      ajusta: function (k, p) { return [Math.max(-3.5, Math.min(3.5, p[0])), k === 'P' ? 1.2 : -1.2]; },
      dibuja: function (L, P, G) {
        L.seg([-5, 1.2], [5, 1.2], { c: '#1d2420', w: 2.4 }); L.seg([-5, -1.2], [5, -1.2], { c: '#1d2420', w: 2.4 });
        L.texto([4.6, 1.55], 'ℓ', { size: 20 }); L.texto([4.6, -0.85], 'm', { size: 20 });
        L.recta(P.P, P.Q, { c: C.azul, w: 2.4 });
        var d = G.sub(P.P, P.Q), t = G.ang(d) * 180 / Math.PI; if (t < 0) t += 180;
        var Pa = G.add(P.P, [1, 0]), Pb = G.add(P.P, G.mul(d, 0.4)), Qa = G.add(P.Q, [1, 0]), Qb = G.add(P.Q, G.mul(d, 0.4));
        L.angulo(Pa, P.P, G.add(P.P, G.mul(d, -0.4)), { c: C.verde, r: 28, txt: f1(180 - t) + '°', size: 14 });
        L.angulo(G.add(P.Q, [-1, 0]), P.Q, Qb, { c: C.verde, r: 28, txt: f1(180 - t) + '°', size: 14 });
        L.angulo(Qa, P.Q, Qb, { c: C.ambar, r: 22, txt: f1(t) + '°', size: 14 });
        return '<span>ángulos <b style="color:' + C.verde + '">alternos internos</b>: iguales (' + f1(180 - t) + '°)</span><span>conjugados internos: ' + f1(180 - t) + '° + ' + f1(t) + '° = <b>180°</b></span>';
      }
    };
    /* --- suma de ángulos de un polígono por triangulación --- */
    A['poligono-suma'] = {
      vista: [-3.4, 3.4, -2.6, 2.6], puntos: {},
      deslizadores: [{ nombre: 'n', etiqueta: 'lados n', min: 3, max: 12, paso: 1, valor: 6 }],
      dibuja: function (L, P, G) {
        var n = P._n, V = [], cols = ['#cde6d6', '#f6dfb4', '#d6e6f5', '#e6dcf2'];
        for (var k = 0; k < n; k++) { var a = Math.PI / 2 + 2 * Math.PI * k / n; V.push([2.3 * Math.cos(a) * (1 + 0.1 * Math.sin(3 * k)), 2.3 * Math.sin(a)]); }
        for (k = 1; k < n - 1; k++) L.poli([V[0], V[k], V[k + 1]], { f: cols[k % 4], fo: 0.9, c: '#fff', w: 1.5 });
        L.poli(V, { c: '#1d2420', w: 2.6 });
        for (k = 2; k < n - 1; k++) L.seg(V[0], V[k], { c: C.ambar, w: 2, dash: '6 4' });
        L.punto(V[0], { c: C.ambar, r: 6 });
        return '<span>n = ' + n + ' lados</span><span>desde un vértice salen ' + (n - 3) + ' diagonales y se forman <b>' + (n - 2) + ' triángulos</b></span><span>suma = (' + n + ' − 2)·180° = <b>' + (n - 2) * 180 + '°</b></span>';
      }
    };
    /* --- paralelogramo: las diagonales se bisecan --- */
    A['paralelogramo'] = {
      vista: [-4.5, 4.5, -2.7, 2.7],
      puntos: { A: [-3, -1.6], B: [1.6, -1.6], D: [-1.8, 1.7] },
      dibuja: function (L, P, G) {
        var Cc = G.sub(G.add(P.B, P.D), P.A), M = G.mid(P.A, Cc);
        L.poli([P.A, P.B, Cc, P.D], { f: C.verde, fo: 0.08, c: '#1d2420', w: 2.6 });
        L.seg(P.A, Cc, { c: C.azul, w: 2.2 }); L.seg(P.B, P.D, { c: C.ambar, w: 2.2 });
        L.punto(M, { c: C.morado, r: 6 }); L.texto(M, 'M', { c: C.morado, dx: 16, dy: -10, bold: true });
        L.punto(Cc, { r: 6, c: '#1d2420' });
        var cen = M; [['A', P.A], ['B', P.B], ['C', Cc], ['D', P.D]].forEach(function (x) { L.etiqueta(x[1], x[0], cen, { k: 20 }); });
        return '<span>AM = ' + f1(G.dist(P.A, M), 2) + ' = MC = ' + f1(G.dist(M, Cc), 2) + '</span><span>BM = ' + f1(G.dist(P.B, M), 2) + ' = MD = ' + f1(G.dist(M, P.D), 2) + '</span><span>AB = ' + f1(G.dist(P.A, P.B), 2) + ' = DC, AD = ' + f1(G.dist(P.A, P.D), 2) + ' = BC</span>';
      }
    };
    /* --- baricentro --- */
    A['baricentro'] = {
      vista: [-4.3, 4.3, -2.6, 2.9],
      puntos: { A: [-0.6, 2.4], B: [-3.3, -1.9], C: [3.2, -1.5] },
      dibuja: function (L, P, G) {
        var a = P.A, b = P.B, c = P.C, Ma = G.mid(b, c), Mb = G.mid(a, c), Mc = G.mid(a, b), Gc = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
        L.poli([a, b, c], { f: C.verde, fo: 0.07, c: '#1d2420', w: 2.6 });
        [[a, Ma, C.azul], [b, Mb, C.ambar], [c, Mc, C.morado]].forEach(function (x) { L.seg(x[0], x[1], { c: x[2], w: 2.2 }); L.punto(x[1], { c: x[2], r: 4.5 }); });
        L.punto(Gc, { c: C.rojo, r: 7 }); L.texto(Gc, 'G', { c: C.rojo, dx: 15, dy: -12, bold: true });
        ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, Gc, { k: 20 }); });
        return '<span>AG = ' + f1(G.dist(a, Gc), 2) + ', GM = ' + f1(G.dist(Gc, Ma), 2) + ' → razón <b>2 : 1</b></span><span>BG : GN = ' + f1(G.dist(b, Gc) / G.dist(Gc, Mb), 2) + '</span><span>CG : GP = ' + f1(G.dist(c, Gc) / G.dist(Gc, Mc), 2) + '</span>';
      }
    };
    /* --- incentro e incírculo --- */
    A['incentro'] = {
      vista: [-4.3, 4.3, -2.6, 2.9],
      puntos: { A: [-0.4, 2.4], B: [-3.3, -1.9], C: [3.3, -1.7] },
      dibuja: function (L, P, G) {
        var a = P.A, b = P.B, c = P.C, la = G.dist(b, c), lb = G.dist(a, c), lc = G.dist(a, b), s = la + lb + lc;
        var I = [(la * a[0] + lb * b[0] + lc * c[0]) / s, (la * a[1] + lb * b[1] + lc * c[1]) / s];
        var area = Math.abs(G.cross(G.sub(b, a), G.sub(c, a))) / 2, r = 2 * area / s;
        L.poli([a, b, c], { f: C.verde, fo: 0.06, c: '#1d2420', w: 2.6 });
        [a, b, c].forEach(function (v, k) { L.seg(v, G.add(v, G.mul(G.sub(I, v), 1.6)), { c: [C.azul, C.ambar, C.morado][k], w: 1.8, dash: '6 4' }); });
        L.circ(I, r, { c: C.verde, w: 2.6, f: C.verde, fo: 0.08 });
        L.punto(I, { c: C.rojo, r: 6 }); L.texto(I, 'I', { c: C.rojo, dx: 14, dy: -12, bold: true });
        ['A', 'B', 'C'].forEach(function (k) { L.etiqueta(P[k], k, I, { k: 20 }); });
        return '<span>radio inscrito r = ' + f1(r, 2) + '</span><span>distancia de I a cada lado = <b>' + f1(r, 2) + '</b></span><span>las tres bisectrices se cortan en I</span>';
      }
    };
    /* --- área del círculo: sectores reacomodados --- */
    A['area-circulo'] = {
      vista: [-5.2, 7.2, -2.3, 2.6], puntos: {},
      deslizadores: [{ nombre: 'n', etiqueta: 'sectores', min: 4, max: 40, paso: 2, valor: 8 }],
      dibuja: function (L, P, G) {
        var n = P._n, r = 1.6, cx = -3.3, a = 2 * Math.PI / n;
        for (var k = 0; k < n; k++) { var t0 = k * a, t1 = (k + 1) * a, col = k % 2 ? '#f2c88a' : '#9fd0b2';
          var arc = []; for (var j = 0; j <= 6; j++) { var t = t0 + (t1 - t0) * j / 6; arc.push([cx + r * Math.cos(t), 0.3 + r * Math.sin(t)]); }
          L.poli([[cx, 0.3]].concat(arc), { f: col, fo: 1, c: '#fff', w: 0.8 }); }
        var w = 2 * r * Math.sin(a / 2), x0 = -0.6, h = r * Math.cos(a / 2);
        for (k = 0; k < n; k++) {
          var up = k % 2 === 0, x = x0 + k * w / 2, pts = [];
          if (up) { pts.push([x + w / 2, -0.9]); for (j = 0; j <= 6; j++) { var tt = Math.PI / 2 + a / 2 - a * j / 6; pts.push([x + w / 2 + r * Math.cos(tt), -0.9 + r * Math.sin(tt) - (r - h)]); } }
          else { pts.push([x + w / 2, -0.9 + h]); for (j = 0; j <= 6; j++) { tt = -Math.PI / 2 - a / 2 + a * j / 6; pts.push([x + w / 2 + r * Math.cos(tt), -0.9 + h + r * Math.sin(tt) + (r - h)]); } }
          L.poli(pts, { f: k % 2 ? '#f2c88a' : '#9fd0b2', fo: 1, c: '#fff', w: 0.8 });
        }
        var base = n * w / 2;
        L.texto([x0 + base / 2, -1.6], 'base ≈ πr', { it: false, c: C.verdeO, size: 17 }); L.texto([x0 - 0.45, -0.9 + h / 2], 'r', { c: C.verdeO });
        return '<span>' + n + ' sectores</span><span>la figura se parece cada vez más a un rectángulo de base πr y altura r</span><span>área = πr · r = <b>πr²</b></span>';
      }
    };
    /* --- pendiente y recta perpendicular --- */
    A['pendiente'] = {
      vista: [-5.5, 5.5, -3.2, 3.2], rejilla: 0.5,
      puntos: { A: [-3, -1], B: [2, 2] },
      dibuja: function (L, P, G) {
        L.ejes({ num: true });
        var d = G.sub(P.B, P.A); L.recta(P.A, P.B, { c: C.verde, w: 2.6 });
        L.seg(P.A, [P.B[0], P.A[1]], { c: C.ambar, w: 2.4, dash: '6 4' }); L.seg([P.B[0], P.A[1]], P.B, { c: C.azul, w: 2.4, dash: '6 4' });
        L.texto([(P.A[0] + P.B[0]) / 2, P.A[1] - 0.35], 'Δx = ' + f1(d[0]), { c: C.ambar, it: false, size: 15 });
        L.texto([P.B[0] + 0.7, (P.A[1] + P.B[1]) / 2], 'Δy = ' + f1(d[1]), { c: C.azul, it: false, size: 15 });
        var m = Math.abs(d[0]) < 1e-9 ? null : d[1] / d[0];
        if (m !== null && Math.abs(m) > 1e-9) L.recta(P.B, G.add(P.B, [1, -1 / m]), { c: C.morado, w: 2, dash: '8 5' });
        L.etiqueta(P.A, 'A', P.B); L.etiqueta(P.B, 'B', P.A);
        return '<span>pendiente m = Δy/Δx = <b>' + (m === null ? 'no definida (vertical)' : f1(m, 2)) + '</b></span>' + (m ? '<span style="color:' + C.morado + '">perpendicular: m′ = −1/m = ' + f1(-1 / m, 2) + '</span><span>m·m′ = −1</span>' : '');
      }
    };
  }

  if (A3) {
    /* --- dos planos que se cortan --- */
    A3['planos-corte'] = {
      escala: 78, H: 400, el: 0.32, az: 0.7,
      controles: [{ nombre: 'ang', etiqueta: 'Ángulo entre los planos', min: 10, max: 170, paso: 1, valor: 60, formato: function (v) { return v + '°'; } }],
      dibuja: function (E, e, G) {
        var t = e.ang * Math.PI / 180, L = 2.2, h = 1.7, w = [Math.cos(t), 0, Math.sin(t)];
        E.cara([[-L, -h, 0], [L, -h, 0], [L, h, 0], [-L, h, 0]], { c: '#9fd0b2', op: 0.55, borde: '#3c7a55' });
        E.cara([G.m3(w, -L).map(function (x, k) { return x + [0, -h, 0][k]; }), G.a3(G.m3(w, L), [0, -h, 0]), G.a3(G.m3(w, L), [0, h, 0]), G.a3(G.m3(w, -L), [0, h, 0])], { c: '#f2c88a', op: 0.55, borde: '#a8742a' });
        E.linea([0, -h * 1.25, 0], [0, h * 1.25, 0], { c: G.C.rojo, w: 4, z: 1000 });
        E.texto([0, h * 1.35, 0], 'ℓ = α ∩ β', { c: G.C.rojo, size: 17, bold: true });
        E.texto([L * 1.05, -h, 0], 'α', { c: '#3c7a55', size: 20 }); E.texto(G.a3(G.m3(w, L * 1.05), [0, -h, 0]), 'β', { c: '#a8742a', size: 20 });
        return '<span>Gire la escena arrastrando. Cambie el ángulo:</span><span>la intersección de dos planos distintos que se cortan es <b style="color:' + G.C.rojo + '">una recta</b>.</span>';
      }
    };
    /* --- recta y plano: secante, paralela, contenida --- */
    A3['recta-plano'] = {
      escala: 80, H: 400, el: 0.3, az: 0.8,
      controles: [{ nombre: 'inc', etiqueta: 'Inclinación de la recta', min: 0, max: 80, paso: 1, valor: 35, formato: function (v) { return v + '°'; } },
        { nombre: 'alt', etiqueta: 'Altura', min: -1.2, max: 1.2, paso: 0.05, valor: 0.6, dec: 2 }],
      dibuja: function (E, e, G) {
        var L = 2.3, t = e.inc * Math.PI / 180, d = [Math.cos(t), 0.3 * Math.cos(t), Math.sin(t)], P0 = [0, 0, e.alt];
        E.cara([[-L, -L * 0.8, 0], [L, -L * 0.8, 0], [L, L * 0.8, 0], [-L, L * 0.8, 0]], { c: '#9fd0b2', op: 0.6, borde: '#3c7a55', z: 0 });
        var A = G.a3(P0, G.m3(d, -2.6)), B = G.a3(P0, G.m3(d, 2.6)), tipo;
        if (e.inc === 0) { tipo = Math.abs(e.alt) < 0.03 ? 'contenida' : 'paralela'; E.linea(A, B, { c: G.C.azul, w: 3.5, z: e.alt >= 0 ? 1000 : -1000, dash: e.alt < -0.03 ? '7 5' : null }); }
        else {
          var s = -e.alt / d[2], I = G.a3(P0, G.m3(d, s)); tipo = 'secante';
          var arriba = d[2] > 0 ? [I, B] : [A, I], abajo = d[2] > 0 ? [A, I] : [I, B];
          E.linea(arriba[0], arriba[1], { c: G.C.azul, w: 3.5, z: 1000 }); E.linea(abajo[0], abajo[1], { c: G.C.azul, w: 2.5, dash: '7 5', z: -1000 });
          E.punto(I, { c: G.C.rojo, r: 6, z: 2000 });
        }
        return tipo === 'secante' ? '<span>La recta <b>corta</b> al plano en un punto (en rojo); la parte de abajo se ve punteada.</span>' :
          tipo === 'paralela' ? '<span>Inclinación 0° y fuera del plano: la recta es <b>paralela</b> al plano.</span>' : '<span>Inclinación 0° y altura 0: la recta está <b>contenida</b> en el plano.</span>';
      }
    };
    /* --- desarrollo plano del cubo que se pliega --- */
    A3['desarrollo-cubo'] = {
      escala: 70, H: 400, el: 0.55, az: 0.9,
      controles: [{ nombre: 'a', etiqueta: 'Doblar', min: 0, max: 90, paso: 1, valor: 0, formato: function (v) { return v + '°'; } }],
      dibuja: function (E, e, G) {
        var t = e.a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), k = 1.3;
        function q(ps) { return ps.map(function (p) { return [k * (p[0] - 0.5), k * (p[1] - 0.5), k * p[2]]; }); }
        var base = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], fr = [[0, 0, 0], [1, 0, 0], [1, -c, s], [0, -c, s]], bk = [[0, 1, 0], [1, 1, 0], [1, 1 + c, s], [0, 1 + c, s]];
        var lf = [[0, 0, 0], [0, 1, 0], [-c, 1, s], [-c, 0, s]], rt = [[1, 0, 0], [1, 1, 0], [1 + c, 1, s], [1 + c, 0, s]];
        var E0 = [0, 1 + c, s], E1 = [1, 1 + c, s], v = [0, Math.cos(2 * t), Math.sin(2 * t)];
        var tp = [E0, E1, G.a3(E1, v), G.a3(E0, v)];
        var cols = ['#4f9bb0', '#9fd0b2', '#f2c88a', '#c8b3e6', '#9cc0e8', '#e8b9a6'];
        [base, fr, bk, lf, rt, tp].forEach(function (f, i) { E.cara(q(f), { c: cols[i], op: 0.85, borde: '#1d2420', bw: 1.6 }); });
        return '<span>Seis cuadrados forman el desarrollo del cubo. Doble hasta 90°:</span><span>un poliedro con <b>V = 8, A = 12, C = 6</b>, y V − A + C = 2.</span>';
      }
    };
    /* --- cortes de sólidos por un plano --- */
    A3['corte-solido'] = {
      escala: 66, H: 420, el: 0.3, az: 0.7,
      controles: [{ tipo: 'botones', nombre: 's', opciones: [['cubo', 'Cubo'], ['piramide', 'Pirámide'], ['cilindro', 'Cilindro'], ['cono', 'Cono'], ['esfera', 'Esfera']], inicial: 1 },
        { nombre: 'z', etiqueta: 'Altura del corte', min: -0.95, max: 0.95, paso: 0.01, valor: 0.2, dec: 2 }],
      dibuja: function (E, e, G) {
        var R = 1.5, z = e.z * R, sec = [], n = 48, k, r, area, total;
        if (e.s === 'cubo') {
          E.solido(G.casco(G.SOLIDOS.cubo().map(function (p) { return G.m3(p, R); })), { c: '#4f9bb0', op: 0.35 });
          sec = [[-R, -R, z], [R, -R, z], [R, R, z], [-R, R, z]]; area = 4 * R * R; total = 'cuadrado igual a la base';
        } else if (e.s === 'piramide') {
          var base = [[-R, -R, -R], [R, -R, -R], [R, R, -R], [-R, R, -R]], ap = [0, 0, R];
          E.solido(G.casco(base.concat([ap])), { c: '#e0a640', op: 0.35 });
          var f = (R - z) / (2 * R); sec = base.map(function (p) { return [p[0] * f, p[1] * f, z]; }); area = 4 * R * R * f * f; total = 'cuadrado semejante a la base, razón ' + f1(f, 2) + ' → área × ' + f1(f * f, 2);
        } else {
          var perfil = { cilindro: function () { return R; }, cono: function (zz) { return R * (R - zz) / (2 * R); }, esfera: function (zz) { return Math.sqrt(Math.max(0, R * R - zz * zz)); } }[e.s];
          var anillos = [], m = 14;
          for (k = 0; k <= m; k++) { var zz = -R + 2 * R * k / m; anillos.push([zz, perfil(zz)]); }
          for (k = 0; k < m; k++) for (var j = 0; j < n; j += 2) {
            var a0 = 2 * Math.PI * j / n, a1 = 2 * Math.PI * (j + 2) / n, z0 = anillos[k][0], z1 = anillos[k + 1][0], r0 = anillos[k][1], r1 = anillos[k + 1][1];
            E.cara([[r0 * Math.cos(a0), r0 * Math.sin(a0), z0], [r0 * Math.cos(a1), r0 * Math.sin(a1), z0], [r1 * Math.cos(a1), r1 * Math.sin(a1), z1], [r1 * Math.cos(a0), r1 * Math.sin(a0), z1]], { c: e.s === 'esfera' ? '#9cc0e8' : e.s === 'cono' ? '#c8b3e6' : '#4f9bb0', op: 0.2 });
          }
          r = perfil(z); for (k = 0; k < n; k++) { var a = 2 * Math.PI * k / n; sec.push([r * Math.cos(a), r * Math.sin(a), z]); }
          area = Math.PI * r * r; total = 'círculo de radio ' + f1(r, 2);
        }
        var P = 2.3; E.cara([[-P, -P, z], [P, -P, z], [P, P, z], [-P, P, z]], { c: '#9fd0b2', op: 0.25, plano: true, z: 500 });
        E.cara(sec, { c: '#d24c4c', op: 0.75, borde: '#b22222', bw: 2.5, z: 900 });
        return '<span>sección: <b>' + total + '</b></span><span>área de la sección ≈ ' + f1(area, 2) + '</span><span class="nota">Arrastre para girar; mueva el corte.</span>';
      }
    };
  }

  /* ---------- widgets propios (HTML) ---------- */
  var WID = {};
  WID['tabla-verdad'] = function (el) {
    var con = '→', p = true, q = false;
    var OPS = { '∧': function (a, b) { return a && b; }, '∨': function (a, b) { return a || b; }, '→': function (a, b) { return !a || b; }, '↔': function (a, b) { return a === b; }, '¬q→¬p': function (a, b) { return b || !a; } };
    function vf(x) { return '<span class="' + (x ? 'V' : 'F') + '">' + (x ? 'V' : 'F') + '</span>'; }
    function pinta() {
      el.innerHTML = '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><b style="font-size:18px">Conectivo:</b>' + Object.keys(OPS).map(function (k) { return '<button class="wbtn' + (k === con ? ' on' : '') + '" data-c="' + k + '">p ' + k.replace('¬q→¬p', '').replace(/^/, '') + (k === '¬q→¬p' ? '¬q → ¬p' : ' q') + '</button>'; }).join('').replace(/p ¬q → ¬p/, '¬q → ¬p') + '</div>' +
        '<div style="display:flex;gap:18px;align-items:center"><span class="grande">p =</span><button class="wbtn ' + (p ? 'v' : 'fa') + '" data-v="p">' + (p ? 'V' : 'F') + '</button><span class="grande">q =</span><button class="wbtn ' + (q ? 'v' : 'fa') + '" data-v="q">' + (q ? 'V' : 'F') + '</button>' +
        '<span class="grande" style="margin-left:20px">⇒ resultado: ' + vf(OPS[con](p, q)) + '</span></div>' +
        '<table class="tv"><tr><th>p</th><th>q</th><th>' + (con === '¬q→¬p' ? '¬q → ¬p' : 'p ' + con + ' q') + '</th></tr>' + [[true, true], [true, false], [false, true], [false, false]].map(function (r) {
          return '<tr class="' + (r[0] === p && r[1] === q ? 'on' : '') + '"><td>' + vf(r[0]) + '</td><td>' + vf(r[1]) + '</td><td>' + vf(OPS[con](r[0], r[1])) + '</td></tr>'; }).join('') + '</table>' +
        '<div class="lect">' + (con === '→' ? 'La implicación solo es <b class="F">falsa</b> cuando p es verdadera y q es falsa.' : con === '¬q→¬p' ? 'Compare con p → q: ¡la misma columna! El contrarrecíproco es equivalente.' : con === '∨' ? 'El «o» matemático es incluyente: con p y q verdaderas también es verdadera.' : '') + '</div>';
      el.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); con = b.getAttribute('data-c'); pinta(); }; });
      el.querySelectorAll('[data-v]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); if (b.getAttribute('data-v') === 'p') p = !p; else q = !q; pinta(); }; });
    }
    pinta();
  };
  WID['venn'] = function (el) {
    var op = 'AuB', OPS = { 'AuB': ['A ∪ B', function (a, b) { return a || b; }], 'AnB': ['A ∩ B', function (a, b) { return a && b; }], 'AmB': ['A ∖ B', function (a, b) { return a && !b; }],
      'Ac': ['Aᶜ', function (a) { return !a; }], 'nAuB': ['(A ∪ B)ᶜ', function (a, b) { return !(a || b); }], 'AcnBc': ['Aᶜ ∩ Bᶜ', function (a, b) { return !a && !b; }],
      'nAnB': ['(A ∩ B)ᶜ', function (a, b) { return !(a && b); }], 'AcuBc': ['Aᶜ ∪ Bᶜ', function (a, b) { return !a || !b; }] };
    function pinta() {
      var f = OPS[op][1], reg = [[true, false], [false, true], [true, true], [false, false]];
      var id = 'v' + Math.random().toString(36).slice(2, 7);
      var svg = '<svg viewBox="0 0 520 300" style="width:100%;max-height:330px"><defs><clipPath id="' + id + 'a"><circle cx="200" cy="150" r="105"/></clipPath><clipPath id="' + id + 'b"><circle cx="320" cy="150" r="105"/></clipPath>' +
        '<mask id="' + id + 'nA"><rect width="520" height="300" fill="#fff"/><circle cx="200" cy="150" r="105" fill="#000"/></mask><mask id="' + id + 'nB"><rect width="520" height="300" fill="#fff"/><circle cx="320" cy="150" r="105" fill="#000"/></mask></defs>' +
        '<rect x="10" y="10" width="500" height="280" rx="12" fill="' + (f(false, false) ? '#9fd0b2' : '#fff') + '" stroke="#5d6a63" stroke-width="2"/>' +
        '<circle cx="200" cy="150" r="105" fill="' + (f(true, false) ? '#9fd0b2' : '#fff') + '"/><circle cx="320" cy="150" r="105" fill="' + (f(false, true) ? '#9fd0b2' : '#fff') + '" mask="url(#' + id + 'nA)"/>' +
        '<circle cx="320" cy="150" r="105" fill="' + (f(true, true) ? '#9fd0b2' : '#fff') + '" clip-path="url(#' + id + 'a)"/>' +
        '<circle cx="200" cy="150" r="105" fill="none" stroke="#006633" stroke-width="3"/><circle cx="320" cy="150" r="105" fill="none" stroke="#006e78" stroke-width="3"/>' +
        '<text x="120" y="60" font-size="30" font-style="italic" font-family="Palatino,Georgia,serif">A</text><text x="390" y="60" font-size="30" font-style="italic" font-family="Palatino,Georgia,serif">B</text><text x="30" y="40" font-size="20" fill="#5d6a63" font-family="Palatino,Georgia,serif">U</text></svg>';
      el.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap">' + Object.keys(OPS).map(function (k) { return '<button class="wbtn' + (k === op ? ' on' : '') + '" data-o="' + k + '">' + OPS[k][0] + '</button>'; }).join('') + '</div>' + svg +
        '<div class="lect">' + (op === 'nAuB' || op === 'AcnBc' ? 'De Morgan: <b>(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ</b> — compare las dos regiones.' : op === 'nAnB' || op === 'AcuBc' ? 'De Morgan: <b>(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ</b> — compare las dos regiones.' : 'Región sombreada: <b>' + OPS[op][0] + '</b>') + '</div>';
      el.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); op = b.getAttribute('data-o'); pinta(); }; });
    }
    pinta();
  };
  WID['contraejemplo'] = function (el) {
    function primo(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return d; return true; }
    el.innerHTML = '<div class="grande">¿Es primo n² + n + 41 para todo n natural?</div><input type="range" min="0" max="45" value="1"><div class="tabla"></div><div class="lect"></div>';
    var inp = el.querySelector('input'), tab = el.querySelector('.tabla'), lect = el.querySelector('.lect');
    function pinta() {
      var N = +inp.value, h = '<div style="display:flex;flex-wrap:wrap;gap:6px;font-size:17px">';
      for (var n = 0; n <= N; n++) { var v = n * n + n + 41, pr = primo(v); h += '<span style="padding:4px 8px;border-radius:8px;background:' + (pr === true ? '#e8f3ec' : '#fdecea') + ';border:1px solid ' + (pr === true ? '#9cc7ad' : '#e0a0a0') + '">n=' + n + ': ' + v + (pr === true ? ' ✓' : ' = ' + pr + '·' + (v / pr)) + '</span>'; }
      tab.innerHTML = h + '</div>';
      lect.innerHTML = N < 40 ? 'Llevamos ' + (N + 1) + ' casos y todos son primos… ¿ya está demostrado? <b>No.</b> Siga moviendo.' : '<b class="F">¡Contraejemplo!</b> Con n = 40: 40² + 40 + 41 = 1681 = 41². Un solo caso basta para refutar un «para todo».';
    }
    inp.addEventListener('input', pinta); inp.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); pinta();
  };
  function arranca() { document.querySelectorAll('.widget[data-w]').forEach(function (el) { var f = WID[el.getAttribute('data-w')]; if (f && !el._ok) { el._ok = 1; f(el); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();

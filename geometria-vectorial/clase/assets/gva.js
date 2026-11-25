/* Geometría Vectorial y Analítica — figuras interactivas propias (SVG puro) */
(function () {
  'use strict';
  var K = { c1: '#2a3a8c', c2: '#0f766e', c3: '#b45309', c4: '#9f1239', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233' };
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, h) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h !== undefined) e.innerHTML = h; return e; }
  function f2(x, d) { if (!isFinite(x)) return '—'; d = d === undefined ? 2 : d; var s = (+x.toFixed(d)).toString(); return s.replace('-', '−').replace('.', ','); }
  function svgEn(cu, W, H) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + (W || 640) + ' ' + (H || 380)); cu.appendChild(s); return s; }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 15) + '" fill="' + (o.c || K.tinta) + '" text-anchor="' + (o.a || 'middle') + '" dominant-baseline="middle" font-family="Palatino Linotype,Palatino,Georgia,serif"' + (o.b ? ' font-weight="700"' : '') + (o.it ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3.5">' + s + '</text>'; }
  function Plano(v, W, H) {
    W = W || 640; H = H || 380;
    var P = { X: function (x) { return (x - v[0]) / (v[1] - v[0]) * W; }, Y: function (y) { return H - (y - v[2]) / (v[3] - v[2]) * H; }, buf: [] };
    P.ix = function (px) { return v[0] + px / W * (v[1] - v[0]); }; P.iy = function (py) { return v[2] + (H - py) / H * (v[3] - v[2]); };
    P.put = function (s) { this.buf.push(s); };
    P.ejes = function () {
      for (var x = Math.ceil(v[0]); x <= v[1]; x++) this.put('<line x1="' + this.X(x) + '" y1="0" x2="' + this.X(x) + '" y2="' + H + '" stroke="#eef1f7"/>');
      for (var y = Math.ceil(v[2]); y <= v[3]; y++) this.put('<line x1="0" y1="' + this.Y(y) + '" x2="' + W + '" y2="' + this.Y(y) + '" stroke="#eef1f7"/>');
      this.put('<line x1="0" y1="' + this.Y(0) + '" x2="' + W + '" y2="' + this.Y(0) + '" stroke="#8b93a5" stroke-width="1.3"/><line x1="' + this.X(0) + '" y1="0" x2="' + this.X(0) + '" y2="' + H + '" stroke="#8b93a5" stroke-width="1.3"/>');
      var pas = Math.max(1, Math.round((v[1] - v[0]) / 12));
      for (x = Math.ceil(v[0]); x <= v[1]; x += pas) if (x) this.put(tx(this.X(x), this.Y(0) + 13, x, { s: 10.5, c: '#8b93a5' }));
      for (y = Math.ceil(v[2]); y <= v[3]; y += pas) if (y) this.put(tx(this.X(0) - 10, this.Y(y), y, { s: 10.5, c: '#8b93a5', a: 'end' }));
    };
    P.seg = function (a, b, c, d, o) { o = o || {}; this.put('<line x1="' + this.X(a) + '" y1="' + this.Y(b) + '" x2="' + this.X(c) + '" y2="' + this.Y(d) + '" stroke="' + (o.c || K.tinta) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + ' stroke-linecap="round"/>'); };
    P.flecha = function (a, b, c, d, o) {
      o = o || {}; var x1 = this.X(a), y1 = this.Y(b), x2 = this.X(c), y2 = this.Y(d), dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy); if (n < 3) return;
      var u = [dx / n, dy / n], h = Math.min(14, n * .4), e = [x2 - u[0] * h, y2 - u[1] * h], col = o.c || K.c1;
      this.put('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="' + col + '" stroke-width="' + (o.w || 3) + '" stroke-linecap="round"/><path d="M' + x2 + ',' + y2 + 'L' + (e[0] - u[1] * h * .42) + ',' + (e[1] + u[0] * h * .42) + 'L' + (e[0] + u[1] * h * .42) + ',' + (e[1] - u[0] * h * .42) + 'Z" fill="' + col + '"/>');
    };
    P.poli = function (ps, o) { o = o || {}; var self = this; this.put('<path d="M' + ps.map(function (p) { return self.X(p[0]) + ',' + self.Y(p[1]); }).join('L') + 'Z" fill="' + (o.f || 'none') + '" fill-opacity="' + (o.fo || 1) + '" stroke="' + (o.c || 'none') + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'); };
    P.punto = function (x, y, o) { o = o || {}; this.put('<circle cx="' + this.X(x) + '" cy="' + this.Y(y) + '" r="' + (o.r || 5) + '" fill="' + (o.c || K.tinta) + '" stroke="#fff" stroke-width="1.5"/>'); };
    P.texto = function (x, y, s, o) { o = o || {}; this.put(tx(this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), s, o)); };
    P.recta = function (a, b, c, o) { // a x + b y = c
      if (Math.abs(b) > 1e-9) this.seg(v[0], (c - a * v[0]) / b, v[1], (c - a * v[1]) / b, o); else if (Math.abs(a) > 1e-9) this.seg(c / a, v[2], c / a, v[3], o);
    };
    P.html = function () { var h = this.buf.join(''); this.buf = []; return h; };
    return P;
  }
  function deslizadores(cu, defs, cb) {
    var d = el('div', { class: 'ctl2d' }), st = {};
    defs.forEach(function (x) {
      var l = el('label', null, '<span>' + x[1] + '</span><input type="range" min="' + x[2] + '" max="' + x[3] + '" step="' + (x[5] || 0.5) + '" value="' + x[4] + '"><b></b>');
      var i = l.querySelector('input'), b = l.querySelector('b'); st[x[0]] = +x[4]; b.textContent = f2(+x[4]);
      i.addEventListener('input', function () { st[x[0]] = +i.value; b.textContent = f2(+i.value); cb(st); }); d.appendChild(l);
    });
    cu.appendChild(d); return st;
  }
  var A = {};

  /* --- sistemas 2×2: dos rectas --- */
  A['sistema2x2'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = deslizadores(cu, [['a1', 'a₁', -4, 4, 1], ['b1', 'b₁', -4, 4, 1], ['c1', 'c₁', -6, 6, 3], ['a2', 'a₂', -4, 4, 2], ['b2', 'b₂', -4, 4, -1], ['c2', 'c₂', -6, 6, 0]], pinta);
    function pinta() {
      var P = Plano([-6, 6, -4.5, 4.5]); P.ejes();
      P.recta(st.a1, st.b1, st.c1, { c: K.c1, w: 3 }); P.recta(st.a2, st.b2, st.c2, { c: K.c3, w: 3, dash: (st.a1 * st.b2 - st.a2 * st.b1 === 0) ? '8 6' : '' });
      var D = st.a1 * st.b2 - st.a2 * st.b1, tipo;
      if (Math.abs(D) > 1e-9) { var x = (st.c1 * st.b2 - st.c2 * st.b1) / D, y = (st.a1 * st.c2 - st.a2 * st.c1) / D; P.punto(x, y, { c: K.c4, r: 7 }); tipo = '<b>Solución única</b>: (x, y) = (' + f2(x) + ', ' + f2(y) + '). Las rectas se cortan.'; }
      else {
        var prop = (st.a1 * st.c2 - st.a2 * st.c1 === 0 && st.b1 * st.c2 - st.b2 * st.c1 === 0);
        tipo = prop ? '<b>Infinitas soluciones</b>: es la misma recta dos veces.' : '<b>Sin solución</b>: rectas paralelas, el sistema es inconsistente.';
      }
      s.innerHTML = P.html();
      c.querySelector('.lect').innerHTML = '<span style="color:' + K.c1 + '">' + f2(st.a1) + 'x + ' + f2(st.b1) + 'y = ' + f2(st.c1) + '</span><span style="color:' + K.c3 + '">' + f2(st.a2) + 'x + ' + f2(st.b2) + 'y = ' + f2(st.c2) + '</span><span>det = a₁b₂ − a₂b₁ = ' + f2(D) + '</span><span>' + tipo + '</span>';
    }
    pinta();
  };

  /* --- una matriz 2×2 deforma el plano --- */
  A['matriz-transforma'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = deslizadores(cu, [['a', 'a', -3, 3, 1.5, 0.1], ['b', 'b', -3, 3, 0.5, 0.1], ['c', 'c', -3, 3, 0.3, 0.1], ['d', 'd', -3, 3, 1.2, 0.1]], pinta);
    function pinta() {
      var P = Plano([-6, 6, -4.5, 4.5]), M = function (p) { return [st.a * p[0] + st.b * p[1], st.c * p[0] + st.d * p[1]]; };
      P.ejes();
      for (var k = -6; k <= 6; k++) { var p1 = M([k, -6]), p2 = M([k, 6]), q1 = M([-6, k]), q2 = M([6, k]); P.seg(p1[0], p1[1], p2[0], p2[1], { c: '#c7d2fe', w: 1 }); P.seg(q1[0], q1[1], q2[0], q2[1], { c: '#c7d2fe', w: 1 }); }
      P.poli([[0, 0], [1, 0], [1, 1], [0, 1]], { c: K.gris, dash: '4 4' });
      P.poli([[0, 0], M([1, 0]), M([1, 1]), M([0, 1])], { f: K.c3, fo: .25, c: K.c3, w: 2 });
      var e1 = M([1, 0]), e2 = M([0, 1]); P.flecha(0, 0, e1[0], e1[1], { c: K.c1 }); P.flecha(0, 0, e2[0], e2[1], { c: K.c2 });
      P.texto(e1[0], e1[1], 'Ae₁', { dx: 14, dy: -8, c: K.c1, b: 1 }); P.texto(e2[0], e2[1], 'Ae₂', { dx: 14, dy: -8, c: K.c2, b: 1 });
      s.innerHTML = P.html();
      var det = st.a * st.d - st.b * st.c;
      c.querySelector('.lect').innerHTML = '<span>A = (' + f2(st.a) + ' ' + f2(st.b) + ' ; ' + f2(st.c) + ' ' + f2(st.d) + ')</span><span>Las columnas de A son las imágenes de e₁ y e₂.</span><span>det A = <b>' + f2(det, 3) + '</b>: el cuadrado unidad pasa a tener área ' + f2(Math.abs(det), 3) + (det < 0 ? ' y se voltea (orientación invertida)' : '') + (Math.abs(det) < 1e-9 ? '; <b>A no es invertible</b>: el plano se aplasta en una recta' : '') + '.</span>';
    }
    pinta();
  };

  /* --- Gauss–Jordan paso a paso --- */
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = (function g(a, b) { return b ? g(b, a % b) : Math.abs(a); })(n, d) || 1; return [n / g, d / g]; }
  function fs(q) { return q[1] === 1 ? (q[0] < 0 ? '−' + -q[0] : '' + q[0]) : (q[0] < 0 ? '−' : '') + Math.abs(q[0]) + '/' + q[1]; }
  function mul(a, b) { return fr(a[0] * b[0], a[1] * b[1]); } function sub(a, b) { return fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); } function div(a, b) { return fr(a[0] * b[1], a[1] * b[0]); }
  var SISTEMAS = { 'Solución única': [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]], 'Infinitas soluciones': [[1, 2, -1, 3], [2, 4, -2, 6], [1, -1, 2, 0]], 'Inconsistente': [[1, 1, 1, 2], [2, 2, 2, 5], [1, -1, 0, 1]], 'Con pivote cero': [[0, 2, 1, 4], [1, 1, 1, 3], [2, 1, 3, 7]] };
  A['gauss-jordan'] = function (c) {
    var cu = c.querySelector('.acuerpo'), nombre = Object.keys(SISTEMAS)[0], M, pasos, k;
    var tabla = el('div', { class: 'gj' }); cu.appendChild(tabla);
    var bar = el('div', { class: 'ctl3d' }); cu.appendChild(bar);
    Object.keys(SISTEMAS).forEach(function (n, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, n); b.addEventListener('click', function () { nombre = n; bar.querySelectorAll('.chip[data-s]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); arranca(); }); b.dataset.s = 1; bar.appendChild(b); });
    var ant = el('button', { type: 'button', class: 'chip' }, '◂ Atrás'), sig = el('button', { type: 'button', class: 'chip on' }, 'Siguiente paso ▸');
    bar.appendChild(ant); bar.appendChild(sig);
    function arranca() {
      M = SISTEMAS[nombre].map(function (f) { return f.map(function (x) { return [x, 1]; }); });
      pasos = [{ M: M, op: 'Matriz aumentada del sistema', piv: null }];
      var A0 = M.map(function (f) { return f.slice(); }), fila = 0;
      for (var col = 0; col < 3 && fila < 3; col++) {
        var p = -1; for (var r = fila; r < 3; r++) if (A0[r][col][0] !== 0) { p = r; break; }
        if (p < 0) continue;
        if (p !== fila) { var t = A0[p]; A0[p] = A0[fila]; A0[fila] = t; pasos.push({ M: A0.map(function (f) { return f.slice(); }), op: 'F' + (fila + 1) + ' ↔ F' + (p + 1), piv: [fila, col] }); }
        var pv = A0[fila][col];
        if (!(pv[0] === 1 && pv[1] === 1)) { A0[fila] = A0[fila].map(function (x) { return div(x, pv); }); pasos.push({ M: A0.map(function (f) { return f.slice(); }), op: 'F' + (fila + 1) + ' → (' + fs(fr(pv[1], pv[0])) + ')·F' + (fila + 1), piv: [fila, col] }); }
        for (r = 0; r < 3; r++) if (r !== fila && A0[r][col][0] !== 0) {
          var m = A0[r][col]; A0[r] = A0[r].map(function (x, j) { return sub(x, mul(m, A0[fila][j])); });
          pasos.push({ M: A0.map(function (f) { return f.slice(); }), op: 'F' + (r + 1) + ' → F' + (r + 1) + ' − (' + fs(m) + ')·F' + (fila + 1), piv: [fila, col] });
        }
        fila++;
      }
      k = 0; pinta();
    }
    function pinta() {
      var p = pasos[k], h = '<div class="op">' + (k ? 'Paso ' + k + ': ' : '') + '<b>' + p.op + '</b></div><table class="matriz-gj">';
      p.M.forEach(function (f, i) { h += '<tr>' + f.map(function (x, j) { var pv = p.piv && p.piv[0] === i && p.piv[1] === j; return '<td class="' + (j === 3 ? 'aum ' : '') + (pv ? 'piv' : '') + '">' + fs(x) + '</td>'; }).join('') + '</tr>'; });
      tabla.innerHTML = h + '</table>';
      var fin = k === pasos.length - 1, msg = '';
      if (fin) {
        var F = p.M, incons = F.some(function (f) { return f[0][0] === 0 && f[1][0] === 0 && f[2][0] === 0 && f[3][0] !== 0; });
        var rango = F.filter(function (f) { return f.slice(0, 3).some(function (x) { return x[0] !== 0; }); }).length;
        msg = incons ? '<b>Sistema inconsistente</b>: aparece una fila 0 = ' + fs(F.filter(function (f) { return f[3][0] !== 0 && f[0][0] === 0 && f[1][0] === 0 && f[2][0] === 0; })[0][3]) + '.' : rango === 3 ? '<b>Solución única</b>: x = ' + fs(F[0][3]) + ', y = ' + fs(F[1][3]) + ', z = ' + fs(F[2][3]) + '.' : '<b>Infinitas soluciones</b>: rango ' + rango + ' &lt; 3, hay ' + (3 - rango) + ' variable(s) libre(s).';
      }
      c.querySelector('.lect').innerHTML = '<span>Paso ' + k + ' de ' + (pasos.length - 1) + '</span>' + (fin ? '<span>Forma escalonada reducida. ' + msg + '</span>' : '<span>La casilla resaltada es el pivote con el que se trabaja.</span>');
      ant.disabled = !k;
    }
    sig.addEventListener('click', function () { if (k < pasos.length - 1) { k++; pinta(); } });
    ant.addEventListener('click', function () { if (k) { k--; pinta(); } });
    arranca();
  };

  /* --- el determinante como área con signo --- */
  A['determinante'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu), u = [3, 0.5], v = [1, 2.5], arr = null;
    s.style.touchAction = 'none';
    var P0 = Plano([-5, 6, -3.5, 4.5]);
    function pos(e) { var r = s.getBoundingClientRect(); return [Math.round(P0.ix((e.clientX - r.left) * 640 / r.width) * 4) / 4, Math.round(P0.iy((e.clientY - r.top) * 380 / r.height) * 4) / 4]; }
    s.addEventListener('pointerdown', function (e) { var z = pos(e); arr = Math.hypot(z[0] - u[0], z[1] - u[1]) < Math.hypot(z[0] - v[0], z[1] - v[1]) ? 'u' : 'v'; s.setPointerCapture(e.pointerId); mover(e); });
    s.addEventListener('pointermove', function (e) { if (arr) mover(e); });
    s.addEventListener('pointerup', function () { arr = null; });
    function mover(e) { var z = pos(e); if (arr === 'u') u = z; else v = z; pinta(); }
    function pinta() {
      var P = Plano([-5, 6, -3.5, 4.5]), d = u[0] * v[1] - u[1] * v[0]; P.ejes();
      P.poli([[0, 0], u, [u[0] + v[0], u[1] + v[1]], v], { f: d >= 0 ? K.c2 : K.c4, fo: .22, c: d >= 0 ? K.c2 : K.c4, w: 1.5 });
      P.flecha(0, 0, u[0], u[1], { c: K.c1 }); P.flecha(0, 0, v[0], v[1], { c: K.c3 });
      P.texto(u[0], u[1], 'u', { dx: 12, dy: -10, c: K.c1, b: 1, s: 18 }); P.texto(v[0], v[1], 'v', { dx: 12, dy: -10, c: K.c3, b: 1, s: 18 });
      [u, v].forEach(function (p, i) { P.put('<circle cx="' + P.X(p[0]) + '" cy="' + P.Y(p[1]) + '" r="14" fill="' + (i ? K.c3 : K.c1) + '" fill-opacity=".14"/>'); });
      s.innerHTML = P.html();
      c.querySelector('.lect').innerHTML = '<span>det(u, v) = ' + f2(u[0]) + '·' + f2(v[1]) + ' − ' + f2(u[1]) + '·' + f2(v[0]) + ' = <b>' + f2(d, 3) + '</b></span><span>área del paralelogramo = |det| = ' + f2(Math.abs(d), 3) + '</span><span>' + (Math.abs(d) < 1e-9 ? '<b>u y v son colineales</b>: el determinante es 0.' : d > 0 ? 'v está a la izquierda de u (giro antihorario): signo +' : 'v está a la derecha de u: signo −') + '</span>';
    }
    pinta();
  };

  /* --- la ecuación general de la circunferencia --- */
  A['circunferencia'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = deslizadores(cu, [['D', 'D', -8, 8, -4], ['E', 'E', -8, 8, 2], ['F', 'F', -20, 10, -4]], pinta);
    function pinta() {
      var P = Plano([-6, 8, -5.5, 4.5]), h = -st.D / 2, k = -st.E / 2, r2 = h * h + k * k - st.F; P.ejes();
      if (r2 > 0) { var r = Math.sqrt(r2); P.put('<circle cx="' + P.X(h) + '" cy="' + P.Y(k) + '" r="' + (P.X(h + r) - P.X(h)) + '" fill="' + K.c2 + '" fill-opacity=".08" stroke="' + K.c2 + '" stroke-width="3"/>'); P.seg(h, k, h + r, k, { c: K.c3, dash: '5 4' }); P.texto(h + r / 2, k, 'r', { dy: -12, c: K.c3, it: 1 }); }
      P.punto(h, k, { c: K.c4 }); P.texto(h, k, 'C', { dx: -12, dy: 14, c: K.c4, b: 1 });
      s.innerHTML = P.html();
      c.querySelector('.lect').innerHTML = '<span>x² + y² ' + (st.D < 0 ? '− ' : '+ ') + f2(Math.abs(st.D)) + 'x ' + (st.E < 0 ? '− ' : '+ ') + f2(Math.abs(st.E)) + 'y ' + (st.F < 0 ? '− ' : '+ ') + f2(Math.abs(st.F)) + ' = 0</span><span>Completando cuadrados: (x − ' + f2(h) + ')² + (y − ' + f2(k) + ')² = ' + f2(r2) + '</span><span>' + (r2 > 0 ? 'Centro C = (' + f2(h) + ', ' + f2(k) + '), radio <b>' + f2(Math.sqrt(r2), 3) + '</b>' : r2 === 0 ? '<b>Es un solo punto</b> (circunferencia degenerada).' : '<b>No hay gráfica</b>: la suma de dos cuadrados no puede ser negativa.') + '</span>';
    }
    pinta();
  };

  /* --- equilibrio: un peso colgado de dos cuerdas (teorema de Lami) --- */
  A['fuerzas'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 360);
    var st = deslizadores(cu, [['a', 'ángulo α (°)', 10, 80, 35, 1], ['b', 'ángulo β (°)', 10, 80, 55, 1], ['W', 'peso W (N)', 10, 200, 100, 5]], pinta);
    function pinta() {
      var a = st.a * Math.PI / 180, b = st.b * Math.PI / 180, W = st.W;
      var T1 = W * Math.cos(b) / Math.sin(a + b), T2 = W * Math.cos(a) / Math.sin(a + b);
      var O = [320, 190], L = 230, A1 = [O[0] - L * Math.cos(a), O[1] - L * Math.sin(a)], B1 = [O[0] + L * Math.cos(b), O[1] - L * Math.sin(b)], h = '';
      h += '<rect x="0" y="0" width="640" height="18" fill="#d7dbe6"/>';
      var top1 = [O[0] - (O[1] - 18) / Math.tan(a), 18], top2 = [O[0] + (O[1] - 18) / Math.tan(b), 18];
      h += '<line x1="' + top1[0] + '" y1="18" x2="' + O[0] + '" y2="' + O[1] + '" stroke="#6b5b45" stroke-width="3"/><line x1="' + top2[0] + '" y1="18" x2="' + O[0] + '" y2="' + O[1] + '" stroke="#6b5b45" stroke-width="3"/>';
      h += '<line x1="' + O[0] + '" y1="' + O[1] + '" x2="' + O[0] + '" y2="' + (O[1] + 70) + '" stroke="#6b5b45" stroke-width="3"/><rect x="' + (O[0] - 30) + '" y="' + (O[1] + 70) + '" width="60" height="46" rx="6" fill="#4b5563"/>' + '<text x="' + O[0] + '" y="' + (O[1] + 94) + '" fill="#fff" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif">W</text>';
      var sc = 120 / W;
      function fl(dx, dy, col, lab) { var x2 = O[0] + dx, y2 = O[1] + dy, n = Math.hypot(dx, dy), u = [dx / n, dy / n], e = [x2 - u[0] * 13, y2 - u[1] * 13]; return '<line x1="' + O[0] + '" y1="' + O[1] + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="' + col + '" stroke-width="4"/><path d="M' + x2 + ',' + y2 + 'L' + (e[0] - u[1] * 6) + ',' + (e[1] + u[0] * 6) + 'L' + (e[0] + u[1] * 6) + ',' + (e[1] - u[0] * 6) + 'Z" fill="' + col + '"/>' + tx(x2 + u[0] * 22, y2 + u[1] * 18, lab, { c: col, b: 1 }); }
      h += fl(-T1 * sc * Math.cos(a), -T1 * sc * Math.sin(a), K.c1, 'T₁') + fl(T2 * sc * Math.cos(b), -T2 * sc * Math.sin(b), K.c3, 'T₂') + fl(0, 60, K.c4, '');
      h += tx(O[0] - 70, O[1] - 12, 'α', { c: K.c1, it: 1 }) + tx(O[0] + 70, O[1] - 12, 'β', { c: K.c3, it: 1 });
      h += '<line x1="' + (O[0] - 110) + '" y1="' + O[1] + '" x2="' + (O[0] + 110) + '" y2="' + O[1] + '" stroke="#b9c0cc" stroke-dasharray="4 4"/><circle cx="' + O[0] + '" cy="' + O[1] + '" r="5" fill="#111"/>';
      s.innerHTML = h;
      c.querySelector('.lect').innerHTML = '<span>ΣFx = 0: T₂ cos β = T₁ cos α</span><span>ΣFy = 0: T₁ sen α + T₂ sen β = W</span><span><b style="color:' + K.c1 + '">T₁ = ' + f2(T1, 1) + ' N</b></span><span><b style="color:' + K.c3 + '">T₂ = ' + f2(T2, 1) + ' N</b></span><span class="nota">Si las cuerdas se acercan a la horizontal, las tensiones se disparan: con ángulos pequeños, cuerdas que aguantan poco se revientan.</span>';
    }
    pinta();
  };

  /* ---------- portada: una matriz que transforma una rejilla (animada) ---------- */
  function portada(svg) {
    var W = 460, H = 400; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var t = 0, quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mx = 0, my = 0;
    svg.addEventListener('pointermove', function (e) { var r = svg.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; if (quieto) pinta(); });
    function pinta() {
      var a = 1 + .35 * Math.sin(t) + mx * .8, b = .55 * Math.sin(t * .7) + my * .8, c = .4 * Math.cos(t * .8) - my * .5, d = 1 + .3 * Math.cos(t * 1.1) + mx * .4;
      var cx = W / 2, cy = H / 2 + 10, s = 30, h = '';
      function P(x, y) { return [cx + s * (a * x + b * y), cy - s * (c * x + d * y)]; }
      for (var k = -7; k <= 7; k++) {
        var p1 = P(k, -7), p2 = P(k, 7), q1 = P(-7, k), q2 = P(7, k);
        h += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="rgba(160,200,255,' + (k ? .22 : .6) + ')" stroke-width="' + (k ? 1 : 1.6) + '"/>';
        h += '<line x1="' + q1[0] + '" y1="' + q1[1] + '" x2="' + q2[0] + '" y2="' + q2[1] + '" stroke="rgba(160,200,255,' + (k ? .22 : .6) + ')" stroke-width="' + (k ? 1 : 1.6) + '"/>';
      }
      var o = P(0, 0), e1 = P(1, 0), e2 = P(0, 1), e12 = P(1, 1);
      h += '<path d="M' + o + 'L' + e1 + 'L' + e12 + 'L' + e2 + 'Z" fill="rgba(255,210,122,.30)" stroke="#ffd27a" stroke-width="2"/>';
      h += '<line x1="' + o[0] + '" y1="' + o[1] + '" x2="' + e1[0] + '" y2="' + e1[1] + '" stroke="#ff9db8" stroke-width="4" stroke-linecap="round"/><line x1="' + o[0] + '" y1="' + o[1] + '" x2="' + e2[0] + '" y2="' + e2[1] + '" stroke="#7ee0d0" stroke-width="4" stroke-linecap="round"/>';
      h += '<text x="' + (W - 10) + '" y="' + (H - 12) + '" text-anchor="end" font-size="13" fill="rgba(255,255,255,.75)" font-family="system-ui,sans-serif">det = ' + f2(a * d - b * c) + '</text>';
      svg.innerHTML = h;
    }
    (function anim() { t += .01; pinta(); if (!quieto) requestAnimationFrame(anim); })();
  }
  function deco(cv) {
    var dpr = window.devicePixelRatio || 1, W = +cv.getAttribute('width'), H = +cv.getAttribute('height'), i = +(cv.dataset.i || 0);
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var a = 1 + .3 * Math.sin(i), b = .5 * Math.cos(i * 1.7), c = .35 * Math.sin(i * 2.3), d = 1 + .25 * Math.cos(i), s = 22, cx = W / 2, cy = H / 2;
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1;
    for (var k = -9; k <= 9; k++) {
      ctx.beginPath(); ctx.moveTo(cx + s * (a * k - b * 9), cy - s * (c * k - d * 9)); ctx.lineTo(cx + s * (a * k + b * 9), cy - s * (c * k + d * 9)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s * (-a * 9 + b * k), cy - s * (-c * 9 + d * k)); ctx.lineTo(cx + s * (a * 9 + b * k), cy - s * (c * 9 + d * k)); ctx.stroke();
    }
    ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s * a * 2, cy - s * c * 2); ctx.moveTo(cx, cy); ctx.lineTo(cx + s * b * 2, cy - s * d * 2); ctx.stroke();
  }
  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('svg.portada'); if (p) portada(p);
    document.querySelectorAll('canvas.deco').forEach(deco);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

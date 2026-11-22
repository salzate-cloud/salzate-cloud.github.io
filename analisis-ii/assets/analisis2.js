/* Análisis II — laboratorios interactivos (SVG puro) */
(function () {
  'use strict';
  var K = { c1: '#7a1c3a', c2: '#1f4e79', c3: '#a86a12', c4: '#2e7d5b', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233', oro: '#c9932e' };
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

  /* 1. Sumas de Darboux–Stieltjes */
  A['darboux'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'al', 'integrador α', ['α(x) = x (Riemann)', 'α(x) = x²', 'α(x) = I(x − 1) (salto en 1)']], ['n', 'n (subintervalos)', 1, 40, 4]], pinta);
    var f = function (x) { return 1.2 + .7 * Math.sin(2.4 * x) + .35 * x; };
    var als = [function (x) { return x; }, function (x) { return x * x; }, function (x) { return x > 1 ? 1 : 0; }];
    function pinta() {
      var al = als[st.al], n = st.n, P = Plano([-.15, 2.15, -1.25, 2.6]);
      P.ejes({ ticks: false }); var L = 0, U = 0;
      for (var i = 0; i < n; i++) {
        var a = 2 * i / n, b = 2 * (i + 1) / n, m = 1e9, M = -1e9;
        for (var k = 0; k <= 40; k++) { var y = f(a + (b - a) * k / 40); m = Math.min(m, y); M = Math.max(M, y); }
        if (st.al === 2 && a < 1 && b >= 1) { /* el salto ocurre en (a,b] */ }
        var da = al(b) - al(a); L += m * da; U += M * da;
        var op = da > 1e-9 ? 1 : .25;
        P.rect(a, b, 0, M, { f: K.c1, fo: .16 * op, c: K.c1, w: .8 }); P.rect(a, b, 0, m, { f: K.c2, fo: .32 * op });
      }
      P.curva(f, 0, 2, { c: K.tinta, w: 2.6 });
      // panel del integrador
      P.seg(0, -.2, 2, -.2, { c: '#d5d9e2', w: 1 });
      var A0 = al(0), A2 = al(2), esc = function (x) { return -1.15 + .85 * (al(x) - A0) / (A2 - A0); };
      if (st.al === 2) { P.seg(0, esc(0), 1, esc(0), { c: K.c3, w: 2.5 }); P.seg(1, esc(2), 2, esc(2), { c: K.c3, w: 2.5 }); P.punto(1, esc(0), { c: K.c3 }); }
      else P.curva(function (x) { return esc(x); }, 0, 2, { c: K.c3, w: 2.5 });
      P.texto(2.08, -.7, 'α', { c: K.c3, it: 1, b: 1 });
      for (i = 0; i <= n; i++) P.seg(2 * i / n, -1.18, 2 * i / n, -.22, { c: '#e6e9f0', w: 1 });
      s.innerHTML = P.html();
      var exacto = st.al === 0 ? 2.4 + (1 - Math.cos(4.8)) * .7 / 2.4 + .35 * 2 : null;
      lect(c, ['L(P,f,α) = ' + col(K.c2, f2(L)), 'U(P,f,α) = ' + col(K.c1, f2(U)), 'U − L = ' + col(K.c3, f2(U - L)),
        st.al === 2 ? 'Con un salto unitario en 1 la integral vale f(1) = ' + f2(f(1)) : 'Al refinar, U − L → 0: f ∈ ℛ(α).']);
    }
    pinta();
  };

  /* 2. Variación total de x^p sen(π/x) */
  A['variacion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'p', 'función', ['x sen(π/x)', 'x² sen(π/x)']], ['n', 'puntos de la partición', 1, 60, 6]], pinta);
    function pinta() {
      var p = st.p + 1, f = function (x) { return x === 0 ? 0 : Math.pow(x, p) * Math.sin(Math.PI / x); };
      var P = Plano([-.05, 2.1, p === 1 ? -1.1 : -.7, p === 1 ? 2.1 : 4.2]); P.ejes({ px: .5, py: 1 });
      P.curva(function (x) { return Math.pow(x, p); }, 0, 2, { c: '#c9ced9', dash: '5 4', w: 1.2 }); P.curva(function (x) { return -Math.pow(x, p); }, 0, 2, { c: '#c9ced9', dash: '5 4', w: 1.2 });
      P.curva(f, .004, 2, { n: 1600, c: K.c2, w: 1.8 });
      var pts = [0]; for (var k = st.n; k >= 0; k--) pts.push(2 / (2 * k + 1));
      var S = 0, d = '';
      for (var i = 0; i < pts.length; i++) { var y = f(pts[i]); d += (i ? 'L' : 'M') + P.X(pts[i]) + ',' + P.Y(y); if (i) S += Math.abs(y - f(pts[i - 1])); }
      P.put('<path d="' + d + '" fill="none" stroke="' + K.c1 + '" stroke-width="2.2"/>');
      pts.forEach(function (x) { P.punto(x, f(x), { c: K.c1, r: 3.2 }); });
      s.innerHTML = P.html();
      lect(c, ['S(P) = Σ|f(xᵢ) − f(xᵢ₋₁)| = ' + col(K.c1, f2(S)), p === 1 ? 'Crece como la serie armónica: V(f;0,2) = ∞, aunque f es continua.' : 'Se estabiliza: x² sen(π/x) sí es de variación acotada.']);
    }
    pinta();
  };

  /* 3. Integrales impropias de potencias */
  A['impropia'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'tipo', 'integral', ['∫₁ᵗ x^(−λ) dx  (t → ∞)', '∫ε¹ x^(−λ) dx  (ε → 0⁺)']], ['lam', 'λ', .2, 2.5, 1.5, .05], ['t', 'corte (t ó 1/ε)', 1, 60, 8, .5]], pinta);
    function F(l, a, b) { return Math.abs(l - 1) < 1e-9 ? Math.log(b / a) : (Math.pow(b, 1 - l) - Math.pow(a, 1 - l)) / (1 - l); }
    function pinta() {
      var l = st.lam, f = function (x) { return Math.pow(x, -l); }, P, val, lim;
      if (st.tipo === 0) {
        P = Plano([0, 20, -.1, 1.15]); P.ejes({ px: 5, py: .5 }); var t = st.t;
        P.area(f, 1, Math.min(t, 20), { f: K.c1, fo: .25 }); P.curva(f, .87, 20, { c: K.c1, w: 2.6 });
        if (t <= 20) P.seg(t, 0, t, f(t), { c: K.c3, dash: '4 3' });
        val = F(l, 1, t); lim = l > 1 ? 1 / (l - 1) : Infinity;
      } else {
        var e = 1 / st.t; P = Plano([-.02, 1.05, -.2, 8]); P.ejes({ px: .25, py: 2 });
        P.area(f, e, 1, { f: K.c2, fo: .25 }); P.curva(f, .01, 1, { c: K.c2, w: 2.6, n: 600 }); P.seg(e, 0, e, Math.min(f(e), 8), { c: K.c3, dash: '4 3' });
        val = F(l, e, 1); lim = l < 1 ? 1 / (1 - l) : Infinity;
      }
      s.innerHTML = P.html();
      lect(c, ['área sombreada = ' + col(K.c3, f2(val)), isFinite(lim) ? 'converge a ' + col(K.c4, f2(lim)) : col(K.c1, 'diverge'), st.tipo === 0 ? 'En ∞ converge sii λ > 1.' : 'Cerca de 0 converge sii λ < 1.']);
    }
    pinta();
  };

  /* 4. Convergencia uniforme: la banda */
  A['banda'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var S = [
      { n: 'xⁿ en [0,1]', v: [0, 1.05, -.1, 1.25], fn: function (x, n) { return Math.pow(x, n); }, f: function (x) { return x < 1 ? 0 : 1; }, a: 0, b: 1, msg: 'límite discontinuo: nunca cabe en la banda' },
      { n: 'xⁿ en [0, 0.9]', v: [0, 1.05, -.1, 1.25], fn: function (x, n) { return Math.pow(x, n); }, f: function () { return 0; }, a: 0, b: .9, msg: 'sup = 0,9ⁿ → 0: uniforme' },
      { n: 'n²x e^(−nx) en [0, 2]', v: [0, 2, -.3, 6], fn: function (x, n) { return n * n * x * Math.exp(-n * x); }, f: function () { return 0; }, a: 0, b: 2, msg: 'el pico n/e crece: no uniforme' },
      { n: 'sen(nx)/n en [0, 2π]', v: [0, 6.3, -1.1, 1.1], fn: function (x, n) { return Math.sin(n * x) / n; }, f: function () { return 0; }, a: 0, b: 6.283, msg: 'sup = 1/n → 0: uniforme (pero las derivadas no convergen)' },
      { n: 'n sen(1/(nx)) en [0.15, 4]', v: [0, 4, -.2, 7], fn: function (x, n) { return n * Math.sin(1 / (n * x)); }, f: function (x) { return 1 / x; }, a: .15, b: 4, msg: 'cerca de 0 la distancia es grande; en [1,∞) sup ≤ 1/(2n)' }];
    var st = controles(cu, [['sel', 'k', 'sucesión', S.map(function (o) { return o.n; })], ['n', 'n', 1, 60, 3], ['e', 'ε', .02, .5, .15, .01]], pinta);
    function pinta() {
      var o = S[st.k], n = st.n, e = st.e, P = Plano(o.v); P.ejes({ ticks: true, px: o.v[1] > 3 ? 1 : .2, py: o.v[3] > 3 ? 1 : .5 });
      var up = function (x) { return o.f(x) + e; }, lo = function (x) { return o.f(x) - e; }, d = '', N = 300, i, x;
      for (i = 0; i <= N; i++) { x = o.a + (o.b - o.a) * i / N; d += (i ? 'L' : 'M') + P.X(x) + ',' + P.Y(Math.min(up(x), o.v[3])); }
      for (i = N; i >= 0; i--) { x = o.a + (o.b - o.a) * i / N; d += 'L' + P.X(x) + ',' + P.Y(Math.max(lo(x), o.v[2])); }
      P.put('<path d="' + d + 'Z" fill="' + K.oro + '" fill-opacity=".22"/>');
      P.curva(o.f, o.a, o.b, { c: K.tinta, w: 2.4, n: 600 });
      var sup = 0; for (i = 0; i <= 2000; i++) { x = o.a + (o.b - o.a) * i / 2000; sup = Math.max(sup, Math.abs(o.fn(x, n) - o.f(x))); }
      P.curva(function (x) { return o.fn(x, n); }, o.a, o.b, { c: sup <= e ? K.c4 : K.c1, w: 2.4, n: 800 });
      s.innerHTML = P.html();
      lect(c, ['sup |fₙ − f| ≈ ' + col(K.c3, f2(sup)), sup <= e ? col(K.c4, 'fₙ está dentro de la banda') : col(K.c1, 'fₙ se sale de la banda'), o.msg]);
    }
    pinta();
  };

  /* 5. Polinomios de Taylor */
  A['taylor'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
    var F = [
      { n: 'sen x', f: Math.sin, c: function (k) { return k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / fact(k) : 0; }, v: [-8, 8, -2.5, 2.5], R: Infinity },
      { n: 'eˣ', f: Math.exp, c: function (k) { return 1 / fact(k); }, v: [-5, 3, -1, 8], R: Infinity },
      { n: 'ln(1 + x)', f: function (x) { return x > -1 ? Math.log(1 + x) : NaN; }, c: function (k) { return k ? (k % 2 ? 1 : -1) / k : 0; }, v: [-1.5, 2.5, -3, 2], R: 1 },
      { n: '1/(1 + x²)', f: function (x) { return 1 / (1 + x * x); }, c: function (k) { return k % 2 ? 0 : ((k / 2) % 2 ? -1 : 1); }, v: [-2.5, 2.5, -1, 2], R: 1 },
      { n: 'e^(−1/x²) (no analítica)', f: function (x) { return x ? Math.exp(-1 / (x * x)) : 0; }, c: function () { return 0; }, v: [-3, 3, -.3, 1.2], R: 0 }];
    var st = controles(cu, [['sel', 'k', 'función', F.map(function (o) { return o.n; })], ['n', 'grado n', 0, 30, 5]], pinta);
    function pinta() {
      var o = F[st.k], P = Plano(o.v); P.ejes({ px: o.v[1] - o.v[0] > 10 ? 2 : 1 });
      if (isFinite(o.R) && o.R > 0) { P.rect(-o.R, o.R, o.v[2], o.v[3], { f: K.c2, fo: .07 }); P.seg(-o.R, o.v[2], -o.R, o.v[3], { c: K.c2, dash: '5 4', w: 1.2 }); P.seg(o.R, o.v[2], o.R, o.v[3], { c: K.c2, dash: '5 4', w: 1.2 }); }
      P.curva(o.f, o.v[0], o.v[1], { c: K.tinta, w: 2.8, n: 600 });
      var T = function (x) { var s = 0, p = 1; for (var k = 0; k <= st.n; k++) { s += o.c(k) * p; p *= x; } return s; };
      P.curva(T, o.v[0], o.v[1], { c: K.c1, w: 2.4, n: 600 });
      s.innerHTML = P.html();
      lect(c, [col(K.c1, 'T' + st.n + '(x)') + ' en a = 0', o.R === Infinity ? 'radio de convergencia ∞' : o.R ? 'radio de convergencia ' + o.R + ' (fuera, Tₙ se dispara)' : 'todos los coeficientes son 0: Tₙ ≡ 0 ≠ f', 'T' + st.n + '(1) = ' + f2(T(1)) + ' ; f(1) = ' + f2(o.f(1))]);
    }
    pinta();
  };

  /* 6. Sumas parciales de Fourier y núcleo de Dirichlet */
  var FOU = [
    { n: 'onda cuadrada sgn x', f: function (x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }, a0: 0, a: function () { return 0; }, b: function (n) { return n % 2 ? 4 / (Math.PI * n) : 0; }, v: [-1.6, 1.6] },
    { n: 'diente de sierra x', f: function (x) { return x; }, a0: 0, a: function () { return 0; }, b: function (n) { return 2 * (n % 2 ? 1 : -1) / n; }, v: [-4, 4] },
    { n: 'valor absoluto |x|', f: Math.abs, a0: Math.PI, a: function (n) { return n % 2 ? -4 / (Math.PI * n * n) : 0; }, b: function () { return 0; }, v: [-.5, 3.6] },
    { n: 'parábola x²', f: function (x) { return x * x; }, a0: 2 * Math.PI * Math.PI / 3, a: function (n) { return 4 * (n % 2 ? -1 : 1) / (n * n); }, b: function () { return 0; }, v: [-1, 11] },
    { n: 'pulso χ[−1,1]', f: function (x) { return Math.abs(x) < 1 ? 1 : Math.abs(x) === 1 ? .5 : 0; }, a0: 2 / Math.PI, a: function (n) { return 2 * Math.sin(n) / (Math.PI * n); }, b: function () { return 0; }, v: [-.4, 1.4] }];
  function per(x) { var t = (x + Math.PI) % (2 * Math.PI); if (t < 0) t += 2 * Math.PI; return t - Math.PI; }
  function SN(o, N, x) { var s = o.a0 / 2; for (var n = 1; n <= N; n++) s += o.a(n) * Math.cos(n * x) + o.b(n) * Math.sin(n * x); return s; }
  A['fourier'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'función', FOU.map(function (o) { return o.n; })], ['sel', 'vista', 'vista', ['sumas parciales Sₙ', 'núcleo de Dirichlet Dₙ']], ['N', 'N', 1, 80, 7]], pinta);
    function pinta() {
      var o = FOU[st.k], N = st.N, L = 2 * Math.PI, P;
      if (st.vista === 1) {
        P = Plano([-Math.PI, Math.PI, -.35 * (N + .5), N + 1.2]); P.ejes({ ticks: false });
        P.curva(function (t) { return Math.abs(Math.sin(t / 2)) < 1e-9 ? N + .5 : Math.sin((N + .5) * t) / (2 * Math.sin(t / 2)); }, -Math.PI, Math.PI, { c: K.c1, w: 2, n: 1500 });
        P.texto(Math.PI - .2, N * .8, 'Dₙ', { c: K.c1, b: 1, it: 1 });
        s.innerHTML = P.html();
        lect(c, ['Dₙ(0) = n + ½ = ' + f2(N + .5), '(1/π)∫Dₙ = 1', 'S_N(x) = (1/π)∫ Dₙ(t) f(x + t) dt: un promedio ponderado alrededor de x']);
        return;
      }
      P = Plano([-L - .35, L + .35, o.v[0], o.v[1]]); P.ejes({ px: Math.PI, py: 1, fx: function (x) { var k = Math.round(x / Math.PI); return k === 1 ? 'π' : k === -1 ? '−π' : (k < 0 ? '−' : '') + Math.abs(k) + 'π'; } });
      P.curva(function (x) { return o.f(per(x)); }, -L, L, { c: '#9aa3b5', w: 2.4, n: 1200 });
      P.curva(function (x) { return SN(o, N, x); }, -L, L, { c: K.c1, w: 2.2, n: 1600 });
      var mx = -1e9; for (var i = 0; i <= 600; i++) { var x = .001 + Math.PI * i / 600; mx = Math.max(mx, SN(o, N, x)); }
      s.innerHTML = P.html();
      var extra = st.k === 0 ? 'máximo de S_N ≈ ' + f2(mx) + ' (Gibbs: → 1,179)' : st.k === 2 ? 'converge uniformemente: |x| es continua y derivable a trozos' : 'en los saltos S_N vale el promedio';
      lect(c, [col(K.c1, 'S' + N) + ' con ' + N + ' armónicos', 'S_N(1) = ' + f2(SN(o, N, 1)) + ' ; f(1) = ' + f2(o.f(1)), extra]);
    }
    pinta();
  };

  /* 7. Coeficientes, Bessel y Parseval */
  A['coeficientes'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var norma = [2, 2 * Math.PI * Math.PI / 3, 2 * Math.PI * Math.PI / 3, 2 * Math.pow(Math.PI, 4) / 5, 2 / Math.PI];
    var st = controles(cu, [['sel', 'k', 'función', FOU.map(function (o) { return o.n; })], ['N', 'N', 1, 40, 10]], pinta);
    function pinta() {
      var o = FOU[st.k], N = st.N, P = Plano([0, 41, -5, 1]); P.ejes({ ticks: false });
      for (var y = -4; y <= 0; y++) { P.seg(0, y, 41, y, { c: '#eef0f5', w: 1 }); P.texto(-.2, y, '10^' + y, { s: 10, a: 'end', c: '#8b93a5' }); }
      var sum = o.a0 * o.a0 / 2;
      for (var n = 1; n <= 40; n++) {
        var r = Math.hypot(o.a(n), o.b(n)); if (n <= N) sum += o.a(n) * o.a(n) + o.b(n) * o.b(n);
        if (r > 1e-12) P.rect(n - .35, n + .35, -5, Math.max(Math.log10(r), -5), { f: n <= N ? K.c1 : '#c9ced9', fo: .85 });
      }
      s.innerHTML = P.html();
      lect(c, ['a₀²/2 + Σₙ≤N (aₙ² + bₙ²) = ' + col(K.c1, f2(sum, 4)), '(1/π)∫f² = ' + col(K.c4, f2(norma[st.k], 4)), 'falta ' + f2(100 * (1 - sum / norma[st.k]), 2) + ' % (Bessel ≤, Parseval =)']);
    }
    pinta();
  };

  /* 8. Riemann–Lebesgue */
  A['rl'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['nu', 'ν', 1, 60, 6, 1]], pinta);
    var f = function (x) { return Math.exp(-(x - 1.6) * (x - 1.6)) * (1 + .3 * x); };
    function pinta() {
      var nu = st.nu, g = function (x) { return f(x) * Math.sin(nu * x); }, P = Plano([0, Math.PI, -1.5, 1.5]); P.ejes({ ticks: false });
      P.curva(f, 0, Math.PI, { c: '#c9ced9', dash: '5 4', w: 1.4 }); P.curva(function (x) { return -f(x); }, 0, Math.PI, { c: '#c9ced9', dash: '5 4', w: 1.4 });
      P.area(function (x) { return Math.max(g(x), 0); }, 0, Math.PI, { f: K.c4, fo: .3, n: 1200 }); P.area(function (x) { return Math.min(g(x), 0); }, 0, Math.PI, { f: K.c1, fo: .3, n: 1200 });
      P.curva(g, 0, Math.PI, { c: K.tinta, w: 1.6, n: 1500 });
      var I = 0, M = 4000; for (var i = 0; i < M; i++) I += g((i + .5) * Math.PI / M) * Math.PI / M;
      s.innerHTML = P.html();
      lect(c, ['∫₀^π f(x) sen(νx) dx = ' + col(K.c3, f2(I, 4)), 'las áreas verdes y vino se cancelan cada vez mejor: → 0']);
    }
    pinta();
  };

  /* 9. La integral de Fourier del pulso */
  A['integral-fourier'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['eta', 'η', .5, 40, 4, .5]], pinta);
    var tab = [0], h = .01;
    function Si(u) { var sg = u < 0 ? -1 : 1; u = Math.abs(u); var k = Math.floor(u / h); while (tab.length <= k + 1) { var j = tab.length, t0 = (j - 1) * h, tm = t0 + h / 2, t1 = j * h; var sn = function (t) { return t ? Math.sin(t) / t : 1; }; tab.push(tab[j - 1] + h / 6 * (sn(t0) + 4 * sn(tm) + sn(t1))); } return sg * (tab[k] + (tab[k + 1] - tab[k]) * (u / h - k)); }
    function pinta() {
      var e = st.eta, S = function (x) { return (Si(e * (x + 1)) - Si(e * (x - 1))) / Math.PI; }, P = Plano([-3, 3, -.25, 1.3]); P.ejes({ py: .5 });
      P.seg(-3, 0, -1, 0, { c: '#9aa3b5', w: 2.6 }); P.seg(-1, 1, 1, 1, { c: '#9aa3b5', w: 2.6 }); P.seg(1, 0, 3, 0, { c: '#9aa3b5', w: 2.6 });
      P.curva(S, -3, 3, { c: K.c1, w: 2.2, n: 900 }); P.punto(1, S(1), { c: K.oro }); P.punto(-1, S(-1), { c: K.oro });
      s.innerHTML = P.html();
      lect(c, ['S(η)(x) = (1/π)∫₀^η dy ∫₋₁¹ cos y(x − t) dt', 'S(η)(0) = ' + f2(S(0), 4), 'S(η)(±1) = ' + f2(S(1), 4) + ' (promedio ½)']);
    }
    pinta();
  };

  /* 10. Una función y su transformada (incertidumbre) */
  A['transformada'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var r2p = Math.sqrt(2 / Math.PI);
    var F = [
      { n: 'pulso χ[−a,a]', f: function (x, a) { return Math.abs(x) <= a ? 1 : 0; }, F: function (y, a) { return y ? r2p * Math.sin(a * y) / y : r2p * a; } },
      { n: 'triángulo (1 − |x|/a)₊', f: function (x, a) { return Math.max(1 - Math.abs(x) / a, 0); }, F: function (y, a) { return y ? r2p * (1 - Math.cos(a * y)) / (a * y * y) : r2p * a / 2; } },
      { n: 'exponencial e^(−|x|/a)', f: function (x, a) { return Math.exp(-Math.abs(x) / a); }, F: function (y, a) { return r2p * (1 / a) / (1 / (a * a) + y * y); } },
      { n: 'gaussiana e^(−x²/(2a²))', f: function (x, a) { return Math.exp(-x * x / (2 * a * a)); }, F: function (y, a) { return a * Math.exp(-a * a * y * y / 2); } }];
    var st = controles(cu, [['sel', 'k', 'función', F.map(function (o) { return o.n; })], ['a', 'ancho a', .3, 3, 1, .05]], pinta);
    function pinta() {
      var o = F[st.k], a = st.a, P = Plano([-5, 5, -.3, 1.2], 300, 340, 10, 20), Q = Plano([-10, 10, -.6, 2.6], 300, 340, 330, 20);
      P.ejes({ ticks: false }); Q.ejes({ ticks: false });
      P.area(function (x) { return o.f(x, a); }, -5, 5, { f: K.c2, fo: .2, n: 600 }); P.curva(function (x) { return o.f(x, a); }, -5, 5, { c: K.c2, w: 2.4, n: 800 });
      Q.area(function (y) { return o.F(y, a); }, -10, 10, { f: K.c1, fo: .18, n: 800 }); Q.curva(function (y) { return o.F(y, a); }, -10, 10, { c: K.c1, w: 2.4, n: 1000 });
      P.texto(0, 1.12, 'f(x)', { c: K.c2, b: 1, it: 1 }); Q.texto(5, 2.3, 'f̂(y)', { c: K.c1, b: 1, it: 1 });
      s.innerHTML = P.html() + Q.html();
      lect(c, ['f̂(0) = (1/√(2π))∫f = ' + col(K.c1, f2(o.F(0, a))), 'ancho de f ~ a = ' + f2(a, 2) + ' ; ancho de f̂ ~ 1/a = ' + f2(1 / a, 2), 'comprimir f ensancha f̂: principio de incertidumbre']);
    }
    pinta();
  };

  /* 11. Convolución deslizando */
  A['convolucion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var Ps = [{ n: 'pulso χ[−1,1]', f: function (t) { return Math.abs(t) <= 1 ? 1 : 0; } }, { n: 'exponencial e^(−2|t|)', f: function (t) { return Math.exp(-2 * Math.abs(t)); } }, { n: 'triángulo (1 − |t|)₊', f: function (t) { return Math.max(1 - Math.abs(t), 0); } }];
    var st = controles(cu, [['sel', 'k', 'ψ', Ps.map(function (o) { return o.n; })], ['x', 'x', -3.5, 3.5, -1.2, .05]], pinta);
    var phi = function (t) { return Math.abs(t) <= 1 ? 1 : 0; };
    function conv(psi, x) { var s = 0, M = 400; for (var i = 0; i < M; i++) { var t = -1 + 2 * (i + .5) / M; s += psi(x - t) * 2 / M; } return s; }
    function pinta() {
      var psi = Ps[st.k].f, x = st.x, P = Plano([-4, 4, -.15, 2.3]); P.ejes({ px: 1, py: 1 });
      P.area(function (t) { return phi(t) * psi(x - t); }, -4, 4, { f: K.oro, fo: .45, n: 800 });
      P.curva(phi, -4, 4, { c: K.c2, w: 2.4, n: 800 }); P.curva(function (t) { return psi(x - t); }, -4, 4, { c: K.c1, w: 2.2, dash: '6 4', n: 800 });
      P.curva(function (u) { return conv(psi, u); }, -4, x, { c: K.c4, w: 3, n: 240 }); P.punto(x, conv(psi, x), { c: K.c4, r: 5 });
      s.innerHTML = P.html();
      lect(c, [col(K.c2, 'φ = χ[−1,1]') + ' · ' + col(K.c1, 'ψ(x − t)'), '(φ∗ψ)(x) = ∫φ(t)ψ(x − t)dt = ' + col(K.c4, f2(conv(psi, x))), 'el área dorada traza la curva verde']);
    }
    pinta();
  };

  /* 12. La cola de y e^(−xy) */
  A['cola'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['y', 'y', .05, 3, .3, .01], ['eta', 'η', .5, 10, 3, .1]], pinta);
    function pinta() {
      var y = st.y, e = st.eta, f = function (x) { return y * Math.exp(-x * y); }, P = Plano([0, 10, -.1, Math.max(1.1, y * 1.1)]); P.ejes({ py: .5 });
      P.area(f, 0, e, { f: K.c2, fo: .18 }); P.area(f, e, 10, { f: K.c1, fo: .35 }); P.curva(f, 0, 10, { c: K.tinta, w: 2.4 }); P.seg(e, 0, e, f(e), { c: K.c3, dash: '4 3' });
      s.innerHTML = P.html();
      lect(c, ['cola ∫_η^∞ y e^(−xy) dx = e^(−ηy) = ' + col(K.c1, f2(Math.exp(-e * y))), 'sup sobre y > 0 de la cola = 1 para todo η', 'en [α, ∞) la cola es ≤ e^(−ηα) → 0: uniforme']);
    }
    pinta();
  };


  /* ---------- portada: epiciclos que dibujan una serie de Fourier (interactiva) ---------- */
  function portada(svg) {
    var W = 460, H = 380, t = 0, N = 5, traza = [], quieto = false, fi = 0, pausa = false;
    var FS = [
      { n: 'onda cuadrada', m: 1, term: function (k) { return k % 2 ? [4 / (Math.PI * k), 0] : null; }, f: '(4/π) Σ sen(kx)/k' },
      { n: 'diente de sierra', m: Math.PI, term: function (k) { return [2 / k, k % 2 ? 0 : Math.PI]; }, f: '2 Σ (−1)ᵏ⁺¹ sen(kx)/k' },
      { n: 'triángulo', m: Math.PI / 2, term: function (k) { return k % 2 ? [4 / (Math.PI * k * k), 1.5 * Math.PI] : null; }, f: '−(4/π) Σ cos(kx)/k²' }];
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var hero = svg.parentNode, ctl = document.createElement('div'); ctl.className = 'portada-ctl';
    ctl.innerHTML = '<div class="pc-fila">' + FS.map(function (o, i) { return '<button type="button" data-f="' + i + '"' + (i ? '' : ' class="on"') + '>' + o.n + '</button>'; }).join('') + '</div>' +
      '<div class="pc-fila"><button type="button" data-d="-1" aria-label="menos armónicos">−</button><span class="pc-n"></span><button type="button" data-d="1" aria-label="más armónicos">+</button><button type="button" data-p="1" class="pc-pausa">❚❚</button></div>' +
      '<div class="pc-ayuda">Arrastra sobre la figura o usa los botones</div>';
    hero.appendChild(ctl);
    function marca() { ctl.querySelector('.pc-n').textContent = N + ' armónico' + (N > 1 ? 's' : ''); ctl.querySelectorAll('[data-f]').forEach(function (b) { b.classList.toggle('on', +b.dataset.f === fi); }); }
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.f) { fi = +b.dataset.f; traza = []; }
      if (b.dataset.d) N = Math.max(1, Math.min(40, N + (+b.dataset.d) * (N >= 10 ? 5 : 1)));
      if (b.dataset.p) { pausa = !pausa; b.textContent = pausa ? '▶' : '❚❚'; if (!pausa && quieto) pinta(); }
      marca(); if (quieto || pausa) pinta();
    });
    function desdePuntero(e) { var r = svg.getBoundingClientRect(); N = Math.max(1, Math.min(40, 1 + Math.round(39 * Math.pow((e.clientX - r.left) / r.width, 1.6)))); marca(); if (quieto || pausa) pinta(); }
    svg.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) desdePuntero(e); });
    svg.addEventListener('pointerdown', function (e) { desdePuntero(e); });
    svg.addEventListener('dblclick', function () { fi = (fi + 1) % FS.length; traza = []; marca(); });
    svg.style.cursor = 'ew-resize';
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) quieto = true;
    function pinta() {
      var o = FS[fi], cx = 150, cy = 190, R = 62, x = cx, y = cy, h = '';
      for (var k = 1, usados = 0; k <= 200 && usados < N; k++) {
        var tm = o.term(k); if (!tm) continue; usados++;
        var r = R * tm[0] / o.m, a = k * t + tm[1], nx = x + r * Math.cos(a), ny = y - r * Math.sin(a);
        if (r > .4) h += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="rgba(243,197,107,' + (usados === 1 ? .55 : .28) + ')" stroke-width="1.1"/>';
        h += '<line x1="' + x + '" y1="' + y + '" x2="' + nx + '" y2="' + ny + '" stroke="#f3c56b" stroke-width="1.6"/>';
        x = nx; y = ny;
      }
      if (!pausa && !quieto) { traza.unshift(y); if (traza.length > 200) traza.pop(); }
      var x0 = 250; h += '<line x1="' + x + '" y1="' + y + '" x2="' + x0 + '" y2="' + y + '" stroke="rgba(255,255,255,.45)" stroke-dasharray="3 3"/>';
      if (quieto) { traza = []; for (var i = 0; i < 200; i++) { var tt = t - i * .025, yy = cy; for (var k2 = 1, u2 = 0; k2 <= 200 && u2 < N; k2++) { var m2 = o.term(k2); if (!m2) continue; u2++; yy -= R * m2[0] / o.m * Math.sin(k2 * tt + m2[1]); } traza.push(yy); } }
      h += '<path d="' + traza.map(function (v, i) { return (i ? 'L' : 'M') + (x0 + i) + ',' + v; }).join('') + '" fill="none" stroke="#ffd9e3" stroke-width="2.4"/>';
      h += '<path d="M' + x0 + ',' + (cy - R) + 'H' + (x0 + 200) + '" stroke="rgba(255,255,255,.15)"/><path d="M' + x0 + ',' + (cy + R) + 'H' + (x0 + 200) + '" stroke="rgba(255,255,255,.15)"/>';
      h += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#fff"/>';
      h += '<text x="' + (W - 12) + '" y="22" text-anchor="end" font-size="14" fill="rgba(255,255,255,.8)" font-family="Palatino Linotype,Palatino,Georgia,serif" font-style="italic">' + o.f + '</text>';
      svg.innerHTML = h;
    }
    marca();
    (function anim() { if (!pausa) t += .025; pinta(); if (!quieto) requestAnimationFrame(anim); })();
  }
  function deco(cv) {
    var dpr = window.devicePixelRatio || 1, W = +cv.getAttribute('width'), H = +cv.getAttribute('height'), i = +(cv.dataset.i || 0);
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var o = FOU[i % FOU.length], Ns = [1, 3, 9, 25];
    Ns.forEach(function (N, j) {
      ctx.strokeStyle = j === Ns.length - 1 ? 'rgba(243,197,107,.9)' : 'rgba(255,255,255,' + (.18 + .1 * j) + ')'; ctx.lineWidth = j === Ns.length - 1 ? 2 : 1.2; ctx.beginPath();
      for (var p = 0; p <= 300; p++) { var x = -2 * Math.PI + 4 * Math.PI * p / 300, v = SN(o, N, x), yy = H / 2 - (v - (o.v[0] + o.v[1]) / 2) / (o.v[1] - o.v[0]) * H * .8; if (p) ctx.lineTo(W * p / 300, yy); else ctx.moveTo(0, yy); }
      ctx.stroke();
    });
  }
  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('svg.portada'); if (p) portada(p);
    document.querySelectorAll('canvas.deco').forEach(deco);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

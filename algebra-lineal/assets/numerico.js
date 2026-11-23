/* Análisis Numérico — laboratorios interactivos (SVG) y portada fractal de Newton (canvas) */
(function () {
  'use strict';
  var K = { c1: '#4b2a8a', c2: '#c0397a', c3: '#a86a12', c4: '#2e7d5b', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233', oro: '#c9932e' };
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


  function botonAnim(cu, txt) { var b = el('button', { type: 'button' }, txt || '▶ Animar'); b.style.cssText = 'margin:6px 6px 0 0;padding:5px 14px;border-radius:999px;border:1px solid #4b2a8a;background:#f1ecfa;color:#4b2a8a;font:14px system-ui,sans-serif;cursor:pointer'; cu.appendChild(b); return b; }
  function fijaSlider(cu, nombre, v) { cu.querySelectorAll('.ctl2d input').forEach(function (x) { if (x.parentNode.querySelector('span').textContent === nombre) { x.value = v; x.dispatchEvent(new Event('input')); } }); }
  function exp10(x) { if (x === 0) return '0'; var e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e); return f2(m, 2) + '·10' + sup(e); }
  function sup(n) { var d = '⁰¹²³⁴⁵⁶⁷⁸⁹'; return String(n).split('').map(function (c) { return c === '-' ? '⁻' : d[+c]; }).join(''); }
  function tabla(c, filas) { var t = c.querySelector('.tablita'); if (!t) { t = el('div', { class: 'tablita' }); t.style.cssText = 'font:13px/1.45 ui-monospace,Menlo,monospace;overflow-x:auto;margin:6px 0 0;max-height:190px;overflow-y:auto'; c.querySelector('.acuerpo').appendChild(t); } t.innerHTML = '<table style="border-collapse:collapse;width:100%">' + filas.map(function (f, i) { return '<tr>' + f.map(function (x) { return (i ? '<td' : '<th') + ' style="padding:2px 8px;text-align:right;border-bottom:1px solid #eee">' + x + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</table>'; }

  /* 1. Bisección */
  var FB = [{ n: 'x³ + 4x² − 10 en [1, 2]', f: function (x) { return x * x * x + 4 * x * x - 10; }, a: 1, b: 2, v: [.85, 2.15, -7, 15] },
            { n: 'cos x − x en [0, 1]', f: function (x) { return Math.cos(x) - x; }, a: 0, b: 1, v: [-.1, 1.1, -.8, 1.1] },
            { n: 'x³ − 25 en [2, 3]', f: function (x) { return x * x * x - 25; }, a: 2, b: 3, v: [1.9, 3.1, -19, 4] }];
  A['biseccion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'función', FB.map(function (x) { return x.n; })], ['n', 'iteraciones', 1, 30, 4]], pinta);
    function pinta() {
      var F = FB[st.k], f = F.f, a = F.a, b = F.b, P = Plano(F.v), filas = [['n', 'aₙ', 'bₙ', 'pₙ', 'f(pₙ)', 'cota (b−a)/2ⁿ']], p;
      P.ejes({ ticks: false }); P.curva(f, F.v[0], F.v[1], { c: K.c1, w: 2.6 });
      var yb = F.v[2] + (F.v[3] - F.v[2]) * .04, dy = (F.v[3] - F.v[2]) * .028;
      for (var n = 1; n <= st.n; n++) {
        p = a + (b - a) / 2; if (n <= 12) { P.seg(a, yb + (n - 1) * dy, b, yb + (n - 1) * dy, { c: K.c2, w: 3 }); }
        filas.push([n, f2(a, 9), f2(b, 9), f2(p, 9), exp10(f(p)), exp10((F.b - F.a) / Math.pow(2, n))]);
        if (f(a) * f(p) < 0) b = p; else a = p;
      }
      P.punto(p, 0, { c: K.c2 }); s.innerHTML = P.html(); tabla(c, filas.length > 9 ? filas.slice(0, 1).concat(filas.slice(-8)) : filas);
      lect(c, ['pₙ = ' + col(K.c2, f2(p, 10)), 'cota del error ' + exp10((F.b - F.a) / Math.pow(2, st.n)), 'un bit por iteración: ~3,3 iteraciones por cifra']);
    }
    pinta();
  };

  /* 2. Telaraña de punto fijo */
  var GS = [{ n: 'g(x) = cos x', g: Math.cos, v: [0, 1.6, 0, 1.6], p0: .2 },
            { n: 'g(x) = √(10/(4+x))', g: function (x) { return Math.sqrt(10 / (4 + x)); }, v: [.8, 2, .8, 2], p0: 1.9 },
            { n: 'g(x) = ½√(10 − x³)', g: function (x) { return .5 * Math.sqrt(Math.max(0, 10 - x * x * x)); }, v: [.8, 2, .8, 2], p0: 1.5 },
            { n: 'g(x) = e^(−x)', g: function (x) { return Math.exp(-x); }, v: [0, 1.2, 0, 1.2], p0: 1 },
            { n: 'g(x) = 1 − x² (repulsivo)', g: function (x) { return 1 - x * x; }, v: [-.1, 1.1, -.1, 1.1], p0: .5 },
            { n: 'g(x) = 3,2x(1 − x) (ciclo)', g: function (x) { return 3.2 * x * (1 - x); }, v: [0, 1, 0, 1], p0: .3 }];
  A['telarana'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420);
    var st = controles(cu, [['sel', 'k', 'iteración', GS.map(function (x) { return x.n; })], ['p0', 'p₀ (desplazamiento)', -.5, .5, 0, .01], ['n', 'pasos', 1, 60, 12]], pinta);
    function pinta() {
      var G = GS[st.k], g = G.g, P = Plano(G.v, 420, 400, 110, 10), p = Math.min(G.v[1], Math.max(G.v[0], G.p0 + st.p0)), d = 'M' + P.X(p) + ',' + P.Y(G.v[2]);
      P.ejes({ px: .2, py: .2 }); P.seg(G.v[0], G.v[0], G.v[1], G.v[1], { c: K.gris, w: 1.2 }); P.curva(g, G.v[0], G.v[1], { c: K.c1, w: 2.6 });
      var hist = [p];
      for (var i = 0; i < st.n; i++) { var q = g(p); if (!isFinite(q) || Math.abs(q) > 1e3) break; d += 'L' + P.X(p) + ',' + P.Y(q) + 'L' + P.X(q) + ',' + P.Y(q); p = q; hist.push(p); }
      P.put('<path d="' + d + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.6"/>'); P.punto(hist[0], G.v[2], { c: K.c2 });
      s.innerHTML = P.html();
      var dg = (g(p + 1e-6) - g(p - 1e-6)) / 2e-6;
      lect(c, ['p' + sub(hist.length - 1) + ' = ' + col(K.c2, f2(p, 8)), '|g′(p)| ≈ ' + f2(Math.abs(dg), 3) + (Math.abs(dg) < 1 ? ' < 1: atractor' : ' > 1: repulsivo'), 'el error se multiplica por ≈ |g′(p)| en cada paso']);
    }
    pinta();
  };
  function sub(n) { var d = '₀₁₂₃₄₅₆₇₈₉'; return String(n).split('').map(function (c) { return d[+c]; }).join(''); }

  /* 3. Newton y secante */
  var FN = [{ n: 'x² − 2', f: function (x) { return x * x - 2; }, d: function (x) { return 2 * x; }, r: Math.SQRT2, v: [0, 3.4, -3, 10], p0: 3 },
            { n: 'cos x − x', f: function (x) { return Math.cos(x) - x; }, d: function (x) { return -Math.sin(x) - 1; }, r: .7390851332151607, v: [-.5, 2, -2.5, 1.5], p0: 1.8 },
            { n: 'x³ − 2x + 2 (ciclo desde 0)', f: function (x) { return x * x * x - 2 * x + 2; }, d: function (x) { return 3 * x * x - 2; }, r: -1.7692923542386314, v: [-2.5, 1.6, -4, 6], p0: .02 },
            { n: 'arctan x (diverge si |p₀| > 1,39)', f: Math.atan, d: function (x) { return 1 / (1 + x * x); }, r: 0, v: [-4, 4, -1.6, 1.6], p0: 1.3 },
            { n: '(x − 1)² (raíz doble)', f: function (x) { return (x - 1) * (x - 1); }, d: function (x) { return 2 * (x - 1); }, r: 1, v: [0, 3.2, -1, 4.5], p0: 3 }];
  A['newton'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'función', FN.map(function (x) { return x.n; })], ['sel', 'm', 'método', ['Newton', 'secante', 'bisección (referencia)']], ['dp', 'mover p₀', -1, 1, 0, .01], ['n', 'pasos', 1, 12, 4]], pinta);
    function pinta() {
      var F = FN[st.k], f = F.f, P = Plano(F.v), p = F.p0 + st.dp, q = p - .3, filas = [['n', 'pₙ', '|pₙ − p|', '|eₙ₊₁|/|eₙ|', '|eₙ₊₁|/|eₙ|²']], es = [Math.abs(p - F.r)];
      P.ejes({ ticks: false }); P.curva(f, F.v[0], F.v[1], { c: K.c1, w: 2.6 });
      var a = F.v[0], b = F.v[1];
      for (var i = 0; i < st.n; i++) {
        var np;
        if (st.m === 0) { np = p - f(p) / F.d(p); if (i < 6 && isFinite(np)) { P.seg(p, 0, p, f(p), { c: K.gris, dash: '3 3', w: 1.2 }); P.seg(p, f(p), np, 0, { c: K.c2, w: 1.8 }); } }
        else if (st.m === 1) { np = p - f(p) * (p - q) / (f(p) - f(q)); if (i < 6 && isFinite(np)) { P.seg(q, f(q), np, 0, { c: K.c2, w: 1.6 }); P.punto(q, f(q), { r: 3, c: K.c2 }); } q = p; }
        else { if (i === 0) { a = Math.min(F.r - .9, F.r - .2); b = F.r + 1.1; } np = (a + b) / 2; if (f(a) * f(np) < 0) b = np; else a = np; }
        if (!isFinite(np) || Math.abs(np) > 1e6) break;
        p = np; es.push(Math.abs(p - F.r));
        var e1 = es[es.length - 1], e0 = es[es.length - 2];
        filas.push([i + 1, f2(p, 12), exp10(e1), e0 ? f2(e1 / e0, 4) : '—', e0 ? f2(e1 / (e0 * e0), 4) : '—']);
        if (e1 < 1e-15) break;
      }
      if (isFinite(p) && p > F.v[0] && p < F.v[1]) P.punto(p, 0, { c: K.c2 });
      s.innerHTML = P.html(); tabla(c, filas);
      lect(c, ['último pₙ = ' + col(K.c2, f2(p, 12)), 'columna |eₙ₊₁|/|eₙ|² casi constante ⇒ orden 2', 'secante: orden φ ≈ 1,618']);
    }
    pinta();
  };

  /* 4. Runge y Chebyshev */
  var FR = [{ n: '1/(1 + 25x²) (Runge)', f: function (x) { return 1 / (1 + 25 * x * x); } }, { n: '|x|', f: Math.abs }, { n: 'sen(πx)', f: function (x) { return Math.sin(Math.PI * x); } }, { n: 'eˣ', f: Math.exp }];
  A['runge'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'función', FR.map(function (x) { return x.n; })], ['sel', 'nodos', 'nodos', ['equiespaciados', 'Chebyshev']], ['n', 'grado n', 1, 30, 10]], pinta);
    function pinta() {
      var F = FR[st.k], n = st.n, xs = [], ys = [];
      for (var i = 0; i <= n; i++) { var x = st.nodos ? Math.cos((2 * i + 1) * Math.PI / (2 * n + 2)) : -1 + 2 * i / n; xs.push(x); ys.push(F.f(x)); }
      var w = xs.map(function (xi, i) { var p = 1; for (var j = 0; j <= n; j++) if (j !== i) p *= (xi - xs[j]); return 1 / p; });
      var Pn = function (x) { var num = 0, den = 0; for (var i = 0; i <= n; i++) { var d = x - xs[i]; if (Math.abs(d) < 1e-14) return ys[i]; var t = w[i] / d; num += t * ys[i]; den += t; } return num / den; };
      var lo = st.k === 3 ? 0 : -1.2, hi = st.k === 3 ? 3 : 1.5, P = Plano([-1.1, 1.1, lo, hi]); P.ejes({ px: .5, py: .5 });
      P.curva(F.f, -1, 1, { c: K.tinta, w: 3 }); P.curva(Pn, -1, 1, { c: K.c2, w: 2.2, n: 800 });
      xs.forEach(function (x, i) { P.punto(x, ys[i], { r: 3.5, c: K.c2 }); });
      var E = 0; for (var k = 0; k <= 2000; k++) { var x = -1 + 2 * k / 2000; E = Math.max(E, Math.abs(F.f(x) - Pn(x))); }
      s.innerHTML = P.html();
      lect(c, ['error máximo ‖f − Pₙ‖∞ = ' + col(K.c2, exp10(E)), st.nodos ? 'nodos de Chebyshev: se agrupan en los extremos' : 'nodos equiespaciados: cuidado en los extremos', '(fórmula baricéntrica: estable aun con n grande)']);
    }
    pinta();
  };

  /* 5. Bernstein */
  A['bernstein'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var FS = [function (x) { return Math.abs(x - .5); }, function (x) { return Math.sin(2 * Math.PI * x) * .4 + .5; }, function (x) { return x < .4 ? .2 : .8; }, function (x) { return x * x; }];
    var st = controles(cu, [['sel', 'k', 'función', ['|x − ½|', '½ + 0,4 sen 2πx', 'escalón (discontinua)', 'x²']], ['n', 'n', 1, 200, 10]], pinta);
    function pinta() {
      var f = FS[st.k], n = st.n, P = Plano([-.05, 1.05, -.1, 1.05]); P.ejes({ px: .25, py: .25 });
      var lg = []; for (var k = 0; k <= n; k++) lg.push(k ? lg[k - 1] + Math.log(n - k + 1) - Math.log(k) : 0);
      var B = function (x) { if (x <= 0) return f(0); if (x >= 1) return f(1); var S = 0; for (var k = 0; k <= n; k++) S += f(k / n) * Math.exp(lg[k] + k * Math.log(x) + (n - k) * Math.log(1 - x)); return S; };
      P.curva(f, 0, 1, { c: K.tinta, w: 3, n: 600 }); P.curva(B, 0, 1, { c: K.c2, w: 2.2, n: 300 });
      var E = 0; for (var i = 0; i <= 400; i++) { var x = i / 400; E = Math.max(E, Math.abs(f(x) - B(x))); }
      s.innerHTML = P.html();
      lect(c, ['‖f − Bₙf‖∞ ≈ ' + col(K.c2, f2(E, 4)), st.k === 3 ? 'exacto: x(1 − x)/n = ' + f2(.25 / n, 4) + ' en x = ½' : 'converge uniformemente (si f es continua), pero despacio: O(1/√n) o O(1/n)']);
    }
    pinta();
  };

  /* 6. El h óptimo: aritmética real del navegador */
  A['h-optimo'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'fórmula', ['progresiva  (f(x+h) − f(x))/h', 'punto medio  (f(x+h) − f(x−h))/2h', 'cinco puntos', 'segunda derivada  (f(x−h) − 2f(x) + f(x+h))/h²']], ['L', 'h = 10^L, L', -15, 0, -5, .1]], pinta);
    var f = Math.exp, x0 = 1, ex = Math.E;
    var FO = [function (h) { return (f(x0 + h) - f(x0)) / h; }, function (h) { return (f(x0 + h) - f(x0 - h)) / (2 * h); }, function (h) { return (f(x0 - 2 * h) - 8 * f(x0 - h) + 8 * f(x0 + h) - f(x0 + 2 * h)) / (12 * h); }, function (h) { return (f(x0 - h) - 2 * f(x0) + f(x0 + h)) / (h * h); }];
    function pinta() {
      var F = FO[st.k], P = Plano([-16, 0, -14, 2]); P.ejes({ px: 2, py: 2, fx: function (x) { return '10' + sup(x); } });
      var d = '', mejor = [1e9, 0];
      for (var i = 0; i <= 600; i++) { var L = -16 + 16 * i / 600, h = Math.pow(10, L), e = Math.abs(F(h) - ex), y = e > 0 ? Math.log10(e) : -16; if (y < mejor[0]) mejor = [y, L]; y = Math.max(-14, Math.min(2, y)); d += (d ? 'L' : 'M') + P.X(L).toFixed(1) + ',' + P.Y(y).toFixed(1); }
      P.put('<path d="' + d + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.6"/>');
      var h = Math.pow(10, st.L), e = Math.abs(F(h) - ex); P.punto(st.L, Math.max(-14, Math.log10(e || 1e-16)), { c: K.c1, r: 5.5 });
      P.texto(-15.6, 1.2, 'log₁₀ |error| para f = eˣ en x = 1', { a: 'start', s: 13, it: true });
      s.innerHTML = P.html();
      lect(c, ['h = ' + exp10(h) + ' → aproximación ' + col(K.c1, f2(F(h), 12)), 'error ' + exp10(e), 'mejor h ≈ 10' + sup(Math.round(mejor[1])) + ', error ≈ 10' + sup(Math.round(mejor[0]))]);
    }
    pinta();
  };

  /* 7. Reglas compuestas */
  var FI = [{ n: 'sen x en [0, π]', f: Math.sin, a: 0, b: Math.PI, I: 2, v: [-.2, 3.4, -.2, 1.2] },
            { n: 'eˣ en [0, 1]', f: Math.exp, a: 0, b: 1, I: Math.E - 1, v: [-.1, 1.1, -.2, 3] },
            { n: '√x en [0, 1] (no suave en 0)', f: Math.sqrt, a: 0, b: 1, I: 2 / 3, v: [-.1, 1.1, -.1, 1.1] },
            { n: '1 + sen²(2x) en [0, π] (periódica)', f: function (x) { var s2 = Math.sin(2 * x); return 1 + s2 * s2; }, a: 0, b: Math.PI, I: 1.5 * Math.PI, v: [-.2, 3.4, -.2, 2.2] }];
  function compuesta(f, a, b, n, r) {
    var h = (b - a) / n, S = 0, i;
    if (r === 0) { for (i = 1; i < n; i++) S += f(a + i * h); return h * (S + (f(a) + f(b)) / 2); }
    if (r === 1) { for (i = 0; i < n; i++) S += f(a + (i + .5) * h); return h * S; }
    if (n % 2) n++; h = (b - a) / n; S = f(a) + f(b); for (i = 1; i < n; i++) S += (i % 2 ? 4 : 2) * f(a + i * h); return h * S / 3;
  }
  A['cuadratura'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = controles(cu, [['sel', 'k', 'integral', FI.map(function (x) { return x.n; })], ['sel', 'r', 'regla', ['trapecio', 'punto medio', 'Simpson']], ['n', 'n', 1, 64, 4]], pinta);
    function pinta() {
      var F = FI[st.k], f = F.f, n = st.r === 2 && st.n % 2 ? st.n + 1 : st.n, h = (F.b - F.a) / n, P = Plano(F.v); P.ejes({ ticks: false });
      for (var i = 0; i < n; i++) {
        var x0 = F.a + i * h, x1 = x0 + h;
        if (st.r === 0) P.put('<path d="M' + P.X(x0) + ',' + P.Y(0) + 'L' + P.X(x0) + ',' + P.Y(f(x0)) + 'L' + P.X(x1) + ',' + P.Y(f(x1)) + 'L' + P.X(x1) + ',' + P.Y(0) + 'Z" fill="' + K.c2 + '" fill-opacity=".22" stroke="' + K.c2 + '" stroke-width=".8"/>');
        else if (st.r === 1) P.rect(x0, x1, 0, f((x0 + x1) / 2), { f: K.c2, fo: .22, c: K.c2, w: .8 });
        else if (i % 2 === 0) { var xm = x1, x2 = x0 + 2 * h, y0 = f(x0), y1 = f(xm), y2 = f(x2), q = function (x) { return y0 * (x - xm) * (x - x2) / ((x0 - xm) * (x0 - x2)) + y1 * (x - x0) * (x - x2) / ((xm - x0) * (xm - x2)) + y2 * (x - x0) * (x - xm) / ((x2 - x0) * (x2 - xm)); }; P.area(q, x0, x2, { f: K.c2, fo: .22, n: 30 }); P.seg(x0, 0, x0, y0, { c: K.c2, w: .8 }); }
      }
      P.curva(f, F.v[0], F.v[1], { c: K.c1, w: 2.6 });
      s.innerHTML = P.html();
      var filas = [['n', 'trapecio', 'punto medio', 'Simpson']]; [2, 4, 8, 16, 32, 64].forEach(function (m) { filas.push([m, exp10(Math.abs(compuesta(f, F.a, F.b, m, 0) - F.I)), exp10(Math.abs(compuesta(f, F.a, F.b, m, 1) - F.I)), exp10(Math.abs(compuesta(f, F.a, F.b, m, 2) - F.I))]); });
      tabla(c, filas);
      var A_ = compuesta(f, F.a, F.b, n, st.r);
      lect(c, ['aproximación ' + col(K.c2, f2(A_, 10)), 'exacto ' + col(K.c1, f2(F.I, 10)), 'error ' + exp10(Math.abs(A_ - F.I)) + ' (tabla: errores al duplicar n)']);
    }
    pinta();
  };

  /* 8. Cuadratura adaptativa */
  A['adaptativa'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var f = function (x) { return 100 / (x * x) * Math.sin(10 / x); };
    var st = controles(cu, [['L', 'tolerancia 10^L, L', -8, -1, -4, 1]], pinta);
    function S(a, b) { return (b - a) / 6 * (f(a) + 4 * f((a + b) / 2) + f(b)); }
    function pinta() {
      var tol = Math.pow(10, st.L), ints = [], ev = 0;
      function rec(a, b, t, Sab, prof) { var m = (a + b) / 2, l = S(a, m), r = S(m, b); ev += 2; if (Math.abs(Sab - l - r) < 15 * t || prof > 40) { ints.push([a, b]); return l + r; } return rec(a, m, t / 2, l, prof + 1) + rec(m, b, t / 2, r, prof + 1); }
      var I = rec(1, 3, tol, S(1, 3), 0), ex = -1.4260247818, P = Plano([.95, 3.05, -75, 75]); P.ejes({ px: .5, py: 25 });
      ints.forEach(function (it) { P.seg(it[0], -72, it[0], 72, { c: K.c2, w: .6 }); });
      P.curva(f, 1, 3, { c: K.c1, w: 2, n: 1500 });
      s.innerHTML = P.html();
      lect(c, ['∫₁³ (100/x²) sen(10/x) dx ≈ ' + col(K.c2, f2(I, 9)), 'subintervalos: ' + ints.length + ' · evaluaciones: ' + (ev + 3), 'error real ' + exp10(Math.abs(I - ex))]);
    }
    pinta();
  };

  /* 9. Gauss */
  function legendre(n) { // nodos y pesos por Newton sobre Pₙ
    var xs = [], ws = [];
    for (var i = 1; i <= n; i++) {
      var x = Math.cos(Math.PI * (i - .25) / (n + .5)), dp = 0;
      for (var it = 0; it < 100; it++) { var p0 = 1, p1 = x; for (var k = 2; k <= n; k++) { var p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; } var pn = n === 0 ? 1 : (n === 1 ? x : p1), pm = n === 1 ? 1 : p0; dp = n * (x * pn - pm) / (x * x - 1); var dx = pn / dp; x -= dx; if (Math.abs(dx) < 1e-16) break; }
      xs.push(x); ws.push(2 / ((1 - x * x) * dp * dp));
    }
    return [xs, ws];
  }
  A['gauss'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var FG = [{ n: 'eˣ', f: Math.exp, I: Math.E - 1 / Math.E }, { n: 'cos(πx/2)', f: function (x) { return Math.cos(Math.PI * x / 2); }, I: 4 / Math.PI }, { n: '1/(1 + 25x²)', f: function (x) { return 1 / (1 + 25 * x * x); }, I: .4 * Math.atan(5) }, { n: 'x⁸', f: function (x) { return Math.pow(x, 8); }, I: 2 / 9 }];
    var st = controles(cu, [['sel', 'k', 'f en [−1, 1]', FG.map(function (x) { return x.n; })], ['n', 'nodos n', 1, 12, 3]], pinta);
    function pinta() {
      var F = FG[st.k], n = st.n, L = legendre(n), xs = L[0], ws = L[1], G = 0; xs.forEach(function (x, i) { G += ws[i] * F.f(x); });
      var P = Plano([-1.15, 1.15, -.3, 1.25]); P.ejes({ px: .5, py: .5 });
      var Pn = function (x) { var p0 = 1, p1 = x; if (n === 1) return x; for (var k = 2; k <= n; k++) { var p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; } return p1; };
      P.curva(Pn, -1, 1, { c: K.gris, w: 1.6 }); P.texto(1.08, Pn(1) > 1.2 ? 1.15 : Pn(1), 'Pₙ', { s: 13, c: K.gris });
      xs.forEach(function (x, i) { P.rect(x - .012, x + .012, 0, ws[i], { f: K.c2, fo: .8 }); P.punto(x, 0, { r: 4, c: K.c1 }); });
      s.innerHTML = P.html();
      var Sm = compuesta(F.f, -1, 1, n % 2 ? n + 1 : n, 2);
      lect(c, ['Gauss con ' + n + ' nodos: error ' + col(K.c2, exp10(Math.abs(G - F.I))), 'Simpson con ~' + (n % 2 ? n + 2 : n + 1) + ' evaluaciones: error ' + exp10(Math.abs(Sm - F.I)), 'barras: los pesos (todos positivos, suman 2)']);
    }
    pinta();
  };

  /* 10. Euler, Euler modificado y RK4 */
  A['euler'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var f = function (t, y) { return y - t * t + 1; }, Y = function (t) { return (t + 1) * (t + 1) - .5 * Math.exp(t); };
    var st = controles(cu, [['N', 'pasos N (h = 2/N)', 2, 80, 10]], pinta);
    function metodo(m, N) {
      var h = 2 / N, w = .5, t = 0, pts = [[0, w]];
      for (var i = 0; i < N; i++) {
        if (m === 0) w += h * f(t, w);
        else if (m === 1) { var k = f(t, w); w += h / 2 * (k + f(t + h, w + h * k)); }
        else { var k1 = h * f(t, w), k2 = h * f(t + h / 2, w + k1 / 2), k3 = h * f(t + h / 2, w + k2 / 2), k4 = h * f(t + h, w + k3); w += (k1 + 2 * k2 + 2 * k3 + k4) / 6; }
        t += h; pts.push([t, w]);
      }
      return pts;
    }
    function pinta() {
      var P = Plano([-.05, 2.1, 0, 5.6]); P.ejes({ px: .5, py: 1 }); P.curva(Y, 0, 2, { c: K.tinta, w: 3 });
      var cols = [K.c3, K.c4, K.c2], fin = [];
      [0, 1, 2].forEach(function (m) { var pts = metodo(m, st.N); P.put('<path d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + P.X(p[0]) + ',' + P.Y(p[1]); }).join('') + '" fill="none" stroke="' + cols[m] + '" stroke-width="2"/>'); if (st.N <= 20) pts.forEach(function (p) { P.punto(p[0], p[1], { r: 2.8, c: cols[m] }); }); fin.push(Math.abs(pts[pts.length - 1][1] - Y(2))); });
      P.texto(.05, 5.3, 'y′ = y − t² + 1,  y(0) = 0,5', { a: 'start', s: 13, it: true });
      s.innerHTML = P.html();
      var filas = [['N', 'Euler', 'Euler mod.', 'RK4']]; [5, 10, 20, 40, 80].forEach(function (N) { filas.push([N].concat([0, 1, 2].map(function (m) { var p = metodo(m, N); return exp10(Math.abs(p[N][1] - Y(2))); }))); }); tabla(c, filas);
      lect(c, [col(K.c3, 'Euler') + ' error ' + exp10(fin[0]) + ' (orden 1)', col(K.c4, 'Euler mod.') + ' ' + exp10(fin[1]) + ' (orden 2)', col(K.c2, 'RK4') + ' ' + exp10(fin[2]) + ' (orden 4)']);
    }
    pinta();
  };

  /* 11. Rigidez y región de estabilidad */
  A['rigida'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 330);
    var st = controles(cu, [['h', 'h', .005, .12, .1, .005], ['sel', 'm', 'método', ['Euler explícito', 'Euler implícito', 'RK4']]], pinta);
    var lam = -30;
    function pinta() {
      var h = st.h, z = h * lam, Q = [function (z) { return 1 + z; }, function (z) { return 1 / (1 - z); }, function (z) { return 1 + z + z * z / 2 + z * z * z / 6 + z * z * z * z / 24; }][st.m];
      var P = Plano([0, 1, -1.2, 1.2], 380, 300, 0, 10); P.ejes({ px: .25, py: .5 }); P.curva(function (t) { return Math.exp(lam * t); }, 0, 1, { c: K.tinta, w: 2.5 });
      var w = 1, d = 'M' + P.X(0) + ',' + P.Y(1), t = 0; while (t < 1 - 1e-9) { w *= Q(z); t += h; d += 'L' + P.X(t) + ',' + P.Y(Math.max(-1.3, Math.min(1.3, w))); }
      P.put('<path d="' + d + '" fill="none" stroke="' + K.c2 + '" stroke-width="2"/>');
      // región de estabilidad en el plano complejo
      var R = Plano([-5, 2, -3.5, 3.5], 230, 230, 400, 40), cel = '';
      for (var i = 0; i < 70; i++) for (var j = 0; j < 70; j++) {
        var x = -5 + 7 * (i + .5) / 70, y = -3.5 + 7 * (j + .5) / 70, re, im;
        if (st.m === 0) { re = 1 + x; im = y; } else if (st.m === 1) { var dr = 1 - x, di = -y, dd = dr * dr + di * di; re = dr / dd; im = -di / dd; }
        else { var zr = x, zi = y, pr = 1, pi = 0, tr = 1, ti = 0; for (var k = 1; k <= 4; k++) { var nr = (tr * zr - ti * zi) / k, ni = (tr * zi + ti * zr) / k; tr = nr; ti = ni; pr += tr; pi += ti; } re = pr; im = pi; }
        if (re * re + im * im < 1) cel += '<rect x="' + R.X(x - .05).toFixed(1) + '" y="' + R.Y(y + .05).toFixed(1) + '" width="3.4" height="3.4" fill="' + K.c1 + '" fill-opacity=".35"/>';
      }
      R.put(cel); R.ejes({ ticks: false }); var zz = Math.max(-5, z); R.punto(zz, 0, { c: K.c2, r: 5 }); R.texto(-4.8, 3.2, 'región |Q(hλ)| < 1', { a: 'start', s: 12 });
      s.innerHTML = P.html() + R.html();
      lect(c, ['y′ = −30y, hλ = ' + f2(z, 2), '|Q(hλ)| = ' + f2(Math.abs(Q(z)), 3) + (Math.abs(Q(z)) < 1 ? ' < 1: estable' : ' > 1: ¡explota!'), st.m === 0 ? 'Euler necesita h < 1/15 ≈ 0,0667' : st.m === 1 ? 'implícito: estable para todo h' : 'RK4 necesita h < 2,785/30 ≈ 0,093']);
    }
    pinta();
  };

  /* 12. Métodos iterativos en el plano */
  A['iterativos'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420);
    var SIS = [{ n: '4x − y = 3, −x + 4y = 3', A: [[4, -1], [-1, 4]], b: [3, 3] }, { n: '2x − y = 1, −x + 2y = 1', A: [[2, -1], [-1, 2]], b: [1, 1] }, { n: '4x + y = 1, x + 3y = 2', A: [[4, 1], [1, 3]], b: [1, 2] }, { n: 'x + 2y = 3, 2x + y = 3 (no dominante)', A: [[1, 2], [2, 1]], b: [3, 3] }];
    var st = controles(cu, [['sel', 'k', 'sistema', SIS.map(function (x) { return x.n; })], ['sel', 'm', 'método', ['Jacobi', 'Gauss–Seidel', 'gradiente conjugado']], ['n', 'iteraciones', 1, 25, 6]], pinta);
    function pinta() {
      var S = SIS[st.k], A_ = S.A, b = S.b, det = A_[0][0] * A_[1][1] - A_[0][1] * A_[1][0], sol = [(b[0] * A_[1][1] - A_[0][1] * b[1]) / det, (A_[0][0] * b[1] - A_[1][0] * b[0]) / det];
      var v = [sol[0] - 1.6, sol[0] + 1.6, sol[1] - 1.6, sol[1] + 1.6], P = Plano(v, 420, 400, 110, 10);
      // curvas de nivel de g (si es SPD)
      var spd = A_[0][1] === A_[1][0] && A_[0][0] > 0 && det > 0;
      if (spd) for (var lv = 1; lv <= 8; lv++) { var r = .2 * lv, d = ''; for (var q = 0; q <= 80; q++) { var th = 2 * Math.PI * q / 80, u = [Math.cos(th), Math.sin(th)], qq = u[0] * (A_[0][0] * u[0] + A_[0][1] * u[1]) + u[1] * (A_[1][0] * u[0] + A_[1][1] * u[1]), rr = r * Math.sqrt(4 / qq); d += (q ? 'L' : 'M') + P.X(sol[0] + rr * u[0]) + ',' + P.Y(sol[1] + rr * u[1]); } P.put('<path d="' + d + '" fill="none" stroke="#cfc0ec" stroke-width="1"/>'); }
      P.curva(function (x) { return (b[0] - A_[0][0] * x) / A_[0][1]; }, v[0], v[1], { c: K.gris, w: 1.2, dash: '4 3' }); P.curva(function (x) { return (b[1] - A_[1][0] * x) / A_[1][1]; }, v[0], v[1], { c: K.gris, w: 1.2, dash: '4 3' });
      var x = [sol[0] - 1.4, sol[1] - 1.1], pts = [x.slice()], rr0 = null, p = null;
      for (var it = 0; it < st.n; it++) {
        if (st.m === 0) x = [(b[0] - A_[0][1] * x[1]) / A_[0][0], (b[1] - A_[1][0] * x[0]) / A_[1][1]];
        else if (st.m === 1) { var x0 = (b[0] - A_[0][1] * x[1]) / A_[0][0]; x = [x0, (b[1] - A_[1][0] * x0) / A_[1][1]]; }
        else { var r_ = [b[0] - A_[0][0] * x[0] - A_[0][1] * x[1], b[1] - A_[1][0] * x[0] - A_[1][1] * x[1]], rr = r_[0] * r_[0] + r_[1] * r_[1]; if (rr < 1e-28) { pts.push(x.slice()); continue; } p = p ? [r_[0] + rr / rr0 * p[0], r_[1] + rr / rr0 * p[1]] : r_; var Ap = [A_[0][0] * p[0] + A_[0][1] * p[1], A_[1][0] * p[0] + A_[1][1] * p[1]], al = rr / (p[0] * Ap[0] + p[1] * Ap[1]); x = [x[0] + al * p[0], x[1] + al * p[1]]; rr0 = rr; }
        if (!isFinite(x[0]) || Math.abs(x[0]) > 1e6) break; pts.push(x.slice());
      }
      P.put('<path d="' + pts.map(function (q, i) { return (i ? 'L' : 'M') + P.X(q[0]) + ',' + P.Y(q[1]); }).join('') + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.8"/>');
      pts.forEach(function (q) { P.punto(q[0], q[1], { r: 3, c: K.c2 }); }); P.punto(sol[0], sol[1], { c: K.c1, r: 5.5 });
      s.innerHTML = P.html();
      var D = [A_[0][0], A_[1][1]], rJ = Math.sqrt(Math.abs(A_[0][1] * A_[1][0] / (D[0] * D[1]))), rG = rJ * rJ, e = Math.hypot(x[0] - sol[0], x[1] - sol[1]);
      lect(c, ['solución (' + f2(sol[0], 4) + ', ' + f2(sol[1], 4) + ')', 'ρ(T_J) = ' + f2(rJ, 4) + ', ρ(T_G) = ' + f2(rG, 4) + (rJ >= 1 ? ' ≥ 1: ¡no converge!' : ''), 'error tras ' + st.n + ': ' + col(K.c2, exp10(e)) + (st.m === 2 ? ' (CG termina en 2 pasos)' : '')]);
    }
    pinta();
  };

  /* 13. PageRank: el método de la potencia */
  A['pagerank'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 360);
    var nodos = [[90, 80], [250, 60], [180, 200], [60, 280], [300, 260]], ar = [[0, 1], [0, 2], [1, 2], [2, 0], [3, 2], [3, 0], [4, 2], [1, 4], [2, 4]];
    var st = controles(cu, [['al', 'α (seguir un enlace)', 0, 1, .85, .01], ['k', 'iteraciones k', 0, 40, 0]], pinta), b = botonAnim(cu, '▶ Iterar');
    animador(b);
    function animador(bt) { var on = false; bt.addEventListener('click', function () { on = !on; bt.textContent = on ? '❚❚' : '▶ Iterar'; var paso = function () { if (!on) return; if (st.k >= 40) { on = false; bt.textContent = '▶ Iterar'; return; } fijaSlider(cu, 'iteraciones k', st.k + 1); setTimeout(paso, 260); }; paso(); }); }
    function pinta() {
      var N = 5, sal = [0, 0, 0, 0, 0]; ar.forEach(function (a) { sal[a[0]]++; });
      var x = [.2, .2, .2, .2, .2], hist = [x];
      for (var k = 0; k < st.k; k++) { var y = [0, 0, 0, 0, 0]; ar.forEach(function (a) { y[a[1]] += st.al * x[a[0]] / sal[a[0]]; }); for (var i = 0; i < N; i++) y[i] += (1 - st.al) / N; x = y; hist.push(x); }
      var h = '';
      ar.forEach(function (a) { var p = nodos[a[0]], q = nodos[a[1]], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, x1 = p[0] + ux * 24, y1 = p[1] + uy * 24, x2 = q[0] - ux * 28, y2 = q[1] - uy * 28; h += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#9aa" stroke-width="1.4"/><path d="M' + x2 + ',' + y2 + 'l' + (-ux * 9 - uy * 4) + ',' + (-uy * 9 + ux * 4) + 'l' + (uy * 8) + ',' + (-ux * 8) + 'z" fill="#9aa"/>'; });
      nodos.forEach(function (p, i) { var r = 12 + 60 * x[i]; h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + K.c1 + '" fill-opacity=".85"/>' + '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">' + 'ABCDE'[i] + '</text>'; });
      for (var i2 = 0; i2 < N; i2++) { var y0 = 50 + 56 * i2; h += tx(400, y0 + 10, 'ABCDE'[i2], { s: 14, b: true }) + '<rect x="415" y="' + y0 + '" width="' + (200 * x[i2] / .5) + '" height="20" fill="' + K.c2 + '" fill-opacity=".75"/>' + tx(420 + 200 * x[i2] / .5 + 26, y0 + 10, f2(x[i2], 4), { s: 12 }); }
      s.innerHTML = h;
      var dif = 0; if (hist.length > 1) { var pr = hist[hist.length - 2]; for (var j = 0; j < N; j++) dif += Math.abs(x[j] - pr[j]); }
      lect(c, ['π⁽ᵏ⁾ = G π⁽ᵏ⁻¹⁾', 'cambio en el último paso ' + exp10(dif || 0), '|λ₂| ≤ α: converge como α^k']);
    }
    pinta();
  };

  /* ---------- portada: cuencas de Newton en el plano complejo (interactiva) ---------- */
  function portada(cv) {
    var hero = cv.parentNode, ctl = document.createElement('div'); ctl.className = 'portada-ctl';
    var POL = [
      { n: 'z³ − 1', c: [-1, 0, 0, 1] },
      { n: 'z⁴ − 1', c: [-1, 0, 0, 0, 1] },
      { n: 'z³ − 2z + 2', c: [2, -2, 0, 1] },
      { n: 'z⁵ − 1', c: [-1, 0, 0, 0, 0, 1] }];
    ctl.innerHTML = '<div class="pc-fila">' + POL.map(function (o, i) { return '<button type="button" data-f="' + i + '"' + (i ? '' : ' class="on"') + '>' + o.n + '</button>'; }).join('') + '</div>' +
      '<div class="pc-fila"><button type="button" data-z="1">acercar +</button><button type="button" data-z="-1">alejar −</button><button type="button" data-r="1">reiniciar</button></div><div class="pc-ayuda">Toca un punto para ver su órbita de Newton · doble clic para acercar allí</div>';
    hero.appendChild(ctl);
    var W = 460, H = 380, dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = cv.getContext('2d'), fi = 0, cx = 0, cy = 0, esc = 2.4, orbita = null, img = null, raices = [];
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var PAL = [[243, 197, 107], [192, 57, 122], [124, 92, 214], [72, 187, 200], [140, 210, 120]];
    function evalua(c, zr, zi) { var pr = 0, pi = 0, dr = 0, di = 0; for (var k = c.length - 1; k >= 0; k--) { var ndr = dr * zr - di * zi + pr, ndi = dr * zi + di * zr + pi; dr = ndr; di = ndi; var npr = pr * zr - pi * zi + c[k], npi = pr * zi + pi * zr; pr = npr; pi = npi; } return [pr, pi, dr, di]; }
    function paso(c, zr, zi) { var v = evalua(c, zr, zi), d = v[2] * v[2] + v[3] * v[3]; if (d < 1e-30) return null; return [zr - (v[0] * v[2] + v[1] * v[3]) / d, zi - (v[1] * v[2] - v[0] * v[3]) / d]; }
    function calculaRaices(c) { var rs = [], n = c.length - 1; for (var k = 0; k < 400 && rs.length < n; k++) { var a = 2 * Math.PI * k / 37.3, z = [1.7 * Math.cos(a) * (1 + k / 400), 1.7 * Math.sin(a) * (1 + k / 400)]; for (var it = 0; it < 80 && z; it++) z = paso(c, z[0], z[1]); if (!z) continue; var v = evalua(c, z[0], z[1]); if (Math.hypot(v[0], v[1]) > 1e-9) continue; if (!rs.some(function (r) { return Math.hypot(r[0] - z[0], r[1] - z[1]) < 1e-6; })) rs.push(z); } return rs; }
    function aPlano(px, py) { return [cx + (px - W / 2) / W * esc * 2, cy - (py - H / 2) / W * esc * 2]; }
    function aPix(z) { return [W / 2 + (z[0] - cx) / (esc * 2) * W, H / 2 - (z[1] - cy) / (esc * 2) * W]; }
    var token = 0;
    function dibuja() {
      var c = POL[fi].c, my = ++token; raices = calculaRaices(c);
      var Wp = Math.round(W * dpr), Hp = Math.round(H * dpr), data = ctx.createImageData(Wp, Hp), fila = 0;
      (function tanda() {
        if (my !== token) return;
        var fin = Math.min(Hp, fila + 40);
        for (var py = fila; py < fin; py++) for (var px = 0; px < Wp; px++) {
          var z = aPlano(px / dpr, py / dpr), r = -1, it;
          for (it = 0; it < 60; it++) { var nz = paso(c, z[0], z[1]); if (!nz) break; z = nz; for (var j = 0; j < raices.length; j++) if (Math.abs(z[0] - raices[j][0]) + Math.abs(z[1] - raices[j][1]) < 1e-6) { r = j; break; } if (r >= 0) break; }
          var o = 4 * (py * Wp + px), col = r >= 0 ? PAL[r % PAL.length] : [20, 12, 40], sh = r >= 0 ? Math.max(.18, 1 - it / 26) : 1;
          data.data[o] = col[0] * sh; data.data[o + 1] = col[1] * sh; data.data[o + 2] = col[2] * sh; data.data[o + 3] = 255;
        }
        fila = fin; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(data, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (fila < Hp) requestAnimationFrame(tanda); else { img = data; capa(); }
      })();
    }
    function capa() {
      if (img) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(img, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      raices.forEach(function (r) { var p = aPix(r); ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); });
      if (orbita) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); orbita.forEach(function (z, i) { var p = aPix(z); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); orbita.forEach(function (z, i) { var p = aPix(z); ctx.beginPath(); ctx.arc(p[0], p[1], i ? 2.6 : 4.5, 0, 7); ctx.fillStyle = i ? '#fff' : '#ffd27a'; ctx.fill(); }); }
      ctx.font = 'italic 14px Palatino Linotype,Palatino,Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'right'; ctx.fillText('zₙ₊₁ = zₙ − p(zₙ)/p′(zₙ),  p(z) = ' + POL[fi].n, W - 10, 20);
    }
    cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(), z = aPlano((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height), c = POL[fi].c; orbita = [z]; for (var i = 0; i < 30; i++) { z = paso(c, z[0], z[1]); if (!z || Math.abs(z[0]) > 50) break; orbita.push(z); } capa(); });
    cv.addEventListener('dblclick', function (e) { var r = cv.getBoundingClientRect(), z = aPlano((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height); cx = z[0]; cy = z[1]; esc /= 2.5; orbita = null; dibuja(); });
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.f) { fi = +b.dataset.f; ctl.querySelectorAll('[data-f]').forEach(function (x) { x.classList.toggle('on', +x.dataset.f === fi); }); }
      if (b.dataset.z) esc *= (+b.dataset.z > 0 ? .5 : 2);
      if (b.dataset.r) { cx = 0; cy = 0; esc = 2.4; }
      orbita = null; dibuja();
    });
    cv.style.cursor = 'crosshair';
    dibuja();
  }

  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('canvas.fractal'); if (p) portada(p);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

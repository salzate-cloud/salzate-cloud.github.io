/* Cálculo Diferencial — graficador y figuras interactivas (SVG puro) */
(function () {
  'use strict';
  var K = { azul: '#22357E', azulM: '#3d55b8', verde: '#0E6B62', ambar: '#9A5B08', ambarV: '#d98a1c', rosa: '#9F1239', gris: '#7b8394', tinta: '#1d2233' };
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, h) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h !== undefined) e.innerHTML = h; return e; }
  function f2(x, d) { if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—'; d = d === undefined ? 3 : d; var s = (+x.toFixed(d)).toString(); return s.replace('-', '−').replace('.', ','); }

  /* ---------- analizador de expresiones en x ---------- */
  function compila(src) {
    var s = src.toLowerCase().replace(/\s+/g, '').replace(/sen/g, 'sin').replace(/tg/g, 'tan').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/·|×/g, '*').replace(/−/g, '-').replace(/,/g, '.');
    var i = 0;
    var F = { sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: function (x) { return Math.log(x) / Math.LN10; }, exp: Math.exp,
      asin: Math.asin, acos: Math.acos, atan: Math.atan, sec: function (x) { return 1 / Math.cos(x); }, csc: function (x) { return 1 / Math.sin(x); }, cot: function (x) { return 1 / Math.tan(x); } };
    function mira() { return s[i]; }
    function expr() { var a = term(); while (mira() === '+' || mira() === '-') { var o = s[i++], b = term(); a = (function (a, b, o) { return o === '+' ? function (x) { return a(x) + b(x); } : function (x) { return a(x) - b(x); }; })(a, b, o); } return a; }
    function term() {
      var a = unario();
      while (true) {
        var c = mira();
        if (c === '*' || c === '/') { i++; var b = unario(); a = (function (a, b, c) { return c === '*' ? function (x) { return a(x) * b(x); } : function (x) { return a(x) / b(x); }; })(a, b, c); }
        else if (c && /[a-z(0-9.]/.test(c)) { var b2 = unario(); a = (function (a, b) { return function (x) { return a(x) * b(x); }; })(a, b2); }
        else return a;
      }
    }
    function unario() { if (mira() === '-') { i++; var a = unario(); return function (x) { return -a(x); }; } if (mira() === '+') { i++; return unario(); } return pot(); }
    function pot() { var a = at(); if (mira() === '^') { i++; var b = unario(); return function (x) { return Math.pow(a(x), b(x)); }; } return a; }
    function at() {
      var c = mira();
      if (c === '(') { i++; var e = expr(); if (s[i++] !== ')') throw new Error('Falta un paréntesis'); return e; }
      var m = /^[0-9]*\.?[0-9]+(e[-+]?[0-9]+)?/.exec(s.slice(i));
      if (m) { i += m[0].length; var v = +m[0]; return function () { return v; }; }
      m = /^[a-z]+/.exec(s.slice(i));
      if (m) {
        var w = m[0];
        // separar nombres pegados: "xsin" -> x, sin
        var nombres = Object.keys(F).sort(function (a, b) { return b.length - a.length; });
        if (w === 'x') { i++; return function (x) { return x; }; }
        if (w === 'pi') { i += 2; return function () { return Math.PI; }; }
        if (w === 'e') { i++; return function () { return Math.E; }; }
        for (var k = 0; k < nombres.length; k++) if (w.indexOf(nombres[k]) === 0) {
          i += nombres[k].length; var fn = F[nombres[k]], ex = null;
          if (mira() === '^') { i++; ex = at(); }   // sin^2(x)
          var arg = at();
          return ex ? function (x) { return Math.pow(fn(arg(x)), ex(x)); } : function (x) { return fn(arg(x)); };
        }
        if (w[0] === 'x') { i++; return function (x) { return x; }; }
        if (w[0] === 'e') { i++; return function () { return Math.E; }; }
        throw new Error('No reconozco «' + w + '»');
      }
      throw new Error(c ? 'No entiendo «' + c + '»' : 'La expresión está incompleta');
    }
    var f = expr(); if (i < s.length) throw new Error('Sobra «' + s.slice(i) + '»');
    return f;
  }
  function deriv(f, x) { var h = 1e-5 * Math.max(1, Math.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }
  function deriv2(f, x) { var h = 1e-3 * Math.max(1, Math.abs(x)); return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h); }

  /* ---------- plano cartesiano en SVG ---------- */
  function Plano(svg, v) {
    var W = v.W || 640, H = v.H || 380; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var P = { v: v, W: W, H: H, buf: [],
      X: function (x) { return (x - v[0]) / (v[1] - v[0]) * W; }, Y: function (y) { return H - (y - v[2]) / (v[3] - v[2]) * H; },
      ix: function (px) { return v[0] + px / W * (v[1] - v[0]); }, iy: function (py) { return v[2] + (H - py) / H * (v[3] - v[2]); },
      put: function (t) { this.buf.push(t); },
      ejes: function () {
        var self = this, paso = escala(v[1] - v[0]), pasoy = escala(v[3] - v[2]);
        for (var x = Math.ceil(v[0] / paso) * paso; x <= v[1]; x += paso) this.put('<line x1="' + this.X(x) + '" y1="0" x2="' + this.X(x) + '" y2="' + H + '" stroke="#eef1f7"/>');
        for (var y = Math.ceil(v[2] / pasoy) * pasoy; y <= v[3]; y += pasoy) this.put('<line x1="0" y1="' + this.Y(y) + '" x2="' + W + '" y2="' + this.Y(y) + '" stroke="#eef1f7"/>');
        if (v[2] < 0 && v[3] > 0) this.put('<line x1="0" y1="' + this.Y(0) + '" x2="' + W + '" y2="' + this.Y(0) + '" stroke="#8b93a5" stroke-width="1.3"/>');
        if (v[0] < 0 && v[1] > 0) this.put('<line x1="' + this.X(0) + '" y1="0" x2="' + this.X(0) + '" y2="' + H + '" stroke="#8b93a5" stroke-width="1.3"/>');
        var y0 = Math.min(H - 6, Math.max(12, this.Y(0) + 14)), x0 = Math.min(W - 6, Math.max(18, this.X(0) - 8));
        for (x = Math.ceil(v[0] / paso) * paso; x <= v[1]; x += paso) if (Math.abs(x) > 1e-9) this.put(t(this.X(x), y0, f2(x, 2), 11, '#8b93a5'));
        for (y = Math.ceil(v[2] / pasoy) * pasoy; y <= v[3]; y += pasoy) if (Math.abs(y) > 1e-9) this.put(t(x0, this.Y(y), f2(y, 2), 11, '#8b93a5', 'end'));
      },
      curva: function (f, o) {
        o = o || {}; var d = '', ant = null, n = o.n || 600, a = o.a !== undefined ? o.a : v[0], b = o.b !== undefined ? o.b : v[1];
        var alto = (v[3] - v[2]) * 4;
        for (var k = 0; k <= n; k++) {
          var x = a + (b - a) * k / n, y; try { y = f(x); } catch (e) { y = NaN; }
          if (!isFinite(y) || Math.abs(y - (v[2] + v[3]) / 2) > alto || (ant !== null && Math.abs(y - ant) > (v[3] - v[2]) * 1.5)) { ant = isFinite(y) ? y : null; if (!isFinite(y) || Math.abs(y - (v[2] + v[3]) / 2) > alto) { d += ' '; continue; } d += 'M' + this.X(x).toFixed(1) + ',' + this.Y(y).toFixed(1); continue; }
          d += (ant === null || d.slice(-1) === ' ' || d === '' ? 'M' : 'L') + this.X(x).toFixed(1) + ',' + this.Y(y).toFixed(1); ant = y;
        }
        this.put('<path d="' + d + '" fill="none" stroke="' + (o.c || K.azul) + '" stroke-width="' + (o.w || 2.8) + '" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + '/>');
      },
      recta: function (x1, y1, m, o) { o = o || {}; var a = v[0], b = v[1]; this.seg(a, y1 + m * (a - x1), b, y1 + m * (b - x1), o); },
      seg: function (x1, y1, x2, y2, o) { o = o || {}; this.put('<line x1="' + this.X(x1) + '" y1="' + this.Y(y1) + '" x2="' + this.X(x2) + '" y2="' + this.Y(y2) + '" stroke="' + (o.c || K.tinta) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + ' stroke-linecap="round"/>'); },
      punto: function (x, y, o) { o = o || {}; this.put('<circle cx="' + this.X(x) + '" cy="' + this.Y(y) + '" r="' + (o.r || 5) + '" fill="' + (o.hueco ? '#fff' : (o.c || K.tinta)) + '" stroke="' + (o.c || K.tinta) + '" stroke-width="2"/>'); },
      texto: function (x, y, s, o) { o = o || {}; this.put(t(this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), s, o.s || 15, o.c || K.tinta, o.a, o.b, o.it)); },
      banda: function (x1, x2, c, op) { this.put('<rect x="' + this.X(x1) + '" y="0" width="' + (this.X(x2) - this.X(x1)) + '" height="' + H + '" fill="' + c + '" opacity="' + (op || 0.1) + '"/>'); },
      bandaY: function (y1, y2, c, op) { this.put('<rect x="0" y="' + this.Y(y2) + '" width="' + W + '" height="' + (this.Y(y1) - this.Y(y2)) + '" fill="' + c + '" opacity="' + (op || 0.1) + '"/>'); },
      fin: function () { svg.innerHTML = this.buf.join(''); this.buf = []; }
    };
    return P;
  }
  function escala(r) { var p = Math.pow(10, Math.floor(Math.log10(r / 8))); var m = r / 8 / p; return p * (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10); }
  function t(x, y, s, size, c, a, b, it) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + c + '" text-anchor="' + (a || 'middle') + '" dominant-baseline="middle" font-family="Palatino Linotype,Palatino,Georgia,serif"' + (b ? ' font-weight="700"' : '') + (it ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3.5">' + s + '</text>'; }
  function svgEn(cu) { var s = document.createElementNS(NS, 'svg'); cu.appendChild(s); return s; }
  function deslizadores(cu, defs, cb) {
    var d = el('div', { class: 'ctl2d' }), st = {};
    defs.forEach(function (x) {
      var l = el('label', null, '<span>' + x[1] + '</span><input type="range" min="' + x[2] + '" max="' + x[3] + '" step="' + (x[5] || 0.1) + '" value="' + x[4] + '"><b></b>');
      var i = l.querySelector('input'), b = l.querySelector('b'); st[x[0]] = +x[4]; b.textContent = f2(+x[4], 2);
      i.addEventListener('input', function () { st[x[0]] = +i.value; b.textContent = f2(+i.value, 2); cb(st); }); d.appendChild(l);
    });
    cu.appendChild(d); return st;
  }
  function campoFormula(cu, valor, ejemplos, cb) {
    var f = el('div', { class: 'formula' }); var inp = el('input', { type: 'text', value: valor, spellcheck: 'false', 'aria-label': 'f(x)' });
    f.innerHTML = '<label style="font-size:13px;color:#4a5370;font-weight:600">f(x) =</label>'; f.appendChild(inp);
    var ej = el('div', { class: 'ejemplos' }, 'Prueba: ' + ejemplos.map(function (x) { return '<button type="button">' + x + '</button>'; }).join(''));
    f.appendChild(ej); cu.appendChild(f);
    ej.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.textContent; cb(inp.value); }); });
    inp.addEventListener('input', function () { cb(inp.value); });
    return inp;
  }
  function arrastre(svg, P, cb) { // arrastrar en horizontal sobre el plano
    var on = false;
    function mueve(e) { var r = svg.getBoundingClientRect(); cb(P.ix((e.clientX - r.left) * P.W / r.width), P.iy((e.clientY - r.top) * P.H / r.height)); }
    svg.addEventListener('pointerdown', function (e) { on = true; svg.setPointerCapture(e.pointerId); mueve(e); e.preventDefault(); });
    svg.addEventListener('pointermove', function (e) { if (on) mueve(e); });
    svg.addEventListener('pointerup', function () { on = false; });
    svg.style.cursor = 'ew-resize'; svg.style.touchAction = 'none';
  }
  var A = {};

  /* --- intervalos en la recta: |x − a| < r --- */
  A['valor-absoluto'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu), tipo = '<';
    var sel = el('div', { class: 'ctl3d' }, ['<', '≤', '>', '≥'].map(function (o, i) { return '<button type="button" class="chip' + (i ? '' : ' on') + '" data-o="' + o + '">|x − a| ' + o + ' r</button>'; }).join('')); cu.appendChild(sel);
    var st = deslizadores(cu, [['a', 'a', -5, 5, 1, 0.5], ['r', 'r', 0.5, 5, 2, 0.5]], pinta);
    sel.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { tipo = b.dataset.o; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); });
    function pinta() {
      var P = Plano(s, [-10, 10, -2, 2]); P.W = 640; P.H = 150; s.setAttribute('viewBox', '0 0 640 150');
      var X = function (x) { return 20 + (x + 10) / 20 * 600; }, y = 80, a = st.a, r = st.r, cerr = tipo === '≤' || tipo === '≥', dentro = tipo === '<' || tipo === '≤';
      var h = '<line x1="10" y1="' + y + '" x2="630" y2="' + y + '" stroke="#8b93a5" stroke-width="1.5"/>';
      for (var k = -10; k <= 10; k++) h += '<line x1="' + X(k) + '" y1="' + (y - 5) + '" x2="' + X(k) + '" y2="' + (y + 5) + '" stroke="#8b93a5"/>' + t(X(k), y + 20, f2(k), 11, '#8b93a5');
      var col = K.verde;
      if (dentro) h += '<line x1="' + X(a - r) + '" y1="' + y + '" x2="' + X(a + r) + '" y2="' + y + '" stroke="' + col + '" stroke-width="7" stroke-linecap="butt"/>';
      else h += '<line x1="10" y1="' + y + '" x2="' + X(a - r) + '" y2="' + y + '" stroke="' + col + '" stroke-width="7"/><line x1="' + X(a + r) + '" y1="' + y + '" x2="630" y2="' + y + '" stroke="' + col + '" stroke-width="7"/>';
      [a - r, a + r].forEach(function (p) { h += '<circle cx="' + X(p) + '" cy="' + y + '" r="7" fill="' + (cerr ? col : '#fff') + '" stroke="' + col + '" stroke-width="2.5"/>'; });
      h += '<circle cx="' + X(a) + '" cy="' + y + '" r="4" fill="' + K.ambar + '"/>' + t(X(a), y - 22, 'a', 15, K.ambar, 'middle', 1, 1);
      h += '<path d="M' + X(a) + ',' + (y - 36) + ' L' + X(a + r) + ',' + (y - 36) + '" stroke="' + K.ambar + '" stroke-width="1.5" marker-end=""/>' + t((X(a) + X(a + r)) / 2, y - 48, 'r', 14, K.ambar, 'middle', 0, 1);
      s.innerHTML = h;
      var izq = f2(a - r, 2), der = f2(a + r, 2);
      var res = dentro ? (cerr ? '[' : '(') + izq + ', ' + der + (cerr ? ']' : ')') : '(−∞, ' + izq + (cerr ? ']' : ')') + ' ∪ ' + (cerr ? '[' : '(') + der + ', ∞)';
      c.querySelector('.lect').innerHTML = '<span>|x − ' + f2(a, 2) + '| ' + tipo + ' ' + f2(r, 2) + '</span><span>' + (dentro ? 'la distancia de x a a es menor que r' : 'la distancia de x a a es mayor que r') + '</span><span>Solución: <b>' + res + '</b></span>';
    }
    pinta();
  };

  /* --- graficador libre --- */
  A['graficador'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s, expr = c.getAttribute('data-f') || 'x^3 - 3x', v0 = (c.getAttribute('data-v') || '-5,5,-4,4').split(',').map(Number), v = v0.slice();
    var inp = campoFormula(cu, expr, ['x^2 - 4', '(x^2 - 1)/(x - 2)', 'abs(x - 1) - 2', 'sqrt(4 - x^2)', '1/x', 'sin(x)'], function (e) { expr = e; pinta(); });
    s = svgEn(cu);
    var bar = el('div', { class: 'ctl3d' }, '<button type="button" class="chip" data-z="0.5">Acercar</button><button type="button" class="chip" data-z="2">Alejar</button><button type="button" class="chip" data-z="1">Vista inicial</button>'); cu.appendChild(bar);
    bar.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { var z = +b.dataset.z; if (z === 1) v = v0.slice(); else { var cx = (v[0] + v[1]) / 2, cy = (v[2] + v[3]) / 2; v = [cx - (cx - v[0]) * z, cx + (v[1] - cx) * z, cy - (cy - v[2]) * z, cy + (v[3] - cy) * z]; } pinta(); }); });
    var ultimo = null;
    arrastre(s, { ix: function (x) { return x; }, iy: function (y) { return y; }, W: 640, H: 380 }, function () {});
    s.style.cursor = 'crosshair';
    s.addEventListener('pointermove', function (e) { var r = s.getBoundingClientRect(); ultimo = v[0] + (e.clientX - r.left) / r.width * (v[1] - v[0]); pinta(); });
    function pinta() {
      var P = Plano(s, v); P.ejes();
      try {
        var f = compila(expr); P.curva(f);
        var info = '';
        if (ultimo !== null) { var y = f(ultimo); if (isFinite(y)) { P.seg(ultimo, 0, ultimo, y, { c: K.ambar, dash: '4 4', w: 1.4 }); P.punto(ultimo, y, { c: K.ambar }); info = '<span>f(' + f2(ultimo, 2) + ') = <b>' + f2(y, 3) + '</b></span>'; } }
        // raíces aproximadas
        var raices = []; for (var k = 0; k < 400; k++) { var a = v[0] + (v[1] - v[0]) * k / 400, b = a + (v[1] - v[0]) / 400, fa = f(a), fb = f(b); if (isFinite(fa) && isFinite(fb) && fa * fb < 0 && Math.abs(fa - fb) < (v[3] - v[2])) { for (var it = 0; it < 40; it++) { var m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } raices.push((a + b) / 2); } else if (fa === 0) raices.push(a); }
        raices.forEach(function (r) { P.punto(r, 0, { c: K.verde, r: 4 }); });
        P.fin();
        c.querySelector('.lect').innerHTML = info + '<span>Cortes con el eje x: ' + (raices.length ? raices.slice(0, 6).map(function (r) { return f2(r, 3); }).join('; ') : 'ninguno en la vista') + '</span><span>f(0) = ' + f2(f(0), 3) + '</span>';
      } catch (err) { P.fin(); c.querySelector('.lect').innerHTML = '<span class="error">' + err.message + '</span>'; }
    }
    pinta();
  };

  /* --- transformaciones a·f(b(x − h)) + k --- */
  var BASES = { 'x²': function (x) { return x * x; }, '√x': Math.sqrt, '|x|': Math.abs, 'x³': function (x) { return x * x * x; }, '1/x': function (x) { return 1 / x; }, 'sen x': Math.sin, 'eˣ': Math.exp };
  A['transformaciones'] = function (c) {
    var cu = c.querySelector('.acuerpo'), base = 'x²';
    var sel = el('div', { class: 'ctl3d' }); cu.appendChild(sel);
    Object.keys(BASES).forEach(function (k, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, 'f(x) = ' + k); b.addEventListener('click', function () { base = k; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); sel.appendChild(b); });
    var s = svgEn(cu); cu.insertBefore(s, sel);
    var st = deslizadores(cu, [['a', 'a (estira y refleja)', -3, 3, 1, 0.1], ['b', 'b (comprime)', -3, 3, 1, 0.1], ['h', 'h (horizontal)', -5, 5, 0, 0.5], ['k', 'k (vertical)', -5, 5, 0, 0.5]], pinta);
    function pinta() {
      var P = Plano(s, [-8, 8, -6, 6]), f = BASES[base];
      P.ejes(); P.curva(f, { c: K.gris, dash: '6 5', w: 2 });
      P.curva(function (x) { return st.a * f(st.b * (x - st.h)) + st.k; }, { c: K.azul, w: 3.2 });
      P.punto(st.h, st.k, { c: K.ambar, r: 4 }); P.fin();
      var txt = [];
      if (st.h) txt.push('se traslada ' + f2(Math.abs(st.h), 2) + ' a la ' + (st.h > 0 ? 'derecha' : 'izquierda'));
      if (st.k) txt.push(f2(Math.abs(st.k), 2) + ' hacia ' + (st.k > 0 ? 'arriba' : 'abajo'));
      if (st.a < 0) txt.push('se refleja en el eje x');
      if (Math.abs(st.a) !== 1 && st.a) txt.push((Math.abs(st.a) > 1 ? 'se estira' : 'se comprime') + ' verticalmente ×' + f2(Math.abs(st.a), 2));
      if (st.b < 0) txt.push('se refleja en el eje y');
      if (Math.abs(st.b) !== 1 && st.b) txt.push((Math.abs(st.b) > 1 ? 'se comprime' : 'se estira') + ' horizontalmente');
      c.querySelector('.lect').innerHTML = '<span>y = ' + f2(st.a, 2) + '·f(' + f2(st.b, 2) + '(x − ' + f2(st.h, 2) + ')) + ' + f2(st.k, 2) + '</span><span>' + (txt.length ? 'La gráfica gris ' + txt.join(', ') + '.' : 'Sin cambios: es la misma función.') + '</span>';
    }
    pinta();
  };

  /* --- función inversa: reflejo en y = x --- */
  var INV = { 'eˣ y ln x': [Math.exp, Math.log], 'x³ y ∛x': [function (x) { return x * x * x; }, Math.cbrt], 'x² (x ≥ 0) y √x': [function (x) { return x >= 0 ? x * x : NaN; }, Math.sqrt], '2ˣ y log₂ x': [function (x) { return Math.pow(2, x); }, function (x) { return Math.log(x) / Math.LN2; }], 'sen x y arcsen x': [function (x) { return Math.abs(x) <= Math.PI / 2 ? Math.sin(x) : NaN; }, Math.asin] };
  A['inversa'] = function (c) {
    var cu = c.querySelector('.acuerpo'), par = Object.keys(INV)[0], x0 = 1;
    var sel = el('div', { class: 'ctl3d' }); cu.appendChild(sel);
    Object.keys(INV).forEach(function (k, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, k); b.addEventListener('click', function () { par = k; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); sel.appendChild(b); });
    var s = svgEn(cu); cu.insertBefore(s, sel);
    var P0 = Plano(s, [-4, 6, -4, 6]); arrastre(s, P0, function (x) { x0 = x; pinta(); });
    function pinta() {
      var P = Plano(s, [-4, 6, -4, 6]), f = INV[par][0], g = INV[par][1];
      P.ejes(); P.seg(-4, -4, 6, 6, { c: K.gris, dash: '5 5', w: 1.4 }); P.texto(5.3, 5.7, 'y = x', { c: K.gris, s: 13, it: true });
      P.curva(f, { c: K.azul }); P.curva(g, { c: K.verde });
      var y0 = f(x0);
      if (isFinite(y0) && Math.abs(y0) < 8) { P.seg(x0, y0, y0, x0, { c: K.ambar, dash: '4 4', w: 1.5 }); P.punto(x0, y0, { c: K.azul }); P.punto(y0, x0, { c: K.verde }); P.texto(x0, y0, '(a, b)', { dx: -30, dy: -12, c: K.azul, s: 13 }); P.texto(y0, x0, '(b, a)', { dx: 30, dy: 12, c: K.verde, s: 13 }); }
      P.fin();
      c.querySelector('.lect').innerHTML = '<span style="color:' + K.azul + '"><b>f</b></span><span style="color:' + K.verde + '"><b>f⁻¹</b></span><span>Si (a, b) está en la gráfica de f, entonces (b, a) está en la de f⁻¹: ' + (isFinite(y0) ? '(' + f2(x0, 2) + ', ' + f2(y0, 2) + ') ↔ (' + f2(y0, 2) + ', ' + f2(x0, 2) + ')' : '—') + '</span>';
    }
    pinta();
  };

  /* --- límite: acercarse por ambos lados --- */
  var LIMS = [['sen(x)/x', 0], ['(x^2 - 4)/(x - 2)', 2], ['(1 - cos(x))/x', 0], ['abs(x)/x', 0], ['(sqrt(x + 4) - 2)/x', 0], ['x*sin(1/x)', 0]];
  A['limite'] = function (c) {
    var cu = c.querySelector('.acuerpo'), k = 0, d = 1;
    var sel = el('div', { class: 'ctl3d' }); cu.appendChild(sel);
    LIMS.forEach(function (l, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, l[0].replace('sin', 'sen') + ', x → ' + l[1]); b.addEventListener('click', function () { k = i; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); sel.appendChild(b); });
    var s = svgEn(cu); cu.insertBefore(s, sel);
    var st = deslizadores(cu, [['d', 'exponente k de h = 10ᵏ', -4, 0, 0, 0.25]], function () { pinta(); });
    function pinta() {
      var f = compila(LIMS[k][0]), a = LIMS[k][1], h = Math.pow(10, st.d), P = Plano(s, [a - 3, a + 3, -2, 5]);
      P.ejes(); P.curva(f, { c: K.azul });
      var yi = f(a - h), yd = f(a + h);
      P.punto(a - h, yi, { c: K.verde }); P.punto(a + h, yd, { c: K.rosa });
      var yl = f(a); if (!isFinite(yl)) { var L = (f(a - 1e-6) + f(a + 1e-6)) / 2; if (isFinite(L) && Math.abs(f(a - 1e-6) - f(a + 1e-6)) < 1e-3) P.punto(a, L, { hueco: true, c: K.azul }); }
      P.seg(a, -2, a, 5, { c: K.ambar, dash: '4 4', w: 1.2 }); P.fin();
      var filas = [1, 0.1, 0.01, 0.001].map(function (hh) { return '<tr><td>' + f2(a - hh, 4) + '</td><td>' + f2(f(a - hh), 5) + '</td><td>' + f2(a + hh, 4) + '</td><td>' + f2(f(a + hh), 5) + '</td></tr>'; }).join('');
      c.querySelector('.lect').innerHTML = '<span style="color:' + K.verde + '">por la izquierda f(' + f2(a - h, 5) + ') = <b>' + f2(yi, 5) + '</b></span><span style="color:' + K.rosa + '">por la derecha f(' + f2(a + h, 5) + ') = <b>' + f2(yd, 5) + '</b></span>' +
        '<table class="tablita"><tr><th>x → a⁻</th><th>f(x)</th><th>x → a⁺</th><th>f(x)</th></tr>' + filas + '</table>' + (Math.abs(yi - yd) > 0.5 ? '<span>Los límites laterales no coinciden: <b>el límite no existe</b>.</span>' : '');
    }
    pinta();
  };

  /* --- de la secante a la tangente --- */
  A['secante'] = function (c) {
    var cu = c.querySelector('.acuerpo'), expr = 'x^2/2 + 1', a = 1;
    campoFormula(cu, expr, ['x^2/2 + 1', 'sin(x) + 2', 'sqrt(x)', 'x^3/4 - x + 2', 'exp(x/2)'], function (e) { expr = e; pinta(); });
    var s = svgEn(cu);
    var P0 = Plano(s, [-3, 5, -1, 6]); arrastre(s, P0, function (x) { a = x; pinta(); });
    var st = deslizadores(cu, [['h', 'h', -2.5, 2.5, 1.5, 0.01]], pinta);
    function pinta() {
      var P = Plano(s, [-3, 5, -1, 6]);
      try {
        var f = compila(expr), h = Math.abs(st.h) < 1e-6 ? 1e-6 : st.h, fa = f(a), fb = f(a + h), ms = (fb - fa) / h, mt = deriv(f, a);
        P.ejes(); P.curva(f);
        P.recta(a, fa, mt, { c: K.verde, w: 2.2, dash: '7 5' });
        P.recta(a, fa, ms, { c: K.rosa, w: 2.4 });
        P.seg(a, fa, a + h, fa, { c: K.ambar, w: 1.6, dash: '3 3' }); P.seg(a + h, fa, a + h, fb, { c: K.ambar, w: 1.6, dash: '3 3' });
        P.texto(a + h / 2, fa, 'h', { dy: 14, c: K.ambar, it: true }); P.texto(a + h, (fa + fb) / 2, 'Δy', { dx: 18, c: K.ambar, it: true, s: 13 });
        P.punto(a, fa); P.punto(a + h, fb, { c: K.rosa }); P.fin();
        c.querySelector('.lect').innerHTML = '<span>pendiente de la <b style="color:' + K.rosa + '">secante</b> = [f(a+h) − f(a)]/h = <b>' + f2(ms, 4) + '</b></span><span>pendiente de la <b style="color:' + K.verde + '">tangente</b> f′(' + f2(a, 2) + ') ≈ <b>' + f2(mt, 4) + '</b></span>';
      } catch (err) { P.fin(); c.querySelector('.lect').innerHTML = '<span class="error">' + err.message + '</span>'; }
    }
    pinta();
  };

  /* --- f y f′: la pendiente dibuja la derivada --- */
  A['derivada-grafica'] = function (c) {
    var cu = c.querySelector('.acuerpo'), expr = 'x^3/3 - x', a = -1.5;
    campoFormula(cu, expr, ['x^3/3 - x', 'sin(x)', 'x^2', 'abs(x)', 'exp(x)/3', 'x^4/8 - x^2'], function (e) { expr = e; pinta(); });
    var s = svgEn(cu);
    var P0 = Plano(s, [-4, 4, -3, 3]); arrastre(s, P0, function (x) { a = x; pinta(); });
    function pinta() {
      var P = Plano(s, [-4, 4, -3, 3]);
      try {
        var f = compila(expr), m = deriv(f, a);
        P.ejes();
        P.curva(function (x) { return deriv(f, x); }, { c: K.verde, w: 2.2, b: a, a: -4 });
        P.curva(function (x) { return deriv(f, x); }, { c: K.verde, w: 1.4, op: 0.25 });
        P.curva(f, { c: K.azul });
        P.recta(a, f(a), m, { c: K.rosa, w: 1.8 });
        P.seg(a, f(a), a, m, { c: K.ambar, dash: '4 4', w: 1.3 });
        P.punto(a, f(a), { c: K.azul }); P.punto(a, m, { c: K.verde }); P.fin();
        c.querySelector('.lect').innerHTML = '<span style="color:' + K.azul + '">f(' + f2(a, 2) + ') = ' + f2(f(a), 3) + '</span><span style="color:' + K.rosa + '">pendiente de la tangente = ' + f2(m, 3) + '</span><span style="color:' + K.verde + '">el punto verde marca <b>f′(' + f2(a, 2) + ') = ' + f2(m, 3) + '</b>: al arrastrar va trazando f′</span>' + (Math.abs(m) < 0.03 ? '<span><b>Tangente horizontal: f′ = 0.</b></span>' : '');
      } catch (err) { P.fin(); c.querySelector('.lect').innerHTML = '<span class="error">' + err.message + '</span>'; }
    }
    pinta();
  };

  /* --- crecimiento y concavidad con colores --- */
  function analisis(c, modo) {
    var cu = c.querySelector('.acuerpo'), expr = modo === 'conc' ? 'x^3 - 3x' : 'x^3 - 3x^2 + 1';
    campoFormula(cu, expr, ['x^3 - 3x^2 + 1', 'x^4 - 2x^2', 'x*exp(-x^2)*3', 'sin(x)', 'x/(x^2 + 1)*3'], function (e) { expr = e; pinta(); });
    var s = svgEn(cu);
    function pinta() {
      var P = Plano(s, [-4, 4, -4, 4]);
      try {
        var f = compila(expr), g = modo === 'conc' ? function (x) { return deriv2(f, x); } : function (x) { return deriv(f, x); };
        P.ejes();
        var n = 400, prev = null, puntos = [];
        for (var k = 0; k < n; k++) {
          var x1 = -4 + 8 * k / n, x2 = x1 + 8 / n, sg = g((x1 + x2) / 2) > 0;
          P.curva(f, { a: x1, b: x2 + 0.001, n: 2, c: sg ? K.verde : K.rosa, w: 3.6 });
          if (prev !== null && sg !== prev) puntos.push(x1);
          prev = sg;
        }
        puntos.forEach(function (x) { P.punto(x, f(x), { c: K.ambar, r: 6 }); P.texto(x, f(x), '(' + f2(x, 2) + ', ' + f2(f(x), 2) + ')', { dy: modo === 'conc' ? -16 : (deriv2(f, x) > 0 ? 18 : -16), c: K.ambar, s: 12 }); });
        P.fin();
        c.querySelector('.lect').innerHTML = modo === 'conc'
          ? '<span><b style="color:' + K.verde + '">verde</b>: f″ &gt; 0, cóncava hacia arriba ∪</span><span><b style="color:' + K.rosa + '">rojo</b>: f″ &lt; 0, cóncava hacia abajo ∩</span><span>Puntos de inflexión (ámbar): ' + (puntos.map(function (x) { return 'x ≈ ' + f2(x, 2); }).join(', ') || 'ninguno en la vista') + '</span>'
          : '<span><b style="color:' + K.verde + '">verde</b>: f′ &gt; 0, f crece</span><span><b style="color:' + K.rosa + '">rojo</b>: f′ &lt; 0, f decrece</span><span>Cambios (máximos y mínimos locales): ' + (puntos.map(function (x) { return 'x ≈ ' + f2(x, 2); }).join(', ') || 'ninguno en la vista') + '</span>';
      } catch (err) { P.fin(); c.querySelector('.lect').innerHTML = '<span class="error">' + err.message + '</span>'; }
    }
    pinta();
  }
  A['crecimiento'] = function (c) { analisis(c, 'crec'); };
  A['concavidad'] = function (c) { analisis(c, 'conc'); };

  /* --- razones relacionadas: la escalera que resbala --- */
  A['escalera'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu), x = 3, timer = null;
    var bar = el('div', { class: 'ctl3d' }, '<button type="button" class="chip" data-a="play">▶ Soltar la escalera</button><button type="button" class="chip" data-a="rein">Reiniciar</button>'); cu.appendChild(bar);
    var st = deslizadores(cu, [['L', 'Largo L (m)', 4, 10, 5, 0.5], ['v', 'dx/dt (m/s)', 0.2, 2, 0.5, 0.1]], function () { pinta(); });
    bar.querySelector('[data-a=play]').addEventListener('click', function () { clearInterval(timer); timer = setInterval(function () { x += st.v * 0.05; if (x >= st.L - 0.05) { x = st.L - 0.05; clearInterval(timer); } pinta(); }, 50); });
    bar.querySelector('[data-a=rein]').addEventListener('click', function () { clearInterval(timer); x = Math.min(3, st.L * 0.6); pinta(); });
    s.setAttribute('viewBox', '0 0 640 340');
    function pinta() {
      if (x > st.L - 0.05) x = st.L - 0.05;
      var L = st.L, y = Math.sqrt(L * L - x * x), sc = 300 / 10.5, ox = 80, oy = 300, dydt = -x / y * st.v;
      var h = '<rect x="0" y="' + oy + '" width="640" height="40" fill="#e9e4dc"/><rect x="' + (ox - 22) + '" y="0" width="22" height="' + oy + '" fill="#d7dbe6"/>';
      for (var k = 0; k < 14; k++) h += '<line x1="' + (ox - 22) + '" y1="' + (k * 24) + '" x2="' + ox + '" y2="' + (k * 24 + 10) + '" stroke="#c2c8d6"/>';
      var X2 = ox + x * sc, Y1 = oy - y * sc;
      h += '<line x1="' + ox + '" y1="' + Y1 + '" x2="' + X2 + '" y2="' + oy + '" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/>';
      for (k = 1; k < 8; k++) { var px = ox + (X2 - ox) * k / 8, py = Y1 + (oy - Y1) * k / 8; h += '<circle cx="' + px + '" cy="' + py + '" r="2.5" fill="#f3e1c8"/>'; }
      h += '<line x1="' + ox + '" y1="' + (oy + 14) + '" x2="' + X2 + '" y2="' + (oy + 14) + '" stroke="' + K.verde + '" stroke-width="2"/>' + t((ox + X2) / 2, oy + 28, 'x = ' + f2(x, 2) + ' m', 13, K.verde);
      h += '<line x1="' + (ox - 32) + '" y1="' + Y1 + '" x2="' + (ox - 32) + '" y2="' + oy + '" stroke="' + K.azul + '" stroke-width="2"/>' + t(ox - 38, (Y1 + oy) / 2, 'y = ' + f2(y, 2), 13, K.azul, 'end');
      h += t(X2 - 40, Y1 + (oy - Y1) / 2 - 20, 'L = ' + f2(L, 1), 14, '#8a5a2b', 'middle', 1);
      s.innerHTML = h;
      c.querySelector('.lect').innerHTML = '<span>x² + y² = L²  ⇒  2x·dx/dt + 2y·dy/dt = 0</span><span>dy/dt = −(x/y)·dx/dt = <b>' + f2(dydt, 3) + ' m/s</b></span><span class="nota">Cuanto más abajo está la punta, más rápido cae: dy/dt → −∞ cuando y → 0.</span>';
    }
    pinta();
  };

  /* --- L'Hôpital: cociente de pendientes --- */
  A['lhopital'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu), par = 0;
    var PARES = [['sen x', 'x', Math.sin, function (x) { return x; }], ['eˣ − 1', 'x', function (x) { return Math.exp(x) - 1; }, function (x) { return x; }], ['ln(1 + x)', 'sen x', function (x) { return Math.log(1 + x); }, Math.sin], ['1 − cos x', 'x²', function (x) { return 1 - Math.cos(x); }, function (x) { return x * x; }]];
    var sel = el('div', { class: 'ctl3d' }); cu.appendChild(sel);
    PARES.forEach(function (p, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, p[0] + ' / ' + p[1]); b.addEventListener('click', function () { par = i; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); sel.appendChild(b); });
    var st = deslizadores(cu, [['x', 'x', -1.5, 1.5, 0.8, 0.01]], pinta);
    function pinta() {
      var p = PARES[par], f = p[2], g = p[3], x = Math.abs(st.x) < 1e-4 ? 1e-4 : st.x, P = Plano(s, [-2, 2, -1.5, 2]);
      P.ejes(); P.curva(f, { c: K.azul }); P.curva(g, { c: K.verde });
      P.punto(x, f(x), { c: K.azul }); P.punto(x, g(x), { c: K.verde }); P.seg(x, -1.5, x, 2, { c: K.ambar, dash: '4 4', w: 1.2 }); P.fin();
      c.querySelector('.lect').innerHTML = '<span><b style="color:' + K.azul + '">f(x) = ' + p[0] + '</b></span><span><b style="color:' + K.verde + '">g(x) = ' + p[1] + '</b></span><span>f(x)/g(x) = <b>' + f2(f(x) / g(x), 5) + '</b></span><span>f′(x)/g′(x) = <b>' + f2(deriv(f, x) / deriv(g, x), 5) + '</b></span><span class="nota">Cerca de 0 las dos funciones se parecen a sus rectas tangentes; por eso el cociente se acerca al cociente de las pendientes.</span>';
    }
    pinta();
  };

  /* --- optimización: la caja sin tapa --- */
  A['caja'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu);
    var st = deslizadores(cu, [['x', 'corte x (cm)', 0.2, 14.8, 4, 0.1]], pinta);
    s.setAttribute('viewBox', '0 0 640 330');
    function pinta() {
      var Lh = 30, x = st.x, V = x * (Lh - 2 * x) * (Lh - 2 * x), xo = Lh / 6, Vo = xo * (Lh - 2 * xo) * (Lh - 2 * xo);
      var sc = 9, ox = 20, oy = 30, h = '';
      h += '<rect x="' + ox + '" y="' + oy + '" width="' + Lh * sc + '" height="' + Lh * sc + '" fill="#f4ecdf" stroke="#b9a27d"/>';
      [[0, 0], [Lh - x, 0], [0, Lh - x], [Lh - x, Lh - x]].forEach(function (q) { h += '<rect x="' + (ox + q[0] * sc) + '" y="' + (oy + q[1] * sc) + '" width="' + x * sc + '" height="' + x * sc + '" fill="#fff" stroke="' + K.rosa + '" stroke-dasharray="4 3"/>'; });
      h += '<rect x="' + (ox + x * sc) + '" y="' + (oy + x * sc) + '" width="' + (Lh - 2 * x) * sc + '" height="' + (Lh - 2 * x) * sc + '" fill="#e5d3b3" stroke="#9a7a48"/>';
      h += t(ox + x * sc / 2, oy - 10, 'x', 13, K.rosa, 'middle', 1, 1) + t(ox + Lh * sc / 2, oy + Lh * sc + 16, '30 cm', 12, K.gris);
      // gráfica de V(x)
      var gx = 330, gy = 300, gw = 290, gh = 260, Vmax = 2100;
      h += '<line x1="' + gx + '" y1="' + gy + '" x2="' + (gx + gw) + '" y2="' + gy + '" stroke="#8b93a5"/><line x1="' + gx + '" y1="' + gy + '" x2="' + gx + '" y2="' + (gy - gh) + '" stroke="#8b93a5"/>';
      var d = ''; for (var k = 0; k <= 150; k++) { var xx = 15 * k / 150, vv = xx * (Lh - 2 * xx) * (Lh - 2 * xx); d += (k ? 'L' : 'M') + (gx + xx / 15 * gw) + ',' + (gy - vv / Vmax * gh); }
      h += '<path d="' + d + '" fill="none" stroke="' + K.azul + '" stroke-width="2.8"/>';
      h += '<circle cx="' + (gx + xo / 15 * gw) + '" cy="' + (gy - Vo / Vmax * gh) + '" r="5" fill="' + K.verde + '"/>' + t(gx + xo / 15 * gw, gy - Vo / Vmax * gh - 16, 'máximo', 12, K.verde);
      h += '<circle cx="' + (gx + x / 15 * gw) + '" cy="' + (gy - V / Vmax * gh) + '" r="6" fill="' + K.ambarV + '" stroke="#fff" stroke-width="2"/>';
      h += t(gx + gw, gy + 14, 'x', 13, K.gris, 'end', 0, 1) + t(gx - 6, gy - gh, 'V', 13, K.gris, 'end', 0, 1);
      s.innerHTML = h;
      c.querySelector('.lect').innerHTML = '<span>V(x) = x(30 − 2x)²</span><span>V(' + f2(x, 1) + ') = <b>' + f2(V, 1) + ' cm³</b></span><span>V′(x) = (30 − 2x)(30 − 6x) = 0 ⇒ x = 5: <b>V máx = 2000 cm³</b></span>';
    }
    pinta();
  };

  /* --- recta tangente y normal --- */
  A['recta-pendiente'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu), p = [-2, -1], q = [3, 2], arr = null;
    s.style.touchAction = 'none';
    var P0 = Plano(s, [-6, 6, -4, 4]);
    function pos(e) { var r = s.getBoundingClientRect(); return [Math.round(P0.ix((e.clientX - r.left) * 640 / r.width) * 2) / 2, Math.round(P0.iy((e.clientY - r.top) * 380 / r.height) * 2) / 2]; }
    s.addEventListener('pointerdown', function (e) { var z = pos(e); arr = Math.hypot(z[0] - p[0], z[1] - p[1]) < Math.hypot(z[0] - q[0], z[1] - q[1]) ? 'p' : 'q'; s.setPointerCapture(e.pointerId); mover(e); });
    s.addEventListener('pointermove', function (e) { if (arr) mover(e); });
    s.addEventListener('pointerup', function () { arr = null; });
    function mover(e) { var z = pos(e); if (arr === 'p') p = z; else q = z; pinta(); }
    function pinta() {
      var P = Plano(s, [-6, 6, -4, 4]); P.ejes();
      var dx = q[0] - p[0], dy = q[1] - p[1];
      if (Math.abs(dx) > 1e-9) { var m = dy / dx; P.recta(p[0], p[1], m, { c: K.azul, w: 2.8 }); if (Math.abs(m) > 1e-9) P.recta(p[0], p[1], -1 / m, { c: K.verde, w: 1.6, dash: '6 5' }); }
      else P.seg(p[0], -4, p[0], 4, { c: K.azul, w: 2.8 });
      P.seg(p[0], p[1], q[0], p[1], { c: K.ambar, dash: '4 3', w: 1.5 }); P.seg(q[0], p[1], q[0], q[1], { c: K.ambar, dash: '4 3', w: 1.5 });
      P.punto(p[0], p[1], { c: K.ambarV, r: 7 }); P.punto(q[0], q[1], { c: K.ambarV, r: 7 }); P.texto(p[0], p[1], 'P', { dx: -12, dy: -12, b: 1 }); P.texto(q[0], q[1], 'Q', { dx: 12, dy: -12, b: 1 }); P.fin();
      var info;
      if (Math.abs(dx) < 1e-9) info = '<span>Recta vertical: <b>x = ' + f2(p[0], 2) + '</b> (pendiente no definida)</span>';
      else { var m2 = dy / dx, b = p[1] - m2 * p[0]; info = '<span>m = Δy/Δx = ' + f2(dy, 2) + '/' + f2(dx, 2) + ' = <b>' + f2(m2, 3) + '</b></span><span>y = ' + f2(m2, 3) + 'x ' + (b < 0 ? '− ' : '+ ') + f2(Math.abs(b), 3) + '</span>' + (Math.abs(m2) > 1e-9 ? '<span style="color:' + K.verde + '">perpendicular por P: pendiente −1/m = ' + f2(-1 / m2, 3) + '</span>' : ''); }
      c.querySelector('.lect').innerHTML = '<span>d(P, Q) = ' + f2(Math.hypot(dx, dy), 3) + '</span><span>punto medio (' + f2((p[0] + q[0]) / 2, 2) + ', ' + f2((p[1] + q[1]) / 2, 2) + ')</span>' + info;
    }
    pinta();
  };

  /* ---------- portada: curva con tangente que se arrastra ---------- */
  function portada(svg) {
    var W = 470, H = 400, a = 1.2, f = function (x) { return 0.12 * x * x * x - 0.9 * x + 2.2 + 0.35 * Math.sin(1.7 * x); }, v = [-4, 4, -1, 6];
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var X = function (x) { return (x - v[0]) / (v[1] - v[0]) * W; }, Y = function (y) { return H - (y - v[2]) / (v[3] - v[2]) * H; };
    var tiempo = 0, arrastrando = false;
    function pinta() {
      var h = '', d = '';
      for (var k = 0; k <= 300; k++) { var x = v[0] + (v[1] - v[0]) * k / 300; d += (k ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(f(x)).toFixed(1); }
      // familia de tangentes (envolvente)
      for (k = 0; k <= 26; k++) { var x0 = -3.6 + 7.2 * k / 26, m = deriv(f, x0), y0 = f(x0); h += '<line x1="' + X(x0 - 1.4) + '" y1="' + Y(y0 - 1.4 * m) + '" x2="' + X(x0 + 1.4) + '" y2="' + Y(y0 + 1.4 * m) + '" stroke="rgba(150,220,210,.22)" stroke-width="1.2"/>'; }
      h += '<path d="' + d + '" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>';
      var fa = f(a), ma = deriv(f, a), hh = 1.6 * Math.cos(tiempo) * Math.cos(tiempo) + 0.05, fb = f(a + hh), ms = (fb - fa) / hh;
      h += '<line x1="' + X(a - 3) + '" y1="' + Y(fa - 3 * ms) + '" x2="' + X(a + 3) + '" y2="' + Y(fa + 3 * ms) + '" stroke="#f08aa8" stroke-width="2" opacity=".85"/>';
      h += '<line x1="' + X(a - 3) + '" y1="' + Y(fa - 3 * ma) + '" x2="' + X(a + 3) + '" y2="' + Y(fa + 3 * ma) + '" stroke="#ffd27a" stroke-width="2.6"/>';
      h += '<circle cx="' + X(a + hh) + '" cy="' + Y(fb) + '" r="5" fill="#f08aa8"/>';
      h += '<circle cx="' + X(a) + '" cy="' + Y(fa) + '" r="16" fill="#ffd27a" opacity=".22"/><circle cx="' + X(a) + '" cy="' + Y(fa) + '" r="7" fill="#ffd27a" stroke="#fff" stroke-width="2"/>';
      h += '<text x="' + (W - 10) + '" y="' + (H - 12) + '" text-anchor="end" font-size="13" fill="rgba(255,255,255,.75)" font-family="system-ui,sans-serif">f′(' + f2(a, 2) + ') = ' + f2(ma, 3) + '</text>';
      svg.innerHTML = h;
    }
    function mueve(e) { var r = svg.getBoundingClientRect(); a = Math.max(-3.5, Math.min(3.5, v[0] + (e.clientX - r.left) / r.width * (v[1] - v[0]))); pinta(); }
    svg.addEventListener('pointerdown', function (e) { arrastrando = true; svg.setPointerCapture(e.pointerId); mueve(e); });
    svg.addEventListener('pointermove', function (e) { if (arrastrando) mueve(e); });
    svg.addEventListener('pointerup', function () { arrastrando = false; });
    var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function anim() { tiempo += 0.012; pinta(); if (!quieto) requestAnimationFrame(anim); })();
  }
  function deco(cv) {
    var dpr = window.devicePixelRatio || 1, W = +cv.getAttribute('width'), H = +cv.getAttribute('height'), i = +(cv.dataset.i || 0);
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var fs = [function (x) { return Math.sin(x) * 1.2 + 0.3 * x; }, function (x) { return 0.2 * x * x * x - x; }, function (x) { return Math.exp(-x * x / 4) * 2.4 - 0.6; }, function (x) { return Math.cos(1.3 * x) + 0.15 * x * x - 1; }];
    var f = fs[i % fs.length], X = function (x) { return (x + 4) / 8 * W; }, Y = function (y) { return H / 2 - y * H / 7; };
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
    for (var k = 0; k <= 30; k++) { var x0 = -3.8 + 7.6 * k / 30, m = deriv(f, x0), y0 = f(x0); ctx.beginPath(); ctx.moveTo(X(x0 - 1.2), Y(y0 - 1.2 * m)); ctx.lineTo(X(x0 + 1.2), Y(y0 + 1.2 * m)); ctx.stroke(); }
    ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (k = 0; k <= 200; k++) { var x = -4 + 8 * k / 200; if (k) ctx.lineTo(X(x), Y(f(x))); else ctx.moveTo(X(x), Y(f(x))); }
    ctx.stroke();
  }

  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('svg.portada'); if (p) portada(p);
    document.querySelectorAll('canvas.deco').forEach(deco);
  }
  window.CALC = { A: A, compila: compila };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

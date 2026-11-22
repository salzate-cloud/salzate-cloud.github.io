/* Matemáticas Discretas — figuras y herramientas interactivas (SVG puro) */
(function () {
  'use strict';
  var K = { nara: '#A0410A', naraM: '#C15E14', naraV: '#E27A18', naraL: '#F2A93B', naraC: '#FDF4EA',
    azul: '#1B5E86', azulM: '#2A7FA8', azulC: '#E8F1F7', rojo: '#9E2B2B', verde: '#1F6F4F', gris: '#7a7a7a', tinta: '#2b2420' };
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html !== undefined) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function VF(b) { return b ? '<b class="v">V</b>' : '<b class="f">F</b>'; }
  function svgDe(cuerpo, W, H) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); cuerpo.appendChild(s); return s; }
  function txt(x, y, t, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" dominant-baseline="middle" font-size="' + (o.s || 15) + '" fill="' + (o.c || K.tinta) + '"' + (o.b ? ' font-weight="700"' : '') + (o.it ? ' font-style="italic"' : '') + ' font-family="' + (o.mono ? 'ui-monospace,Menlo,monospace' : 'Palatino Linotype,Book Antiqua,Palatino,Georgia,serif') + '">' + t + '</text>'; }
  var A = {};

  /* =============== LÓGICA =============== */
  // analizador de fórmulas: ¬ ~ ! not, ∧ & ^ y, ∨ | v o, → -> =>, ↔ <-> <=>, ⊕ xor
  function tokeniza(s) {
    s = s.replace(/<->|<=>|↔/g, ' ↔ ').replace(/->|=>|→/g, ' → ').replace(/&&|&|∧|\^/g, ' ∧ ').replace(/\|\||\||∨/g, ' ∨ ').replace(/[¬~!]/g, ' ¬ ').replace(/⊕/g, ' ⊕ ').replace(/[()]/g, function (c) { return ' ' + c + ' '; });
    var t = s.split(/\s+/).filter(Boolean).map(function (x) {
      var l = x.toLowerCase();
      if (l === 'v' && false) return '∨';
      if (l === 'y' || l === 'and') return '∧';
      if (l === 'o' || l === 'or') return '∨';
      if (l === 'no' || l === 'not') return '¬';
      if (l === 'xor') return '⊕';
      return x;
    });
    return t;
  }
  function analiza(s) {
    var t = tokeniza(s), i = 0;
    function mira() { return t[i]; }
    function come(x) { if (t[i] !== x) throw new Error('Se esperaba «' + x + '»'); i++; }
    function bic() { var a = imp(); while (mira() === '↔') { i++; var b = imp(); a = { op: '↔', a: a, b: b }; } return a; }
    function imp() { var a = dis(); if (mira() === '→') { i++; var b = imp(); a = { op: '→', a: a, b: b }; } return a; }
    function dis() { var a = con(); while (mira() === '∨' || mira() === '⊕') { var o = t[i++]; var b = con(); a = { op: o, a: a, b: b }; } return a; }
    function con() { var a = neg(); while (mira() === '∧') { i++; var b = neg(); a = { op: '∧', a: a, b: b }; } return a; }
    function neg() { if (mira() === '¬') { i++; return { op: '¬', a: neg() }; } return at(); }
    function at() {
      var x = t[i++];
      if (x === undefined) throw new Error('La fórmula está incompleta');
      if (x === '(') { var e = bic(); come(')'); return e; }
      if (/^[a-z]$/i.test(x) || /^[a-z][0-9]?$/i.test(x)) return { v: x.toLowerCase() };
      if (x === 'V' || x === 'T' || x === '1') return { c: true };
      if (x === 'F' || x === '0') return { c: false };
      throw new Error('No entiendo «' + x + '»');
    }
    var e = bic(); if (i < t.length) throw new Error('Sobra «' + t[i] + '»'); return e;
  }
  function vars(e, S) { S = S || {}; if (e.v) S[e.v] = 1; if (e.a) vars(e.a, S); if (e.b) vars(e.b, S); return S; }
  function ev(e, m) {
    if (e.v) return m[e.v]; if ('c' in e) return e.c;
    var a = ev(e.a, m); if (e.op === '¬') return !a; var b = ev(e.b, m);
    return e.op === '∧' ? a && b : e.op === '∨' ? a || b : e.op === '→' ? (!a || b) : e.op === '↔' ? a === b : a !== b;
  }
  function str(e, top) {
    if (e.v) return e.v; if ('c' in e) return e.c ? 'V' : 'F';
    if (e.op === '¬') return '¬' + str(e.a);
    var s = str(e.a) + ' ' + e.op + ' ' + str(e.b); return top ? s : '(' + s + ')';
  }
  function subf(e, L) { L = L || []; if (e.a) subf(e.a, L); if (e.b) subf(e.b, L); if (!e.v && !('c' in e)) { var s = str(e, true); if (L.indexOf(s) < 0) L.push({ s: s, e: e }); } return L; }
  function filas(vs) { var R = [], n = vs.length; for (var k = 0; k < (1 << n); k++) { var m = {}; vs.forEach(function (v, j) { m[v] = !((k >> (n - 1 - j)) & 1); }); R.push(m); } return R; }
  function botonesSimbolo(inp) {
    var g = el('div', { class: 'simbolos' });
    ['¬', '∧', '∨', '→', '↔', '⊕', '(', ')', 'p', 'q', 'r', 's'].forEach(function (s) {
      var b = el('button', { type: 'button' }, s); b.addEventListener('click', function () {
        var a = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, a) + s + inp.value.slice(inp.selectionEnd || a); inp.focus(); inp.selectionStart = inp.selectionEnd = a + s.length; inp.dispatchEvent(new Event('input'));
      }); g.appendChild(b);
    });
    return g;
  }

  /* --- los conectivos, con interruptores --- */
  A['conectivos'] = function (c) {
    var p = true, q = false, cu = c.querySelector('.acuerpo');
    var box = el('div', { class: 'conect' }); cu.appendChild(box);
    function pinta() {
      var F = [['¬p', 'negación', !p], ['p ∧ q', 'conjunción «y»', p && q], ['p ∨ q', 'disyunción «o»', p || q], ['p → q', 'condicional «si… entonces»', !p || q], ['p ↔ q', 'bicondicional «si y solo si»', p === q], ['p ⊕ q', 'o exclusivo', p !== q]];
      box.innerHTML = '<div class="interr">' + ['p', 'q'].map(function (k) { var v = k === 'p' ? p : q; return '<button type="button" class="sw ' + (v ? 'on' : '') + '" data-k="' + k + '"><span class="knob"></span><span class="lbl"><i>' + k + '</i> = ' + (v ? 'V' : 'F') + '</span></button>'; }).join('') + '</div>' +
        '<div class="lamparas">' + F.map(function (f) { return '<div class="lampara ' + (f[2] ? 'on' : '') + '"><span class="foco"></span><b>' + f[0] + '</b><small>' + f[1] + '</small><span class="val">' + (f[2] ? 'V' : 'F') + '</span></div>'; }).join('') + '</div>';
      box.querySelectorAll('.sw').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.k === 'p') p = !p; else q = !q; pinta(); }); });
      c.querySelector('.lect').innerHTML = (p && !q) ? 'Fíjate: con <i>p</i> = V y <i>q</i> = F el condicional es <b>falso</b>. Es el único caso.' : 'Cambia <i>p</i> y <i>q</i> y mira qué conectivos se encienden.';
    }
    pinta();
  };

  /* --- calculadora de tablas de verdad --- */
  A['tabla-verdad'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var f = el('div', { class: 'formula' });
    var inp = el('input', { type: 'text', value: '(p → q) ↔ (¬q → ¬p)', spellcheck: 'false', 'aria-label': 'Fórmula' });
    f.appendChild(inp); f.appendChild(botonesSimbolo(inp));
    var ej = el('div', { class: 'ejemplos' }, 'Prueba: ' + ['p ∨ ¬p', 'p ∧ ¬p', '(p → q) ∧ p → q', '¬(p ∧ q) ↔ (¬p ∨ ¬q)', '(p ∨ q) ∧ ¬r'].map(function (x) { return '<button type="button">' + x + '</button>'; }).join(''));
    f.appendChild(ej); cu.appendChild(f);
    var out = el('div', { class: 'tablawrap' }); cu.appendChild(out);
    ej.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.textContent; calc(); }); });
    function calc() {
      try {
        var e = analiza(inp.value), vs = Object.keys(vars(e)).sort();
        if (vs.length > 5) throw new Error('Usa como máximo cinco variables');
        var S = subf(e), R = filas(vs), nv = 0;
        var h = '<table class="tv"><thead><tr>' + vs.map(function (v) { return '<th class="var">' + v + '</th>'; }).join('') + S.map(function (s, i) { return '<th' + (i === S.length - 1 ? ' class="fin"' : '') + '>' + esc(s.s) + '</th>'; }).join('') + '</tr></thead><tbody>';
        R.forEach(function (m) {
          var res = ev(e, m); if (res) nv++;
          h += '<tr>' + vs.map(function (v) { return '<td class="var">' + VF(m[v]) + '</td>'; }).join('') + S.map(function (s, i) { return '<td' + (i === S.length - 1 ? ' class="fin"' : '') + '>' + VF(ev(s.e, m)) + '</td>'; }).join('') + '</tr>';
        });
        h += '</tbody></table>';
        out.innerHTML = h;
        var cls = nv === R.length ? '<b class="v">Tautología</b>: verdadera en los ' + R.length + ' renglones.' : nv === 0 ? '<b class="f">Contradicción</b>: falsa en todos los renglones.' : '<b>Contingencia</b>: verdadera en ' + nv + ' de ' + R.length + ' renglones.';
        c.querySelector('.lect').innerHTML = '<span>' + vs.length + ' variables → ' + R.length + ' renglones</span><span>' + cls + '</span>';
      } catch (err) { out.innerHTML = ''; c.querySelector('.lect').innerHTML = '<span class="error">' + esc(err.message) + '</span>'; }
    }
    inp.addEventListener('input', calc); calc();
  };

  /* --- ¿es válido el razonamiento? --- */
  A['validez'] = function (c) {
    var cu = c.querySelector('.acuerpo'), w = el('div', { class: 'formula validez' });
    w.innerHTML = '<label>Premisas <small>(una por renglón)</small><textarea rows="3" spellcheck="false">p → q\nq → r\np</textarea></label><label>Conclusión<input type="text" value="r" spellcheck="false"></label>';
    cu.appendChild(w);
    var ta = w.querySelector('textarea'), inp = w.querySelector('input');
    var ej = el('div', { class: 'ejemplos' }, 'Casos famosos: <button type="button" data-p="p → q\np" data-c="q">Modus ponens</button><button type="button" data-p="p → q\n¬q" data-c="¬p">Modus tollens</button><button type="button" data-p="p ∨ q\n¬p" data-c="q">Silogismo disyuntivo</button><button type="button" data-p="p → q\nq" data-c="p">Falacia: afirmar el consecuente</button>');
    w.appendChild(ej); var out = el('div', { class: 'tablawrap' }); cu.appendChild(out);
    ej.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { ta.value = b.dataset.p; inp.value = b.dataset.c; calc(); }); });
    function calc() {
      try {
        var P = ta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(analiza), C = analiza(inp.value);
        var V = {}; P.forEach(function (e) { vars(e, V); }); vars(C, V); var vs = Object.keys(V).sort();
        if (vs.length > 5) throw new Error('Usa como máximo cinco variables');
        var R = filas(vs), malo = -1, h = '<table class="tv"><thead><tr>' + vs.map(function (v) { return '<th class="var">' + v + '</th>'; }).join('') + P.map(function (e) { return '<th>' + esc(str(e, true)) + '</th>'; }).join('') + '<th class="fin">∴ ' + esc(str(C, true)) + '</th></tr></thead><tbody>';
        R.forEach(function (m, k) {
          var ps = P.map(function (e) { return ev(e, m); }), todas = ps.every(Boolean), cc = ev(C, m);
          if (todas && !cc && malo < 0) malo = k;
          h += '<tr class="' + (todas ? (cc ? 'critico' : 'contra') : 'gris') + '">' + vs.map(function (v) { return '<td class="var">' + VF(m[v]) + '</td>'; }).join('') + ps.map(function (x) { return '<td>' + VF(x) + '</td>'; }).join('') + '<td class="fin">' + VF(cc) + '</td></tr>';
        });
        out.innerHTML = h + '</tbody></table>';
        c.querySelector('.lect').innerHTML = malo < 0 ? '<span><b class="v">Válido.</b> En todos los renglones donde las premisas son verdaderas (resaltados), la conclusión también lo es.</span>'
          : '<span><b class="f">No es válido.</b> El renglón en rojo es un contraejemplo: premisas verdaderas y conclusión falsa.</span>';
      } catch (err) { out.innerHTML = ''; c.querySelector('.lect').innerHTML = '<span class="error">' + esc(err.message) + '</span>'; }
    }
    ta.addEventListener('input', calc); inp.addEventListener('input', calc); calc();
  };

  /* --- la suma de Gauss con cuadritos --- */
  A['gauss'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 330), n = 6;
    var ctl = el('div', { class: 'ctl2d' }, '<label><span>n</span><input type="range" min="1" max="14" value="6"><b>6</b></label>'); cu.appendChild(ctl);
    var r = ctl.querySelector('input');
    function pinta() {
      var L = Math.min(260 / n, 30), x0 = 320 - (n + 1) * L / 2, y0 = 30, h = '';
      for (var i = 1; i <= n; i++) for (var j = 0; j <= n; j++) {
        var mio = j < i; // fila i: i cuadros naranjas y n+1-i azules
        h += '<rect x="' + (x0 + j * L) + '" y="' + (y0 + (i - 1) * L) + '" width="' + (L - 2) + '" height="' + (L - 2) + '" rx="3" fill="' + (mio ? K.naraV : K.azulM) + '" opacity="' + (mio ? 0.9 : 0.55) + '"/>';
      }
      h += txt(x0 - 14, y0 + n * L / 2, 'n = ' + n, { a: 'end', it: true });
      h += txt(x0 + (n + 1) * L / 2, y0 + n * L + 18, 'n + 1 = ' + (n + 1), { it: true });
      s.innerHTML = h; ctl.querySelector('b').textContent = n;
      c.querySelector('.lect').innerHTML = '<span>Naranja: 1 + 2 + ⋯ + ' + n + '</span><span>Dos copias llenan un rectángulo de ' + n + ' × ' + (n + 1) + ' = ' + n * (n + 1) + '</span><span>Por eso 1 + 2 + ⋯ + n = n(n + 1)/2 = <b>' + n * (n + 1) / 2 + '</b></span>';
    }
    r.addEventListener('input', function () { n = +r.value; pinta(); }); pinta();
  };

  /* =============== BOOLE =============== */
  function compuerta(tipo, x, y, on) {
    var col = on ? K.naraV : '#fff', h = '';
    var cuerpo = { AND: 'M0,-22 L24,-22 A22,22 0 0 1 24,22 L0,22 Z', OR: 'M0,-22 C22,-22 40,-12 48,0 C40,12 22,22 0,22 C10,10 10,-10 0,-22 Z', NOT: 'M0,-18 L0,18 L34,0 Z' }[tipo.replace('N', '') === 'OT' ? 'NOT' : tipo] || '';
    if (tipo === 'NAND') cuerpo = 'M0,-22 L24,-22 A22,22 0 0 1 24,22 L0,22 Z';
    if (tipo === 'NOR' || tipo === 'XOR') cuerpo = 'M0,-22 C22,-22 40,-12 48,0 C40,12 22,22 0,22 C10,10 10,-10 0,-22 Z';
    h += '<g transform="translate(' + x + ',' + y + ')"><path d="' + cuerpo + '" fill="' + (on ? '#fde7cc' : '#fff') + '" stroke="' + K.tinta + '" stroke-width="2"/>';
    if (tipo === 'XOR') h += '<path d="M-7,-22 C3,-10 3,10 -7,22" fill="none" stroke="' + K.tinta + '" stroke-width="2"/>';
    if (tipo === 'NOT' || tipo === 'NAND' || tipo === 'NOR') { var bx = tipo === 'NOT' ? 39 : tipo === 'NAND' ? 51 : 53; h += '<circle cx="' + bx + '" cy="0" r="5" fill="#fff" stroke="' + K.tinta + '" stroke-width="2"/>'; }
    h += '<text x="' + (tipo === 'NOT' ? 11 : 20) + '" y="1" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="' + K.gris + '" font-family="ui-monospace,monospace">' + tipo + '</text></g>';
    return h;
  }
  function cable(pts, on) {
    return '<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + (on ? K.naraV : '#9aa0a6') + '" stroke-width="' + (on ? 4 : 2.5) + '" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  var CIRCUITOS = {
    'F = A·B + C′': { ent: ['A', 'B', 'C'], f: function (v) { return (v.A && v.B) || !v.C; },
      dibuja: function (v) {
        var ab = v.A && v.B, nc = !v.C, F = ab || nc, h = '';
        h += cable([[70, 60], [150, 60], [150, 73], [200, 73]], v.A) + cable([[70, 110], [150, 110], [150, 97], [200, 97]], v.B) + cable([[70, 220], [200, 220]], v.C);
        h += cable([[246, 85], [330, 85], [330, 125], [372, 125]], ab) + cable([[249, 220], [330, 220], [330, 165], [372, 165]], nc) + cable([[420, 145], [560, 145]], F);
        h += compuerta('AND', 200, 85, ab) + compuerta('NOT', 200, 220, nc) + compuerta('OR', 372, 145, F);
        h += '<rect x="196" y="58" width="4" height="4" fill="none"/>';
        return [h, F];
      } },
    'Medio sumador': { ent: ['A', 'B'], f: function (v) { return v.A !== v.B; },
      dibuja: function (v) {
        var S = v.A !== v.B, Cc = v.A && v.B, h = '';
        h += cable([[70, 80], [150, 80], [150, 70], [372, 70]], v.A) + cable([[70, 180], [170, 180], [170, 100], [372, 100]], v.B);
        h += cable([[150, 80], [150, 200], [372, 200]], v.A) + cable([[170, 180], [170, 230], [372, 230]], v.B);
        h += cable([[422, 85], [560, 85]], S) + cable([[418, 215], [560, 215]], Cc);
        h += compuerta('XOR', 372, 85, S) + compuerta('AND', 372, 215, Cc);
        h += txt(585, 85, 'S', { b: true, c: S ? K.naraM : K.gris }) + txt(585, 215, 'C', { b: true, c: Cc ? K.naraM : K.gris });
        return [h, null, 'Suma S = A ⊕ B = ' + (S ? 1 : 0) + ', acarreo C = A·B = ' + (Cc ? 1 : 0) + '. En binario: ' + (+v.A) + ' + ' + (+v.B) + ' = ' + (Cc ? 1 : 0) + '' + (S ? 1 : 0)];
      } },
    'Alarma: (A + B)·C′': { ent: ['A', 'B', 'C'], f: function (v) { return (v.A || v.B) && !v.C; },
      dibuja: function (v) {
        var o = v.A || v.B, nc = !v.C, F = o && nc, h = '';
        h += cable([[70, 60], [200, 60], [200, 73]], v.A) + cable([[70, 110], [200, 110], [200, 97]], v.B) + cable([[70, 220], [200, 220]], v.C);
        h += cable([[248, 85], [330, 85], [330, 132], [372, 132]], o) + cable([[249, 220], [330, 220], [330, 158], [372, 158]], nc) + cable([[418, 145], [560, 145]], F);
        h += compuerta('OR', 200, 85, o) + compuerta('NOT', 200, 220, nc) + compuerta('AND', 372, 145, F);
        return [h, F, 'Suena si se abre una puerta (A) o una ventana (B) y la alarma no está desactivada (C).'];
      } }
  };
  A['circuito'] = function (c) {
    var cu = c.querySelector('.acuerpo'), nombre = Object.keys(CIRCUITOS)[0], v = { A: true, B: false, C: false };
    var sel = el('div', { class: 'ctl3d' }); cu.appendChild(sel);
    Object.keys(CIRCUITOS).forEach(function (k, i) { var b = el('button', { type: 'button', class: 'chip' + (i ? '' : ' on') }, k); b.addEventListener('click', function () { nombre = k; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); sel.appendChild(b); });
    var s = svgDe(cu, 640, 280); cu.insertBefore(s, sel);
    function pinta() {
      var C0 = CIRCUITOS[nombre], r = C0.dibuja(v), h = r[0];
      var ys = { A: 60, B: 110, C: 220 }; if (nombre === 'Medio sumador') ys = { A: 80, B: 180 };
      C0.ent.forEach(function (k) {
        var y = ys[k], on = v[k];
        h += '<g class="entrada" data-k="' + k + '" style="cursor:pointer"><rect x="14" y="' + (y - 16) + '" width="56" height="32" rx="16" fill="' + (on ? K.naraV : '#e9e4de') + '"/><circle cx="' + (on ? 54 : 30) + '" cy="' + y + '" r="12" fill="#fff"/>' + txt(on ? 30 : 54, y + 1, on ? 1 : 0, { s: 13, b: true, c: on ? '#fff' : K.gris, mono: true }) + '</g>' + txt(92, y - 14, k, { b: true, it: true, s: 16 });
      });
      if (r[1] !== null) h += '<circle cx="585" cy="145" r="20" fill="' + (r[1] ? '#ffd27a' : '#eee') + '" stroke="' + (r[1] ? K.naraV : '#bbb') + '" stroke-width="3"/>' + (r[1] ? '<circle cx="585" cy="145" r="30" fill="#ffd27a" opacity=".35"/>' : '') + txt(585, 182, 'F = ' + (r[1] ? 1 : 0), { b: true, c: r[1] ? K.naraM : K.gris });
      s.innerHTML = h;
      s.querySelectorAll('.entrada').forEach(function (g) { g.addEventListener('click', function () { v[g.dataset.k] = !v[g.dataset.k]; pinta(); }); });
      c.querySelector('.lect').innerHTML = '<span><b>' + nombre + '</b></span><span>' + (r[2] || 'Toca las entradas para cambiar 0 y 1. Los cables encendidos llevan un 1.') + '</span>';
    }
    pinta();
  };

  /* --- mapa de Karnaugh de cuatro variables --- */
  function minimiza(unos, n) {
    // Quine–McCluskey: implicantes primos, luego cobertura voraz con esenciales
    var grupos = unos.map(function (m) { return { b: m, mask: 0, ms: [m] }; }), primos = [], cambio = true;
    var actual = grupos;
    while (actual.length) {
      var sig = [], usado = {}, vistos = {};
      for (var i = 0; i < actual.length; i++) for (var j = i + 1; j < actual.length; j++) {
        var a = actual[i], b = actual[j];
        if (a.mask !== b.mask) continue;
        var d = a.b ^ b.b; if (d && !(d & (d - 1))) {
          var nb = a.b & ~d, nm = a.mask | d, k = nb + ':' + nm;
          usado[i] = usado[j] = 1;
          if (!vistos[k]) { vistos[k] = 1; sig.push({ b: nb, mask: nm, ms: a.ms.concat(b.ms) }); }
        }
      }
      actual.forEach(function (x, i) { if (!usado[i]) primos.push(x); });
      actual = sig;
    }
    var sinCubrir = unos.slice(), elegidos = [];
    // esenciales
    unos.forEach(function (m) { var c = primos.filter(function (p) { return p.ms.indexOf(m) >= 0; }); if (c.length === 1 && elegidos.indexOf(c[0]) < 0) elegidos.push(c[0]); });
    function cubiertos() { var S = {}; elegidos.forEach(function (p) { p.ms.forEach(function (m) { S[m] = 1; }); }); return S; }
    var S = cubiertos();
    while (unos.some(function (m) { return !S[m]; })) {
      var mejor = null, mc = -1;
      primos.forEach(function (p) { if (elegidos.indexOf(p) >= 0) return; var c = p.ms.filter(function (m) { return !S[m]; }).length; if (c > mc || (c === mc && p.ms.length > mejor.ms.length)) { mc = c; mejor = p; } });
      elegidos.push(mejor); S = cubiertos();
    }
    return elegidos;
  }
  A['karnaugh'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 360);
    var G = [0, 1, 3, 2]; // orden de Gray
    var val = {}; [0, 2, 5, 7, 8, 10, 13, 15].forEach(function (m) { val[m] = 1; });
    var ctl = el('div', { class: 'ctl3d' }, '<button type="button" class="chip" data-a="limpiar">Borrar todo</button><button type="button" class="chip" data-a="azar">Al azar</button><button type="button" class="chip" data-a="ej">Ejemplo del libro</button>');
    cu.appendChild(ctl);
    ctl.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () {
      if (b.dataset.a === 'limpiar') val = {};
      if (b.dataset.a === 'azar') { val = {}; for (var m = 0; m < 16; m++) if (Math.random() < 0.4) val[m] = 1; }
      if (b.dataset.a === 'ej') { val = {}; [0, 2, 5, 7, 8, 10, 13, 15].forEach(function (m) { val[m] = 1; }); }
      pinta(); }); });
    var COL = ['#E27A18', '#2A7FA8', '#1F6F4F', '#9E2B2B', '#7B4FA0', '#C9A227', '#3A8C8C', '#B5487A'];
    function termino(p) {
      var L = ['A', 'B', 'C', 'D'], t = '';
      for (var i = 0; i < 4; i++) { var bit = 1 << (3 - i); if (p.mask & bit) continue; t += L[i] + ((p.b & bit) ? '' : '′'); }
      return t || '1';
    }
    function pinta() {
      var x0 = 190, y0 = 70, L = 64, h = '';
      h += txt(x0 - 30, y0 - 30, 'AB \\ CD', { s: 13, c: K.gris, mono: true });
      for (var j = 0; j < 4; j++) h += txt(x0 + j * L + L / 2, y0 - 16, ['00', '01', '11', '10'][j], { mono: true, s: 14, c: K.azul, b: true });
      for (var i = 0; i < 4; i++) h += txt(x0 - 18, y0 + i * L + L / 2, ['00', '01', '11', '10'][i], { mono: true, s: 14, c: K.nara, b: true });
      var unos = []; for (var m = 0; m < 16; m++) if (val[m]) unos.push(m);
      var P = unos.length === 16 ? [{ b: 0, mask: 15, ms: unos }] : unos.length ? minimiza(unos, 4) : [];
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
        var mm = (G[i] << 2) | G[j];
        h += '<g class="celda" data-m="' + mm + '" style="cursor:pointer"><rect x="' + (x0 + j * L) + '" y="' + (y0 + i * L) + '" width="' + L + '" height="' + L + '" fill="' + (val[mm] ? '#fdf1e4' : '#fff') + '" fill-opacity=".85" stroke="#d9cbbb"/>' +
          txt(x0 + j * L + L / 2, y0 + i * L + L / 2, val[mm] ? 1 : 0, { s: 22, b: true, c: val[mm] ? K.nara : '#c9bfb4', mono: true }) + txt(x0 + j * L + L - 9, y0 + i * L + 10, mm, { s: 9, c: '#b3a89c', mono: true }) + '</g>';
      }
      // fondos de los grupos
      P.forEach(function (p, k) {
        p.ms.forEach(function (m) {
          var r = G.indexOf(m >> 2), cc = G.indexOf(m & 3), pad = 5 + (k % 4) * 4;
          h += '<rect x="' + (x0 + cc * L + pad) + '" y="' + (y0 + r * L + pad) + '" width="' + (L - 2 * pad) + '" height="' + (L - 2 * pad) + '" rx="10" fill="none" pointer-events="none" stroke="' + COL[k % 8] + '" stroke-width="3" opacity=".9"/>';
        });
      });
      s.innerHTML = h;
      s.querySelectorAll('.celda').forEach(function (g) { g.addEventListener('click', function () { var m = +g.dataset.m; if (val[m]) delete val[m]; else val[m] = 1; pinta(); }); });
      var expr = !unos.length ? '0' : P.map(function (p, k) { return '<b style="color:' + COL[k % 8] + '">' + termino(p) + '</b>'; }).join(' + ');
      c.querySelector('.lect').innerHTML = '<span>Minitérminos: Σm(' + (unos.join(', ') || '—') + ')</span><span>Expresión mínima: F = ' + expr + '</span>';
    }
    pinta();
  };

  /* =============== SUCESIONES =============== */
  function grafica(s, vals, o) {
    o = o || {}; var W = 640, H = 300, x0 = 50, y0 = 20, w = W - x0 - 20, h = H - y0 - 40;
    var mx = Math.max.apply(null, vals.map(Math.abs).concat([1])), n = vals.length, bw = w / n;
    var mn = Math.min.apply(null, vals.concat([0])), Mx = Math.max.apply(null, vals.concat([0]));
    if (Mx === mn) Mx = mn + 1;
    function Y(v) { return y0 + h - (v - mn) / (Mx - mn) * h; }
    var g = '<line x1="' + x0 + '" y1="' + Y(0) + '" x2="' + (W - 15) + '" y2="' + Y(0) + '" stroke="#8a8078" stroke-width="1.2"/>';
    vals.forEach(function (v, i) {
      var x = x0 + i * bw + bw * 0.15, y = Math.min(Y(v), Y(0)), hh = Math.abs(Y(v) - Y(0));
      g += '<rect x="' + x + '" y="' + y + '" width="' + bw * 0.7 + '" height="' + Math.max(hh, 0.5) + '" rx="3" fill="' + (o.col ? o.col(i) : K.naraV) + '" opacity=".88"><title>' + (o.lab ? o.lab(i) : 'a' + (i + 1)) + ' = ' + v + '</title></rect>';
      if (n <= 16) g += txt(x + bw * 0.35, (v >= 0 ? y - 10 : y + hh + 11), fmtN(v), { s: 11, c: K.tinta, mono: true });
      if (n <= 20 || i % 2 === 0) g += txt(x + bw * 0.35, H - 22, (o.idx ? o.idx(i) : i + 1), { s: 11, c: K.gris, mono: true });
    });
    g += txt(16, H - 22, 'n', { it: true, c: K.gris });
    s.innerHTML = g;
  }
  function fmtN(v) { if (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v)) return v.toExponential(1).replace('.', ','); var r = Math.round(v * 100) / 100; return String(r).replace('.', ','); }
  function deslizadores(cu, defs, cb) {
    var d = el('div', { class: 'ctl2d' }), st = {};
    defs.forEach(function (x) {
      var l = el('label', null, '<span>' + x[1] + '</span><input type="range" min="' + x[2] + '" max="' + x[3] + '" step="' + (x[5] || 1) + '" value="' + x[4] + '"><b></b>');
      var i = l.querySelector('input'), b = l.querySelector('b'); st[x[0]] = +x[4]; b.textContent = fmtN(+x[4]);
      i.addEventListener('input', function () { st[x[0]] = +i.value; b.textContent = fmtN(+i.value); cb(st); }); d.appendChild(l);
    });
    cu.appendChild(d); return st;
  }
  A['progresiones'] = function (c) {
    var cu = c.querySelector('.acuerpo'), tipo = 'ar';
    var sel = el('div', { class: 'ctl3d' }, '<button type="button" class="chip on" data-t="ar">Aritmética</button><button type="button" class="chip" data-t="ge">Geométrica</button>'); cu.appendChild(sel);
    var s = svgDe(cu, 640, 300);
    var st = deslizadores(cu, [['a', 'a₁', -10, 10, 2], ['d', 'd o r', -3, 3, 1.5, 0.5], ['n', 'términos', 3, 20, 10]], pinta);
    sel.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { tipo = b.dataset.t; sel.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); });
    function pinta() {
      var v = [], a = st.a, d = st.d;
      for (var i = 0; i < st.n; i++) v.push(tipo === 'ar' ? a + i * d : a * Math.pow(d, i));
      grafica(s, v, { col: function (i) { return i % 2 ? K.naraV : K.naraL; } });
      var S = v.reduce(function (x, y) { return x + y; }, 0);
      c.querySelector('.lect').innerHTML = tipo === 'ar' ? '<span>aₙ = a₁ + (n − 1)d = ' + fmtN(a) + ' + (n − 1)·' + fmtN(d) + '</span><span>a' + st.n + ' = ' + fmtN(v[v.length - 1]) + '</span><span>Sₙ = n(a₁ + aₙ)/2 = <b>' + fmtN(S) + '</b></span>'
        : '<span>aₙ = a₁·r<sup>n−1</sup> = ' + fmtN(a) + '·' + fmtN(d) + '<sup>n−1</sup></span><span>a' + st.n + ' = ' + fmtN(v[v.length - 1]) + '</span><span>Sₙ = <b>' + fmtN(S) + '</b></span>' + (Math.abs(d) < 1 && d !== 0 ? '<span class="nota">Con |r| &lt; 1 los términos se encogen hacia 0.</span>' : '');
    }
    pinta();
  };
  A['recurrencia1'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 300);
    var st = deslizadores(cu, [['r', 'r', -2, 2, 1.5, 0.1], ['k', 'c', -5, 5, 1, 0.5], ['a0', 'a₀', -5, 5, 2, 0.5], ['n', 'términos', 4, 20, 12]], pinta);
    function pinta() {
      var v = [st.a0]; for (var i = 1; i < st.n; i++) v.push(st.r * v[i - 1] + st.k);
      grafica(s, v, { idx: function (i) { return i; }, lab: function (i) { return 'a' + i; }, col: function (i) { return i ? K.naraV : K.azulM; } });
      var cerr = st.r === 1 ? 'aₙ = a₀ + n·c = ' + fmtN(st.a0) + ' + ' + fmtN(st.k) + 'n' : 'aₙ = (a₀ − p)·rⁿ + p, con p = c/(1 − r) = ' + fmtN(st.k / (1 - st.r));
      c.querySelector('.lect').innerHTML = '<span>aₙ = ' + fmtN(st.r) + '·aₙ₋₁ ' + (st.k < 0 ? '− ' : '+ ') + fmtN(Math.abs(st.k)) + ', a₀ = ' + fmtN(st.a0) + '</span><span>Forma cerrada: ' + cerr + '</span>';
    }
    pinta();
  };
  A['fibonacci'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 300);
    var st = deslizadores(cu, [['c1', 'c₁', -3, 3, 1, 0.5], ['c2', 'c₂', -3, 3, 1, 0.5], ['a0', 'a₀', -3, 5, 0], ['a1', 'a₁', -3, 5, 1], ['n', 'términos', 4, 18, 12]], pinta);
    function pinta() {
      var v = [st.a0, st.a1]; for (var i = 2; i < st.n; i++) v.push(st.c1 * v[i - 1] + st.c2 * v[i - 2]);
      grafica(s, v, { idx: function (i) { return i; }, lab: function (i) { return 'a' + i; }, col: function (i) { return i < 2 ? K.azulM : K.naraV; } });
      var D = st.c1 * st.c1 + 4 * st.c2, raices;
      if (D > 0) { var r1 = (st.c1 + Math.sqrt(D)) / 2, r2 = (st.c1 - Math.sqrt(D)) / 2; raices = 'raíces reales distintas r₁ = ' + fmtN(r1) + ', r₂ = ' + fmtN(r2) + ': aₙ = α·r₁ⁿ + β·r₂ⁿ'; }
      else if (D === 0) raices = 'raíz doble r = ' + fmtN(st.c1 / 2) + ' (caso que el curso no trata)';
      else raices = 'raíces complejas (caso que el curso no trata)';
      var cociente = v[v.length - 2] ? v[v.length - 1] / v[v.length - 2] : NaN;
      c.querySelector('.lect').innerHTML = '<span>aₙ = ' + fmtN(st.c1) + '·aₙ₋₁ + ' + fmtN(st.c2) + '·aₙ₋₂</span><span>Ecuación característica: r² − ' + fmtN(st.c1) + 'r − ' + fmtN(st.c2) + ' = 0; ' + raices + '</span>' +
        (st.c1 === 1 && st.c2 === 1 && st.a0 === 0 && st.a1 === 1 ? '<span>¡Fibonacci! aₙ/aₙ₋₁ = ' + fmtN(Math.round(cociente * 1e5) / 1e5) + ' → φ = 1,61803…</span>' : '');
    }
    pinta();
  };

  /* =============== GRAFOS =============== */
  var PRESETS = {
    'Casita': { V: [[160, 250], [320, 250], [320, 140], [160, 140], [240, 60]], E: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [3, 4], [0, 2], [1, 3]] },
    'K₄': { V: [[240, 50], [110, 260], [370, 260], [240, 180]], E: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] },
    'K₅': circ(5, [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]),
    'K₃,₃': { V: [[110, 70], [240, 70], [370, 70], [110, 260], [240, 260], [370, 260]], E: [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]] },
    'Königsberg': { V: [[240, 40], [240, 290], [110, 165], [380, 165]], E: [[0, 2], [0, 2], [1, 2], [1, 2], [0, 3], [1, 3], [2, 3]] },
    'Petersen': (function () { var V = [], E = []; for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / 5; V.push([240 + 130 * Math.cos(a), 168 + 130 * Math.sin(a)]); } for (i = 0; i < 5; i++) { var b = -Math.PI / 2 + 2 * Math.PI * i / 5; V.push([240 + 60 * Math.cos(b), 168 + 60 * Math.sin(b)]); } for (i = 0; i < 5; i++) { E.push([i, (i + 1) % 5]); E.push([i, i + 5]); E.push([5 + i, 5 + (i + 2) % 5]); } return { V: V, E: E }; })(),
    'Vacío': { V: [], E: [] }
  };
  function circ(n, E) { var V = []; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; V.push([240 + 125 * Math.cos(a), 170 + 125 * Math.sin(a)]); } return { V: V, E: E }; }
  function copiaG(g) { return { V: g.V.map(function (p) { return p.slice(); }), E: g.E.map(function (e) { return e.slice(); }) }; }
  function grados(g) { var d = g.V.map(function () { return 0; }); g.E.forEach(function (e) { d[e[0]]++; d[e[1]]++; }); return d; }
  function componentes(g) {
    var n = g.V.length, p = []; for (var i = 0; i < n; i++) p.push(i);
    function f(x) { while (p[x] !== x) x = p[x] = p[p[x]]; return x; }
    g.E.forEach(function (e) { p[f(e[0])] = f(e[1]); });
    var S = {}; for (i = 0; i < n; i++) S[f(i)] = 1; return Object.keys(S).length;
  }
  function nombreV(i) { return i < 26 ? String.fromCharCode(97 + i) : 'v' + i; }
  function editorGrafo(c, opciones) {
    opciones = opciones || {};
    var cu = c.querySelector('.acuerpo'), g = copiaG(PRESETS[opciones.inicial || 'Casita']), sel = null, arr = null, movio = false, traza = [];
    var bar = el('div', { class: 'ctl3d' }); cu.appendChild(bar);
    Object.keys(PRESETS).forEach(function (k) { if (opciones.presets && opciones.presets.indexOf(k) < 0) return; var b = el('button', { type: 'button', class: 'chip' + (k === (opciones.inicial || 'Casita') ? ' on' : '') }, k); b.addEventListener('click', function () { g = copiaG(PRESETS[k]); sel = null; traza = []; bar.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); bar.appendChild(b); });
    var s = svgDe(cu, 480, 330); s.classList.add('grafo'); cu.insertBefore(s, bar);
    var lado = el('div', { class: 'gpanel' }); cu.insertBefore(lado, bar);
    function pos(e) { var r = s.getBoundingClientRect(); return [(e.clientX - r.left) * 480 / r.width, (e.clientY - r.top) * 330 / r.height]; }
    function cerca(p) { for (var i = 0; i < g.V.length; i++) if (Math.hypot(g.V[i][0] - p[0], g.V[i][1] - p[1]) < 18) return i; return -1; }
    function aristaCerca(p) {
      var mejor = -1, md = 9;
      g.E.forEach(function (e, k) { var a = g.V[e[0]], b = g.V[e[1]], m = curva(e, k); var q = [(a[0] + b[0]) / 4 + m[0] / 2, (a[1] + b[1]) / 4 + m[1] / 2]; var d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < md + 6) { md = d; mejor = k; } });
      return mejor;
    }
    function curva(e, k) { // punto de control para aristas múltiples
      var a = g.V[e[0]], b = g.V[e[1]], igual = 0, idx = 0;
      g.E.forEach(function (f, j) { if ((f[0] === e[0] && f[1] === e[1]) || (f[0] === e[1] && f[1] === e[0])) { if (j < k) idx++; igual++; } });
      var off = igual > 1 ? (idx - (igual - 1) / 2) * 40 : 0, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      if (e[0] > e[1]) off = -off;
      return [(a[0] + b[0]) / 2 - dy / L * off, (a[1] + b[1]) / 2 + dx / L * off];
    }
    s.addEventListener('pointerdown', function (e) {
      var p = pos(e), i = cerca(p); movio = false;
      if (i >= 0) { arr = i; s.setPointerCapture(e.pointerId); }
      else { arr = null; if (opciones.modo !== 'traza') { var k = aristaCerca(p); if (k >= 0 && e.shiftKey) { g.E.splice(k, 1); pinta(); return; } } }
      e.preventDefault();
    });
    s.addEventListener('pointermove', function (e) { if (arr === null) return; var p = pos(e); if (Math.hypot(p[0] - g.V[arr][0], p[1] - g.V[arr][1]) > 3) movio = true; if (movio) { g.V[arr] = [Math.max(16, Math.min(464, p[0])), Math.max(16, Math.min(314, p[1]))]; pinta(); } });
    s.addEventListener('pointerup', function (e) {
      var p = pos(e), i = cerca(p);
      if (arr !== null && !movio) {
        if (opciones.modo === 'traza') return clicTraza(i);
        if (sel === null) sel = i; else if (sel === i) sel = null; else { g.E.push([sel, i]); sel = null; }
      } else if (arr === null && i < 0 && !movio && opciones.modo !== 'traza') {
        if (g.V.length < 26) g.V.push(p);
      }
      arr = null; pinta();
    });
    s.addEventListener('dblclick', function (e) {
      if (opciones.modo === 'traza') return;
      var i = cerca(pos(e)); if (i < 0) return;
      g.E = g.E.filter(function (x) { return x[0] !== i && x[1] !== i; }).map(function (x) { return [x[0] > i ? x[0] - 1 : x[0], x[1] > i ? x[1] - 1 : x[1]]; });
      g.V.splice(i, 1); sel = null; pinta();
    });
    // modo de trazado (Euler / Hamilton)
    function clicTraza(i) {
      if (i < 0) return;
      if (opciones.tipo === 'hamilton') {
        if (traza.length && traza[traza.length - 1] === i) { traza.pop(); }
        else if (!traza.length) traza.push(i);
        else {
          var ult = traza[traza.length - 1], ady = g.E.some(function (e) { return (e[0] === ult && e[1] === i) || (e[1] === ult && e[0] === i); });
          if (ady && (traza.indexOf(i) < 0 || (i === traza[0] && traza.length === g.V.length))) traza.push(i);
        }
      } else { // Euler: se recorren aristas; traza guarda vértices y aristas usadas
        if (!traza.length) { traza = [i]; traza.usadas = []; }
        else {
          var u = traza[traza.length - 1], k = -1;
          g.E.forEach(function (e, j) { if (k < 0 && traza.usadas.indexOf(j) < 0 && ((e[0] === u && e[1] === i) || (e[1] === u && e[0] === i))) k = j; });
          if (k >= 0) { traza.push(i); traza.usadas.push(k); }
          else if (i === u && traza.length > 1) { traza.pop(); traza.usadas.pop(); }
          else if (i === u) { traza = []; }
        }
      }
      pinta();
    }
    function pinta() {
      var d = grados(g), h = '', usadas = (traza && traza.usadas) || [];
      var hamE = []; if (opciones.tipo === 'hamilton') for (var t = 1; t < traza.length; t++) hamE.push([traza[t - 1], traza[t]]);
      g.E.forEach(function (e, k) {
        var a = g.V[e[0]], b = g.V[e[1]], m = curva(e, k);
        var on = usadas.indexOf(k) >= 0 || hamE.some(function (x) { return (x[0] === e[0] && x[1] === e[1]) || (x[0] === e[1] && x[1] === e[0]); });
        var orden = usadas.indexOf(k);
        h += '<path d="M' + a + ' Q' + m + ' ' + b + '" fill="none" stroke="' + (on ? K.naraV : '#5a504a') + '" stroke-width="' + (on ? 5 : 2.4) + '" stroke-linecap="round"/>';
        if (orden >= 0) { var q = [(a[0] + b[0]) / 4 + m[0] / 2, (a[1] + b[1]) / 4 + m[1] / 2]; h += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="9" fill="#fff" stroke="' + K.naraV + '" stroke-width="1.5"/>' + txt(q[0], q[1] + 1, orden + 1, { s: 10, b: true, c: K.nara, mono: true }); }
      });
      g.V.forEach(function (p, i) {
        var impar = d[i] % 2 === 1, enT = traza.indexOf(i) >= 0, ultimo = traza[traza.length - 1] === i;
        var fill = sel === i ? '#ffd27a' : ultimo ? K.naraV : enT ? '#fde2c2' : (opciones.marcaImpares && impar ? '#fbe0e0' : K.naraC);
        var stroke = opciones.marcaImpares && impar ? K.rojo : (i === sel ? K.naraV : K.nara);
        h += '<g><circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.4"/>' + txt(p[0], p[1] + 1, nombreV(i), { it: true, b: true, c: ultimo ? '#fff' : K.tinta, s: 15 }) +
          (opciones.verGrados ? '<g><circle cx="' + (p[0] + 15) + '" cy="' + (p[1] - 15) + '" r="9" fill="' + (impar ? K.rojo : K.azul) + '"/>' + txt(p[0] + 15, p[1] - 14, d[i], { s: 10.5, b: true, c: '#fff', mono: true }) + '</g>' : '') + '</g>';
      });
      s.innerHTML = h;
      lado.innerHTML = opciones.panel(g, d, traza);
    }
    pinta();
    return { pinta: pinta };
  }
  function matriz(g) {
    var n = g.V.length; if (!n) return ''; if (n > 10) return '<p class="nota">(la matriz se muestra hasta con 10 vértices)</p>';
    var M = []; for (var i = 0; i < n; i++) { M.push([]); for (var j = 0; j < n; j++) M[i].push(0); }
    g.E.forEach(function (e) { M[e[0]][e[1]]++; if (e[0] !== e[1]) M[e[1]][e[0]]++; });
    return '<table class="matriz"><tr><th></th>' + M.map(function (_, j) { return '<th>' + nombreV(j) + '</th>'; }).join('') + '</tr>' + M.map(function (f, i) { return '<tr><th>' + nombreV(i) + '</th>' + f.map(function (x) { return '<td class="' + (x ? 'uno' : '') + '">' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  A['grafo-editor'] = function (c) {
    editorGrafo(c, { inicial: 'Casita', verGrados: true, panel: function (g, d) {
      var S = d.reduce(function (a, b) { return a + b; }, 0);
      return '<div class="dato"><b>' + g.V.length + '</b> vértices · <b>' + g.E.length + '</b> aristas</div>' +
        '<div class="dato">Suma de grados = ' + (d.join(' + ') || '0') + ' = <b>' + S + '</b> = 2 · ' + g.E.length + '</div>' +
        '<div class="dato">' + (componentes(g) <= 1 ? '<b class="v">Conexo</b>' : '<b class="f">' + componentes(g) + ' componentes</b>') + '</div>' +
        '<div class="dato"><small>Matriz de adyacencia</small>' + matriz(g) + '</div>';
    } });
    c.querySelector('.lect').innerHTML = '<span>Toca un espacio vacío para crear un vértice; toca dos vértices para unirlos; arrastra para mover. Doble toque borra un vértice; Mayús + clic en una arista la borra.</span>';
  };
  A['euler'] = function (c) {
    editorGrafo(c, { inicial: 'Königsberg', presets: ['Königsberg', 'Casita', 'K₄', 'K₅', 'K₃,₃', 'Petersen'], modo: 'traza', tipo: 'euler', verGrados: true, marcaImpares: true, panel: function (g, d, tr) {
      var imp = d.filter(function (x) { return x % 2; }).length, con = componentes(g) <= 1;
      var dic = !con ? 'No es conexo: no hay recorrido de Euler.' : imp === 0 ? '<b class="v">Tiene circuito de Euler</b>: todos los grados son pares.' : imp === 2 ? '<b class="v">Tiene camino de Euler</b> (no circuito): empieza en un vértice impar y termina en el otro.' : '<b class="f">No tiene camino ni circuito de Euler</b>: hay ' + imp + ' vértices de grado impar.';
      var u = (tr.usadas || []).length;
      return '<div class="dato">Vértices de grado impar (en rojo): <b>' + imp + '</b></div><div class="dato">' + dic + '</div>' +
        '<div class="dato">Tu trazo: ' + (tr.length ? tr.map(nombreV).join(' → ') : '—') + '</div><div class="dato">Aristas usadas: <b>' + u + '</b> de ' + g.E.length + (u === g.E.length && u ? ' — <b class="v">¡Lo lograste!</b>' : '') + '</div>';
    } });
    c.querySelector('.lect').innerHTML = '<span>Toca vértices vecinos para recorrer aristas sin repetir. Toca el último vértice para deshacer.</span>';
  };
  A['hamilton'] = function (c) {
    var dodeca = (function () {
      var V = [], E = [], R = [140, 100, 62, 30];
      // dodecaedro como grafo plano: 4 anillos de 5
      var r = [150, 105, 70, 34], cx = 240, cy = 168, i;
      for (i = 0; i < 5; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / 5; V.push([cx + r[0] * Math.cos(a), cy + r[0] * Math.sin(a)]); }
      for (i = 0; i < 10; i++) { var b = -Math.PI / 2 + 2 * Math.PI * i / 10; var rr = i % 2 ? r[2] + 25 : r[1]; V.push([cx + rr * Math.cos(b), cy + rr * Math.sin(b)]); }
      for (i = 0; i < 5; i++) { var cc = -Math.PI / 2 + Math.PI / 5 + 2 * Math.PI * i / 5; V.push([cx + r[3] * Math.cos(cc), cy + r[3] * Math.sin(cc)]); }
      for (i = 0; i < 5; i++) { E.push([i, (i + 1) % 5]); E.push([i, 5 + 2 * i]); }
      for (i = 0; i < 10; i++) E.push([5 + i, 5 + (i + 1) % 10]);
      for (i = 0; i < 5; i++) { E.push([6 + 2 * i, 15 + i]); E.push([15 + i, 15 + (i + 1) % 5]); }
      return { V: V, E: E };
    })();
    PRESETS['Dodecaedro'] = dodeca;
    editorGrafo(c, { inicial: 'Dodecaedro', presets: ['Dodecaedro', 'Casita', 'K₃,₃', 'Petersen'], modo: 'traza', tipo: 'hamilton', panel: function (g, d, tr) {
      var n = g.V.length, ciclo = tr.length === n + 1 && tr[0] === tr[n];
      return '<div class="dato">Visitados: <b>' + new Set(tr).size + '</b> de ' + n + '</div><div class="dato">Recorrido: ' + (tr.length ? tr.map(nombreV).join(' → ') : '—') + '</div>' +
        '<div class="dato">' + (ciclo ? '<b class="v">¡Ciclo de Hamilton!</b> Pasaste una vez por cada vértice y volviste al inicio.' : tr.length === n ? 'Camino de Hamilton completo. ¿Puedes volver al inicio?' : 'Pasa por todos los vértices una sola vez y regresa al primero.') + '</div>' +
        '<div class="dato nota">Este es el «juego icosiano» de Hamilton (1857). Con el grafo de Petersen, por más que intentes, no hay ciclo.</div>';
    } });
    c.querySelector('.lect').innerHTML = '<span>Toca un vértice para empezar y luego vecinos. Toca el último para deshacer.</span>';
  };

  /* =============== ÁRBOLES =============== */
  function insertaABB(r, x) { if (!r) return { v: x }; if (x < r.v) r.i = insertaABB(r.i, x); else if (x > r.v) r.d = insertaABB(r.d, x); return r; }
  function dibujaArbol(s, r, marca, W, H) {
    W = W || 640; H = H || 320; var h = '', prof = 0;
    (function p(n, d) { if (!n) return; prof = Math.max(prof, d); p(n.i, d + 1); p(n.d, d + 1); })(r, 0);
    var dy = Math.min(70, (H - 50) / Math.max(prof, 1));
    (function lay(n, x0, x1, d) { if (!n) return; n.x = (x0 + x1) / 2; n.y = 30 + d * dy; lay(n.i, x0, n.x, d + 1); lay(n.d, n.x, x1, d + 1); })(r, 10, W - 10, 0);
    (function ar(n) { if (!n) return; [n.i, n.d].forEach(function (h2) { if (h2) h += '<line x1="' + n.x + '" y1="' + n.y + '" x2="' + h2.x + '" y2="' + h2.y + '" stroke="#5a504a" stroke-width="2.2"/>'; }); ar(n.i); ar(n.d); })(r);
    (function nd(n) { if (!n) return; var m = marca ? marca(n) : null; h += '<circle cx="' + n.x + '" cy="' + n.y + '" r="17" fill="' + (m === 'act' ? K.naraV : m === 'vis' ? '#fde2c2' : K.naraC) + '" stroke="' + K.nara + '" stroke-width="2.4"/>' + txt(n.x, n.y + 1, n.v, { b: true, s: 14, c: m === 'act' ? '#fff' : K.tinta }); nd(n.i); nd(n.d); })(r);
    s.innerHTML = h;
  }
  A['arbol-busqueda'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 320), raiz = null, lista = [];
    var ctl = el('div', { class: 'ctl3d' }, '<label class="desl"><span>Número</span><input type="number" min="1" max="99" value="42" style="width:5em"></label><button type="button" class="chip on" data-a="ins">Insertar</button><button type="button" class="chip" data-a="azar">Al azar</button><button type="button" class="chip" data-a="borrar">Vaciar</button>');
    cu.appendChild(ctl); var inp = ctl.querySelector('input');
    function inserta(x) { if (isNaN(x) || lista.indexOf(x) >= 0 || lista.length >= 15) return; lista.push(x); raiz = insertaABB(raiz, x); pinta(x); }
    ctl.querySelector('[data-a=ins]').addEventListener('click', function () { inserta(+inp.value); inp.value = Math.floor(Math.random() * 99) + 1; });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { inserta(+inp.value); inp.value = ''; } });
    ctl.querySelector('[data-a=azar]').addEventListener('click', function () { raiz = null; lista = []; for (var k = 0; k < 9; k++) inserta(Math.floor(Math.random() * 99) + 1); });
    ctl.querySelector('[data-a=borrar]').addEventListener('click', function () { raiz = null; lista = []; pinta(); });
    function pinta(ult) {
      if (!raiz) { s.innerHTML = txt(320, 160, 'Inserta un número para plantar el árbol', { c: K.gris }); c.querySelector('.lect').innerHTML = ''; return; }
      dibujaArbol(s, raiz, function (n) { return n.v === ult ? 'act' : null; });
      var io = []; (function f(n) { if (!n) return; f(n.i); io.push(n.v); f(n.d); })(raiz);
      c.querySelector('.lect').innerHTML = '<span>Orden de llegada: ' + lista.join(', ') + '</span><span>Inorden: <b>' + io.join(', ') + '</b> (¡queda ordenado!)</span>';
    }
    [50, 30, 70, 20, 40, 60, 80].forEach(function (x) { lista.push(x); raiz = insertaABB(raiz, x); }); pinta();
  };
  A['recorridos'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgDe(cu, 640, 300), tipo = 'pre', paso = 0, timer = null;
    var raiz = { v: 'A', i: { v: 'B', i: { v: 'D' }, d: { v: 'E', i: { v: 'H' } } }, d: { v: 'C', i: { v: 'F' }, d: { v: 'G', d: { v: 'I' } } } };
    var ctl = el('div', { class: 'ctl3d' }, '<div class="grupo"><button type="button" class="chip on" data-t="pre">Preorden</button><button type="button" class="chip" data-t="in">Inorden</button><button type="button" class="chip" data-t="post">Postorden</button></div><button type="button" class="chip" data-a="paso">Paso ▸</button><button type="button" class="chip" data-a="play">▶ Animar</button><button type="button" class="chip" data-a="rein">Reiniciar</button>');
    cu.appendChild(ctl);
    function orden() { var L = []; (function f(n) { if (!n) return; if (tipo === 'pre') L.push(n); f(n.i); if (tipo === 'in') L.push(n); f(n.d); if (tipo === 'post') L.push(n); })(raiz); return L; }
    function pinta() {
      var L = orden(), vis = L.slice(0, paso);
      dibujaArbol(s, raiz, function (n) { var k = vis.indexOf(n); return k < 0 ? null : (k === vis.length - 1 ? 'act' : 'vis'); }, 640, 300);
      var regla = { pre: 'raíz → izquierdo → derecho', in: 'izquierdo → raíz → derecho', post: 'izquierdo → derecho → raíz' }[tipo];
      c.querySelector('.lect').innerHTML = '<span>Regla: <b>' + regla + '</b></span><span>Visitados: ' + (vis.map(function (n) { return n.v; }).join(' ') || '—') + '</span>' + (paso === L.length ? '<span class="v"><b>Recorrido completo.</b></span>' : '');
    }
    ctl.querySelectorAll('[data-t]').forEach(function (b) { b.addEventListener('click', function () { tipo = b.dataset.t; paso = 0; ctl.querySelectorAll('[data-t]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); }); });
    ctl.querySelector('[data-a=paso]').addEventListener('click', function () { if (paso < 9) paso++; pinta(); });
    ctl.querySelector('[data-a=rein]').addEventListener('click', function () { paso = 0; clearInterval(timer); pinta(); });
    ctl.querySelector('[data-a=play]').addEventListener('click', function () { clearInterval(timer); paso = 0; pinta(); timer = setInterval(function () { paso++; pinta(); if (paso >= 9) clearInterval(timer); }, 700); });
    pinta();
  };

  /* =============== PORTADA: triángulo de Pascal módulo m =============== */
  window.MDportada = function (cv, filas, m) {
    var dpr = window.devicePixelRatio || 1, W = +cv.getAttribute('width'), H = +cv.getAttribute('height');
    if (!cv._ok) { cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; cv._ok = 1; }
    var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var r = Math.min((H - 10) / filas / 0.866 / 2, (W - 10) / filas / 2), fila = [1];
    var pal = ['#ffffff', '#F2A93B', '#E27A18', '#C15E14', '#ffd27a', '#7fb6d6', '#2A7FA8', '#f6c9a0', '#A0410A', '#ffe9c7', '#5aa0c8', '#d98b3a', '#fff'];
    for (var i = 0; i < filas; i++) {
      for (var j = 0; j <= i; j++) {
        var x = W / 2 + (j - i / 2) * 2 * r, y = 6 + r + i * 2 * r * 0.866, res = fila[j] % m;
        ctx.beginPath();
        for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(x + r * 1.02 * Math.cos(a), y + r * 1.02 * Math.sin(a)); }
        ctx.closePath();
        if (res === 0) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; }
        else { ctx.fillStyle = pal[res % pal.length]; }
        ctx.fill();
        if (r > 7 && res) { ctx.fillStyle = 'rgba(80,30,5,.75)'; ctx.font = Math.round(r * 0.8) + 'px ui-monospace,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(res, x, y + 1); }
      }
      var nueva = [1]; for (j = 1; j <= i; j++) nueva.push((fila[j - 1] + fila[j]) % m); nueva.push(1); fila = nueva;
    }
  };

  /* ---------- arranque ---------- */
  function inicia() {
    document.querySelectorAll('.applet[data-md]').forEach(function (e) { var f = A[e.getAttribute('data-md')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var cv = document.querySelector('canvas.pascal');
    if (cv) {
      var f = document.getElementById('pascal-filas'), m = document.getElementById('pascal-mod');
      var re = function () { document.getElementById('pascal-filas-v').textContent = f.value; document.getElementById('pascal-mod-v').textContent = m.value; window.MDportada(cv, +f.value, +m.value); };
      if (f) { f.addEventListener('input', re); m.addEventListener('input', re); re(); } else window.MDportada(cv, +(cv.dataset.filas || 32), +(cv.dataset.mod || 2));
    }
    document.querySelectorAll('canvas.pascal-mini').forEach(function (c2) { window.MDportada(c2, +c2.dataset.filas, +c2.dataset.mod); });
  }
  window.MDapplets = A;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

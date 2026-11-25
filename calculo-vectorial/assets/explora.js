/* Laboratorios exploratorios: mover, observar y descubrir.  santiagoalzates.com */
(function () {
  'use strict';
  var COL = { tinta: '#1c2530', gris: '#9aa3ad', teal: '#006e78', ambar: '#c47800', rojo: '#c0392b', verde: '#1d8a4a', morado: '#664896', fondo: '#fbfaf7' };
  function css(v, d) { var x = getComputedStyle(document.body).getPropertyValue(v).trim(); return x || d; }
  COL.teal = css('--teal', COL.teal); COL.ambar = css('--ambar', COL.ambar);

  /* ---------- utilidades de dibujo ---------- */
  function Lienzo(cont, alto, vista) {
    var c = document.createElement('canvas'); c.className = 'exp-canvas'; c.setAttribute('role', 'img');
    cont.appendChild(c);
    var L = { c: c, ctx: c.getContext('2d'), v: vista, w: 0, h: alto };
    L.ajusta = function () {
      var w = Math.min(cont.clientWidth || 600, 720), dpr = window.devicePixelRatio || 1;
      c.style.width = w + 'px'; c.style.height = alto + 'px'; c.width = w * dpr; c.height = alto * dpr;
      L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); L.w = w;
    };
    L.X = function (x) { return (x - L.v[0]) / (L.v[1] - L.v[0]) * L.w; };
    L.Y = function (y) { return L.h - (y - L.v[2]) / (L.v[3] - L.v[2]) * L.h; };
    L.ix = function (px) { return L.v[0] + px / L.w * (L.v[1] - L.v[0]); };
    L.iy = function (py) { return L.v[2] + (L.h - py) / L.h * (L.v[3] - L.v[2]); };
    L.limpia = function () { L.ctx.clearRect(0, 0, L.w, L.h); };
    L.ejes = function (paso, pasoY) {
      var g = L.ctx; g.save(); g.strokeStyle = '#e6e8ea'; g.lineWidth = 1; paso = paso || 1; pasoY = pasoY || paso;
      for (var x = Math.ceil(L.v[0] / paso) * paso; x <= L.v[1]; x += paso) { g.beginPath(); g.moveTo(L.X(x), 0); g.lineTo(L.X(x), L.h); g.stroke(); }
      for (var y = Math.ceil(L.v[2] / pasoY) * pasoY; y <= L.v[3]; y += pasoY) { g.beginPath(); g.moveTo(0, L.Y(y)); g.lineTo(L.w, L.Y(y)); g.stroke(); }
      g.strokeStyle = '#8a939c'; g.lineWidth = 1.2;
      if (L.v[2] <= 0 && L.v[3] >= 0) { g.beginPath(); g.moveTo(0, L.Y(0)); g.lineTo(L.w, L.Y(0)); g.stroke(); }
      if (L.v[0] <= 0 && L.v[1] >= 0) { g.beginPath(); g.moveTo(L.X(0), 0); g.lineTo(L.X(0), L.h); g.stroke(); }
      g.restore();
    };
    L.curva = function (f, col, ancho, a, b) {
      var g = L.ctx; g.save(); g.strokeStyle = col; g.lineWidth = ancho || 2.2; g.beginPath(); var pri = true;
      a = a === undefined ? L.v[0] : a; b = b === undefined ? L.v[1] : b;
      for (var i = 0; i <= 400; i++) { var x = a + (b - a) * i / 400, y = f(x); if (!isFinite(y) || y > L.v[3] + 50 || y < L.v[2] - 50) { pri = true; continue; } if (pri) { g.moveTo(L.X(x), L.Y(y)); pri = false; } else g.lineTo(L.X(x), L.Y(y)); }
      g.stroke(); g.restore();
    };
    L.punto = function (x, y, col, r) { var g = L.ctx; g.save(); g.fillStyle = col; g.beginPath(); g.arc(L.X(x), L.Y(y), r || 5, 0, 7); g.fill(); g.restore(); };
    L.linea = function (x1, y1, x2, y2, col, ancho, dash) { var g = L.ctx; g.save(); g.strokeStyle = col; g.lineWidth = ancho || 1.5; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(L.X(x1), L.Y(y1)); g.lineTo(L.X(x2), L.Y(y2)); g.stroke(); g.restore(); };
    L.texto = function (t, x, y, col, al) { var g = L.ctx; g.save(); g.fillStyle = col || COL.tinta; g.font = '13px system-ui, sans-serif'; g.textAlign = al || 'left'; g.fillText(t, L.X(x), L.Y(y)); g.restore(); };
    L.banda = function (y1, y2, col) { var g = L.ctx; g.save(); g.fillStyle = col; g.fillRect(0, L.Y(y2), L.w, L.Y(y1) - L.Y(y2)); g.restore(); };
    L.bandaV = function (x1, x2, col) { var g = L.ctx; g.save(); g.fillStyle = col; g.fillRect(L.X(x1), 0, L.X(x2) - L.X(x1), L.h); g.restore(); };
    L.arrastre = function (puntos, mover) {           /* puntos(): [[x,y],...]; mover(i, x, y) */
      var act = -1;
      function pos(e) { var r = c.getBoundingClientRect(); return [L.ix(e.clientX - r.left), L.iy(e.clientY - r.top), e.clientX - r.left, e.clientY - r.top]; }
      c.style.touchAction = 'none';
      c.addEventListener('pointerdown', function (e) {
        var p = pos(e), P = puntos(), mejor = 24;
        P.forEach(function (q, i) { var d = Math.hypot(L.X(q[0]) - p[2], L.Y(q[1]) - p[3]); if (d < mejor) { mejor = d; act = i; } });
        if (act >= 0) { c.setPointerCapture(e.pointerId); mover(act, p[0], p[1]); }
      });
      c.addEventListener('pointermove', function (e) { if (act >= 0) { var p = pos(e); mover(act, p[0], p[1]); } });
      c.addEventListener('pointerup', function () { act = -1; }); c.addEventListener('pointercancel', function () { act = -1; });
    };
    L.ajusta(); window.addEventListener('resize', function () { L.ajusta(); if (L.redibuja) L.redibuja(); });
    return L;
  }
  function deslizador(cont, etiqueta, min, max, paso, valor, fmt) {
    var d = document.createElement('label'); d.className = 'exp-desl';
    d.innerHTML = '<span>' + etiqueta + '</span><input type="range" min="' + min + '" max="' + max + '" step="' + paso + '" value="' + valor + '"><b></b>';
    cont.appendChild(d); var inp = d.querySelector('input'), b = d.querySelector('b');
    var o = { inp: inp, get v() { return parseFloat(inp.value); }, set v(x) { inp.value = x; b.textContent = (fmt || f2)(parseFloat(inp.value)); } };
    b.textContent = (fmt || f2)(valor); inp.addEventListener('input', function () { b.textContent = (fmt || f2)(parseFloat(inp.value)); });
    return o;
  }
  function f2(x) { return (Math.round(x * 1000) / 1000).toString().replace('.', ','); }
  function f4(x) { return (Math.round(x * 10000) / 10000).toString().replace('.', ','); }
  function lectura(cont) { var d = document.createElement('div'); d.className = 'exp-lect'; cont.appendChild(d); return d; }
  function reto(cont, texto, pide, comprueba, al) {
    var r = document.createElement('div'); r.className = 'exp-reto';
    r.innerHTML = '<b>🎯 Reto:</b> ' + texto + (pide ? ' <span class="exp-resp"><input type="text" inputmode="decimal" placeholder="Tu respuesta" aria-label="Respuesta del reto"><button>Comprobar</button></span>' : '') + '<div class="fb"></div>';
    cont.appendChild(r);
    var fb = r.querySelector('.fb');
    function evalua(v) {
      var ok = comprueba(v);
      if (ok === null) return;
      if (window.__Voz) window.__Voz.muestra(fb, ok, ok ? (al || '¡Reto cumplido!') : 'Mueve los controles y vuelve a intentarlo.');
      if (ok && r.__fin) r.__fin();
    }
    if (pide) {
      var inp = r.querySelector('input');
      var leer = function () { var v = parseFloat(inp.value.replace(',', '.')); if (isFinite(v)) evalua(v); };
      r.querySelector('button').addEventListener('click', leer); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') leer(); });
    }
    return { evalua: evalua, el: r };
  }

  var W = {};

  /* 1. Límite ε–δ */
  W.epsdelta = function (c, D) {
    var f = function (x) { return x * x; }, a = 2, Lm = 4;
    var L = Lienzo(c, 300, [0.8, 3.2, 1, 7.5]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var e = deslizador(ctr, 'ε', 0.05, 2, 0.01, 0.5), d = deslizador(ctr, 'δ', 0.01, 0.8, 0.005, 0.3);
    var lec = lectura(c);
    var R = reto(c, 'Con ε = 0,5, encuentra un δ que funcione: toda la curva dentro de la franja vertical debe quedar dentro de la franja horizontal (verde). ¿Cuál es el δ más grande posible? (3 decimales)', true,
      function (v) { return Math.abs(v - (Math.sqrt(4.5) - 2)) < 0.004; }, '¡Exacto! δ = √4,5 − 2 ≈ 0,121: el lado derecho es el más exigente.');
    R.el.__fin = c.__fin;
    function sirve(eps, del) { for (var i = 0; i <= 200; i++) { var x = a - del + 2 * del * i / 200; if (Math.abs(f(x) - Lm) >= eps) return false; } return true; }
    function dib() {
      L.limpia(); L.ejes(1);
      var ok = sirve(e.v, d.v);
      L.banda(Lm - e.v, Lm + e.v, 'rgba(0,110,120,.12)'); L.bandaV(a - d.v, a + d.v, ok ? 'rgba(29,138,74,.18)' : 'rgba(192,57,43,.16)');
      L.curva(f, COL.tinta, 2.4); L.punto(a, Lm, COL.ambar, 5);
      L.texto('L + ε', 0.82, Lm + e.v + 0.1, COL.teal); L.texto('L − ε', 0.82, Lm - e.v - 0.3, COL.teal);
      lec.innerHTML = ok ? '✅ Con este δ, si |x − 2| &lt; δ entonces |x² − 4| &lt; ε.' : '❌ Hay puntos con |x − 2| &lt; δ cuya imagen se sale de la franja: achica δ.';
    }
    [e, d].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* 2. De la secante a la tangente */
  W.secante = function (c, D) {
    var f = function (x) { return x * x * x / 3 - x + 1; }, fp = function (x) { return x * x - 1; };
    var L = Lienzo(c, 300, [-2.6, 3, -1.5, 5]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var a = deslizador(ctr, 'a', -2, 2.4, 0.05, 1.5), h = deslizador(ctr, 'h', -1.5, 1.5, 0.01, 1);
    var lec = lectura(c);
    reto(c, 'Pon a = 1,5 y acerca h a 0 (por los dos lados). ¿A qué número se acerca la pendiente de la secante?', true, function (v) { return Math.abs(v - 1.25) < 0.01; },
      '¡Eso es la derivada! f′(1,5) = 1,5² − 1 = 1,25.').el.__fin = c.__fin;
    function dib() {
      L.limpia(); L.ejes(1); L.curva(f, COL.tinta, 2.4);
      var x0 = a.v, hh = Math.abs(h.v) < 0.005 ? 0.005 : h.v, m = (f(x0 + hh) - f(x0)) / hh, mt = fp(x0);
      L.linea(-3, f(x0) + m * (-3 - x0), 3.2, f(x0) + m * (3.2 - x0), COL.ambar, 2);
      L.linea(-3, f(x0) + mt * (-3 - x0), 3.2, f(x0) + mt * (3.2 - x0), COL.teal, 1.6, [6, 5]);
      L.punto(x0, f(x0), COL.teal, 5); L.punto(x0 + hh, f(x0 + hh), COL.ambar, 5);
      lec.innerHTML = 'Pendiente de la secante: <b style="color:' + COL.ambar + '">' + f4(m) + '</b> · pendiente de la tangente (punteada): <b style="color:' + COL.teal + '">' + f4(mt) + '</b>';
    }
    [a, h].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* 3. f, f′ y f″ sincronizadas */
  W.derivadas = function (c, D) {
    var f = function (x) { return x * x * x - 3 * x * x + 1; }, f1 = function (x) { return 3 * x * x - 6 * x; }, f2_ = function (x) { return 6 * x - 6; };
    var cajas = [['f', f, COL.tinta, [-1.5, 3.5, -4, 3]], ["f′", f1, COL.teal, [-1.5, 3.5, -4, 10]], ["f″", f2_, COL.ambar, [-1.5, 3.5, -15, 15]]];
    var Ls = cajas.map(function (k) { return Lienzo(c, 150, k[3]); });
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var x = deslizador(ctr, 'x', -1.4, 3.4, 0.01, 0.5); var lec = lectura(c);
    reto(c, 'Mueve x hasta el punto donde f cambia de concavidad (f″ cambia de signo). ¿Cuál es esa abscisa?', true, function (v) { return Math.abs(v - 1) < 0.02; },
      '¡Punto de inflexión en x = 1! Ahí f′ tiene su mínimo y f″ = 0.').el.__fin = c.__fin;
    function dib() {
      Ls.forEach(function (L, i) {
        L.limpia(); L.ejes(1, i === 2 ? 5 : i === 1 ? 2 : 1); L.curva(cajas[i][1], cajas[i][2], 2.2); L.linea(x.v, L.v[2], x.v, L.v[3], COL.rojo, 1, [4, 4]);
        L.punto(x.v, cajas[i][1](x.v), COL.rojo, 4); L.texto(cajas[i][0], L.v[0] + 0.05, L.v[3] - (L.v[3] - L.v[2]) * 0.12, cajas[i][2]);
      });
      var a = f1(x.v), b = f2_(x.v);
      lec.innerHTML = 'f′(x) = ' + f2(a) + (a > 0 ? ' → f <b>crece</b>' : a < 0 ? ' → f <b>decrece</b>' : ' → punto crítico') + ' · f″(x) = ' + f2(b) + (b > 0 ? ' → cóncava <b>hacia arriba</b>' : b < 0 ? ' → cóncava <b>hacia abajo</b>' : ' → posible inflexión');
    }
    x.inp.addEventListener('input', dib); Ls[0].redibuja = dib; dib();
  };

  /* 4. La caja de volumen máximo */
  W.caja = function (c, D) {
    var S = 12, V = function (x) { return x * (S - 2 * x) * (S - 2 * x); };
    var L = Lienzo(c, 280, [-0.3, 12.5, -0.6, 12.6]), G = Lienzo(c, 200, [0, 6, 0, 140]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var x = deslizador(ctr, 'corte x', 0.1, 5.9, 0.01, 1);
    var lec = lectura(c), hecho = false;
    var R = reto(c, 'Mueve el corte hasta lograr el volumen máximo (con dos decimales).', false, function () { return true; }, '¡Máximo en x = 2! V = 2·8·8 = 128.');
    function dib() {
      L.limpia(); var g = L.ctx, xx = x.v;
      g.save(); g.fillStyle = 'rgba(0,110,120,.10)'; g.strokeStyle = COL.teal; g.lineWidth = 2; g.fillRect(L.X(0), L.Y(S), L.X(S) - L.X(0), L.Y(0) - L.Y(S)); g.strokeRect(L.X(0), L.Y(S), L.X(S) - L.X(0), L.Y(0) - L.Y(S));
      g.fillStyle = '#fff'; g.strokeStyle = COL.rojo; [[0, 0], [S - xx, 0], [0, S - xx], [S - xx, S - xx]].forEach(function (p) { g.fillRect(L.X(p[0]), L.Y(p[1] + xx), L.X(xx) - L.X(0), L.Y(0) - L.Y(xx)); g.strokeRect(L.X(p[0]), L.Y(p[1] + xx), L.X(xx) - L.X(0), L.Y(0) - L.Y(xx)); });
      g.setLineDash([5, 4]); g.strokeStyle = COL.ambar; g.strokeRect(L.X(xx), L.Y(S - xx), L.X(S - xx) - L.X(xx), L.Y(xx) - L.Y(S - xx)); g.restore();
      G.limpia(); G.ejes(1, 20); G.curva(V, COL.teal, 2.2, 0, 6); G.punto(xx, V(xx), COL.rojo, 5);
      lec.innerHTML = 'Base ' + f2(S - 2 * xx) + ' × ' + f2(S - 2 * xx) + ', altura ' + f2(xx) + ' → <b>V = ' + f2(V(xx)) + '</b>';
      if (!hecho && Math.abs(xx - 2) < 0.02) { hecho = true; R.evalua(1); if (c.__fin) c.__fin(); }
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* 5. La escalera que resbala */
  W.escalera = function (c, D) {
    var Lg = 5;
    var L = Lienzo(c, 300, [-0.5, 6, -0.5, 5.6]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var x = deslizador(ctr, 'base x', 0.3, 4.95, 0.01, 3);
    var lec = lectura(c);
    reto(c, 'La base se aleja a 1 m/s. ¿A qué distancia x de la pared la parte alta baja exactamente a 1 m/s? (2 decimales)', true, function (v) { return Math.abs(v - 5 / Math.SQRT2) < 0.02; },
      '¡Bien! Cuando x = y = 5/√2 ≈ 3,54 m las dos velocidades son iguales; después, la parte alta cae cada vez más rápido.').el.__fin = c.__fin;
    function dib() {
      L.limpia(); var xx = x.v, y = Math.sqrt(Lg * Lg - xx * xx);
      L.linea(-0.5, 0, 6, 0, COL.tinta, 3); L.linea(0, 0, 0, 5.6, COL.tinta, 3);
      L.linea(xx, 0, 0, y, COL.ambar, 6); L.punto(xx, 0, COL.teal, 6); L.punto(0, y, COL.rojo, 6);
      var dy = -xx / y;
      L.texto('x = ' + f2(xx) + ' m', xx, -0.35, COL.teal, 'center'); L.texto('y = ' + f2(y) + ' m', 0.15, y + 0.15, COL.rojo);
      lec.innerHTML = 'x² + y² = 25 ⇒ 2x·x′ + 2y·y′ = 0 ⇒ <b>y′ = −x·x′/y = ' + f2(dy) + ' m/s</b> (con x′ = 1 m/s)';
    }
    x.inp.addEventListener('input', dib); L.redibuja = dib; dib();
  };

  /* 6. xⁿ: puntual pero no uniforme */
  W.unif = function (c, D) {
    var L = Lienzo(c, 300, [-0.03, 1.05, -0.08, 1.08]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var n = deslizador(ctr, 'n', 1, 80, 1, 5, function (v) { return String(v); }), b = deslizador(ctr, 'intervalo [0, b], b =', 0.5, 1, 0.005, 0.9), e = deslizador(ctr, 'ε', 0.02, 0.4, 0.01, 0.1);
    var lec = lectura(c);
    reto(c, 'Con b = 0,9 y ε = 0,1, ¿cuál es el menor n tal que xⁿ &lt; ε en todo [0; 0,9]?', true, function (v) { return v === 22; },
      '¡Sí! 0,9²² ≈ 0,098. En [0; b] con b &lt; 1 sí hay convergencia uniforme; con b = 1 nunca: sup xⁿ = 1.').el.__fin = c.__fin;
    function dib() {
      L.limpia(); L.ejes(0.25); L.banda(-e.v, e.v, 'rgba(0,110,120,.12)'); L.bandaV(b.v, 1.05, 'rgba(0,0,0,.04)');
      for (var k = 1; k <= Math.min(n.v, 60); k += Math.max(1, Math.floor(n.v / 8))) L.curva(function (x) { return Math.pow(x, k); }, '#cfd5db', 1, 0, 1);
      L.curva(function (x) { return Math.pow(x, n.v); }, COL.ambar, 2.6, 0, 1); L.linea(b.v, -0.08, b.v, 1.08, COL.rojo, 1.2, [5, 4]);
      var sup = Math.pow(b.v, n.v);
      lec.innerHTML = 'sup<sub>[0, b]</sub> |xⁿ − 0| = bⁿ = <b>' + f4(sup) + '</b> ' + (sup < e.v ? '✅ dentro de la franja ε' : '❌ todavía se sale de la franja');
    }
    [n, b, e].forEach(function (s) { s.inp.addEventListener('input', dib); }); L.redibuja = dib; dib();
  };

  /* 7. Proyección ortogonal con vectores arrastrables */
  W.proyeccion = function (c, D) {
    var u = [4, 1], v = [2, 3];
    var L = Lienzo(c, 320, [-1, 6, -2, 4.5]);
    var lec = lectura(c), R = reto(c, 'Arrastra la punta de v (ámbar) hasta que sea perpendicular a u: la proyección debe desaparecer.', false, function () { return true; }, '¡Perpendiculares! u · v = 0 y la proyección es el vector cero.'), hecho = false;
    function flecha(x, y, col, ancho) { L.linea(0, 0, x, y, col, ancho || 2.6); var g = L.ctx, ang = Math.atan2(L.Y(y) - L.Y(0), L.X(x) - L.X(0)); g.save(); g.fillStyle = col; g.beginPath(); g.moveTo(L.X(x), L.Y(y)); g.lineTo(L.X(x) - 12 * Math.cos(ang - .35), L.Y(y) - 12 * Math.sin(ang - .35)); g.lineTo(L.X(x) - 12 * Math.cos(ang + .35), L.Y(y) - 12 * Math.sin(ang + .35)); g.fill(); g.restore(); }
    function dib() {
      L.limpia(); L.ejes(1);
      var uu = u[0] * u[0] + u[1] * u[1], dot = u[0] * v[0] + u[1] * v[1], k = dot / uu, p = [k * u[0], k * u[1]];
      L.linea(p[0], p[1], v[0], v[1], COL.gris, 1.4, [5, 4]);
      flecha(u[0], u[1], COL.teal); flecha(v[0], v[1], COL.ambar); flecha(p[0], p[1], COL.rojo, 4);
      L.punto(u[0], u[1], COL.teal, 7); L.punto(v[0], v[1], COL.ambar, 7);
      L.texto('u', u[0] + .1, u[1] + .1, COL.teal); L.texto('v', v[0] + .1, v[1] + .1, COL.ambar); L.texto('proy', p[0] + .1, p[1] - .3, COL.rojo);
      lec.innerHTML = 'u · v = <b>' + f2(dot) + '</b> · proy<sub>u</sub>v = (' + f2(p[0]) + ', ' + f2(p[1]) + ') · componente = ' + f2(dot / Math.sqrt(uu));
      if (!hecho && Math.abs(dot) < 0.15) { hecho = true; R.evalua(1); if (c.__fin) c.__fin(); }
    }
    L.arrastre(function () { return [u, v]; }, function (i, x, y) { var q = i ? v : u; q[0] = Math.round(x * 10) / 10; q[1] = Math.round(y * 10) / 10; if (!i && Math.hypot(u[0], u[1]) < .3) { u[0] = .3; } dib(); });
    L.redibuja = dib; dib();
  };

  /* 8. Telaraña de una iteración */
  W.telarana = function (c, D) {
    var G = { 'raíz: √(2 + x)': [function (x) { return Math.sqrt(2 + x); }, [0, 3, 0, 3]], 'coseno: cos x': [Math.cos, [0, 1.6, 0, 1.6]],
      'logística r = 2,8': [function (x) { return 2.8 * x * (1 - x); }, [0, 1, 0, 1]], 'logística r = 3,2': [function (x) { return 3.2 * x * (1 - x); }, [0, 1, 0, 1]], 'logística r = 3,9': [function (x) { return 3.9 * x * (1 - x); }, [0, 1, 0, 1]] };
    var sel = document.createElement('select'); sel.className = 'exp-sel'; Object.keys(G).forEach(function (k) { var o = document.createElement('option'); o.textContent = k; sel.appendChild(o); });
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr); ctr.appendChild(sel);
    var a0 = deslizador(ctr, 'a₁', 0.05, 2.9, 0.01, 0.3), N = deslizador(ctr, 'pasos', 1, 60, 1, 12, function (v) { return String(v); });
    var L = Lienzo(c, 340, [0, 3, 0, 3]); var lec = lectura(c);
    reto(c, 'Con la logística r = 3,2, la sucesión termina saltando entre unos pocos valores. ¿Entre cuántos?', true, function (v) { return v === 2; }, '¡Ciclo de período 2! Con r = 3,9 ya no se estabiliza: es caos.').el.__fin = c.__fin;
    function dib() {
      var g = G[sel.value], f = g[0]; L.v = g[1].slice(); L.limpia(); L.ejes(L.v[1] > 2 ? 0.5 : 0.25);
      L.curva(function (x) { return x; }, COL.gris, 1.2); L.curva(f, COL.teal, 2.4);
      var a = Math.min(a0.v, L.v[1]), ult = [];
      L.linea(a, 0, a, f(a), COL.ambar, 1);
      for (var i = 0; i < N.v; i++) { var b = f(a); L.linea(a, b, b, b, COL.ambar, 1); L.linea(b, b, b, f(b), COL.ambar, 1); a = b; ult.push(a); }
      lec.innerHTML = 'Últimos términos: ' + ult.slice(-5).map(f4).join(' · ');
    }
    [a0, N].forEach(function (s) { s.inp.addEventListener('input', dib); }); sel.addEventListener('change', dib); L.redibuja = dib; dib();
  };

  /* 9. Homotecia y razón de áreas */
  W.homotecia = function (c, D) {
    var O = [1, 1], T = [[2, 1.5], [3.5, 1.5], [2.5, 3]];
    var L = Lienzo(c, 320, [-3, 8, -3, 7]);
    var ctr = document.createElement('div'); ctr.className = 'exp-ctr'; c.appendChild(ctr);
    var k = deslizador(ctr, 'razón k', -2.5, 2.5, 0.05, 1.5); var lec = lectura(c);
    var R = reto(c, 'Escoge k para que el área de la imagen sea exactamente 4 veces la original. (Arrastra también el centro O.)', false, function () { return true; }, '¡k = 2 (o −2)! Las áreas se multiplican por k² = 4.'), hecho = false;
    function area(P) { return Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2; }
    function tri(P, col, fill) { var g = L.ctx; g.save(); g.strokeStyle = col; g.fillStyle = fill; g.lineWidth = 2; g.beginPath(); g.moveTo(L.X(P[0][0]), L.Y(P[0][1])); g.lineTo(L.X(P[1][0]), L.Y(P[1][1])); g.lineTo(L.X(P[2][0]), L.Y(P[2][1])); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    function dib() {
      L.limpia(); L.ejes(1);
      var I = T.map(function (p) { return [O[0] + k.v * (p[0] - O[0]), O[1] + k.v * (p[1] - O[1])]; });
      T.forEach(function (p, i) { L.linea(O[0], O[1], I[i][0], I[i][1], COL.gris, 1, [4, 4]); });
      tri(T, COL.teal, 'rgba(0,110,120,.15)'); tri(I, COL.ambar, 'rgba(196,120,0,.15)'); L.punto(O[0], O[1], COL.rojo, 7); L.texto('O', O[0] + .15, O[1] - .4, COL.rojo);
      var r = area(I) / area(T);
      lec.innerHTML = 'Lados × |k| = ' + f2(Math.abs(k.v)) + ' · áreas × <b>' + f2(r) + '</b> (= k²)';
      if (!hecho && Math.abs(r - 4) < 0.02) { hecho = true; R.evalua(1); if (c.__fin) c.__fin(); }
    }
    k.inp.addEventListener('input', dib);
    L.arrastre(function () { return [O]; }, function (i, x, y) { O[0] = x; O[1] = y; dib(); });
    L.redibuja = dib; dib();
  };

  /* 10. Ángulo inscrito */
  W.inscrito = function (c, D) {
    var tA = 220 * Math.PI / 180, tB = 320 * Math.PI / 180, tP = 90 * Math.PI / 180;
    var L = Lienzo(c, 330, [-1.6, 1.6, -1.35, 1.35]); L.v = [-1.35 * L.w / 330, 1.35 * L.w / 330, -1.35, 1.35];
    var lec = lectura(c);
    reto(c, 'Mueve P por la circunferencia. Si el ángulo central mide 100°, ¿cuánto mide el inscrito (con P en el arco mayor)?', true, function (v) { return Math.abs(v - 50) < 0.5; }, '¡Mitad del central! Y si pasas P al otro arco, el inscrito mide 180° − 50°.').el.__fin = c.__fin;
    function pt(t) { return [Math.cos(t), Math.sin(t)]; }
    function ang(P, Q, R2) { var a = [P[0] - Q[0], P[1] - Q[1]], b = [R2[0] - Q[0], R2[1] - Q[1]]; return Math.acos((a[0] * b[0] + a[1] * b[1]) / Math.hypot(a[0], a[1]) / Math.hypot(b[0], b[1])) * 180 / Math.PI; }
    function dib() {
      L.v = [-1.35 * L.w / 330, 1.35 * L.w / 330, -1.35, 1.35]; L.limpia();
      var A = pt(tA), B = pt(tB), P = pt(tP), O = [0, 0], g = L.ctx;
      g.save(); g.strokeStyle = COL.tinta; g.lineWidth = 2; g.beginPath(); g.arc(L.X(0), L.Y(0), L.X(1) - L.X(0), 0, 7); g.stroke(); g.restore();
      L.linea(A[0], A[1], P[0], P[1], COL.ambar, 2.2); L.linea(B[0], B[1], P[0], P[1], COL.ambar, 2.2);
      L.linea(A[0], A[1], 0, 0, COL.teal, 2); L.linea(B[0], B[1], 0, 0, COL.teal, 2);
      [[A, 'A'], [B, 'B'], [P, 'P'], [O, 'O']].forEach(function (q) { L.punto(q[0][0], q[0][1], q[1] === 'P' ? COL.rojo : COL.tinta, q[1] === 'P' ? 7 : 4); L.texto(q[1], q[0][0] * 1.12 - .04, q[0][1] * 1.12 - .04); });
      var cen = ang(A, O, B), ins = ang(A, P, B);
      lec.innerHTML = 'Central ∠AOB = <b style="color:' + COL.teal + '">' + Math.round(cen) + '°</b> · inscrito ∠APB = <b style="color:' + COL.ambar + '">' + Math.round(ins) + '°</b>';
    }
    L.arrastre(function () { return [pt(tP)]; }, function (i, x, y) { tP = Math.atan2(y, x); dib(); });
    L.redibuja = dib; dib();
  };

  window.EXPLORA = W;
  window.EXPLORA_U = { Lienzo: Lienzo, deslizador: deslizador, lectura: lectura, reto: reto, f2: f2, f4: f4, COL: COL };
})();

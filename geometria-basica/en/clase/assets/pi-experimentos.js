/* Experimentos con π (Geometría Básica, semana 10).
   Cinco widgets que se arrancan solos en cualquier <div class="widget" data-w="pi-…">:
     pi-buffon      la aguja de Buffon sobre un piso de tablas
     pi-barbier     por qué sale 2/π sin cálculo: agujas rectas, quebradas y circulares
     pi-lluvia      gotas sobre una baldosa con un plato (y la versión de contar baldosas)
     pi-arquimedes  polígonos inscritos y circunscritos, duplicando lados con Pitágoras
     pi-rio         un río que serpentea: sinuosidad = largo del cauce / distancia en línea recta
   Ninguno usa π para producir el azar: las direcciones se sortean dentro de un disco. */
(function () {
  'use strict';
  var PI = Math.PI;
  var C = { verde: '#006633', verdeO: '#00482a', verdeC: '#e8f3ec', teal: '#006e78', ambar: '#c47800', morado: '#664896', tinta: '#1d2420', gris: '#5d6a63', papel: '#fcfcfa' };
  function fx(v, d) { return (isFinite(v) ? v.toFixed(d) : '—').replace('.', ','); }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  // dirección al azar sin usar ángulos: un punto al azar del disco unidad, normalizado
  function direccion() { for (;;) { var u = 2 * Math.random() - 1, v = 2 * Math.random() - 1, r = u * u + v * v; if (r > 1e-4 && r <= 1) { r = Math.sqrt(r); return [u / r, v / r]; } } }

  function lienzo(cont, W, H) {
    var cv = document.createElement('canvas'), k = Math.min(3, (window.devicePixelRatio || 1) * 1.6);
    cv.width = Math.round(W * k); cv.height = Math.round(H * k); cv.style.width = '100%'; cv.style.height = 'auto'; cv.style.aspectRatio = W + '/' + H;
    cont.appendChild(cv); var g = cv.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0);
    cv._pos = function (e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    return { cv: cv, g: g, k: k };
  }
  function fondoOff(W, H, k, pinta) { var c = document.createElement('canvas'); c.width = W * k; c.height = H * k; var g = c.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); pinta(g); return c; }
  function visible(el) { if (!el.isConnected) return false; var s = el.closest('.slide'); if (s && !s.classList.contains('activa')) return false; return el._enVista !== false; }
  function bucle(el, f) {
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (x) { el._enVista = x.isIntersecting; }); }).observe(el);
    var t0 = 0; (function loop(t) { if (visible(el)) f(t, t - (t0 || t)); t0 = t; requestAnimationFrame(loop); })(0);
  }
  function aislar(el) { ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); }); }
  function esqueleto(el, extra) {
    el.classList.add('pix'); if (extra) el.classList.add(extra);
    el.innerHTML = '<div class="pix-lienzo"></div><div class="pix-panel"></div>';
    aislar(el);
    return { lz: el.querySelector('.pix-lienzo'), pn: el.querySelector('.pix-panel') };
  }
  // gráfica pequeña: la estimación a lo largo del experimento, con la línea de π
  function grafica(cont, rotulo) {
    var W = 300, H = 112, L = lienzo(cont, W, H), g = L.g;
    return function (datos, y0, y1, ref, refTxt) {
      y0 = y0 || 2.6; y1 = y1 || 3.7; ref = ref || PI;
      g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      function Y(v) { return 8 + (H - 22) * (1 - (Math.max(y0, Math.min(y1, v)) - y0) / (y1 - y0)); }
      g.strokeStyle = C.ambar; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(28, Y(ref)); g.lineTo(W - 4, Y(ref)); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.ambar; g.font = 'italic 13px Palatino, "Book Antiqua", Georgia, serif'; g.fillText(refTxt || 'π', 8, Y(ref) + 4);
      g.fillStyle = C.gris; g.font = '10px system-ui, sans-serif'; g.fillText(fx(y1, 1), 4, 14); g.fillText(fx(y0, 1), 4, H - 14);
      g.fillText(rotulo, 30, H - 3);
      if (datos.length > 1) {
        g.strokeStyle = C.verde; g.lineWidth = 2; g.beginPath();
        for (var i = 0; i < datos.length; i++) { var x = 28 + (W - 32) * i / (datos.length - 1), y = Y(datos[i]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
    };
  }
  function boton(txt, cls) { return '<button type="button" class="wbtn ' + (cls || '') + '">' + txt + '</button>'; }

  var WID = {};

  /* ------------------------------------------------------------ 1. Buffon */
  WID['pi-buffon'] = function (el) {
    var W = 820, H = 520, d = 82, E = esqueleto(el), L = lienzo(E.lz, W, H), g = L.g;
    var f = 1, agujas = [], n = 0, c = 0, hist = [], corre = false;
    var fondo = fondoOff(W, H, L.k, function (q) {
      var tonos = ['#ead9bb', '#e4d1af', '#eedfc4', '#e7d5b5'];
      for (var i = 0; i * d < W; i++) {
        q.fillStyle = tonos[i % 4]; q.fillRect(i * d, 0, d, H);
        q.strokeStyle = 'rgba(140,100,55,.16)'; q.lineWidth = 1;
        for (var v = 0; v < 6; v++) { var x = i * d + 8 + v * 12 + (i * 7 % 5); q.beginPath(); q.moveTo(x, 0); for (var y = 0; y <= H; y += 20) q.lineTo(x + Math.sin(y / 37 + i + v) * 2.2, y); q.stroke(); }
      }
      q.strokeStyle = '#7b5a33'; q.lineWidth = 2.2;
      for (var i = 0; i * d <= W; i++) { q.beginPath(); q.moveTo(i * d, 0); q.lineTo(i * d, H); q.stroke(); }
    });
    E.pn.innerHTML = '<div class="pix-fila">' + boton('Drop 1') + boton('Drop 10') + boton('Drop 100') + '</div>' +
      '<div class="pix-fila">' + boton('▶ Keep dropping', 'sin') + boton('Start over', 'claro') + '</div>' +
      '<label class="pix-desl">Needle length: <b class="vL"></b><input type="range" min="0.3" max="1" step="0.05" value="1"></label>' +
      '<div class="pix-datos"><div><span>Lanzadas</span><b class="vn">0</b></div><div><span>Cross a line</span><b class="vc">0</b></div><div><span>Fracción</span><b class="vf">—</b></div></div>' +
      '<div class="pix-pi">π ≈ <b class="vpi">—</b></div><div class="pix-graf"></div>' +
      '<p class="pix-txt">The lines on the floor are at a distance <i>d</i>. If the needle measures <i>L</i> ≤ <i>d</i>, the fraction of needles that cross a line approaches <b>2<i>L</i> / (π<i>d</i>)</b>. With <i>L</i> = <i>d</i>: fraction ≈ 2/π, so <b>π ≈ 2 ÷ fraction</b>.</p>';
    var bts = E.pn.querySelectorAll('button'), inp = E.pn.querySelector('input'), gr = grafica(E.pn.querySelector('.pix-graf'), 'estimate while dropping');
    function lanza(k) {
      for (var i = 0; i < k; i++) {
        var cx = Math.random() * W, cy = 18 + Math.random() * (H - 36), u = direccion(), h = f * d / 2;
        var a = [cx - u[0] * h, cy - u[1] * h], b = [cx + u[0] * h, cy + u[1] * h];
        var cr = Math.floor(a[0] / d) !== Math.floor(b[0] / d);
        agujas.push({ a: a, b: b, cr: cr, t: performance.now() }); n++; if (cr) c++;
      }
      if (agujas.length > 900) agujas.splice(0, agujas.length - 900);
      if (c) hist.push(2 * f * n / c); if (hist.length > 400) hist = hist.filter(function (_, i) { return i % 2 === 0; });
      datos();
    }
    function datos() {
      E.pn.querySelector('.vL').textContent = fx(f, 2) + ' · d'; E.pn.querySelector('.vn').textContent = miles(n); E.pn.querySelector('.vc').textContent = miles(c);
      E.pn.querySelector('.vf').textContent = n ? fx(c / n, 4) : '—'; E.pn.querySelector('.vpi').textContent = c ? fx(2 * f * n / c, 4) : '—';
      gr(hist);
    }
    bts[0].onclick = function () { lanza(1); }; bts[1].onclick = function () { lanza(10); }; bts[2].onclick = function () { lanza(100); };
    bts[3].onclick = function () { corre = !corre; bts[3].textContent = corre ? '❚❚ Pausa' : '▶ Keep dropping'; bts[3].classList.toggle('on', corre); };
    bts[4].onclick = function () { agujas = []; n = c = 0; hist = []; datos(); };
    inp.oninput = function () { f = +inp.value; agujas = []; n = c = 0; hist = []; datos(); };
    bucle(el, function (t) {
      if (corre) lanza(4);
      g.drawImage(fondo, 0, 0, W, H); g.lineCap = 'round';
      for (var i = 0; i < agujas.length; i++) {
        var A = agujas[i], edad = t - A.t, nueva = edad < 350;
        g.strokeStyle = A.cr ? C.ambar : 'rgba(45,55,50,.55)'; g.lineWidth = nueva ? 4.2 : 2.8;
        g.beginPath(); g.moveTo(A.a[0], A.a[1]); g.lineTo(A.b[0], A.b[1]); g.stroke();
        if (nueva) { g.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - edad / 350)) + ')'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(A.a[0], A.a[1]); g.lineTo(A.b[0], A.b[1]); g.stroke(); }
      }
      g.fillStyle = 'rgba(252,252,250,.88)'; g.fillRect(10, H - 34, 236, 24); g.fillStyle = C.tinta; g.font = '13px system-ui, sans-serif';
      g.fillStyle = C.ambar; g.fillRect(18, H - 23, 18, 4); g.fillStyle = C.tinta; g.fillText('crosses a line', 42, H - 17);
      g.fillStyle = 'rgba(45,55,50,.6)'; g.fillRect(140, H - 23, 18, 4); g.fillStyle = C.tinta; g.fillText('does not cross', 164, H - 17);
    });
    datos();
  };

  /* ------------------------------------------------------------ 2. Barbier */
  WID['pi-barbier'] = function (el) {
    var W = 820, H = 520, d = 100, E = esqueleto(el), L = lienzo(E.lz, W, H), g = L.g;
    var FORMAS = [
      { k: 'recta', nom: 'Line', largo: 1, col: C.verde },
      { k: 'quebrada', nom: 'Broken line', largo: 2, col: C.morado },
      { k: 'circ', nom: 'Circle', largo: null, col: C.teal }
    ];
    var est = {}, ultimos = [], corre = false, paso = 0;
    FORMAS.forEach(function (F) { est[F.k] = { n: 0, cruces: 0 }; });
    var fondo = fondoOff(W, H, L.k, function (q) {
      q.fillStyle = '#f4efe3'; q.fillRect(0, 0, W, H);
      q.strokeStyle = '#8b6a40'; q.lineWidth = 2;
      for (var x = 10; x <= W; x += d) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, H); q.stroke(); }
    });
    function cruces(a, b) { return Math.abs(Math.floor((b[0] - 10) / d) - Math.floor((a[0] - 10) / d)); }
    function puntosCruce(a, b, out) {
      var i0 = Math.floor((a[0] - 10) / d), i1 = Math.floor((b[0] - 10) / d), s = i1 > i0 ? 1 : -1;
      for (var i = i0; i !== i1; i += s) { var x = 10 + (s > 0 ? i + 1 : i) * d, t = (x - a[0]) / (b[0] - a[0]); out.push([x, a[1] + t * (b[1] - a[1])]); }
    }
    function lanzaUna(F) {
      var cx = 40 + Math.random() * (W - 80), cy = 60 + Math.random() * (H - 120), seg = [], pc = [], k = 0;
      if (F.k === 'recta') { var u = direccion(); seg.push([[cx - u[0] * d / 2, cy - u[1] * d / 2], [cx + u[0] * d / 2, cy + u[1] * d / 2]]); }
      else if (F.k === 'quebrada') {
        var p = [cx - d * .5, cy]; for (var i = 0; i < 4; i++) { var v = direccion(), q = [p[0] + v[0] * d / 2, p[1] + v[1] * d / 2]; seg.push([p, q]); p = q; }
      } else {
        // la circunferencia como polígono fino solo para dibujarla; sus cruces se cuentan exactos
        var r = d / 2, pts = []; for (var j = 0; j <= 96; j++) { var a = j / 96 * 2 * PI; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
        for (var j = 0; j < 96; j++) seg.push([pts[j], pts[j + 1]]);
      }
      seg.forEach(function (s) { k += cruces(s[0], s[1]); puntosCruce(s[0], s[1], pc); });
      if (F.k === 'circ') { k = 0; pc = []; var xl = 10 + Math.ceil((cx - d / 2 - 10) / d) * d; for (var x = xl; x <= cx + d / 2; x += d) { var dx = x - cx, hh = Math.sqrt(Math.max(0, d * d / 4 - dx * dx)); if (hh > 0) { k += 2; pc.push([x, cy - hh], [x, cy + hh]); } else { k += 1; pc.push([x, cy]); } } }
      est[F.k].n++; est[F.k].cruces += k;
      ultimos.push({ F: F, seg: seg, pc: pc, t: performance.now() }); if (ultimos.length > 45) ultimos.shift();
    }
    function lanza(m) { for (var i = 0; i < m; i++) FORMAS.forEach(lanzaUna); tabla(); }
    E.pn.innerHTML = '<div class="pix-fila">' + boton('Drop 1 of each') + boton('Drop 100 of each') + '</div><div class="pix-fila">' + boton('▶ Sin parar', 'sin') + boton('Start over', 'claro') + '</div>' +
      '<table class="pix-tabla"><thead><tr><th>Aguja</th><th>Largo</th><th>Average crossings</th><th>Crossings ÷ length (per <i>d</i>)</th></tr></thead><tbody></tbody></table>' +
      '<ol class="pix-pasos"><li>Each piece of needle crosses on its own, so the average number of crossings is <b>proportional to the length</b>: cruces = <i>k</i> · largo.</li>' +
      '<li>A circle of diameter <i>d</i> cruza <b>siempre 2 veces</b> and measures π<i>d</i>: <i>k</i> · π<i>d</i> = 2.</li>' +
      '<li>The straight needle of length <i>d</i> crosses on average <i>k</i> · <i>d</i> = <b>2/π</b> veces.</li></ol>';
    var bts = E.pn.querySelectorAll('button');
    function tabla() {
      E.pn.querySelector('tbody').innerHTML = FORMAS.map(function (F) {
        var s = est[F.k], lg = F.largo || PI, m = s.n ? s.cruces / s.n : NaN;
        return '<tr><td><i class="pix-pto" style="background:' + F.col + '"></i>' + F.nom + '</td><td>' + (F.largo ? (F.largo === 1 ? 'd' : F.largo + 'd') : 'πd') + '</td><td>' + fx(m, 3) + '</td><td>' + fx(m / lg, 3) + '</td></tr>';
      }).join('') + '<tr class="pix-meta"><td colspan="3">Valor exacto: 2/π</td><td>' + fx(2 / PI, 3) + '</td></tr>';
    }
    bts[0].onclick = function () { lanza(1); }; bts[1].onclick = function () { lanza(100); };
    bts[2].onclick = function () { corre = !corre; bts[2].textContent = corre ? '❚❚ Pausa' : '▶ Sin parar'; bts[2].classList.toggle('on', corre); };
    bts[3].onclick = function () { FORMAS.forEach(function (F) { est[F.k] = { n: 0, cruces: 0 }; }); ultimos = []; tabla(); };
    bucle(el, function (t) {
      if (corre && (paso++ % 4 === 0)) lanza(1);
      g.drawImage(fondo, 0, 0, W, H); g.lineCap = 'round'; g.lineJoin = 'round';
      ultimos.forEach(function (U, i) {
        var a = Math.max(.18, (i + 1) / ultimos.length); g.globalAlpha = a;
        g.strokeStyle = U.F.col; g.lineWidth = 3; g.beginPath(); U.seg.forEach(function (s, j) { if (j === 0 || U.F.k === 'quebrada' && j === 0) g.moveTo(s[0][0], s[0][1]); g.lineTo(s[1][0], s[1][1]); }); g.stroke();
        if (i >= ultimos.length - 3) { g.fillStyle = '#fff'; g.strokeStyle = C.tinta; g.lineWidth = 1.5; U.pc.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 4.5, 0, 2 * PI); g.fill(); g.stroke(); }); }
      });
      g.globalAlpha = 1;
    });
    tabla();
  };

  /* ------------------------------------------------------------ 3. Lluvia y baldosas */
  WID['pi-lluvia'] = function (el) {
    var W = 820, H = 520, E = esqueleto(el), L = lienzo(E.lz, W, H), g = L.g;
    var S = 460, X0 = 40, Y0 = 30, R = S / 2, cx = X0 + R, cy = Y0 + R;
    var modo = 'lluvia', gotas = [], dentro = 0, total = 0, hist = [], corre = false, N = 12, ondas = [];
    var piedra = fondoOff(W, H, L.k, function (q) {
      q.fillStyle = '#e8ebe6'; q.fillRect(0, 0, W, H);
      q.fillStyle = '#d4d9d0'; q.fillRect(X0, Y0, S, S);
      q.strokeStyle = '#a9b1a7'; q.lineWidth = 2; q.strokeRect(X0, Y0, S, S);
      q.fillStyle = '#cfe3ea'; q.beginPath(); q.arc(cx, cy, R, 0, 2 * PI); q.fill();
      q.strokeStyle = C.teal; q.lineWidth = 2.5; q.stroke();
    });
    E.pn.innerHTML = '<div class="pix-tabs">' + boton('Rain', 'on t1') + boton('Count tiles', 't2') + '</div><div class="pix-modo"></div>' +
      '<div class="pix-pi">π ≈ <b class="vpi">—</b></div><div class="pix-graf"></div><p class="pix-txt"></p>';
    var gr = grafica(E.pn.querySelector('.pix-graf'), ''), M = E.pn.querySelector('.pix-modo'), T = E.pn.querySelector('.pix-txt');
    function pintaPanel() {
      E.pn.querySelector('.t1').classList.toggle('on', modo === 'lluvia'); E.pn.querySelector('.t2').classList.toggle('on', modo !== 'lluvia');
      if (modo === 'lluvia') {
        M.innerHTML = '<div class="pix-fila">' + boton('+ 100 gotas') + boton('+ 1.000') + '</div><div class="pix-fila">' + boton(corre ? '❚❚ Pausa' : '▶ Make it rain', 'sin' + (corre ? ' on' : '')) + boton('Dry', 'claro') + '</div>' +
          '<div class="pix-datos"><div><span>Gotas</span><b class="vn"></b></div><div><span>On the plate</span><b class="vc"></b></div><div><span>Fracción</span><b class="vf"></b></div></div>';
        var b = M.querySelectorAll('button');
        b[0].onclick = function () { llueve(100); }; b[1].onclick = function () { llueve(1000); };
        b[2].onclick = function () { corre = !corre; pintaPanel(); }; b[3].onclick = function () { gotas = []; dentro = total = 0; hist = []; ondas = []; datos(); };
        T.innerHTML = 'The plate is a circle of radius <i>r</i> inside a square tile of side 2<i>r</i>. The rain falls evenly, so the fraction of drops on the plate approaches the ratio of the areas: π<i>r</i>² / (2<i>r</i>)² = <b>π/4</b>. Luego <b>π ≈ 4 × fraction</b>.';
      } else {
        M.innerHTML = '<label class="pix-desl">Tiles per side: <b class="vN"></b><input type="range" min="4" max="80" step="2" value="' + N + '"></label>' +
          '<div class="pix-datos"><div><span>Tiles in total</span><b class="vn"></b></div><div><span>With the center in the circle</span><b class="vc"></b></div><div><span>Fracción</span><b class="vf"></b></div></div>';
        var inp = M.querySelector('input'); inp.oninput = function () { N = +inp.value; datos(); };
        T.innerHTML = 'No randomness: we grid the tile and count the little squares whose center falls inside the circle. With <i>N</i> little squares per side, the circle takes up about π<i>N</i>²/4 of them. The finer the grid, the better the count: <b>π ≈ 4 × cuadritos dentro ÷ <i>N</i>²</b>.';
      }
      datos();
    }
    function contar(n) { var k = 0; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var x = (i + .5) / n * 2 - 1, y = (j + .5) / n * 2 - 1; if (x * x + y * y <= 1) k++; } return k; }
    var serieBal = []; for (var n = 4; n <= 80; n += 2) serieBal.push(4 * contar(n) / (n * n));
    function datos() {
      var q = function (s) { return M.querySelector(s); };
      if (modo === 'lluvia') {
        q('.vn').textContent = miles(total); q('.vc').textContent = miles(dentro); q('.vf').textContent = total ? fx(dentro / total, 4) : '—';
        E.pn.querySelector('.vpi').textContent = total ? fx(4 * dentro / total, 4) : '—'; gr(hist);
      } else {
        var k = contar(N); q('.vN').textContent = N; q('.vn').textContent = miles(N * N); q('.vc').textContent = miles(k); q('.vf').textContent = fx(k / (N * N), 4);
        E.pn.querySelector('.vpi').textContent = fx(4 * k / (N * N), 4); gr(serieBal.slice(0, (N - 4) / 2 + 1), 2.8, 3.5);
      }
    }
    function llueve(m) {
      var t = performance.now();
      for (var i = 0; i < m; i++) {
        var x = X0 + Math.random() * S, y = Y0 + Math.random() * S, en = (x - cx) * (x - cx) + (y - cy) * (y - cy) <= R * R;
        gotas.push([x, y, en]); total++; if (en) dentro++;
        if (m <= 6 || i % Math.ceil(m / 6) === 0) ondas.push([x, y, t + Math.random() * 300]);
      }
      if (gotas.length > 6000) gotas.splice(0, gotas.length - 6000);
      if (ondas.length > 60) ondas.splice(0, ondas.length - 60);
      hist.push(4 * dentro / total); if (hist.length > 400) hist = hist.filter(function (_, i) { return i % 2 === 0; });
      datos();
    }
    E.pn.querySelector('.t1').onclick = function () { modo = 'lluvia'; pintaPanel(); };
    E.pn.querySelector('.t2').onclick = function () { modo = 'baldosas'; corre = false; pintaPanel(); };
    bucle(el, function (t) {
      g.drawImage(piedra, 0, 0, W, H);
      if (modo === 'lluvia') {
        if (corre) llueve(5);
        for (var i = 0; i < gotas.length; i++) { var p = gotas[i]; g.fillStyle = p[2] ? 'rgba(0,110,120,.75)' : 'rgba(70,80,75,.5)'; g.fillRect(p[0] - 1.4, p[1] - 1.4, 2.8, 2.8); }
        ondas = ondas.filter(function (o) { return t - o[2] < 700; });
        ondas.forEach(function (o) { var e = (t - o[2]) / 700; if (e < 0) return; g.strokeStyle = 'rgba(0,110,120,' + (0.6 * (1 - e)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(o[0], o[1], 4 + 16 * e, 2 + 8 * e, 0, 0, 2 * PI); g.stroke(); });
      } else {
        var s = S / N;
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
          var x = (i + .5) / N * 2 - 1, y = (j + .5) / N * 2 - 1, en = x * x + y * y <= 1;
          g.fillStyle = en ? 'rgba(0,102,51,.55)' : 'rgba(255,255,255,.35)'; g.fillRect(X0 + i * s + .5, Y0 + j * s + .5, s - 1, s - 1);
        }
        g.strokeStyle = C.teal; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, R, 0, 2 * PI); g.stroke();
      }
      // rótulos
      g.fillStyle = C.tinta; g.font = 'italic 18px Palatino, Georgia, serif';
      g.fillText('r', cx + R / 2 - 4, cy - 8); g.strokeStyle = C.tinta; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R, cy); g.stroke();
      g.beginPath(); g.arc(cx, cy, 3, 0, 2 * PI); g.fillStyle = C.tinta; g.fill();
      g.font = '14px system-ui, sans-serif'; g.fillStyle = C.gris; g.fillText('side 2r', X0 + S / 2 - 24, Y0 + S + 22);
      var xL = X0 + S + 40; g.font = '15px system-ui, sans-serif'; g.fillStyle = C.tinta;
      g.fillText('Area of the plate', xL, 120); g.font = 'italic 24px Palatino, Georgia, serif'; g.fillText('πr²', xL, 152);
      g.font = '15px system-ui, sans-serif'; g.fillText('Area of the tile', xL, 210); g.font = 'italic 24px Palatino, Georgia, serif'; g.fillText('(2r)² = 4r²', xL, 242);
      g.font = '15px system-ui, sans-serif'; g.fillText('Ratio', xL, 300); g.font = 'italic 24px Palatino, Georgia, serif'; g.fillStyle = C.ambar; g.fillText('π / 4', xL, 332);
    });
    pintaPanel();
  };

  /* ------------------------------------------------------------ 4. Arquímedes */
  WID['pi-arquimedes'] = function (el) {
    var W = 820, H = 520, E = esqueleto(el), L = lienzo(E.lz, W, H), g = L.g;
    var cx = 270, cy = 260, R = 220, k = 0, paso = true;
    // lados para radio 1, sólo con Pitágoras: s(2n)² = 2 − √(4 − s(n)²); circunscrito t = s / √(1 − s²/4)
    var filas = [{ n: 6, s: 1 }]; while (filas.length < 5) { var u = filas[filas.length - 1]; filas.push({ n: 2 * u.n, s: Math.sqrt(2 - Math.sqrt(4 - u.s * u.s)) }); }
    filas.forEach(function (f) { f.t = f.s / Math.sqrt(1 - f.s * f.s / 4); f.ins = f.n * f.s / 2; f.cir = f.n * f.t / 2; });
    E.pn.innerHTML = '<div class="pix-fila">' + boton('Hexagon', 'h6') + boton('Double the sides ×2', 'dup') + '</div>' +
      '<label class="pix-chk"><input type="checkbox" checked> Show the Pythagoras step (with 6 and 12 sides)</label>' +
      '<table class="pix-tabla arq"><thead><tr><th>Lados</th><th>Inscrito</th><th></th><th>Circunscrito</th></tr></thead><tbody></tbody></table>' +
      '<p class="pix-txt">With diameter 1, the perimeter of the inscribed polygon is less than π and that of the circumscribed one is greater. To go from <i>n</i> a 2<i>n</i> sides, Pythagoras in the marked triangle is enough: <b><i>s</i>₂ₙ² = 2 − √(4 − <i>s</i>ₙ²)</b> (radius 1). Archimedes reached 96 sides: <b>3<sup>10</sup>⁄<sub>71</sub> &lt; π &lt; 3<sup>1</sup>⁄<sub>7</sub></b>.</p>';
    var bts = E.pn.querySelectorAll('button'), chk = E.pn.querySelector('input');
    bts[0].onclick = function () { k = 0; pinta(); }; bts[1].onclick = function () { if (k < 4) k++; pinta(); };
    chk.onchange = function () { paso = chk.checked; pinta(); };
    function poli(n, r, col, ancho, rel) {
      g.beginPath(); for (var i = 0; i <= n; i++) { var a = -PI / 2 + i * 2 * PI / n; var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      if (rel) { g.fillStyle = rel; g.fill(); } g.strokeStyle = col; g.lineWidth = ancho; g.stroke();
    }
    function pinta() {
      var F = filas[k], n = F.n;
      g.fillStyle = C.papel; g.fillRect(0, 0, W, H);
      var Rc = R / Math.cos(PI / n);
      poli(n, Rc, C.ambar, 2.2, 'rgba(196,120,0,.08)');
      g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, R, 0, 2 * PI); g.fill(); g.strokeStyle = C.tinta; g.lineWidth = 1.6; g.stroke();
      poli(n, R, C.verde, 2.4, 'rgba(0,102,51,.08)');
      if (paso && n <= 12) {
        // un lado del n-ágono, su punto medio y los dos lados del 2n-ágono
        var a0 = -PI / 2, a1 = -PI / 2 + 2 * PI / n, am = (a0 + a1) / 2;
        var A = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], B = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)], Mp = [cx + R * Math.cos(am), cy + R * Math.sin(am)], P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        g.strokeStyle = C.morado; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(Mp[0], Mp[1]); g.stroke(); g.setLineDash([]);
        g.fillStyle = 'rgba(102,72,150,.16)'; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(P[0], P[1]); g.lineTo(Mp[0], Mp[1]); g.closePath(); g.fill();
        g.strokeStyle = C.morado; g.lineWidth = 3; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(Mp[0], Mp[1]); g.lineTo(B[0], B[1]); g.stroke();
        g.fillStyle = C.morado; g.font = 'italic 16px Palatino, Georgia, serif';
        [A, B, Mp].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 4, 0, 2 * PI); g.fill(); });
        var nx = Mp[0] - cx, ny = Mp[1] - cy, nl = Math.hypot(nx, ny);
        g.fillText('s₂ₙ', (A[0] + Mp[0]) / 2 + nx / nl * 14 - 8, (A[1] + Mp[1]) / 2 + ny / nl * 14 + 4);
        g.fillStyle = C.verde; g.fillText('sₙ', P[0] - nx / nl * 22 - 6, P[1] - ny / nl * 22 + 4);
      }
      g.fillStyle = C.tinta; g.font = '15px system-ui, sans-serif'; g.fillText('Diameter 1', cx - 36, cy + R + 32);
      // lupa: el arco cerca de un vértice, ampliado 6 veces
      var lx = 640, ly = 150, lr = 105, z = 6;
      g.save(); g.beginPath(); g.arc(lx, ly, lr, 0, 2 * PI); g.clip(); g.fillStyle = '#fff'; g.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr);
      g.translate(lx, ly); g.scale(z, z); g.translate(-cx, -(cy - R));
      g.lineWidth = 2.4 / z; poli(n, Rc, C.ambar, 2.4 / z); g.beginPath(); g.arc(cx, cy, R, 0, 2 * PI); g.strokeStyle = C.tinta; g.lineWidth = 1.6 / z; g.stroke(); poli(n, R, C.verde, 2.4 / z);
      g.restore(); g.strokeStyle = C.gris; g.lineWidth = 1.5; g.beginPath(); g.arc(lx, ly, lr, 0, 2 * PI); g.stroke();
      g.fillStyle = C.gris; g.font = '13px system-ui, sans-serif'; g.fillText('magnifier ×6 at the top vertex', lx - 92, ly + lr + 20);
      g.font = '15px system-ui, sans-serif';
      g.fillStyle = C.verde; g.fillText('inscrito: ' + fx(F.ins, 5), 560, 330);
      g.fillStyle = C.tinta; g.fillText('π = ' + fx(PI, 5) + '…', 560, 358);
      g.fillStyle = C.ambar; g.fillText('circunscrito: ' + fx(F.cir, 5), 560, 386);
      g.fillStyle = C.gris; g.fillText('diferencia: ' + fx(F.cir - F.ins, 5), 560, 414);
      E.pn.querySelector('tbody').innerHTML = filas.slice(0, k + 1).map(function (f, i) { return '<tr' + (i === k ? ' class="on"' : '') + '><td>' + f.n + '</td><td>' + fx(f.ins, 5) + '</td><td>&lt; π &lt;</td><td>' + fx(f.cir, 5) + '</td></tr>'; }).join('') +
        (k === 4 ? '<tr class="pix-meta"><td>96</td><td>3<sup>10</sup>⁄<sub>71</sub> = ' + fx(223 / 71, 5) + '</td><td>&lt; π &lt;</td><td>3<sup>1</sup>⁄<sub>7</sub> = ' + fx(22 / 7, 5) + '</td></tr>' : '');
      bts[1].disabled = k >= 4;
    }
    pinta();
  };

  /* ------------------------------------------------------------ 5. El río */
  function Rio(W, H) {
    var ds = 9, M = 26, K = 40, lam = 20, OM = -1, GA = 2.5, Ef = 1, P = [], lagos = [], x0 = 34, x1 = W - 34, yc = H / 2;
    var f1 = Math.random() * 6, f2 = Math.random() * 6;
    for (var x = x0; x <= x1; x += ds) { var u = (x - x0) / (x1 - x0); P.push([x, yc + Math.sin(u * 18.85 + f1) * 6 * Math.sin(u * PI) + Math.sin(u * 31 + f2) * 3]); }
    P[P.length - 1] = [x1, yc];
    var W8 = [], sw = 0; for (var k = 1; k <= K; k++) { W8.push(Math.exp(-k / lam)); sw += Math.exp(-k / lam); }
    function remuestrea() {
      var Q = [P[0]], acc = 0, i = 1, prev = P[0];
      while (i < P.length) {
        var a = prev, b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], Lg = Math.hypot(dx, dy);
        if (Lg > 0 && acc + Lg >= ds) { var t = (ds - acc) / Lg, np = [a[0] + dx * t, a[1] + dy * t]; Q.push(np); prev = np; acc = 0; } else { acc += Lg; prev = b; i++; }
      }
      var last = P[P.length - 1], ql = Q[Q.length - 1];
      if (Math.hypot(last[0] - ql[0], last[1] - ql[1]) < ds * .5) Q[Q.length - 1] = last; else Q.push(last);
      P = Q;
    }
    function atajo() {
      var cel = ds * 2, G = {}, n = P.length, i, a, b, q;
      for (i = 0; i < n; i++) { var key = Math.floor(P[i][0] / cel) + ',' + Math.floor(P[i][1] / cel); (G[key] = G[key] || []).push(i); }
      for (i = 0; i < n; i++) {
        var gx = Math.floor(P[i][0] / cel), gy = Math.floor(P[i][1] / cel), mejor = -1;
        for (a = -1; a <= 1; a++) for (b = -1; b <= 1; b++) { var l = G[(gx + a) + ',' + (gy + b)]; if (!l) continue; for (q = 0; q < l.length; q++) { var j = l[q]; if (j > i + 60 && j > mejor && Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < ds * 0.8) mejor = j; } }
        if (mejor > 0) { lagos.push({ p: P.slice(i + 2, mejor - 1), edad: 0 }); P = P.slice(0, i + 1).concat(P.slice(mejor)); return true; }
      }
      return false;
    }
    function paso() {
      var n = P.length, c = new Array(n).fill(0), i, k;
      for (i = 1; i < n - 1; i++) { var A = P[i - 1], B = P[i], D = P[i + 1], ux = B[0] - A[0], uy = B[1] - A[1], vx = D[0] - B[0], vy = D[1] - B[1]; c[i] = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy) / ds; }
      for (var rep = 0; rep < 6; rep++) { var c2 = c.slice(); for (i = 2; i < n - 2; i++) c2[i] = (c[i - 2] + 2 * c[i - 1] + 3 * c[i] + 2 * c[i + 1] + c[i + 2]) / 9; c = c2; }
      var Q = P.map(function (p) { return p.slice(); });
      for (i = 1; i < n - 1; i++) {
        var s = 0; for (k = 1; k <= K && i - k >= 0; k++) s += W8[k - 1] * c[i - k];
        var r = OM * c[i] + GA * s / sw, tx = P[i + 1][0] - P[i - 1][0], ty = P[i + 1][1] - P[i - 1][1], tl = Math.hypot(tx, ty) || 1;
        var m = Ef * r * 25 + (Math.random() - .5) * 0.05; if (m > 1.5) m = 1.5; if (m < -1.5) m = -1.5;
        m *= Math.min(1, i / 18, (n - 1 - i) / 18);   // la fuente y la desembocadura no se mueven
        Q[i][0] += -ty / tl * m; Q[i][1] += tx / tl * m;
        if (Q[i][1] < M) Q[i][1] = M; if (Q[i][1] > H - M) Q[i][1] = H - M; if (Q[i][0] < x0 - 6) Q[i][0] = x0 - 6; if (Q[i][0] > x1 + 6) Q[i][0] = x1 + 6;
      }
      P = Q; remuestrea(); var gg = 0, hubo = 0; while (atajo() && gg++ < 5) hubo++;
      lagos.forEach(function (l) { l.edad++; }); lagos = lagos.filter(function (l) { return l.edad < 500; });
      return hubo;
    }
    function largo() { var s = 0; for (var i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; }
    return { paso: paso, P: function () { return P; }, lagos: function () { return lagos; }, largo: largo, recta: function () { var a = P[0], b = P[P.length - 1]; return Math.hypot(b[0] - a[0], b[1] - a[1]); } };
  }
  WID['pi-rio'] = function (el) {
    var W = 820, H = 520, E = esqueleto(el), L = lienzo(E.lz, W, H), g = L.g;
    var rio = Rio(W, H), corre = false, vel = 3, hist = [], tiempo = 0, cortes = 0, suma = 0, cuenta = 0, modo = 'sim', trazo = [], dibujando = false;
    var valle = fondoOff(W, H, L.k, function (q) {
      var gr = q.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#cfdcc0'); gr.addColorStop(.5, '#dfe8d2'); gr.addColorStop(1, '#cfdcc0');
      q.fillStyle = gr; q.fillRect(0, 0, W, H);
      for (var i = 0; i < 260; i++) { var x = (i * 97.3) % W, y = (i * 53.7 + (i * i) % 41) % H; q.fillStyle = 'rgba(90,120,70,' + (0.05 + (i % 5) * 0.015) + ')'; q.beginPath(); q.arc(x, y, 2 + (i % 4), 0, 2 * PI); q.fill(); }
    });
    E.pn.innerHTML = '<div class="pix-tabs">' + boton('Simulated river', 'on t1') + boton('Draw a river', 't2') + '</div><div class="pix-modo"></div>' +
      '<div class="pix-pi">Sinuosidad ≈ <b class="vs">—</b></div><div class="pix-graf"></div><p class="pix-txt"></p>';
    var gr = grafica(E.pn.querySelector('.pix-graf'), 'sinuosity over time'), Md = E.pn.querySelector('.pix-modo'), T = E.pn.querySelector('.pix-txt');
    function panel() {
      E.pn.querySelector('.t1').classList.toggle('on', modo === 'sim'); E.pn.querySelector('.t2').classList.toggle('on', modo !== 'sim');
      if (modo === 'sim') {
        Md.innerHTML = '<div class="pix-fila">' + boton(corre ? '❚❚ Pausa' : '▶ Let the river flow', 'sin' + (corre ? ' on' : '')) + boton('A new river', 'claro') + '</div>' +
          '<label class="pix-desl">Velocidad: <b class="vv"></b><input type="range" min="1" max="8" step="1" value="' + vel + '"></label>' +
          '<div class="pix-datos"><div><span>Length of the channel</span><b class="vl"></b></div><div><span>In a straight line</span><b class="vr"></b></div><div><span>Promedio</span><b class="vp"></b></div></div>';
        var b = Md.querySelectorAll('button'), inp = Md.querySelector('input');
        b[0].onclick = function () { corre = !corre; panel(); };
        b[1].onclick = function () { rio = Rio(W, H); hist = []; tiempo = cortes = suma = cuenta = 0; datos(); };
        inp.oninput = function () { vel = +inp.value; datos(); };
        T.innerHTML = 'La <b>sinuosity</b> is the length of the channel divided by the straight-line distance from the source to the mouth. Water erodes the outer bank of each bend, so the bends grow until two of them touch, the river takes a shortcut and leaves an oxbow lake. Hans-Henrik Stølum (1996) proposed that this balance leaves the sinuosity oscillating around π. It is a hypothesis: real rivers have very varied sinuosities. In this simple model it settles near 3.';
      } else {
        Md.innerHTML = '<div class="pix-fila">' + boton('Erase the drawing', 'claro') + '</div><div class="pix-datos"><div><span>Length of the stroke</span><b class="vl"></b></div><div><span>In a straight line</span><b class="vr"></b></div><div><span>Sinuosidad</span><b class="vp"></b></div></div>';
        Md.querySelector('button').onclick = function () { trazo = []; datos(); };
        T.innerHTML = 'Drag over the valley to draw a river, from the source to the mouth. Can you make a river with sinuosity close to π? Also try the outline of a real river you find on a map.';
      }
      datos();
    }
    function largoT(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
    function datos() {
      var q = function (s) { return Md.querySelector(s); };
      if (modo === 'sim') {
        var Lg = rio.largo(), Rc = rio.recta(); q('.vv').textContent = vel; q('.vl').textContent = Math.round(Lg) + ' px'; q('.vr').textContent = Math.round(Rc) + ' px';
        q('.vp').textContent = cuenta ? fx(suma / cuenta, 2) : '—'; E.pn.querySelector('.vs').textContent = fx(Lg / Rc, 2); gr(hist, 1, 4.2);
      } else {
        var Lt = largoT(trazo), Rt = trazo.length > 1 ? Math.hypot(trazo[trazo.length - 1][0] - trazo[0][0], trazo[trazo.length - 1][1] - trazo[0][1]) : 0;
        q('.vl').textContent = Math.round(Lt) + ' px'; q('.vr').textContent = Math.round(Rt) + ' px'; q('.vp').textContent = Rt > 20 ? fx(Lt / Rt, 2) : '—';
        E.pn.querySelector('.vs').textContent = Rt > 20 ? fx(Lt / Rt, 2) : '—'; gr([], 1, 4.2);
      }
    }
    E.pn.querySelector('.t1').onclick = function () { modo = 'sim'; panel(); };
    E.pn.querySelector('.t2').onclick = function () { modo = 'dib'; corre = false; panel(); };
    L.cv.addEventListener('pointerdown', function (e) { if (modo !== 'dib') return; dibujando = true; trazo = [L.cv._pos(e)]; L.cv.setPointerCapture(e.pointerId); e.preventDefault(); });
    L.cv.addEventListener('pointermove', function (e) { if (!dibujando) return; var p = L.cv._pos(e), u = trazo[trazo.length - 1]; if (Math.hypot(p[0] - u[0], p[1] - u[1]) > 3) { trazo.push(p); datos(); } });
    L.cv.addEventListener('pointerup', function () { dibujando = false; });
    L.cv.style.touchAction = 'none';
    function cauce(p, ancho, col) { if (p.length < 2) return; g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.stroke(); }
    bucle(el, function () {
      if (modo === 'sim' && corre) {
        for (var s = 0; s < vel; s++) { cortes += rio.paso(); tiempo++; }
        var S = rio.largo() / rio.recta(); if (tiempo > 600) { suma += S; cuenta++; }
        if (tiempo % 6 < vel) { hist.push(S); if (hist.length > 500) hist = hist.filter(function (_, i) { return i % 2 === 0; }); }
        datos();
      }
      g.drawImage(valle, 0, 0, W, H);
      if (modo === 'sim') {
        rio.lagos().forEach(function (l) { var a = Math.max(0, 1 - l.edad / 500); cauce(l.p, 7, 'rgba(120,170,205,' + (0.55 * a) + ')'); });
        var P = rio.P(); cauce(P, 10, '#b9cfa3'); cauce(P, 6.5, '#2f7fb5'); cauce(P, 2, 'rgba(255,255,255,.35)');
        var a = P[0], b = P[P.length - 1];
        g.setLineDash([7, 6]); g.strokeStyle = 'rgba(29,36,32,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
        g.fillStyle = C.tinta; g.font = '14px system-ui, sans-serif'; g.fillText('source', a[0] - 20, a[1] - 16); g.fillText('mouth', b[0] - 92, b[1] - 16);
        [a, b].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 5, 0, 2 * PI); g.fill(); });
        if (!corre && tiempo === 0) { g.fillStyle = 'rgba(252,252,250,.9)'; g.fillRect(W / 2 - 170, 30, 340, 38); g.fillStyle = C.verdeO; g.font = '16px system-ui, sans-serif'; g.fillText('Press “Let the river flow” and wait a while', W / 2 - 150, 54); }
      } else {
        cauce(trazo, 10, '#b9cfa3'); cauce(trazo, 6.5, '#2f7fb5');
        if (trazo.length > 1) { var a2 = trazo[0], b2 = trazo[trazo.length - 1]; g.setLineDash([7, 6]); g.strokeStyle = 'rgba(29,36,32,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); g.setLineDash([]); }
        else { g.fillStyle = 'rgba(252,252,250,.9)'; g.fillRect(W / 2 - 150, H / 2 - 20, 300, 38); g.fillStyle = C.verdeO; g.font = '16px system-ui, sans-serif'; g.fillText('Drag here to draw a river', W / 2 - 122, H / 2 + 4); }
      }
    });
    panel();
  };

  function arranca() { document.querySelectorAll('.widget[data-w^="pi-"]').forEach(function (el) { var f = WID[el.getAttribute('data-w')]; if (f && !el._pi) { el._pi = 1; f(el); } }); }
  window.PiExperimentos = { arranca: arranca };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();

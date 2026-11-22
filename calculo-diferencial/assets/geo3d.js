/* Geometría Básica — figuras 3D que se giran con el mouse o el dedo (SVG puro) */
(function () {
  'use strict';
  var C = { verde: '#006633', verdeO: '#00482a', teal: '#006e78', ambar: '#c47800', morado: '#664896',
    azul: '#1955a0', rojo: '#b22222', gris: '#7a7a7a', arena: '#d9c9a3' };
  var PHI = (1 + Math.sqrt(5)) / 2;

  /* ---------- vectores 3D ---------- */
  function v3(x, y, z) { return [x, y, z]; }
  function s3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function a3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function m3(a, t) { return [a[0] * t, a[1] * t, a[2] * t]; }
  function d3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function x3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function n3(a) { return Math.sqrt(d3(a, a)); }
  function u3(a) { var n = n3(a) || 1; return m3(a, 1 / n); }
  function c3(ps) { var c = [0, 0, 0]; ps.forEach(function (p) { c = a3(c, p); }); return m3(c, 1 / ps.length); }
  function fmt(x, d) { d = d === undefined ? 1 : d; var s = x.toFixed(d); if (/^-0[.,]?0*$/.test(s)) s = s.slice(1); return s.replace('.', ','); }

  /* ---------- color ---------- */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function sombra(col, k) { // k en [-1,1]: oscurece / aclara
    var r = hex(col);
    r = r.map(function (x) { return Math.round(k >= 0 ? x + (255 - x) * k : x * (1 + k)); });
    return 'rgb(' + r.join(',') + ')';
  }

  /* ---------- poliedros convexos a partir de sus vértices ---------- */
  function casco(V) {
    var n = V.length, caras = [], vistos = {};
    var cen = c3(V);
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) for (var k = j + 1; k < n; k++) {
      var nr = x3(s3(V[j], V[i]), s3(V[k], V[i]));
      if (n3(nr) < 1e-9) continue;
      nr = u3(nr);
      var d = d3(nr, V[i]);
      if (d3(nr, cen) > d) { nr = m3(nr, -1); d = -d; }
      var ok = true, en = [];
      for (var t = 0; t < n; t++) {
        var e = d3(nr, V[t]) - d;
        if (e > 1e-6) { ok = false; break; }
        if (Math.abs(e) < 1e-6) en.push(t);
      }
      if (!ok) continue;
      var clave = en.slice().sort(function (a, b) { return a - b; }).join(',');
      if (vistos[clave]) continue;
      vistos[clave] = 1;
      // ordenar alrededor del centro de la cara
      var cc = c3(en.map(function (t) { return V[t]; })), e1 = u3(s3(V[en[0]], cc)), e2 = x3(nr, e1);
      en.sort(function (a, b) {
        var pa = s3(V[a], cc), pb = s3(V[b], cc);
        return Math.atan2(d3(pa, e2), d3(pa, e1)) - Math.atan2(d3(pb, e2), d3(pb, e1));
      });
      caras.push(en);
    }
    return { V: V, F: caras };
  }
  function aristas(F) {
    var E = {}, L = [];
    F.forEach(function (f, fi) {
      for (var i = 0; i < f.length; i++) {
        var a = f[i], b = f[(i + 1) % f.length], k = a < b ? a + '-' + b : b + '-' + a;
        if (!E[k]) { E[k] = { a: Math.min(a, b), b: Math.max(a, b), caras: [] }; L.push(E[k]); }
        E[k].caras.push(fi);
      }
    });
    return L;
  }
  var SOLIDOS = {
    tetraedro: function () { return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; },
    cubo: function () { var V = []; [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { V.push([x, y, z]); }); }); }); return V; },
    octaedro: function () { return [[1.35, 0, 0], [-1.35, 0, 0], [0, 1.35, 0], [0, -1.35, 0], [0, 0, 1.35], [0, 0, -1.35]]; },
    icosaedro: function () {
      var V = [], s = 0.8;
      [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { V.push([0, a * s, b * PHI * s]); V.push([a * s, b * PHI * s, 0]); V.push([b * PHI * s, 0, a * s]); }); });
      return V;
    },
    dodecaedro: function () {
      var V = [], s = 0.78, ip = 1 / PHI;
      [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { V.push([x * s, y * s, z * s]); }); }); });
      [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { V.push([0, a * ip * s, b * PHI * s]); V.push([a * ip * s, b * PHI * s, 0]); V.push([b * PHI * s, 0, a * ip * s]); }); });
      return V;
    }
  };

  /* ---------- escena ---------- */
  function Escena(svg, W, H, escala) {
    var E = {
      az: 0.6, el: 0.42, s: escala || 70, W: W, H: H, cx: W / 2, cy: H / 2 + 10, buf: [], items: [],
      base: function () {
        var az = this.az, el = this.el;
        this.r = [-Math.sin(az), Math.cos(az), 0];
        this.f = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
        this.u = x3(this.f, this.r);
        this.luz = u3(a3(a3(m3(this.f, 0.9), m3(this.u, 0.7)), m3(this.r, -0.45)));
      },
      P: function (p) { return [this.cx + this.s * d3(p, this.r), this.cy - this.s * d3(p, this.u)]; },
      prof: function (p) { return d3(p, this.f); },
      // elementos con profundidad (se ordenan): caras
      cara: function (ps, o) {
        o = o || {};
        var nr = x3(s3(ps[1], ps[0]), s3(ps[2], ps[0]));
        var col = o.c || C.teal, k = 0;
        if (!o.plano && n3(nr) > 1e-9) {
          nr = u3(nr);
          var lam = Math.abs(d3(nr, this.luz));
          k = -0.32 + 0.62 * lam;
        }
        if (o.plano) k = 0.15;
        var self = this, z = o.z !== undefined ? o.z : d3(c3(ps), this.f);
        this.items.push({ z: z + (o.dz || 0), svg: '<path d="M' + ps.map(function (p) { return self.P(p).map(function (t) { return t.toFixed(1); }).join(','); }).join('L') +
          'Z" fill="' + sombra(col, k) + '" fill-opacity="' + (o.op === undefined ? 0.55 : o.op) + '" stroke="' + (o.borde || 'none') + '" stroke-width="' + (o.bw || 1) + '" stroke-linejoin="round"/>' });
      },
      linea: function (p, q, o) { // segmento con profundidad
        o = o || {}; var a = this.P(p), b = this.P(q);
        var z = o.z !== undefined ? o.z : Math.max(this.prof(p), this.prof(q)) + (o.dz || 0.001);
        this.items.push({ z: z, svg: '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) +
          '" stroke="' + (o.c || '#1d2420') + '" stroke-width="' + (o.w || 2) + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + '/>' });
      },
      flecha: function (p, q, o) {
        o = o || {}; var a = this.P(p), b = this.P(q), c = o.c || C.verde, w = o.w || 3;
        var d = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(d[0], d[1]);
        var z = o.z !== undefined ? o.z : Math.max(this.prof(p), this.prof(q)) + 0.002;
        if (n < 3) return;
        var u = [d[0] / n, d[1] / n], h = Math.min(15, n * 0.4), e = [b[0] - u[0] * h, b[1] - u[1] * h];
        var l = [e[0] - u[1] * h * 0.42, e[1] + u[0] * h * 0.42], r = [e[0] + u[1] * h * 0.42, e[1] - u[0] * h * 0.42];
        this.items.push({ z: z, svg: '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>' +
          '<path d="M' + b.map(function (t) { return t.toFixed(1); }) + 'L' + l.map(function (t) { return t.toFixed(1); }) + 'L' + r.map(function (t) { return t.toFixed(1); }) + 'Z" fill="' + c + '"/>' });
      },
      punto: function (p, o) {
        o = o || {}; var a = this.P(p);
        this.items.push({ z: (o.z !== undefined ? o.z : this.prof(p)) + 0.01, svg: '<circle cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="' + (o.r || 3.6) + '" fill="' + (o.c || '#1d2420') + '" stroke="#fff" stroke-width="1.2"/>' });
      },
      texto: function (p, t, o) {
        o = o || {}; var a = this.P(p);
        this.items.push({ z: 1e6, svg: '<text x="' + (a[0] + (o.dx || 0)).toFixed(1) + '" y="' + (a[1] + (o.dy || 0)).toFixed(1) + '" fill="' + (o.c || '#1d2420') + '" font-size="' + (o.size || 16) +
          '" text-anchor="middle" dominant-baseline="middle" font-family="Palatino Linotype,Book Antiqua,Palatino,Georgia,serif"' + (o.it === false ? '' : ' font-style="italic"') + (o.bold ? ' font-weight="700"' : '') +
          ' paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">' + t + '</text>' });
      },
      // etiqueta empujada hacia afuera desde el centro c (en pantalla)
      etiqueta: function (p, t, c, o) {
        o = o || {}; var a = this.P(p), b = this.P(c || [0, 0, 0]), d = [a[0] - b[0], a[1] - b[1]], n = Math.hypot(d[0], d[1]) || 1, k = o.k || 15;
        this.texto(p, t, { dx: d[0] / n * k, dy: d[1] / n * k, c: o.c, size: o.size, bold: o.bold });
      },
      /* sólido convexo: caras traseras + aristas ocultas punteadas, luego caras delanteras y aristas visibles */
      solido: function (S, o) {
        o = o || {}; var self = this, col = o.c || C.teal;
        var V = S.V, F = S.F, cen = c3(V);
        var frente = F.map(function (f) {
          var ps = f.map(function (i) { return V[i]; }), nr = x3(s3(ps[1], ps[0]), s3(ps[2], ps[0]));
          if (d3(nr, s3(c3(ps), cen)) < 0) nr = m3(nr, -1);
          return d3(nr, self.f) > 1e-9;
        });
        var zmin = -1e5;
        // caras traseras (muy tenues) y aristas ocultas
        F.forEach(function (f, i) { if (!frente[i]) self.cara(f.map(function (k) { return V[k]; }), { c: col, op: (o.op || 0.5) * 0.35, z: zmin + i * 1e-3 }); });
        aristas(F).forEach(function (e) {
          var vis = e.caras.some(function (fi) { return frente[fi]; });
          if (!vis && o.ocultas !== false) self.linea(V[e.a], V[e.b], { c: '#3c4a43', w: 1.2, dash: '4 4', z: zmin + 50 });
        });
        F.forEach(function (f, i) { if (frente[i]) self.cara(f.map(function (k) { return V[k]; }), { c: (o.colores && o.colores[i]) || col, op: o.op || 0.5, z: (o.zf || 0) + 1e-3 * i }); });
        aristas(F).forEach(function (e) {
          var vis = e.caras.some(function (fi) { return frente[fi]; });
          if (vis) self.linea(V[e.a], V[e.b], { c: o.borde || '#1d2420', w: o.bw || 1.8, z: (o.zf || 0) + 10 });
        });
      },
      ejes: function (L, o) {
        o = o || {}; var self = this, n = ['x', 'y', 'z'];
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e, i) {
          if (o.neg) self.linea(m3(e, -(o.neg)), [0, 0, 0], { c: '#9aa59f', w: 1.2, dash: '3 4' });
          self.flecha([0, 0, 0], m3(e, L), { c: '#5d6a63', w: 1.5 });
          self.texto(m3(e, L * 1.09), n[i], { c: '#5d6a63', size: 15 });
        });
      },
      dibuja: function () {
        this.items.sort(function (a, b) { return a.z - b.z; });
        svg.innerHTML = this.items.map(function (i) { return i.svg; }).join('');
        this.items = [];
      }
    };
    return E;
  }

  /* ---------- applet 3D genérico ---------- */
  function Applet3D(cont, def) {
    var cuerpo = cont.querySelector('.acuerpo');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var W = def.W || 640, H = def.H || 400;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.classList.add('s3d');
    cuerpo.appendChild(svg);
    var lect = cont.querySelector('.lect');
    var E = Escena(svg, W, H, def.escala);
    if (def.az !== undefined) E.az = def.az;
    if (def.el !== undefined) E.el = def.el;
    var est = {};
    // controles
    var ctl = document.createElement('div');
    ctl.className = 'ctl3d';
    (def.controles || []).forEach(function (c) {
      if (c.tipo === 'botones') {
        var g = document.createElement('div'); g.className = 'grupo';
        c.opciones.forEach(function (op, i) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = op[1]; b.className = 'chip' + (i === (c.inicial || 0) ? ' on' : '');
          b.addEventListener('click', function () { est[c.nombre] = op[0]; g.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pinta(); });
          g.appendChild(b);
        });
        est[c.nombre] = c.opciones[c.inicial || 0][0];
        ctl.appendChild(g);
      } else {
        var l = document.createElement('label'); l.className = 'desl';
        l.innerHTML = '<span>' + c.etiqueta + '</span><input type="range" min="' + c.min + '" max="' + c.max + '" step="' + (c.paso || 0.1) + '" value="' + c.valor + '"><b></b>';
        var inp = l.querySelector('input'), out = l.querySelector('b');
        est[c.nombre] = +c.valor;
        var muestra = function () { out.textContent = c.formato ? c.formato(+inp.value) : fmt(+inp.value, c.dec === undefined ? 1 : c.dec); };
        inp.addEventListener('input', function () { est[c.nombre] = +inp.value; muestra(); pinta(); });
        muestra();
        ctl.appendChild(l);
      }
    });
    var giro = document.createElement('button'); giro.type = 'button'; giro.className = 'chip girar'; giro.textContent = '⟳ girar';
    ctl.appendChild(giro);
    cuerpo.appendChild(ctl);
    if (def.init) def.init(est);
    function pinta() {
      E.base();
      var info = def.dibuja(E, est, { C: C, s3: s3, a3: a3, m3: m3, d3: d3, x3: x3, n3: n3, u3: u3, c3: c3, fmt: fmt, casco: casco, SOLIDOS: SOLIDOS, aristas: aristas });
      E.dibuja();
      if (lect && info !== undefined) lect.innerHTML = info;
    }
    // rotación con arrastre
    var arr = null, auto = false, raf = null, ultimo = 0;
    svg.addEventListener('pointerdown', function (e) { arr = [e.clientX, e.clientY, E.az, E.el]; svg.setPointerCapture(e.pointerId); para(); e.preventDefault(); });
    svg.addEventListener('pointermove', function (e) {
      if (!arr) return;
      E.az = arr[2] - (e.clientX - arr[0]) * 0.01;
      E.el = Math.max(-1.45, Math.min(1.45, arr[3] + (e.clientY - arr[1]) * 0.01));
      pinta();
    });
    svg.addEventListener('pointerup', function () { arr = null; });
    svg.addEventListener('pointercancel', function () { arr = null; });
    function paso(t) {
      if (!auto) return;
      if (ultimo) E.az += (t - ultimo) * 0.00035;
      ultimo = t; pinta(); raf = requestAnimationFrame(paso);
    }
    function arranca() { if (auto) return; auto = true; ultimo = 0; giro.classList.add('on'); raf = requestAnimationFrame(paso); }
    function para() { auto = false; giro.classList.remove('on'); if (raf) cancelAnimationFrame(raf); }
    giro.addEventListener('click', function () { if (auto) para(); else arranca(); });
    var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!quieto && 'IntersectionObserver' in window) {
      var yaGiro = false;
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !yaGiro) { yaGiro = true; arranca(); setTimeout(para, 6000); }
          if (!en.isIntersecting) para();
        });
      }, { threshold: 0.5 }).observe(svg);
    }
    pinta();
  }

  /* ================================================================
     Catálogo 3D
     ================================================================ */
  var A = {};

  /* --- posiciones de rectas en un cubo --- */
  A['cubo-rectas'] = {
    escala: 92, H: 380,
    controles: [{ tipo: 'botones', nombre: 'caso', opciones: [['sec', 'Secantes'], ['par', 'Paralelas'], ['ala', 'Alabeadas']], inicial: 2 }],
    dibuja: function (E, e, G) {
      var S = G.casco(G.SOLIDOS.cubo());
      var V = S.V, nombres = {};
      // nombrar: A(1,-1,-1) B(1,1,-1) C(-1,1,-1) D(-1,-1,-1) y E..H arriba
      var pos = { A: [1, -1, -1], B: [1, 1, -1], C: [-1, 1, -1], D: [-1, -1, -1], E: [1, -1, 1], F: [1, 1, 1], G: [-1, 1, 1], H: [-1, -1, 1] };
      E.solido(S, { c: '#8fc3c7', op: 0.28 });
      var pares = { sec: [['A', 'B'], ['A', 'E']], par: [['A', 'B'], ['H', 'G']], ala: [['A', 'B'], ['E', 'H']] };
      var p = pares[e.caso], c1 = G.C.verde, c2 = e.caso === 'ala' ? G.C.morado : G.C.ambar;
      function ext(P, Q, col) { var d = G.s3(pos[Q], pos[P]); E.linea(G.a3(pos[P], G.m3(d, -0.45)), G.a3(pos[Q], G.m3(d, 0.45)), { c: col, w: 3.4, z: 500 }); }
      if (e.caso !== 'ala') {
        var pl = [pos[p[0][0]], pos[p[0][1]], pos[p[1][1]], pos[p[1][0]]];
        if (e.caso === 'sec') pl = [pos.A, pos.B, G.a3(pos.B, G.s3(pos.E, pos.A)), pos.E];
        var cc = G.c3(pl);
        E.cara(pl.map(function (q) { return G.a3(cc, G.m3(G.s3(q, cc), 1.55)); }), { c: '#f2c14e', op: 0.22, plano: true, z: 400 });
      }
      ext(p[0][0], p[0][1], c1); ext(p[1][0], p[1][1], c2);
      Object.keys(pos).forEach(function (k) { E.punto(pos[k], { z: 600 }); E.etiqueta(pos[k], k, [0, 0, 0], { k: 15 }); });
      var txt = { sec: 'Las rectas <b>AB</b> y <b>AE</b> se cortan en A: son <b>secantes</b> y determinan un plano (en amarillo).',
        par: 'Las rectas <b>AB</b> y <b>HG</b> no se cortan, pero están en un mismo plano (en amarillo): son <b>paralelas</b>.',
        ala: 'Las rectas <b>AB</b> y <b>EH</b> no se cortan y ningún plano las contiene a ambas: son <b>alabeadas</b>. Gire el cubo para convencerse.' };
      return txt[e.caso];
    }
  };

  /* --- criterio de perpendicularidad recta-plano --- */
  A['perpendicular-plano'] = {
    escala: 70, H: 360, el: 0.35,
    controles: [{ nombre: 'ang', etiqueta: 'Ángulo entre las rectas del plano', min: 20, max: 160, paso: 1, valor: 70, formato: function (v) { return v + '°'; } }],
    dibuja: function (E, e, G) {
      var L = 2.6;
      E.cara([[-L, -L, 0], [L, -L, 0], [L, L, 0], [-L, L, 0]], { c: '#9fd0b2', op: 0.45, plano: true, borde: '#6aa583' });
      var t = e.ang * Math.PI / 180, m = [1, 0, 0], n = [Math.cos(t), Math.sin(t), 0];
      E.linea(G.m3(m, -2.4), G.m3(m, 2.4), { c: G.C.ambar, w: 3, z: 10 });
      E.linea(G.m3(n, -2.4), G.m3(n, 2.4), { c: G.C.morado, w: 3, z: 10 });
      // recta perpendicular
      E.linea([0, 0, -0.01], [0, 0, -1.4], { c: G.C.verde, w: 3, dash: '5 5', z: -10 });
      E.flecha([0, 0, 0], [0, 0, 2.6], { c: G.C.verde, w: 3.2, z: 50 });
      // marcas de ángulo recto
      function recto(a, b) {
        var k = 0.28, p = G.m3(a, k), q = G.a3(G.m3(a, k), G.m3(b, k)), r = G.m3(b, k);
        E.linea(p, q, { c: '#333', w: 1.3, z: 60 }); E.linea(q, r, { c: '#333', w: 1.3, z: 60 });
      }
      recto(m, [0, 0, 1]); recto(n, [0, 0, 1]);
      E.punto([0, 0, 0], { z: 70 });
      E.texto([0, 0, 2.85], 'ℓ', { c: G.C.verde, size: 20 });
      E.texto(G.m3(m, 2.6), 'm', { c: G.C.ambar }); E.texto(G.m3(n, 2.6), 'n', { c: G.C.morado });
      E.texto([L, L, 0], 'α', { c: '#3c7a55', dx: 14, dy: 6, size: 18 });
      E.texto([0, 0, 0], 'P', { dx: -12, dy: 12 });
      return 'Si <b style="color:' + G.C.verde + '">ℓ</b> es perpendicular a <b style="color:' + G.C.ambar + '">m</b> y a <b style="color:' + G.C.morado + '">n</b>, dos rectas secantes del plano α, entonces es perpendicular a <em>todas</em> las rectas de α por P. Cambie el ángulo entre m y n: mientras no sean la misma recta, el criterio funciona.';
    }
  };

  /* --- ángulo diedro --- */
  A['diedro'] = {
    escala: 74, H: 360, az: 0.25, el: 0.3,
    controles: [{ nombre: 'ang', etiqueta: 'Medida del diedro', min: 15, max: 180, paso: 1, valor: 75, formato: function (v) { return v + '°'; } }],
    dibuja: function (E, e, G) {
      var t = e.ang * Math.PI / 180, h = 1.6, L = 2.4;
      var u = [1, 0, 0], w = [Math.cos(t), 0, Math.sin(t)];
      E.cara([[0, -h, 0], [0, h, 0], G.a3([0, h, 0], G.m3(u, L)), G.a3([0, -h, 0], G.m3(u, L))], { c: '#9fd0b2', op: 0.55, borde: '#3c7a55' });
      E.cara([[0, -h, 0], [0, h, 0], G.a3([0, h, 0], G.m3(w, L)), G.a3([0, -h, 0], G.m3(w, L))], { c: '#f2c88a', op: 0.55, borde: '#a8742a' });
      E.linea([0, -h * 1.2, 0], [0, h * 1.2, 0], { c: '#1d2420', w: 3, z: 100 });
      // ángulo plano en y = 0
      var r = 1.0, pts = [];
      for (var i = 0; i <= 24; i++) { var a = t * i / 24; pts.push([r * Math.cos(a), 0, r * Math.sin(a)]); }
      E.cara([[0, 0, 0]].concat(pts), { c: G.C.morado, op: 0.3, plano: true, z: 90 });
      for (i = 0; i < 24; i++) E.linea(pts[i], pts[i + 1], { c: G.C.morado, w: 2.2, z: 95 });
      E.linea([0, 0, 0], G.m3(u, L), { c: G.C.morado, w: 1.6, dash: '5 4', z: 96 });
      E.linea([0, 0, 0], G.m3(w, L), { c: G.C.morado, w: 1.6, dash: '5 4', z: 96 });
      E.texto(G.m3(G.u3(G.a3(u, w)), 1.35), e.ang + '°', { c: G.C.morado, bold: true, it: false, size: 15 });
      E.texto([0, h * 1.3, 0], 'arista', { c: '#1d2420', size: 13, it: false });
      return 'Las dos caras comparten la arista. La medida del diedro es la del <b style="color:' + G.C.morado + '">ángulo plano</b> que se obtiene al cortarlo con un plano perpendicular a la arista. ' +
        (e.ang === 90 ? 'Con 90° los planos son <b>perpendiculares</b>.' : e.ang === 180 ? 'Con 180° las dos caras forman un solo plano.' : '');
    }
  };

  /* --- sólidos platónicos y fórmula de Euler --- */
  A['platonicos'] = {
    escala: 82, H: 400,
    controles: [{ tipo: 'botones', nombre: 's', opciones: [['tetraedro', 'Tetraedro'], ['cubo', 'Cubo'], ['octaedro', 'Octaedro'], ['dodecaedro', 'Dodecaedro'], ['icosaedro', 'Icosaedro']], inicial: 3 }],
    dibuja: function (E, e, G) {
      var cache = A.platonicos._c || (A.platonicos._c = {});
      var S = cache[e.s] || (cache[e.s] = G.casco(G.SOLIDOS[e.s]()));
      var cols = { tetraedro: '#e0a640', cubo: '#4f9bb0', octaedro: '#9b7ccc', dodecaedro: '#3f9a6a', icosaedro: '#d0705a' };
      E.solido(S, { c: cols[e.s], op: 0.82 });
      var V = S.V.length, F = S.F.length, Ar = G.aristas(S.F).length, lados = S.F[0].length;
      var nom = { 3: 'triángulos', 4: 'cuadrados', 5: 'pentágonos' }[lados];
      return '<span><b>' + F + '</b> caras (' + nom + ')</span><span><b>' + Ar + '</b> aristas</span><span><b>' + V + '</b> vértices</span>' +
        '<span>V − A + C = ' + V + ' − ' + Ar + ' + ' + F + ' = <b>' + (V - Ar + F) + '</b></span>';
    }
  };

  /* --- prismas y pirámides --- */
  A['prisma-piramide'] = {
    escala: 62, H: 400, el: 0.32,
    controles: [{ tipo: 'botones', nombre: 't', opciones: [['prisma', 'Prisma'], ['piramide', 'Pirámide'], ['ambos', 'Pirámide dentro del prisma']], inicial: 0 },
      { nombre: 'n', etiqueta: 'Lados de la base', min: 3, max: 10, paso: 1, valor: 5, dec: 0 },
      { nombre: 'h', etiqueta: 'Altura', min: 1, max: 4, paso: 0.1, valor: 2.6 },
      { nombre: 'inc', etiqueta: 'Inclinación', min: -1.2, max: 1.2, paso: 0.05, valor: 0, dec: 2 }],
    dibuja: function (E, e, G) {
      var n = e.n, r = 1.7, base = [], i;
      for (i = 0; i < n; i++) { var a = 2 * Math.PI * i / n + 0.3; base.push([r * Math.cos(a), r * Math.sin(a), -e.h / 2]); }
      var sh = [e.inc, 0, e.h], top = base.map(function (p) { return G.a3(p, sh); });
      var Ab = 0.5 * n * r * r * Math.sin(2 * Math.PI / n);
      if (e.t !== 'piramide') {
        E.solido(G.casco(base.concat(top)), { c: '#4f9bb0', op: e.t === 'ambos' ? 0.18 : 0.55, zf: e.t === 'ambos' ? 1000 : 0 });
      }
      if (e.t !== 'prisma') {
        var apex = G.a3(G.c3(base), sh);
        E.solido(G.casco(base.concat([apex])), { c: '#e0a640', op: 0.75 });
      }
      // altura
      var c = G.c3(base), ap = G.a3(c, sh);
      E.linea([ap[0], ap[1], -e.h / 2], ap, { c: G.C.rojo, w: 1.8, dash: '6 4', z: 2000 });
      E.texto([ap[0], ap[1], 0], 'h', { c: G.C.rojo, dx: 12 });
      var Vp = Ab * e.h;
      if (e.t === 'prisma') return '<span>área de la base B = ' + fmt(Ab, 2) + '</span><span>V = B·h = <b>' + fmt(Vp, 2) + '</b></span><span class="nota">La inclinación no cambia el volumen (principio de Cavalieri).</span>';
      if (e.t === 'piramide') return '<span>área de la base B = ' + fmt(Ab, 2) + '</span><span>V = ⅓·B·h = <b>' + fmt(Vp / 3, 2) + '</b></span>';
      return '<span>prisma: ' + fmt(Vp, 2) + '</span><span>pirámide: ' + fmt(Vp / 3, 2) + '</span><span>razón: <b>1 : 3</b></span>';
    }
  };

  /* --- principio de Cavalieri --- */
  A['cavalieri'] = {
    escala: 58, H: 400, el: 0.22, az: 1.35,
    controles: [{ nombre: 'k', etiqueta: 'Torcer la pila', min: 0, max: 1, paso: 0.01, valor: 0.6, dec: 2 }],
    dibuja: function (E, e, G) {
      var N = 16, h = 3.6 / N, i, j;
      function disco(cx, cy, z0, r, col, zf) {
        var M = 22, aba = [], arr = [];
        for (j = 0; j < M; j++) { var a = 2 * Math.PI * j / M; aba.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z0]); arr.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z0 + h * 0.92]); }
        E.solido(G.casco(aba.concat(arr)), { c: col, op: 0.95, bw: 0.6, borde: '#5a4a20', ocultas: false, zf: zf });
      }
      for (i = 0; i < N; i++) {
        var z = -1.8 + i * h;
        disco(-1.6, -1.5, z, 0.8, '#e5c068', -i * 0.0 + i * 0.01);
        var dx = e.k * 1.1 * Math.sin(i / (N - 1) * Math.PI * 1.1), dy = e.k * 0.9 * (i / (N - 1)) * 1.4;
        disco(1.4 + dy * 0.2, 1.2 + dx, z, 0.8, '#d7a24a', i * 0.01);
      }
      return 'Dos pilas con las mismas monedas: a cada altura, las secciones tienen la misma área. Por el <b>principio de Cavalieri</b>, tienen el mismo volumen, por mucho que se tuerza una de ellas.';
    }
  };

  /* --- volumen de la esfera (Cavalieri) --- */
  A['esfera-cavalieri'] = {
    escala: 58, H: 400, el: 0.28, az: 1.57,
    controles: [{ nombre: 'z', etiqueta: 'Altura del plano de corte', min: -0.99, max: 0.99, paso: 0.01, valor: 0.45, dec: 2, formato: function (v) { return 'z = ' + fmt(v * 2, 2); } }],
    dibuja: function (E, e, G) {
      var R = 2, z = e.z * R, M = 48, i, j;
      var cE = [0, -2.6, 0], cC = [0, 2.6, 0];
      // esfera: meridianos y paralelos
      for (i = -3; i <= 3; i++) {
        var zz = R * i / 4, rr = Math.sqrt(R * R - zz * zz);
        for (j = 0; j < M; j++) {
          var a1 = 2 * Math.PI * j / M, a2 = 2 * Math.PI * (j + 1) / M;
          var p = G.a3(cE, [rr * Math.cos(a1), rr * Math.sin(a1), zz]), q = G.a3(cE, [rr * Math.cos(a2), rr * Math.sin(a2), zz]);
          var vis = E.prof(G.s3(G.c3([p, q]), cE)) > 0;
          E.linea(p, q, { c: '#4f9bb0', w: vis ? 1.3 : 0.8, op: vis ? 0.9 : 0.35 });
        }
      }
      for (i = 0; i < 8; i++) {
        var phi = Math.PI * i / 8;
        for (j = 0; j < M; j++) {
          var t1 = Math.PI * j / M - Math.PI / 2, t2 = Math.PI * (j + 1) / M - Math.PI / 2;
          var p1 = G.a3(cE, [R * Math.cos(t1) * Math.cos(phi), R * Math.cos(t1) * Math.sin(phi), R * Math.sin(t1)]);
          var p2 = G.a3(cE, [R * Math.cos(t2) * Math.cos(phi), R * Math.cos(t2) * Math.sin(phi), R * Math.sin(t2)]);
          var vv = E.prof(G.s3(G.c3([p1, p2]), cE)) > 0;
          E.linea(p1, p2, { c: '#4f9bb0', w: vv ? 1.3 : 0.8, op: vv ? 0.9 : 0.35 });
        }
      }
      // corte de la esfera
      var rs = Math.sqrt(R * R - z * z), circ = [];
      for (j = 0; j < M; j++) { var a = 2 * Math.PI * j / M; circ.push(G.a3(cE, [rs * Math.cos(a), rs * Math.sin(a), z])); }
      E.cara(circ, { c: G.C.ambar, op: 0.75, plano: true, z: 5 });
      // cilindro menos dos conos
      var top = [], bot = [];
      for (j = 0; j < M; j++) { var b = 2 * Math.PI * j / M; top.push(G.a3(cC, [R * Math.cos(b), R * Math.sin(b), R])); bot.push(G.a3(cC, [R * Math.cos(b), R * Math.sin(b), -R])); }
      for (j = 0; j < M; j += 6) { E.linea(top[j], bot[j], { c: '#7a6a9a', w: 0.9, op: 0.5 }); }
      for (j = 0; j < M; j++) {
        E.linea(top[j], top[(j + 1) % M], { c: '#664896', w: 1.4 }); E.linea(bot[j], bot[(j + 1) % M], { c: '#664896', w: 1.4 });
      }
      for (j = 0; j < M; j += 6) { E.linea(cC, top[j], { c: '#b06a2a', w: 1, op: 0.7 }); E.linea(cC, bot[j], { c: '#b06a2a', w: 1, op: 0.7 }); }
      // anillo del corte: radios |z| y R
      var ext = [], int = [], az = Math.abs(z);
      for (j = 0; j <= M; j++) { var c = 2 * Math.PI * j / M; ext.push(G.a3(cC, [R * Math.cos(c), R * Math.sin(c), z])); int.push(G.a3(cC, [az * Math.cos(c), az * Math.sin(c), z])); }
      var anillo = ext.concat(int.slice().reverse());
      E.cara(anillo, { c: G.C.ambar, op: 0.75, plano: true, z: 6 });
      var A1 = Math.PI * (R * R - z * z), A2 = Math.PI * (R * R - z * z);
      E.texto(G.a3(cE, [0, 0, -R - 0.5]), 'esfera', { it: false, size: 14, c: '#2d6e80' });
      E.texto(G.a3(cC, [0, 0, -R - 0.5]), 'cilindro − 2 conos', { it: false, size: 14, c: '#664896' });
      return '<span>sección de la esfera: π(R² − z²) = <b>' + fmt(A1, 3) + '</b></span><span>anillo: π(R² − z²) = <b>' + fmt(A2, 3) + '</b></span>' +
        '<span class="nota">Las secciones son iguales a toda altura; por Cavalieri, V<sub>esfera</sub> = πR²·2R − 2·⅓πR³ = ⁴⁄₃πR³.</span>';
    }
  };

  /* --- punto en el espacio --- */
  A['punto-espacio'] = {
    escala: 52, H: 400, az: 0.75, el: 0.38,
    controles: [{ nombre: 'x', etiqueta: 'x', min: -3, max: 3, paso: 0.5, valor: 2 }, { nombre: 'y', etiqueta: 'y', min: -3, max: 3, paso: 0.5, valor: 3 }, { nombre: 'z', etiqueta: 'z', min: -3, max: 3, paso: 0.5, valor: 2.5 }],
    dibuja: function (E, e, G) {
      E.ejes(3.8, { neg: 3.5 });
      var P = [e.x, e.y, e.z], Pxy = [e.x, e.y, 0];
      var caja = G.casco([[0, 0, 0], [e.x, 0, 0], [0, e.y, 0], [0, 0, e.z], [e.x, e.y, 0], [e.x, 0, e.z], [0, e.y, e.z], P].filter(function () { return true; }));
      if (Math.abs(e.x * e.y * e.z) > 1e-6) E.solido(caja, { c: '#9fd0b2', op: 0.18, bw: 1, borde: '#6aa583' });
      E.linea([e.x, 0, 0], Pxy, { c: G.C.ambar, w: 1.6, dash: '5 4', z: 50 }); E.linea([0, e.y, 0], Pxy, { c: G.C.ambar, w: 1.6, dash: '5 4', z: 50 });
      E.linea(Pxy, P, { c: G.C.morado, w: 1.8, dash: '5 4', z: 50 });
      E.flecha([0, 0, 0], P, { c: G.C.verde, w: 2.4, z: 60 });
      E.punto(Pxy, { c: G.C.ambar, z: 70 }); E.punto(P, { c: G.C.verde, r: 5, z: 80 });
      E.texto(P, 'P', { dx: 12, dy: -12, bold: true, c: G.C.verde });
      var d = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
      var oct = (e.x >= 0 ? '+' : '−') + (e.y >= 0 ? '+' : '−') + (e.z >= 0 ? '+' : '−');
      return '<span>P = (' + fmt(e.x) + ', ' + fmt(e.y) + ', ' + fmt(e.z) + ')</span><span>proyección en el plano xy: (' + fmt(e.x) + ', ' + fmt(e.y) + ', 0)</span><span>OP = √(x² + y² + z²) = <b>' + fmt(d, 3) + '</b></span><span>signos (' + oct + ')</span>';
    }
  };

  /* --- el plano ax + by + cz = d --- */
  A['plano-ecuacion'] = {
    escala: 50, H: 400, az: 0.7, el: 0.35,
    controles: [{ nombre: 'a', etiqueta: 'a', min: -3, max: 3, paso: 0.5, valor: 1 }, { nombre: 'b', etiqueta: 'b', min: -3, max: 3, paso: 0.5, valor: 1 },
      { nombre: 'c', etiqueta: 'c', min: -3, max: 3, paso: 0.5, valor: 2 }, { nombre: 'd', etiqueta: 'd', min: -6, max: 6, paso: 0.5, valor: 3 }],
    dibuja: function (E, e, G) {
      var L = 3, n = [e.a, e.b, e.c];
      E.ejes(3.9, { neg: 3.3 });
      // caja de referencia
      var cubo = G.SOLIDOS.cubo().map(function (p) { return G.m3(p, L); }), ar = G.aristas(G.casco(cubo).F);
      ar.forEach(function (a) { E.linea(cubo[a.a], cubo[a.b], { c: '#c6d6cc', w: 0.8, z: -900 }); });
      if (G.n3(n) < 1e-9) return 'Con a = b = c = 0 no hay plano: el vector normal no puede ser nulo.';
      // polígono de corte del plano con el cubo [-L,L]^3
      var pts = [];
      ar.forEach(function (a) {
        var p = cubo[a.a], q = cubo[a.b], fp = G.d3(n, p) - e.d, fq = G.d3(n, q) - e.d;
        if (fp * fq < 0) { var t = fp / (fp - fq); pts.push(G.a3(p, G.m3(G.s3(q, p), t))); }
        else if (Math.abs(fp) < 1e-9) pts.push(p);
      });
      if (pts.length >= 3) {
        var cc = G.c3(pts), nn = G.u3(n), e1 = G.u3(G.s3(pts[0], cc)), e2 = G.x3(nn, e1);
        pts.sort(function (p, q) { var a = G.s3(p, cc), b = G.s3(q, cc); return Math.atan2(G.d3(a, e2), G.d3(a, e1)) - Math.atan2(G.d3(b, e2), G.d3(b, e1)); });
        E.cara(pts, { c: '#f2c14e', op: 0.5, plano: true, borde: '#b08518', bw: 1.4, z: 0 });
        var P0 = G.m3(n, e.d / G.d3(n, n));
        E.flecha(P0, G.a3(P0, G.m3(G.u3(n), 1.4)), { c: G.C.rojo, w: 3, z: 200 });
        E.punto(P0, { z: 210 });
        E.texto(G.a3(P0, G.m3(G.u3(n), 1.65)), 'n', { c: G.C.rojo, bold: true, size: 18 });
      }
      var ec = (e.a ? fmt(e.a) + 'x ' : '') + (e.b ? (e.b < 0 ? '− ' : '+ ') + fmt(Math.abs(e.b)) + 'y ' : '') + (e.c ? (e.c < 0 ? '− ' : '+ ') + fmt(Math.abs(e.c)) + 'z ' : '');
      ec = ec.replace(/^\+ /, '');
      var dist = Math.abs(e.d) / G.n3(n);
      return '<span><b>' + ec + '= ' + fmt(e.d) + '</b></span><span>normal <b style="color:' + G.C.rojo + '">n</b> = (' + fmt(e.a) + ', ' + fmt(e.b) + ', ' + fmt(e.c) + ')</span><span>distancia al origen = |d| / ‖n‖ = ' + fmt(dist, 3) + '</span>' +
        (pts.length < 3 ? '<span class="nota">El plano queda fuera de la caja dibujada.</span>' : '');
    }
  };

  /* --- producto vectorial --- */
  A['producto-vectorial'] = {
    escala: 46, H: 400, az: 0.8, el: 0.35,
    controles: [{ nombre: 'ux', etiqueta: 'u₁', min: -3, max: 3, paso: 0.5, valor: 2 }, { nombre: 'uy', etiqueta: 'u₂', min: -3, max: 3, paso: 0.5, valor: 0 }, { nombre: 'uz', etiqueta: 'u₃', min: -3, max: 3, paso: 0.5, valor: 0.5 },
      { nombre: 'vx', etiqueta: 'v₁', min: -3, max: 3, paso: 0.5, valor: 0.5 }, { nombre: 'vy', etiqueta: 'v₂', min: -3, max: 3, paso: 0.5, valor: 2 }, { nombre: 'vz', etiqueta: 'v₃', min: -3, max: 3, paso: 0.5, valor: 0 }],
    dibuja: function (E, e, G) {
      E.ejes(3.4);
      var u = [e.ux, e.uy, e.uz], v = [e.vx, e.vy, e.vz], w = G.x3(u, v), O = [0, 0, 0];
      E.cara([O, u, G.a3(u, v), v], { c: '#f2c14e', op: 0.45, plano: true, borde: '#b08518' });
      var wn = G.n3(w), wd = wn > 4 ? G.m3(w, 4 / wn) : w;
      E.flecha(O, u, { c: G.C.verde, w: 3.2 }); E.flecha(O, v, { c: G.C.azul, w: 3.2 });
      if (wn > 1e-9) E.flecha(O, wd, { c: G.C.rojo, w: 3.4 });
      E.texto(G.m3(u, 1.12), 'u', { c: G.C.verde, bold: true, size: 18 }); E.texto(G.m3(v, 1.12), 'v', { c: G.C.azul, bold: true, size: 18 });
      if (wn > 1e-9) E.texto(G.m3(wd, 1.1), 'u×v', { c: G.C.rojo, bold: true, size: 16 });
      return '<span><b style="color:' + G.C.rojo + '">u × v</b> = (' + fmt(w[0], 2) + ', ' + fmt(w[1], 2) + ', ' + fmt(w[2], 2) + ')</span><span>área del paralelogramo = ‖u × v‖ = <b>' + fmt(wn, 3) + '</b></span>' +
        '<span>(u×v)·u = ' + fmt(G.d3(w, u), 2) + ', (u×v)·v = ' + fmt(G.d3(w, v), 2) + '</span>' + (wn > 4 ? '<span class="nota">(u × v se dibuja acortado)</span>' : '') + (wn < 1e-9 ? '<span class="nota">u y v son colineales: el producto es el vector nulo.</span>' : '');
    }
  };

  /* --- producto mixto --- */
  A['producto-mixto'] = {
    escala: 48, H: 400, az: 0.75, el: 0.32,
    controles: [{ nombre: 'wx', etiqueta: 'w₁', min: -2, max: 2, paso: 0.25, valor: 0.5 }, { nombre: 'wy', etiqueta: 'w₂', min: -2, max: 2, paso: 0.25, valor: 0.5 }, { nombre: 'wz', etiqueta: 'w₃', min: -2.5, max: 2.5, paso: 0.25, valor: 2 }],
    dibuja: function (E, e, G) {
      var u = [2.5, 0, 0], v = [0.6, 2.2, 0], w = [e.wx, e.wy, e.wz], O = [0, 0, 0];
      var V = [O, u, v, w, G.a3(u, v), G.a3(u, w), G.a3(v, w), G.a3(G.a3(u, v), w)];
      var vol = G.d3(u, G.x3(v, w));
      if (Math.abs(vol) > 1e-6) E.solido(G.casco(V), { c: '#9b7ccc', op: 0.35 });
      else E.cara([O, u, G.a3(u, v), v], { c: '#9b7ccc', op: 0.35, plano: true });
      E.flecha(O, u, { c: G.C.verde, w: 3.2, z: 999 }); E.flecha(O, v, { c: G.C.azul, w: 3.2, z: 999 }); E.flecha(O, w, { c: G.C.ambar, w: 3.2, z: 999 });
      // altura sobre la base
      var hp = [w[0], w[1], 0];
      E.linea(hp, w, { c: G.C.rojo, w: 1.6, dash: '5 4', z: 998 });
      E.texto(G.m3(u, 1.1), 'u', { c: G.C.verde, bold: true }); E.texto(G.m3(v, 1.12), 'v', { c: G.C.azul, bold: true }); E.texto(G.m3(w, 1.1), 'w', { c: G.C.ambar, bold: true });
      return '<span>u = (2,5; 0; 0), v = (0,6; 2,2; 0)</span><span>w · (u × v) = <b>' + fmt(vol, 3) + '</b></span><span>volumen = |' + fmt(vol, 3) + '| = <b>' + fmt(Math.abs(vol), 3) + '</b></span>' +
        (Math.abs(vol) < 1e-6 ? '<span class="nota">w está en el plano de u y v: son coplanares.</span>' : '<span class="nota">Solo importa la altura de w sobre el plano de u y v.</span>');
    }
  };

  /* ---------- arranque ---------- */
  function inicia() {
    document.querySelectorAll('.applet[data-applet3d]').forEach(function (el) {
      var def = A[el.getAttribute('data-applet3d')];
      if (def && !el._ok) { el._ok = 1; Applet3D(el, def); }
    });
  }
  window.GBgeo3d = A;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

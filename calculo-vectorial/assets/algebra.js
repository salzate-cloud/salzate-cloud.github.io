/* Álgebra Lineal — laboratorios interactivos: planos que se arrastran, Gauss–Jordan exacto, 3D y retratos de fase */
(function () {
  'use strict';
  var K = { c1: '#0b4f6c', c2: '#c8553d', c3: '#a86a12', c4: '#2e7d5b', mor: '#6d28d9', gris: '#7b8394', tinta: '#1d2233', oro: '#c9932e' };
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

  /* motor 3D compartido con Cálculo Integral */
  function hexrgb(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function Escena(cv, o) {
    o = o || {};
    var E = { yaw: o.yaw === undefined ? -0.6 : o.yaw, pitch: o.pitch === undefined ? 0.35 : o.pitch, zoom: o.zoom || 1, esc: o.esc || 60, centro: o.centro || [0, 0, 0], polys: [], lineas: [], textos: [], fondo: o.fondo || null, auto: !!o.auto, luz: [0.35, 0.75, 0.55], oscuro: !!o.oscuro };
    var dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = cv.getContext('2d'), W = 0, H = 0;
    function tam() { var r = cv.getBoundingClientRect(); W = r.width || +cv.getAttribute('width'); H = W * (+cv.getAttribute('height') / +cv.getAttribute('width')); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    tam();
    window.addEventListener('resize', function () { tam(); E.pinta(); });
    function rot(p) {
      var x = p[0] - E.centro[0], y = p[1] - E.centro[1], z = p[2] - E.centro[2];
      var cy = Math.cos(E.yaw), sy = Math.sin(E.yaw), cp = Math.cos(E.pitch), sp = Math.sin(E.pitch);
      var x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
      var y2 = cp * y - sp * z1, z2 = sp * y + cp * z1;
      return [x1, y2, z2];
    }
    function proy(q) { var d = 14, k = d / (d - q[2]); var s = E.esc * E.zoom * k; return [W / 2 + q[0] * s, H / 2 - q[1] * s, q[2]]; }
    E.poly = function (pts, col, op, linea) { E.polys.push({ p: pts, c: col, o: op === undefined ? 1 : op, l: linea }); };
    E.linea = function (pts, col, w, dash) { E.lineas.push({ p: pts, c: col, w: w || 1.5, d: dash }); };
    E.texto = function (p, s, col) { E.textos.push({ p: p, s: s, c: col }); };
    E.limpia = function () { E.polys = []; E.lineas = []; E.textos = []; };
    E.pinta = function () {
      ctx.clearRect(0, 0, W, H);
      if (E.fondo) E.fondo(ctx, W, H);
      var L = E.luz, items = [];
      E.polys.forEach(function (P) {
        var q = P.p.map(rot), z = 0; q.forEach(function (v) { z += v[2]; }); z /= q.length;
        var a = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], b = [q[q.length - 1][0] - q[0][0], q[q.length - 1][1] - q[0][1], q[q.length - 1][2] - q[0][2]];
        if (q.length > 2) b = [q[2][0] - q[0][0], q[2][1] - q[0][1], q[2][2] - q[0][2]];
        var n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nn = Math.hypot(n[0], n[1], n[2]) || 1;
        var lam = Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nn);
        var esp = Math.pow(Math.abs(n[2] / nn), 12) * 0.25;
        items.push({ t: 0, z: z, q: q, P: P, k: 0.45 + 0.55 * lam, e: esp });
      });
      E.lineas.forEach(function (Li) { var q = Li.p.map(rot), z = 0; q.forEach(function (v) { z += v[2]; }); items.push({ t: 1, z: z / q.length + 0.01, q: q, L: Li }); });
      items.sort(function (u, v) { return u.z - v.z; });
      items.forEach(function (it) {
        var pr = it.q.map(proy);
        ctx.beginPath(); pr.forEach(function (v, i) { if (i) ctx.lineTo(v[0], v[1]); else ctx.moveTo(v[0], v[1]); });
        if (it.t === 0) {
          var c = hexrgb(it.P.c), k = it.k, e = it.e * 255;
          ctx.closePath();
          ctx.fillStyle = 'rgba(' + Math.min(255, Math.round(c[0] * k + e)) + ',' + Math.min(255, Math.round(c[1] * k + e)) + ',' + Math.min(255, Math.round(c[2] * k + e)) + ',' + it.P.o + ')';
          ctx.fill();
          ctx.strokeStyle = it.P.l || ctx.fillStyle; ctx.lineWidth = it.P.l ? 0.6 : 0.5; ctx.stroke();
        } else {
          ctx.strokeStyle = it.L.c; ctx.lineWidth = it.L.w; ctx.setLineDash(it.L.d || []); ctx.stroke(); ctx.setLineDash([]);
        }
      });
      E.textos.forEach(function (T) { var v = proy(rot(T.p)); ctx.font = 'italic 15px Palatino Linotype,Palatino,Georgia,serif'; ctx.fillStyle = T.c || (E.oscuro ? '#fff' : '#1d2233'); ctx.textAlign = 'center'; ctx.fillText(T.s, v[0], v[1]); });
    };
    // interacción
    var arr = null, toques = {}, d0 = 0, z0 = 1;
    cv.addEventListener('pointerdown', function (e) { toques[e.pointerId] = [e.clientX, e.clientY]; arr = [e.clientX, e.clientY]; E.auto = false; try { cv.setPointerCapture(e.pointerId); } catch (x) {} var ks = Object.keys(toques); if (ks.length === 2) { var a = toques[ks[0]], b = toques[ks[1]]; d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = E.zoom; } });
    cv.addEventListener('pointermove', function (e) {
      if (!arr || !toques[e.pointerId]) return;
      toques[e.pointerId] = [e.clientX, e.clientY]; var ks = Object.keys(toques);
      if (ks.length === 2) { var a = toques[ks[0]], b = toques[ks[1]]; E.zoom = Math.max(0.4, Math.min(3, z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / (d0 || 1))); E.pinta(); return; }
      E.yaw += (e.clientX - arr[0]) * 0.01; E.pitch = Math.max(-1.45, Math.min(1.45, E.pitch + (e.clientY - arr[1]) * 0.01)); arr = [e.clientX, e.clientY]; E.pinta();
    });
    function suelta(e) { delete toques[e.pointerId]; if (!Object.keys(toques).length) arr = null; }
    cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); E.zoom = Math.max(0.4, Math.min(3, E.zoom * Math.exp(-e.deltaY * 0.001))); E.pinta(); }, { passive: false });
    cv.addEventListener('dblclick', function () { E.yaw = o.yaw === undefined ? -0.6 : o.yaw; E.pitch = o.pitch === undefined ? 0.35 : o.pitch; E.zoom = 1; E.pinta(); });
    return E;
  }
  function lienzo(cu, W, H) { var cv = el('canvas', { class: 'c3d', width: W || 640, height: H || 400 }); cu.appendChild(cv); var a = el('div', { class: 'ayuda3d' }, 'Arrastra para girar · rueda o pellizco para acercar · doble clic para volver a la vista inicial'); cu.appendChild(a); return cv; }
  function ejes3(E, L, o) {
    o = o || {};
    var c = o.c || '#7b8394';
    E.linea([[-(o.xn || 0.3), 0, 0], [L[0], 0, 0]], c, 1.2); E.texto([L[0] + 0.25, 0, 0], 'x');
    E.linea([[0, -(o.yn === undefined ? 0.3 : o.yn), 0], [0, L[1], 0]], c, 1.2); E.texto([0, L[1] + 0.25, 0], 'y');
    if (L[2]) { E.linea([[0, 0, -(o.zn === undefined ? 0.3 : o.zn)], [0, 0, L[2]]], c, 1.2); E.texto([0, 0, L[2] + 0.3], 'z'); }
  }

  /* ================= utilidades de álgebra lineal ================= */
  function det2(a, b, c, d) { return a * d - b * c; }
  function eig2(a, b, c, d) { var tr = a + d, de = a * d - b * c, D = tr * tr / 4 - de; if (D < -1e-12) return { re: tr / 2, im: Math.sqrt(-D), compl: true }; var s = Math.sqrt(Math.max(0, D)); return { l1: tr / 2 + s, l2: tr / 2 - s, compl: false }; }
  function vecProp(a, b, c, d, l) { var v = Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : (Math.abs(a - l) < 1e-9 ? [1, 0] : [0, 1]); var n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; }
  function fr(x) { // número -> fracción legible
    if (!isFinite(x)) return '∞'; if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x)).replace('-', '−');
    for (var q = 2; q <= 24; q++) { var p = x * q; if (Math.abs(p - Math.round(p)) < 1e-7) return (Math.round(p) < 0 ? '−' : '') + Math.abs(Math.round(p)) + '/' + q; }
    return f2(x, 3);
  }
  function vstr(v) { return '(' + v.map(function (x) { return fr(x); }).join(', ') + ')'; }
  function mat(M) { return '<table class="mat"><tbody>' + M.map(function (f) { return '<tr>' + f.map(function (x) { return '<td>' + (typeof x === 'string' ? x : fr(x)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; }
  function flecha(P, a, b, col, w, et) {
    var x1 = P.X(a[0]), y1 = P.Y(a[1]), x2 = P.X(b[0]), y2 = P.Y(b[1]), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 2) return;
    var ux = dx / L, uy = dy / L, hw = 5 + (w || 2.4);
    P.put('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * hw * 1.6) + '" y2="' + (y2 - uy * hw * 1.6) + '" stroke="' + col + '" stroke-width="' + (w || 2.6) + '" stroke-linecap="round"/>' +
      '<path d="M' + x2 + ',' + y2 + 'L' + (x2 - ux * hw * 2.2 - uy * hw) + ',' + (y2 - uy * hw * 2.2 + ux * hw) + 'L' + (x2 - ux * hw * 2.2 + uy * hw) + ',' + (y2 - uy * hw * 2.2 - ux * hw) + 'Z" fill="' + col + '"/>');
    if (et) P.put(tx(x2 + ux * 14 + 4, y2 + uy * 14, et, { c: col, it: true, s: 16, b: true }));
  }
  function malla(P, A, col, op, R) { // imagen de la malla entera bajo A = [[a,b],[c,d]]
    R = R || 8; var h = '';
    for (var k = -R; k <= R; k++) {
      var p1 = [A[0][0] * k + A[0][1] * -R, A[1][0] * k + A[1][1] * -R], p2 = [A[0][0] * k + A[0][1] * R, A[1][0] * k + A[1][1] * R];
      var q1 = [A[0][0] * -R + A[0][1] * k, A[1][0] * -R + A[1][1] * k], q2 = [A[0][0] * R + A[0][1] * k, A[1][0] * R + A[1][1] * k];
      var o = k === 0 ? op * 2.2 : op;
      h += '<line x1="' + P.X(p1[0]) + '" y1="' + P.Y(p1[1]) + '" x2="' + P.X(p2[0]) + '" y2="' + P.Y(p2[1]) + '" stroke="' + col + '" stroke-opacity="' + o + '" stroke-width="1"/>';
      h += '<line x1="' + P.X(q1[0]) + '" y1="' + P.Y(q1[1]) + '" x2="' + P.X(q2[0]) + '" y2="' + P.Y(q2[1]) + '" stroke="' + col + '" stroke-opacity="' + o + '" stroke-width="1"/>';
    }
    P.put(h);
  }
  /* lienzo 2D con puntos que se arrastran */
  function Arrastre(svg, P, handles, cb) {
    var act = null;
    function pos(e) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(e.clientX - r.left) * vb.width / r.width, (e.clientY - r.top) * vb.height / r.height]; }
    function mundo(p) { var v = P.v; return [v[0] + (p[0] - P.ox) / P.W * (v[1] - v[0]), v[2] + (P.oy + P.H - p[1]) / P.H * (v[3] - v[2])]; }
    svg.style.touchAction = 'none'; svg.style.cursor = 'crosshair';
    svg.addEventListener('pointerdown', function (e) {
      var p = pos(e), mejor = 1e9; act = null;
      handles().forEach(function (h) { var q = h.get(), d = Math.hypot(P.X(q[0]) - p[0], P.Y(q[1]) - p[1]); if (d < mejor && d < 26) { mejor = d; act = h; } });
      if (act) { try { svg.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); }
    });
    svg.addEventListener('pointermove', function (e) { if (!act) return; var w = mundo(pos(e)); if (act.snap !== false) { w = [Math.round(w[0] * 4) / 4, Math.round(w[1] * 4) / 4]; } act.set(w); cb(); });
    function fin() { act = null; } svg.addEventListener('pointerup', fin); svg.addEventListener('pointercancel', fin);
  }
  function Plano2(v, W, H, ox, oy) { var P = Plano(v, W, H, ox, oy); P.W = W || 640; P.H = H || 380; P.ox = ox || 0; P.oy = oy || 0; return P; }
  function asa(P, p, col) { P.put('<circle cx="' + P.X(p[0]) + '" cy="' + P.Y(p[1]) + '" r="8" fill="' + col + '" fill-opacity=".18" stroke="' + col + '" stroke-width="1.5"/>'); }
  function rejilla(P, paso) { var v = P.v, h = ''; for (var x = Math.ceil(v[0]); x <= v[1]; x += paso || 1) h += '<line x1="' + P.X(x) + '" y1="' + P.oy + '" x2="' + P.X(x) + '" y2="' + (P.oy + P.H) + '" stroke="#e8ebf0" stroke-width="1"/>'; for (var y = Math.ceil(v[2]); y <= v[3]; y += paso || 1) h += '<line x1="' + P.ox + '" y1="' + P.Y(y) + '" x2="' + (P.ox + P.W) + '" y2="' + P.Y(y) + '" stroke="#e8ebf0" stroke-width="1"/>'; P.put(h); }
  function boton(cu, txt) { var b = el('button', { type: 'button' }, txt); b.style.cssText = 'margin:6px 6px 0 0;padding:5px 14px;border-radius:999px;border:1px solid #0b4f6c;background:#e9f2f6;color:#0b4f6c;font:14px system-ui,sans-serif;cursor:pointer'; cu.appendChild(b); return b; }
  function fijaSlider(cu, nombre, v) { cu.querySelectorAll('.ctl2d input').forEach(function (x) { if (x.parentNode.querySelector('span').textContent === nombre) { x.value = v; x.dispatchEvent(new Event('input')); } }); }

  /* 1. Suma y producto por escalar */
  A['suma'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 400), u = [3, 1], v = [1, 2.5];
    var st = controles(cu, [['k', 'escalar c (para c·u)', -2, 2.5, 1, .25]], pinta);
    var P = Plano2([-4.5, 6.5, -3, 5], 640, 400);
    Arrastre(s, P, function () { return [{ get: function () { return u; }, set: function (w) { u = w; } }, { get: function () { return v; }, set: function (w) { v = w; } }]; }, pinta);
    function pinta() {
      P.buf = []; rejilla(P); P.ejes({ ticks: false });
      var w = [u[0] + v[0], u[1] + v[1]], cu_ = [st.k * u[0], st.k * u[1]];
      P.put('<path d="M' + P.X(0) + ',' + P.Y(0) + 'L' + P.X(u[0]) + ',' + P.Y(u[1]) + 'L' + P.X(w[0]) + ',' + P.Y(w[1]) + 'L' + P.X(v[0]) + ',' + P.Y(v[1]) + 'Z" fill="' + K.c1 + '" fill-opacity=".07"/>');
      P.seg(u[0], u[1], w[0], w[1], { c: K.gris, dash: '4 4', w: 1.3 }); P.seg(v[0], v[1], w[0], w[1], { c: K.gris, dash: '4 4', w: 1.3 });
      if (st.k !== 1) flecha(P, [0, 0], cu_, K.c3, 2.2, 'cu');
      flecha(P, [0, 0], w, K.c2, 3, 'u+v'); flecha(P, [0, 0], u, K.c1, 2.6, 'u'); flecha(P, [0, 0], v, K.c4, 2.6, 'v');
      asa(P, u, K.c1); asa(P, v, K.c4); s.innerHTML = P.html();
      lect(c, ['u = ' + col(K.c1, vstr(u)), 'v = ' + col(K.c4, vstr(v)), 'u + v = ' + col(K.c2, vstr(w)), 'c·u = ' + vstr(cu_)]);
    }
    pinta();
  };

  /* 2. Combinación lineal y coordenadas en una base (malla deformada) */
  A['coordenadas'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420), b1 = [2, 1], b2 = [-.5, 1.5], v = [3, 3.5];
    var P = Plano2([-5, 6, -3.5, 5.2], 640, 420);
    Arrastre(s, P, function () { return [b1, b2, v].map(function (q) { return { get: function () { return q; }, set: function (w) { q[0] = w[0]; q[1] = w[1]; } }; }); }, pinta);
    function pinta() {
      P.buf = []; rejilla(P); P.ejes({ ticks: false });
      var D = det2(b1[0], b2[0], b1[1], b2[1]);
      malla(P, [[b1[0], b2[0]], [b1[1], b2[1]]], K.c4, .28, 10);
      var lin = Math.abs(D) < 1e-6, a = lin ? NaN : (v[0] * b2[1] - v[1] * b2[0]) / D, b = lin ? NaN : (b1[0] * v[1] - b1[1] * v[0]) / D;
      if (!lin) { var p = [a * b1[0], a * b1[1]]; P.seg(0, 0, p[0], p[1], { c: K.c4, w: 1.5, dash: '5 4' }); P.seg(p[0], p[1], v[0], v[1], { c: K.c4, w: 1.5, dash: '5 4' }); }
      flecha(P, [0, 0], b1, K.c1, 2.8, 'b₁'); flecha(P, [0, 0], b2, K.c1, 2.8, 'b₂'); flecha(P, [0, 0], v, K.c2, 3, 'v');
      asa(P, b1, K.c1); asa(P, b2, K.c1); asa(P, v, K.c2); s.innerHTML = P.html();
      lect(c, lin ? [col(K.c2, 'b₁ y b₂ son paralelos: no forman base'), 'gen{b₁, b₂} es una recta'] : ['v = ' + col(K.c2, fr(a)) + ' b₁ + ' + col(K.c2, fr(b)) + ' b₂', '[v]_B = ' + col(K.c2, vstr([a, b])), '[v]_E = ' + vstr(v), 'det[b₁ b₂] = ' + fr(D)]);
    }
    pinta();
  };

  /* 3. Cambio de base: dos mallas */
  A['cambio-base'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420), B = [[1, 0], [1, 1]], C = [[2, -1], [0, 1.5]], v = [2.5, 2];
    var P = Plano2([-5, 6, -3.5, 5.2], 640, 420);
    Arrastre(s, P, function () { return [B[0], B[1], C[0], C[1], v].map(function (q) { return { get: function () { return q; }, set: function (w) { q[0] = w[0]; q[1] = w[1]; } }; }); }, pinta);
    function coords(M, x) { var D = det2(M[0][0], M[1][0], M[0][1], M[1][1]); return [(x[0] * M[1][1] - x[1] * M[1][0]) / D, (M[0][0] * x[1] - M[0][1] * x[0]) / D]; }
    function pinta() {
      P.buf = []; P.ejes({ ticks: false });
      malla(P, [[B[0][0], B[1][0]], [B[0][1], B[1][1]]], K.c1, .22, 10); malla(P, [[C[0][0], C[1][0]], [C[0][1], C[1][1]]], K.c2, .22, 10);
      flecha(P, [0, 0], B[0], K.c1, 2.6, 'b₁'); flecha(P, [0, 0], B[1], K.c1, 2.6, 'b₂'); flecha(P, [0, 0], C[0], K.c2, 2.6, 'c₁'); flecha(P, [0, 0], C[1], K.c2, 2.6, 'c₂'); flecha(P, [0, 0], v, K.tinta, 3, 'v');
      [B[0], B[1], C[0], C[1]].forEach(function (q, i) { asa(P, q, i < 2 ? K.c1 : K.c2); }); asa(P, v, K.tinta); s.innerHTML = P.html();
      var vb = coords(B, v), vc = coords(C, v), p1 = coords(C, B[0]), p2 = coords(C, B[1]);
      if (!vb.concat(vc, p1, p2).every(isFinite)) { lect(c, ['alguna de las dos familias no es base']); return; }
      lect(c, ['[v]_B = ' + col(K.c1, vstr(vb)), '[v]_C = ' + col(K.c2, vstr(vc)), 'P_{B→C} = ' + mat([[p1[0], p2[0]], [p1[1], p2[1]]]), 'P_{B→C}[v]_B = ' + vstr([p1[0] * vb[0] + p2[0] * vb[1], p1[1] * vb[0] + p2[1] * vb[1]])]);
    }
    pinta();
  };

  /* 4. Gauss–Jordan paso a paso, con fracciones exactas */
  function Q(n, d) { d = d || 1; if (d < 0) { n = -n; d = -d; } var g = gcd(Math.abs(n), d) || 1; return { n: n / g, d: d / g }; }
  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function qs(a, b) { return Q(a.n * b.d - b.n * a.d, a.d * b.d); } function qm(a, b) { return Q(a.n * b.n, a.d * b.d); } function qdv(a, b) { return Q(a.n * b.d, a.d * b.n); }
  function qstr(a) { return (a.n < 0 ? '−' : '') + Math.abs(a.n) + (a.d !== 1 ? '/' + a.d : ''); }
  function qparse(t) { t = String(t).trim().replace('−', '-'); if (!t) return Q(0); var m = t.match(/^(-?\d+)\s*\/\s*(\d+)$/); if (m) return Q(+m[1], +m[2]); var x = parseFloat(t); if (!isFinite(x)) return Q(0); var d = 1; while (Math.abs(x * d - Math.round(x * d)) > 1e-9 && d < 1e6) d *= 10; return Q(Math.round(x * d), d); }
  A['gauss-jordan'] = function (c) {
    var cu = c.querySelector('.acuerpo');
    var EJ = { 'Ejemplo 3×4': '1 2 0 1\n2 4 1 3\n-1 -2 1 0', 'Rango completo 3×3': '2 1 1\n4 3 3\n8 7 9', 'Sistema aumentado': '1 1 1 6\n0 2 5 -4\n2 5 -1 27', 'Espacio nulo 3×5': '1 3 -2 0 2\n2 6 -5 -2 4\n0 0 5 10 0' };
    cu.innerHTML = '<div class="gj"><div class="gj-izq"><label>Matriz (filas en renglones, entradas separadas por espacios; se aceptan fracciones 1/2):</label><textarea rows="5" spellcheck="false"></textarea>' +
      '<div class="gj-ej">' + Object.keys(EJ).map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="gj-bot"><button type="button" data-a="ini">Cargar</button><button type="button" data-a="paso">Paso ›</button><button type="button" data-a="todo">Hasta la forma escalonada reducida »</button></div></div>' +
      '<div class="gj-der"><div class="gj-mat"></div><div class="gj-op"></div></div></div><div class="gj-log"></div><div class="gj-res"></div>';
    var ta = cu.querySelector('textarea'); ta.value = EJ['Ejemplo 3×4'];
    var M, fila, colu, piv, log;
    function carga() { M = ta.value.trim().split(/\n+/).map(function (f) { return f.trim().split(/[\s,;]+/).map(qparse); }); var n = Math.max.apply(null, M.map(function (f) { return f.length; })); M.forEach(function (f) { while (f.length < n) f.push(Q(0)); }); fila = 0; colu = 0; piv = []; log = []; pinta(''); }
    function hecho() { return fila >= M.length || colu >= M[0].length; }
    function paso() {
      if (hecho()) return false;
      var m = M.length, p = -1; for (var i = fila; i < m; i++) if (M[i][colu].n !== 0) { p = i; break; }
      if (p < 0) { log.push('Columna ' + (colu + 1) + ': no hay pivote; es una columna libre.'); colu++; pinta('libre'); return true; }
      if (p !== fila) { var t = M[p]; M[p] = M[fila]; M[fila] = t; log.push('F' + (fila + 1) + ' ↔ F' + (p + 1)); pinta('F' + (fila + 1) + ' ↔ F' + (p + 1)); return true; }
      var a = M[fila][colu];
      if (!(a.n === 1 && a.d === 1)) { M[fila] = M[fila].map(function (x) { return qdv(x, a); }); var op = 'F' + (fila + 1) + ' → (1/' + qstr(a) + ')·F' + (fila + 1); log.push(op); pinta(op); return true; }
      for (var k = 0; k < m; k++) if (k !== fila && M[k][colu].n !== 0) { var f = M[k][colu]; M[k] = M[k].map(function (x, j) { return qs(x, qm(f, M[fila][j])); }); var op2 = 'F' + (k + 1) + ' → F' + (k + 1) + ' − (' + qstr(f) + ')·F' + (fila + 1); log.push(op2); pinta(op2); return true; }
      piv.push(colu); log.push('Pivote en la columna ' + (colu + 1) + '.'); fila++; colu++; pinta('pivote'); return true;
    }
    function pinta(op) {
      cu.querySelector('.gj-mat').innerHTML = '<table class="mat grande"><tbody>' + M.map(function (f, i) { return '<tr>' + f.map(function (x, j) { var cl = (i === fila && j === colu && !hecho()) ? ' class="act"' : piv.indexOf(j) >= 0 && i === piv.indexOf(j) ? ' class="piv"' : ''; return '<td' + cl + '>' + qstr(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      cu.querySelector('.gj-op').textContent = op && op !== 'pivote' && op !== 'libre' ? op : '';
      cu.querySelector('.gj-log').innerHTML = log.length ? '<b>Operaciones:</b> ' + log.slice(-14).join(' · ') : '';
      var r = cu.querySelector('.gj-res');
      if (hecho()) {
        var n = M[0].length, libres = []; for (var j = 0; j < n; j++) if (piv.indexOf(j) < 0) libres.push(j);
        var nul = libres.map(function (l) { var v = []; for (var j2 = 0; j2 < n; j2++) v.push(Q(0)); v[l] = Q(1); piv.forEach(function (pc, i) { v[pc] = Q(-M[i][l].n, M[i][l].d); }); return '(' + v.map(qstr).join(', ') + ')'; });
        r.innerHTML = '<p><b>Forma escalonada reducida.</b> Rango ρ = ' + piv.length + ' · nulidad ν = ' + libres.length + ' · ρ + ν = ' + n + ' columnas.</p>' +
          '<p><b>Columnas pivote</b> (dan una base de C<sub>A</sub> tomadas de la matriz original): ' + (piv.map(function (p) { return 'c' + (p + 1); }).join(', ') || '—') + '</p>' +
          '<p><b>Base de R<sub>A</sub></b> (filas no nulas): ' + (M.slice(0, piv.length).map(function (f) { return '(' + f.map(qstr).join(', ') + ')'; }).join(', ') || '—') + '</p>' +
          '<p><b>Base de N<sub>A</sub></b>: ' + (nul.join(', ') || '{0}: el espacio nulo es trivial') + '</p>';
      } else r.innerHTML = '';
    }
    cu.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) { ta.value = EJ[b.dataset.k]; carga(); }
      if (b.dataset.a === 'ini') carga();
      if (b.dataset.a === 'paso') paso();
      if (b.dataset.a === 'todo') { var g = 0; while (paso() && g++ < 400); }
      lect(c, ['ρ(A) = número de pivotes', 'ν(A) = número de columnas libres']);
    });
    carga(); lect(c, ['ρ(A) = número de pivotes', 'ν(A) = número de columnas libres']);
  };

  /* 5. Proyección sobre un vector */
  A['proyeccion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 400), u = [4, 1.5], v = [1.5, 3];
    var P = Plano2([-3.5, 6.5, -2.5, 4.5], 640, 400);
    Arrastre(s, P, function () { return [{ get: function () { return u; }, set: function (w) { u = w; } }, { get: function () { return v; }, set: function (w) { v = w; } }]; }, pinta);
    function pinta() {
      P.buf = []; rejilla(P); P.ejes({ ticks: false });
      var uu = u[0] * u[0] + u[1] * u[1], k = (v[0] * u[0] + v[1] * u[1]) / (uu || 1), p = [k * u[0], k * u[1]];
      P.seg(-u[0] * 5, -u[1] * 5, u[0] * 5, u[1] * 5, { c: K.gris, w: 1, dash: '3 4' });
      flecha(P, [0, 0], u, K.c1, 2.6, 'u'); flecha(P, [0, 0], v, K.tinta, 2.6, 'v'); flecha(P, [0, 0], p, K.c4, 3.2, 'proyᵤv'); flecha(P, p, v, K.c2, 2.2, 'v − proyᵤv');
      var n = Math.sqrt(uu) || 1, e = [u[0] / n * .3, u[1] / n * .3], f = [-u[1] / n * .3 * Math.sign(k * 0 + ((v[0] - p[0]) * -u[1] + (v[1] - p[1]) * u[0]) || 1), u[0] / n * .3 * Math.sign(((v[0] - p[0]) * -u[1] + (v[1] - p[1]) * u[0]) || 1)];
      P.put('<path d="M' + P.X(p[0] + e[0]) + ',' + P.Y(p[1] + e[1]) + 'L' + P.X(p[0] + e[0] + f[0]) + ',' + P.Y(p[1] + e[1] + f[1]) + 'L' + P.X(p[0] + f[0]) + ',' + P.Y(p[1] + f[1]) + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.3"/>');
      asa(P, u, K.c1); asa(P, v, K.tinta); s.innerHTML = P.html();
      var ang = Math.acos(Math.max(-1, Math.min(1, (v[0] * u[0] + v[1] * u[1]) / (Math.sqrt(uu) * Math.hypot(v[0], v[1]))))) * 180 / Math.PI;
      lect(c, ['⟨v, u⟩ = ' + fr(v[0] * u[0] + v[1] * u[1]), 'proyᵤv = ' + col(K.c4, fr(k) + ' u = ' + vstr(p)), '⟨v − proyᵤv, u⟩ = 0', 'ángulo = ' + f2(ang, 1) + '°']);
    }
    pinta();
  };

  /* 6. Gram–Schmidt en 3D */
  A['gram-schmidt'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = lienzo(cu, 640, 420);
    var PRE = [[[1, 1, 0], [1, 0, 1], [0, 1, 1]], [[2, 0, 0], [1, 2, 0], [1, 1, 2]], [[1, 2, 2], [-1, 0, 2], [0, 0, 1]], [[1, 1, 1], [0, 1, 1], [0, 0, 1]]];
    var st = controles(cu, [['sel', 'k', 'vectores', ['(1,1,0), (1,0,1), (0,1,1)', '(2,0,0), (1,2,0), (1,1,2)', '(1,2,2), (−1,0,2), (0,0,1)', '(1,1,1), (0,1,1), (0,0,1)']], ['p', 'paso', 0, 3, 0, 1]], pinta);
    var E = Escena(cv, { esc: 125, yaw: -.7, pitch: .35, centro: [.5, .5, .5] }), b = boton(cu, '▶ Animar el proceso');
    b.onclick = function () { var k = 0; (function sig() { fijaSlider(cu, 'paso', k); if (k++ < 3) setTimeout(sig, 1100); })(); };
    function d3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function pinta() {
      var V = PRE[st.k], w = [], u = [];
      V.forEach(function (v) { var x = v.slice(); w.forEach(function (q) { var k = d3(v, q) / d3(q, q); x = [x[0] - k * q[0], x[1] - k * q[1], x[2] - k * q[2]]; }); w.push(x); var n = Math.sqrt(d3(x, x)); u.push([x[0] / n, x[1] / n, x[2] / n]); });
      E.limpia(); var L = 2.6;
      E.linea([[0, 0, 0], [L, 0, 0]], '#9aa3b2', 1.2); E.linea([[0, 0, 0], [0, L, 0]], '#9aa3b2', 1.2); E.linea([[0, 0, 0], [0, 0, L]], '#9aa3b2', 1.2); E.texto([L + .2, 0, 0], 'x'); E.texto([0, L + .2, 0], 'y'); E.texto([0, 0, L + .2], 'z');
      var cols = ['#0b4f6c', '#c8553d', '#2e7d5b'];
      function vec3(p, col, w, t) { E.linea([[0, 0, 0], p], col, w); E.poly([p, [p[0] * .86 + .05, p[1] * .86, p[2] * .86], [p[0] * .86, p[1] * .86 + .05, p[2] * .86 + .05]], col, 1); E.poly([p, [p[0] * .86 - .05, p[1] * .86, p[2] * .86 + .05], [p[0] * .86, p[1] * .86 - .05, p[2] * .86]], col, 1); if (t) E.texto([p[0] * 1.1, p[1] * 1.1, p[2] * 1.1], t, col); }
      V.forEach(function (v, i) { vec3(v, i < st.p ? '#c5cbd6' : '#1d2233', i < st.p ? 1.6 : 2.8, i < st.p ? '' : 'v' + (i + 1)); });
      for (var i = 0; i < st.p; i++) {
        vec3(u[i], cols[i], 3.4, 'u' + (i + 1));
        if (i === st.p - 1 && i > 0) { var v = V[i], pr = [v[0] - w[i][0], v[1] - w[i][1], v[2] - w[i][2]]; E.linea([[0, 0, 0], pr], '#a86a12', 2, [5, 4]); E.linea([pr, v], '#a86a12', 2, [5, 4]); }
      }
      if (st.p >= 2) { var a = u[0], bb = u[1], s = 1.3; E.poly([[-s * a[0] - s * bb[0], -s * a[1] - s * bb[1], -s * a[2] - s * bb[2]], [s * a[0] - s * bb[0], s * a[1] - s * bb[1], s * a[2] - s * bb[2]], [s * a[0] + s * bb[0], s * a[1] + s * bb[1], s * a[2] + s * bb[2]], [-s * a[0] + s * bb[0], -s * a[1] + s * bb[1], -s * a[2] + s * bb[2]]], '#0b4f6c', .1); }
      E.pinta();
      var t = ['paso ' + st.p + ' de 3'];
      if (st.p >= 1) t.push('u₁ = v₁/‖v₁‖');
      if (st.p >= 2) t.push('w₂ = v₂ − ⟨v₂,u₁⟩u₁ (punteado: lo que se resta)');
      if (st.p === 3) t.push('⟨uᵢ,uⱼ⟩: ' + [[0, 1], [0, 2], [1, 2]].map(function (p) { return f2(d3(u[p[0]], u[p[1]]), 3); }).join(', '));
      lect(c, t);
    }
    pinta();
  };

  /* 7. Mínimos cuadrados con puntos arrastrables */
  A['minimos'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 400), pts = [[1, 1.2], [2, 1.9], [3, 3.4], [4, 3.6], [5, 5.3], [6, 5.6]];
    var st = controles(cu, [['sel', 'g', 'modelo', ['recta y = a + bx', 'parábola y = a + bx + cx²', 'constante y = a']]], pinta);
    var P = Plano2([-.3, 7.5, -.6, 7.5], 640, 400);
    Arrastre(s, P, function () { return pts.map(function (q) { return { snap: false, get: function () { return q; }, set: function (w) { q[0] = w[0]; q[1] = w[1]; } }; }); }, pinta);
    var bA = boton(cu, '+ punto'), bQ = boton(cu, '− punto');
    bA.onclick = function () { pts.push([1 + Math.random() * 5.5, 1 + Math.random() * 5]); pinta(); }; bQ.onclick = function () { if (pts.length > 2) pts.pop(); pinta(); };
    function resuelve(Mt, y) { // ecuaciones normales A^T A x = A^T y por eliminación
      var n = Mt[0].length, N = [], i, j, k; for (i = 0; i < n; i++) { N.push([]); for (j = 0; j <= n; j++) { var sm = 0; for (k = 0; k < Mt.length; k++) sm += Mt[k][i] * (j < n ? Mt[k][j] : y[k]); N[i].push(sm); } }
      for (i = 0; i < n; i++) { var p = i; for (k = i + 1; k < n; k++) if (Math.abs(N[k][i]) > Math.abs(N[p][i])) p = k; var t = N[i]; N[i] = N[p]; N[p] = t; if (Math.abs(N[i][i]) < 1e-12) return null; for (k = 0; k < n; k++) if (k !== i) { var f = N[k][i] / N[i][i]; for (j = i; j <= n; j++) N[k][j] -= f * N[i][j]; } }
      return N.map(function (f, i) { return f[n] / f[i]; });
    }
    function pinta() {
      P.buf = []; rejilla(P); P.ejes({ px: 1, py: 1 });
      var g = [2, 3, 1][st.g], Mt = pts.map(function (p) { var f = []; for (var j = 0; j < g; j++) f.push(Math.pow(p[0], j)); return f; }), co = resuelve(Mt, pts.map(function (p) { return p[1]; }));
      var E = 0;
      if (co) {
        var f = function (x) { var y = 0; co.forEach(function (a, j) { y += a * Math.pow(x, j); }); return y; };
        pts.forEach(function (p) { var r = p[1] - f(p[0]); E += r * r; P.seg(p[0], p[1], p[0], f(p[0]), { c: K.c2, w: 1.6 }); P.rect(p[0], p[0] + Math.abs(r) * .25, Math.min(p[1], f(p[0])), Math.max(p[1], f(p[0])), { f: K.c2, fo: .12 }); });
        P.curva(f, -.3, 7.5, { c: K.c1, w: 2.6 });
      }
      pts.forEach(function (p) { P.punto(p[0], p[1], { c: K.tinta, r: 6 }); }); s.innerHTML = P.html();
      var nom = ['a', 'b', 'c'];
      lect(c, [co ? co.map(function (a, j) { return nom[j] + ' = ' + col(K.c1, f2(a, 4)); }).join(', ') : 'sistema singular', '‖b − Ax̂‖² = ' + col(K.c2, f2(E, 4)), 'AᵀA x̂ = Aᵀb (ecuaciones normales)']);
    }
    pinta();
  };

  /* 8. Transformaciones lineales del plano */
  var PRES = { 'Rotación 45°': [[.7071, -.7071], [.7071, .7071]], 'Reflexión en y = x': [[0, 1], [1, 0]], 'Cizalla': [[1, 1], [0, 1]], 'Escala (2, ½)': [[2, 0], [0, .5]], 'Proyección sobre el eje x': [[1, 0], [0, 0]], 'Simétrica': [[1.4, .8], [.8, 1.4]], 'Rotación + escala': [[1, -1.2], [1.2, 1]] };
  A['transformacion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420), Mx = [[1.4, .8], [.8, 1.4]], x = [1.5, .5], t = 1;
    var P = Plano2([-5, 5, -3.3, 3.3], 640, 420);
    var sel = el('div', { class: 'presets' }, Object.keys(PRES).map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('')); cu.appendChild(sel);
    var bAn = boton(cu, '▶ Animar de I a A');
    sel.onclick = function (e) { var b = e.target.closest('button'); if (b) { Mx = PRES[b.dataset.k].map(function (f) { return f.slice(); }); t = 1; pinta(); } };
    bAn.onclick = function () { t = 0; (function an() { t = Math.min(1, t + .02); pinta(); if (t < 1) requestAnimationFrame(an); })(); };
    Arrastre(s, P, function () { var M = Mt(); return [{ get: function () { return [M[0][0], M[1][0]]; }, set: function (w) { Mx[0][0] = w[0]; Mx[1][0] = w[1]; t = 1; } }, { get: function () { return [M[0][1], M[1][1]]; }, set: function (w) { Mx[0][1] = w[0]; Mx[1][1] = w[1]; t = 1; } }, { get: function () { return x; }, set: function (w) { x = w; } }]; }, pinta);
    function Mt() { return [[1 + t * (Mx[0][0] - 1), t * Mx[0][1]], [t * Mx[1][0], 1 + t * (Mx[1][1] - 1)]]; }
    function pinta() {
      var M = Mt(), D = det2(M[0][0], M[0][1], M[1][0], M[1][1]); P.buf = [];
      malla(P, [[1, 0], [0, 1]], '#c7cdd8', .5, 8); malla(P, M, K.c1, .35, 8);
      var sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(function (p) { return [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]]; });
      P.put('<path d="M' + sq.map(function (p) { return P.X(p[0]) + ',' + P.Y(p[1]); }).join('L') + 'Z" fill="' + (D >= 0 ? K.c3 : K.c2) + '" fill-opacity=".28"/>');
      var ci = ''; for (var k = 0; k <= 72; k++) { var a = 2 * Math.PI * k / 72, p = [Math.cos(a), Math.sin(a)], q = [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]]; ci += (k ? 'L' : 'M') + P.X(q[0]) + ',' + P.Y(q[1]); } P.put('<path d="' + ci + '" fill="none" stroke="' + K.c4 + '" stroke-width="1.6"/>');
      if (Math.abs(D) < 1e-6) { var nv = Math.abs(M[0][0]) + Math.abs(M[0][1]) > 1e-9 ? [-M[0][1], M[0][0]] : [-M[1][1], M[1][0]]; P.seg(-nv[0] * 9, -nv[1] * 9, nv[0] * 9, nv[1] * 9, { c: K.c2, w: 2.4, dash: '6 4' }); }
      var e = eig2(M[0][0], M[0][1], M[1][0], M[1][1]);
      if (!e.compl) [e.l1, e.l2].forEach(function (l) { var w = vecProp(M[0][0], M[0][1], M[1][0], M[1][1], l); P.seg(-w[0] * 9, -w[1] * 9, w[0] * 9, w[1] * 9, { c: K.c3, w: 1, dash: '2 5' }); });
      var Tx = [M[0][0] * x[0] + M[0][1] * x[1], M[1][0] * x[0] + M[1][1] * x[1]];
      flecha(P, [0, 0], [M[0][0], M[1][0]], K.c1, 2.8, 'Ae₁'); flecha(P, [0, 0], [M[0][1], M[1][1]], K.c1, 2.8, 'Ae₂');
      flecha(P, [0, 0], x, '#8b93a5', 2, 'x'); flecha(P, [0, 0], Tx, K.c2, 2.8, 'Ax');
      asa(P, [M[0][0], M[1][0]], K.c1); asa(P, [M[0][1], M[1][1]], K.c1); asa(P, x, '#8b93a5'); s.innerHTML = P.html();
      lect(c, ['A = ' + mat(M.map(function (f) { return f.map(function (v) { return f2(v, 2); }); })), 'det A = ' + col(D >= 0 ? K.c3 : K.c2, f2(D, 3)) + (D < 0 ? ' (invierte la orientación)' : ''), Math.abs(D) < 1e-6 ? col(K.c2, 'singular: el núcleo es la recta punteada') : 'invertible: núcleo {0}', e.compl ? 'valores propios complejos' : 'λ = ' + f2(e.l1, 3) + ', ' + f2(e.l2, 3)]);
    }
    pinta();
  };

  /* 9. Valores propios: ¿cuándo Ax es paralelo a x? */
  A['propios'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420), Mx = [[2, 1], [1, 2]], th = .35, corre = false;
    var P = Plano2([-5, 5, -3.3, 3.3], 640, 420);
    var PR = { 'Simétrica (3 y 1)': [[2, 1], [1, 2]], 'No simétrica': [[3, 1], [0, 2]], 'Un solo valor propio (Jordan)': [[2, 1], [0, 2]], 'Rotación (complejos)': [[0, -1], [1, 0]], 'Valor propio negativo': [[1, 2], [2, 1]] };
    var sel = el('div', { class: 'presets' }, Object.keys(PR).map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('')); cu.appendChild(sel);
    sel.onclick = function (e) { var b = e.target.closest('button'); if (b) { Mx = PR[b.dataset.k]; pinta(); } };
    var bG = boton(cu, '▶ Girar x');
    bG.onclick = function () { corre = !corre; bG.textContent = corre ? '❚❚ Pausa' : '▶ Girar x'; (function g() { if (!corre) return; th += .012; pinta(); requestAnimationFrame(g); })(); };
    Arrastre(s, P, function () { return [{ snap: false, get: function () { return [Math.cos(th), Math.sin(th)]; }, set: function (w) { th = Math.atan2(w[1], w[0]); } }]; }, pinta);
    function pinta() {
      var M = Mx, x = [Math.cos(th), Math.sin(th)], Ax = [M[0][0] * x[0] + M[0][1] * x[1], M[1][0] * x[0] + M[1][1] * x[1]], cr = x[0] * Ax[1] - x[1] * Ax[0], par = Math.abs(cr) < .045;
      P.buf = []; rejilla(P); P.ejes({ ticks: false });
      var ci = '', el2 = ''; for (var k = 0; k <= 90; k++) { var a = 2 * Math.PI * k / 90, p = [Math.cos(a), Math.sin(a)], q = [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]]; ci += (k ? 'L' : 'M') + P.X(p[0]) + ',' + P.Y(p[1]); el2 += (k ? 'L' : 'M') + P.X(q[0]) + ',' + P.Y(q[1]); }
      P.put('<path d="' + ci + '" fill="none" stroke="#9aa3b2" stroke-width="1.2" stroke-dasharray="3 4"/><path d="' + el2 + '" fill="' + K.c1 + '" fill-opacity=".05" stroke="' + K.c1 + '" stroke-width="1.4"/>');
      var e = eig2(M[0][0], M[0][1], M[1][0], M[1][1]);
      if (!e.compl) [e.l1, e.l2].forEach(function (l) { var w = vecProp(M[0][0], M[0][1], M[1][0], M[1][1], l); P.seg(-w[0] * 9, -w[1] * 9, w[0] * 9, w[1] * 9, { c: K.c3, w: 1.4, dash: '6 5' }); });
      if (par) P.put('<circle cx="' + P.X(Ax[0]) + '" cy="' + P.Y(Ax[1]) + '" r="18" fill="' + K.c3 + '" fill-opacity=".25"/>');
      flecha(P, [0, 0], Ax, par ? K.c3 : K.c2, 3, 'Ax'); flecha(P, [0, 0], x, K.c1, 2.6, 'x'); asa(P, x, K.c1);
      s.innerHTML = P.html();
      var lam = (x[0] * Ax[0] + x[1] * Ax[1]);
      lect(c, [par ? col(K.c3, '¡Ax es paralelo a x!  x es vector propio, λ ≈ ' + f2(lam, 3)) : 'Ax no es paralelo a x', e.compl ? 'λ complejos: ' + f2(e.re, 2) + ' ± ' + f2(e.im, 2) + 'i (nunca hay paralelismo)' : 'λ₁ = ' + f2(e.l1, 3) + ', λ₂ = ' + f2(e.l2, 3) + (Math.abs(e.l1 - e.l2) < 1e-9 ? ' (doble)' : ''), 'det(A − λI) = λ² − ' + f2(M[0][0] + M[1][1], 2) + 'λ + ' + f2(det2(M[0][0], M[0][1], M[1][0], M[1][1]), 2)]);
    }
    pinta();
  };

  /* 10. Potencias de una matriz y cadenas de Markov */
  A['potencias'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420), x0 = [.9, .1];
    var PR = [{ n: 'Markov: [[0,7 0,2],[0,3 0,8]]', M: [[.7, .2], [.3, .8]], v: [-.1, 1.1, -.1, 1.1] }, { n: 'Población: crece en una dirección', M: [[.6, .8], [.5, .6]], v: [-.2, 4, -.2, 3] }, { n: 'Silla: λ = 1,2 y 0,5', M: [[1.2, 0], [0, .5]], v: [-.2, 4, -.2, 1.2] }, { n: 'Espiral (complejos)', M: [[.9, -.35], [.35, .9]], v: [-1.2, 1.2, -1.2, 1.2] }];
    var st = controles(cu, [['sel', 'k', 'matriz', PR.map(function (p) { return p.n; })], ['n', 'k (potencia)', 0, 40, 12]], pinta);
    var P;
    Arrastre(s, { X: function (x) { return P.X(x); }, Y: function (y) { return P.Y(y); }, get v() { return P.v; }, get W() { return P.W; }, get H() { return P.H; }, ox: 0, oy: 0 }, function () { return [{ snap: false, get: function () { return x0; }, set: function (w) { x0 = w; } }]; }, pinta);
    function pinta() {
      var R = PR[st.k], M = R.M; P = Plano2(R.v, 640, 420); rejilla(P, .5); P.ejes({ px: .5, py: .5 });
      var e = eig2(M[0][0], M[0][1], M[1][0], M[1][1]);
      if (!e.compl) [e.l1, e.l2].forEach(function (l, i) { var w = vecProp(M[0][0], M[0][1], M[1][0], M[1][1], l); P.seg(-w[0] * 9, -w[1] * 9, w[0] * 9, w[1] * 9, { c: i ? K.c4 : K.c3, w: 1.4, dash: '6 5' }); });
      var x = x0.slice(), d = 'M' + P.X(x[0]) + ',' + P.Y(x[1]), pts = [x.slice()];
      for (var k = 0; k < st.n; k++) { x = [M[0][0] * x[0] + M[0][1] * x[1], M[1][0] * x[0] + M[1][1] * x[1]]; pts.push(x.slice()); d += 'L' + P.X(x[0]) + ',' + P.Y(x[1]); }
      P.put('<path d="' + d + '" fill="none" stroke="' + K.c2 + '" stroke-width="1.3" stroke-opacity=".6"/>');
      pts.forEach(function (p, i) { P.punto(p[0], p[1], { r: i === pts.length - 1 ? 6 : 3, c: i === pts.length - 1 ? K.c2 : K.c1 }); });
      asa(P, x0, K.c1); s.innerHTML = P.html();
      lect(c, ['x₀ = ' + vstr(x0.map(function (v) { return Math.round(v * 100) / 100; })), 'A^k x₀ = (' + f2(x[0], 4) + ', ' + f2(x[1], 4) + ')', e.compl ? 'λ complejos: |λ| = ' + f2(Math.hypot(e.re, e.im), 3) : 'λ₁ = ' + f2(e.l1, 3) + ', λ₂ = ' + f2(e.l2, 3) + ': domina la dirección de λ₁', st.k === 0 ? 'estado estacionario: (0,4; 0,6)' : '']);
    }
    pinta();
  };

  /* 11. Formas cuadráticas y cónicas rotadas */
  A['conica'] = function (c) {
    var cu = c.querySelector('.acuerpo'), s = svgEn(cu, 640, 420);
    var st = controles(cu, [['a', 'a', -3, 3, 2, .1], ['b', 'b (término xy)', -4, 4, 2, .1], ['cc', 'c', -3, 3, 2, .1]], pinta);
    function pinta() {
      var a = st.a, b = st.b, cc = st.cc, P = Plano2([-3, 3, -1.97, 1.97], 640, 420); rejilla(P, .5); P.ejes({ px: 1, py: 1 });
      var M = [[a, b / 2], [b / 2, cc]], e = eig2(a, b / 2, b / 2, cc), v1 = vecProp(a, b / 2, b / 2, cc, e.l1), v2 = [-v1[1], v1[0]];
      [[v1, e.l1, K.c3, "x′"], [v2, e.l2, K.c4, "y′"]].forEach(function (q) { P.seg(-q[0][0] * 5, -q[0][1] * 5, q[0][0] * 5, q[0][1] * 5, { c: q[2], w: 1.4, dash: '6 4' }); P.texto(q[0][0] * 2.6, q[0][1] * 2.6 + .12, q[3], { c: q[2], it: true }); });
      // la curva: en coordenadas propias l1 X² + l2 Y² = 1
      var cur = function (sg) { var d = '', pen = false; for (var k = 0; k <= 720; k++) { var t = -3 + 6 * k / 720, X, Y, ok = true; if (e.l1 > 0 && e.l2 > 0) { var th = 2 * Math.PI * k / 720; X = Math.cos(th) / Math.sqrt(e.l1); Y = Math.sin(th) / Math.sqrt(e.l2); if (sg < 0) ok = false; } else if (e.l1 > 0 && e.l2 < 0) { X = sg * Math.sqrt((1 - e.l2 * t * t) / e.l1); Y = t; } else if (e.l1 < 0 && e.l2 > 0) { Y = sg * Math.sqrt((1 - e.l1 * t * t) / e.l2); X = t; } else ok = false; if (!ok || !isFinite(X) || !isFinite(Y)) { pen = false; continue; } var x = X * v1[0] + Y * v2[0], y = X * v1[1] + Y * v2[1]; d += (pen ? 'L' : 'M') + P.X(x).toFixed(1) + ',' + P.Y(y).toFixed(1); pen = true; } return d; };
      P.put('<path d="' + cur(1) + cur(-1) + '" fill="none" stroke="' + K.c1 + '" stroke-width="2.8"/>');
      s.innerHTML = P.html();
      var D = b * b - 4 * a * cc, tipo = e.l1 > 0 && e.l2 > 0 ? 'elipse' : (e.l1 * e.l2 < 0 ? 'hipérbola' : (Math.abs(e.l1 * e.l2) < 1e-9 ? 'degenerada (par de rectas o vacío)' : 'vacío (no hay puntos)'));
      lect(c, [f2(a, 1) + 'x² + ' + f2(b, 1) + 'xy + ' + f2(cc, 1) + 'y² = 1', 'A = ' + mat(M.map(function (f) { return f.map(function (v) { return f2(v, 2); }); })), 'λ₁ = ' + f2(e.l1, 3) + ', λ₂ = ' + f2(e.l2, 3) + ' → ' + col(K.c1, tipo), 'ángulo de rotación ' + f2(Math.atan2(v1[1], v1[0]) * 180 / Math.PI, 1) + '°']);
    }
    pinta();
  };

  /* 12. Retratos de fase de x′ = Ax (diagonalizable, complejos, Jordan) */
  A['fases'] = function (c) {
    var cu = c.querySelector('.acuerpo'), cv = el('canvas', { width: 640, height: 420 }); cv.style.cssText = 'width:100%;height:auto;display:block;border-radius:10px;background:#fbfcfe'; cu.appendChild(cv);
    var PR = [{ n: 'Nodo estable (−1, −3)', M: [[-2, 1], [1, -2]] }, { n: 'Silla (1, −2)', M: [[1, 0], [0, -2]] }, { n: 'Espiral (−0,3 ± 2i)', M: [[-.3, -2], [2, -.3]] }, { n: 'Centro (±2i)', M: [[0, -2], [2, 0]] }, { n: 'Jordan: nodo impropio J₂(−1)', M: [[-1, 1], [0, -1]] }, { n: 'Estrella: −I', M: [[-1, 0], [0, -1]] }];
    var st = controles(cu, [['sel', 'k', 'sistema', PR.map(function (p) { return p.n; })]], function () { reinicia(); });
    var ctx = cv.getContext('2d'), W = 640, H = 420, sc = 70, parts = [];
    function X(x) { return W / 2 + x * sc; } function Y(y) { return H / 2 - y * sc; }
    function reinicia() { parts = []; for (var i = 0; i < 180; i++) parts.push(nueva()); }
    function nueva() { return { p: [(Math.random() - .5) * 9, (Math.random() - .5) * 6], vida: 80 + Math.random() * 120, tr: [] }; }
    function f(M, p) { return [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]]; }
    function cuadro() {
      var M = PR[st.k].M; ctx.fillStyle = 'rgba(251,252,254,.07)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#c5ccd8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      var e = eig2(M[0][0], M[0][1], M[1][0], M[1][1]);
      if (!e.compl) [e.l1, e.l2].forEach(function (l) { var w = vecProp(M[0][0], M[0][1], M[1][0], M[1][1], l); ctx.strokeStyle = 'rgba(168,106,18,.5)'; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(X(-w[0] * 9), Y(-w[1] * 9)); ctx.lineTo(X(w[0] * 9), Y(w[1] * 9)); ctx.stroke(); ctx.setLineDash([]); });
      parts.forEach(function (q, i) {
        var h = .028, p = q.p, k1 = f(M, p), k2 = f(M, [p[0] + h / 2 * k1[0], p[1] + h / 2 * k1[1]]), k3 = f(M, [p[0] + h / 2 * k2[0], p[1] + h / 2 * k2[1]]), k4 = f(M, [p[0] + h * k3[0], p[1] + h * k3[1]]);
        var np = [p[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])], sp = Math.hypot(k1[0], k1[1]);
        ctx.strokeStyle = 'hsla(' + (200 - Math.min(160, sp * 25)) + ',75%,38%,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(p[0]), Y(p[1])); ctx.lineTo(X(np[0]), Y(np[1])); ctx.stroke();
        q.p = np; q.vida--; if (q.vida < 0 || Math.abs(np[0]) > 6 || Math.abs(np[1]) > 4 || sp < .01) parts[i] = nueva();
      });
      if (cv.isConnected) requestAnimationFrame(cuadro);
      var t = e.compl ? 'λ = ' + f2(e.re, 2) + ' ± ' + f2(e.im, 2) + 'i' : 'λ₁ = ' + f2(e.l1, 2) + ', λ₂ = ' + f2(e.l2, 2);
      lect(c, ['x′ = Ax, x(t) = e^{tA}x(0)', t, st.k === 4 ? 'un solo vector propio: J = λI + N, e^{tJ} = e^{λt}(I + tN)' : 'rectas punteadas: direcciones propias']);
    }
    reinicia(); cuadro();
  };

  /* ---------- portada: la malla del plano transformada por una matriz (interactiva) ---------- */
  function portada(cv) {
    var hero = cv.parentNode, ctl = document.createElement('div'); ctl.className = 'portada-ctl';
    var PR = [{ n: 'simétrica', M: [[1.4, .8], [.8, 1.4]] }, { n: 'cizalla', M: [[1, 1], [0, 1]] }, { n: 'rotación', M: [[.6, -.8], [.8, .6]] }, { n: 'Jordan', M: [[1.2, .9], [0, 1.2]] }, { n: 'proyección', M: [[1, 1], [0, 0]] }];
    ctl.innerHTML = '<div class="pc-fila">' + PR.map(function (o, i) { return '<button type="button" data-f="' + i + '"' + (i ? '' : ' class="on"') + '>' + o.n + '</button>'; }).join('') + '</div><div class="pc-ayuda">Arrastra las puntas de Ae₁ y Ae₂ para cambiar la matriz</div>';
    hero.appendChild(ctl);
    var W = 460, H = 380, dpr = Math.min(window.devicePixelRatio || 1, 2), ctx = cv.getContext('2d'), M = PR[0].M.map(function (f) { return f.slice(); }), t = 0, arr = -1, quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sc = 52, cx = W / 2, cy = H / 2 + 10;
    function X(x) { return cx + x * sc; } function Y(y) { return cy - y * sc; }
    function Mt() { var s = quieto || arr >= 0 ? 1 : .5 - .5 * Math.cos(t); return [[1 + s * (M[0][0] - 1), s * M[0][1]], [s * M[1][0], 1 + s * (M[1][1] - 1)]]; }
    function dibuja() {
      var A_ = Mt(); ctx.clearRect(0, 0, W, H);
      for (var k = -10; k <= 10; k++) {
        [[[k, -10], [k, 10]], [[-10, k], [10, k]]].forEach(function (seg) {
          ctx.strokeStyle = k === 0 ? 'rgba(255,255,255,.55)' : 'rgba(150,220,235,' + (.16 + .1 * (k % 2 === 0)) + ')'; ctx.lineWidth = k === 0 ? 1.4 : 1;
          ctx.beginPath(); seg.forEach(function (p, i) { var q = [A_[0][0] * p[0] + A_[0][1] * p[1], A_[1][0] * p[0] + A_[1][1] * p[1]]; if (i) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); }); ctx.stroke();
        });
      }
      // círculo unidad -> elipse
      ctx.strokeStyle = 'rgba(255,210,122,.9)'; ctx.lineWidth = 2; ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 10; ctx.beginPath();
      for (var j = 0; j <= 90; j++) { var a = 2 * Math.PI * j / 90, q = [A_[0][0] * Math.cos(a) + A_[0][1] * Math.sin(a), A_[1][0] * Math.cos(a) + A_[1][1] * Math.sin(a)]; if (j) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); } ctx.stroke(); ctx.shadowBlur = 0;
      // direcciones propias
      var e = eig2(A_[0][0], A_[0][1], A_[1][0], A_[1][1]);
      if (!e.compl) [e.l1, e.l2].forEach(function (l) { var w = vecProp(A_[0][0], A_[0][1], A_[1][0], A_[1][1], l); ctx.strokeStyle = 'rgba(255,140,120,.85)'; ctx.setLineDash([7, 6]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(-w[0] * 6), Y(-w[1] * 6)); ctx.lineTo(X(w[0] * 6), Y(w[1] * 6)); ctx.stroke(); ctx.setLineDash([]); });
      // columnas
      [[A_[0][0], A_[1][0], 'Ae₁'], [A_[0][1], A_[1][1], 'Ae₂']].forEach(function (p) { ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(p[0]), Y(p[1])); ctx.stroke(); ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 6, 0, 7); ctx.fill(); ctx.font = 'italic 15px Palatino Linotype,Palatino,Georgia,serif'; ctx.fillText(p[2], X(p[0]) + 9, Y(p[1]) - 8); });
      var D = det2(A_[0][0], A_[0][1], A_[1][0], A_[1][1]);
      ctx.font = 'italic 14px Palatino Linotype,Palatino,Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'right';
      ctx.fillText('det A = ' + D.toFixed(2).replace('.', ',') + (e.compl ? '   λ complejos' : '   λ = ' + e.l1.toFixed(2).replace('.', ',') + ', ' + e.l2.toFixed(2).replace('.', ',')), W - 10, 20); ctx.textAlign = 'left';
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e), A_ = Mt(), d1 = Math.hypot(X(A_[0][0]) - p[0], Y(A_[1][0]) - p[1]), d2 = Math.hypot(X(A_[0][1]) - p[0], Y(A_[1][1]) - p[1]); arr = d1 < 30 && d1 <= d2 ? 0 : d2 < 30 ? 1 : -1; if (arr >= 0) { try { cv.setPointerCapture(e.pointerId); } catch (x) { } dibuja(); } });
    cv.addEventListener('pointermove', function (e) { if (arr < 0) return; var p = pos(e), w = [(p[0] - cx) / sc, (cy - p[1]) / sc]; M[0][arr] = w[0]; M[1][arr] = w[1]; dibuja(); });
    function suelta() { if (arr >= 0) { arr = -1; t = Math.PI; } } cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
    cv.style.touchAction = 'none'; cv.style.cursor = 'grab';
    ctl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var i = +b.dataset.f; M = PR[i].M.map(function (f) { return f.slice(); }); t = 0; ctl.querySelectorAll('[data-f]').forEach(function (x) { x.classList.toggle('on', +x.dataset.f === i); }); if (quieto) dibuja(); });
    (function anim() { if (arr < 0) t += .012; dibuja(); if (!quieto) requestAnimationFrame(anim); })();
  }

  function inicia() {
    document.querySelectorAll('.applet[data-ap]').forEach(function (e) { var f = A[e.getAttribute('data-ap')]; if (f && !e._ok) { e._ok = 1; try { f(e); } catch (err) { console.error(err); } } });
    var p = document.querySelector('canvas.malla'); if (p) portada(p);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

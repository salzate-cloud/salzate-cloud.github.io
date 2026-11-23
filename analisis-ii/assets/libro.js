/* Geometría Básica — comportamiento del texto interactivo */
(function () {
  'use strict';
  var PREF_LIBRO = 'gb:' + ((location.pathname.split('/').filter(Boolean).slice(-2, -1)[0]) || 'libro') + ':';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(PREF_LIBRO + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(PREF_LIBRO + k, JSON.stringify(v)); } catch (e) {} }
  };
  var PAGINA = document.body.getAttribute('data-pagina') || '';

  /* ---------- menú lateral ---------- */
  var btn = document.querySelector('.topbar .menu');
  if (btn) btn.addEventListener('click', function () { document.body.classList.toggle('nav-abierto'); });
  var velo = document.querySelector('.velo');
  if (velo) velo.addEventListener('click', function () { document.body.classList.remove('nav-abierto'); });
  document.querySelectorAll('.toc a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('nav-abierto'); });
  });
  var activo = document.querySelector('.toc a.cap.activo');
  if (activo) activo.scrollIntoView({ block: 'center' });

  /* capítulos visitados */
  var vistos = store.get('vistos', {});
  if (PAGINA) { vistos[PAGINA] = 1; store.set('vistos', vistos); }
  document.querySelectorAll('.toc a.cap').forEach(function (a) {
    if (vistos[a.getAttribute('data-slug')]) a.classList.add('leido');
  });

  /* ---------- barra de progreso y sección actual ---------- */
  var barra = document.querySelector('.topbar .prog');
  var secs = Array.prototype.slice.call(document.querySelectorAll('main h2[id]'));
  var enlaces = {};
  document.querySelectorAll('.toc .secs a').forEach(function (a) { enlaces[a.getAttribute('href').split('#')[1]] = a; });
  function alDesplazar() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (barra) barra.style.width = (max > 0 ? 100 * h.scrollTop / max : 0) + '%';
    var actual = null;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top < 120) actual = secs[i].id;
    Object.keys(enlaces).forEach(function (k) { enlaces[k].classList.toggle('aqui', k === actual); });
  }
  window.addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();

  /* ---------- figuras ampliables ---------- */
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('figure.fig img');
    if (!img) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<img alt="Figura ampliada" src="' + img.getAttribute('src') + '">';
    lb.addEventListener('click', function () { lb.remove(); });
    document.body.appendChild(lb);
  });

  /* ---------- demostraciones: texto del botón ---------- */
  document.querySelectorAll('details.prueba').forEach(function (d) {
    var h = d.querySelector('.hint');
    if (h && d.classList.contains('solucion')) h.textContent = document.body.classList.contains('md') ? 'intenta primero' : 'intenta primero';
  });

  /* ---------- knowls: referencias que se despliegan ---------- */
  var cachePag = {};
  function traePagina(p) {
    if (cachePag[p]) return cachePag[p];
    cachePag[p] = fetch(p + '.html').then(function (r) { return r.text(); }).then(function (t) {
      return new DOMParser().parseFromString(t, 'text/html');
    });
    return cachePag[p];
  }
  /* --- Retroalimentación con voz propia + stickers --- */
  var FR_OK = ['¡Eso, crack! 🔥', '¡Uy, qué nivel! 🧠', '¡De una, eso es! ✅', '¡Bieeen, parcero! 🎉'];
  var FR_NO = ['Nuuu, incorrecto 🙈', 'Nuuu, casi casi… 🤏', 'Nuuu, por ahí no es 🚫', 'Nuuu, incorrecto. ¡Otra vez! 🔁'];
  var ST_OK = ['🔥', '🧠', '🏆', '🎉', '🤩', '💯', '🚀', '😎'];
  var ST_NO = ['🙈', '🤦', '😬', '🫠', '🐢', '🤔', '💥', '😵‍💫'];
  function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
  function frase(ok) {
    return ok ? '<b class="ok">' + azar(FR_OK) + '</b> ' : '<b class="no">' + azar(FR_NO) + '</b> ';
  }
  (function () {
    if (document.getElementById('css-sticker')) return;
    var st = document.createElement('style'); st.id = 'css-sticker';
    st.textContent = '.sticker{position:absolute;right:.8rem;top:50%;margin-top:-1.75rem;z-index:5;font-size:2.6rem;line-height:1;' +
      'background:#fff;border-radius:50%;padding:.35rem;box-shadow:0 0 0 4px #fff,0 4px 14px rgba(0,0,0,.25);' +
      'pointer-events:none;animation:stk-in .55s cubic-bezier(.2,1.6,.4,1) both}' +
      '.sticker.no{animation:stk-in .55s cubic-bezier(.2,1.6,.4,1) both,stk-shake .45s .55s ease-in-out 1}' +
      '.sticker.fuera{animation:stk-out .5s ease-in both}' +
      '@keyframes stk-in{0%{transform:scale(0) rotate(-40deg);opacity:0}100%{transform:scale(1) rotate(var(--rot,-10deg));opacity:1}}' +
      '@keyframes stk-shake{0%,100%{transform:rotate(var(--rot,-10deg))}25%{transform:rotate(calc(var(--rot,-10deg) - 14deg))}75%{transform:rotate(calc(var(--rot,-10deg) + 14deg))}}' +
      '@keyframes stk-out{to{transform:scale(.2) rotate(30deg);opacity:0}}' +
      '@media (prefers-reduced-motion:reduce){.sticker,.sticker.no{animation:none;transform:rotate(var(--rot,-10deg))}}';
    document.head.appendChild(st);
  })();
  function sticker(q, ok) {
    if (getComputedStyle(q).position === 'static') q.style.position = 'relative';
    var v = q.querySelector('.sticker'); if (v) v.remove();
    var s = document.createElement('span');
    s.className = 'sticker ' + (ok ? 'si' : 'no');
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--rot', (Math.random() * 30 - 15).toFixed(0) + 'deg');
    s.textContent = azar(ok ? ST_OK : ST_NO);
    q.appendChild(s);
    setTimeout(function () { s.classList.add('fuera'); setTimeout(function () { s.remove(); }, 520); }, 2600);
  }

  function bloqueDe(a) {
    var b = a.closest('p, li, td, .caja .bbody > *, figcaption') || a.parentNode;
    return b;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.knowl');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (a._knowl) { a._knowl.remove(); a._knowl = null; a.classList.remove('abierto'); return; }
    var ref = a.getAttribute('data-ref').split('#'), pag = ref[0], id = ref[1];
    var caja = document.createElement('div');
    caja.className = 'knowl-caja';
    caja.innerHTML = '<div class="kbar"><a href="' + a.getAttribute('href') + '">Ir al enunciado ↗</a><button aria-label="Cerrar">×</button></div><div class="kin">Cargando…</div>';
    caja.querySelector('button').addEventListener('click', function () { caja.remove(); a._knowl = null; a.classList.remove('abierto'); });
    var b = bloqueDe(a);
    b.parentNode.insertBefore(caja, b.nextSibling);
    a._knowl = caja; a.classList.add('abierto');
    function pon(doc) {
      var el = doc.getElementById(id);
      var kin = caja.querySelector('.kin');
      if (!el) { kin.textContent = 'No se encontró el enunciado.'; return; }
      var c = el.cloneNode(true); c.removeAttribute('id');
      kin.innerHTML = ''; kin.appendChild(c);
      var sig = el.nextElementSibling;
      if (sig && sig.matches('details.prueba')) { var p = sig.cloneNode(true); p.open = false; kin.appendChild(p); }
    }
    if (pag === PAGINA) pon(document);
    else traePagina(pag).then(pon).catch(function () {
      caja.querySelector('.kin').innerHTML = 'Abra el enunciado aquí: <a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>';
    });
  });

  /* ---------- ejercicios: marcar como hechos ---------- */
  var hechos = store.get('hechos', {});
  document.querySelectorAll('.ejercicios > ol > li').forEach(function (li, i) {
    var clave = PAGINA + ':' + (i + 1);
    var m = document.createElement('span');
    m.className = 'hecho'; m.title = 'Marcar como resuelto';
    function pinta() { var ok = !!hechos[clave]; li.classList.toggle('ok', ok); m.textContent = '✓'; m.title = ok ? 'Resuelto (clic para desmarcar)' : 'Marcar como resuelto'; }
    m.addEventListener('click', function () { if (hechos[clave]) delete hechos[clave]; else hechos[clave] = 1; store.set('hechos', hechos); pinta(); });
    pinta();
    li.appendChild(m);
  });

  /* ---------- autoevaluación ---------- */
  document.querySelectorAll('.quiz').forEach(function (qz) {
    var id = qz.getAttribute('data-id');
    var res = store.get('quiz:' + id, {});
    var marc = qz.querySelector('.marcador');
    var preguntas = qz.querySelectorAll('.q');
    function actualiza() {
      var b = 0; Object.keys(res).forEach(function (k) { if (res[k]) b++; });
      if (marc) marc.textContent = b + ' / ' + preguntas.length + ' correctas';
    }
    preguntas.forEach(function (q, iq) {
      var fb = q.querySelector('.fb');
      var ops = q.querySelectorAll('.op');
      function resuelve(ok, elegido) {
        res[iq] = ok; store.set('quiz:' + id, res); actualiza();
        fb.classList.add('si');
        fb.querySelector('.veredicto').innerHTML = frase(ok);
        sticker(fb, ok);
      }
      ops.forEach(function (op) {
        op.addEventListener('click', function () {
          var ok = op.getAttribute('data-c') === '1';
          ops.forEach(function (o) { o.classList.remove('bien', 'mal'); });
          op.classList.add(ok ? 'bien' : 'mal');
          if (ok) ops.forEach(function (o) { o.disabled = true; });
          resuelve(ok, op);
        });
      });
      var inp = q.querySelector('.num input');
      if (inp) {
        var comp = q.querySelector('.comprobar');
        var f = function () {
          var txt = inp.value.trim().replace(',', '.');
          var v = NaN;
          try {
            if (/^[-+*/().\d\s^sqrtpi]+$/.test(txt)) v = Function('"use strict";var sqrt=Math.sqrt,pi=Math.PI;return (' + txt.replace(/\^/g, '**') + ')')();
          } catch (e) { v = NaN; }
          var r = parseFloat(inp.getAttribute('data-r')), tol = parseFloat(inp.getAttribute('data-tol') || '0.01');
          var ok = isFinite(v) && Math.abs(v - r) <= tol * Math.max(1, Math.abs(r));
          inp.classList.remove('bien', 'mal'); inp.classList.add(ok ? 'bien' : 'mal');
          resuelve(ok);
        };
        comp.addEventListener('click', f);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') f(); });
      }
    });
    var rein = qz.querySelector('.reiniciar');
    if (rein) rein.addEventListener('click', function () {
      res = {}; store.set('quiz:' + id, res); actualiza();
      qz.querySelectorAll('.op').forEach(function (o) { o.disabled = false; o.classList.remove('bien', 'mal'); });
      qz.querySelectorAll('.num input').forEach(function (i) { i.value = ''; i.classList.remove('bien', 'mal'); });
      qz.querySelectorAll('.fb').forEach(function (f) { f.classList.remove('si'); });
    });
    actualiza();
  });

  /* ---------- árbol de Pitágoras (cabeceras y portada) ---------- */
  function arbol(cv, prof, ang, colores) {
    var W = cv.width, H = cv.height, ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    var a = ang * Math.PI / 180;
    var lado = Math.min(W / 6.4, H / 4.2);
    function cuadrado(x, y, ux, uy, n) {
      // cuadrado con base de (x,y) a (x+ux, y+uy), creciendo hacia la izquierda de la base
      var vx = -uy, vy = ux;
      var t = n / prof;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + ux, y + uy); ctx.lineTo(x + ux + vx, y + uy + vy); ctx.lineTo(x + vx, y + vy); ctx.closePath();
      ctx.fillStyle = colores(t, n);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(0.3, 1.2 * (1 - t)); ctx.stroke();
      if (n >= prof) return;
      var px = x + vx, py = y + vy;  // esquina superior izquierda
      var c = Math.cos(a), s = Math.sin(a);
      // primer hijo: rotar u por ang y escalar por cos
      var u1x = (ux * c - uy * s) * c, u1y = (ux * s + uy * c) * c;
      cuadrado(px, py, u1x, u1y, n + 1);
      var qx = px + u1x, qy = py + u1y;
      cuadrado(qx, qy, x + ux + vx - qx, y + uy + vy - qy, n + 1);
    }
    cuadrado(W / 2 - lado / 2, H - 2, lado, 0, 0);
  }
  window.GBarbol = arbol;
  function colorVerde(t, n) {
    var hue = 150 - 95 * t, lig = 22 + 38 * t, sat = 55 + 25 * t;
    if (n > 9) return 'hsl(48,90%,' + (55 + n) + '%)';
    return 'hsl(' + hue + ',' + sat + '%,' + lig + '%)';
  }
  document.querySelectorAll('canvas.arbol').forEach(function (cv) {
    var dpr = window.devicePixelRatio || 1, w = +cv.getAttribute('width'), h = +cv.getAttribute('height');
    cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr;
    var prof = +(cv.getAttribute('data-prof') || 9), ang = +(cv.getAttribute('data-ang') || 38);
    // invertir y: el canvas dibuja con y hacia abajo, así que reflejamos
    var ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, -1, 0, cv.height);
    var dib = function () { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); arbol2(); };
    function arbol2() {
      var W = cv.width, H = cv.height;
      ctx.save(); ctx.setTransform(1, 0, 0, -1, 0, H);
      // usamos la función con coordenadas y hacia arriba
      var a = ang * Math.PI / 180, lado = Math.min(W / 7.4, H / 4.9);
      (function cuadrado(x, y, ux, uy, n) {
        var vx = -uy, vy = ux, t = n / prof;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux, y + uy); ctx.lineTo(x + ux + vx, y + uy + vy); ctx.lineTo(x + vx, y + vy); ctx.closePath();
        ctx.fillStyle = colorVerde(t, n); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = Math.max(0.3, 1.4 * (1 - t)) * dpr; ctx.stroke();
        if (n >= prof) return;
        var px = x + vx, py = y + vy, c = Math.cos(a), s = Math.sin(a);
        var u1x = (ux * c - uy * s) * c, u1y = (ux * s + uy * c) * c;
        cuadrado(px, py, u1x, u1y, n + 1);
        var qx = px + u1x, qy = py + u1y;
        cuadrado(qx, qy, x + ux + vx - qx, y + uy + vy - qy, n + 1);
      })(W / 2 - lado / 2, 2, lado, 0, 0);
      ctx.restore();
    }
    cv._dibuja = function (p, g) { prof = p; ang = g; dib(); };
    dib();
  });
  var sp = document.getElementById('arbol-prof'), sa = document.getElementById('arbol-ang');
  var cvh = document.querySelector('.hero canvas.arbol');
  function rehace() {
    if (!cvh) return;
    document.getElementById('arbol-prof-v').textContent = sp.value;
    document.getElementById('arbol-ang-v').textContent = sa.value + '°';
    cvh._dibuja(+sp.value, +sa.value);
  }
  if (sp && sa) { sp.addEventListener('input', rehace); sa.addEventListener('input', rehace); }
})();

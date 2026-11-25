/* Presentación interactiva de clase — Geometría Básica (UdeA)
   Santiago Alzate Suárez · santiagoalzates.com
   Teclas: → / espacio / PgDn avanzan · ← / PgUp retroceden · F pantalla completa · P pizarra · O índice · B pantalla negra */
(function () {
  'use strict';
  var W = 1280, H = 720;
  var escena = document.querySelector('.escena');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var i = 0, frag = 0;
  var barra = document.querySelector('.barra-prog i'), num = document.querySelector('.num-diapo');

  /* ---------- escala: la diapositiva de 1280×720 llena la ventana ---------- */
  function escala() {
    var s = Math.min(window.innerWidth / W, (window.innerHeight - 0) / H);
    escena.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    document.documentElement.style.setProperty('--s', s);
  }
  window.addEventListener('resize', escala); escala();

  /* ---------- ajuste: si el contenido no cabe, se reduce (con todo visible) ---------- */
  function ajusta(sl) {
    if (sl._aj) return; sl._aj = 1;
    var c = sl.querySelector('.sc'); if (!c || c.classList.contains('sin-ajuste')) return;
    var dentro = c.firstElementChild; if (!dentro) return;
    var disp = c.clientHeight, alto = dentro.scrollHeight, ancho = c.clientWidth, an = dentro.scrollWidth;
    var k = Math.min(1, disp / alto, ancho / an);
    if (k < 0.995) { k = Math.max(k, 0.55); dentro.style.transform = 'scale(' + k + ')'; dentro.style.transformOrigin = 'top left'; dentro.style.width = (100 / k) + '%'; }
  }

  function frags(sl) { return Array.prototype.slice.call(sl.querySelectorAll('.f')); }
  function muestra(n, f, sinAnim) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('activa', k === n); s.classList.toggle('antes', k < n); });
    var sl = slides[n]; i = n;
    ajusta(sl);
    var F = frags(sl); if (f === 'fin') f = F.length; frag = Math.max(0, Math.min(F.length, f || 0));
    F.forEach(function (e, k) { e.classList.toggle('vis', k < frag); e.classList.toggle('ultimo', k === frag - 1); });
    if (barra) barra.style.width = (100 * (n + 1) / slides.length) + '%';
    if (num) num.textContent = (n + 1) + ' / ' + slides.length;
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (e) {}
    sl.dispatchEvent(new CustomEvent('entra'));
    document.body.classList.toggle('en-portada', sl.classList.contains('portada') || sl.classList.contains('oscura'));
  }
  function sig() { var F = frags(slides[i]); if (frag < F.length) { frag++; muestra(i, frag); } else if (i < slides.length - 1) muestra(i + 1, 0); }
  function ant() { if (frag > 0) { frag--; muestra(i, frag); } else if (i > 0) muestra(i - 1, 'fin'); }
  window.Clase = { sig: sig, ant: ant, ir: function (n) { muestra(n, 0); }, actual: function () { return slides[i]; } };

  function enInteractivo(t) { return t && t.closest && t.closest('input,textarea,select,button,a,.applet,.act,.quizc,.pizarra,.widget,svg,.no-avanza'); }
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (document.body.classList.contains('pizarra-on') && e.key !== 'Escape' && e.key.toLowerCase() !== 'p') return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') { e.preventDefault(); sig(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') { e.preventDefault(); ant(); }
    else if (k === 'Home') muestra(0, 0);
    else if (k === 'End') muestra(slides.length - 1, 'fin');
    else if (k === 'f' || k === 'F') pantalla();
    else if (k === 'o' || k === 'O') indice();
    else if (k === 'b' || k === 'B' || k === '.') document.body.classList.toggle('negro');
    else if (k === 'Escape') { document.body.classList.remove('negro'); cierraIndice(); }
  });
  /* clic en una zona vacía de la diapositiva: avanzar (clic derecho o en la mitad izquierda: retroceder) */
  escena.addEventListener('click', function (e) {
    if (enInteractivo(e.target) || document.body.classList.contains('pizarra-on')) return;
    var r = escena.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.12) ant(); else sig();
  });
  /* deslizar con el dedo */
  var t0 = null;
  escena.addEventListener('touchstart', function (e) { if (enInteractivo(e.target)) { t0 = null; return; } t0 = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  escena.addEventListener('touchend', function (e) {
    if (!t0) return; var dx = e.changedTouches[0].clientX - t0[0], dy = e.changedTouches[0].clientY - t0[1];
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) sig(); else ant(); }
    t0 = null;
  });

  function pantalla() {
    var d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else { var el = d.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
  }
  /* ---------- índice (vista general) ---------- */
  var ind = document.querySelector('.indice-diapos');
  function indice() {
    if (!ind) return;
    if (ind.classList.contains('abierto')) return cierraIndice();
    ind.innerHTML = '<div class="ind-cab"><b>Índice de la clase</b><button class="ind-x" aria-label="Cerrar">×</button></div><ol>' + slides.map(function (s, k) {
      var t = s.getAttribute('data-titulo') || ('Diapositiva ' + (k + 1));
      return '<li class="' + (k === i ? 'act ' : '') + (s.getAttribute('data-tipo') || '') + '"><button data-k="' + k + '"><span>' + (k + 1) + '</span>' + t + '</button></li>';
    }).join('') + '</ol>';
    ind.classList.add('abierto');
    ind.querySelector('.ind-x').onclick = cierraIndice;
    ind.querySelectorAll('button[data-k]').forEach(function (b) { b.onclick = function () { muestra(+b.getAttribute('data-k'), 0); cierraIndice(); }; });
    var a = ind.querySelector('li.act'); if (a) a.scrollIntoView({ block: 'center' });
  }
  function cierraIndice() { if (ind) ind.classList.remove('abierto'); }

  document.querySelectorAll('[data-accion]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var a = b.getAttribute('data-accion');
      if (a === 'sig') sig(); else if (a === 'ant') ant(); else if (a === 'pantalla') pantalla(); else if (a === 'indice') indice();
      else if (a === 'pizarra' && window.Pizarra) window.Pizarra.alterna();
      else if (a === 'negro') document.body.classList.toggle('negro');
    });
  });

  /* ---------- quiz de la semana dentro de la presentación ---------- */
  function montaQuiz(el) {
    var sem = +el.getAttribute('data-semana'), banco = JSON.parse(el.querySelector('script').textContent);
    var prev = [], ronda = 0, Q = [], k = 0, res = [];
    var cuerpo = el.querySelector('.q-cuerpo');
    function nueva() {
      ronda++;
      var r = window.GENERADORES ? GENERADORES.armar(sem, banco, prev) : { q: banco, usadas: [] };
      prev = r.usadas; Q = r.q; k = 0; res = []; pinta();
    }
    function puntos() { return Q.map(function (_, j) { return '<i class="' + (res[j] === true ? 'ok' : res[j] === false ? 'no' : j === k ? 'act' : '') + '"></i>'; }).join(''); }
    function pinta() {
      if (k >= Q.length) {
        var a = res.filter(function (x) { return x; }).length;
        cuerpo.innerHTML = '<div class="q-fin"><div class="q-grande">' + a + ' / ' + Q.length + '</div><p>' + (a === Q.length ? '¡Perfecto! 🎉' : a >= Q.length - 1 ? '¡Muy bien!' : 'Repasen las que fallaron.') +
          '</p><button class="q-btn" data-q="otra">Otra ronda, con preguntas nuevas ↻</button></div>';
        cuerpo.querySelector('[data-q=otra]').onclick = function (e) { e.stopPropagation(); nueva(); };
        el.querySelector('.q-puntos').innerHTML = puntos();
        return;
      }
      var P = Q[k], L = 'ABCD';
      cuerpo.innerHTML = '<div class="q-etq">Ronda ' + ronda + ' · Pregunta ' + (k + 1) + ' de ' + Q.length + (P.nueva ? ' <span class="q-nueva">datos nuevos</span>' : '') + '</div>' +
        '<div class="q-preg">' + P.e + '</div><div class="q-ops' + (P.o.length === 2 ? ' dos' : '') + '">' +
        P.o.map(function (o, j) { return '<button class="q-op" data-j="' + j + '"><span class="l">' + L[j] + '</span><span>' + o + '</span></button>'; }).join('') +
        '</div><div class="q-expl"></div><div class="q-acc"><button class="q-btn sec" data-q="ver">Ver la respuesta</button></div>';
      el.querySelector('.q-puntos').innerHTML = puntos();
      cuerpo.querySelectorAll('.q-op').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); responde(+b.getAttribute('data-j')); }; });
      cuerpo.querySelector('[data-q=ver]').onclick = function (e) { e.stopPropagation(); responde(-1); };
    }
    function responde(j) {
      var ops = cuerpo.querySelector('.q-ops'); if (ops.classList.contains('fin')) return;
      var P = Q[k], bien = j === P.c; ops.classList.add('fin');
      ops.querySelectorAll('.q-op').forEach(function (b, t) { b.classList.add(t === P.c ? 'ok' : t === j ? 'no' : 'off'); });
      res[k] = j < 0 ? false : bien;
      var x = cuerpo.querySelector('.q-expl'); x.style.display = 'block';
      x.innerHTML = (j < 0 ? '<b>Respuesta.</b> ' : bien ? '<b class="ok">¡Correcto!</b> ' : '<b class="no">No es esa.</b> ') + P.x;
      var b = cuerpo.querySelector('[data-q=ver]'); b.textContent = k + 1 < Q.length ? 'Siguiente pregunta ›' : 'Ver resultados ›'; b.className = 'q-btn';
      b.onclick = function (e) { e.stopPropagation(); k++; pinta(); };
      el.querySelector('.q-puntos').innerHTML = puntos();
    }
    el.addEventListener('keydown', function (e) { e.stopPropagation(); });
    nueva();
  }
  document.querySelectorAll('.quizc').forEach(montaQuiz);

  /* ---------- arranque ---------- */
  var h = parseInt((location.hash || '').slice(1), 10);
  muestra(isNaN(h) ? 0 : h - 1, 0);
  window.addEventListener('hashchange', function () { var k = parseInt(location.hash.slice(1), 10); if (!isNaN(k) && k - 1 !== i) muestra(k - 1, 0); });
  /* ajustar todas cuando estén listas las fuentes */
  function reajusta() {
    slides.forEach(function (s) {
      s._aj = 0; var d = s.querySelector('.sc > *'); if (d) { d.style.transform = ''; d.style.width = ''; }
      var a = s.classList.contains('activa'); if (!a) { s.classList.add('medir'); ajusta(s); s.classList.remove('medir'); } else ajusta(s);
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(reajusta);
  window.addEventListener('load', reajusta);
  /* selector ES/EN del sitio */
  (function () { var me = document.querySelector('script[src*="clase.js"]'); if (!me || document.querySelector('script[src*="assets/idioma.js"]')) return;
    var raiz = me.src.replace(/[^/]+\/clase\/assets\/clase\.js.*$/, ''); var sc = document.createElement('script'); sc.src = raiz + 'assets/idioma.js?v=2'; document.body.appendChild(sc); })();
})();

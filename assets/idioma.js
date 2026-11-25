/* Español / English en todo el material (libros, presentaciones, visor).
   - Si la página tiene <link rel="alternate" hreflang="en|es">, el botón lleva a esa versión.
   - Si no, traduce la interfaz (botones, títulos de cajas, menús) y avisa que el contenido sigue en español.
   La preferencia se comparte con el resto del sitio (santiago-site-lang).
   © 2026 Santiago Alzate Suárez. Todos los derechos reservados. */
(function () {
  'use strict';
  var KEY = 'santiago-site-lang';
  var html = document.documentElement;
  var actual = (html.getAttribute('lang') || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  function pref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function guarda(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  function alterna(l) { var a = document.querySelector('link[rel="alternate"][hreflang="' + l + '"]'); return a && a.getAttribute('href'); }

  /* --- interfaz: palabras exactas y prefijos --- */
  var EXACTO = {
    'Siguiente': 'Next', 'Anterior': 'Previous', 'Empezar': 'Start', 'Empezar a leer': 'Start reading', 'Volver': 'Back', '‹ Volver': '‹ Back', 'Salir': 'Exit',
    'Demostración': 'Proof', 'Solución': 'Solution', 'mostrar': 'show', 'intenta primero': 'try first', 'intente primero': 'try first', 'ocultar': 'hide',
    'Interactivo': 'Interactive', '3D · gírela': '3D · rotate it', 'Pista': 'Hint', 'Verificar': 'Check', 'Comprobar': 'Check', 'Reiniciar': 'Reset',
    'Reiniciar estas preguntas': 'Reset these questions', '🧩 Ordena la solución': '🧩 Put the solution in order', '🔍 Encuentra el error': '🔍 Find the mistake',
    '🧭 ¿Por dónde empiezo?': '🧭 Where do I start?', '🔁 Repasar hoy': '🔁 Review today', '📋 Fórmulas': '📋 Formulas', '📖 Glosario': '📖 Glossary',
    'Empezar el simulacro': 'Start the practice exam', 'Pausar': 'Pause', 'Terminar y ver soluciones': 'Finish and see the solutions', 'Continuar': 'Continue',
    'Las soluciones están disponibles. Al empezar, se bloquean hasta que termines.': 'The solutions are available. Once you start, they stay locked until you finish.',
    'Para cerrar': 'Wrapping up', 'Nota': 'Note', 'Consejo': 'Tip', 'Error frecuente': 'Common mistake', 'Para arrancar': 'To get started', 'Formulario': 'Formula sheet',
    'Instrucciones': 'Instructions', 'Problemas': 'Problems', 'Calificación': 'Grading', 'Contenido': 'Contents', 'Índice': 'Index',
    'Notas de clase · UdeA': 'Class notes · UdeA', 'Pizarra': 'Whiteboard', '✎ Pizarra': '✎ Whiteboard', 'Esta semana': 'This week', 'Ideas clave': 'Key ideas',
    'Al terminar la semana podremos': 'By the end of the week we will be able to', 'Al terminar la semana podremos…': 'By the end of the week we will be able to…',
    '▶ Presentación interactiva': '▶ Interactive presentation', 'Clases interactivas': 'Interactive classes', 'Material del curso': 'Course material',
    'Reducir': 'Smaller', 'Ampliar': 'Larger', 'Entrar': 'Enter', 'Contraseña': 'Password', 'Cargando la figura 3D…': 'Loading the 3D figure…',
    'Quiz': 'Quiz', 'Quiz en clase': 'Class quiz', 'Nueva ronda': 'New round', 'Responder': 'Answer', 'Ver respuesta': 'Show answer'
  };
  var PREFIJO = [
    [/^Definición(?= |$)/, 'Definition'], [/^Teorema(?= |$)/, 'Theorem'], [/^Corolario(?= |$)/, 'Corollary'], [/^Lema(?= |$)/, 'Lemma'],
    [/^Observación(?= |$)/, 'Remark'], [/^Proposición(?= |$)/, 'Proposition'], [/^Ejemplo(?= |$)/, 'Example'], [/^Problema(?= |$)/, 'Problem'],
    [/^Ejercicio(?= |$)/, 'Exercise'], [/^Capítulo(?= |$)/, 'Chapter'], [/^Apéndice(?= |$)/, 'Appendix'], [/^Parcial (\d)/, 'Midterm $1'],
    [/^Simulacro del Parcial (\d)/, 'Practice exam for Midterm $1'], [/^Simulacro · Parcial (\d)/, 'Practice exam · Midterm $1'], [/^Semana (\d+)/, 'Week $1'],
    [/^Taller (\d+)/, 'Workshop $1'], [/^✎ Taller (\d+)/, '✎ Workshop $1'], [/^(\d[\d.,]*) puntos?/, '$1 points'], [/^Bonus · hasta ([\d.,]+) puntos/, 'Bonus · up to $1 points'],
    [/^Arrastre para girar.*/, 'Drag to rotate · scroll or pinch to zoom · Shift + drag to pan · double-click to reset'],
    [/^Arrastra para girar.*/, 'Drag to rotate · scroll or pinch to zoom · double-click to reset'],
    [/^💬 ¿Viste un error.*/, '💬 Spotted a mistake or something unclear? Tell me']
  ];
  var SEL = 'button, summary, .tag, .hint, .ptit, .parte, .kicker, .topbar .nav a, .topbar .nav span, .herramientas-toc a, .bnum, .btit > a, .ayuda3d, .v3d-carga, .marca small, '
          + '.act .ahead, .actividades h2, .actividades h3, .sim-ctl *, .gt, .s-agenda h3, .obj h3, .barra a, .barra button, .bt, .pn, .s, label > span, .acc-caja h1, .acc-caja label, .acc-caja button, .pc-ayuda';
  var guardado = [];
  function traduceTexto(t) {
    var s = t.trim(); if (!s) return null;
    if (EXACTO[s]) return t.replace(s, EXACTO[s]);
    var X = window.IDIOMA_EN;
    if (actual === 'en' && X) {
      if (X.exacto[s]) return t.replace(s, X.exacto[s]);
      for (var j = 0; j < X.patrones.length; j++) if (X.patrones[j][0].test(s)) return t.replace(s, s.replace(X.patrones[j][0], X.patrones[j][1]));
    }
    for (var i = 0; i < PREFIJO.length; i++) if (PREFIJO[i][0].test(s)) return t.replace(s, s.replace(PREFIJO[i][0], PREFIJO[i][1]));
    return null;
  }
  /* en las páginas ya traducidas (lang="en") se revisa todo el texto que generan los scripts */
  function todoEn() {
    var w = document.createTreeWalker(document.body, 4, null), n, r;
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || p.closest('.katex, script, style, .idioma-sel, textarea')) continue;
      var X = window.IDIOMA_EN, tt = n.nodeValue.trim(), hecho = false;
      if (X && X.contexto) for (var c = 0; c < X.contexto.length; c++) if (tt === X.contexto[c][1] && p.matches(X.contexto[c][0])) { n.nodeValue = n.nodeValue.replace(tt, X.contexto[c][2]); hecho = true; break; }
      if (hecho) continue;
      r = traduceTexto(n.nodeValue);
      if (r !== null && r !== n.nodeValue) n.nodeValue = r;
    }
    document.querySelectorAll('[placeholder], [aria-label], [title]').forEach(function (e) {
      ['placeholder', 'aria-label', 'title'].forEach(function (a) { var v = e.getAttribute(a), r2 = v && traduceTexto(v); if (r2 && r2 !== v) e.setAttribute(a, r2); });
    });
  }
  function interfaz(l) {
    if (actual === 'en') { todoEn(); return; }
    if (l === 'es') { guardado.forEach(function (g) { g[0].nodeValue = g[1]; }); guardado = []; return; }
    document.querySelectorAll(SEL).forEach(function (e) {
      if (e.closest('.bbody, .pbody, .katex, .idioma-sel')) return;
      for (var n = e.firstChild; n; n = n.nextSibling) {
        if (n.nodeType !== 3) continue;
        var r = traduceTexto(n.nodeValue);
        if (r !== null && r !== n.nodeValue) { guardado.push([n, n.nodeValue]); n.nodeValue = r; }
      }
    });
  }

  /* --- aviso cuando el contenido aún no está traducido --- */
  function aviso(mostrar) {
    var a = document.getElementById('idioma-aviso');
    if (!mostrar) { if (a) a.remove(); return; }
    if (a) return;
    a = document.createElement('div'); a.id = 'idioma-aviso'; a.setAttribute('role', 'status');
    a.innerHTML = '<span>The interface is in English. The English translation of this course’s content is on its way; for now the text stays in Spanish.</span><button type="button" aria-label="Close">×</button>';
    a.querySelector('button').onclick = function () { a.remove(); try { sessionStorage.setItem('idioma-aviso', '1'); } catch (e) {} };
    try { if (sessionStorage.getItem('idioma-aviso')) return; } catch (e) {}
    document.body.appendChild(a);
  }

  function aplica(l, desdeClic) {
    var destino = l !== actual ? alterna(l) : null;
    if (destino) { guarda(l); location.href = destino + location.hash; return; }
    if (desdeClic) guarda(l);
    if (actual === 'es') { interfaz(l); aviso(l === 'en'); }
    else interfaz('en');
    marca(l);
  }

  /* --- el selector ES | EN --- */
  var cajas = [];
  function marca(l) { cajas.forEach(function (c) { c.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === l ? 'true' : 'false'); }); }); }
  function selector() {
    var c = document.createElement('div'); c.className = 'idioma-sel'; c.setAttribute('role', 'group'); c.setAttribute('aria-label', 'Idioma / Language');
    c.innerHTML = '<button type="button" data-l="es" lang="es" title="Español">ES</button><button type="button" data-l="en" lang="en" title="English">EN</button>';
    c.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) aplica(b.dataset.l, true); });
    var hueco = document.querySelector('.topbar .esp') || document.querySelector('.barra .ctl') || document.querySelector('.barra');
    if (hueco && hueco.classList.contains('esp')) hueco.parentNode.insertBefore(c, hueco.nextSibling);
    else if (hueco) hueco.appendChild(c);
    else { c.classList.add('flotante'); document.body.appendChild(c); }
    cajas.push(c);
  }
  var css = document.createElement('style');
  css.textContent = '.idioma-sel{display:inline-flex;border:1px solid rgba(255,255,255,.45);border-radius:999px;overflow:hidden;margin:0 10px;flex:none;vertical-align:middle}'
    + '.idioma-sel button{font:600 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.04em;padding:6px 9px;border:0;background:transparent;color:inherit;cursor:pointer;opacity:.75}'
    + '.idioma-sel button[aria-pressed="true"]{background:rgba(255,255,255,.92);color:#1d2233;opacity:1}'
    + '.idioma-sel button:focus-visible{outline:2px solid #fff;outline-offset:-3px}'
    + '.idioma-sel.flotante{position:fixed;left:12px;bottom:12px;z-index:9999;background:#1d2233;color:#fff;border-color:#1d2233;box-shadow:0 2px 10px rgba(0,0,0,.2)}'
    + '#idioma-aviso{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9998;max-width:min(620px,92vw);display:flex;gap:12px;align-items:flex-start;background:#1d2233;color:#fff;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;padding:12px 14px 12px 16px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.25)}'
    + '#idioma-aviso button{background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;opacity:.8}';
  (document.head || html).appendChild(css);

  function arranca() {
    if (actual === 'en' && !window.IDIOMA_EN) {
      var me = document.querySelector('script[src*="idioma.js"]');
      if (me) { var d = document.createElement('script'); d.src = me.src.replace(/idioma\.js.*/, 'idioma-en.js?v=1'); d.onload = function () { interfaz('en'); }; document.head.appendChild(d); }
    }
    selector();
    var p = pref();
    if (p && p !== actual) aplica(p, false); else marca(actual);
    /* las presentaciones construyen diapositivas y quizzes después: retraducir cuando cambie el DOM */
    if (window.MutationObserver) {
      var t = null;
      new MutationObserver(function () { if (actual !== 'en' && (pref() || actual) !== 'en') return; clearTimeout(t); t = setTimeout(function () { interfaz('en'); }, 150); }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
  window.IDIOMA = { aplica: aplica };
})();

/* Simulacros de parcial: reloj, modo examen y calificación (compartido por todos los libros) */
(function () {
  'use strict';
  var A = {};
  function lect(c, partes) { c.querySelector('.lect').innerHTML = partes.map(function (p) { return '<span>' + p + '</span>'; }).join(''); }
  /* 13. Simulacro: reloj y modo examen */
  function guarda(k, v) { try { localStorage.setItem('sim-' + location.pathname + '-' + k, JSON.stringify(v)); } catch (e) { } }
  function lee(k, d) { try { var v = localStorage.getItem('sim-' + location.pathname + '-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  A['simulacro'] = function (c) {
    var cu = c.querySelector('.acuerpo'), TOT = 2 * 3600;
    cu.innerHTML = '<div class="sim"><div class="sim-reloj">2:00:00</div><div class="sim-barra"><i></i></div>' +
      '<div class="sim-bot"><button type="button" class="sim-go">Empezar el simulacro</button><button type="button" class="sim-pausa" disabled>Pausar</button><button type="button" class="sim-fin" disabled>Terminar y ver soluciones</button><button type="button" class="sim-reset">Reiniciar</button></div>' +
      '<div class="sim-estado">Las soluciones están disponibles. Al empezar, se bloquean hasta que termines.</div></div>';
    var st = lee('reloj', { usado: 0, corriendo: false, inicio: 0, fin: false }), timer = null;
    var reloj = cu.querySelector('.sim-reloj'), barra = cu.querySelector('.sim-barra i'), est = cu.querySelector('.sim-estado');
    var bGo = cu.querySelector('.sim-go'), bPa = cu.querySelector('.sim-pausa'), bFin = cu.querySelector('.sim-fin');
    function usado() { return st.usado + (st.corriendo ? (Date.now() - st.inicio) / 1000 : 0); }
    function hms(x) { x = Math.max(0, Math.round(x)); var h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), q = x % 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (q < 10 ? '0' : '') + q; }
    function bloqueo(on) { document.body.classList.toggle('en-examen', on); if (on) document.querySelectorAll('details.solucion[open]').forEach(function (d) { d.open = false; }); }
    function marca() {
      var u = usado(), r = TOT - u;
      if (st.corriendo && r <= 0) { st.usado = TOT; st.corriendo = false; st.fin = true; guarda('reloj', st); fin(true); return; }
      reloj.textContent = hms(r); barra.style.width = (100 * Math.min(u / TOT, 1)) + '%';
      reloj.classList.toggle('poco', r < 600 && !st.fin);
      bGo.disabled = st.corriendo || st.fin; bGo.textContent = st.usado > 0 && !st.fin ? 'Continuar' : 'Empezar el simulacro';
      bPa.disabled = !st.corriendo; bFin.disabled = st.fin || (!st.corriendo && st.usado === 0);
      bloqueo((st.corriendo || st.usado > 0) && !st.fin);
      est.innerHTML = st.fin ? '<b>Simulacro terminado</b> en ' + hms(Math.min(u, TOT)) + '. Revisa las soluciones y califícate abajo.' : st.corriendo ? 'En curso: resuelve en papel. Las soluciones están bloqueadas.' : st.usado > 0 ? 'En pausa. Las soluciones siguen bloqueadas.' : 'Las soluciones están disponibles. Al empezar, se bloquean hasta que termines.';
    }
    function fin(auto) { clearInterval(timer); marca(); if (auto) alert('¡Se acabó el tiempo! Ahora puedes ver las soluciones y calificarte.'); var g = document.querySelector('.applet[data-ap="calificacion"]'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    bGo.onclick = function () { st.corriendo = true; st.inicio = Date.now(); guarda('reloj', st); timer = setInterval(marca, 1000); marca(); };
    bPa.onclick = function () { st.usado = usado(); st.corriendo = false; guarda('reloj', st); clearInterval(timer); marca(); };
    bFin.onclick = function () { if (!confirm('¿Terminar el simulacro y desbloquear las soluciones?')) return; st.usado = usado(); st.corriendo = false; st.fin = true; guarda('reloj', st); fin(false); };
    cu.querySelector('.sim-reset').onclick = function () { if (!confirm('¿Reiniciar el reloj y la calificación?')) return; st = { usado: 0, corriendo: false, inicio: 0, fin: false }; guarda('reloj', st); guarda('notas', {}); clearInterval(timer); marca(); document.dispatchEvent(new Event('sim-reset')); };
    document.addEventListener('click', function (e) {
      var sm = e.target.closest('details.solucion > summary');
      if (sm && document.body.classList.contains('en-examen')) { e.preventDefault(); est.innerHTML = '<b>Las soluciones están bloqueadas</b> hasta que termines el simulacro.'; c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, true);
    if (st.corriendo) timer = setInterval(marca, 1000);
    marca();
    lect(c, ['5 problemas × 1.0 + bonus 0.5', 'tiempo: 2 horas']);
  };

  /* 14. Simulacro: calificación */
  A['calificacion'] = function (c) {
    var cu = c.querySelector('.acuerpo'), probs = [].slice.call(document.querySelectorAll('.caja.prob')), notas = lee('notas', {});
    var h = '<div class="calif">';
    probs.forEach(function (p, i) {
      var num = p.querySelector('.bnum').textContent, nom = (p.querySelector('.bnom') || { textContent: '' }).textContent.replace(/^·\s*/, ''), bonus = /bonus/i.test(nom), mx = bonus ? .5 : 1;
      h += '<label class="calif-f"><span class="calif-n">' + num + '</span><span class="calif-t">' + nom + '</span><input type="range" min="0" max="' + mx + '" step="' + (bonus ? .05 : .1) + '" value="' + (notas[i] || 0) + '" data-i="' + i + '" data-b="' + (bonus ? 1 : 0) + '"><b></b></label>';
    });
    h += '<div class="calif-total"><span>Nota</span><b class="calif-nota">0.0</b><span class="calif-msg"></span></div></div>';
    cu.innerHTML = h;
    function calcula() {
      var base = 0, bon = 0;
      cu.querySelectorAll('input').forEach(function (i) { var v = +i.value; i.nextElementSibling.textContent = v.toFixed(i.dataset.b === '1' ? 2 : 1); notas[i.dataset.i] = v; if (i.dataset.b === '1') bon += v; else base += v; });
      var nota = Math.min(5, base + bon); guarda('notas', notas);
      cu.querySelector('.calif-nota').textContent = nota.toFixed(1);
      cu.querySelector('.calif-nota').className = 'calif-nota ' + (nota >= 3 ? 'ok' : 'mal');
      cu.querySelector('.calif-msg').textContent = nota >= 4.5 ? '¡Excelente! Estás listo para el parcial.' : nota >= 3.5 ? 'Muy bien: repasa los detalles de los problemas que perdiste.' : nota >= 3 ? 'Aprobado, pero vuelve a las demostraciones que te costaron.' : 'Aún no: repasa los capítulos y vuelve a intentarlo.';
      lect(c, ['problemas: ' + base.toFixed(1) + ' / 5.0', 'bonus: ' + bon.toFixed(2), 'nota (máximo 5.0): ' + nota.toFixed(1)]);
    }
    cu.addEventListener('input', calcula);
    document.addEventListener('sim-reset', function () { cu.querySelectorAll('input').forEach(function (i) { i.value = 0; }); notas = {}; calcula(); });
    calcula();
  };
  function inicia() { document.querySelectorAll('.applet[data-ap="simulacro"],.applet[data-ap="calificacion"]').forEach(function (e) { if (!e._sim) { e._sim = 1; A[e.getAttribute('data-ap')](e); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();

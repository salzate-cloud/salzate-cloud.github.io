/* Actividades interactivas: «Ordena la demostración», «Encuentra el error» y «Repasar hoy».
   Santiago Alzate · santiagoalzates.com */
(function () {
  'use strict';
  var LIBRO = (location.pathname.split('/').filter(Boolean).slice(-2, -1)[0]) || 'libro';
  var st = {
    get: function (k, d) { try { var v = localStorage.getItem('act:' + LIBRO + ':' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('act:' + LIBRO + ':' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- voz y stickers (los mismos de los quices) ---------- */
  var FR_OK = ['¡Eso, crack! 🔥', '¡Uy, qué nivel! 🧠', '¡De una, eso es! ✅', '¡Bieeen, parcero! 🎉'];
  var FR_NO = ['Nuuu, incorrecto 🙈', 'Nuuu, casi casi… 🤏', 'Nuuu, por ahí no es 🚫', 'Nuuu, incorrecto. ¡Otra vez! 🔁'];
  var ST_OK = ['🔥', '🧠', '🏆', '🎉', '🤩', '💯', '🚀', '😎'];
  var ST_NO = ['🙈', '🤦', '😬', '🫠', '🐢', '🤔', '💥', '😵‍💫'];
  function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
  function frase(ok) { return ok ? '<b class="ok">' + azar(FR_OK) + '</b> ' : '<b class="no">' + azar(FR_NO) + '</b> '; }
  function sticker(el, ok) {
    if (document.documentElement.classList.contains('sin-animacion')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var v = el.querySelector(':scope > .sticker'); if (v) v.remove();
    var s = document.createElement('span');
    s.className = 'sticker ' + (ok ? 'si' : 'no'); s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--rot', (Math.random() * 30 - 15).toFixed(0) + 'deg');
    s.textContent = azar(ok ? ST_OK : ST_NO);
    el.appendChild(s);
    setTimeout(function () { s.classList.add('fuera'); setTimeout(function () { s.remove(); }, 520); }, 2600);
  }
  function mezcla(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- estilos ---------- */
  /* los estilos están en assets/actividades.css */

  function datos(el) {
    var s = el.querySelector('script[type="application/json"]');
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  }
  function fbMuestra(fb, ok, extra) {
    fb.classList.add('si');
    fb.innerHTML = frase(ok) + (extra || '');
    sticker(fb, ok);
  }

  /* =====================================================================
     1. ORDENA LA DEMOSTRACIÓN (problema de Parsons)
     pasos: lista de bloques en el orden correcto; un elemento puede ser una
            lista de bloques que pueden ir en cualquier orden entre sí.
     distractores: bloques que NO pertenecen a la prueba.
     ===================================================================== */
  function iniciaOrdena(el) {
    var D = datos(el); if (!D) return;
    var esperados = [];            // lista de grupos (cada grupo: ids)
    var bloques = [];              // {id, html, dist}
    D.pasos.forEach(function (p) {
      var g = [];
      (Array.isArray(p) ? p : [p]).forEach(function (h) { var id = bloques.length; bloques.push({ id: id, html: h, dist: false }); g.push(id); });
      esperados.push(g);
    });
    (D.distractores || []).forEach(function (h) { bloques.push({ id: bloques.length, html: h, dist: true }); });
    var cuerpo = el.querySelector('.abody');
    var hayDist = (D.distractores || []).length > 0;
    cuerpo.insertAdjacentHTML('beforeend',
      '<div class="ztit">Bloques disponibles' + (hayDist ? ' <span style="text-transform:none;letter-spacing:0">· ¡ojo! sobran ' + D.distractores.length + '</span>' : '') + '</div>' +
      '<div class="zona banco" data-vacio="(ya usaste todos los bloques)"></div>' +
      '<div class="ztit">Tu ' + (D.clase || 'demostración') + '</div>' +
      '<div class="zona prueba" data-vacio="Toca o arrastra los bloques aquí, en orden."></div>' +
      '<div class="ayuda">Toca un bloque para pasarlo de una zona a la otra; arrástralo desde ⠿ para cambiarlo de posición.</div>' +
      '<div class="botones"><button class="prim verif">Verificar</button><button class="pista">Pista</button><button class="reini">Reiniciar</button></div>' +
      '<div class="fb"></div>');
    var banco = cuerpo.querySelector('.banco'), prueba = cuerpo.querySelector('.prueba'), fb = cuerpo.querySelector('.fb');

    function crea(b) {
      var d = document.createElement('div');
      d.className = 'bloque'; d.setAttribute('data-id', b.id); d.tabIndex = 0;
      d.innerHTML = '<span class="asa" title="Arrastrar">⠿</span><span class="num"></span><span class="txt">' + b.html + '</span>';
      return d;
    }
    function numera() {
      prueba.querySelectorAll('.bloque').forEach(function (b, i) { b.querySelector('.num').textContent = (i + 1) + '.'; });
    }
    function limpia() { el.querySelectorAll('.bloque').forEach(function (b) { b.classList.remove('bien', 'mal'); }); fb.classList.remove('si'); }
    function reinicia() {
      banco.innerHTML = ''; prueba.innerHTML = '';
      mezcla(bloques).forEach(function (b) { banco.appendChild(crea(b)); });
      limpia(); numera();
    }
    reinicia();

    /* arrastre con punteros (ratón y dedo) */
    var arr = null, recienArrastre = false;
    el.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.bloque'); if (!b || e.button > 0) return;
      if (e.pointerType !== 'mouse' && !e.target.closest('.asa')) return;   /* en pantallas táctiles se arrastra desde el asa */
      arr = { b: b, x0: e.clientX, y0: e.clientY, movio: false };
      try { b.setPointerCapture(e.pointerId); } catch (er) {}
      if (e.pointerType !== 'mouse') e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!arr) return;
      var dy = e.clientY - arr.y0, dx = e.clientX - arr.x0;
      if (!arr.movio && Math.abs(dy) + Math.abs(dx) < 8) return;
      if (!arr.movio) { arr.movio = true; arr.b.classList.add('arrastrando'); limpia(); }
      var debajo = document.elementsFromPoint(e.clientX, e.clientY);
      var zona = null, otro = null;
      for (var i = 0; i < debajo.length; i++) {
        if (!otro && debajo[i].classList && debajo[i].classList.contains('bloque') && debajo[i] !== arr.b) otro = debajo[i];
        if (!zona && debajo[i].classList && debajo[i].classList.contains('zona') && el.contains(debajo[i])) zona = debajo[i];
      }
      if (otro && el.contains(otro)) {
        var r = otro.getBoundingClientRect();
        otro.parentNode.insertBefore(arr.b, e.clientY < r.top + r.height / 2 ? otro : otro.nextSibling);
      } else if (zona && arr.b.parentNode !== zona) {
        zona.appendChild(arr.b);
      }
      numera();
    });
    function suelta() {
      if (!arr) return;
      if (arr.movio) { recienArrastre = true; setTimeout(function () { recienArrastre = false; }, 50); }
      arr.b.classList.remove('arrastrando'); arr = null; numera();
    }
    el.addEventListener('pointerup', suelta);
    el.addEventListener('pointercancel', suelta);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.bloque'); if (!b || recienArrastre) return;
      (b.parentNode === banco ? prueba : banco).appendChild(b); limpia(); numera();
    });
    el.addEventListener('keydown', function (e) {
      var b = e.target.closest && e.target.closest('.bloque'); if (!b) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (b.parentNode === banco ? prueba : banco).appendChild(b); b.focus(); }
      else if (e.key === 'ArrowUp' && b.previousElementSibling) { e.preventDefault(); b.parentNode.insertBefore(b, b.previousElementSibling); b.focus(); }
      else if (e.key === 'ArrowDown' && b.nextElementSibling) { e.preventDefault(); b.parentNode.insertBefore(b.nextElementSibling, b); b.focus(); }
      limpia(); numera();
    });

    /* verificación: posición por posición, respetando grupos intercambiables */
    function evalua() {
      var dados = Array.prototype.map.call(prueba.querySelectorAll('.bloque'), function (b) { return +b.getAttribute('data-id'); });
      var marcas = [], k = 0, primeroMal = -1;
      esperados.forEach(function (g) {
        var pend = g.slice();
        for (var j = 0; j < g.length; j++) {
          var id = dados[k], ok = id !== undefined && pend.indexOf(id) >= 0;
          if (ok) pend.splice(pend.indexOf(id), 1);
          if (id !== undefined) marcas.push(ok);
          if (!ok && primeroMal < 0) primeroMal = k;
          k++;
        }
      });
      for (; k < dados.length; k++) { marcas.push(false); if (primeroMal < 0) primeroMal = k; }
      var total = esperados.reduce(function (s, g) { return s + g.length; }, 0);
      return { dados: dados, marcas: marcas, primeroMal: primeroMal, completo: dados.length === total && primeroMal < 0, total: total };
    }
    cuerpo.querySelector('.verif').addEventListener('click', function () {
      var r = evalua(), bs = prueba.querySelectorAll('.bloque');
      bs.forEach(function (b, i) { b.classList.remove('bien', 'mal'); b.classList.add(r.marcas[i] ? 'bien' : 'mal'); });
      if (r.completo) {
        fbMuestra(fb, true, (D.cierre || 'La demostración quedó perfecta.'));
        st.set('ordena:' + el.id, 1); document.dispatchEvent(new Event('act-progreso'));
      } else if (r.dados.length < r.total && r.primeroMal < 0) {
        fbMuestra(fb, false, 'Vas bien, pero faltan pasos: llevas ' + r.dados.length + ' de ' + r.total + '.');
      } else {
        var bien = r.marcas.filter(Boolean).length;
        var dist = r.dados.some(function (id) { return bloques[id].dist; });
        fbMuestra(fb, false, 'Tienes ' + bien + ' de ' + r.total + ' en su lugar.' + (dist ? ' Además se te coló un bloque que no hace parte de la prueba.' : ''));
      }
    });
    cuerpo.querySelector('.pista').addEventListener('click', function () {
      var r = evalua(), bs = prueba.querySelectorAll('.bloque');
      limpia();
      if (r.completo) { fbMuestra(fb, true, 'No necesitas pista: ¡ya está!'); return; }
      if (r.primeroMal >= 0 && bs[r.primeroMal]) {
        bs[r.primeroMal].classList.add('mal');
        for (var i = 0; i < r.primeroMal; i++) bs[i].classList.add('bien');
        fb.classList.add('si'); fb.innerHTML = '<b>Pista:</b> todo está bien hasta el paso ' + r.primeroMal + '; el paso ' + (r.primeroMal + 1) + ' no va ahí.' + (D.pista ? ' ' + D.pista : '');
      } else {
        bs.forEach(function (b) { b.classList.add('bien'); });
        fb.classList.add('si'); fb.innerHTML = '<b>Pista:</b> lo que llevas está en orden; sigue con el siguiente paso.' + (D.pista ? ' ' + D.pista : '');
      }
    });
    cuerpo.querySelector('.reini').addEventListener('click', reinicia);
  }

  /* =====================================================================
     2. ENCUENTRA EL ERROR
     lineas: pasos de un argumento; error: índice (desde 0) del paso falso.
     ===================================================================== */
  function iniciaError(el) {
    var D = datos(el); if (!D) return;
    var cuerpo = el.querySelector('.abody');
    var html = '<div class="lineas">';
    D.lineas.forEach(function (l, i) { html += '<div class="linea" tabindex="0" data-i="' + i + '"><span class="num">' + (i + 1) + '.</span><span class="txt">' + l + '</span></div>'; });
    html += '</div><div class="ayuda">Toca el paso que está mal.</div><div class="botones"><button class="reini">Reiniciar</button></div><div class="fb"></div>';
    cuerpo.insertAdjacentHTML('beforeend', html);
    var fb = cuerpo.querySelector('.fb'), intentos = 0, hecho = false;
    function elige(ln) {
      if (hecho || ln.classList.contains('mal')) return;
      var i = +ln.getAttribute('data-i');
      if (i === D.error) {
        hecho = true; ln.classList.add('bien');
        cuerpo.querySelectorAll('.linea').forEach(function (x) { x.classList.add('bloq'); });
        fbMuestra(fb, true, '¡Lo pillaste! ' + D.explicacion);
        st.set('error:' + el.id, 1); document.dispatchEvent(new Event('act-progreso'));
      } else {
        intentos++; ln.classList.add('mal');
        if (intentos >= 2) {
          hecho = true;
          var ok = cuerpo.querySelector('.linea[data-i="' + D.error + '"]'); ok.classList.add('bien');
          cuerpo.querySelectorAll('.linea').forEach(function (x) { x.classList.add('bloq'); });
          fbMuestra(fb, false, 'El error estaba en el paso ' + (D.error + 1) + '. ' + D.explicacion);
        } else {
          fbMuestra(fb, false, (D.porque && D.porque[i]) ? D.porque[i] : 'Ese paso sí es válido. Busca otro.');
        }
      }
    }
    cuerpo.addEventListener('click', function (e) { var ln = e.target.closest('.linea'); if (ln) elige(ln); });
    cuerpo.addEventListener('keydown', function (e) { var ln = e.target.closest && e.target.closest('.linea'); if (ln && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); elige(ln); } });
    cuerpo.querySelector('.reini').addEventListener('click', function () {
      hecho = false; intentos = 0; fb.classList.remove('si');
      cuerpo.querySelectorAll('.linea').forEach(function (x) { x.classList.remove('bien', 'mal', 'bloq'); });
    });
  }

  /* =====================================================================
     3. REPASAR HOY (repetición espaciada con cajas de Leitner)
     ===================================================================== */
  var DIAS = [0, 0, 1, 3, 7, 16, 35];
  var HOY = Date.now(), DIA = 86400000;
  function iniciaRepaso(caja) {
    var paginas = JSON.parse(caja.getAttribute('data-paginas') || '[]');
    var vistos = {};
    try { vistos = JSON.parse(localStorage.getItem('gb:' + LIBRO + ':vistos') || '{}'); } catch (e) {}
    caja.innerHTML = '<p class="rep-origen">Buscando preguntas en los capítulos…</p>';
    var incrustado = document.getElementById('banco-repaso');
    var fuente = incrustado ? Promise.resolve([JSON.parse(incrustado.textContent)]) : Promise.all(paginas.map(function (p) {
      return fetch(p.href).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }).then(function (t) {
        var doc = new DOMParser().parseFromString(t, 'text/html'), qs = [];
        doc.querySelectorAll('.quiz').forEach(function (qz) {
          var idq = qz.getAttribute('data-id') || 'q';
          qz.querySelectorAll('.q').forEach(function (q, i) {
            if (!q.querySelector('.op') && !q.querySelector('.num input')) return;
            qs.push({ id: p.slug + ':' + idq + ':' + i, html: q.innerHTML, origen: p.titulo, slug: p.slug });
          });
        });
        return qs;
      });
    }));
    fuente.then(function (listas) {
      var todas = [].concat.apply([], listas);
      if (!todas.length) { caja.innerHTML = '<p>No encontré preguntas para repasar.</p>'; return; }
      var est = st.get('leitner', {});
      var vencidas = todas.filter(function (q) { return est[q.id] && est[q.id].prox <= HOY; })
        .sort(function (a, b) { return est[a.id].caja - est[b.id].caja; });
      var nuevas = mezcla(todas.filter(function (q) { return !est[q.id] && vistos[q.slug]; }));
      var resto = mezcla(todas.filter(function (q) { return !est[q.id] && !vistos[q.slug]; }));
      var sesion = vencidas.concat(nuevas, resto).slice(0, 10);
      if (!sesion.length) {
        var prox = Math.min.apply(null, Object.keys(est).map(function (k) { return est[k].prox; }));
        caja.innerHTML = '<div class="rep-fin"><div class="grande">😴</div><h2>Hoy no tienes nada pendiente</h2><p>Tu próximo repaso es el ' +
          new Date(prox).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }) + '.</p></div>';
        return;
      }
      corre(caja, sesion, est);
    });
  }
  function corre(caja, sesion, est) {
    var i = 0, aciertos = 0, cola = sesion.slice(), repetidas = {};
    function pinta() {
      if (!cola.length) return fin();
      var q = cola[0];
      var hechas = sesion.length - cola.length;
      caja.innerHTML = '<div class="rep-barra"><i style="width:' + (100 * hechas / sesion.length) + '%"></i></div>' +
        '<div class="quiz"><div class="qhead"><span>🔁 Repasar hoy</span><span class="marcador">' + (hechas + 1) + ' / ' + sesion.length + '</span></div>' +
        '<div class="rep-origen">De: ' + q.origen + '</div><div class="q">' + q.html + '</div></div>';
      var qd = caja.querySelector('.q'), fb = qd.querySelector('.fb'), ver = fb && fb.querySelector('.veredicto');
      if (fb) fb.classList.remove('si'); barajaOps(qd);
      function califica(ok) {
          var e = est[q.id] || { caja: 1, prox: HOY };
          if (ok) { e.caja = Math.min(e.caja + (repetidas[q.id] ? 0 : 1), 6); aciertos += repetidas[q.id] ? 0 : 1; }
          else { e.caja = 1; if (!repetidas[q.id]) { repetidas[q.id] = 1; cola.push(q); } }
          e.prox = HOY + DIAS[e.caja] * DIA + (ok ? 0 : 60000);
          est[q.id] = e; st.set('leitner', est);
          if (fb) { fb.classList.add('si'); if (ver) ver.innerHTML = frase(ok); sticker(fb, ok); }
          var sig = document.createElement('div'); sig.className = 'botones';
          sig.innerHTML = '<button class="prim">' + (cola.length > 1 ? 'Siguiente →' : 'Terminar') + '</button>';
          qd.appendChild(sig);
          sig.querySelector('button').addEventListener('click', function () { cola.shift(); pinta(); window.scrollTo({ top: caja.offsetTop - 80, behavior: 'smooth' }); });
      }
      var inp = qd.querySelector('.num input');
      if (inp) {
        inp.value = ''; inp.disabled = false; inp.classList.remove('bien', 'mal');
        var bt = qd.querySelector('.comprobar'), hecho = false;
        var evalua = function () {
          if (hecho) return;
          var txt = inp.value.trim().replace(',', '.'), v = NaN;
          try { if (/^[-+*/().\d\s^sqrtpi]+$/.test(txt)) v = Function('"use strict";var sqrt=Math.sqrt,pi=Math.PI;return (' + txt.replace(/\^/g, '**') + ')')(); } catch (er) {}
          var r = parseFloat(inp.getAttribute('data-r')), tol = parseFloat(inp.getAttribute('data-tol') || '0.01');
          if (!isFinite(v)) { if (fb) { fb.classList.add('si'); if (ver) ver.innerHTML = '<b>Escribe un número o una expresión como 3/2.</b> '; } return; }
          var ok = Math.abs(v - r) <= tol * Math.max(1, Math.abs(r));
          hecho = true; inp.classList.add(ok ? 'bien' : 'mal'); califica(ok);
        };
        if (bt) bt.addEventListener('click', evalua);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') evalua(); });
      }
      qd.querySelectorAll('.op').forEach(function (op) {
        op.disabled = false; op.classList.remove('bien', 'mal');
        op.addEventListener('click', function () {
          var ok = op.getAttribute('data-c') === '1';
          qd.querySelectorAll('.op').forEach(function (o) { o.disabled = true; if (o.getAttribute('data-c') === '1') o.classList.add('bien'); });
          op.classList.add(ok ? 'bien' : 'mal');
          califica(ok);
        });
      });
    }
    function fin() {
      var n = sesion.length, pct = aciertos / n;
      var cara = pct === 1 ? '🏆' : pct >= .7 ? '🔥' : pct >= .4 ? '💪' : '🐢';
      var msg = pct === 1 ? '¡Eso, crack! Sesión perfecta.' : pct >= .7 ? '¡Uy, qué nivel! Muy buen repaso.' : pct >= .4 ? 'Bien, parcero. Lo que fallaste vuelve pronto.' : 'Nuuu, hoy costó… pero para eso es el repaso. ¡Mañana vuelves!';
      var cajas = [0, 0, 0, 0, 0, 0];
      Object.keys(est).forEach(function (k) { cajas[est[k].caja - 1]++; });
      caja.innerHTML = '<div class="rep-fin"><div class="grande">' + cara + '</div><h2>' + msg + '</h2><p>Acertaste <b>' + aciertos + ' de ' + n + '</b> a la primera.</p>' +
        '<div class="rep-cajas">' + cajas.map(function (c, j) { return '<span>Caja ' + (j + 1) + ': <b>' + c + '</b></span>'; }).join('') + '</div>' +
        '<p class="ayuda">Las preguntas que aciertas suben de caja y vuelven cada vez más tarde (1, 3, 7, 16 y 35 días). Las que fallas vuelven a la caja 1.</p>' +
        '<div class="botones" style="justify-content:center"><button class="prim otra">Otra ronda</button></div></div>';
      caja.querySelector('.otra').addEventListener('click', function () { iniciaRepaso(caja); });
    }
    pinta();
  }
  function botonRepaso() {
    var est = st.get('leitner', {}), n = 0;
    Object.keys(est).forEach(function (k) { if (est[k].prox <= HOY) n++; });
    document.querySelectorAll('a.repaso-btn small').forEach(function (s) { s.textContent = n ? '· ' + n + ' pendientes' : ''; });
  }

  /* =====================================================================
     4. LABORATORIO «ELIGE EL SIGUIENTE PASO»
     problemas: [{nombre, enunciado, pasos:[{pregunta, opciones, correcta, explica, resultado}]}]
     ===================================================================== */
  function iniciaLab(el) {
    var D = datos(el); if (!D) return;
    var cuerpo = el.querySelector('.abody');
    var hechos = st.get('labp:' + el.id, {});
    var chips = '';
    if (D.problemas.length > 1) {
      chips = '<div class="chips">' + D.problemas.map(function (p, i) { return '<button data-i="' + i + '"' + (hechos[i] ? ' class="hecho"' : '') + '>' + p.nombre + '</button>'; }).join('') + '</div>';
    }
    cuerpo.insertAdjacentHTML('beforeend', chips + '<div class="lab-zona"></div>');
    var zona = cuerpo.querySelector('.lab-zona');
    function abre(ip) {
      cuerpo.querySelectorAll('.chips button').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-i') === ip); });
      var P = D.problemas[ip], k = 0;
      zona.innerHTML = (P.enunciado ? '<div class="lab-prob">' + P.enunciado + '</div>' : '') + '<div class="lab-hecho"></div><div class="lab-paso"></div><div class="fb"></div>';
      var hecho = zona.querySelector('.lab-hecho'), paso = zona.querySelector('.lab-paso'), fb = zona.querySelector('.fb');
      function pinta() {
        if (k >= P.pasos.length) {
          paso.innerHTML = '<div class="botones"><button class="prim otra">' + (D.problemas.length > 1 ? 'Probar con otro' : 'Repetir') + '</button></div>';
          fbMuestra(fb, true, P.cierre || '¡Problema resuelto paso a paso!');
          hechos[ip] = 1; st.set('labp:' + el.id, hechos);
          var ch = cuerpo.querySelector('.chips button[data-i="' + ip + '"]'); if (ch) ch.classList.add('hecho');
          if (Object.keys(hechos).length >= Math.min(D.problemas.length, D.meta || 1)) { st.set('lab:' + el.id, 1); document.dispatchEvent(new Event('act-progreso')); }
          paso.querySelector('.otra').addEventListener('click', function () {
            var sig = D.problemas.length > 1 ? (ip + 1) % D.problemas.length : ip; abre(sig);
          });
          return;
        }
        var S = P.pasos[k];
        var orden = mezcla(S.opciones.map(function (o, i) { return i; }));
        paso.innerHTML = '<div class="lab-preg">' + (k + 1) + '. ' + S.pregunta + '</div><div class="lab-ops">' +
          orden.map(function (i) { return '<button data-i="' + i + '">' + S.opciones[i] + '</button>'; }).join('') + '</div>';
        paso.querySelectorAll('.lab-ops button').forEach(function (b) {
          b.addEventListener('click', function () {
            var i = +b.getAttribute('data-i');
            if (i === S.correcta) {
              b.classList.add('bien');
              fbMuestra(fb, true, S.explica || '');
              var d = document.createElement('div'); d.className = 'lp paso-nuevo'; d.innerHTML = S.resultado || S.opciones[i];
              hecho.appendChild(d); k++;
              setTimeout(pinta, 650);
            } else {
              b.classList.add('mal'); b.disabled = true;
              fbMuestra(fb, false, (S.porque && S.porque[i]) || S.pista || 'Ese no es el paso que conviene aquí.');
            }
          });
        });
      }
      pinta();
    }
    cuerpo.querySelectorAll('.chips button').forEach(function (b) { b.addEventListener('click', function () { abre(+b.getAttribute('data-i')); }); });
    abre(0);
  }

  /* =====================================================================
     5. TALLER DE GAUSS–JORDAN (operaciones de fila con fracciones exactas)
     matriz: filas de números o "a/b"; aumentada: nº de columnas a la derecha de la barra
     ===================================================================== */
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function Q(n, d) { d = d || 1; if (d < 0) { n = -n; d = -d; } var g = mcd(n, d); return { n: n / g, d: d / g }; }
  function qp(s) { s = String(s).trim().replace(',', '.'); if (/^-?\d+\/-?\d+$/.test(s)) { var p = s.split('/'); return Q(+p[0], +p[1]); }
    if (/^-?\d+(\.\d+)?$/.test(s)) { var k = (s.split('.')[1] || '').length, m = Math.pow(10, k); return Q(Math.round(+s * m), m); } return null; }
  function qs(a, b) { return Q(a.n * b.d + b.n * a.d, a.d * b.d); }
  function qm(a, b) { return Q(a.n * b.n, a.d * b.d); }
  function qt(a) { return a.d === 1 ? String(a.n).replace('-', '−') : (a.n < 0 ? '−' : '') + Math.abs(a.n) + '/' + a.d; }
  function iniciaGauss(el) {
    var D = datos(el); if (!D) return;
    var M0 = D.matriz.map(function (f) { return f.map(qp); });
    var m = M0.length, n = M0[0].length, aum = D.aumentada || 0;
    var M = M0.map(function (f) { return f.slice(); }), hist = [];
    var cuerpo = el.querySelector('.abody');
    var opsF = ''; for (var i = 1; i <= m; i++) opsF += '<option value="' + (i - 1) + '">F' + i + '</option>';
    cuerpo.insertAdjacentHTML('beforeend',
      '<table class="gj-tabla"></table>' +
      '<div class="gj-ctrl"><select class="tipo"><option value="sum">Fi → Fi + c·Fj</option><option value="esc">Fi → c·Fi</option><option value="int">Fi ↔ Fj</option></select>' +
      '<span>i =</span><select class="fi">' + opsF + '</select><span class="lj">j =</span><select class="fj">' + opsF + '</select>' +
      '<span class="lc">c =</span><input class="c" value="-1" aria-label="escalar c"></div>' +
      '<div class="botones" style="justify-content:center"><button class="prim apl">Aplicar</button><button class="pista">¿Qué sigue?</button><button class="desh">Deshacer</button><button class="reini">Reiniciar</button></div>' +
      '<div class="gj-log"></div><div class="fb"></div>');
    var tabla = cuerpo.querySelector('.gj-tabla'), log = cuerpo.querySelector('.gj-log'), fb = cuerpo.querySelector('.fb');
    var tipo = cuerpo.querySelector('.tipo'), fi = cuerpo.querySelector('.fi'), fj = cuerpo.querySelector('.fj'), ci = cuerpo.querySelector('.c');
    fj.value = '0'; fi.value = String(Math.min(1, m - 1));
    function pivotes() {
      var piv = [];
      for (var r = 0; r < m; r++) { for (var c = 0; c < n - aum; c++) if (M[r][c].n !== 0) { piv.push([r, c]); break; } }
      return piv;
    }
    function esRREF() {
      var lead = -1, piv = pivotes(), filasNoNulas = piv.length;
      for (var r = 0; r < m; r++) {
        var c = -1; for (var k = 0; k < n - aum; k++) if (M[r][k].n !== 0) { c = k; break; }
        if (c < 0) { for (var r2 = r + 1; r2 < m; r2++) for (var k2 = 0; k2 < n - aum; k2++) if (M[r2][k2].n !== 0) return false; break; }
        if (c <= lead) return false; lead = c;
        if (!(M[r][c].n === 1 && M[r][c].d === 1)) return false;
        for (var r3 = 0; r3 < m; r3++) if (r3 !== r && M[r3][c].n !== 0) return false;
      }
      return filasNoNulas >= 0;
    }
    function pinta() {
      var piv = {}; pivotes().forEach(function (p) { piv[p[0] + ',' + p[1]] = 1; });
      tabla.innerHTML = M.map(function (f, r) {
        return '<tr><th>F' + (r + 1) + '</th>' + f.map(function (x, c) {
          return '<td class="' + (c === n - aum && aum ? 'sep ' : '') + (piv[r + ',' + c] ? 'piv' : '') + '">' + qt(x) + '</td>';
        }).join('') + '</tr>';
      }).join('');
      var t = tipo.value;
      cuerpo.querySelector('.lj').style.display = fj.style.display = t === 'esc' ? 'none' : '';
      cuerpo.querySelector('.lc').style.display = ci.style.display = t === 'int' ? 'none' : '';
      if (esRREF()) { fbMuestra(fb, true, '¡Forma escalonada reducida! ' + (D.cierre || '') + ' Lo lograste en ' + hist.length + ' operaciones.'); st.set('lab:' + el.id, 1); document.dispatchEvent(new Event('act-progreso')); }
    }
    tipo.addEventListener('change', pinta);
    function sugerencia() {
      var r = 0;
      for (var c = 0; c < n - aum && r < m; c++) {
        var p = -1;
        if (D.pivoteo) { var mx = 0; for (var k0 = r; k0 < m; k0++) { var v = Math.abs(M[k0][c].n / M[k0][c].d); if (v > mx + 1e-12) { mx = v; p = k0; } } }
        else { for (var k = r; k < m; k++) if (M[k][c].n !== 0) { p = k; break; } }
        if (p < 0) continue;
        if (p !== r) return 'Intercambia F' + (r + 1) + ' y F' + (p + 1) + (D.pivoteo ? ' para usar como pivote el de mayor valor absoluto' : ' para tener un pivote') + ' en la columna ' + (c + 1) + '.';
        if (!(M[r][c].n === 1 && M[r][c].d === 1)) return 'Multiplica F' + (r + 1) + ' por ' + qt(Q(M[r][c].d, M[r][c].n)) + ' para que el pivote sea 1.';
        for (var k2 = 0; k2 < m; k2++) if (k2 !== r && M[k2][c].n !== 0) return 'Haz F' + (k2 + 1) + ' → F' + (k2 + 1) + ' + (' + qt(Q(-M[k2][c].n, M[k2][c].d)) + ')·F' + (r + 1) + ' para anular esa entrada.';
        r++;
      }
      return 'Ya está en forma escalonada reducida.';
    }
    cuerpo.querySelector('.apl').addEventListener('click', function () {
      var t = tipo.value, i = +fi.value, j = +fj.value, c = qp(ci.value);
      fb.classList.remove('si');
      if (t !== 'esc' && i === j) { fbMuestra(fb, false, 'Elige dos filas distintas.'); return; }
      if (t !== 'int' && !c) { fbMuestra(fb, false, 'Escribe c como entero, decimal o fracción (por ejemplo, -1/2).'); return; }
      if (t === 'esc' && c.n === 0) { fbMuestra(fb, false, 'Multiplicar una fila por 0 no es una operación elemental: se pierde información.'); return; }
      hist.push(M.map(function (f) { return f.slice(); }));
      var txt;
      if (t === 'int') { var tmp = M[i]; M[i] = M[j]; M[j] = tmp; txt = 'F' + (i + 1) + ' ↔ F' + (j + 1); }
      else if (t === 'esc') { M[i] = M[i].map(function (x) { return qm(x, c); }); txt = 'F' + (i + 1) + ' → ' + qt(c) + '·F' + (i + 1); }
      else { M[i] = M[i].map(function (x, k) { return qs(x, qm(c, M[j][k])); }); txt = 'F' + (i + 1) + ' → F' + (i + 1) + ' + (' + qt(c) + ')·F' + (j + 1); }
      log.textContent = hist.length + '. ' + txt;
      pinta();
    });
    cuerpo.querySelector('.pista').addEventListener('click', function () { fb.classList.add('si'); fb.innerHTML = '<b>Pista:</b> ' + sugerencia(); });
    cuerpo.querySelector('.desh').addEventListener('click', function () { if (hist.length) { M = hist.pop(); log.textContent = 'Deshecho. Llevas ' + hist.length + ' operaciones.'; fb.classList.remove('si'); pinta(); } });
    cuerpo.querySelector('.reini').addEventListener('click', function () { M = M0.map(function (f) { return f.slice(); }); hist = []; log.textContent = ''; fb.classList.remove('si'); pinta(); });
    pinta();
  }

  /* =====================================================================
     6. SOLUCIONES Y DEMOSTRACIONES PASO A PASO
     ===================================================================== */
  function iniciaRevela(d) {
    var body = d.querySelector('.pbody'); if (!body || d._revela) return;
    var hijos = Array.prototype.filter.call(body.children, function (x) { return !x.classList.contains('revela'); });
    var esCab = function (h) { return h.classList.contains('paso') || /^\s*(Paso\s*\d|Caso\s*\d|\(\w{1,3}\)|[a-z]\)|Parte\s)/i.test(h.textContent.slice(0, 14)); };
    var conCab = hijos.filter(esCab).length >= 2, grupos = [], actual = null;
    hijos.forEach(function (h) {
      if (!actual || !conCab || esCab(h)) { actual = { els: [h] }; grupos.push(actual); }
      else actual.els.push(h);
    });
    if (grupos.length < 3 || grupos.length > 18) return;
    d._revela = true;
    var k = 1;
    var barra = document.createElement('div'); barra.className = 'revela';
    barra.innerHTML = '<button class="sig">Siguiente paso ▸</button><button class="todo">Ver todo</button><span class="cuenta"></span>';
    body.appendChild(barra);
    function pinta(anim) {
      grupos.forEach(function (g, i) { g.els.forEach(function (e) { e.classList.toggle('paso-oculto', i >= k); if (anim && i === k - 1) { e.classList.remove('paso-nuevo'); void e.offsetWidth; e.classList.add('paso-nuevo'); } }); });
      barra.querySelector('.cuenta').textContent = 'Paso ' + k + ' de ' + grupos.length + ' · intenta adivinar el siguiente antes de verlo';
      if (k >= grupos.length) barra.style.display = 'none';
    }
    barra.querySelector('.sig').addEventListener('click', function () { k++; pinta(true); });
    barra.querySelector('.todo').addEventListener('click', function () { k = grupos.length; pinta(false); });
    pinta(false);
  }

  /* =====================================================================
     7. PROGRESO DEL CAPÍTULO Y MEDALLAS
     ===================================================================== */
  var PREF = 'gb:' + LIBRO + ':';
  function lee(k, d) { try { var v = localStorage.getItem(PREF + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function progresoCapitulo() {
    var caja = document.querySelector('.progreso'); if (!caja) return;
    var slug = caja.getAttribute('data-slug'), items = [], hechos = 0, total = 0;
    document.querySelectorAll('.quiz').forEach(function (qz) {
      var nq = qz.querySelectorAll('.q').length, res0 = lee('quiz:' + qz.getAttribute('data-id'), {}) || {}, res = Object.keys(res0).map(function (k) { return res0[k]; });
      var bien = res.filter(function (x) { return x === true; }).length;
      total += 2; var ok = nq && bien >= Math.ceil(0.7 * nq); if (ok) hechos += 2;
      items.push('<span class="item' + (ok ? ' ok' : '') + '">✎ Quiz ' + bien + '/' + nq + '</span>');
    });
    [['.act.ordena', 'ordena', '🧩 Ordena'], ['.act.error', 'error', '🔍 Error'], ['.act.lab', 'lab', '🔬 Laboratorio']].forEach(function (t) {
      document.querySelectorAll(t[0]).forEach(function (a) {
        var ok = !!st.get(t[1] + ':' + a.id, 0); total++; if (ok) hechos++;
        items.push('<span class="item' + (ok ? ' ok' : '') + '">' + t[2] + (ok ? ' ✓' : '') + '</span>');
      });
    });
    var pct = total ? Math.round(100 * hechos / total) : 0;
    caja.innerHTML = '<b>Tu progreso</b><span class="barra"><i style="width:' + pct + '%"></i></span><b>' + pct + ' %</b>' + items.join('');
    var meds = st.get('medallas', {}), progs = st.get('progresos', {});
    progs[slug] = pct; st.set('progresos', progs);
    if (pct === 100 && !meds[slug]) {
      meds[slug] = Date.now(); st.set('medallas', meds);
      var t = document.createElement('div'); t.className = 'medalla-toast';
      t.innerHTML = '<div class="m">' + (caja.getAttribute('data-emoji') || '🏅') + '</div><b>¡Medalla desbloqueada!</b><br>' + (caja.getAttribute('data-nombre') || 'Capítulo completo') + '<br><small>Mírala en tu colección, en la portada del libro.</small>';
      document.body.appendChild(t); setTimeout(function () { t.style.transition = 'opacity .6s'; t.style.opacity = 0; setTimeout(function () { t.remove(); }, 700); }, 4200);
    }
  }
  function coleccion() {
    var c = document.getElementById('medallas'); if (!c) return;
    var caps = JSON.parse(c.getAttribute('data-caps') || '[]'), meds = st.get('medallas', {}), progs = st.get('progresos', {});
    var n = caps.filter(function (x) { return meds[x.slug]; }).length;
    var rangos = [[0, 'Aprendiz 🐣'], [0.2, 'En racha 🔥'], [0.5, 'Pilo de la clase 🧠'], [0.8, 'Casi crack 🚀'], [1, '¡Crack del curso! 🏆']], r = rangos[0][1];
    rangos.forEach(function (x) { if (n / Math.max(caps.length, 1) >= x[0]) r = x[1]; });
    c.innerHTML = '<h2>Tu colección de medallas</h2><p>Completa los retos de cada capítulo (quiz, ordena, error y laboratorio) para ganar su medalla. Llevas <b>' + n + ' de ' + caps.length + '</b> · Rango: <span class="rango">' + r + '</span></p>' +
      '<div class="grid">' + caps.map(function (x) {
        var p = progs[x.slug] || 0;
        return '<a class="med' + (meds[x.slug] ? ' si' : '') + '" href="' + x.href + '"><span class="m">' + x.emoji + '</span>' + x.nombre + '<div class="pp"><i style="width:' + (meds[x.slug] ? 100 : p) + '%"></i></div></a>';
      }).join('') + '</div>';
  }

  window.__Voz = { muestra: fbMuestra };
  function iniciaExplora(el) {
    var D = datos(el); if (!D || !window.EXPLORA || !window.EXPLORA[D.widget]) return;
    var c = document.createElement('div'); c.className = 'exp'; el.querySelector('.abody').appendChild(c);
    c.__fin = function () { st.set('lab:' + el.id, 1); document.dispatchEvent(new Event('act-progreso')); };
    window.EXPLORA[D.widget](c, D);
  }

  /* =====================================================================
     8. HERRAMIENTAS: buscador, accesibilidad, sin internet
     ===================================================================== */
  function quitaTildes(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  var INDICE = null;
  function abreBuscador() {
    var cap = document.getElementById('buscador');
    if (!cap) {
      cap = document.createElement('div'); cap.id = 'buscador'; cap.setAttribute('role', 'dialog'); cap.setAttribute('aria-label', 'Buscar en el libro');
      cap.innerHTML = '<div class="bx"><div class="bfila"><span aria-hidden="true">🔎</span><input type="search" placeholder="Busca un tema, teorema o palabra… (p. ej., Cramer)" aria-label="Buscar"><button class="cerrar" aria-label="Cerrar">✕</button></div><div class="bres" aria-live="polite"></div><div class="bpie">Enter abre el primer resultado · Esc cierra</div></div>';
      document.body.appendChild(cap);
      var inp = cap.querySelector('input'), res = cap.querySelector('.bres');
      var pinta = function () {
        var q = quitaTildes(inp.value.trim());
        if (!INDICE) { res.innerHTML = '<p class="bnada">Cargando índice…</p>'; return; }
        if (q.length < 2) { res.innerHTML = '<p class="bnada">Escribe al menos dos letras.</p>'; return; }
        var tk = q.split(/\s+/).filter(Boolean), out = [];
        INDICE.forEach(function (e) {
          var t = e._t || (e._t = quitaTildes(e.t)), x = e._x || (e._x = quitaTildes(e.x));
          var sc = 0;
          for (var i = 0; i < tk.length; i++) { var w = tk[i]; if (t.indexOf(w) >= 0) sc += 10; else if (x.indexOf(w) >= 0) sc += 2; else { sc = -1; break; } }
          if (sc > 0) { if (t.indexOf(q) === 0) sc += 8; sc += e.k === 'def' ? 3 : e.k === 'sec' ? 2 : e.k === 'teo' ? 2 : 0; out.push([sc, e]); }
        });
        out.sort(function (a, b) { return b[0] - a[0]; });
        var et = { def: 'Definición', teo: 'Resultado', sec: 'Sección', cap: 'Capítulo', txt: 'Texto', pag: 'Página' };
        res.innerHTML = out.length ? out.slice(0, 25).map(function (r) {
          var e = r[1], x = e.x, i = quitaTildes(x).indexOf(tk[0]), frag = x.slice(Math.max(0, i - 50), i + 110);
          return '<a href="' + e.u + '"><span class="bk">' + (et[e.k] || '') + ' · ' + e.c + '</span><b>' + e.t + '</b><small>' + (i > 50 ? '…' : '') + frag + '…</small></a>';
        }).join('') : '<p class="bnada">Nada por aquí. Prueba con otra palabra o sin tildes.</p>';
      };
      inp.addEventListener('input', pinta);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.href = a.href; } });
      cap.addEventListener('click', function (e) { if (e.target === cap || e.target.closest('.cerrar')) cierraBuscador(); });
      cap._pinta = pinta;
      if (!INDICE) {
        var sc = document.createElement('script'); sc.src = 'buscar.js';
        sc.onload = function () { INDICE = window.__INDICE || []; pinta(); };
        sc.onerror = function () { res.innerHTML = '<p class="bnada">No pude cargar el índice de búsqueda.</p>'; };
        document.head.appendChild(sc);
      }
    }
    cap.classList.add('si'); document.documentElement.classList.add('sin-scroll');
    var i2 = cap.querySelector('input'); i2.focus(); i2.select(); cap._pinta();
  }
  function cierraBuscador() { var c = document.getElementById('buscador'); if (c) c.classList.remove('si'); document.documentElement.classList.remove('sin-scroll'); }

  var PREFS = (function () { try { return JSON.parse(localStorage.getItem('gb:accesibilidad') || '{}'); } catch (e) { return {}; } })();
  function aplicaPrefs() {
    document.documentElement.classList.toggle('letra-grande', !!PREFS.grande);
    document.documentElement.classList.toggle('alto-contraste', !!PREFS.contraste);
    document.documentElement.classList.toggle('sin-animacion', !!PREFS.quietas);
  }
  aplicaPrefs();
  function panelAcceso(btn) {
    var p = document.getElementById('panel-acceso');
    if (p) { p.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    p = document.createElement('div'); p.id = 'panel-acceso'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Opciones de lectura');
    var op = [['grande', 'Letra grande'], ['contraste', 'Alto contraste'], ['quietas', 'Sin animaciones ni stickers']];
    p.innerHTML = '<b>Opciones de lectura</b>' + op.map(function (o) { return '<label><input type="checkbox" data-k="' + o[0] + '"' + (PREFS[o[0]] ? ' checked' : '') + '> ' + o[1] + '</label>'; }).join('') +
      '<small>Se guardan en este navegador.</small>';
    document.body.appendChild(p); btn.setAttribute('aria-expanded', 'true');
    p.querySelectorAll('input').forEach(function (c) { c.addEventListener('change', function () { PREFS[c.getAttribute('data-k')] = c.checked; try { localStorage.setItem('gb:accesibilidad', JSON.stringify(PREFS)); } catch (e) {} aplicaPrefs(); }); });
    p.querySelector('input').focus();
  }
  function herramientas() {
    var tb = document.querySelector('.topbar'); if (!tb || tb.querySelector('.herr')) return;
    var h = document.createElement('div'); h.className = 'herr';
    h.innerHTML = '<button class="hbus" aria-label="Buscar en el libro (Ctrl+K)" title="Buscar (Ctrl+K)">🔎</button><button class="hacc" aria-label="Opciones de lectura: letra grande y contraste" aria-expanded="false" title="Opciones de lectura">Aa</button>';
    var esp = tb.querySelector('.esp'); if (esp && esp.nextSibling) tb.insertBefore(h, esp.nextSibling); else tb.appendChild(h);
    h.querySelector('.hbus').addEventListener('click', abreBuscador);
    h.querySelector('.hacc').addEventListener('click', function () { panelAcceso(this); });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abreBuscador(); }
      else if (e.key === 'Escape') { cierraBuscador(); var pa = document.getElementById('panel-acceso'); if (pa) pa.remove(); }
      else if (e.key === '/' && !/input|textarea|select/i.test((e.target.tagName || ''))) { e.preventDefault(); abreBuscador(); }
    });
  }
  /* textos alternativos y teclado para lo que no los tenga */
  function accesibilidad() {
    document.querySelectorAll('figure img:not([alt]), figure img[alt=""]').forEach(function (im) {
      var cap = im.closest('figure').querySelector('figcaption'); im.setAttribute('alt', cap ? cap.textContent.trim().slice(0, 240) : 'Figura del texto');
    });
    document.querySelectorAll('canvas:not([aria-label])').forEach(function (c) { c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Figura interactiva: usa el ratón, el dedo o los controles de al lado'); });
    if (!document.querySelector('.saltar')) {
      var m = document.querySelector('main'); if (m) { if (!m.id) m.id = 'contenido'; var a = document.createElement('a'); a.className = 'saltar'; a.href = '#' + m.id; a.textContent = 'Saltar al contenido'; document.body.insertBefore(a, document.body.firstChild); }
    }
  }
  /* lectura sin internet (solo en la web) */
  function sinInternet() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    navigator.serviceWorker.register('sw.js').catch(function () {});
    var caja = document.getElementById('offline'); if (!caja) return;
    var lista = JSON.parse(caja.getAttribute('data-archivos') || '[]');
    var listo = st.get('offline', 0);
    caja.innerHTML = '<button class="prim">' + (listo ? '✅ Guardado: puedes leerlo sin internet · actualizar' : '📥 Guardar el libro para leer sin internet') + '</button><span class="oinfo"></span>';
    caja.querySelector('button').addEventListener('click', function () {
      var b = this, info = caja.querySelector('.oinfo'); b.disabled = true;
      caches.open('libro-' + LIBRO).then(function (c) {
        var hechos = 0;
        return Promise.all(lista.map(function (u) {
          return fetch(u, { cache: 'reload' }).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {}).then(function () { hechos++; info.textContent = ' ' + hechos + ' / ' + lista.length; });
        }));
      }).then(function () { st.set('offline', Date.now()); b.textContent = '✅ ¡Listo! El libro quedó guardado en este dispositivo'; b.disabled = false; info.textContent = ''; });
    });
  }

  /* =====================================================================
     9. COMENTARIOS ANÓNIMOS
     ===================================================================== */
  var URL_COMENTARIOS = 'https://formspree.io/f/mzerzkoj';   /* el mismo buzón del formulario de santiagoalzates.com */
  function comentarios() {
    document.querySelectorAll('.comentar').forEach(function (c) {
      var b = c.querySelector('button');
      b.addEventListener('click', function () {
        if (c.querySelector('form')) return;
        var f = document.createElement('form');
        f.innerHTML = '<label>¿Qué viste? <select name="tipo"><option>Error en el texto o en una cuenta</option><option>Algo no se entiende</option><option>Una idea para mejorar</option><option>Otro</option></select></label>' +
          '<label>Cuéntame (si es un error, di dónde está):<textarea name="message" maxlength="3000" rows="4" required></textarea></label>' +
          '<label>Tu correo <small>(opcional, solo si quieres que te responda)</small><input type="email" name="email" autocomplete="email" placeholder="tunombre@correo.com"></label>' +
          '<input name="_gotcha" class="trampa" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<div class="botones"><button class="prim" type="submit">Enviar comentario</button><button type="button" class="canc">Cancelar</button></div>' +
          '<small>No te pido tu nombre; el correo es opcional. El comentario llega al buzón de Santiago (lo procesa Formspree, <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener">política de privacidad</a>) y no se publica.</small><div class="cres" aria-live="polite"></div>';
        c.appendChild(f); f.querySelector('textarea').focus();
        f.querySelector('.canc').addEventListener('click', function () { f.remove(); });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          if (f._gotcha.value) return;
          var titulo = (document.querySelector('.cabecera h1') || {}).textContent || document.title;
          var pagina = document.body.getAttribute('data-pagina') || location.pathname;
          var fd = new FormData(f);
          fd.append('libro', LIBRO); fd.append('pagina', pagina); fd.append('capitulo', titulo.trim()); fd.append('enlace', location.href.split('#')[0]);
          fd.append('anonymous', fd.get('email') ? 'no' : 'yes');
          fd.append('_subject', 'Comentario en el libro ' + LIBRO + ' · ' + titulo.trim().slice(0, 60));
          var res = f.querySelector('.cres'); f.querySelector('[type=submit]').disabled = true; res.textContent = 'Enviando…';
          fetch(URL_COMENTARIOS, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
            .then(function (r) { if (!r.ok) throw 0; f.innerHTML = '<p><b>¡Gracias, parcero! 🙌</b> Tu comentario le llegó a Santiago y ayuda a mejorar el libro.</p>'; })
            .catch(function () {
              var cuerpo = encodeURIComponent('Libro: ' + LIBRO + '\nPágina: ' + pagina + '\nTipo: ' + fd.get('tipo') + '\n\n' + fd.get('message'));
              res.innerHTML = 'No pude enviarlo ahora. Inténtalo más tarde o <a href="mailto:santiago.alzate9@udea.edu.co?subject=' + encodeURIComponent('Comentario sobre ' + LIBRO) + '&body=' + cuerpo + '">mándalo por correo</a>.';
              f.querySelector('[type=submit]').disabled = false;
            });
        });
      });
    });
  }

  /* =====================================================================
     10. ¿POR DÓNDE EMPIEZO? y SIMULACROS RÁPIDOS CON INFORME
     ===================================================================== */
  function iniciaPractica(caja) {
    var banco = JSON.parse(document.getElementById('banco-repaso').textContent);
    var caps = JSON.parse(caja.getAttribute('data-caps'));      // [{slug, href, titulo, parte, labs:[ids]}]
    var porCap = {}; banco.forEach(function (q) { (porCap[q.slug] = porCap[q.slug] || []).push(q); });
    var partes = []; caps.forEach(function (c) { if (partes.indexOf(c.parte) < 0) partes.push(c.parte); });
    function menu() {
      var ult = st.get('diag-ultimo', null);
      caja.innerHTML = '<div class="pmenu"><button class="pcard" data-m="diag"><span class="pe">🧭</span><b>¿Por dónde empiezo?</b><small>Una pregunta de cada tema. Al final te digo qué dominas y qué capítulos repasar.</small></button>' +
        partes.map(function (p, i) { return '<button class="pcard" data-m="sim" data-p="' + i + '"><span class="pe">⏱️</span><b>Simulacro rápido</b><small>' + p + ' · 12 preguntas, con informe por tema</small></button>'; }).join('') + '</div>' +
        (ult ? '<p class="ayuda" style="text-align:center">Tu último intento (' + new Date(ult.fecha).toLocaleDateString('es-CO') + '): ' + ult.bien + ' de ' + ult.n + ' en «' + ult.nombre + '».</p>' : '');
      caja.querySelectorAll('.pcard').forEach(function (b) {
        b.addEventListener('click', function () {
          var m = b.getAttribute('data-m');
          if (m === 'diag') {
            var sel = caps.filter(function (c) { return porCap[c.slug]; });
            var paso = Math.max(1, sel.length / 10), qs = [];
            for (var i = 0; i < sel.length && qs.length < 10; i += paso) { var L = porCap[sel[Math.floor(i)].slug]; qs.push(azar(L)); }
            corre(qs, '¿Por dónde empiezo?');
          } else {
            var p = partes[+b.getAttribute('data-p')], qs2 = [];
            caps.filter(function (c) { return c.parte === p && porCap[c.slug]; }).forEach(function (c) { qs2 = qs2.concat(porCap[c.slug]); });
            corre(mezcla(qs2).slice(0, 12), 'Simulacro · ' + p);
          }
        });
      });
    }
    function corre(qs, nombre) {
      var k = 0, resp = [];
      function pinta() {
        var q = qs[k];
        caja.innerHTML = '<div class="rep-barra"><i style="width:' + (100 * k / qs.length) + '%"></i></div><div class="quiz"><div class="qhead"><span>' + nombre + '</span><span class="marcador">' + (k + 1) + ' / ' + qs.length + '</span></div>' +
          '<div class="rep-origen">Tema: ' + q.origen + '</div><div class="q">' + q.html + '</div><div class="botones"><button class="saltar-q">No sé, siguiente</button></div></div>';
        var qd = caja.querySelector('.q'), fb = qd.querySelector('.fb'); if (fb) fb.classList.remove('si'); barajaOps(qd);
        function sigue(ok, elegida) { resp[k] = { ok: ok, q: q, elegida: elegida }; k++; if (k < qs.length) pinta(); else informe(); }
        qd.querySelectorAll('.op').forEach(function (op, i) { op.classList.remove('bien', 'mal'); op.disabled = false; op.addEventListener('click', function () { sigue(op.getAttribute('data-c') === '1', +op.dataset.o); }); });
        var inp = qd.querySelector('.num input');
        if (inp) {
          inp.value = ''; var ev = function () {
            var txt = inp.value.trim().replace(',', '.'), v = NaN;
            try { if (/^[-+*/().\d\s^sqrtpi]+$/.test(txt)) v = Function('"use strict";var sqrt=Math.sqrt,pi=Math.PI;return (' + txt.replace(/\^/g, '**') + ')')(); } catch (er) {}
            if (!isFinite(v)) return;
            var r = parseFloat(inp.getAttribute('data-r')), tol = parseFloat(inp.getAttribute('data-tol') || '0.01');
            sigue(Math.abs(v - r) <= tol * Math.max(1, Math.abs(r)), inp.value);
          };
          var bt = qd.querySelector('.comprobar'); if (bt) { bt.textContent = 'Responder'; bt.addEventListener('click', ev); }
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ev(); });
        }
        caja.querySelector('.saltar-q').addEventListener('click', function () { sigue(false, null); });
      }
      function informe() {
        var bien = resp.filter(function (r) { return r.ok; }).length, temas = {};
        resp.forEach(function (r) { var t = temas[r.q.slug] = temas[r.q.slug] || { ok: 0, n: 0, titulo: r.q.origen }; t.n++; if (r.ok) t.ok++; });
        st.set('diag-ultimo', { fecha: Date.now(), bien: bien, n: resp.length, nombre: nombre });
        var flojos = Object.keys(temas).filter(function (s) { return temas[s].ok < temas[s].n; });
        var fuertes = Object.keys(temas).filter(function (s) { return temas[s].ok === temas[s].n; });
        var cap = function (s) { return caps.filter(function (c) { return c.slug === s; })[0] || { href: s + '.html', titulo: s }; };
        var pct = bien / resp.length, cara = pct >= .9 ? '🏆' : pct >= .7 ? '🔥' : pct >= .4 ? '💪' : '🐢';
        caja.innerHTML = '<div class="rep-fin"><div class="grande">' + cara + '</div><h2>' + bien + ' de ' + resp.length + '</h2><p>' +
          (pct >= .9 ? '¡Eso, crack! Estás listo.' : pct >= .7 ? '¡Uy, qué nivel! Ya casi.' : pct >= .4 ? 'Vas bien, parcero: hay temas para repasar.' : 'Nuuu, hay que ponerle juicio… pero para eso es esto. Aquí tienes tu ruta.') + '</p></div>' +
          (flojos.length ? '<h3>🧭 Tu ruta de repaso</h3><ol class="ruta">' + flojos.map(function (s) { var c = cap(s); return '<li><a href="' + c.href + '"><b>' + c.titulo + '</b></a><br><small>Lee el gancho y las cajas de definición, resuelve el ' + (c.labs ? 'laboratorio y el ' : '') + '«Ordena» y vuelve a intentar el quiz del capítulo (' + temas[s].ok + '/' + temas[s].n + ' aquí).</small></li>'; }).join('') + '</ol>' : '') +
          (fuertes.length ? '<h3>✅ Lo que ya dominas</h3><p class="fuertes">' + fuertes.map(function (s) { return '<a href="' + cap(s).href + '">' + cap(s).titulo + '</a>'; }).join(' · ') + '</p>' : '') +
          '<h3>Revisa tus respuestas</h3><div class="revision"></div><div class="botones" style="justify-content:center"><button class="prim otra">Volver al menú</button></div>';
        var rv = caja.querySelector('.revision');
        resp.forEach(function (r, i) {
          var d = document.createElement('details'); d.className = 'rv ' + (r.ok ? 'ok' : 'no');
          d.innerHTML = '<summary>' + (r.ok ? '✅' : '❌') + ' Pregunta ' + (i + 1) + ' · ' + r.q.origen + '</summary><div class="q">' + r.q.html + '</div>';
          rv.appendChild(d);
          var q = d.querySelector('.q'); q.querySelectorAll('.op').forEach(function (o, j) { o.disabled = true; if (o.getAttribute('data-c') === '1') o.classList.add('bien'); else if (j === r.elegida) o.classList.add('mal'); });
          var inp = q.querySelector('.num input'); if (inp) { inp.disabled = true; inp.value = r.elegida || ''; var t = document.createElement('div'); t.className = 'ayuda'; t.textContent = 'Respuesta esperada: ' + inp.getAttribute('data-r').replace('.', ','); inp.parentNode.appendChild(t); }
          var fb = q.querySelector('.fb'); if (fb) { fb.classList.add('si'); var v = fb.querySelector('.veredicto'); if (v) v.innerHTML = r.ok ? '<b class="ok">Bien.</b> ' : '<b class="no">Así era:</b> '; }
        });
        caja.querySelector('.otra').addEventListener('click', menu);
        sticker(caja.querySelector('.rep-fin'), pct >= .6);
        window.scrollTo({ top: caja.offsetTop - 80, behavior: 'smooth' });
      }
      pinta();
    }
    menu();
  }

  /* =====================================================================
     PREGUNTAS QUE NO SE GANAN POR DESCARTE
     · las opciones salen en otro orden cada vez;
     · si fallas una pregunta con datos, vuelve con OTROS números;
     · si fallas una conceptual, se bloquea, cambia el orden y toca releerla.
     ===================================================================== */
  function barajaOps(q) {
    var cont = q.querySelector('.ops'); if (!cont) return;
    var ops = [].slice.call(cont.querySelectorAll('.op'));
    ops.forEach(function (o, i) { if (o.dataset.o === undefined) o.dataset.o = i; });
    if (ops.length < 3) return;
    mezcla(ops).forEach(function (o) { cont.appendChild(o); });
    [].slice.call(cont.querySelectorAll('.op')).forEach(function (o, i) { var l = o.querySelector('.l'); if (l) l.textContent = 'abcdef'[i] + ')'; });
  }
  function envuelveFb(q) {
    var fb = q.querySelector('.fb'); if (!fb || fb.querySelector('.fbx')) return;
    var x = document.createElement('span'); x.className = 'fbx';
    [].slice.call(fb.childNodes).forEach(function (n) { if (!(n.classList && n.classList.contains('veredicto'))) x.appendChild(n); });
    fb.appendChild(x);
  }
  function quitaAviso(q) { var a = q.querySelector('.qaviso'); if (a) a.remove(); q.classList.remove('q-bloq'); }
  function aviso(q, html) {
    quitaAviso(q); var a = document.createElement('div'); a.className = 'qaviso'; a.innerHTML = html;
    var fb = q.querySelector('.fb'); q.insertBefore(a, fb ? fb.nextSibling : null); return a;
  }
  function ponVariante(q) {
    var sc = q.querySelector('script.qvar'); if (!sc) return false;
    var V; try { V = JSON.parse(sc.textContent); } catch (e) { return false; }
    var k = ((parseInt(q.dataset.qv, 10) + 1) || 0) % V.length; q.dataset.qv = k; var v = V[k];
    var en = q.querySelector('.enun'); en.innerHTML = v.e; en.classList.remove('qnueva'); void en.offsetWidth; en.classList.add('qnueva');
    var fb = q.querySelector('.fb'); if (fb) { fb.classList.remove('si'); var x = fb.querySelector('.fbx'); if (x) x.innerHTML = v.x || ''; var st = fb.querySelector('.sticker'); if (st) st.remove(); }
    if (v.o) {
      var ops = [].slice.call(q.querySelectorAll('.op')), orden = mezcla(v.o.map(function (_, i) { return i; }));
      ops.forEach(function (op, i) {
        var sp = op.querySelector('span:not(.l)') || op; sp.innerHTML = v.o[orden[i]];
        op.setAttribute('data-c', orden[i] === 0 ? '1' : '0'); op.dataset.o = orden[i]; op.classList.remove('bien', 'mal'); op.disabled = false;
      });
    } else if (v.r !== undefined) {
      var inp = q.querySelector('.num input'); inp.setAttribute('data-r', v.r); inp.setAttribute('data-tol', v.tol || 0.005);
      inp.value = ''; inp.disabled = false; inp.classList.remove('bien', 'mal'); var bt = q.querySelector('.comprobar'); if (bt) bt.disabled = false;
    }
    q.dataset.cambios = (parseInt(q.dataset.cambios, 10) || 0) + 1;
    return true;
  }
  function falloEn(q) {
    var conDatos = !!q.querySelector('script.qvar'), ops = q.querySelectorAll('.op'), inp = q.querySelector('.num input');
    var fb = q.querySelector('.fb');
    if (!conDatos && inp) {                              /* respuesta escrita sin variantes: se esconde la solución y se reintenta */
      var sol = fb && fb.querySelector('.fbx') ? fb.querySelector('.fbx').innerHTML.trim() : '';
      if (fb) fb.classList.add('sin-x');
      aviso(q, '<b>🔁 Revisa tu cuenta e inténtalo otra vez.</b>' + (sol ? '<details><summary>Me rindo: ver la solución</summary><div class="qantes">' + sol + '</div></details>' : ''));
      inp.select(); return;
    }
    if (ops.length && ops.length < 3) {                 /* verdadero/falso: un solo intento, y se ve la explicación */
      ops.forEach(function (o) { o.disabled = true; if (o.getAttribute('data-c') === '1') o.classList.add('bien'); }); return;
    }
    q.classList.add('q-bloq'); ops.forEach(function (o) { o.disabled = true; }); if (inp) { inp.disabled = true; var bt = q.querySelector('.comprobar'); if (bt) bt.disabled = true; }
    if (conDatos) {
      var antes = fb && fb.querySelector('.fbx') ? fb.querySelector('.fbx').innerHTML : '';
      var a = aviso(q, '<b>📝 Esta ya no cuenta: te traigo el mismo problema con otros números.</b> Vuelve a leerlo con calma y resuélvelo otra vez; nada de adivinar entre las que quedan.' +
        (antes ? '<details><summary>Ver cómo se resolvía la anterior</summary><div class="qantes">' + antes + '</div></details>' : '') +
        '<button type="button" class="qnuevo">🔄 Dame los datos nuevos</button>');
      if (fb) fb.classList.add('sin-x');
      a.querySelector('.qnuevo').addEventListener('click', function () { quitaAviso(q); if (fb) fb.classList.remove('sin-x'); ponVariante(q); var en = q.querySelector('.enun'); en.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    } else {
      if (fb) fb.classList.add('sin-x');
      var b = aviso(q, '<b>🔁 Vuelve a leer la pregunta despacio.</b> Te cambio el orden de las opciones para que la pienses de nuevo, no por descarte.<button type="button" class="qnuevo">Intentar otra vez</button>');
      b.querySelector('.qnuevo').addEventListener('click', function () { quitaAviso(q); barajaOps(q); q.querySelectorAll('.op').forEach(function (o) { o.disabled = false; o.classList.remove('bien', 'mal'); }); if (fb) fb.classList.remove('si'); var st = fb && fb.querySelector('.sticker'); if (st) st.remove(); });
    }
  }
  function preguntasVivas() {
    document.querySelectorAll('.quiz[data-id] .q').forEach(function (q) { envuelveFb(q); barajaOps(q); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.quiz[data-id] .op, .quiz[data-id] .comprobar'); if (!t) return;
      var q = t.closest('.q');
      setTimeout(function () {
        if (t.classList.contains('op')) { if (t.getAttribute('data-c') !== '1') falloEn(q); else { quitaAviso(q); var fb = q.querySelector('.fb'); if (fb) fb.classList.remove('sin-x'); } }
        else { var inp = q.querySelector('.num input'); if (inp && inp.classList.contains('mal')) falloEn(q); else if (inp && inp.classList.contains('bien')) { quitaAviso(q); var fb2 = q.querySelector('.fb'); if (fb2) fb2.classList.remove('sin-x'); } }
      }, 0);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target.closest || !e.target.closest('.quiz[data-id] .num input')) return;
      var q = e.target.closest('.q'); setTimeout(function () { if (e.target.classList.contains('mal')) falloEn(q); else if (e.target.classList.contains('bien')) { quitaAviso(q); var f3 = q.querySelector('.fb'); if (f3) f3.classList.remove('sin-x'); } }, 0);
    });
    document.addEventListener('click', function (e) {                 /* «Reiniciar» del quiz: vuelve todo a la normalidad */
      var r = e.target.closest && e.target.closest('.quiz[data-id] .reiniciar'); if (!r) return;
      r.closest('.quiz').querySelectorAll('.q').forEach(function (q) { quitaAviso(q); var fb = q.querySelector('.fb'); if (fb) fb.classList.remove('sin-x'); barajaOps(q); });
    });
  }

  function arranca() {
    document.querySelectorAll('.act.ordena').forEach(iniciaOrdena);
    document.querySelectorAll('.act.error').forEach(iniciaError);
    document.querySelectorAll('.act.lab.pasos').forEach(iniciaLab);
    document.querySelectorAll('.act.lab.gauss').forEach(iniciaGauss);
    document.querySelectorAll('.act.lab.explora').forEach(iniciaExplora);
    document.querySelectorAll('details.prueba').forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) iniciaRevela(d); });
    });
    preguntasVivas();
    progresoCapitulo(); coleccion(); herramientas(); accesibilidad(); comentarios(); sinInternet();
    var pr = document.getElementById('practica-libro'); if (pr) iniciaPractica(pr);
    document.addEventListener('act-progreso', progresoCapitulo);
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.quiz .op, .quiz .comprobar, .quiz .reiniciar')) setTimeout(progresoCapitulo, 60); });
    var r = document.getElementById('repaso'); if (r) iniciaRepaso(r);
    botonRepaso();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();

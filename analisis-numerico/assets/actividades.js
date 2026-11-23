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
  var css = document.createElement('style');
  css.textContent = [
    '.sticker{position:absolute;right:.8rem;top:50%;margin-top:-1.75rem;z-index:5;font-size:2.6rem;line-height:1;background:#fff;border-radius:50%;padding:.35rem;box-shadow:0 0 0 4px #fff,0 4px 14px rgba(0,0,0,.25);pointer-events:none;animation:stk-in .55s cubic-bezier(.2,1.6,.4,1) both}',
    '.sticker.no{animation:stk-in .55s cubic-bezier(.2,1.6,.4,1) both,stk-shake .45s .55s ease-in-out 1}',
    '.sticker.fuera{animation:stk-out .5s ease-in both}',
    '@keyframes stk-in{0%{transform:scale(0) rotate(-40deg);opacity:0}100%{transform:scale(1) rotate(var(--rot,-10deg));opacity:1}}',
    '@keyframes stk-shake{0%,100%{transform:rotate(var(--rot,-10deg))}25%{transform:rotate(calc(var(--rot,-10deg) - 14deg))}75%{transform:rotate(calc(var(--rot,-10deg) + 14deg))}}',
    '@keyframes stk-out{to{transform:scale(.2) rotate(30deg);opacity:0}}',
    '.act{margin:2.2em 0;border:1px solid var(--linea,#dde);border-radius:14px;background:#fff;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.04)}',
    '.act .ahead{display:flex;align-items:center;gap:10px;padding:10px 16px;font-family:var(--sans,system-ui);font-weight:700;font-size:14px;letter-spacing:.3px}',
    '.act.ordena .ahead{background:var(--tealC,#e4f2f3);color:var(--teal,#006e78)}',
    '.act.error .ahead{background:var(--moradoC,#f1edf8);color:var(--morado,#664896)}',
    '.act .ahead .tag{margin-left:auto;font-weight:600;font-size:12px;opacity:.8}',
    '.act .abody{padding:14px 16px 16px}',
    '.act .enun{margin:0 0 12px}',
    '.act .zona{border:2px dashed var(--linea,#ccd);border-radius:10px;padding:8px;min-height:52px;margin:6px 0 4px;background:var(--grisC,#f7f7f5)}',
    '.act .zona.prueba{background:#fff;border-color:var(--teal,#0a7)}',
    '.act .ztit{font-family:var(--sans,system-ui);font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--gris,#666);margin-top:10px}',
    '.act .zona:empty::before{content:attr(data-vacio);display:block;color:#999;font-style:italic;font-size:14px;padding:8px}',
    '.act .bloque{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--linea,#ccd);border-left:5px solid var(--teal,#0a7);border-radius:8px;padding:8px 10px;margin:6px 0;cursor:pointer;touch-action:pan-y;user-select:none;transition:transform .15s,box-shadow .15s,background .2s}',
    '.act .zona:not(.prueba) .bloque{border-left-color:#bbb}',
    '.act .bloque .asa{touch-action:none;cursor:grab;color:#aaa;font-size:18px;line-height:1.2;padding:0 2px;margin-left:-4px}',
    '.act .bloque:hover{box-shadow:0 2px 8px rgba(0,0,0,.12)}',
    '.act .bloque .num{font-family:var(--sans,system-ui);font-weight:700;color:var(--teal,#0a7);min-width:1.4em}',
    '.act .zona:not(.prueba) .bloque .num{display:none}',
    '.act .bloque .txt{flex:1}',
    '.act .bloque.arrastrando{opacity:.85;box-shadow:0 8px 22px rgba(0,0,0,.25);transform:scale(1.02);z-index:10;position:relative;cursor:grabbing}',
    '.act .bloque.bien{background:#eaf7ee;border-left-color:#1d8a4a}',
    '.act .bloque.mal{background:#fdecec;border-left-color:#c0392b}',
    '.act .botones,.rep-caja .botones{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.act .botones button,.rep-caja .botones button{font-family:var(--sans,system-ui);font-size:14px;border-radius:999px;padding:7px 16px;border:1px solid var(--linea,#ccd);background:#fff;cursor:pointer}',
    '.act .botones button.prim,.rep-caja .botones button.prim{background:var(--teal,#006e78);border-color:var(--teal,#006e78);color:#fff;font-weight:600}',
    '.act.error .botones button.prim{background:var(--morado,#664896);border-color:var(--morado,#664896)}',
    '.act .fb{display:none;margin-top:12px;padding:10px 14px;border-radius:10px;background:var(--grisC,#f5f5f3);position:relative;padding-right:4.6rem}',
    '.act .fb.si{display:block}',
    '.act .fb b.ok{color:#1d7a43}.act .fb b.no{color:#c0392b}',
    '.act .linea{display:flex;gap:10px;padding:7px 10px;margin:4px 0;border-radius:8px;border:1px solid transparent;cursor:pointer;transition:background .15s}',
    '.act .linea:hover{background:var(--moradoC,#f1edf8);border-color:var(--linea,#ddd)}',
    '.act .linea .num{font-family:var(--sans,system-ui);font-weight:700;color:var(--morado,#664896);min-width:1.4em}',
    '.act .linea.mal{background:#fdecec;border-color:#e3a6a0}',
    '.act .linea.bien{background:#fff3cd;border-color:#e0b84e;box-shadow:inset 4px 0 0 #c47800}',
    '.act .linea.bloq{cursor:default}',
    '.act .ayuda{font-family:var(--sans,system-ui);font-size:12.5px;color:var(--gris,#666);margin-top:6px}',
    '.repaso-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--sans,system-ui);font-weight:700;font-size:15px;padding:10px 20px;border-radius:999px;background:var(--ambar,#c47800);color:#fff !important;text-decoration:none;box-shadow:0 3px 10px rgba(0,0,0,.15);margin:10px 0}',
    '.repaso-btn:hover{filter:brightness(1.08)}',
    '.repaso-btn small{font-weight:500;opacity:.9}',
    '.rep-caja{max-width:820px;margin:30px auto;padding:0 20px 60px}',
    '.rep-caja .qhead .marcador{font-weight:700}',
    '.rep-barra{height:8px;border-radius:8px;background:var(--grisC,#eee);overflow:hidden;margin:10px 0 18px}',
    '.rep-barra i{display:block;height:100%;background:var(--ambar,#c47800);transition:width .4s}',
    '.rep-origen{font-family:var(--sans,system-ui);font-size:12px;color:var(--gris,#777);margin-bottom:6px}',
    '.rep-fin{text-align:center;padding:30px 10px}',
    '.rep-fin .grande{font-size:64px;line-height:1}',
    '.rep-cajas{display:flex;gap:6px;justify-content:center;margin:16px 0;font-family:var(--sans,system-ui);font-size:12px}',
    '.rep-cajas span{background:var(--grisC,#f2f2f2);border-radius:8px;padding:6px 10px}',
    '@media (prefers-reduced-motion:reduce){.sticker,.sticker.no{animation:none;transform:rotate(var(--rot,-10deg))}}'
  ].join('\n');
  document.head.appendChild(css);

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
        st.set('ordena:' + el.id, 1);
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
        st.set('error:' + el.id, 1);
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
    try { vistos = JSON.parse(localStorage.getItem('gb:vistos') || '{}'); } catch (e) {}
    caja.innerHTML = '<p class="rep-origen">Buscando preguntas en los capítulos…</p>';
    var incrustado = document.getElementById('banco-repaso');
    var fuente = incrustado ? Promise.resolve([JSON.parse(incrustado.textContent)]) : Promise.all(paginas.map(function (p) {
      return fetch(p.href).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }).then(function (t) {
        var doc = new DOMParser().parseFromString(t, 'text/html'), qs = [];
        doc.querySelectorAll('.quiz').forEach(function (qz) {
          var idq = qz.getAttribute('data-id') || 'q';
          qz.querySelectorAll('.q').forEach(function (q, i) {
            if (!q.querySelector('.op')) return;
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
      if (fb) fb.classList.remove('si');
      qd.querySelectorAll('.op').forEach(function (op) {
        op.disabled = false; op.classList.remove('bien', 'mal');
        op.addEventListener('click', function () {
          var ok = op.getAttribute('data-c') === '1';
          qd.querySelectorAll('.op').forEach(function (o) { o.disabled = true; if (o.getAttribute('data-c') === '1') o.classList.add('bien'); });
          op.classList.add(ok ? 'bien' : 'mal');
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

  function arranca() {
    document.querySelectorAll('.act.ordena').forEach(iniciaOrdena);
    document.querySelectorAll('.act.error').forEach(iniciaError);
    var r = document.getElementById('repaso'); if (r) iniciaRepaso(r);
    botonRepaso();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
